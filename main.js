const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser"); // ← Webhook用
require("dotenv").config();

const app = express();

// Stripe Webhook専用の raw body パース（※順番が重要）
app.use("/webhook", bodyParser.raw({ type: "application/json" }));

// 通常の CORS 設定（本番は Vercel のみ許可）
app.use(cors({
  origin: [
    "http://localhost:5500",                        // 開発用（ローカル）
    "https://minima-frontend-eta.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

// 通常の JSON ボディ
app.use(express.json({ limit: "5mb" }));

// DB接続
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB接続成功"))
  .catch(err => console.error("接続失敗:", err));

// APIルーティング
app.use("/api", require("./routes/authRoutes"));
app.use("/api", require("./routes/postRoutes"));
app.use("/api", require("./routes/userRoutes"));
app.use("/api", require("./routes/notificationRoutes"));
app.use("/api", require("./routes/paymentRoutes"));
app.use("/api", require("./routes/purchaseRoutes"));

// Stripe Webhookルート（最後でもOK）
app.use("/webhook", require("./routes/webhookRoutes"));

// サーバー起動
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`PORT ${PORT}で起動中`));