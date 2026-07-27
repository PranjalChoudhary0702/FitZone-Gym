const ClassSchedule = require('../models/ClassSchedule');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * @desc    Get all class schedules with filtering by day, category, or trainer
 * @route   GET /api/v1/schedules
 * @access  Public
 */
exports.getSchedules = asyncHandler(async (req, res) => {
  const { day, category, trainer } = req.query;
  const filter = {};

  if (day) {
    filter.dayOfWeek = day.toLowerCase();
  }

  if (category) {
    filter.category = category;
  }

  if (trainer) {
    filter.trainer = trainer;
  }

  const schedules = await ClassSchedule.find(filter)
    .populate('trainer', 'name role imageUrl')
    .sort('startTime');

  res.status(200).json({
    success: true,
    status: 200,
    count: schedules.length,
    data: schedules
  });
});

/**
 * @desc    Get single class schedule
 * @route   GET /api/v1/schedules/:id
 * @access  Public
 */
exports.getScheduleById = asyncHandler(async (req, res) => {
  const schedule = await ClassSchedule.findById(req.params.id).populate('trainer');
  if (!schedule) {
    res.status(404);
    throw new Error(`Class schedule not found with ID: ${req.params.id}`);
  }

  res.status(200).json({
    success: true,
    status: 200,
    data: schedule
  });
});

/**
 * @desc    Create new class schedule
 * @route   POST /api/v1/schedules
 * @access  Public
 */
exports.createSchedule = asyncHandler(async (req, res) => {
  const schedule = await ClassSchedule.create(req.body);

  res.status(201).json({
    success: true,
    status: 201,
    message: 'Class schedule created successfully',
    data: schedule
  });
});

/**
 * @desc    Update class schedule
 * @route   PUT /api/v1/schedules/:id
 * @access  Public
 */
exports.updateSchedule = asyncHandler(async (req, res) => {
  const schedule = await ClassSchedule.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!schedule) {
    res.status(404);
    throw new Error(`Class schedule not found with ID: ${req.params.id}`);
  }

  res.status(200).json({
    success: true,
    status: 200,
    message: 'Class schedule updated successfully',
    data: schedule
  });
});

/**
 * @desc    Delete class schedule
 * @route   DELETE /api/v1/schedules/:id
 * @access  Public
 */
exports.deleteSchedule = asyncHandler(async (req, res) => {
  const schedule = await ClassSchedule.findByIdAndDelete(req.params.id);
  if (!schedule) {
    res.status(404);
    throw new Error(`Class schedule not found with ID: ${req.params.id}`);
  }

  res.status(200).json({
    success: true,
    status: 200,
    message: 'Class schedule deleted successfully'
  });
});
