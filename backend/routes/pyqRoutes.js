// routes/pyqRoutes.js  (UPDATED — now backed by Resource model)
// ─────────────────────────────────────────────────────────────
// Replaces the original pyqRoutes.js.
// The /upload endpoint now uses the new `uploadFor` middleware factory
// so PYQ PDFs land in edubits/pyqs in Cloudinary and are stored as
// Resource documents with resourceType: "pyq".
//
// This route is mounted at /api/pyqs in server.js — no change needed there.
// ─────────────────────────────────────────────────────────────

const express  = require("express");
const router   = express.Router();
const protect  = require("../middleware/authMiddleware");
const { uploadFor } = require("../middleware/upload");
const Resource = require("../models/Resource");
const cloudinary = require("../config/cloudinary");

// ── Admin guard (inline for this file) ────────────────────────
const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ success: false, error: "Admin access required." });
  }
  next();
};

// ── Multer error wrapper ───────────────────────────────────────
const handleMulterError = (multerMw) => (req, res, next) => {
  multerMw(req, res, (err) => {
    if (!err) return next();
    const status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    return res.status(status).json({ success: false, message: err.message });
  });
};

// ── GET /api/pyqs ──────────────────────────────────────────────
// Returns all active PYQs, optionally filtered by subject / year / semester.
router.get("/", protect, async (req, res) => {
  try {
    const { subject, year, semester } = req.query;
    const filter = { isActive: true, resourceType: "pyq" };
    if (subject)  filter.subject  = subject;
    if (year)     filter.year     = year;
    if (semester) filter.semester = Number(semester);

    const pyqs = await Resource.find(filter)
      .sort({ sortOrder: -1, createdAt: -1 })
      .lean();

    res.json({ success: true, pyqs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/pyqs/upload ─────────────────────────────────────
// Body (multipart/form-data):
//   file     – PDF file
//   title    – e.g. "COA Practice 0"
//   subject  – e.g. "COA"
//   semester – number
//   year     – e.g. "2nd Year"
//   paperTag – e.g. "mst1", "est1", "Practice 0"
router.post(
  "/upload",
  protect,
  adminOnly,
  handleMulterError(uploadFor("pyqs").single("file")),
  async (req, res) => {
    try {
      const { title, subject, semester, year, paperTag } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ success: false, message: "No file received." });
      }
      if (!title) {
        await cloudinary.uploader.destroy(file.filename, { resource_type: "raw" }).catch(() => {});
        return res.status(400).json({ success: false, message: "title is required." });
      }

      const pyq = await Resource.create({
        title,
        resourceType:           "pyq",
        subject:                subject  || undefined,
        semester:               semester ? Number(semester) : undefined,
        year:                   year     || undefined,
        paperTag:               paperTag || undefined,
        url:                    file.path,
        cloudinaryPublicId:     file.filename,
        cloudinaryResourceType: "raw",
        format:                 "pdf",
        fileSize:               file.size || undefined,
        uploadedBy:             req.user._id,
      });

      res.status(201).json({ success: true, pyq });

    } catch (err) {
      console.error("[pyq upload]", err);
      res.status(500).json({ success: false, message: "Upload failed." });
    }
  }
);

// ── DELETE /api/pyqs/:id ───────────────────────────────────────
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const pyq = await Resource.findById(req.params.id);
    if (!pyq) return res.status(404).json({ success: false, message: "PYQ not found." });

    pyq.isActive = false;
    await pyq.save();

    await cloudinary.uploader
      .destroy(pyq.cloudinaryPublicId, { resource_type: pyq.cloudinaryResourceType })
      .catch((e) => console.error("Cloudinary purge failed:", e.message));

    res.json({ success: true, message: "PYQ deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
