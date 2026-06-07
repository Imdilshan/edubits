const mongoose = require("mongoose");

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
      enum:     ["pyqs", "notes", "image", "thumbnail", "pdf", "other"],
    },

    subject: {
      type:  String,
      trim:  true,
      index: true,  
    },

    year: {
      type:  String,
      trim:  true,
      index: true,
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

module.exports = mongoose.model("Resource", resourceSchema);
