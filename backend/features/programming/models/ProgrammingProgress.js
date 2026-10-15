const mongoose = require("mongoose");

const programmingProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProgrammingProblem",
      required: true,
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
  },
  { timestamps: true }
);

programmingProgressSchema.index({ user: 1, problem: 1 }, { unique: true });
module.exports = mongoose.model("ProgrammingProgress", programmingProgressSchema);