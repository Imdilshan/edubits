// models/Resource.js
// ─────────────────────────────────────────────────────────────
// Generic Resource model that replaces the narrower Pyq model
// and supports all resource types: PDFs, notes, PYQs, images, thumbnails.
//
// SCHEMA DECISIONS:
//   • `resourceType` enum drives UI filtering and folder logic — never
//     derive the type from the file extension at query time.
//   • `cloudinaryPublicId` is stored so we can call cloudinary.uploader.destroy()
//     cleanly on deletion. Without it we'd have to parse the URL, which is fragile.
//   • `fileSize` / `format` are stored for display ("2.4 MB · PDF") without
//     a round-trip to Cloudinary.
//   • `year`, `subject`, `semester` are optional but indexed because the
//     most common queries are "all PYQs for subject X in semester 3".
//   • `uploadedBy` references User so admins can see who uploaded what.
//     Null is acceptable for seeded/legacy content.
//   • `isActive` soft-deletes content; we never hard-delete Cloudinary
//     assets unless explicitly purging, to avoid broken links in user
//     bookmarks / shared links.
// ─────────────────────────────────────────────────────────────

const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    // ── Human-readable metadata ────────────────────────────
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

    // ── Classification ─────────────────────────────────────
    resourceType: {
      type:     String,
      required: true,
      enum:     ["pyqs", "notes", "image", "thumbnail", "pdf", "other"],
      // "pyq" → edubits/pyqs, "notes" → edubits/notes, etc.
    },

    subject: {
      type:  String,
      trim:  true,
      index: true,  // fast subject-based lookups
    },

    year: {
      type:  String,        // e.g. "1st Year", "2nd Year" — keep as string for flexibility
      trim:  true,
      index: true,
    },

    semester: {
      type: Number,
      min:  1,
      max:  8,
    },

    // "mst1", "mst2", "est1", "Practice 0" etc.
    paperTag: {
      type:  String,
      trim:  true,
    },

    // ── Cloudinary data ────────────────────────────────────
    // The URL the browser/iframe uses to display the file.
    url: {
      type:     String,
      required: [true, "Resource URL is required"],
    },

    // Used for deletion: cloudinary.uploader.destroy(cloudinaryPublicId, { resource_type })
    cloudinaryPublicId: {
      type:     String,
      required: true,
    },

    // "raw" for PDFs, "image" for images — needed for the destroy() call
    cloudinaryResourceType: {
      type:    String,
      enum:    ["image", "raw", "video", "auto"],
      default: "raw",
    },

    // Stored for display — e.g. "pdf", "jpg"
    format: {
      type: String,
    },

    // Bytes — lets us show "2.4 MB" without fetching from Cloudinary
    fileSize: {
      type: Number,
    },

    // ── Authorship ─────────────────────────────────────────
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "User",
      default: null,  // null for seeded/admin-uploaded content
    },

    // ── Soft delete ────────────────────────────────────────
    isActive: {
      type:    Boolean,
      default: true,
      index:   true,
    },

    // ── Optional ordering hint ─────────────────────────────
    // Higher = shown first within a subject/year group
    sortOrder: {
      type:    Number,
      default: 0,
    },
  },
  {
    timestamps: true,  // adds createdAt + updatedAt automatically
  }
);

// ── Compound indexes for the most common query patterns ────────
// "All active PYQs for 2nd Year, COA subject"
resourceSchema.index({ resourceType: 1, year: 1, subject: 1, isActive: 1 });
// "All active notes for semester 3"
resourceSchema.index({ resourceType: 1, semester: 1, isActive: 1 });

module.exports = mongoose.model("Resource", resourceSchema);
