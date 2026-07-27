const express = require('express');
const router = express.Router();
const {
  getSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule
} = require('../controllers/scheduleController');
const { validateBody } = require('../middleware/validate');
const { protectAdmin } = require('../middleware/authMiddleware');

// Public READ endpoints
router.get('/', getSchedules);
router.get('/:id', getScheduleById);

// Protected Admin WRITE endpoints
router.post('/', protectAdmin, validateBody(['className', 'dayOfWeek', 'startTime', 'trainer', 'trainerName']), createSchedule);
router.put('/:id', protectAdmin, updateSchedule);
router.delete('/:id', protectAdmin, deleteSchedule);

module.exports = router;
