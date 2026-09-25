const mongoose = require('mongoose');
const slugify = require('slugify');

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    sku: { type: String, unique: true, sparse: true, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },

    price: { type: Number, required: true, min: 0 },
    oldPrice: { type: Number, default: null, min: 0 }, // null = not on sale
    stock: { type: Number, required: true, default: 0, min: 0 },

    // Denormalized flags the frontend reads directly (kept in sync via pre-save hook)
    inStock: { type: Boolean, default: true },
    tag: { type: String, enum: ['new', 'sale', null], default: null },

    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0, min: 0 },

    images: { type: [imageSchema], default: [] }, // first image = primary/thumbnail
    description: { type: String, required: true },
    features: { type: [String], default: [] },

    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }, // soft-delete / hide from storefront

    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: String,
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text' });

productSchema.pre('validate', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true }) + '-' + Math.random().toString(36).slice(2, 7);
  }
  next();
});

productSchema.pre('save', function (next) {
  this.inStock = this.stock > 0;
  if (this.oldPrice && this.oldPrice > this.price) {
    if (!this.tag) this.tag = 'sale';
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
