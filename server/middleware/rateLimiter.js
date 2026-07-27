const rateLimit = require('express-rate-limit');

/**
 * Global Rate Limiter Middleware
 */
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,
  message: {
    success: false,
    status: 429,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});

module.exports = { apiLimiter };
