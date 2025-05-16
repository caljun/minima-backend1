const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  reason: { type: String, required: true }, // ← 文字数制限削除
  price: { type: Number, required: true, min: 0 }, // ← 新規追加
  email: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Post", PostSchema);
