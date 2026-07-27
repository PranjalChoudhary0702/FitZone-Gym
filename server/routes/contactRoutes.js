const express = require('express');
const router = express.Router();
const {
  getContactMessages,
  createContactMessage,
  updateContactStatus
} = require('../controllers/contactController');
const { validateBody } = require('../middleware/validate');

router.route('/')
  .get(getContactMessages)
  .post(validateBody(['name', 'email', 'phone', 'message']), createContactMessage);

router.patch('/:id/status', validateBody(['status']), updateContactStatus);

module.exports = router;
