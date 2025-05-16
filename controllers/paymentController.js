const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Stripe Checkout セッション作成
 * 必須：name（商品名）, price（円）, postId（識別用）
 */
exports.createCheckoutSession = async (req, res) => {
  const { name, price, postId } = req.body;

  if (!name || !price || !postId) {
    return res.status(400).json({ message: "name・price・postId が必要です" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "jpy",
            product_data: { name },
            unit_amount: price * 100, // 円→銭
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/success.html?postId=${postId}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel.html`,
      metadata: {
        postId,
        name,
      },
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripeセッション作成エラー:", err);
    res.status(500).json({ message: "Stripeセッションの作成に失敗しました" });
  }
};
