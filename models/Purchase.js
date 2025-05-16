const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  buyerEmail: {
    type: String,
    required: true
  },
  purchasedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Purchase", purchaseSchema);
