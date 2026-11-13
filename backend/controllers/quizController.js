const Question = require("../models/Question");
const QuizAttempt = require("../models/QuizAttempt");
const User = require("../models/User");
const Topic = require("../models/Topic");
const { pickRandom } = require("../algorithms/shuffle");
const { sortQuestionsByDifficulty } = require("../algorithms/sorting");
const { computeScore } = require("../algorithms/scoring");
const { isTopicUnlocked } = require("../algorithms/graph");
const jwt = require("jsonwebtoken");
const { randomUUID, createHmac } = require("crypto");

const sessionOwner = (userId) => createHmac("sha256", process.env.JWT_SECRET)
  .update(String(userId))
  .digest("hex");

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

    const requestedCount = Number(count);
    const questionCount = Number.isFinite(requestedCount) && requestedCount > 0
      ? Math.min(Math.floor(requestedCount), 50)
      : 10;
    let selected = pickRandom(allQuestions, questionCount);

    if (sortByDifficulty) {
      selected = sortQuestionsByDifficulty(selected);
    }

    const sessionId = randomUUID();
    const sessionToken = jwt.sign({
      type: "quiz",
      owner: sessionOwner(req.user._id),
      topicId: String(topic._id),
      sessionId,
      questionIds: selected.map((question) => String(question._id)),
    }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({
      topic: { id: topic._id, name: topic.name, icon: topic.icon },
      // Keep answer keys and explanations server-side until submission. Only
      // return fields needed to render and navigate the quiz.
      questions: selected.map((question) => ({
        _id: question._id,
        text: question.text,
        options: question.options,
        difficulty: question.difficulty,
        timeLimitSeconds: question.timeLimitSeconds,
        isMultiSelect: question.correctAnswer.length > 1,
      })),
      totalQuestions: selected.length,
      sessionToken,
    });
  } catch (err) {
    res.status(500).json({ error: "Request failed" });
  }
};

const submitQuiz = async (req, res) => {
  try {
    const { topicId, answers, timeTakenSeconds = 0, sessionToken } = req.body;

    if (!Array.isArray(answers) || answers.length === 0 || !sessionToken) {
      return res.status(400).json({ error: "No answers submitted" });
    }

    let session;
    try {
      session = jwt.verify(sessionToken, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    } catch {
      return res.status(401).json({ error: "Quiz session expired or invalid" });
    }

    if (
      session.type !== "quiz" ||
      session.owner !== sessionOwner(req.user._id) ||
      session.topicId !== String(topicId) ||
      !Array.isArray(session.questionIds)
    ) {
      return res.status(403).json({ error: "Quiz session does not match this submission" });
    }

    const questionIds = answers.map((answer) => String(answer?.questionId || ""));
    const allowedQuestionIds = new Set(session.questionIds);
    if (
      questionIds.length !== session.questionIds.length ||
      new Set(questionIds).size !== questionIds.length ||
      questionIds.some((id) => !allowedQuestionIds.has(id))
    ) {
      return res.status(400).json({ error: "Submitted answers do not match the quiz session" });
    }

    const alreadySubmitted = await QuizAttempt.exists({ sessionId: session.sessionId });
    if (alreadySubmitted) return res.status(409).json({ error: "This quiz was already submitted" });

    const questions = await Question.find({ _id: { $in: questionIds }, topicId: session.topicId }).lean();
    if (questions.length !== questionIds.length) {
      return res.status(400).json({ error: "Quiz questions are no longer available" });
    }
    const questionMap = new Map(questions.map((q) => [q._id.toString(), q]));

    const gradedAnswers = answers.map((ans) => {
      const question = questionMap.get(ans.questionId?.toString());
      let isCorrect = false;

      if (question) {
        const correctAnswers = question.correctAnswer || [];
        const userAnswers = Array.isArray(ans.selectedOptions)
          ? ans.selectedOptions
          : ans.selectedOption !== undefined
          ? [ans.selectedOption]
          : [];

        // All-or-nothing: user must select ALL correct answers and NO incorrect answers
        const correctSet = new Set(correctAnswers);
        const userSet = new Set(userAnswers);

        isCorrect =
          correctSet.size === userSet.size &&
          [...correctSet].every((idx) => userSet.has(idx));
      }

      return {
        questionId: ans.questionId,
        selectedOptions: Array.isArray(ans.selectedOptions)
          ? ans.selectedOptions
          : ans.selectedOption !== undefined
          ? [ans.selectedOption]
          : [],
        isCorrect,
        timedOut: ans.timedOut ?? false,
        timeTakenSeconds: ans.timeTakenSeconds ?? 0,
      };
    });

    const scoring = computeScore(gradedAnswers);

    const topic = await Topic.findById(topicId);
    const passed = scoring.percentage >= (topic?.passingScore ?? 60);

    const attempt = await QuizAttempt.create({
      sessionId: session.sessionId,
      userId: req.user._id,
      topicId,
      score: scoring.totalScore,
      maxPossibleScore: scoring.maxPossibleScore,
      percentage: scoring.percentage,
      passed,
      timeTakenSeconds,
      answers: scoring.history.map((h, i) => ({
        questionId: gradedAnswers[i].questionId,
        selectedOptions: gradedAnswers[i].selectedOptions,
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
        isMultiSelect: q?.isMultiSelect,
        selectedOptions: gradedAnswers[i].selectedOptions,
      };
    });

    res.json({
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
    if (err.code === 11000) {
      return res.status(409).json({ error: "This quiz was already submitted" });
    }
    res.status(500).json({ error: "Request failed" });
  }
};

const getHistory = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ userId: req.user._id })
      .populate({ path: "topicId", select: "name icon color -_id" })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.json({ attempts: attempts.map((attempt) => ({
      topic: attempt.topicId,
      score: attempt.score,
      percentage: attempt.percentage,
      passed: attempt.passed,
      timeTakenSeconds: attempt.timeTakenSeconds,
      answerCount: attempt.answers?.length || 0,
      createdAt: attempt.createdAt,
    })) });
  } catch (err) {
    res.status(500).json({ error: "Request failed" });
  }
};

module.exports = { startQuiz, submitQuiz, getHistory };
