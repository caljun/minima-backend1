const express = require("express");
const router = express.Router();
const { verifyToken } = require("../utils/authMiddleware");
const { createCheckoutSession } = require("../controllers/paymentController");

router.post("/payment/checkout", verifyToken, createCheckoutSession);

module.exports = router;
