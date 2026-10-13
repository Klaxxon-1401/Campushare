import express from 'express';
import { BookingController } from '../controllers/bookings';
import { requireAuth, requireVerified } from '../middleware/auth';

const router = express.Router();
const bookingController = new BookingController();

// Every booking endpoint requires a signed-in, verified campus user.
router.use(requireAuth, requireVerified);

// GET /bookings — the caller's bookings (borrower view, or `?lender=true`)
router.get('/', bookingController.listBookings);

// POST /bookings — borrowerId is taken from the token
router.post('/', bookingController.createBooking);

// GET /bookings/:id — participants or admin only
router.get('/:id', bookingController.getBooking);

// PATCH /bookings/:id/accept — item owner only
router.patch('/:id/accept', bookingController.acceptBooking);

// PATCH /bookings/:id/decline — item owner only
router.patch('/:id/decline', bookingController.declineBooking);

// POST /bookings/:id/pay — borrower only
router.post('/:id/pay', bookingController.payBooking);

// POST /bookings/:id/pickup — borrower or lender
router.post('/:id/pickup', bookingController.confirmPickup);

// POST /bookings/:id/return — borrower only
router.post('/:id/return', bookingController.confirmReturn);

// POST /bookings/:id/confirm-return — item owner only
router.post('/:id/confirm-return', bookingController.confirmReturnFinal);

// PATCH /bookings/:id/cancel — borrower or lender
router.patch('/:id/cancel', bookingController.cancelBooking);

export default router;
