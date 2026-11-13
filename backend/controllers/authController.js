const User   = require("../models/User");
const cloudinary = require("../config/cloudinary");
const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");
const Task = require("../models/Task");
const QuizAttempt = require("../models/QuizAttempt");
const UserPYQProgress = require("../models/UserPYQProgress");
const ProgrammingProgress = require("../features/programming/models/ProgrammingProgress");
const Resource = require("../models/Resource");
const { randomUUID } = require("crypto");

const generateToken = (userId, tokenVersion = 0) =>
  jwt.sign({ id: userId, tokenVersion }, process.env.JWT_SECRET, { expiresIn: "7d" });

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      user: { name: user.name, email: user.email, avatar: user.avatar, role: user.role, onboardingCompleted: user.onboardingCompleted },
    });
  } catch (err) {
    res.status(500).json({ message: "Request failed" });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ error: "All fields required" });
    if (password.length < 12)
      return res.status(400).json({ error: "Password must be at least 12 characters" });

    const normalizedEmail = email.toLowerCase().trim();
    if (await User.findOne({ email: normalizedEmail }))
      return res.status(400).json({ error: "An account with this email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user   = await User.create({ name, email: normalizedEmail, password: hashed });

    const token = generateToken(user._id, user.tokenVersion);
    res.cookie("edubits_auth", token, sessionCookieOptions());
    res.status(201).json({
      user: { name: user.name, email: user.email, avatar: user.avatar, role: user.role, onboardingCompleted: user.onboardingCompleted },
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
    const user = await User.findOne({ email: normalizedEmail }).select("+password");
    const hasBcryptPassword = typeof user?.password === "string" &&
      /^\$2[abxy]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(user.password);
    if (!hasBcryptPassword || !(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ error: "Invalid email or password" });

    const token = generateToken(user._id, user.tokenVersion);
    res.cookie("edubits_auth", token, sessionCookieOptions());
    res.json({
      user: { name: user.name, email: user.email, avatar: user.avatar, role: user.role, onboardingCompleted: user.onboardingCompleted },
    });
  } catch (err) {
    res.status(500).json({ error: "Server error. Please try again." });
  }
};

exports.uploadAvatar = async (req, res) => {
  let newAvatarPublicId;
  try {
    if (!req.file)
      return res.status(400).json({ message: "No file uploaded" });

    const user = await User.findById(req.user.id).select("+avatarPublicId");
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const previousAvatarPublicId = user.avatarPublicId;
    newAvatarPublicId = randomUUID();

    // Stream the in-memory file to Cloudinary using an opaque public ID.
    const uploaded = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "edubits/avatars",
          public_id: newAvatarPublicId,
          overwrite: true,
          resource_type: "image",
          transformation: [{ width: 256, height: 256, crop: "fill", gravity: "face" }],
        },
        (err, result) => (err ? reject(err) : resolve(result))
      );
      stream.end(req.file.buffer);
    });

    user.avatar = uploaded.secure_url;
    user.avatarPublicId = uploaded.public_id;
    await user.save();
    if (previousAvatarPublicId) {
      await cloudinary.uploader.destroy(previousAvatarPublicId, { resource_type: "image" }).catch(() => {});
    }

    res.json({
      user: { name: user.name, email: user.email, avatar: user.avatar, role: user.role },
    });
  } catch (err) {
    if (newAvatarPublicId) {
      await cloudinary.uploader.destroy(newAvatarPublicId, { resource_type: "image" }).catch(() => {});
    }
    console.error("Avatar upload failed");
    res.status(500).json({ message: "Upload failed" });
  }
};

exports.completeOnboarding = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.onboardingCompleted = true;
    await user.save();

    res.json({
      user: { name: user.name, email: user.email, avatar: user.avatar, role: user.role, onboardingCompleted: user.onboardingCompleted },
    });
  } catch (err) {
    res.status(500).json({ error: "Server error. Please try again." });
  }
};

exports.logout = async (req, res) => {
  try {
    await User.updateOne({ _id: req.user._id }, { $inc: { tokenVersion: 1 } });
    clearSessionCookie(res);
    return res.json({ message: "Logged out" });
  } catch (err) {
    console.error("[logout] Token revocation failed");
    return res.status(500).json({ error: "Logout failed. Please try again." });
  }
};

function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

function clearSessionCookie(res) {
  const options = sessionCookieOptions();
  delete options.maxAge;
  res.clearCookie("edubits_auth", options);
}

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select("+password");
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
      const hasBcryptPassword = typeof user.password === "string" &&
        /^\$2[abxy]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(user.password);
      if (hasBcryptPassword) {
        if (!currentPassword)
          return res.status(400).json({ error: "Current password is required" });
        if (!(await bcrypt.compare(currentPassword, user.password)))
          return res.status(400).json({ error: "Current password is incorrect" });
      }
      if (newPassword.length < 12)
        return res.status(400).json({ error: "New password must be at least 12 characters" });
      user.password = await bcrypt.hash(newPassword, 10);
      user.tokenVersion = (user.tokenVersion || 0) + 1;
    }

    await user.save();
    if (newPassword) {
      const token = generateToken(user._id, user.tokenVersion);
      res.cookie("edubits_auth", token, sessionCookieOptions());
    }
    res.json({
      user: { name: user.name, email: user.email, avatar: user.avatar, role: user.role },
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      const msg = Object.values(err.errors).map((e) => e.message).join(", ");
      return res.status(400).json({ error: msg });
    }
    res.status(500).json({ error: "Server error. Please try again." });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("+password +avatarPublicId");
    if (!user) return res.status(404).json({ error: "User not found" });

    if (req.body.confirmEmail !== user.email) {
      return res.status(400).json({ error: "Enter your account email to confirm deletion" });
    }
    const hasBcryptPassword = typeof user.password === "string" &&
      /^\$2[abxy]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(user.password);
    if (hasBcryptPassword && !(await bcrypt.compare(req.body.currentPassword || "", user.password))) {
      return res.status(403).json({ error: "Current password is incorrect" });
    }

    const userId = user._id;
    const avatarPublicId = user.avatarPublicId || (
      user.avatar?.includes("res.cloudinary.com") ? `edubits/avatars/avatar_${userId}` : ""
    );
    if (avatarPublicId) {
      try {
        await cloudinary.uploader.destroy(avatarPublicId, { resource_type: "image" });
      } catch (err) {
        console.error("[deleteAccount] Avatar cleanup failed");
        return res.status(503).json({ error: "Could not remove your avatar. Please try again later." });
      }
    }

    await Promise.all([
      Task.deleteMany({ userId }),
      QuizAttempt.deleteMany({ userId }),
      UserPYQProgress.deleteMany({ userId }),
      ProgrammingProgress.deleteMany({ user: userId }),
      Resource.updateMany({ uploadedBy: userId }, { $unset: { uploadedBy: 1 } }),
    ]);

    await User.deleteOne({ _id: userId });

    clearSessionCookie(res);
    return res.json({ message: "Account and associated personal data deleted" });
  } catch (err) {
    console.error("[deleteAccount] Account deletion failed");
    return res.status(500).json({ error: "Account deletion failed. Please try again." });
  }
};
