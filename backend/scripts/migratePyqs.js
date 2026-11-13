require("dotenv").config();

const mongoose = require("mongoose");

const pyqSchemaOriginal = new mongoose.Schema({
  title:     String,
  subject:   String,
  semester:  Number,
  pdfUrl:    String,
  publicId:  String,
  createdAt: { type: Date, default: Date.now },
});

const OldPyq = mongoose.model("Pyq", pyqSchemaOriginal);
const Resource = require("../models/Resource");

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI);
  console.info("Connected to MongoDB.");

  const oldPyqs = await OldPyq.find({});
  console.info(`Found ${oldPyqs.length} old Pyq documents.`);

  let created = 0;
  let skipped = 0;

  for (const pyq of oldPyqs) {
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

  console.info(`Migration complete. Created: ${created}, Skipped (already exists): ${skipped}.`);
  await mongoose.disconnect();
}

migrate().catch(() => {
  console.error("Migration failed");
  process.exit(1);
});
