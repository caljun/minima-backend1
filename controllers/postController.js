const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Notification = require("../models/Notification");
const cloudinary = require('../utils/cloudinary');
const { validationResult } = require('express-validator');

exports.createPost = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, price, description, category } = req.body;

    // 価格チェック
    if (price < 1 || price > 10000) {
      return res.status(400).json({ message: '価格は1円から10000円の間で設定してください' });
    }

    // 画像のアップロード
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'minima/posts'
    });

    const post = new Post({
      name,
      price,
      description,
      category,
      imageUrl: result.secure_url,
      seller: req.user.id
    });

    await post.save();

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
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
    if (!post) {
      return res.status(404).json({ message: '商品が見つかりません' });
    }

    if (post.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: '権限がありません' });
    }

    post.status = 'deleted';
    await post.save();

    res.json({ message: '商品を削除しました' });
  } catch (error) {
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
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
    const { name, price, description, category } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: '商品が見つかりません' });
    }

    if (post.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: '権限がありません' });
    }

    if (post.sold) {
      return res.status(400).json({ message: '売却済みの商品は編集できません' });
    }

    // 更新可能なフィールドを更新
    post.name = name || post.name;
    post.description = description || post.description;
    post.category = category || post.category;

    // 価格の更新（価格範囲チェック）
    if (price) {
      if (price < 1 || price > 10000) {
        return res.status(400).json({ message: '価格は1円から10000円の間で設定してください' });
      }
      post.price = price;
    }

    // 新しい画像がある場合は更新
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'minima/posts'
      });
      post.imageUrl = result.secure_url;
    }

    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
};

// 商品一覧の取得
exports.getPosts = async (req, res) => {
  try {
    const { page = 1, price = 'all', sort = 'newest', category } = req.query;
    const limit = 20;
    const skip = (page - 1) * limit;

    // クエリの構築
    const query = { status: 'active' };
    
    // 価格フィルター
    if (price !== 'all') {
      const [min, max] = price.split('-').map(Number);
      query.price = { $gte: min, $lte: max };
    }

    // カテゴリーフィルター
    if (category) {
      query.category = category;
    }

    // ソートの設定
    let sortOption = {};
    switch (sort) {
      case 'price-low':
        sortOption = { price: 1 };
        break;
      case 'price-high':
        sortOption = { price: -1 };
        break;
      case 'popular':
        sortOption = { views: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const posts = await Post.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate('seller', 'username avatar')
      .select('-description');

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      total,
      hasMore: total > skip + posts.length
    });
  } catch (error) {
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
};

// 商品の詳細取得
exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('seller', 'username avatar')
      .populate('likes', 'username');

    if (!post) {
      return res.status(404).json({ message: '商品が見つかりません' });
    }

    // 閲覧数をインクリメント
    post.views += 1;
    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
};

// いいね機能
exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: '商品が見つかりません' });
    }

    const index = post.likes.indexOf(req.user.id);
    if (index === -1) {
      post.likes.push(req.user.id);
    } else {
      post.likes.splice(index, 1);
    }

    await post.save();
    res.json({ likes: post.likes.length });
  } catch (error) {
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
};

