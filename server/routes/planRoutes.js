const express = require('express');
const router = express.Router();
const {
  getPlans,
  getPlanById,
  createPlan,
  updatePlan
} = require('../controllers/planController');
const { validateBody } = require('../middleware/validate');
const { protectAdmin } = require('../middleware/authMiddleware');

// Public READ endpoints
router.get('/', getPlans);
router.get('/:id', getPlanById);

// Protected Admin WRITE endpoints
router.post('/', protectAdmin, validateBody(['name', 'monthlyPrice', 'annualMonthlyPrice']), createPlan);
router.put('/:id', protectAdmin, updatePlan);

module.exports = router;
