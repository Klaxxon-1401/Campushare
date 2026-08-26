import { Request, Response } from 'express';
import { z } from 'zod';

// Validation schemas
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Dates must be YYYY-MM-DD')
  .refine((s) => !Number.isNaN(Date.parse(s)), 'Invalid calendar date');

const createBookingSchema = z
  .object({
    itemId: z.string().min(1).max(128),
    startDate: isoDate,
    endDate: isoDate,
  })
  .strict()
  .refine(
    (b) => Date.parse(b.endDate) > Date.parse(b.startDate),
    { message: 'endDate must be after startDate' }
  )
  .refine(
    (b) => Date.parse(b.startDate) >= Date.now() - 24 * 60 * 60 * 1000,
    { message: 'startDate cannot be in the past' }
  )
  .refine(
    (b) => (Date.parse(b.endDate) - Date.parse(b.startDate)) / (24 * 60 * 60 * 1000) <= 30,
    { message: 'Rental period cannot exceed 30 days' }
  );

export class BookingController {
  async createBooking(req: Request, res: Response) {
    try {
      const body = createBookingSchema.parse(req.body);
      
      // TODO: Implement Firestore create + availability check
      
      res.status(201).json({
        message: 'Booking request created',
        booking: {
          id: 'new-booking-id',
          ...body,
          status: 'requested',
          totalRental: 9,
          deposit: 10,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.issues });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async acceptBooking(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // TODO: Implement Firestore update
      
      res.json({
        message: 'Booking accepted',
        booking: {
          id,
          status: 'accepted',
        },
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async declineBooking(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // TODO: Implement Firestore update
      
      res.json({
        message: 'Booking declined',
        booking: {
          id,
          status: 'declined',
        },
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async payBooking(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { paymentMethodId } = req.body;
      
      // TODO: Implement Stripe PaymentIntent
      
      res.json({
        message: 'Payment successful',
        booking: {
          id,
          status: 'paid',
        },
        payment: {
          id: 'payment-id',
          amount: 19,
          status: 'succeeded',
        },
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async confirmPickup(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { photos } = req.body;
      
      // TODO: Implement photo upload + Firestore update
      
      res.json({
        message: 'Pickup confirmed',
        booking: {
          id,
          status: 'active',
          pickupConfirmedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async confirmReturn(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { photos } = req.body;
      
      // TODO: Implement photo upload + Firestore update
      
      res.json({
        message: 'Return photos uploaded',
        booking: {
          id,
          status: 'returned',
        },
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async confirmReturnFinal(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // TODO: Implement fund release + deposit refund
      
      res.json({
        message: 'Return confirmed. Funds released.',
        booking: {
          id,
          status: 'returned',
          returnConfirmedAt: new Date().toISOString(),
        },
        payments: [
          { type: 'lender_payout', amount: 9, status: 'succeeded' },
          { type: 'deposit_refund', amount: 10, status: 'succeeded' },
        ],
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async cancelBooking(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      
      // TODO: Implement cancellation policy logic
      
      res.json({
        message: 'Booking cancelled',
        booking: {
          id,
          status: 'cancelled',
        },
        refund: {
          amount: 10,
          reason: 'Cancelled by borrower',
        },
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
