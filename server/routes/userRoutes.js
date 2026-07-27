const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');
const { validateBody } = require('../middleware/validate');

router.route('/')
  .get(getUsers)
  .post(validateBody(['name', 'email', 'phone']), createUser);

router.route('/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;
