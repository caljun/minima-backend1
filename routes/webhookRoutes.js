const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const Purchase = require("../models/Purchase");
const Post = require("../models/Post");
const Notification = require("../models/Notification"); // ← 追加

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

router.post("/", async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook署名検証失敗:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const postId = session.metadata?.postId;
    const name = session.metadata?.name;
    const price = session.amount_total / 100;
    const buyerEmail = session.customer_email;

    if (postId && name && buyerEmail) {
      try {
        const post = await Post.findById(postId);
        if (!post) {
          return res.status(404).send("投稿が見つかりません");
        }

        // 購入履歴保存
        await Purchase.create({
          postId,
          name,
          price,
          buyerEmail,
          purchasedAt: new Date()
        });

        // 投稿をsoldに更新
        post.sold = true;
        await post.save();

        // ✅ 通知①：出品者へ
        await Notification.create({
          toEmail: post.email,
          fromEmail: buyerEmail,
          type: "purchase",
          postId
        });

        // ✅ 通知②：購入者へ
        await Notification.create({
          toEmail: buyerEmail,
          fromEmail: post.email,
          type: "bought",
          postId
        });

        console.log("✅ 購入情報・通知を保存しました");

      } catch (err) {
        console.error("購入処理中にエラー:", err);
      }
    }
  }

  res.status(200).send("OK");
});

module.exports = router;
