const ContactMessage = require('../models/ContactMessage');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * @desc    Get all contact inquiry messages
 * @route   GET /api/v1/contacts
 * @access  Public
 */
exports.getContactMessages = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};

  const messages = await ContactMessage.find(filter).sort('-createdAt');

  res.status(200).json({
    success: true,
    status: 200,
    count: messages.length,
    data: messages
  });
});

/**
 * @desc    Submit a new contact message inquiry
 * @route   POST /api/v1/contacts
 * @access  Public
 */
exports.createContactMessage = asyncHandler(async (req, res) => {
  const { name, email, phone, fitnessGoal, message } = req.body;

  const contact = await ContactMessage.create({
    name,
    email,
    phone,
    fitnessGoal,
    message
  });

  res.status(201).json({
    success: true,
    status: 201,
    message: 'Contact inquiry received! Our specialist will reach out shortly.',
    data: contact
  });
});

/**
 * @desc    Update contact inquiry status
 * @route   PATCH /api/v1/contacts/:id/status
 * @access  Public
 */
exports.updateContactStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const contact = await ContactMessage.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  if (!contact) {
    res.status(404);
    throw new Error(`Contact message not found with ID: ${req.params.id}`);
  }

  res.status(200).json({
    success: true,
    status: 200,
    message: `Inquiry status updated to '${status}'`,
    data: contact
  });
});
