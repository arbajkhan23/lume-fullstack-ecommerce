const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    image: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
    },
    ctaLabel: { type: String, default: 'Shop Now' },
    ctaLink: { type: String, default: '/shop.html' },
    placement: {
      type: String,
      enum: ['hero', 'category-strip', 'promo'],
      default: 'hero',
    },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Banner', bannerSchema);
