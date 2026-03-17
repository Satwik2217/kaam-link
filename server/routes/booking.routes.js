import express from 'express';
import {
  createBooking,
  getMyBookings,
  updateBookingStatus,
  triggerSOS,
} from '../controllers/booking.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { restrictTo } from '../middleware/role.middleware.js';

const router = express.Router();

router.post('/', protect, restrictTo('employer'), createBooking);
router.get('/my-bookings', protect, getMyBookings);
router.patch('/:id/status', protect, updateBookingStatus);
router.post('/:id/sos', protect, triggerSOS);

export default router;

