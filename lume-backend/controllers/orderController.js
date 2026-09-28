const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const ApiFeatures = require('../utils/apiFeatures');

const FREE_SHIPPING_THRESHOLD = 75;
const FLAT_SHIPPING = 8.5;

function generateOrderNumber() {
  return 'LM-' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 90 + 10);
}

// @desc    Place an order from the current cart
// @route   POST /api/orders
// @access  Private (user)
const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress: submittedAddress, paymentMethod, couponCode } = req.body;

  const shippingAddress = {
    fullName: submittedAddress?.fullName || submittedAddress?.name || '',
    phone: submittedAddress?.phone || '',
    street: submittedAddress?.street || '',
    city: submittedAddress?.city || '',
    state: submittedAddress?.state || '',
    zip: submittedAddress?.zip || submittedAddress?.postalCode || '',
    country: submittedAddress?.country || 'India',
  };

  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error('Your cart is empty');
  }

  // Validate stock and build order line items with fresh price snapshots
  const orderItems = [];
  for (const item of cart.items) {
    const product = item.product;
    if (!product || !product.isActive) {
      res.status(400);
      throw new Error(`A product in your cart is no longer available`);
    }
    if (product.stock < item.qty) {
      res.status(400);
      throw new Error(`Insufficient stock for ${product.name}`);
    }
    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images?.[0]?.url || '',
      price: product.price,
      qty: item.qty,
    });
  }

  const itemsPrice = orderItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  let shippingPrice = itemsPrice >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
  let discountPrice = 0;
  let couponData = { code: null, discountAmount: 0 };

  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (!coupon || !coupon.isValidNow()) {
      res.status(400);
      throw new Error('Coupon is invalid or expired');
    }
    if (itemsPrice < coupon.minOrderValue) {
      res.status(400);
      throw new Error(`Coupon requires a minimum order of $${coupon.minOrderValue} USD`);
    }
    discountPrice =
      coupon.discountType === 'percentage'
        ? (itemsPrice * coupon.discountValue) / 100
        : coupon.discountValue;
    if (coupon.maxDiscountAmount) discountPrice = Math.min(discountPrice, coupon.maxDiscountAmount);
    couponData = { code: coupon.code, discountAmount: discountPrice };
    coupon.usedCount += 1;
    await coupon.save();
  }

  const totalPrice = Math.max(0, itemsPrice + shippingPrice - discountPrice);

  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    paymentMethod: paymentMethod === 'Cash on Delivery' ? 'COD' : (paymentMethod || 'Card'),
    coupon: couponData,
    itemsPrice,
    shippingPrice,
    discountPrice,
    totalPrice,
  });

  // Decrement stock
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.qty } });
  }
  // Clear the cart
  cart.items = [];
  await cart.save();

  res.status(201).json({ success: true, data: order });
});

// @desc    Get logged-in user's order history
// @route   GET /api/orders/my
// @access  Private (user)
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
  res.json({ success: true, data: orders });
});

// @desc    Get single order (owner or admin)
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'firstName lastName email');
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (!req.admin && order.user._id.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }
  res.json({ success: true, data: order });
});

// @desc    Admin: list all orders — search/filter by status/paginate
// @route   GET /api/orders
// @access  Private (admin)
const getOrdersAdmin = asyncHandler(async (req, res) => {
  const base = Order.find({}).populate('user', 'firstName lastName email');
  const features = new ApiFeatures(base, req.query)
    .search(['orderNumber'])
    .filter(['status', 'isPaid'])
    .sort()
    .paginate();

  const orders = await features.query;
  const meta = await features.getMeta(Order);
  res.json({ success: true, data: orders, meta });
});

// @desc    Admin: update order status (enforces forward flow, allows Cancelled from any pre-Delivered state)
// @route   PUT /api/orders/:id/status
// @access  Private (admin)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (!Order.STATUSES.includes(status)) {
    res.status(400);
    throw new Error('Invalid status value');
  }
  if (order.status === 'Delivered' || order.status === 'Cancelled') {
    res.status(400);
    throw new Error(`Order is already ${order.status} and cannot be changed`);
  }

  order.status = status;
  order.statusHistory.push({ status, note: note || '' });
  if (status === 'Delivered') order.deliveredAt = new Date();
  if (status === 'Cancelled') {
    order.cancelledAt = new Date();
    order.cancelReason = note || '';
    // restock cancelled items
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.qty } });
    }
  }

  const updated = await order.save();
  res.json({ success: true, data: updated });
});

module.exports = { createOrder, getMyOrders, getOrderById, getOrdersAdmin, updateOrderStatus };
