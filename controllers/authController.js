const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function generateToken(email) {
  return jwt.sign({ email }, process.env.SECRET_KEY, { expiresIn: "24h" });
}

// 新規登録
exports.register = async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashed });
    const token = generateToken(user.email);
    res.json({ token });
  } catch (err) {
    console.error("登録エラー:", err);
    res.status(500).json({ message: "登録に失敗しました" });
  }
};

// ログイン（※本来はパスワード照合が必要）
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "ユーザーが存在しません" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "パスワードが一致しません" });

    const token = generateToken(user.email);
    return res.status(200).json({ token });
  } catch (err) {
    console.error("ログインエラー:", err);
    res.status(500).json({ message: "ログインに失敗しました" });
  }
};
