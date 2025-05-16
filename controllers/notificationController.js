const Notification = require("../models/Notification");
const Post = require("../models/Post");

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ toEmail: req.user.email })
      .sort({ createdAt: -1 })
      .populate("postId");
    res.json(notifications);
  } catch (err) {
    console.error("通知取得エラー:", err);
    res.status(500).json({ message: "通知の取得に失敗しました" });
  }
};

exports.createNotification = async (req, res) => {
  const { toEmail, type, postId } = req.body;
  if (!toEmail || !type || !postId) {
    return res.status(400).json({ message: "必要な情報が不足しています" });
  }

  try {
    const newNotification = new Notification({
      toEmail,
      type,
      postId,
      fromEmail: req.user.email
    });

    const saved = await newNotification.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("通知作成エラー:", err);
    res.status(500).json({ message: "通知の保存に失敗しました" });
  }
};
