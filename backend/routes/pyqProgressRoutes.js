const express  = require("express");
const router   = express.Router();
const auth     = require("../middleware/authMiddleware");
const Progress = require("../models/UserPYQProgress");

// GET /api/pyq-progress  — all progress docs for the logged-in user
router.get("/", auth, async (req, res) => {
  try {
    const docs = await Progress.find({ userId: req.user._id }).lean();
    res.json({ success: true, progress: docs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/pyq-progress/:paperKey  — upsert attempted + notes for one paper
router.put("/:paperKey", auth, async (req, res) => {
  try {
    const { attempted, notes } = req.body;
    const doc = await Progress.findOneAndUpdate(
      { userId: req.user._id, paperKey: req.params.paperKey },
      { $set: { ...(attempted !== undefined && { attempted }), ...(notes !== undefined && { notes }) } },
      { upsert: true, new: true }
    );
    res.json({ success: true, progress: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;