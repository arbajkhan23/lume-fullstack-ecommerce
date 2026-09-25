const asyncHandler = require('express-async-handler');
const Category = require('../models/Category');
const Product = require('../models/Product');
const { cloudinary } = require('../config/cloudinary');

// @desc    Get all active categories (with live product counts)
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort('sortOrder name');
  const withCounts = await Promise.all(
    categories.map(async (c) => {
      const count = await Product.countDocuments({ category: c._id, isActive: true });
      return { ...c.toObject(), productCount: count };
    })
  );
  res.json({ success: true, data: withCounts });
});

// @desc    Get single category by slug
// @route   GET /api/categories/:slug
// @access  Public
const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug, isActive: true });
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  res.json({ success: true, data: category });
});

// @desc    Admin: list all categories (including inactive)
// @route   GET /api/categories/admin/all
// @access  Private (admin)
const getCategoriesAdmin = asyncHandler(async (req, res) => {
  const categories = await Category.find({}).sort('sortOrder name');
  const withCounts = await Promise.all(
    categories.map(async (c) => {
      const count = await Product.countDocuments({ category: c._id });
      return { ...c.toObject(), productCount: count };
    })
  );
  res.json({ success: true, data: withCounts });
});

// @desc    Create category
// @route   POST /api/categories
// @access  Private (admin)
const createCategory = asyncHandler(async (req, res) => {
  const { name, description, sortOrder } = req.body;
  const image = req.file ? { url: req.file.path, publicId: req.file.filename } : undefined;

  const category = await Category.create({ name, description, sortOrder, image });
  res.status(201).json({ success: true, data: category });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (admin)
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  ['name', 'description', 'sortOrder', 'isActive'].forEach((f) => {
    if (req.body[f] !== undefined) category[f] = req.body[f];
  });

  if (req.file) {
    if (category.image?.publicId) {
      await cloudinary.uploader.destroy(category.image.publicId).catch(() => {});
    }
    category.image = { url: req.file.path, publicId: req.file.filename };
  }

  const updated = await category.save();
  res.json({ success: true, data: updated });
});

// @desc    Delete category (blocked if products still reference it)
// @route   DELETE /api/categories/:id
// @access  Private (admin)
const deleteCategory = asyncHandler(async (req, res) => {
  const inUse = await Product.countDocuments({ category: req.params.id });
  if (inUse > 0) {
    res.status(400);
    throw new Error(`Cannot delete — ${inUse} product(s) still use this category`);
  }
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  if (category.image?.publicId) {
    await cloudinary.uploader.destroy(category.image.publicId).catch(() => {});
  }
  await category.deleteOne();
  res.json({ success: true, message: 'Category deleted' });
});

module.exports = {
  getCategories,
  getCategoryBySlug,
  getCategoriesAdmin,
  createCategory,
  updateCategory,
  deleteCategory,
};
