const express = require('express');
const router = express.Router();
const { protectUser, protectAdmin } = require('../middleware/authMiddleware');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getOrdersAdmin,
  updateOrderStatus,
} = require('../controllers/orderController');

// Customer routes
router.post('/', protectUser, createOrder);
router.get('/my', protectUser, getMyOrders);

// Admin routes
router.get('/', protectAdmin, getOrdersAdmin);
router.put('/:id/status', protectAdmin, updateOrderStatus);

// Shared (owner or admin — checked inside controller)
router.get('/:id', async (req, res, next) => {
  // Try admin token first, then fall back to user token
  const authHeader = req.headers.authorization;
  if (!authHeader) return protectUser(req, res, next);
  next();
}, (req, res, next) => {
  const jwt = require('jsonwebtoken');
  const token = req.headers.authorization?.split(' ')[1];
  try {
    jwt.verify(token, process.env.ADMIN_JWT_SECRET);
    return protectAdmin(req, res, next);
  } catch {
    return protectUser(req, res, next);
  }
}, getOrderById);

module.exports = router;
