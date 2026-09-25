const asyncHandler = require('express-async-handler');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
}

// @desc    Get current user's cart (populated with product details)
// @route   GET /api/cart
// @access  Private (user)
const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  await cart.populate('items.product', 'name price oldPrice images stock inStock slug');
  res.json({ success: true, data: cart });
});

// @desc    Add item to cart (or increase qty if already present)
// @route   POST /api/cart
// @access  Private (user)
const addToCart = asyncHandler(async (req, res) => {
  const { productId, qty = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    res.status(404);
    throw new Error('Product not found');
  }
  if (product.stock < qty) {
    res.status(400);
    throw new Error('Not enough stock available');
  }

  const cart = await getOrCreateCart(req.user._id);
  const existing = cart.items.find((i) => i.product.toString() === productId);
  if (existing) existing.qty += Number(qty);
  else cart.items.push({ product: productId, qty: Number(qty), price: product.price });

  await cart.save();
  await cart.populate('items.product', 'name price oldPrice images stock inStock slug');
  res.status(201).json({ success: true, data: cart });
});

// @desc    Update quantity of a cart item
// @route   PUT /api/cart/:productId
// @access  Private (user)
const updateCartItem = asyncHandler(async (req, res) => {
  const { qty } = req.body;
  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.find((i) => i.product.toString() === req.params.productId);
  if (!item) {
    res.status(404);
    throw new Error('Item not in cart');
  }
  if (qty <= 0) {
    cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
  } else {
    item.qty = qty;
  }
  await cart.save();
  await cart.populate('items.product', 'name price oldPrice images stock inStock slug');
  res.json({ success: true, data: cart });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private (user)
const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
  await cart.save();
  res.json({ success: true, data: cart });
});

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private (user)
const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  await cart.save();
  res.json({ success: true, data: cart });
});

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };
