const asyncHandler = require('express-async-handler');
const Deal = require('../models/Deal');

// @desc    Get the current live deal(s) for the storefront banner
// @route   GET /api/deals/active
// @access  Public
const getActiveDeals = asyncHandler(async (req, res) => {
  const now = new Date();
  const deals = await Deal.find({
    isActive: true,
    startsAt: { $lte: now },
    endsAt: { $gte: now },
  })
    .populate('products')
    .populate('category', 'name slug');
  res.json({ success: true, data: deals });
});

// @desc    Admin: list all deals
// @route   GET /api/deals
// @access  Private (admin)
const getDealsAdmin = asyncHandler(async (req, res) => {
  const deals = await Deal.find({}).populate('products', 'name').populate('category', 'name').sort('-createdAt');
  res.json({ success: true, data: deals });
});

// @desc    Admin: create deal
// @route   POST /api/deals
// @access  Private (admin)
const createDeal = asyncHandler(async (req, res) => {
  const deal = await Deal.create(req.body);
  res.status(201).json({ success: true, data: deal });
});

// @desc    Admin: update deal
// @route   PUT /api/deals/:id
// @access  Private (admin)
const updateDeal = asyncHandler(async (req, res) => {
  const deal = await Deal.findById(req.params.id);
  if (!deal) {
    res.status(404);
    throw new Error('Deal not found');
  }
  Object.assign(deal, req.body);
  const updated = await deal.save();
  res.json({ success: true, data: updated });
});

// @desc    Admin: delete deal
// @route   DELETE /api/deals/:id
// @access  Private (admin)
const deleteDeal = asyncHandler(async (req, res) => {
  const deal = await Deal.findByIdAndDelete(req.params.id);
  if (!deal) {
    res.status(404);
    throw new Error('Deal not found');
  }
  res.json({ success: true, message: 'Deal deleted' });
});

module.exports = { getActiveDeals, getDealsAdmin, createDeal, updateDeal, deleteDeal };
