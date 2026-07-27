const Trainer = require('../models/Trainer');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * @desc    Get all trainers with category filtering & search
 * @route   GET /api/v1/trainers
 * @access  Public
 */
exports.getTrainers = asyncHandler(async (req, res) => {
  const { category, search } = req.query;
  const filter = {};

  if (category) {
    filter.specialtyCategory = category;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { role: { $regex: search, $options: 'i' } }
    ];
  }

  const trainers = await Trainer.find(filter).sort('name');

  res.status(200).json({
    success: true,
    status: 200,
    count: trainers.length,
    data: trainers
  });
});

/**
 * @desc    Get single trainer
 * @route   GET /api/v1/trainers/:id
 * @access  Public
 */
exports.getTrainerById = asyncHandler(async (req, res) => {
  const trainer = await Trainer.findById(req.params.id);
  if (!trainer) {
    res.status(404);
    throw new Error(`Trainer not found with ID: ${req.params.id}`);
  }

  res.status(200).json({
    success: true,
    status: 200,
    data: trainer
  });
});

/**
 * @desc    Create new trainer
 * @route   POST /api/v1/trainers
 * @access  Public
 */
exports.createTrainer = asyncHandler(async (req, res) => {
  const trainer = await Trainer.create(req.body);

  res.status(201).json({
    success: true,
    status: 201,
    message: 'Trainer created successfully',
    data: trainer
  });
});

/**
 * @desc    Update trainer details
 * @route   PUT /api/v1/trainers/:id
 * @access  Public
 */
exports.updateTrainer = asyncHandler(async (req, res) => {
  const trainer = await Trainer.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!trainer) {
    res.status(404);
    throw new Error(`Trainer not found with ID: ${req.params.id}`);
  }

  res.status(200).json({
    success: true,
    status: 200,
    message: 'Trainer updated successfully',
    data: trainer
  });
});

/**
 * @desc    Delete trainer
 * @route   DELETE /api/v1/trainers/:id
 * @access  Public
 */
exports.deleteTrainer = asyncHandler(async (req, res) => {
  const trainer = await Trainer.findByIdAndDelete(req.params.id);
  if (!trainer) {
    res.status(404);
    throw new Error(`Trainer not found with ID: ${req.params.id}`);
  }

  res.status(200).json({
    success: true,
    status: 200,
    message: 'Trainer deleted successfully'
  });
});
