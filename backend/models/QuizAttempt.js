const mongoose = require("mongoose");
const attemptSchema = new mongoose.Schema(
  {
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
        selectedOption: Number,   
        isCorrect: Boolean,
        timeTakenSeconds: Number,
        scoreChange: Number, 
      },
    ],
    streakBonus: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

attemptSchema.index({ topicId: 1, score: -1 });
attemptSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("QuizAttempt", attemptSchema);
