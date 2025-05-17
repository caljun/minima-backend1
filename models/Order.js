const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1,
    max: 10000
  },
  commission: {
    type: Number,
    required: true
  },
  sellerAmount: {
    type: Number,
    required: true
  },
  paymentId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  shippingAddress: {
    name: String,
    postalCode: String,
    prefecture: String,
    city: String,
    address1: String,
    address2: String,
    phone: String
  },
  trackingNumber: String,
  shippingStatus: {
    type: String,
    enum: ['preparing', 'shipped', 'delivered'],
    default: 'preparing'
  }
}, {
  timestamps: true
});

// インデックスの設定
orderSchema.index({ buyer: 1, createdAt: -1 });
orderSchema.index({ seller: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentId: 1 });

module.exports = mongoose.model('Order', orderSchema); 