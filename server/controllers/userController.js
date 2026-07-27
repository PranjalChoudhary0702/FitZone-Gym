const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * @desc    Get all users with pagination, search, and sorting
 * @route   GET /api/v1/users
 * @access  Public
 */
exports.getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  const search = req.query.search || '';
  const sort = req.query.sort || '-createdAt';

  const query = search
    ? {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }
    : {};

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    status: 200,
    count: users.length,
    total,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      limit
    },
    data: users
  });
});

/**
 * @desc    Get single user by ID
 * @route   GET /api/v1/users/:id
 * @access  Public
 */
exports.getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error(`User not found with ID: ${req.params.id}`);
  }

  res.status(200).json({
    success: true,
    status: 200,
    data: user
  });
});

/**
 * @desc    Create new user profile
 * @route   POST /api/v1/users
 * @access  Public
 */
exports.createUser = asyncHandler(async (req, res) => {
  const { name, email, phone, membershipTier, primaryGoal } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error(`User with email '${email}' already exists.`);
  }

  const user = await User.create({
    name,
    email,
    phone,
    membershipTier,
    primaryGoal
  });

  res.status(201).json({
    success: true,
    status: 201,
    message: 'User created successfully',
    data: user
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/v1/users/:id
 * @access  Public
 */
exports.updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!user) {
    res.status(404);
    throw new Error(`User not found with ID: ${req.params.id}`);
  }

  res.status(200).json({
    success: true,
    status: 200,
    message: 'User updated successfully',
    data: user
  });
});

/**
 * @desc    Delete user
 * @route   DELETE /api/v1/users/:id
 * @access  Public
 */
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error(`User not found with ID: ${req.params.id}`);
  }

  res.status(200).json({
    success: true,
    status: 200,
    message: 'User deleted successfully'
  });
});
