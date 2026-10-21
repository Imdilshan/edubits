const mongoose = require("mongoose");

// Controlled values for year and subject to ensure reliable navigation
const YEAR_VALUES = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

const SUBJECT_VALUES = [
  // 1st Year
  "Mathematics-I",
  "Digital Electronics",
  "Engineering Physics",
  "LTPS",
  "Biology",
  // 2nd Year
  "COA",
  "DBMS",
  "ADSA",
  "Java",
  "Software Engineering",
  "Operating System",
  "Machine Learning",
  "Probability & Statistics",
  // 3rd Year
  "PBL_Java",
  "Computer Networks",
  "Probability & Statistics",
  "Web Development Fundamentals",
  "Business Analytics",
  // 4th Year
  "Ethical Hacking",
  // Playlist subjects (can overlap)
  "Mathematics-II",
  "OOPS Using Java",
];

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type:     String,
      required: [true, "Title is required"],
      trim:     true,
      maxlength: [200, "Title is too long"],
    },

    description: {
      type:    String,
      trim:    true,
      default: "",
    },

    resourceType: {
      type:     String,
      required: true,
      enum:     ["pyqs", "notes", "image", "thumbnail", "pdf", "other", "playlist"],
    },

    subject: {
      type:  String,
      trim:  true,
      index: true,
      enum: SUBJECT_VALUES,
    },

    year: {
      type:  String,
      trim:  true,
      index: true,
      enum: YEAR_VALUES,
    },

    semester: {
      type: Number,
      min:  1,
      max:  8,
    },

    paperTag: {
      type:  String,
      trim:  true,
    },

    // Shared key linking the two PDFs of a paper (questions-only; questions+solution)
    paperKey: {
      type: String,
      trim: true,
      index: true,
    },

    // Variant marker: "questions" or "solution"
    variant: {
      type: String,
      enum: ["questions", "solution"],
      default: "questions",
    },

    url: {
      type:     String,
      required: [true, "Resource URL is required"],
    },

    cloudinaryPublicId: {
      type:     String,
      required: true,
    },

    cloudinaryResourceType: {
      type:    String,
      enum:    ["image", "raw", "video", "auto"],
      default: "raw",
    },

    format: {
      type: String,
    },

    fileSize: {
      type: Number,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "User",
      default: null,
    },

    isActive: {
      type:    Boolean,
      default: true,
      index:   true,
    },

    sortOrder: {
      type:    Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

resourceSchema.index({ resourceType: 1, year: 1, subject: 1, isActive: 1 });
resourceSchema.index({ resourceType: 1, semester: 1, isActive: 1 });
resourceSchema.index({ paperKey: 1, variant: 1 });

module.exports = mongoose.model("Resource", resourceSchema);
