// // backend/middleware/avatarUpload.js
// // Separate Cloudinary storage specifically for user avatars

// const multer = require("multer");
// const { CloudinaryStorage } = require("multer-storage-cloudinary");
// const cloudinary = require("../config/cloudinary");

// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: async (req, file) => ({
//     folder: "edubits/avatars",
//     resource_type: "image",
//     allowed_formats: ["jpg", "jpeg", "png"],
//     transformation: [{ width: 200, height: 200, crop: "fill", gravity: "face" }],
//     public_id: `avatar_${req.user.id}_${Date.now()}`,
//   }),
// });

// const avatarUpload = multer({
//   storage,
//   limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
//   fileFilter: (req, file, cb) => {
//     if (!["image/jpeg", "image/png", "image/jpg"].includes(file.mimetype)) {
//       return cb(new Error("Only JPG/PNG images allowed"), false);
//     }
//     cb(null, true);
//   },
// });

// module.exports = avatarUpload;

// // commenting out for migration changes