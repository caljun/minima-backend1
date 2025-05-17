const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
  profileImage: { type: String },
  shopId: { type: String, unique: true },
  shopName: { type: String },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.shopId) {
    const generateId = () => {
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    let isUnique = false;
    while (!isUnique) {
      const shopId = generateId();
      const existing = await this.constructor.findOne({ shopId });
      if (!existing) {
        this.shopId = shopId;
        isUnique = true;
      }
    }
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
