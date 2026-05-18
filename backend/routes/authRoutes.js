// // backend/routes/authRoutes.js

// const express = require("express");
// const multer  = require("multer");
// const router  = express.Router();

// const {
//   register,
//   login,
//   getMe,
//   uploadAvatar,
//   updateProfile,
// } = require("../controllers/authController");

// const authMiddleware = require("../middleware/authMiddleware");

// // multer v2 memoryStorage — file arrives as req.file.stream (AsyncIterable)
// // The controller reads it with `for await` into a Buffer before sending to Cloudinary
// const memUpload = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
//   fileFilter: (req, file, cb) => {
//     if (!["image/jpeg", "image/png", "image/jpg"].includes(file.mimetype)) {
//       return cb(new Error("Only JPG/PNG images are allowed"), false);
//     }
//     cb(null, true);
//   },
// });

// // ── Public ───────────────────────────────────────────────────────────────────
// router.post("/register", register);
// router.post("/login",    login);

// // ── Protected ────────────────────────────────────────────────────────────────
// router.get ("/me",            authMiddleware, getMe);
// router.put ("/profile",       authMiddleware, updateProfile);
// router.post(
//   "/upload-avatar",
//   authMiddleware,
//   memUpload.single("avatar"),
//   uploadAvatar
// );

// module.exports = router;

// backend/routes/authRoutes.js

const express = require("express");
const multer  = require("multer");
const path    = require("path");
const fs      = require("fs");
const router  = express.Router();

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

module.exports = router;