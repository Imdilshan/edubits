const express = require("express");
const router = express.Router();
const { getGlobalLeaderboard, getTopicLeaderboard } = require("../controllers/leaderboardController");

const protect = require("../middleware/authMiddleware");

router.get("/",              protect, getGlobalLeaderboard);
router.get("/topic/:topicId", protect, getTopicLeaderboard);

module.exports = router;