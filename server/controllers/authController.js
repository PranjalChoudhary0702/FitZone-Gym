const asyncHandler = require('../middleware/asyncHandler');
const crypto = require('crypto');
const { sendTestEmail } = require('../utils/emailService');

// Helper to sign JWT payload with jsonwebtoken or crypto fallback
const signToken = (payload, secret, expiresIn) => {
  try {
    const jwt = require('jsonwebtoken');
    return jwt.sign(payload, secret, { expiresIn });
  } catch (e) {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const exp = Math.floor(Date.now() / 1000) + (24 * 60 * 60);
    const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');
    const signature = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
    return `${header}.${body}.${signature}`;
  }
};

/**
 * @desc    Verify Admin PIN & Issue JWT Token
 * @route   POST /api/v1/auth/verify-pin
 * @access  Public
 */
exports.verifyPin = asyncHandler(async (req, res) => {
  const { pin } = req.body;
  const configuredPin = process.env.ADMIN_PIN || '7788';
  const secret = process.env.JWT_SECRET || 'fitzone_secret_key_2026_super_secure_token';

  if (!pin || pin.toString().trim() !== configuredPin.toString().trim()) {
    res.status(401);
    throw new Error('Invalid Admin PIN. Access Denied.');
  }

  const token = signToken({ role: 'admin', authenticatedAt: new Date().toISOString() }, secret, '24h');

  res.status(200).json({
    success: true,
    status: 200,
    message: 'Admin PIN verified successfully.',
    token,
    expiresIn: '24h'
  });
});

/**
 * @desc    Send Brevo SMTP Test Email (Protected for Admin)
 * @route   POST /api/v1/auth/test-email
 * @access  Private (JWT Admin Token Required)
 */
exports.sendTestEmailController = asyncHandler(async (req, res) => {
  const { to } = req.body;

  if (!to) {
    res.status(400);
    throw new Error('Target email address ("to") is required.');
  }

  const result = await sendTestEmail(to);

  res.status(200).json({
    success: true,
    status: 200,
    message: `Test email successfully dispatched to ${to} via Brevo SMTP`,
    data: result
  });
});
