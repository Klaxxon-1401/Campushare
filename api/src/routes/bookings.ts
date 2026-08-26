import express from 'express';
import { BookingController } from '../controllers/bookings';

const router = express.Router();
const bookingController = new BookingController();

// POST /bookings
router.post('/', bookingController.createBooking);

// PATCH /bookings/:id/accept
router.patch('/:id/accept', bookingController.acceptBooking);

// PATCH /bookings/:id/decline
router.patch('/:id/decline', bookingController.declineBooking);

// POST /bookings/:id/pay
router.post('/:id/pay', bookingController.payBooking);

// POST /bookings/:id/pickup
router.post('/:id/pickup', bookingController.confirmPickup);

// POST /bookings/:id/return
router.post('/:id/return', bookingController.confirmReturn);

// POST /bookings/:id/confirm-return
router.post('/:id/confirm-return', bookingController.confirmReturnFinal);

// PATCH /bookings/:id/cancel
router.patch('/:id/cancel', bookingController.cancelBooking);

export default router;
