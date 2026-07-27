/**
 * Generic Payload Field Validation Middleware Generator
 * @param {Array<string>} requiredFields - Required keys in req.body
 */
const validateBody = (requiredFields = []) => {
  return (req, res, next) => {
    const missing = [];
    requiredFields.forEach(field => {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
        missing.push(field);
      }
    });

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: 'Bad Request - Missing Required Fields',
        missingFields: missing
      });
    }

    next();
  };
};

module.exports = { validateBody };
