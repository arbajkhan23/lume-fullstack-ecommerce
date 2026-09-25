const asyncHandler = require('express-async-handler');
const Admin = require('../models/Admin');
const { generateAdminToken } = require('../utils/generateToken');

// @desc    Admin login
// @route   POST /api/admin/auth/login
// @access  Public
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email }).select('+password');

  if (!admin || !(await admin.comparePassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }
  if (!admin.isActive) {
    res.status(403);
    throw new Error('This admin account has been deactivated');
  }

  admin.lastLogin = new Date();
  await admin.save();

  res.json({
    success: true,
    data: {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      avatar: admin.avatar,
      token: generateAdminToken(admin._id, admin.role),
    },
  });
});

// @desc    Get logged-in admin profile
// @route   GET /api/admin/auth/me
// @access  Private (admin)
const getAdminProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.admin });
});

// @desc    Create a new admin/staff account (superadmin only)
// @route   POST /api/admin/auth/create
// @access  Private (superadmin)
const createAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const exists = await Admin.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error('An admin with this email already exists');
  }
  const admin = await Admin.create({ name, email, password, role: role || 'staff' });
  res.status(201).json({
    success: true,
    data: { _id: admin._id, name: admin.name, email: admin.email, role: admin.role },
  });
});

module.exports = { loginAdmin, getAdminProfile, createAdmin };
