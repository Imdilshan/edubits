const multer              = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary          = require("../config/cloudinary");

const MIME_RULES = {
  pdf:       ["application/pdf"],
  image:     ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  thumbnail: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  notes:     ["application/pdf"],
  pyqs:      ["application/pdf"],
  resources: ["application/pdf", "image/jpeg", "image/jpg", "image/png"],
};

const SIZE_LIMITS = {
  pdf:       15 * 1024 * 1024,  
  image:      5 * 1024 * 1024,  
  thumbnail:  2 * 1024 * 1024,  
  notes:     15 * 1024 * 1024,
  pyqs:      15 * 1024 * 1024,
  resources: 15 * 1024 * 1024,
};

const FOLDER_MAP = {
  pdf:       "edubits/pdfs",
  image:     "edubits/images",
  thumbnail: "edubits/thumbnails",
  notes:     "edubits/notes",
  pyqs:      "edubits/pyqs",
  resources: "edubits/resources",
  avatars:   "edubits/avatars",
};

const RESOURCE_TYPE_MAP = {
  pdf:       "raw",
  image:     "image",
  thumbnail: "image",
  notes:     "raw",
  pyqs:      "raw",
  resources: "auto",  
  avatars:   "image",
};

const sanitiseName = (name) =>
  name
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9._\-]/g, "")
    .substring(0, 80); 


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

const avatarUpload = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
      folder:        "edubits/avatars",
      resource_type: "image",
      allowed_formats: ["jpg", "jpeg", "png"],
      transformation: [{ width: 200, height: 200, crop: "fill", gravity: "face" }],
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
