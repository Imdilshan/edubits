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
      type: Number,
      required: true,
      min: 0,
      max: 4,
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

questionSchema.index({ topicId: 1, difficulty: 1 });
module.exports = mongoose.model("Question", questionSchema);