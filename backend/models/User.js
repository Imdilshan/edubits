const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    minlength: [2, "Name must be at least 2 characters"],
    maxlength: [50, "Name too long"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
  },
  password: {
    type: String,
    select: false,
    minlength: [6, "Password must be at least 6 characters"],
  },
  avatarPublicId: {
    type: String,
    default: "",
    select: false,
  },
  googleId: {
    type: String,
    default: null,
  },
  githubId: {
    type: String,
    default: null,
  },
  avatar: {
    type: String,
    default: "",
  },
  totalScore: {
    type: Number,
    default: 0,
  },
  progress: {
    type: Map,
    of: new mongoose.Schema({
      completed: { type: Boolean, default: false },
      bestScore: { type: Number, default: 0 },
      attempts: { type: Number, default: 0 },
    }),
    default: {},
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  tokenVersion: {
    type: Number,
    default: 0,
  },
  onboardingCompleted: {
    type: Boolean,
    default: false,
  },
}, 
{ timestamps: true }
);

userSchema.methods.updateTopicProgress = function (topicId, score, passed) {
  const existing = this.progress.get(topicId) || {
    completed: false,
    bestScore: 0,
    attempts: 0,
  };

  this.progress.set(topicId, {
    completed: existing.completed || passed,
    bestScore: Math.max(existing.bestScore, score),
    attempts: existing.attempts + 1,
  });
};

module.exports = mongoose.model("User", userSchema);
