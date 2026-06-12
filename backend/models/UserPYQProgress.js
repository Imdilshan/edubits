const mongoose = require("mongoose");

const userPYQProgressSchema = new mongoose.Schema(
  {
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    paperId:   { type: String, required: true },
    attempted: { type: Boolean, default: false },
    notes:     { type: String, default: "" },
  },
  { timestamps: true }
);

userPYQProgressSchema.index({ userId: 1, paperId: 1 }, { unique: true });

module.exports = mongoose.model("UserPYQProgress", userPYQProgressSchema);

