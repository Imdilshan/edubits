const express = require("express");
const multer  = require("multer");
const jwt      = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const { randomBytes, timingSafeEqual } = require("crypto");
const router  = express.Router();
const passport = require("../config/passport");

const {
  register,
  login,
  getMe,
  uploadAvatar,
  updateProfile,
  completeOnboarding,
  deleteAccount,
  logout,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

const setAuthCookie = (res, user) => {
  const token = jwt.sign({ id: user._id, tokenVersion: user.tokenVersion || 0 }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.cookie("edubits_auth", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Try again later." },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many registration attempts. Try again later." },
});

const avatarUploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many upload attempts. Try again later." },
});

const getCookie = (req, name) => req.headers.cookie
  ?.split(";")
  .map((part) => part.trim())
  .find((part) => part.startsWith(`${name}=`))
  ?.slice(name.length + 1);

const oauthStateCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 10 * 60 * 1000,
});

const beginOAuth = (provider, options) => (req, res, next) => {
  const state = randomBytes(32).toString("base64url");
  res.cookie(`oauth_state_${provider}`, state, oauthStateCookieOptions());
  passport.authenticate(provider, { ...options, state, session: false })(req, res, next);
};

const verifyOAuthState = (provider) => (req, res, next) => {
  const cookieName = `oauth_state_${provider}`;
  const cookieState = getCookie(req, cookieName);
  const returnedState = req.query.state;
  const clearOptions = oauthStateCookieOptions();
  delete clearOptions.maxAge;
  res.clearCookie(cookieName, clearOptions);

  if (
    typeof cookieState !== "string" ||
    typeof returnedState !== "string" ||
    cookieState.length !== returnedState.length ||
    !timingSafeEqual(Buffer.from(cookieState), Buffer.from(returnedState))
  ) {
    return res.status(401).json({ error: "OAuth request could not be verified" });
  }
  next();
};


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

const validateAvatarSignature = (req, res, next) => {
  if (!req.file) return next();
  const buffer = req.file.buffer;
  const jpeg = buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  const png = buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (!jpeg && !png) return res.status(400).json({ message: "Image contents do not match JPG or PNG format" });
  next();
};

router.post("/register", registerLimiter, register);
router.post("/login",    loginLimiter, login);

router.get ("/me",           authMiddleware, getMe);
router.put ("/profile",      authMiddleware, updateProfile);
router.delete("/account",    authMiddleware, deleteAccount);
router.post("/onboarding/complete", authMiddleware, completeOnboarding);
router.post("/logout", authMiddleware, logout);
router.post(
  "/upload-avatar",
  authMiddleware,
  avatarUploadLimiter,
  avatarUpload.single("avatar"),
  validateAvatarSignature,
  uploadAvatar
);

// If a provider has no credentials configured, send the user back to the login
// page with a readable error instead of a 500 "Unknown authentication strategy".
router.use(["/google", "/github"], (req, res, next) => {
  const provider = req.baseUrl.split("/").pop() || req.path.split("/")[1];
  if (passport.enabledProviders?.has(provider)) return next();
  res.redirect(`${process.env.FRONTEND_URL}/login?error=${provider}_unavailable`);
});

router.get(
  "/google",
  loginLimiter,
  beginOAuth("google", { scope: ["profile", "email"] })
);
 
router.get(
  "/google/callback",
  loginLimiter,
  verifyOAuthState("google"),
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_failed`,
    session: false,
  }),
  (req, res) => {
    setAuthCookie(res, req.user);
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback`);
  }
);

// GitHub OAuth
router.get(
  "/github",
  loginLimiter,
  beginOAuth("github", { scope: ["user:email"] })
);

router.get(
  "/github/callback",
  loginLimiter,
  verifyOAuthState("github"),
  passport.authenticate("github", {
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=github_failed`,
    session: false,
  }),
  (req, res) => {
    setAuthCookie(res, req.user);
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback`);
  }
);

module.exports = router;
