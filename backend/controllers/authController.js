// const User   = require("../models/User");
// const bcrypt = require("bcryptjs");
// const jwt    = require("jsonwebtoken");

// const generateToken = (userId) =>
//   jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

// exports.getMe = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);
//     res.json({
//       user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// exports.register = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     if (!name || !email || !password)
//       return res.status(400).json({ error: "All fields required" });
//     if (password.length < 6)
//       return res.status(400).json({ error: "Password must be at least 6 characters" });

//     const normalizedEmail = email.toLowerCase().trim();
//     if (await User.findOne({ email: normalizedEmail }))
//       return res.status(400).json({ error: "An account with this email already exists" });

//     const hashed = await bcrypt.hash(password, 10);
//     const user   = await User.create({ name, email: normalizedEmail, password: hashed });

//     const token = generateToken(user._id);
//     res.status(201).json({
//       token,
//       user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
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
//     if (!email || !password)
//       return res.status(400).json({ error: "Email and password required" });

//     const normalizedEmail = email.toLowerCase().trim();
//     const user = await User.findOne({ email: normalizedEmail });
//     if (!user || !(await bcrypt.compare(password, user.password)))
//       return res.status(400).json({ error: "Invalid email or password" });

//     const token = generateToken(user._id);
//     res.json({
//       token,
//       user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
//     });
//   } catch (err) {
//     res.status(500).json({ error: "Server error. Please try again." });
//   }
// };

// exports.uploadAvatar = async (req, res) => {
//   try {
//     if (!req.file)
//       return res.status(400).json({ message: "No file uploaded" });

//     const user = await User.findById(req.user.id);
//     if (!user)
//       return res.status(404).json({ message: "User not found" });
  
//     const avatarUrl = req.file.path;
//     user.avatar = avatarUrl;
//     await user.save();

//     res.json({
//       user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
//     });
//   } catch (err) {
//     console.error("UPLOAD AVATAR ERROR:", err);
//     res.status(500).json({ message: err.message || "Upload failed" });
//   }
// };

// exports.updateProfile = async (req, res) => {
//   try {
//     const { name, email, currentPassword, newPassword } = req.body;

//     const user = await User.findById(req.user.id);
//     if (!user) return res.status(404).json({ error: "User not found" });

//     if (name && name.trim().length >= 2)
//       user.name = name.trim();

//     if (email && email.toLowerCase().trim() !== user.email) {
//       const normalizedEmail = email.toLowerCase().trim();
//       if (await User.findOne({ email: normalizedEmail }))
//         return res.status(400).json({ error: "Email already in use" });
//       user.email = normalizedEmail;
//     }

//     if (newPassword) {
//       if (!currentPassword)
//         return res.status(400).json({ error: "Current password is required" });
//       if (!(await bcrypt.compare(currentPassword, user.password)))
//         return res.status(400).json({ error: "Current password is incorrect" });
//       if (newPassword.length < 6)
//         return res.status(400).json({ error: "New password must be at least 6 characters" });
//       user.password = await bcrypt.hash(newPassword, 10);
//     }

//     await user.save();
//     res.json({
//       user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
//     });
//   } catch (err) {
//     if (err.name === "ValidationError") {
//       const msg = Object.values(err.errors).map((e) => e.message).join(", ");
//       return res.status(400).json({ error: msg });
//     }
//     res.status(500).json({ error: "Server error. Please try again." });
//   }
// };


const User   = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ error: "All fields required" });
    if (password.length < 6)
      return res.status(400).json({ error: "Password must be at least 6 characters" });

    const normalizedEmail = email.toLowerCase().trim();
    if (await User.findOne({ email: normalizedEmail }))
      return res.status(400).json({ error: "An account with this email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user   = await User.create({ name, email: normalizedEmail, password: hashed });

    const token = generateToken(user._id);
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, role: user.role },
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      const msg = Object.values(err.errors).map((e) => e.message).join(", ");
      return res.status(400).json({ error: msg });
    }
    res.status(500).json({ error: "Server error. Please try again." });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ error: "Invalid email or password" });

    const token = generateToken(user._id);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ error: "Server error. Please try again." });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "No file uploaded" });

    const user = await User.findById(req.user.id);
    if (!user)
      return res.status(404).json({ message: "User not found" });
  
    const avatarUrl = req.file.path;
    user.avatar = avatarUrl;
    await user.save();

    res.json({
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, role: user.role },
    });
  } catch (err) {
    console.error("UPLOAD AVATAR ERROR:", err);
    res.status(500).json({ message: err.message || "Upload failed" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (name && name.trim().length >= 2)
      user.name = name.trim();

    if (email && email.toLowerCase().trim() !== user.email) {
      const normalizedEmail = email.toLowerCase().trim();
      if (await User.findOne({ email: normalizedEmail }))
        return res.status(400).json({ error: "Email already in use" });
      user.email = normalizedEmail;
    }

    if (newPassword) {
      if (!currentPassword)
        return res.status(400).json({ error: "Current password is required" });
      if (!(await bcrypt.compare(currentPassword, user.password)))
        return res.status(400).json({ error: "Current password is incorrect" });
      if (newPassword.length < 6)
        return res.status(400).json({ error: "New password must be at least 6 characters" });
      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();
    res.json({
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, role: user.role },
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      const msg = Object.values(err.errors).map((e) => e.message).join(", ");
      return res.status(400).json({ error: msg });
    }
    res.status(500).json({ error: "Server error. Please try again." });
  }
};