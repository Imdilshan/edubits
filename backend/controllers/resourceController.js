// controllers/resourceController.js
// ─────────────────────────────────────────────────────────────
// Handles all CRUD for the Resource model.
//
// DESIGN NOTES:
//   • uploadResource: after multer/CloudinaryStorage runs, `req.file`
//     already contains the Cloudinary URL and public_id. We just persist
//     metadata to MongoDB — no manual Cloudinary SDK call needed here.
//   • deleteResource: we do a two-phase delete:
//       1. Soft-delete in MongoDB (isActive = false) — instant, reversible.
//       2. Hard-delete from Cloudinary — network call, may occasionally fail.
//     If Cloudinary deletion fails we log it but still return 200, because
//     the asset is already inaccessible to users (soft-deleted in DB).
//     A background job / cron can sweep orphaned Cloudinary assets later.
//   • All list endpoints filter { isActive: true } so soft-deleted items
//     never surface to users.
// ─────────────────────────────────────────────────────────────

const Resource   = require("../models/Resource");
const cloudinary = require("../config/cloudinary");

// ── POST /api/resources/upload ─────────────────────────────────
// Requires: multer middleware already ran → req.file is populated.
// Body fields: title, resourceType, subject?, year?, semester?, paperTag?, description?, sortOrder?
const uploadResource = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: "No file uploaded." });
    }

    const {
      title,
      resourceType,
      subject,
      year,
      semester,
      paperTag,
      description,
      sortOrder,
    } = req.body;

    if (!title || !resourceType) {
      // File already uploaded to Cloudinary — clean it up to avoid orphans
      await cloudinary.uploader.destroy(file.filename, {
        resource_type: file.resource_type || "raw",
      }).catch(() => {}); // best-effort

      return res.status(400).json({
        success: false,
        message: "title and resourceType are required fields.",
      });
    }

    const resource = await Resource.create({
      title,
      description:    description || "",
      resourceType,
      subject:        subject    || undefined,
      year:           year       || undefined,
      semester:       semester   ? Number(semester) : undefined,
      paperTag:       paperTag   || undefined,
      sortOrder:      sortOrder  ? Number(sortOrder) : 0,

      // multer-storage-cloudinary puts the public URL in file.path
      url:                    file.path,
      // and the Cloudinary public_id in file.filename
      cloudinaryPublicId:     file.filename,
      // infer from resource_type; multer-storage-cloudinary exposes this for "raw" uploads
      cloudinaryResourceType: file.resource_type || "raw",
      format:                 file.format        || undefined,
      fileSize:               file.size          || undefined,

      uploadedBy: req.user?._id || null,
    });

    return res.status(201).json({ success: true, resource });

  } catch (err) {
    console.error("[uploadResource]", err);
    return res.status(500).json({ success: false, message: err.message || "Upload failed." });
  }
};

// ── GET /api/resources ─────────────────────────────────────────
// Query params (all optional):
//   type     – resourceType filter   e.g. ?type=pyq
//   subject  – subject filter        e.g. ?subject=COA
//   year     – year filter           e.g. ?year=2nd+Year
//   semester – semester filter       e.g. ?semester=3
const listResources = async (req, res) => {
  try {
    const { type, subject, year, semester } = req.query;

    const filter = { isActive: true };
    if (type)     filter.resourceType = type;
    if (subject)  filter.subject      = subject;
    if (year)     filter.year         = year;
    if (semester) filter.semester     = Number(semester);

    const resources = await Resource.find(filter)
      .sort({ sortOrder: -1, createdAt: -1 })
      .populate("uploadedBy", "name email") // expose uploader name only — never password
      .lean();

    return res.json({ success: true, count: resources.length, resources });

  } catch (err) {
    console.error("[listResources]", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/resources/:id ──────────────────────────────────────
const getResource = async (req, res) => {
  try {
    const resource = await Resource.findOne({
      _id:      req.params.id,
      isActive: true,
    }).populate("uploadedBy", "name email");

    if (!resource) {
      return res.status(404).json({ success: false, message: "Resource not found." });
    }

    return res.json({ success: true, resource });

  } catch (err) {
    console.error("[getResource]", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── DELETE /api/resources/:id ──────────────────────────────────
// Admin-only (enforced in the route, not here).
// Phase 1: soft-delete in MongoDB.
// Phase 2: hard-delete from Cloudinary (best-effort).
const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ success: false, message: "Resource not found." });
    }

    // Phase 1 — soft delete (instant)
    resource.isActive = false;
    await resource.save();

    // Phase 2 — purge from Cloudinary (may fail, non-blocking)
    try {
      await cloudinary.uploader.destroy(resource.cloudinaryPublicId, {
        resource_type: resource.cloudinaryResourceType,
      });
    } catch (cloudErr) {
      // Log but don't fail the request — asset is already inaccessible via soft-delete
      console.error(
        `[deleteResource] Cloudinary purge failed for ${resource.cloudinaryPublicId}:`,
        cloudErr.message
      );
    }

    return res.json({ success: true, message: "Resource deleted." });

  } catch (err) {
    console.error("[deleteResource]", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── PATCH /api/resources/:id ───────────────────────────────────
// Update metadata only (not the file itself — re-upload for that).
// Admin-only (enforced in route).
const updateResource = async (req, res) => {
  try {
    // Whitelist updatable fields — never let clients update url/publicId directly
    const { title, description, subject, year, semester, paperTag, sortOrder } = req.body;

    const update = {};
    if (title       !== undefined) update.title       = title;
    if (description !== undefined) update.description = description;
    if (subject     !== undefined) update.subject     = subject;
    if (year        !== undefined) update.year        = year;
    if (semester    !== undefined) update.semester    = Number(semester);
    if (paperTag    !== undefined) update.paperTag    = paperTag;
    if (sortOrder   !== undefined) update.sortOrder   = Number(sortOrder);

    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!resource) {
      return res.status(404).json({ success: false, message: "Resource not found." });
    }

    return res.json({ success: true, resource });

  } catch (err) {
    console.error("[updateResource]", err);
    return res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = {
  uploadResource,
  listResources,
  getResource,
  deleteResource,
  updateResource,
};
