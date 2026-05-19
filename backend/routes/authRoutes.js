const express = require("express");
const multer  = require("multer");
const path    = require("path");
const fs      = require("fs");
const jwt      = require("jsonwebtoken");
const router  = express.Router();
const passport = require("../config/passport");

const {
  register,
  login,
  getMe,
  uploadAvatar,
  updateProfile,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

// ── Disk storage: saves avatar to uploads/avatars/<userId>.<ext> ──────────────
// Using diskStorage avoids all multer v2 stream/buffer confusion entirely.
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../uploads/avatars");
    // Create folder if it doesn't exist
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    // One file per user — overwrites previous avatar automatically
    cb(null, `avatar_${req.user.id}${ext}`);
  },
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (req, file, cb) => {
    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.mimetype)) {
      return cb(new Error("Only JPG/PNG images are allowed"), false);
    }
    cb(null, true);
  },
});

// ── Public ───────────────────────────────────────────────────────────────────
router.post("/register", register);
router.post("/login",    login);

// ── Protected ────────────────────────────────────────────────────────────────
router.get ("/me",           authMiddleware, getMe);
router.put ("/profile",      authMiddleware, updateProfile);
router.post(
  "/upload-avatar",
  authMiddleware,
  avatarUpload.single("avatar"),  // req.file.path = absolute disk path
  uploadAvatar
);

// ── Google OAuth ──────────────────────────────────────────────────────────────
// Step 1: redirect user to Google consent screen
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);
 
// Step 2: Google redirects back here
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_failed`,
    session: false,
  }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
 
    const user = {
      id:     req.user._id,
      name:   req.user.name,
      email:  req.user.email,
      avatar: req.user.avatar,
    };
 
    // Pass token + user to frontend via query params; frontend stores them
    const params = new URLSearchParams({ token, user: JSON.stringify(user) });
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?${params}`);
  }
);

module.exports = router;