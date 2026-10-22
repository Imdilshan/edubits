const express = require("express");
const router = express.Router();
const User = require("../models/User");

const protect = require("../middleware/authMiddleware");

router.get("/me/progress", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const progressObj = {};
    user.progress.forEach((val, key) => { progressObj[key] = val; });
    res.json({ progress: progressObj, totalScore: user.totalScore });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/me", protect, async (req, res) => {
  try {
    const update = {};
    if (typeof req.body.name === "string" && req.body.name.trim()) {
      update.name = req.body.name.trim().slice(0, 80);
    }
    if (typeof req.body.avatar === "string") {
      update.avatar = req.body.avatar;
    }

    const user = await User.findByIdAndUpdate(req.user._id, update, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) return res.status(404).json({ error: "User not found" });

    // Same safe shape the auth endpoints return - never send the whole document
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        onboardingCompleted: user.onboardingCompleted,
      },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;