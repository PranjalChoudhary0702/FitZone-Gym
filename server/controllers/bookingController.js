const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const ClassSchedule = require('../models/ClassSchedule');
const asyncHandler = require('../middleware/asyncHandler');
const { sendBookingConfirmation } = require('../utils/emailService');

/**
 * @desc    Get all bookings with status filter and pagination
 * @route   GET /api/v1/bookings
 * @access  Public
 */
exports.getBookings = asyncHandler(async (req, res) => {
  const { status, type, email } = req.query;
  const filter = {};

  if (status) filter.status = status;
  if (type) filter.type = type;
  if (email) filter.guestEmail = email.toLowerCase();

  const bookings = await Booking.find(filter)
    .populate('classSchedule')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    status: 200,
    count: bookings.length,
    data: bookings
  });
});

/**
 * @desc    Get single booking by ID or Confirmation Code
 * @route   GET /api/v1/bookings/:id
 * @access  Public
 */
exports.getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('classSchedule');
  if (!booking) {
    res.status(404);
    throw new Error(`Booking not found with ID: ${req.params.id}`);
  }

  res.status(200).json({
    success: true,
    status: 200,
    data: booking
  });
});

/**
 * @desc    Create new booking (Trial Pass, Class Reservation, PT Consultation)
 * @route   POST /api/v1/bookings
 * @access  Public
 */
exports.createBooking = asyncHandler(async (req, res) => {
  const { type, guestName, guestEmail, guestPhone, classScheduleId, className, startDate } = req.body;

  // Safely check if classScheduleId is a valid Mongoose ObjectId
  const validScheduleId = (classScheduleId && mongoose.Types.ObjectId.isValid(classScheduleId))
    ? classScheduleId
    : null;

  // If reserving a specific class seat, increment reserved seats counter
  if (validScheduleId) {
    const schedule = await ClassSchedule.findById(validScheduleId);
    if (schedule) {
      if (schedule.reservedSeats >= schedule.maxCapacity) {
        res.status(400);
        throw new Error(`Class '${schedule.className}' is already at full capacity (${schedule.maxCapacity}/${schedule.maxCapacity}).`);
      }
      schedule.reservedSeats += 1;
      await schedule.save();
    }
  }

  const booking = await Booking.create({
    type: type || 'Free Trial Pass',
    guestName,
    guestEmail,
    guestPhone,
    classSchedule: validScheduleId,
    className: className || '',
    startDate: startDate || Date.now(),
    status: 'confirmed'
  });

  // Automatically dispatch confirmation HTML email
  sendBookingConfirmation(booking);

  res.status(201).json({
    success: true,
    status: 201,
    message: 'Booking successfully confirmed! Confirmation email dispatched.',
    data: booking
  });
});

/**
 * @desc    Update booking status (confirmed, attended, cancelled)
 * @route   PATCH /api/v1/bookings/:id/status
 * @access  Public
 */
exports.updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!['pending', 'confirmed', 'attended', 'cancelled'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status value provided');
  }

  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  if (!booking) {
    res.status(404);
    throw new Error(`Booking not found with ID: ${req.params.id}`);
  }

  // If confirmed by admin, dispatch confirmation email
  if (status === 'confirmed') {
    sendBookingConfirmation(booking);
  }

  res.status(200).json({
    success: true,
    status: 200,
    message: `Booking status updated to '${status}' and email dispatched to ${booking.guestEmail}`,
    data: booking
  });
});

/**
 * @desc    Delete booking
 * @route   DELETE /api/v1/bookings/:id
 * @access  Public
 */
exports.deleteBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findByIdAndDelete(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error(`Booking not found with ID: ${req.params.id}`);
  }

  res.status(200).json({
    success: true,
    status: 200,
    message: 'Booking deleted successfully'
  });
});
