const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const validate = require('../middleware/validateMiddleware');
const { protectAdmin, requireRole } = require('../middleware/authMiddleware');
const { loginAdmin, getAdminProfile, createAdmin } = require('../controllers/adminAuthController');
const { getDashboardStats } = require('../controllers/dashboardController');
const { getAdminWishlists } = require('../controllers/wishlistController');

router.post(
  '/auth/login',
  [body('email').isEmail(), body('password').notEmpty()],
  validate,
  loginAdmin
);
router.get('/auth/me', protectAdmin, getAdminProfile);
router.post(
  '/auth/create',
  protectAdmin,
  requireRole('superadmin'),
  [body('email').isEmail(), body('password').isLength({ min: 8 })],
  validate,
  createAdmin
);

router.get('/dashboard', protectAdmin, getDashboardStats);
router.get('/wishlist', protectAdmin, getAdminWishlists);

module.exports = router;
