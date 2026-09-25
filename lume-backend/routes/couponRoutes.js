const express = require('express');
const router = express.Router();
const { protectUser, protectAdmin } = require('../middleware/authMiddleware');
const {
  validateCoupon,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} = require('../controllers/couponController');

router.post('/validate', protectUser, validateCoupon);

router.get('/', protectAdmin, getCoupons);
router.post('/', protectAdmin, createCoupon);
router.put('/:id', protectAdmin, updateCoupon);
router.delete('/:id', protectAdmin, deleteCoupon);

module.exports = router;
