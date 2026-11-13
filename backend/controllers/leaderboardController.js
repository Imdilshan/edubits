const User = require("../models/User");
const QuizAttempt = require("../models/QuizAttempt");

const getGlobalLeaderboard = async (req, res) => {
  try {
    const users = await User.find({}, "totalScore").sort({ totalScore: -1, _id: 1 }).lean();
    const userIndex = users.findIndex((user) => user._id.equals(req.user._id));
    res.json({
      rank: userIndex < 0 ? null : userIndex + 1,
      score: userIndex < 0 ? 0 : users[userIndex].totalScore,
      participantCount: users.length,
    });
  } catch (err) {
    res.status(500).json({ error: "Request failed" });
  }
};

const getTopicLeaderboard = async (req, res) => {
  try {
    const { topicId } = req.params;
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
      { $sort: { bestScore: -1, _id: 1 } },
      {
        $project: {
          _id: 1,
          score: "$bestScore",
          percentage: "$bestPercentage",
          attempts: 1,
        },
      },
    ]);

    const userIndex = results.findIndex((result) => result._id.equals(req.user._id));
    const current = userIndex < 0 ? null : results[userIndex];
    res.json({
      rank: current ? userIndex + 1 : null,
      score: current?.score ?? 0,
      percentage: current?.percentage ?? 0,
      attempts: current?.attempts ?? 0,
      participantCount: results.length,
    });
  } catch (err) {
    res.status(500).json({ error: "Request failed" });
  }
};

module.exports = { getGlobalLeaderboard, getTopicLeaderboard };
