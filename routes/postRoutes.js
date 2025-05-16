const express = require("express");
const router = express.Router();
const { verifyToken } = require("../utils/authMiddleware");
const {
  createPost,
  getOwnPosts,
  getPostById,
  deletePost,
  getComments,
  addComment,
  getPostsByUser,
  getPostsByEmail,
  updatePost
} = require("../controllers/postController");

const multer = require("multer");
const { storage } = require("../utils/cloudinary");
const upload = multer({ storage });

router.post("/posts", verifyToken, upload.single("image"), createPost);
router.get("/posts/me", verifyToken, getOwnPosts);
router.get("/posts/:id", getPostById);
router.delete("/posts/:id", verifyToken, deletePost);
router.get("/posts/:id/comments", getComments);
router.post("/posts/:id/comments", verifyToken, addComment);
router.get("/posts/user/:username", getPostsByUser);
router.get("/posts/user-email/:email", getPostsByEmail);
router.put("/posts/:id", verifyToken, upload.single("image"), updatePost);

module.exports = router;

