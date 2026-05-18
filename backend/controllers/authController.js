// const User = require("../models/User");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");

// const generateToken = (userId) =>
//   jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

// exports.getMe = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);

//     res.json({
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         avatar: user.avatar,
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// const uploadAvatar = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ message: "No file uploaded" });
//     }

//     const user = await User.findById(req.user.id);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     user.avatar = req.file.path;
//     await user.save();

//     res.json({ user });

//   } catch (err) {
//     console.error("UPLOAD AVATAR ERROR:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };


// exports.register = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;
//     if (!name || !email || !password) {
//       return res.status(400).json({ error: "All fields required" });
//     }
//     if (password.length < 6) {
//       return res.status(400).json({ error: "Password must be at least 6 characters" });
//     }

//     const normalizedEmail = email.toLowerCase().trim();
//     const existingUser = await User.findOne({ email: normalizedEmail });
//     if (existingUser) {
//       return res.status(400).json({ error: "An account with this email already exists" });
//     }

//     const hashed = await bcrypt.hash(password, 10);
//     const user = await User.create({ name, email: normalizedEmail, password: hashed });

//     const token = generateToken(user._id);
//     res.status(201).json({
//       token,
//       user: { 
//         id: user._id, 
//         name: user.name, 
//         email: user.email,
//         avatar: user.avatar,
//       },
//     });
//   } catch (err) {
//     if (err.name === "ValidationError") {
//       const msg = Object.values(err.errors).map((e) => e.message).join(", ");
//       return res.status(400).json({ error: msg });
//     }
//     res.status(500).json({ error: "Server error. Please try again." });
//   }
// };

// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password) {
//       return res.status(400).json({ error: "Email and password required" });
//     }

//     const normalizedEmail = email.toLowerCase().trim();
//     const user = await User.findOne({ email: normalizedEmail });
//     if (!user) return res.status(400).json({ error: "Invalid email or password" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ error: "Invalid email or password" });

//     const token = generateToken(user._id);
//     res.json({
//       token,
//       user: { 
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         avatar: user.avatar,
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ error: "Server error. Please try again." });
//   }
// };

// exports.uploadAvatar = uploadAvatar;

// backend/controllers/authController.js

const User   = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

// ── GET /api/auth/me ─────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      user: {
        id:     user._id,
        name:   user.name,
        email:  user.email,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/auth/register ──────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ error: "All fields required" });

    if (password.length < 6)
      return res.status(400).json({ error: "Password must be at least 6 characters" });

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser    = await User.findOne({ email: normalizedEmail });
    if (existingUser)
      return res.status(400).json({ error: "An account with this email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user   = await User.create({ name, email: normalizedEmail, password: hashed });

    const token = generateToken(user._id);
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      const msg = Object.values(err.errors).map((e) => e.message).join(", ");
      return res.status(400).json({ error: msg });
    }
    res.status(500).json({ error: "Server error. Please try again." });
  }
};

// ── POST /api/auth/login ─────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user)
      return res.status(400).json({ error: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ error: "Invalid email or password" });

    const token = generateToken(user._id);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
    });
  } catch (err) {
    res.status(500).json({ error: "Server error. Please try again." });
  }
};

// ── POST /api/auth/upload-avatar ─────────────────────────────────────────────
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "No file uploaded" });

    const user = await User.findById(req.user.id);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    // req.file.path is the Cloudinary secure URL when using CloudinaryStorage
    user.avatar = req.file.path;
    await user.save();

    res.json({
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
    });
  } catch (err) {
    console.error("UPLOAD AVATAR ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── PUT /api/auth/profile ────────────────────────────────────────────────────
// Allows updating name, email, and/or password
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // ── Name ──────────────────────────────────────────────────────────────────
    if (name && name.trim().length >= 2) {
      user.name = name.trim();
    }

    // ── Email ─────────────────────────────────────────────────────────────────
    if (email && email.trim() !== user.email) {
      const normalizedEmail = email.toLowerCase().trim();
      const taken = await User.findOne({ email: normalizedEmail });
      if (taken) return res.status(400).json({ error: "Email already in use" });
      user.email = normalizedEmail;
    }

    // ── Password ──────────────────────────────────────────────────────────────
    if (newPassword) {
      if (!currentPassword)
        return res.status(400).json({ error: "Current password is required to set a new one" });

      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match)
        return res.status(400).json({ error: "Current password is incorrect" });

      if (newPassword.length < 6)
        return res.status(400).json({ error: "New password must be at least 6 characters" });

      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    res.json({
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      const msg = Object.values(err.errors).map((e) => e.message).join(", ");
      return res.status(400).json({ error: msg });
    }
    res.status(500).json({ error: "Server error. Please try again." });
  }
};