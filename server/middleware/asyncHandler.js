/**
 * Wrapper for async route handlers to eliminate repetitive try-catch blocks
 * Automatically catches rejected promises and passes errors to next()
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
