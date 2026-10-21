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
  completeOnboarding,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");


// Keep the file in memory; the controller streams it to Cloudinary.
const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (req, file, cb) => {
    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.mimetype)) {
      const err = new Error("Only JPG/PNG images are allowed");
      err.status = 400;
      return cb(err, false);
    }
    cb(null, true);
  },
});

router.post("/register", register);
router.post("/login",    login);

router.get ("/me",           authMiddleware, getMe);
router.put ("/profile",      authMiddleware, updateProfile);
router.post("/onboarding/complete", authMiddleware, completeOnboarding);
router.post(
  "/upload-avatar",
  authMiddleware,
  avatarUpload.single("avatar"),
  uploadAvatar
);

// If a provider has no credentials configured, send the user back to the login
// page with a readable error instead of a 500 "Unknown authentication strategy".
router.use(["/google", "/github", "/microsoft"], (req, res, next) => {
  const provider = req.baseUrl.split("/").pop() || req.path.split("/")[1];
  if (passport.enabledProviders?.has(provider)) return next();
  res.redirect(`${process.env.FRONTEND_URL}/login?error=${provider}_unavailable`);
});

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);
 
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
      role: req.user.role,
      onboardingCompleted: req.user.onboardingCompleted,
    };
  
    const params = new URLSearchParams({ token, user: JSON.stringify(user) });
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?${params}`);
  }
);

// GitHub OAuth
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"], session: false })
);

router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=github_failed`,
    session: false,
  }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    const user = {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar,
      role: req.user.role,
      onboardingCompleted: req.user.onboardingCompleted,
    };
    const params = new URLSearchParams({ token, user: JSON.stringify(user) });
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?${params}`);
  }
);

// Microsoft OAuth
router.get(
  "/microsoft",
  passport.authenticate("microsoft", { scope: ["user.read"], session: false })
);

router.get(
  "/microsoft/callback",
  passport.authenticate("microsoft", {
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=microsoft_failed`,
    session: false,
  }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    const user = {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar,
      role: req.user.role,
      onboardingCompleted: req.user.onboardingCompleted,
    };
    const params = new URLSearchParams({ token, user: JSON.stringify(user) });
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?${params}`);
  }
);

module.exports = router;