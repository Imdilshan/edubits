const { v2: cloudinary } = require("cloudinary");

const requiredCloudinaryEnv = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];
const missingCloudinaryEnv = requiredCloudinaryEnv.filter((key) => {
  const value = process.env[key];
  return !value || /<[^>]+>|^(your[_ -]?|replace|change[_ -]?me|example)/i.test(value);
});

if (missingCloudinaryEnv.length) {
  throw new Error(`Missing or placeholder environment variables: ${missingCloudinaryEnv.join(", ")}`);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
});

module.exports = cloudinary;
