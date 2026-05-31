// backend/scripts/migratePyqs.js
// ─────────────────────────────────────────────────────────────
// One-time migration: copies all existing Pyq documents into the
// Resource collection with resourceType: "pyq".
//
// Safe to run multiple times — uses upsert on cloudinaryPublicId
// so it won't create duplicates.
//
// Usage:
//   cd backend
//   node scripts/migratePyqs.js
// ─────────────────────────────────────────────────────────────

require("dotenv").config();

const mongoose = require("mongoose");

// ── Old Pyq schema (original — NOT the shim) ──────────────────
const pyqSchemaOriginal = new mongoose.Schema({
  title:     String,
  subject:   String,
  semester:  Number,
  pdfUrl:    String,
  publicId:  String,
  createdAt: { type: Date, default: Date.now },
});
// Register under a different model name to avoid conflicts with the shim
const OldPyq = mongoose.model("Pyq", pyqSchemaOriginal);

// ── New Resource schema ───────────────────────────────────────
const Resource = require("../models/Resource");

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");

  const oldPyqs = await OldPyq.find({});
  console.log(`Found ${oldPyqs.length} old Pyq documents.`);

  let created = 0;
  let skipped = 0;

  for (const pyq of oldPyqs) {
    // Skip if already migrated
    const exists = await Resource.findOne({ cloudinaryPublicId: pyq.publicId });
    if (exists) { skipped++; continue; }

    await Resource.create({
      title:                  pyq.title,
      resourceType:           "pyq",
      subject:                pyq.subject,
      semester:               pyq.semester,
      url:                    pyq.pdfUrl,
      cloudinaryPublicId:     pyq.publicId,
      cloudinaryResourceType: "raw",
      format:                 "pdf",
      isActive:               true,
      createdAt:              pyq.createdAt,
    });
    created++;
  }

  console.log(`Migration complete. Created: ${created}, Skipped (already exists): ${skipped}.`);
  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
