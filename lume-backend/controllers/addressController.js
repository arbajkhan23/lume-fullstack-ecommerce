const asyncHandler = require('express-async-handler');
const Address = require('../models/Address');

// @desc    Get all addresses for logged-in user
// @route   GET /api/users/addresses
// @access  Private (user)
const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find({ user: req.user._id }).sort('-isDefault -createdAt');
  res.json({ success: true, data: addresses });
});

// @desc    Add a new address
// @route   POST /api/users/addresses
// @access  Private (user)
const addAddress = asyncHandler(async (req, res) => {
  const address = await Address.create({ ...req.body, user: req.user._id });
  res.status(201).json({ success: true, data: address });
});

// @desc    Update an address
// @route   PUT /api/users/addresses/:id
// @access  Private (user)
const updateAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
  if (!address) {
    res.status(404);
    throw new Error('Address not found');
  }
  Object.assign(address, req.body);
  const updated = await address.save();
  res.json({ success: true, data: updated });
});

// @desc    Delete an address
// @route   DELETE /api/users/addresses/:id
// @access  Private (user)
const deleteAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!address) {
    res.status(404);
    throw new Error('Address not found');
  }
  res.json({ success: true, message: 'Address deleted' });
});

module.exports = { getAddresses, addAddress, updateAddress, deleteAddress };
