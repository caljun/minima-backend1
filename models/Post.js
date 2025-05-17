const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100
  },
  price: {
    type: Number,
    required: true,
    min: 1,
    max: 10000
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxLength: 1000
  },
  category: {
    type: String,
    required: true,
    enum: ['fashion', 'electronics', 'books', 'hobby', 'beauty']
  },
  imageUrl: {
    type: String,
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sold: {
    type: Boolean,
    default: false
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'sold', 'deleted'],
    default: 'active'
  }
}, {
  timestamps: true
});

// インデックスの設定
postSchema.index({ price: 1 });
postSchema.index({ category: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ seller: 1 });
postSchema.index({ status: 1 });

// 仮想フィールド：いいね数
postSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// 手数料計算メソッド
postSchema.methods.calculateCommission = function() {
  const rate = this.price > 5000 ? 0.10 : 0.05;
  return Math.floor(this.price * rate);
};

// 利益計算メソッド
postSchema.methods.calculateProfit = function() {
  const commission = this.calculateCommission();
  return this.price - commission;
};

module.exports = mongoose.model("Post", postSchema);
