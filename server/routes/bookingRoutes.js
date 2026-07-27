const express = require('express');
const router = express.Router();
const {
  getBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  deleteBooking
} = require('../controllers/bookingController');
const { validateBody } = require('../middleware/validate');

router.route('/')
  .get(getBookings)
  .post(validateBody(['type', 'guestName', 'guestEmail', 'guestPhone']), createBooking);

router.route('/:id')
  .get(getBookingById)
  .delete(deleteBooking);

router.patch('/:id/status', validateBody(['status']), updateBookingStatus);

module.exports = router;
