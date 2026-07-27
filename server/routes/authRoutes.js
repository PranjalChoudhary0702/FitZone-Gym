const express = require('express');
const router = express.Router();
const { verifyPin, sendTestEmailController } = require('../controllers/authController');
const { validateBody } = require('../middleware/validate');
const { protectAdmin } = require('../middleware/authMiddleware');

// Public PIN verification route
router.post('/verify-pin', validateBody(['pin']), verifyPin);

// Protected Admin Test Email route (JWT Token Required)
router.post('/test-email', protectAdmin, validateBody(['to']), sendTestEmailController);

module.exports = router;
