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

const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ success: false, error: "Admin access required." });
  }
  next();
};

const withMulterErrors = (multerMiddleware) => (req, res, next) => {
  multerMiddleware(req, res, (err) => {
    if (!err) return next();
    const status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    return res.status(status).json({ success: false, message: err.message });
  });
};

router.get("/", protect, listResources);
router.get("/:id", protect, getResource);

router.post(
  "/upload",
  protect,
  adminOnly,
  (req, res, next) => {
    const type = req.query.resourceType || "resources";
    const multerMiddleware = uploadFor(type).single("file");
    withMulterErrors(multerMiddleware)(req, res, next);
  },
  uploadResource
);

router.patch("/:id", protect, adminOnly, updateResource);
router.delete("/:id", protect, adminOnly, deleteResource);

module.exports = router;
