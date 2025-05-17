require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

// ルーターのインポート
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const paymentRoutes = require('./routes/payment');
const userRoutes = require('./routes/users');

const app = express();

// ミドルウェアの設定
app.use(helmet()); // セキュリティヘッダーの設定
app.use(compression()); // レスポンス圧縮
app.use(morgan('dev')); // リクエストログ
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// データベース接続
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// レート制限の設定
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 100 // IPごとの最大リクエスト数
});
app.use(limiter);

// ルートの設定
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/users', userRoutes);

// エラーハンドリング
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'サーバーエラーが発生しました'
  });
});

// サーバー起動
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});