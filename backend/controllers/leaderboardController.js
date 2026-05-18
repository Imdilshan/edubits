const User = require("../models/User");
const QuizAttempt = require("../models/QuizAttempt");
const { sortLeaderboard } = require("../algorithms/sorting");

const getGlobalLeaderboard = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const users = await User.find({}, "name totalScore avatar createdAt").lean();
    const sorted = sortLeaderboard(
      users.map((u) => ({ ...u, score: u.totalScore }))
    ).slice(0, limit);

    const ranked = sorted.map((u, i) => ({ ...u, rank: i + 1 }));

    res.json({ leaderboard: ranked });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getTopicLeaderboard = async (req, res) => {
  try {
    const { topicId } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    const results = await QuizAttempt.aggregate([
      { $match: { topicId: require("mongoose").Types.ObjectId(topicId) } },
      { $sort: { score: -1 } },
      {
        $group: {
          _id: "$userId",
          bestScore: { $max: "$score" },
          attempts: { $sum: 1 },
          bestPercentage: { $max: "$percentage" },
        },
      },
      { $sort: { bestScore: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          name: "$user.name",
          score: "$bestScore",
          percentage: "$bestPercentage",
          attempts: 1,
        },
      },
    ]);

    const ranked = results.map((r, i) => ({ ...r, rank: i + 1 }));
    res.json({ leaderboard: ranked });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getGlobalLeaderboard, getTopicLeaderboard };
