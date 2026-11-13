const express  = require("express");
const router   = express.Router();
const protect  = require("../middleware/authMiddleware");
const { uploadFor } = require("../middleware/upload");
const rateLimit = require("express-rate-limit");
const Resource = require("../models/Resource");
const cloudinary = require("../config/cloudinary");
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many upload attempts. Try again later." },
});

const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ success: false, error: "Admin access required." });
  }
  next();
};

const handleMulterError = (multerMw) => (req, res, next) => {
  multerMw(req, res, (err) => {
    if (!err) return next();
    const status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    return res.status(status).json({ success: false, message: status === 413 ? "File is too large" : "Upload rejected" });
  });
};

router.get("/", protect, async (req, res) => {
  try {
    const { subject, year, semester, paperKey, variant } = req.query;
    const filter = { isActive: true, resourceType: "pyqs" };
    if (subject)  filter.subject  = subject;
    if (year)     filter.year     = year;
    if (semester) filter.semester = Number(semester);
    if (paperKey) filter.paperKey = paperKey;
    if (variant)  filter.variant  = variant;

    const pyqss = await Resource.find(filter)
      .sort({ sortOrder: -1, createdAt: -1 })
      .select("-uploadedBy")
      .lean();

    res.json({ success: true, pyqss });
  } catch (err) {
    res.status(500).json({ success: false, message: "Request failed" });
  }
});

router.post(
  "/upload",
  protect,
  adminOnly,
  uploadLimiter,
  handleMulterError(uploadFor("pyqs").single("file")),
  async (req, res) => {
    try {
      const { title, subject, semester, year, paperTag, paperKey, variant } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ success: false, message: "No file received." });
      }
      if (!title) {
        await cloudinary.uploader.destroy(file.filename, { resource_type: file.resource_type || "image" }).catch(() => {});
        return res.status(400).json({ success: false, message: "title is required." });
      }

      // Validate variant
      if (variant && !["questions", "solution"].includes(variant)) {
        return res.status(400).json({ success: false, message: "variant must be 'questions' or 'solution'" });
      }

      const pyqs = await Resource.create({
        title,
        resourceType:           "pyqs",
        subject:                subject  || undefined,
        semester:               semester ? Number(semester) : undefined,
        year:                   year     || undefined,
        paperTag:               paperTag || undefined,
        paperKey:               paperKey || undefined,
        variant:                variant  || "questions",
        url:                    file.path,
        cloudinaryPublicId:     file.filename,
        cloudinaryResourceType: "raw",
        format:                 "pdf",
        fileSize:               file.size || undefined,
        uploadedBy:             req.user._id,
      });

      res.status(201).json({
        success: true,
        pyqs: {
          _id: pyqs._id,
          title: pyqs.title,
          subject: pyqs.subject,
          year: pyqs.year,
          semester: pyqs.semester,
          paperTag: pyqs.paperTag,
          paperKey: pyqs.paperKey,
          variant: pyqs.variant,
        },
      });

    } catch (err) {
      console.error("[pyqs upload] Request failed");
      res.status(500).json({ success: false, message: "Upload failed." });
    }
  }
);

router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const pyqs = await Resource.findById(req.params.id);
    if (!pyqs) return res.status(404).json({ success: false, message: "pyqs not found." });

    pyqs.isActive = false;
    await pyqs.save();

    await cloudinary.uploader
      .destroy(pyqs.cloudinaryPublicId, { resource_type: pyqs.cloudinaryResourceType })
      .catch(() => console.error("Cloudinary purge failed"));

    res.json({ success: true, message: "pyqs deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Request failed" });
  }
});

module.exports = router;
