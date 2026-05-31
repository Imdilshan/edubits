// middleware/upload.js
// ─────────────────────────────────────────────────────────────
// Multer + multer-storage-cloudinary middleware factory.
//
// DESIGN DECISIONS:
//   • We export a factory function `uploadFor(resourceType)` instead of
//     a single upload instance because different resource types need
//     different Cloudinary folders, file-size limits, and MIME filters.
//   • `resource_type: "raw"` is required for PDFs — Cloudinary rejects
//     PDFs sent with resource_type "image" or "auto" in some plans.
//   • `access_mode: "public"` ensures the URL is always readable without
//     auth headers, which is what the browser iframe/embed needs.
//   • public_id uses a timestamp + sanitised filename so filenames stay
//     human-readable in the Cloudinary dashboard (easier to manage).
// ─────────────────────────────────────────────────────────────

const multer              = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary          = require("../config/cloudinary");

// ── Allowed MIME types per category ───────────────────────────
const MIME_RULES = {
  pdf:       ["application/pdf"],
  image:     ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  thumbnail: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  notes:     ["application/pdf"],
  pyqs:      ["application/pdf"],
  resources: ["application/pdf", "image/jpeg", "image/jpg", "image/png"],
};

// ── File-size limits per category (bytes) ─────────────────────
const SIZE_LIMITS = {
  pdf:       15 * 1024 * 1024,  // 15 MB
  image:      5 * 1024 * 1024,  //  5 MB
  thumbnail:  2 * 1024 * 1024,  //  2 MB
  notes:     15 * 1024 * 1024,
  pyqs:      15 * 1024 * 1024,
  resources: 15 * 1024 * 1024,
};

// ── Cloudinary folder mapping ──────────────────────────────────
// Mirrors the folder hierarchy requested:
//   edubits/notes, edubits/pyqs, edubits/images, etc.
const FOLDER_MAP = {
  pdf:       "edubits/pdfs",
  image:     "edubits/images",
  thumbnail: "edubits/thumbnails",
  notes:     "edubits/notes",
  pyqs:      "edubits/pyqs",
  resources: "edubits/resources",
  avatars:   "edubits/avatars",
};

// ── Cloudinary resource_type per category ─────────────────────
// PDFs and non-image files must use "raw"; images use "image".
const RESOURCE_TYPE_MAP = {
  pdf:       "raw",
  image:     "image",
  thumbnail: "image",
  notes:     "raw",
  pyqs:      "raw",
  resources: "auto",   // Cloudinary auto-detects pdf vs image
  avatars:   "image",
};

/**
 * Sanitise a filename so it is safe as a Cloudinary public_id.
 * Removes spaces, special chars (except hyphen/underscore/dot).
 */
const sanitiseName = (name) =>
  name
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9._\-]/g, "")
    .substring(0, 80); // Cloudinary public_id limit is ~220 chars; be conservative

/**
 * uploadFor(resourceType)
 *
 * Returns a configured multer middleware for the given resource type.
 *
 * @param {"pdf"|"image"|"thumbnail"|"notes"|"pyqs"|"resources"|"avatars"} resourceType
 * @returns multer middleware (use as upload.single("file") etc.)
 *
 * Usage in a route:
 *   const { uploadFor } = require("../middleware/upload");
 *   router.post("/upload", uploadFor("pyqs").single("file"), handler);
 */
const uploadFor = (resourceType) => {
  const folder       = FOLDER_MAP[resourceType]        || "edubits/misc";
  const resType      = RESOURCE_TYPE_MAP[resourceType] || "auto";
  const allowedMimes = MIME_RULES[resourceType]        || [];
  const sizeLimit    = SIZE_LIMITS[resourceType]       || 10 * 1024 * 1024;

  const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
      folder,
      resource_type: resType,
      access_mode:   "public",
      // e.g. "1717123456789-COA_Practice_0.pdf" — easy to recognise in dashboard
      public_id: `${Date.now()}-${sanitiseName(file.originalname)}`,
    }),
  });

  return multer({
    storage,
    limits: { fileSize: sizeLimit },
    fileFilter: (req, file, cb) => {
      if (allowedMimes.length === 0 || allowedMimes.includes(file.mimetype)) {
        return cb(null, true);
      }
      cb(
        new Error(
          `Invalid file type "${file.mimetype}" for ${resourceType}. ` +
          `Allowed: ${allowedMimes.join(", ")}`
        ),
        false
      );
    },
  });
};

// ── Avatar upload (kept for backward-compat with avatarUpload.js) ─
// Routes that already import avatarUpload can continue to do so;
// internally it just calls uploadFor("avatars").
const avatarUpload = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
      folder:        "edubits/avatars",
      resource_type: "image",
      allowed_formats: ["jpg", "jpeg", "png"],
      transformation: [{ width: 200, height: 200, crop: "fill", gravity: "face" }],
      // Include userId in public_id so old avatars are auto-replaced (same id → overwrite)
      public_id: `avatar_${req.user?.id || "unknown"}_${Date.now()}`,
    }),
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.mimetype)) {
      return cb(new Error("Only JPG/PNG images allowed for avatars"), false);
    }
    cb(null, true);
  },
});

module.exports = { uploadFor, avatarUpload };
