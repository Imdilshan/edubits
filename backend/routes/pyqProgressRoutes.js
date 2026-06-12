const express  = require("express");
const router   = express.Router();
const auth     = require("../middleware/authMiddleware");
const Progress = require("../models/UserPYQProgress");

// GET /api/pyq-progress  — all progress docs for the logged-in user
router.get("/", auth, async (req, res) => {
  try {
    const docs = await Progress.find({ userId: req.user._id }).lean();
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/pyq-progress/:paperId  — upsert attempted + notes for one paper
router.put("/:paperId", auth, async (req, res) => {
  try {
    const { attempted, notes } = req.body;
    const doc = await Progress.findOneAndUpdate(
      { userId: req.user._id, paperId: req.params.paperId },
      { $set: { ...(attempted !== undefined && { attempted }), ...(notes !== undefined && { notes }) } },
      { upsert: true, new: true }
    );
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;