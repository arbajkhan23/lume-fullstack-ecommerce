const asyncHandler = require('express-async-handler');
const Coupon = require('../models/Coupon');

// @desc    Validate a coupon code against a cart subtotal (storefront, pre-checkout)
// @route   POST /api/coupons/validate
// @access  Private (user)
const validateCoupon = asyncHandler(async (req, res) => {
  const { code, subtotal } = req.body;
  const coupon = await Coupon.findOne({ code: String(code).toUpperCase() });

  if (!coupon || !coupon.isValidNow()) {
    res.status(400);
    throw new Error('Coupon is invalid or expired');
  }
  if (subtotal < coupon.minOrderValue) {
    res.status(400);
    throw new Error(`This coupon requires a minimum order of $${coupon.minOrderValue} USD`);
  }

  let discount =
    coupon.discountType === 'percentage' ? (subtotal * coupon.discountValue) / 100 : coupon.discountValue;
  if (coupon.maxDiscountAmount) discount = Math.min(discount, coupon.maxDiscountAmount);

  res.json({ success: true, data: { code: coupon.code, discount, discountType: coupon.discountType } });
});

// @desc    Admin: list all coupons
// @route   GET /api/coupons
// @access  Private (admin)
const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({}).sort('-createdAt');
  res.json({ success: true, data: coupons });
});

// @desc    Admin: create coupon
// @route   POST /api/coupons
// @access  Private (admin)
const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create({ ...req.body, code: String(req.body.code).toUpperCase() });
  res.status(201).json({ success: true, data: coupon });
});

// @desc    Admin: update coupon
// @route   PUT /api/coupons/:id
// @access  Private (admin)
const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found');
  }
  Object.assign(coupon, req.body);
  if (req.body.code) coupon.code = String(req.body.code).toUpperCase();
  const updated = await coupon.save();
  res.json({ success: true, data: updated });
});

// @desc    Admin: delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private (admin)
const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found');
  }
  res.json({ success: true, message: 'Coupon deleted' });
});

module.exports = { validateCoupon, getCoupons, createCoupon, updateCoupon, deleteCoupon };
