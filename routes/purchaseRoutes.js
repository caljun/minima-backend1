const express = require("express");
const router = express.Router();
const { verifyToken } = require("../utils/authMiddleware");
const {
  getMyPurchases,
  recordPurchase
} = require("../controllers/purchaseController");

// ログインユーザーの購入履歴取得
router.get("/purchases/me", verifyToken, getMyPurchases);

// 購入記録の保存（Webhookやテスト用途）
router.post("/purchases", recordPurchase);

module.exports = router;
