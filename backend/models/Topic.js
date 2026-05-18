const mongoose = require("mongoose");
const topicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      default: "",
    },
    icon: {
      type: String,
      default: "📚",
    },
    color: {
      type: String,
      default: "#6366f1",
    },
    prerequisites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Topic",
      },
    ],
    position: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
    },
    passingScore: {
      type: Number,
      default: 60,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Topic", topicSchema);
