const MembershipPlan = require('../models/MembershipPlan');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * @desc    Get all membership plans
 * @route   GET /api/v1/plans
 * @access  Public
 */
exports.getPlans = asyncHandler(async (req, res) => {
  const plans = await MembershipPlan.find().sort('monthlyPrice');

  res.status(200).json({
    success: true,
    status: 200,
    count: plans.length,
    data: plans
  });
});

/**
 * @desc    Get single plan by ID or Slug
 * @route   GET /api/v1/plans/:id
 * @access  Public
 */
exports.getPlanById = asyncHandler(async (req, res) => {
  const plan = await MembershipPlan.findById(req.params.id);
  if (!plan) {
    res.status(404);
    throw new Error(`Membership plan not found with ID: ${req.params.id}`);
  }

  res.status(200).json({
    success: true,
    status: 200,
    data: plan
  });
});

/**
 * @desc    Create new membership plan
 * @route   POST /api/v1/plans
 * @access  Public
 */
exports.createPlan = asyncHandler(async (req, res) => {
  const plan = await MembershipPlan.create(req.body);

  res.status(201).json({
    success: true,
    status: 201,
    message: 'Membership plan created successfully',
    data: plan
  });
});

/**
 * @desc    Update membership plan
 * @route   PUT /api/v1/plans/:id
 * @access  Public
 */
exports.updatePlan = asyncHandler(async (req, res) => {
  const plan = await MembershipPlan.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!plan) {
    res.status(404);
    throw new Error(`Membership plan not found with ID: ${req.params.id}`);
  }

  res.status(200).json({
    success: true,
    status: 200,
    message: 'Membership plan updated successfully',
    data: plan
  });
});
