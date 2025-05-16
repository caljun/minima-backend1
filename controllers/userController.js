const User = require("../models/User");

// 自分のプロフィール画像取得
exports.getProfileImage = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ message: "ユーザーが見つかりません" });
    res.json({ profileImage: user.profileImage || null });
  } catch (err) {
    console.error("プロフィール画像取得エラー:", err);
    res.status(500).json({ message: "画像取得エラー" });
  }
};

// プロフィール画像の更新
exports.updateProfileImage = async (req, res) => {
  try {
    const { image } = req.body;
    const updated = await User.findOneAndUpdate(
      { email: req.user.email },
      { profileImage: image },
      { new: true }
    );
    res.json({ success: true, profileImage: updated.profileImage });
  } catch (err) {
    console.error("プロフィール画像保存エラー:", err);
    res.status(500).json({ message: "画像保存エラー" });
  }
};

// 他人のプロフィール画像取得（メールアドレス指定）
exports.getProfileImageByEmail = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ message: "ユーザーが見つかりません" });
    res.json({ profileImage: user.profileImage || null });
  } catch (err) {
    console.error("他人プロフィール画像取得エラー:", err);
    res.status(500).json({ message: "画像取得エラー" });
  }
};
