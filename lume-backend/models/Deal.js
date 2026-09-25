const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    discountLabel: { type: String, default: '' }, // e.g. "Up to 40% off"
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

dealSchema.virtual('isLive').get(function () {
  const now = new Date();
  return this.isActive && now >= this.startsAt && now <= this.endsAt;
});
dealSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Deal', dealSchema);
