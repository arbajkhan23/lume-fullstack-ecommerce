const asyncHandler = require('express-async-handler');
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

async function getOrCreateWishlist(userId) {
  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) wishlist = await Wishlist.create({ user: userId, products: [] });
  return wishlist;
}

// @desc    Get current user's wishlist
// @route   GET /api/wishlist
// @access  Private (user)
const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await getOrCreateWishlist(req.user._id);
  await wishlist.populate('products');
  res.json({ success: true, data: wishlist });
});

// @desc    Toggle a product in/out of the wishlist
// @route   POST /api/wishlist/toggle
// @access  Private (user)
const toggleWishlistItem = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const wishlist = await getOrCreateWishlist(req.user._id);
  const idx = wishlist.products.findIndex((p) => p.toString() === productId);
  let active;
  if (idx > -1) {
    wishlist.products.splice(idx, 1);
    active = false;
  } else {
    wishlist.products.push(productId);
    active = true;
  }
  await wishlist.save();
  res.json({ success: true, active, data: wishlist });
});

// @desc    Get all wishlist items for the admin panel
// @route   GET /api/admin/wishlist
// @access  Private (admin)
const getAdminWishlists = asyncHandler(async (req, res) => {
  const wishlists = await Wishlist.find({})
    .populate('user', 'firstName lastName email')
    .populate('products', 'name price images');

  const items = wishlists.flatMap((wishlist) =>
    wishlist.products
      .filter(Boolean)
      .map((product) => ({
        _id: `${wishlist._id}-${product._id}`,
        customer: wishlist.user
          ? {
              name: `${wishlist.user.firstName} ${wishlist.user.lastName}`.trim(),
              email: wishlist.user.email,
            }
          : null,
        product: {
          _id: product._id,
          name: product.name,
          price: product.price,
          image: product.images?.[0]?.url || '',
        },
        addedAt: wishlist.updatedAt || wishlist.createdAt,
      }))
  );

  res.json({ success: true, data: items });
});

module.exports = { getWishlist, toggleWishlistItem, getAdminWishlists };
