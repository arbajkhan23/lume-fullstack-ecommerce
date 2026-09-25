const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const validate = require('../middleware/validateMiddleware');
const { protectUser } = require('../middleware/authMiddleware');
const {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  changePassword,
} = require('../controllers/authController');

router.post(
  '/register',
  [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('email').isEmail().withMessage('A valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  validate,
  registerUser
);

router.post(
  '/login',
  [body('email').isEmail(), body('password').notEmpty()],
  validate,
  loginUser
);

router.get('/profile', protectUser, getProfile);
router.put('/profile', protectUser, updateProfile);
router.put(
  '/change-password',
  protectUser,
  [body('newPassword').isLength({ min: 8 })],
  validate,
  changePassword
);

module.exports = router;
