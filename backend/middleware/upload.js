const multer = require("multer");
const path = require("path");
const cloudinary = require("../config/cloudinary");

const MIME_RULES = {
  pdf: ["application/pdf"], notes: ["application/pdf"], pyqs: ["application/pdf"],
  image: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  thumbnail: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  resources: ["application/pdf", "image/jpeg", "image/jpg", "image/png"],
  other: ["application/pdf", "image/jpeg", "image/jpg", "image/png"],
};
const SIZE_LIMITS = {
  pdf: 15 * 1024 * 1024, image: 5 * 1024 * 1024, thumbnail: 2 * 1024 * 1024,
  notes: 15 * 1024 * 1024, pyqs: 15 * 1024 * 1024, resources: 15 * 1024 * 1024, other: 15 * 1024 * 1024,
};
const FOLDER_MAP = {
  pdf: "edubits/pdfs", image: "edubits/images", thumbnail: "edubits/thumbnails",
  notes: "edubits/notes", pyqs: "edubits/pyqs", resources: "edubits/resources",
};
const isPdf = (b) => b.length >= 5 && b.subarray(0, 5).toString("ascii") === "%PDF-";
const isJpeg = (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
const isPng = (b) => b.length >= 8 && b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
const isWebp = (b) => b.length >= 12 && b.subarray(0, 4).toString() === "RIFF" && b.subarray(8, 12).toString() === "WEBP";

function validSignature(file) {
  switch (file.mimetype) {
    case "application/pdf": return isPdf(file.buffer);
    case "image/jpeg": case "image/jpg": return isJpeg(file.buffer);
    case "image/png": return isPng(file.buffer);
    case "image/webp": return isWebp(file.buffer);
    default: return false;
  }
}

function cloudUpload(file, type) {
  const ext = path.extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g, "");
  const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 60) || "upload";
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({
      folder: FOLDER_MAP[type] || "edubits/misc",
      resource_type: "image",
      public_id: `${Date.now()}-${base}`,
      format: file.mimetype === "application/pdf" ? "pdf" : undefined,
    }, (err, result) => {
      if (err) return reject(err);
      resolve({
        ...file,
        path: result.secure_url,
        filename: result.public_id,
        resource_type: result.resource_type,
        format: result.format,
        size: result.bytes,
      });
    });
    stream.end(file.buffer);
  });
}

const uploadFor = (type) => {
  const allowed = MIME_RULES[type] || [];
  const parser = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: SIZE_LIMITS[type] || 10 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(Object.assign(new Error("Unsupported file type"), { status: 400 })),
  });
  const wrap = (parse, collection) => (req, res, next) => {
    parse(req, res, async (parseError) => {
      if (parseError) return next(parseError);
      const files = collection === "files" ? (req.files || []) : req.file ? [req.file] : [];
      if (files.some((file) => !validSignature(file))) {
        return next(Object.assign(new Error("File contents do not match the declared type"), { status: 400 }));
      }
      try {
        const uploaded = [];
        try {
          for (const file of files) uploaded.push(await cloudUpload(file, type));
        } catch (err) {
          await Promise.all(uploaded.map((file) => cloudinary.uploader.destroy(file.filename, { resource_type: file.resource_type }).catch(() => {})));
          throw err;
        }
        if (collection === "files") req.files = uploaded;
        else if (uploaded[0]) req.file = uploaded[0];
        next();
      } catch (err) {
        next(err);
      }
    });
  };
  return {
    single: (field) => wrap(parser.single(field), "file"),
    array: (field, max) => wrap(parser.array(field, max), "files"),
  };
};

module.exports = { uploadFor };
