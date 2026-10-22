const mongoose = require("mongoose");

const userPYQProgressSchema = new mongoose.Schema(
  {
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    paperKey:  { type: String, required: true },
    attempted: { type: Boolean, default: false },
    notes:     { type: String, default: "" },
  },
  { timestamps: true }
);

userPYQProgressSchema.index({ userId: 1, paperKey: 1 }, { unique: true });

module.exports = mongoose.model("UserPYQProgress", userPYQProgressSchema);

