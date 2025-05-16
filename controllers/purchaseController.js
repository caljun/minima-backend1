const Purchase = require("../models/Purchase");

/**
 * 購入履歴を取得（ログインユーザー用）
 */
exports.getMyPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find({ buyerEmail: req.user.email }).sort({ purchasedAt: -1 });
    res.json(purchases);
  } catch (err) {
    console.error("購入履歴取得エラー:", err);
    res.status(500).json({ message: "購入履歴の取得に失敗しました" });
  }
};

/**
 * 購入記録を保存（Webhook または内部処理用）
 */
exports.recordPurchase = async (req, res) => {
  const { postId, buyerEmail, name, price } = req.body;

  if (!postId || !buyerEmail || !name || !price) {
    return res.status(400).json({ message: "必要な情報が不足しています" });
  }

  try {
    const purchase = new Purchase({
      postId,
      name,
      price,
      buyerEmail,
      purchasedAt: new Date()
    });

    const saved = await purchase.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("購入保存エラー:", err);
    res.status(500).json({ message: "購入記録の保存に失敗しました" });
  }
};
