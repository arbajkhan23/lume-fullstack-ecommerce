const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Admin = require('../models/Admin');

/** Extract Bearer token from Authorization header */
function getToken(req) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) return header.split(' ')[1];
  return null;
}

/** Protect customer-facing routes — requires a valid user JWT */
const protectUser = asyncHandler(async (req, res, next) => {
  const token = getToken(req);
  if (!token) {
    res.status(401);
    throw new Error('Not authorized — no token provided');
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      res.status(401);
      throw new Error('Not authorized — user not found or inactive');
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(401);
    throw new Error('Not authorized — invalid or expired token');
  }
});

/** Optional auth — attaches req.user if a valid token is present, else continues anonymously */
const optionalUser = asyncHandler(async (req, res, next) => {
  const token = getToken(req);
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (user && user.isActive) req.user = user;
  } catch (err) {
    // ignore invalid token for optional routes
  }
  next();
});

/** Protect admin panel routes — requires a valid admin JWT */
const protectAdmin = asyncHandler(async (req, res, next) => {
  const token = getToken(req);
  if (!token) {
    res.status(401);
    throw new Error('Not authorized — no admin token provided');
  }
  try {
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
    const admin = await Admin.findById(decoded.id);
    if (!admin || !admin.isActive) {
      res.status(401);
      throw new Error('Not authorized — admin not found or inactive');
    }
    req.admin = admin;
    next();
  } catch (err) {
    res.status(401);
    throw new Error('Not authorized — invalid or expired admin token');
  }
});

/** Role gate — use after protectAdmin, e.g. requireRole('superadmin') */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.admin || !roles.includes(req.admin.role)) {
    res.status(403);
    throw new Error('Forbidden — insufficient permissions');
  }
  next();
};

module.exports = { protectUser, optionalUser, protectAdmin, requireRole };
