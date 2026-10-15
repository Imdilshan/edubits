const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
    },
    text: {
      type: String,
      required: [true, "Question text is required"],
      trim: true,
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => arr.length >= 2 && arr.length <= 5,
        message: "Between 2 and 5 options are required",
      },
    },
    correctAnswer: {
      type: [Number],
      required: true,
      validate: {
        validator: function (arr) {
          // Must have at least one correct answer
          if (!Array.isArray(arr) || arr.length === 0) return false;
          // Each index must be valid (0-4) and unique
          const unique = new Set(arr);
          if (unique.size !== arr.length) return false;
          return arr.every((idx) => Number.isInteger(idx) && idx >= 0 && idx <= 4);
        },
        message: "correctAnswer must be a non-empty array of unique indices (0-4)",
      },
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    explanation: {
      type: String,
      default: "",
    },
    tags: [String],
    timeLimitSeconds: {
      type: Number,
      default: 30,
    },
  },
  { timestamps: true }
);

// Virtual to check if question has multiple correct answers
questionSchema.virtual("isMultiSelect").get(function () {
  return this.correctAnswer && this.correctAnswer.length > 1;
});

// Ensure virtuals are included in JSON
questionSchema.set("toJSON", { virtuals: true });
questionSchema.set("toObject", { virtuals: true });

questionSchema.index({ topicId: 1, difficulty: 1 });
module.exports = mongoose.model("Question", questionSchema);