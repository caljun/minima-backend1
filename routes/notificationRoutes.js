const express = require("express");
const router = express.Router();
const { verifyToken } = require("../utils/authMiddleware");
const Notification = require("../models/Notification"); // 🔥 モデル直接使う

const {
  getNotifications,
  createNotification
} = require("../controllers/notificationController");

router.get("/notifications/me", verifyToken, getNotifications);
router.post("/notifications", verifyToken, createNotification);

// ✅ 既読化用 PATCHルート
router.patch("/notifications/:id/read", verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: "通知が見つかりません" });
    }
    if (notification.toEmail !== req.user.email) {
      return res.status(403).json({ message: "権限がありません" });
    }

    notification.read = true;
    await notification.save();

    res.json({ message: "通知を既読にしました" });
  } catch (err) {
    console.error("既読化エラー:", err);
    res.status(500).json({ message: "既読化に失敗しました" });
  }
});

module.exports = router;
