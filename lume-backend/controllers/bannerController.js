const asyncHandler = require('express-async-handler');
const Banner = require('../models/Banner');
const { cloudinary } = require('../config/cloudinary');

// @desc    Get active banners for storefront (optionally filtered by placement)
// @route   GET /api/banners
// @access  Public
const getBanners = asyncHandler(async (req, res) => {
  const filter = { isActive: true };
  if (req.query.placement) filter.placement = req.query.placement;
  const banners = await Banner.find(filter).sort('sortOrder -createdAt');
  res.json({ success: true, data: banners });
});

// @desc    Admin: list all banners
// @route   GET /api/banners/admin/all
// @access  Private (admin)
const getBannersAdmin = asyncHandler(async (req, res) => {
  const banners = await Banner.find({}).sort('sortOrder -createdAt');
  res.json({ success: true, data: banners });
});

// @desc    Admin: create banner (image required)
// @route   POST /api/banners
// @access  Private (admin)
const createBanner = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Banner image is required');
  }
  const { title, subtitle, ctaLabel, ctaLink, placement, sortOrder } = req.body;
  const banner = await Banner.create({
    title,
    subtitle,
    ctaLabel,
    ctaLink,
    placement,
    sortOrder,
    image: { url: req.file.path, publicId: req.file.filename },
  });
  res.status(201).json({ success: true, data: banner });
});

// @desc    Admin: update banner
// @route   PUT /api/banners/:id
// @access  Private (admin)
const updateBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) {
    res.status(404);
    throw new Error('Banner not found');
  }
  ['title', 'subtitle', 'ctaLabel', 'ctaLink', 'placement', 'sortOrder', 'isActive'].forEach((f) => {
    if (req.body[f] !== undefined) banner[f] = req.body[f];
  });
  if (req.file) {
    if (banner.image?.publicId) await cloudinary.uploader.destroy(banner.image.publicId).catch(() => {});
    banner.image = { url: req.file.path, publicId: req.file.filename };
  }
  const updated = await banner.save();
  res.json({ success: true, data: updated });
});

// @desc    Admin: delete banner
// @route   DELETE /api/banners/:id
// @access  Private (admin)
const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) {
    res.status(404);
    throw new Error('Banner not found');
  }
  if (banner.image?.publicId) await cloudinary.uploader.destroy(banner.image.publicId).catch(() => {});
  await banner.deleteOne();
  res.json({ success: true, message: 'Banner deleted' });
});

module.exports = { getBanners, getBannersAdmin, createBanner, updateBanner, deleteBanner };
