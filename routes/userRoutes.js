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

module.exports = router;
