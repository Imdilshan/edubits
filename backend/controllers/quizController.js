const Question = require("../models/Question");
const QuizAttempt = require("../models/QuizAttempt");
const User = require("../models/User");
const Topic = require("../models/Topic");
const { pickRandom } = require("../algorithms/shuffle");
const { sortQuestionsByDifficulty } = require("../algorithms/sorting");
const { computeScore } = require("../algorithms/scoring");
const { isTopicUnlocked } = require("../algorithms/graph");

const startQuiz = async (req, res) => {
  try {
    const { topicId, count = 10, sortByDifficulty = false } = req.body;

    const topic = await Topic.findById(topicId).populate("prerequisites");
    if (!topic) return res.status(404).json({ error: "Topic not found" });

    const user = await User.findById(req.user._id);
    const prereqIds = topic.prerequisites.map((p) => p._id.toString());

    if (!isTopicUnlocked(topicId, prereqIds, user.progress)) {
      return res.status(403).json({ error: "Complete prerequisites first to unlock this topic" });
    }

    let allQuestions = await Question.find({ topicId }).lean();

    if (allQuestions.length === 0) {
      return res.status(404).json({ error: "No questions found for this topic" });
    }

    let selected = pickRandom(allQuestions, count);

    if (sortByDifficulty) {
      selected = sortQuestionsByDifficulty(selected);
    }

    res.json({
      topic: { id: topic._id, name: topic.name, icon: topic.icon },
      questions: selected,
      totalQuestions: selected.length,
      sessionId: `${req.user._id}_${topicId}_${Date.now()}`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const submitQuiz = async (req, res) => {
  try {
    const { topicId, answers, timeTakenSeconds = 0 } = req.body;

    if (!answers || answers.length === 0) {
      return res.status(400).json({ error: "No answers submitted" });
    }

    const questionIds = answers.map((a) => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } }).lean();
    const questionMap = new Map(questions.map((q) => [q._id.toString(), q]));

    const gradedAnswers = answers.map((ans) => {
      const question = questionMap.get(ans.questionId?.toString());
      const isCorrect = question
        ? ans.selectedOption === question.correctAnswer
        : false;

      return {
        questionId: ans.questionId,
        selectedOption: ans.selectedOption ?? -1,
        isCorrect,
        timedOut: ans.timedOut ?? false,
        timeTakenSeconds: ans.timeTakenSeconds ?? 0,
      };
    });

    const scoring = computeScore(gradedAnswers);

    const topic = await Topic.findById(topicId);
    const passed = scoring.percentage >= (topic?.passingScore ?? 60);

    const attempt = await QuizAttempt.create({
      userId: req.user._id,
      topicId,
      score: scoring.totalScore,
      maxPossibleScore: scoring.maxPossibleScore,
      percentage: scoring.percentage,
      passed,
      timeTakenSeconds,
      answers: scoring.history.map((h, i) => ({
        questionId: gradedAnswers[i].questionId,
        selectedOption: gradedAnswers[i].selectedOption,
        isCorrect: gradedAnswers[i].isCorrect,
        timeTakenSeconds: gradedAnswers[i].timeTakenSeconds,
        scoreChange: h.scoreChange,
      })),
    });

    const user = await User.findById(req.user._id);
    user.updateTopicProgress(topicId, scoring.totalScore, passed);

    user.totalScore = (user.totalScore || 0) + scoring.totalScore;
    await user.save();

    const enrichedHistory = scoring.history.map((h, i) => {
      const q = questionMap.get(gradedAnswers[i].questionId?.toString());
      return {
        ...h,
        correctAnswer: q?.correctAnswer,
        explanation: q?.explanation,
        questionText: q?.text,
      };
    });

    res.json({
      attemptId: attempt._id,
      score: scoring.totalScore,
      maxPossibleScore: scoring.maxPossibleScore,
      percentage: scoring.percentage,
      passed,
      correctCount: scoring.correctCount,
      wrongCount: scoring.wrongCount,
      history: enrichedHistory,
      newTotalScore: user.totalScore,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getHistory = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ userId: req.user._id })
      .populate("topicId", "name icon color")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.json({ attempts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { startQuiz, submitQuiz, getHistory };
