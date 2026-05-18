// const express = require("express");
// const router = express.Router();

// const { register, login, uploadAvatar } = require("../controllers/authController");
// const authMiddleware = require("../middleware/authMiddleware");
// const upload = require("../middleware/uploadMiddleware");
// const { getMe } = require("../controllers/authController");


// router.get("/me", authMiddleware, getMe);
// router.post("/register", register);
// router.post("/login", login);

// router.post(
//   "/upload-avatar",
//   authMiddleware,
//   upload.single("avatar"),
//   uploadAvatar
// );

// module.exports = router;

// backend/routes/authRoutes.js

const express = require("express");
const router  = express.Router();

const {
  register,
  login,
  uploadAvatar,
  getMe,
  updateProfile,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");
const avatarUpload  = require("../middleware/avatarUpload"); // ← new dedicated middleware

// Public
router.post("/register", register);
router.post("/login",    login);

// Protected
router.get("/me",           authMiddleware, getMe);
router.put("/profile",      authMiddleware, updateProfile);       // ← name / email / password
router.post(
  "/upload-avatar",
  authMiddleware,
  avatarUpload.single("avatar"),  // ← uses avatarUpload, not the PYQ one
  uploadAvatar
);

module.exports = router;