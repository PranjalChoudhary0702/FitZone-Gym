const crypto = require('crypto');

// Helper to verify token signature
const verifyToken = (token, secret) => {
  try {
    const jwt = require('jsonwebtoken');
    return jwt.verify(token, secret);
  } catch (e) {
    // Built-in HMAC verification fallback
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expectedSig = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
    if (signature !== expectedSig) return null;

    try {
      const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
      if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) return null;
      return payload;
    } catch (err) {
      return null;
    }
  }
};

/**
 * JWT Admin Authorization Middleware
 * Protects write, update, and delete endpoints
 */
const protectAdmin = (req, res, next) => {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.headers['x-admin-token']) {
    token = req.headers['x-admin-token'];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      status: 401,
      message: 'Unauthorized - Missing Admin Authentication Token'
    });
  }

  const secret = process.env.JWT_SECRET || 'fitzone_secret_key_2026_super_secure_token';
  const decoded = verifyToken(token, secret);

  if (!decoded) {
    return res.status(401).json({
      success: false,
      status: 401,
      message: 'Unauthorized - Invalid or Expired Admin Token'
    });
  }

  req.admin = decoded;
  next();
};

module.exports = { protectAdmin };
