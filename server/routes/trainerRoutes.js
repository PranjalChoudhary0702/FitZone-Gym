const express = require('express');
const router = express.Router();
const {
  getTrainers,
  getTrainerById,
  createTrainer,
  updateTrainer,
  deleteTrainer
} = require('../controllers/trainerController');
const { validateBody } = require('../middleware/validate');
const { protectAdmin } = require('../middleware/authMiddleware');

// Public READ endpoints
router.get('/', getTrainers);
router.get('/:id', getTrainerById);

// Protected Admin WRITE/DELETE endpoints
router.post('/', protectAdmin, validateBody(['name', 'role', 'specialtyCategory']), createTrainer);
router.put('/:id', protectAdmin, updateTrainer);
router.delete('/:id', protectAdmin, deleteTrainer);

module.exports = router;
