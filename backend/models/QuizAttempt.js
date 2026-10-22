const mongoose = require("mongoose");
const attemptSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    maxPossibleScore: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    passed: {
      type: Boolean,
      required: true,
    },
    timeTakenSeconds: {
      type: Number,
      default: 0,
    },
    answers: [
      {
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
        selectedOptions: [{ type: Number }],
        isCorrect: Boolean,
        timeTakenSeconds: Number,
        scoreChange: Number,
      },
    ],
  },
  { timestamps: true }
);

attemptSchema.index({ topicId: 1, score: -1 });
attemptSchema.index({ userId: 1, createdAt: -1 });
attemptSchema.index({ sessionId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("QuizAttempt", attemptSchema);
