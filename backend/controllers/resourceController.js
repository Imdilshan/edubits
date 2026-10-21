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
      paperKey,
      variant,
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

    // Validate variant for pyqs
    if (resourceType === "pyqs" && variant && !["questions", "solution"].includes(variant)) {
      return res.status(400).json({ success: false, message: "variant must be 'questions' or 'solution'" });
    }

    const resource = await Resource.create({
      title,
      description:    description || "",
      resourceType,
      subject:        subject    || undefined,
      year:           year       || undefined,
      semester:       semester   ? Number(semester) : undefined,
      paperTag:       paperTag   || undefined,
      paperKey:       paperKey   || undefined,
      variant:        variant    || (resourceType === "pyqs" ? "questions" : undefined),
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

const uploadPaperPair = async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length !== 2) {
      return res.status(400).json({ success: false, message: "Exactly two files required (questions + solution)." });
    }

    const {
      title,
      subject,
      year,
      semester,
      paperTag,
      description,
      sortOrder,
      paperKey,
    } = req.body;

    if (!title || !paperKey) {
      // Clean up uploaded files
      for (const file of files) {
        await cloudinary.uploader.destroy(file.filename, { resource_type: file.resource_type || "raw" }).catch(() => {});
      }
      return res.status(400).json({ success: false, message: "title and paperKey are required." });
    }

    // Identify which file is questions vs solution (by filename or order)
    // Assume first file is questions, second is solution
    const [questionsFile, solutionFile] = files;

    const baseData = {
      title,
      description:    description || "",
      resourceType:   "pyqs",
      subject:        subject    || undefined,
      year:           year       || undefined,
      semester:       semester   ? Number(semester) : undefined,
      paperTag:       paperTag   || undefined,
      paperKey,
      sortOrder:      sortOrder  ? Number(sortOrder) : 0,
      uploadedBy:     req.user?._id || null,
    };

    const questionsResource = await Resource.create({
      ...baseData,
      variant: "questions",
      url: questionsFile.path,
      cloudinaryPublicId: questionsFile.filename,
      cloudinaryResourceType: questionsFile.resource_type || "raw",
      format: questionsFile.format || undefined,
      fileSize: questionsFile.size || undefined,
    });

    const solutionResource = await Resource.create({
      ...baseData,
      variant: "solution",
      url: solutionFile.path,
      cloudinaryPublicId: solutionFile.filename,
      cloudinaryResourceType: solutionFile.resource_type || "raw",
      format: solutionFile.format || undefined,
      fileSize: solutionFile.size || undefined,
    });

    return res.status(201).json({
      success: true,
      paperKey,
      questions: questionsResource,
      solution: solutionResource,
    });

  } catch (err) {
    console.error("[uploadPaperPair]", err);
    return res.status(500).json({ success: false, message: err.message || "Upload failed." });
  }
};

const listResources = async (req, res) => {
  try {
    const { type, subject, year, semester, paperKey, variant } = req.query;

    const filter = { isActive: true };
    if (type)     filter.resourceType = type;
    if (subject)  filter.subject      = subject;
    if (year)     filter.year         = year;
    if (semester) filter.semester     = Number(semester);
    if (paperKey) filter.paperKey     = paperKey;
    if (variant)  filter.variant      = variant;

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

    // If this is a pyqs paper, also fetch the linked variant
    let linkedResource = null;
    if (resource.resourceType === "pyqs" && resource.paperKey) {
      const otherVariant = resource.variant === "questions" ? "solution" : "questions";
      linkedResource = await Resource.findOne({
        paperKey: resource.paperKey,
        variant: otherVariant,
        isActive: true,
      }).lean();
    }

    return res.json({ success: true, resource, linkedResource });

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
    const { title, description, subject, year, semester, paperTag, paperKey, variant, sortOrder } = req.body;

    const update = {};
    if (title       !== undefined) update.title       = title;
    if (description !== undefined) update.description = description;
    if (subject     !== undefined) update.subject     = subject;
    if (year        !== undefined) update.year        = year;
    if (semester    !== undefined) update.semester    = Number(semester);
    if (paperTag    !== undefined) update.paperTag    = paperTag;
    if (paperKey    !== undefined) update.paperKey    = paperKey;
    if (variant     !== undefined) update.variant     = variant;
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
  uploadPaperPair,
  listResources,
  getResource,
  deleteResource,
  updateResource,
};
