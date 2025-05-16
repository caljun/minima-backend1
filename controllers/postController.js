const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Notification = require("../models/Notification");

exports.createPost = async (req, res) => {
  try {
    const { name, reason, price } = req.body;
    const image = req.file?.path;

    if (!name || !reason || !price || !image) {
      return res.status(400).json({ message: "すべての項目を入力してください" });
    }

    const priceNum = Number(price);
    if (isNaN(priceNum) || priceNum < 1 || priceNum > 10000) {
      return res.status(400).json({ message: "価格は1〜10000の数値で入力してください" });
     }

    const post = new Post({
      name,
      reason,
      price : priceNum,
      image,
      email: req.user.email,
      createdAt: new Date()
    });

    const saved = await post.save();
    res.status(201).json({ message: "投稿が保存されました", post: saved });
  } catch (err) {
    console.error("投稿保存エラー:", err);
    res.status(500).json({ message: "投稿に失敗しました" });
  }
};

exports.getOwnPosts = async (req, res) => {
  try {
    const posts = await Post.find({ email: req.user.email }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "取得に失敗しました" });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "投稿が見つかりません" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: "投稿取得エラー" });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "投稿が見つかりません" });
    if (post.email !== req.user.email)
      return res.status(403).json({ message: "削除権限がありません" });

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "削除されました" });
  } catch (err) {
    res.status(500).json({ message: "削除に失敗しました" });
  }
};

exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.id }).sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: "コメント取得に失敗しました" });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "コメント内容が必要です" });

    const newComment = new Comment({
      postId: req.params.id,
      text,
      email: req.user.email
    });

    const saved = await newComment.save();

    const post = await Post.findById(req.params.id);
    if (post && post.email !== req.user.email) {
      await Notification.create({
        toEmail: post.email,
        type: "コメント",
        postId: req.params.id,
        fromEmail: req.user.email
      });
    }

    res.status(201).json({ message: "コメントが保存されました", comment: saved });
  } catch (err) {
    console.error("コメント保存エラー:", err);
    res.status(500).json({ message: "コメント保存に失敗しました" });
  }
};

exports.getPostsByUser = async (req, res) => {
  try {
    const email = `${req.params.username}@example.com`;
    const posts = await Post.find({ email }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error("ユーザー投稿取得エラー:", err);
    res.status(500).json({ message: "ユーザー投稿取得エラー" });
  }
};

exports.getPostsByEmail = async (req, res) => {
  try {
    const posts = await Post.find({ email: req.params.email }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error("ユーザー投稿取得エラー:", err);
    res.status(500).json({ message: "ユーザー投稿取得エラー" });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const { name, reason, price } = req.body;
    const image = req.file?.path;
    const priceNum = Number(price);

    if (!name || !reason || isNaN(priceNum) || priceNum < 1 || priceNum > 10000) {
      return res.status(400).json({ message: "無効な入力です" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "投稿が見つかりません" });

    if (post.email !== req.user.email) {
      return res.status(403).json({ message: "編集権限がありません" });
    }

    // フィールド更新
    post.name = name;
    post.reason = reason;
    post.price = priceNum;
    if (image) post.image = image; // 画像がある場合のみ更新

    const updated = await post.save();
    res.json({ message: "投稿が更新されました", post: updated });

  } catch (err) {
    console.error("投稿更新エラー:", err);
    res.status(500).json({ message: "投稿の更新に失敗しました" });
  }
};

