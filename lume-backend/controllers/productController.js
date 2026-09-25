const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Category = require('../models/Category');
const ApiFeatures = require('../utils/apiFeatures');
const { cloudinary } = require('../config/cloudinary');

// @desc    Get all active products (storefront) — search, filter, sort, paginate
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const base = Product.find({ isActive: true }).populate('category', 'name slug');

  const features = new ApiFeatures(base, req.query)
    .search(['name', 'description'])
    .filter(['category', 'tag', 'isFeatured', 'isTrending'])
    .sort()
    .paginate();

  const products = await features.query;
  const meta = await features.getMeta(Product);

  res.json({ success: true, data: products, meta });
});

// @desc    Get single product by id or slug
// @route   GET /api/products/:idOrSlug
// @access  Public
const getProductByIdOrSlug = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const isObjectId = idOrSlug.match(/^[0-9a-fA-F]{24}$/);
  const product = await Product.findOne(
    isObjectId ? { _id: idOrSlug } : { slug: idOrSlug }
  ).populate('category', 'name slug');

  if (!product || !product.isActive) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json({ success: true, data: product });
});

// @desc    Get products related to a given product (same category)
// @route   GET /api/products/:id/related
// @access  Public
const getRelatedProducts = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  const related = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    isActive: true,
  }).limit(Number(req.query.limit) || 4);
  res.json({ success: true, data: related });
});

// @desc    Create product (with image upload via multer/cloudinary)
// @route   POST /api/products
// @access  Private (admin)
const createProduct = asyncHandler(async (req, res) => {
  const { name, category, price, oldPrice, stock, description, features, sku, isFeatured, isTrending } = req.body;

  const categoryDoc = await Category.findById(category);
  if (!categoryDoc) {
    res.status(400);
    throw new Error('Invalid category');
  }

  const images = (req.files || []).map((f) => ({ url: f.path, publicId: f.filename }));

  const product = await Product.create({
    name,
    category,
    price,
    oldPrice: oldPrice || null,
    stock,
    description,
    sku: sku || undefined,
    features: features ? (Array.isArray(features) ? features : String(features).split('\n').filter(Boolean)) : [],
    images,
    isFeatured: isFeatured === 'true' || isFeatured === true,
    isTrending: isTrending === 'true' || isTrending === true,
  });

  res.status(201).json({ success: true, data: product });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (admin)
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const fields = ['name', 'category', 'price', 'oldPrice', 'stock', 'description', 'sku', 'isFeatured', 'isTrending', 'isActive', 'tag'];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) product[f] = req.body[f];
  });
  if (req.body.features !== undefined) {
    product.features = Array.isArray(req.body.features)
      ? req.body.features
      : String(req.body.features).split('\n').filter(Boolean);
  }

  // New images appended; existing ones kept unless explicitly removed via removeImageIds
  if (req.files && req.files.length) {
    const newImages = req.files.map((f) => ({ url: f.path, publicId: f.filename }));
    product.images.push(...newImages);
  }
  if (req.body.removeImageIds) {
    const removeIds = Array.isArray(req.body.removeImageIds) ? req.body.removeImageIds : [req.body.removeImageIds];
    for (const publicId of removeIds) {
      await cloudinary.uploader.destroy(publicId).catch(() => {});
    }
    product.images = product.images.filter((img) => !removeIds.includes(img.publicId));
  }

  const updated = await product.save();
  res.json({ success: true, data: updated });
});

// @desc    Delete product (and its Cloudinary images)
// @route   DELETE /api/products/:id
// @access  Private (admin)
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  for (const img of product.images) {
    await cloudinary.uploader.destroy(img.publicId).catch(() => {});
  }
  await product.deleteOne();
  res.json({ success: true, message: 'Product deleted' });
});

// @desc    Admin: list all products including inactive (fuller data, for admin table)
// @route   GET /api/products/admin/all
// @access  Private (admin)
const getProductsAdmin = asyncHandler(async (req, res) => {
  const base = Product.find({}).populate('category', 'name slug');
  const features = new ApiFeatures(base, req.query)
    .search(['name', 'sku'])
    .filter(['category', 'isActive', 'tag'])
    .sort()
    .paginate();

  const products = await features.query;
  const meta = await features.getMeta(Product);
  res.json({ success: true, data: products, meta });
});

module.exports = {
  getProducts,
  getProductByIdOrSlug,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsAdmin,
};
