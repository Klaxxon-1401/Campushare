import { Request, Response } from 'express';
import { z } from 'zod';
import { store } from '../data/store';
import { ISO_DATE, paramId } from '../validation';
import { Booking, BookingStatus } from '../types';
import { AuthedRequest, isAdmin } from '../middleware/auth';

const isoDate = z
  .string()
  .regex(ISO_DATE, 'Dates must be YYYY-MM-DD')
  .refine((s) => !Number.isNaN(Date.parse(s)), 'Invalid calendar date');

const createBookingSchema = z
  .object({
    itemId: z.string().min(1).max(128),
    startDate: isoDate,
    endDate: isoDate,
  })
  .strict()
  .refine((b) => Date.parse(b.endDate) >= Date.parse(b.startDate), {
    message: 'endDate must be on or after startDate',
  })
  .refine((b) => Date.parse(b.startDate) >= Date.now() - 24 * 60 * 60 * 1000, {
    message: 'startDate cannot be in the past',
  })
  .refine((b) => (Date.parse(b.endDate) - Date.parse(b.startDate)) / (24 * 60 * 60 * 1000) <= 30, {
    message: 'Rental period cannot exceed 30 days',
  });

const ACCESSIBLE_FROM: Record<BookingStatus, BookingStatus[]> = {
  requested: ['accepted', 'declined', 'cancelled'],
  accepted: ['paid', 'cancelled'],
  declined: [],
  paid: ['active'],
  active: ['returned'],
  returned: ['disputed'],
  disputed: [],
  cancelled: [],
};

const borrower = (b: Booking, userId: string) => b.borrowerId === userId;
const lender = (b: Booking, userId: string) => b.lenderId === userId;
const participant = (b: Booking, userId: string) => borrower(b, userId) || lender(b, userId);

const forbidden = (res: Response, message: string) =>
  res.status(403).json({ error: { code: 'FORBIDDEN', message } });

/** Applies a status change with a role + state-machine guard. */
function applyTransition(
  id: string,
  status: BookingStatus,
  res: Response,
  guard: (booking: Booking) => boolean,
  forbiddenMessage: string
) {
  const booking = store.getBooking(id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  if (!guard(booking)) {
    return forbidden(res, forbiddenMessage);
  }
  if (!ACCESSIBLE_FROM[booking.status].includes(status)) {
    return res.status(409).json({
      error: `Cannot move booking from "${booking.status}" to "${status}".`,
    });
  }
  const updated = store.setBookingStatus(id, status);
  res.json({ message: `Booking ${status}`, booking: updated });
}

export class BookingController {
  async createBooking(req: Request, res: Response) {
    try {
      const body = createBookingSchema.parse(req.body);
      // borrowerId comes from the verified JWT, never the body.
      const user = (req as AuthedRequest).user!;
      const result = store.createBooking(body, user.id);
      if ('error' in result) {
        return res.status(409).json({ error: result.error });
      }
      res.status(201).json({ message: 'Booking request created', booking: result });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.issues });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async acceptBooking(req: Request, res: Response) {
    const user = (req as AuthedRequest).user!;
    applyTransition(
      paramId(req.params.id),
      'accepted',
      res,
      (b) => lender(b, user.id) || isAdmin(user),
      'Only the item owner can accept this booking.'
    );
  }

  async declineBooking(req: Request, res: Response) {
    const user = (req as AuthedRequest).user!;
    applyTransition(
      paramId(req.params.id),
      'declined',
      res,
      (b) => lender(b, user.id) || isAdmin(user),
      'Only the item owner can decline this booking.'
    );
  }

  async payBooking(req: Request, res: Response) {
    // TODO: Stripe PaymentIntent capture (PROJECT_PLAN §14). For now the
    // transition is the same; the mock payment record is returned for tests.
    const id = paramId(req.params.id);
    const booking = store.getBooking(id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    const user = (req as AuthedRequest).user!;
    if (!borrower(booking, user.id) && !isAdmin(user)) {
      return forbidden(res, 'Only the borrower can pay for this booking.');
    }
    if (booking.status !== 'accepted') {
      return res.status(409).json({ error: 'Booking can only be paid after being accepted.' });
    }
    const updated = store.setBookingStatus(id, 'paid');
    res.json({
      message: 'Payment successful (mock)',
      booking: updated,
      payment: { id: 'pay_mock', amount: updated?.total, status: 'succeeded' },
    });
  }

  async confirmPickup(req: Request, res: Response) {
    const id = paramId(req.params.id);
    const booking = store.getBooking(id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    const user = (req as AuthedRequest).user!;
    if (!participant(booking, user.id) && !isAdmin(user)) {
      return forbidden(res, 'Only the borrower or lender can confirm pickup.');
    }
    if (booking.status !== 'paid') {
      return res.status(409).json({ error: 'Booking must be paid before pickup.' });
    }
    const updated = store.setBookingStatus(id, 'active');
    res.json({
      message: 'Pickup confirmed',
      booking: { ...updated, pickupConfirmedAt: new Date().toISOString() },
    });
  }

  async confirmReturn(req: Request, res: Response) {
    const id = paramId(req.params.id);
    const booking = store.getBooking(id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    const user = (req as AuthedRequest).user!;
    if (!borrower(booking, user.id) && !isAdmin(user)) {
      return forbidden(res, 'Only the borrower can upload return photos.');
    }
    if (booking.status !== 'active') {
      return res.status(409).json({ error: 'Booking must be active before returning.' });
    }
    const updated = store.setBookingStatus(id, 'returned');
    res.json({ message: 'Return photos uploaded', booking: updated });
  }

  async confirmReturnFinal(req: Request, res: Response) {
    const id = paramId(req.params.id);
    const booking = store.getBooking(id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    const user = (req as AuthedRequest).user!;
    if (!lender(booking, user.id) && !isAdmin(user)) {
      return forbidden(res, 'Only the item owner can confirm the return.');
    }
    if (booking.status !== 'returned') {
      return res.status(409).json({ error: 'Booking must be marked returned first.' });
    }
    const updated = store.setBookingStatus(id, 'returned'); // idempotent
    res.json({
      message: 'Return confirmed. Funds released. (mock — see payment module)',
      booking: { ...updated, returnConfirmedAt: new Date().toISOString() },
    });
  }

  async cancelBooking(req: Request, res: Response) {
    const id = paramId(req.params.id);
    const booking = store.getBooking(id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    const user = (req as AuthedRequest).user!;
    if (!participant(booking, user.id) && !isAdmin(user)) {
      return forbidden(res, 'Only the borrower or lender can cancel this booking.');
    }
    if (['declined', 'cancelled', 'returned', 'disputed'].includes(booking.status)) {
      return res.status(409).json({ error: 'Booking can no longer be cancelled.' });
    }
    const updated = store.setBookingStatus(id, 'cancelled');
    res.json({
      message: 'Booking cancelled',
      booking: updated,
      refund: { amount: booking.deposit, reason: 'Cancellation policy v1' },
    });
  }

  async getBooking(req: Request, res: Response) {
    const booking = store.getBooking(paramId(req.params.id));
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    const user = (req as AuthedRequest).user!;
    if (!participant(booking, user.id) && !isAdmin(user)) {
      return forbidden(res, 'You do not have access to this booking.');
    }
    res.json({ booking });
  }

  async listBookings(req: Request, res: Response) {
    // The user id always comes from the token — a client cannot list someone else's bookings.
    const user = (req as AuthedRequest).user!;
    const lenderView = req.query.lender === 'true';
    res.json({ bookings: store.listBookings({ userId: user.id, lender: lenderView }) });
  }
}
