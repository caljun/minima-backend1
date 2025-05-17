const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Post = require('../models/Post');
const User = require('../models/User');
const Order = require('../models/Order');

/**
 * Stripe Checkout セッション作成
 * 必須：name（商品名）, price（円）, postId（識別用）
 */
exports.createCheckoutSession = async (req, res) => {
  try {
    const { postId } = req.body;
    const userId = req.user.id;

    // 商品情報の取得
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: '商品が見つかりません' });
    }

    // 自分の商品は購入できない
    if (post.seller.toString() === userId) {
      return res.status(400).json({ message: '自分の商品は購入できません' });
    }

    // 売却済みチェック
    if (post.sold) {
      return res.status(400).json({ message: 'この商品は既に売却済みです' });
    }

    // 手数料の計算
    const commission = post.calculateCommission();
    const sellerAmount = post.calculateProfit();

    // Stripeセッションの作成
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: post.name,
              description: post.description,
              images: [post.imageUrl]
            },
            unit_amount: post.price
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      metadata: {
        postId,
        buyerId: userId,
        sellerId: post.seller.toString(),
        commission,
        sellerAmount
      }
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
};

// Webhook処理
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    try {
      // 商品の売却状態を更新
      const post = await Post.findById(session.metadata.postId);
      post.sold = true;
      post.buyer = session.metadata.buyerId;
      await post.save();

      // 注文の作成
      const order = new Order({
        post: session.metadata.postId,
        buyer: session.metadata.buyerId,
        seller: session.metadata.sellerId,
        amount: session.amount_total,
        commission: session.metadata.commission,
        sellerAmount: session.metadata.sellerAmount,
        paymentId: session.payment_intent,
        status: 'completed'
      });
      await order.save();

      // 売り手への支払い処理（Stripeアカウント連携が必要）
      // この部分は実装が必要です

      // 通知の送信
      // この部分は実装が必要です

    } catch (error) {
      console.error('Webhook error:', error);
      return res.status(500).end();
    }
  }

  res.json({ received: true });
};

// 取引履歴の取得
exports.getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type = 'all' } = req.query;

    let query = {};
    if (type === 'selling') {
      query.seller = userId;
    } else if (type === 'buying') {
      query.buyer = userId;
    } else {
      query.$or = [{ seller: userId }, { buyer: userId }];
    }

    const orders = await Order.find(query)
      .populate('post')
      .populate('buyer', 'username avatar')
      .populate('seller', 'username avatar')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
};

// 売上金の確認
exports.getEarnings = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await Order.aggregate([
      { $match: { seller: userId, status: 'completed' } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$amount' },
          totalCommission: { $sum: '$commission' },
          totalEarnings: { $sum: '$sellerAmount' }
        }
      }
    ]);

    const earnings = result[0] || {
      totalSales: 0,
      totalCommission: 0,
      totalEarnings: 0
    };

    res.json(earnings);
  } catch (error) {
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
};
