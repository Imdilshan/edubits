// config/cloudinary.js
// ─────────────────────────────────────────────────────────────
// Single source of truth for the Cloudinary SDK instance.
//
// WHY a dedicated config file instead of inline setup in server.js:
//   • Middleware (upload.js, avatarUpload.js) import this module.
//     If we configured Cloudinary in server.js we'd create a circular
//     dependency between server → middleware → cloudinary → server.
//   • Keeping credentials here makes it trivial to swap providers later.
//
// ENV VARS (never hardcode values here — secrets must stay in .env):
//   CLOUDINARY_CLOUD_NAME
//   CLOUDINARY_API_KEY
//   CLOUDINARY_API_SECRET
// ─────────────────────────────────────────────────────────────

const { v2: cloudinary } = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,  // always return https:// URLs — important for mixed-content browsers
});

// Quick sanity check on startup — fails loud so misconfigured deploys surface immediately rather than at the first upload request.
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY    ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.error(
    "[cloudinary] ⚠️  Missing Cloudinary env vars. " +
    "Uploads will fail until CLOUDINARY_CLOUD_NAME, " +
    "CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set."
  );
}

module.exports = cloudinary;
