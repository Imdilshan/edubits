// routes/resourceRoutes.js
// ─────────────────────────────────────────────────────────────
// RESTful routes for the Resource system.
//
// Access model:
//   GET  /api/resources        – public (any authenticated user can fetch)
//   GET  /api/resources/:id    – public
//   POST /api/resources/upload – admin only  (protected + adminOnly)
//   PATCH /api/resources/:id   – admin only
//   DELETE /api/resources/:id  – admin only
//
// The `uploadFor` middleware factory is called per-route with the
// appropriate resource type so each endpoint gets its own
// Cloudinary folder, MIME filter, and file-size limit.
//
// MULTER ERROR HANDLING:
//   multer throws synchronous errors (file too large, wrong MIME) as
//   Express errors. We catch them in the route-level error handler
//   below so they return clean JSON rather than crashing the process.
// ─────────────────────────────────────────────────────────────

const express  = require("express");
const router   = express.Router();
const protect  = require("../middleware/authMiddleware");
const { uploadFor } = require("../middleware/upload");
const {
  uploadResource,
  listResources,
  getResource,
  deleteResource,
  updateResource,
} = require("../controllers/resourceController");

// ── Admin guard ────────────────────────────────────────────────
const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ success: false, error: "Admin access required." });
  }
  next();
};

// ── Multer error wrapper ───────────────────────────────────────
// Returns a clean JSON error instead of an HTML 500 page when multer
// rejects a file (too large / wrong MIME type).
const withMulterErrors = (multerMiddleware) => (req, res, next) => {
  multerMiddleware(req, res, (err) => {
    if (!err) return next();
    // MulterError (e.g. LIMIT_FILE_SIZE) or our custom MIME error
    const status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    return res.status(status).json({ success: false, message: err.message });
  });
};

// ── Public / authenticated reads ──────────────────────────────
// GET /api/resources?type=pyq&subject=COA&year=2nd+Year
router.get("/", protect, listResources);

// GET /api/resources/:id
router.get("/:id", protect, getResource);

// ── Admin writes ───────────────────────────────────────────────
// POST /api/resources/upload?resourceType=pyqs  (or send it in the body)
// The route reads resourceType from the request body, not from the URL,
// so the same endpoint handles all types — the middleware adapts.
//
// Because we can't read req.body before multer runs, we use a
// pre-middleware that inspects the URL query param `resourceType`
// (set by the frontend) to choose the correct upload middleware.
router.post(
  "/upload",
  protect,
  adminOnly,
  // Dynamically pick the multer instance based on ?resourceType= query param.
  // Falls back to "resources" (permissive) if not specified.
  (req, res, next) => {
    const type = req.query.resourceType || "resources";
    const multerMiddleware = uploadFor(type).single("file");
    withMulterErrors(multerMiddleware)(req, res, next);
  },
  uploadResource
);

// PATCH /api/resources/:id  (metadata update, no file)
router.patch("/:id", protect, adminOnly, updateResource);

// DELETE /api/resources/:id
router.delete("/:id", protect, adminOnly, deleteResource);

module.exports = router;
