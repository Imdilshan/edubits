const mongoose = require("mongoose");

const codePairSchema = new mongoose.Schema(
  {
    java: { type: String, default: "" },
    cpp: { type: String, default: "" },
  },
  { _id: false }
);

const programmingProblemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProgrammingTopic",
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    originalProblemUrl: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["todo", "in-progress", "done"],
      default: "todo",
    },
    starred: {
      type: Boolean,
      default: false,
    },
    solutionVideoUrl: {
      type: String,
      default: "",
    },
    blogUrl: {
      type: String,
      default: "",
    },
    fixCode: {
      type: codePairSchema,
      default: () => ({}),
    },
    proCode: {
      type: codePairSchema,
      default: () => ({}),
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProgrammingProblem", programmingProblemSchema);