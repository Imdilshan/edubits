const Resource = require("../models/Resource");
const cloudinary = require("../config/cloudinary");

const withoutUploader = (resource) => {
  const result = resource.toObject();
  delete result.uploadedBy;
  return result;
};

const getPaperOrder = (tag = "") => {
  const value = String(tag)
    .trim()
    .toUpperCase()
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ");
  if (/\bIMP(?:ORTANT)?\s*MST\s*1\b/.test(value)) return 1;
  if (/\bMST\s*1\b/.test(value)) return 0;
  if (/\bIMP(?:ORTANT)?\s*MST\s*2\b/.test(value)) return 3;
  if (/\bMST\s*2\b/.test(value)) return 2;
  if (/\bIMP(?:ORTANT)?\s*EST\b/.test(value)) return 5;
  if (/\bEST\b/.test(value)) return 4;
  return 6;
};

/**
 * Generate a unique key for linking question and solution PDFs.
 * Uses metadata to create a readable key when possible.
 */
const generatePaperKey = ({ subject, year, semester, paperTag, title }) => {
  const normalize = (value) =>
    String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const parts = [
    normalize(subject),
    normalize(year),
    semester ? `sem-${semester}` : "",
    normalize(paperTag || title),
  ].filter(Boolean);

  // Add a random suffix to avoid collisions between separate uploads.
  const uniqueSuffix = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

  return `${parts.join("-")}-${uniqueSuffix}`;
};

/**
 * Delete uploaded files from Cloudinary when an upload operation fails.
 */
const cleanupCloudinaryFiles = async (files = []) => {
  await Promise.allSettled(
    files.map((file) =>
      cloudinary.uploader.destroy(file.filename, {
        resource_type: file.resource_type || "raw",
      })
    )
  );
};

/**
 * Upload a single resource.
 */
const uploadResource = async (req, res) => {
  let file;

  try {
    file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded.",
      });
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

    const resourceType =
      req.body.resourceType || req.query.resourceType;

    const resolvedTitle = String(title || paperTag || "").trim();

    if (!resolvedTitle || !resourceType) {
      await cleanupCloudinaryFiles([file]);

      return res.status(400).json({
        success: false,
        message: "A title (or paper tag) and resource type are required.",
      });
    }

    if (
      resourceType === "pyqs" &&
      variant &&
      !["questions", "solution"].includes(variant)
    ) {
      await cleanupCloudinaryFiles([file]);

      return res.status(400).json({
        success: false,
        message: "variant must be 'questions' or 'solution'.",
      });
    }

    const resolvedPaperKey =
      resourceType === "pyqs"
        ? paperKey ||
          generatePaperKey({
            subject,
            year,
            semester,
            paperTag,
            title: resolvedTitle,
          })
        : undefined;

    const resource = await Resource.create({
      title: resolvedTitle,
      description: description || "",
      resourceType,
      subject: subject || undefined,
      year: year || undefined,
      semester: semester ? Number(semester) : undefined,
      paperTag: paperTag || undefined,
      paperKey: resolvedPaperKey,
      variant:
        variant ||
        (resourceType === "pyqs" ? "questions" : undefined),
      sortOrder: sortOrder ? Number(sortOrder) : 0,

      url: file.path,
      cloudinaryPublicId: file.filename,
      cloudinaryResourceType: file.resource_type || "raw",
      format: file.format || undefined,
      fileSize: file.size || undefined,

      uploadedBy: req.user?._id || null,
    });

    return res.status(201).json({
      success: true,
      resource: withoutUploader(resource),
    });
  } catch (err) {
    console.error("[uploadResource] Request failed");

    if (file) {
      await cleanupCloudinaryFiles([file]);
    }

    return res.status(500).json({
      success: false,
      message: "Upload failed.",
    });
  }
};

/**
 * Upload question and solution PDFs together.
 *
 * The paper key is generated automatically when it is not provided.
 * Title can fall back to paperTag.
 */
const uploadPaperPair = async (req, res) => {
  let files = [];

  try {
    files = req.files || [];

    if (files.length !== 2) {
      await cleanupCloudinaryFiles(files);

      return res.status(400).json({
        success: false,
        message:
          "Exactly two files are required: questions PDF and solution PDF.",
      });
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

    const resolvedTitle = String(title || paperTag || "").trim();

    if (!resolvedTitle) {
      await cleanupCloudinaryFiles(files);

      return res.status(400).json({
        success: false,
        message: "A title or paper tag is required.",
      });
    }

    // Use the supplied key or generate one automatically.
    const resolvedPaperKey =
      String(paperKey || "").trim() ||
      generatePaperKey({
        subject,
        year,
        semester,
        paperTag,
        title: resolvedTitle,
      });

    // The first file is the questions PDF; the second is the solution PDF.
    const [questionsFile, solutionFile] = files;

    const baseData = {
      title: resolvedTitle,
      description: description || "",
      resourceType: "pyqs",
      subject: subject || undefined,
      year: year || undefined,
      semester: semester ? Number(semester) : undefined,
      paperTag: paperTag || undefined,
      paperKey: resolvedPaperKey,
      sortOrder: sortOrder ? Number(sortOrder) : 0,
      uploadedBy: req.user?._id || null,
    };

    // Create both records using the same paper key.
    const questionsResource = await Resource.create({
      ...baseData,
      variant: "questions",
      url: questionsFile.path,
      cloudinaryPublicId: questionsFile.filename,
      cloudinaryResourceType:
        questionsFile.resource_type || "raw",
      format: questionsFile.format || undefined,
      fileSize: questionsFile.size || undefined,
    });

    let solutionResource;

    try {
      solutionResource = await Resource.create({
        ...baseData,
        variant: "solution",
        url: solutionFile.path,
        cloudinaryPublicId: solutionFile.filename,
        cloudinaryResourceType:
          solutionFile.resource_type || "raw",
        format: solutionFile.format || undefined,
        fileSize: solutionFile.size || undefined,
      });
    } catch (err) {
      // Avoid leaving an unpaired question record.
      await Resource.deleteOne({
        _id: questionsResource._id,
      }).catch(() => {});

      throw err;
    }

    return res.status(201).json({
      success: true,
      paperKey: resolvedPaperKey,
      questions: withoutUploader(questionsResource),
      solution: withoutUploader(solutionResource),
    });
  } catch (err) {
    console.error("[uploadPaperPair] Request failed");

    await cleanupCloudinaryFiles(files);

    return res.status(500).json({
      success: false,
      message: "Paper pair upload failed.",
    });
  }
};

const createPlaylistLink = async (req, res) => {
  try {
    const { title, description, url, subject, year, semester } = req.body;
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch {
      return res.status(400).json({ success: false, message: "Enter a valid YouTube playlist URL." });
    }
    if (!/(^|\.)youtube\.com$|(^|\.)youtu\.be$/i.test(parsedUrl.hostname) || !parsedUrl.searchParams.get("list")) {
      return res.status(400).json({ success: false, message: "Enter a YouTube playlist URL containing a playlist ID." });
    }
    if (!title?.trim() || !subject || !year) {
      return res.status(400).json({ success: false, message: "Title, subject, and year are required." });
    }
    const resource = await Resource.create({
      title: title.trim(), description: description || "", url: parsedUrl.toString(),
      resourceType: "playlist", subject, year, semester: semester ? Number(semester) : undefined,
      cloudinaryPublicId: undefined, uploadedBy: req.user?._id || null,
    });
    res.status(201).json({ success: true, resource: withoutUploader(resource) });
  } catch (err) {
    console.error("[createPlaylistLink] Request failed");
    res.status(400).json({ success: false, message: "Could not add playlist." });
  }
};

/**
 * List resources with optional filters.
 */
const listResources = async (req, res) => {
  try {
    const {
      type,
      subject,
      year,
      semester,
      paperKey,
      variant,
    } = req.query;

    const filter = {
      isActive: true,
      $nor: [
        { cloudinaryPublicId: /^placeholder-/i },
        { url: /\/placeholder-/i },
      ],
    };

    if (type) filter.resourceType = type;
    if (subject) filter.subject = subject;
    if (year) filter.year = year;
    if (semester) filter.semester = Number(semester);
    if (paperKey) filter.paperKey = paperKey;
    if (variant) filter.variant = variant;

    const resources = await Resource.find(filter)
      .sort({ sortOrder: -1, createdAt: -1 })
      .select("-uploadedBy")
      .lean();

    if (type === "pyqs") {
      resources.sort((a, b) => {
        const rank = getPaperOrder(a.paperTag || a.title) - getPaperOrder(b.paperTag || b.title);
        if (rank) return rank;
        const order = (b.sortOrder || 0) - (a.sortOrder || 0);
        if (order) return order;
        return new Date(a.createdAt) - new Date(b.createdAt);
      });
    }

    return res.json({
      success: true,
      count: resources.length,
      resources,
    });
  } catch (err) {
    console.error("[listResources] Request failed");

    return res.status(500).json({
      success: false,
      message: "Request failed",
    });
  }
};

/** Return small grouped counts for Resources home and year pages. */
const getResourcesSummary = async (_req, res) => {
  try {
    const rows = await Resource.aggregate([
      { $match: { resourceType: "pyqs", isActive: true, variant: "questions", year: { $ne: null }, subject: { $ne: null }, cloudinaryPublicId: { $not: /^placeholder-/i }, url: { $not: /\/placeholder-/i } } },
      { $group: { _id: { year: "$year", subject: "$subject" }, papers: { $push: { paperKey: "$paperKey", paperTag: "$paperTag", title: "$title", createdAt: "$createdAt" } } } },
      { $sort: { "_id.year": 1, "_id.subject": 1 } },
    ]);
    const years = {};
    const subjects = {};
    for (const row of rows) {
      const { year, subject } = row._id;
      // Match SubjectPage's slot logic: separate uploads for the same paper
      // tag are duplicates, and only the latest upload represents that paper.
      const normalizeTag = (value) => String(value || "")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .replace(/^IMPORTANT/, "IMP");
      const distinctPapers = new Map();
      for (const paper of row.papers) {
        const tag = normalizeTag(paper.paperTag || paper.title);
        if (!tag) continue;
        const current = distinctPapers.get(tag);
        if (!current || new Date(paper.createdAt || 0) >= new Date(current.createdAt || 0)) {
          distinctPapers.set(tag, paper);
        }
      }
      const paperKeys = [...distinctPapers.values()].map(({ paperKey }) => paperKey).filter(Boolean);
      const count = paperKeys.length;
      years[year] = (years[year] || 0) + count;
      (subjects[year] ||= []).push({ subject, count, paperKeys });
    }
    res.json({ success: true, years, subjects });
  } catch (err) {
    console.error("[getResourcesSummary] Request failed");
    res.status(500).json({ success: false, message: "Could not load resource counts." });
  }
};

/**
 * Retrieve a resource and its linked question/solution variant.
 */
const getResource = async (req, res) => {
  try {
    const resource = await Resource.findOne({
      _id: req.params.id,
      isActive: true,
      cloudinaryPublicId: { $not: /^placeholder-/i },
      url: { $not: /\/placeholder-/i },
    }).select("-uploadedBy");

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found.",
      });
    }

    let linkedResource = null;

    if (resource.resourceType === "pyqs" && resource.paperKey) {
      const otherVariant =
        resource.variant === "questions"
          ? "solution"
          : "questions";

      linkedResource = await Resource.findOne({
        paperKey: resource.paperKey,
        variant: otherVariant,
        isActive: true,
        cloudinaryPublicId: { $not: /^placeholder-/i },
        url: { $not: /\/placeholder-/i },
      }).select("-uploadedBy").lean();
    }

    return res.json({
      success: true,
      resource,
      linkedResource,
    });
  } catch (err) {
    console.error("[getResource] Request failed");

    return res.status(500).json({
      success: false,
      message: "Request failed",
    });
  }
};

/**
 * Soft-delete a resource and remove its Cloudinary file.
 */
const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found.",
      });
    }

    resource.isActive = false;
    await resource.save();

    try {
      if (resource.cloudinaryPublicId) {
        await cloudinary.uploader.destroy(
          resource.cloudinaryPublicId,
          {
            resource_type:
              resource.cloudinaryResourceType || "raw",
          }
        );
      }
    } catch (cloudErr) {
      console.error("[deleteResource] Cloudinary purge failed");
    }

    return res.json({
      success: true,
      message: "Resource deleted.",
    });
  } catch (err) {
    console.error("[deleteResource] Request failed");

    return res.status(500).json({
      success: false,
      message: "Request failed",
    });
  }
};

/**
 * Update resource metadata.
 */
const updateResource = async (req, res) => {
  try {
    const {
      title,
      description,
      subject,
      year,
      semester,
      paperTag,
      paperKey,
      variant,
      sortOrder,
    } = req.body;

    const update = {};

    if (title !== undefined) update.title = title;
    if (description !== undefined) {
      update.description = description;
    }
    if (subject !== undefined) update.subject = subject;
    if (year !== undefined) update.year = year;
    if (semester !== undefined) {
      update.semester = Number(semester);
    }
    if (paperTag !== undefined) update.paperTag = paperTag;
    if (paperKey !== undefined) update.paperKey = paperKey;
    if (variant !== undefined) update.variant = variant;
    if (sortOrder !== undefined) {
      update.sortOrder = Number(sortOrder);
    }

    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found.",
      });
    }

    return res.json({
      success: true,
      resource,
    });
  } catch (err) {
    console.error("[updateResource] Request failed");

    return res.status(400).json({
      success: false,
      message: "Request failed",
    });
  }
};

module.exports = {
  uploadResource,
  uploadPaperPair,
  createPlaylistLink,
  listResources,
  getResourcesSummary,
  getResource,
  deleteResource,
  updateResource,
};
