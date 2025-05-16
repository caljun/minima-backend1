const express = require("express");
const router = express.Router();
const { verifyToken } = require("../utils/authMiddleware");
const {
  getProfileImage,
  updateProfileImage,
  getProfileImageByEmail
} = require("../controllers/userController");

router.get("/user/profile-image", verifyToken, getProfileImage);
router.put("/user/profile-image", verifyToken, updateProfileImage);
router.get("/user/profile-image/:email", getProfileImageByEmail);

module.exports = router;
