const mongoose = require('mongoose');

const ORDER_STATUSES = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true }, // snapshot
    image: { type: String, default: '' }, // snapshot
    price: { type: Number, required: true }, // snapshot
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [orderItemSchema], required: true },

    shippingAddress: {
      fullName: String,
      phone: String,
      street: String,
      city: String,
      state: String,
      zip: String,
      country: String,
    },

    paymentMethod: { type: String, enum: ['Card', 'PayPal', 'COD'], default: 'Card' },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },

    coupon: {
      code: { type: String, default: null },
      discountAmount: { type: Number, default: 0 },
    },

    itemsPrice: { type: Number, required: true },
    shippingPrice: { type: Number, required: true, default: 0 },
    discountPrice: { type: Number, required: true, default: 0 },
    totalPrice: { type: Number, required: true },

    status: { type: String, enum: ORDER_STATUSES, default: 'Pending' },
    statusHistory: [
      {
        status: { type: String, enum: ORDER_STATUSES },
        changedAt: { type: Date, default: Date.now },
        note: { type: String, default: '' },
      },
    ],

    deliveredAt: { type: Date },
    cancelledAt: { type: Date },
    cancelReason: { type: String, default: '' },
  },
  { timestamps: true }
);

orderSchema.pre('save', function (next) {
  if (this.isNew) {
    this.statusHistory.push({ status: this.status, note: 'Order placed' });
  }
  next();
});

orderSchema.statics.STATUSES = ORDER_STATUSES;

module.exports = mongoose.model('Order', orderSchema);
