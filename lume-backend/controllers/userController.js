const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Order = require('../models/Order');
const ApiFeatures = require('../utils/apiFeatures');

// @desc    Admin: list all customers with search/pagination + order stats
// @route   GET /api/users
// @access  Private (admin)
const getUsers = asyncHandler(async (req, res) => {
  const base = User.find({});
  const features = new ApiFeatures(base, req.query)
    .search(['firstName', 'lastName', 'email'])
    .filter(['isActive'])
    .sort()
    .paginate();

  const users = await features.query;
  const meta = await features.getMeta(User);

  const withStats = await Promise.all(
    users.map(async (u) => {
      const orderCount = await Order.countDocuments({ user: u._id });
      const totalSpentAgg = await Order.aggregate([
        { $match: { user: u._id, isPaid: true } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]);
      return {
        ...u.toObject(),
        orderCount,
        totalSpent: totalSpentAgg[0]?.total || 0,
      };
    })
  );

  res.json({ success: true, data: withStats, meta });
});

// @desc    Admin: get a single customer's detail (profile + orders)
// @route   GET /api/users/:id
// @access  Private (admin)
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('Customer not found');
  }
  const orders = await Order.find({ user: user._id }).sort('-createdAt');
  res.json({ success: true, data: { user, orders } });
});

// @desc    Admin: activate/deactivate a customer account
// @route   PUT /api/users/:id/status
// @access  Private (admin)
const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('Customer not found');
  }
  user.isActive = req.body.isActive;
  await user.save();
  res.json({ success: true, data: user });
});

module.exports = { getUsers, getUserById, updateUserStatus };
