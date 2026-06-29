const mongoose = require("mongoose");

const programmingTopicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    parentTopic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProgrammingTopic",
      default: null,
    },
    position: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProgrammingTopic", programmingTopicSchema);