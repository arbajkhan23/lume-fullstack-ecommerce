const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');
const { generateUserToken } = require('../utils/generateToken');

// @desc    Register a new customer
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, phone } = req.body;

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error('An account with this email already exists');
  }

  const user = await User.create({ firstName, lastName, email, password, phone });

  // Provision an empty cart & wishlist so downstream routes never 404
  await Cart.create({ user: user._id, items: [] });
  await Wishlist.create({ user: user._id, products: [] });

  res.status(201).json({
    success: true,
    data: {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      token: generateUserToken(user._id),
    },
  });
});

// @desc    Login customer
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }
  if (!user.isActive) {
    res.status(403);
    throw new Error('This account has been deactivated');
  }

  user.lastLogin = new Date();
  await user.save();

  res.json({
    success: true,
    data: {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      token: generateUserToken(user._id),
    },
  });
});

// @desc    Get logged-in user's profile
// @route   GET /api/auth/profile
// @access  Private (user)
const getProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});

// @desc    Update logged-in user's profile
// @route   PUT /api/auth/profile
// @access  Private (user)
const updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, phone, marketingOptIn, avatar } = req.body;
  const user = await User.findById(req.user._id);

  if (firstName !== undefined) user.firstName = firstName;
  if (lastName !== undefined) user.lastName = lastName;
  if (phone !== undefined) user.phone = phone;
  if (marketingOptIn !== undefined) user.marketingOptIn = marketingOptIn;
  if (avatar !== undefined) user.avatar = avatar;

  const updated = await user.save();
  res.json({ success: true, data: updated });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private (user)
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }
  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password updated successfully' });
});

module.exports = { registerUser, loginUser, getProfile, updateProfile, changePassword };
