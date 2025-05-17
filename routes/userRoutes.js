const express = require("express");
const router = express.Router();
const { verifyToken } = require("../utils/authMiddleware");
const {
  getProfileImage,
  updateProfileImage,
  getProfileImageByEmail
} = require("../controllers/userController");

const User = require("../models/User"); // ✅ ユーザーモデルを追加

// ✅ プロフィール画像まわり
router.get("/user/profile-image", verifyToken, getProfileImage);
router.put("/user/profile-image", verifyToken, updateProfileImage);
router.get("/user/profile-image/:email", getProfileImageByEmail);

// ✅ ユーザー自身の情報取得（これがなかった）
router.get("/users/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ message: "ユーザーが見つかりません" });
    res.json(user);
  } catch (err) {
    console.error("ユーザー情報取得エラー:", err);
    res.status(500).json({ message: "情報取得に失敗しました" });
  }
});

// ユーザー名の更新
router.put("/users/name", verifyToken, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "名前を入力してください" });
    }

    const user = await User.findOneAndUpdate(
      { email: req.user.email },
      { name },
      { new: true }
    );

    res.json({ success: true, name: user.name });
  } catch (err) {
    console.error("名前更新エラー:", err);
    res.status(500).json({ message: "更新に失敗しました" });
  }
});

// ショップ名の更新
router.put("/users/shop-name", verifyToken, async (req, res) => {
  try {
    const { shopName } = req.body;
    if (!shopName) {
      return res.status(400).json({ message: "ショップ名を入力してください" });
    }

    const user = await User.findOneAndUpdate(
      { email: req.user.email },
      { shopName },
      { new: true }
    );

    res.json({ success: true, shopName: user.shopName });
  } catch (err) {
    console.error("ショップ名更新エラー:", err);
    res.status(500).json({ message: "更新に失敗しました" });
  }
});

// ショップIDからユーザー情報を取得
router.get("/users/shop/:shopId", async (req, res) => {
  try {
    const user = await User.findOne({ shopId: req.params.shopId });
    if (!user) {
      return res.status(404).json({ message: "ショップが見つかりません" });
    }

    // パスワードは除外して返す
    const { password, ...userInfo } = user.toObject();
    res.json(userInfo);
  } catch (err) {
    console.error("ショップ情報取得エラー:", err);
    res.status(500).json({ message: "情報取得に失敗しました" });
  }
});

module.exports = router;
