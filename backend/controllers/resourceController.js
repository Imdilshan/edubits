const Resource   = require("../models/Resource");
const cloudinary = require("../config/cloudinary");

const uploadResource = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: "No file uploaded." });
    }

    const {
      title,
      subject,
      year,
      semester,
      paperTag,
      description,
      sortOrder,
    } = req.body;

    const resourceType = req.body.resourceType || req.query.resourceType;

    if (!title || !resourceType) {
      await cloudinary.uploader.destroy(file.filename, {
        resource_type: file.resource_type || "raw",
      }).catch(() => {});

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

      url:                    file.path,
      cloudinaryPublicId:     file.filename,
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
      .populate("uploadedBy", "name email")
      .lean();

    return res.json({ success: true, count: resources.length, resources });

  } catch (err) {
    console.error("[listResources]", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

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

const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ success: false, message: "Resource not found." });
    }

    resource.isActive = false;
    await resource.save();

    try {
      await cloudinary.uploader.destroy(resource.cloudinaryPublicId, {
        resource_type: resource.cloudinaryResourceType,
      });
    } catch (cloudErr) {
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

const updateResource = async (req, res) => {
  try {
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
