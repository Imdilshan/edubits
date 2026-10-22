require("dotenv").config();

const mongoose = require("mongoose");
const Resource = require("../models/Resource");

const YEAR_VALUES = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

const SUBJECT_VALUES = [
  "Mathematics-I",
  "Digital Electronics",
  "Engineering Physics",
  "LTPS",
  "Biology",
  "COA",
  "DBMS",
  "ADSA",
  "Java",
  "Software Engineering",
  "Operating System",
  "Machine Learning",
  "Probability & Statistics",
  "PBL_Java",
  "Computer Networks",
  "Web Development Fundamentals",
  "Business Analytics",
  "Ethical Hacking",
  "Mathematics-II",
  "OOPS Using Java",
];

const PAPER_SOURCES = [
  {
    year: "1st Year",
    subjects: [
      {
        subject: "Mathematics-I",
        papers: [
          { title: "MST 1", paperTag: "MST 1" },
          { title: "MST 2", paperTag: "MST 2" },
          { title: "EST 1", paperTag: "EST 1" },
        ],
      },
      {
        subject: "Digital Electronics",
        papers: [
          { title: "MST 1", paperTag: "MST 1" },
          { title: "MST 2", paperTag: "MST 2" },
          { title: "EST 1", paperTag: "EST 1" },
        ],
      },
      {
        subject: "Engineering Physics",
        papers: [
          { title: "MST 1", paperTag: "MST 1" },
          { title: "MST 2", paperTag: "MST 2" },
          { title: "EST 1", paperTag: "EST 1" },
        ],
      },
      {
        subject: "LTPS",
        papers: [
          { title: "MST 1", paperTag: "MST 1" },
          { title: "MST 2", paperTag: "MST 2" },
        ],
      },
      {
        subject: "Biology",
        papers: [
          { title: "MST 1", paperTag: "MST 1" },
          { title: "MST 2", paperTag: "MST 2" },
          { title: "EST 1", paperTag: "EST 1" },
        ],
      },
    ],
  },
  {
    year: "2nd Year",
    subjects: [
      {
        subject: "COA",
        papers: [
          { title: "MST 1", paperTag: "MST 1" },
          { title: "Unit 1 Important", paperTag: "Unit 1" },
          { title: "MST 2", paperTag: "MST 2" },
        ],
      },
      {
        subject: "DBMS",
        papers: [
          { title: "MST 1", paperTag: "MST 1" },
          { title: "Unit 1 Important", paperTag: "Unit 1" },
          { title: "MST 2", paperTag: "MST 2" },
        ],
      },
      {
        subject: "ADSA",
        papers: [
          { title: "MST 1", paperTag: "MST 1" },
          { title: "Unit 1 Important", paperTag: "Unit 1" },
          { title: "MST 2", paperTag: "MST 2" },
        ],
      },
      {
        subject: "Java",
        papers: [
          { title: "MST 1", paperTag: "MST 1" },
          { title: "Unit 1 Important", paperTag: "Unit 1" },
          { title: "MST 2", paperTag: "MST 2" },
        ],
      },
      {
        subject: "Software Engineering",
        papers: [
          { title: "Important Questions", paperTag: "Important" },
          { title: "Practice 0", paperTag: "Practice 0" },
          { title: "Practice 1", paperTag: "Practice 1" },
          { title: "Practice 2", paperTag: "Practice 2" },
          { title: "Practice 3", paperTag: "Practice 3" },
          { title: "Practice 4", paperTag: "Practice 4" },
          { title: "Practice 5", paperTag: "Practice 5" },
          { title: "Practice 6", paperTag: "Practice 6" },
        ],
      },
      {
        subject: "Operating System",
        papers: [
          { title: "Important Questions", paperTag: "Important" },
          { title: "Practice 0", paperTag: "Practice 0" },
          { title: "Practice 1", paperTag: "Practice 1" },
          { title: "Practice 2", paperTag: "Practice 2" },
          { title: "Practice 3", paperTag: "Practice 3" },
          { title: "Practice 4", paperTag: "Practice 4" },
          { title: "Practice 5", paperTag: "Practice 5" },
          { title: "Practice 6", paperTag: "Practice 6" },
        ],
      },
      {
        subject: "Machine Learning",
        papers: [
          { title: "Practice 0", paperTag: "Practice 0" },
          { title: "Practice 1", paperTag: "Practice 1" },
          { title: "Practice 2", paperTag: "Practice 2" },
          { title: "Practice 3", paperTag: "Practice 3" },
        ],
      },
      {
        subject: "Probability & Statistics",
        papers: [
          { title: "MST 1", paperTag: "MST 1" },
          { title: "MST 2", paperTag: "MST 2" },
        ],
      },
    ],
  },
  {
    year: "3rd Year",
    subjects: [
      {
        subject: "PBL_Java",
        papers: [
          { title: "MST 1", paperTag: "MST 1" },
          { title: "MST 2", paperTag: "MST 2" },
        ],
      },
      {
        subject: "Computer Networks",
        papers: [
          { title: "MST 1", paperTag: "MST 1" },
          { title: "Unit 1 Important", paperTag: "Unit 1" },
          { title: "MST 2", paperTag: "MST 2" },
          { title: "Unit 2 Important", paperTag: "Unit 2" },
        ],
      },
      {
        subject: "Probability & Statistics",
        papers: [
          { title: "MST 1", paperTag: "MST 1" },
          { title: "Unit 1 Important", paperTag: "Unit 1" },
          { title: "MST 2", paperTag: "MST 2" },
        ],
      },
      {
        subject: "Web Development Fundamentals",
        papers: [
          { title: "MST 1", paperTag: "MST 1" },
          { title: "Important Questions (Unit 1)", paperTag: "Unit 1" },
          { title: "MST 2", paperTag: "MST 2" },
        ],
      },
      {
        subject: "Business Analytics",
        papers: [
          { title: "MST 1", paperTag: "MST 1" },
          { title: "Important Questions (Unit 1)", paperTag: "Unit 1" },
          { title: "MST 2", paperTag: "MST 2" },
        ],
      },
    ],
  },
  {
    year: "4th Year",
    subjects: [
      {
        subject: "Ethical Hacking",
        papers: [
          { title: "EST", paperTag: "EST" },
        ],
      },
    ],
  },
];

function generatePaperKey(year, subject, paperTag) {
  const yearSlug = year.toLowerCase().replace(/\s+/g, "-");
  const subjectSlug = subject.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const tagSlug = paperTag.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${yearSlug}-${subjectSlug}-${tagSlug}`;
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");

  let created = 0;
  let skipped = 0;

  for (const yearData of PAPER_SOURCES) {
    for (const subjectData of yearData.subjects) {
      for (const paper of subjectData.papers) {
        const paperKey = generatePaperKey(yearData.year, subjectData.subject, paper.paperTag);

        // Check if questions variant already exists
        const existingQuestions = await Resource.findOne({
          paperKey,
          variant: "questions",
        });

        if (existingQuestions) {
          console.log(`Skipping existing: ${paperKey} (questions)`);
          skipped++;
          continue;
        }

        // Create questions variant
        await Resource.create({
          title: paper.title,
          description: "",
          resourceType: "pyqs",
          subject: subjectData.subject,
          year: yearData.year,
          paperTag: paper.paperTag,
          paperKey,
          variant: "questions",
          sortOrder: 0,
          url: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/placeholder-${paperKey}-questions.pdf`,
          cloudinaryPublicId: `placeholder-${paperKey}-questions`,
          cloudinaryResourceType: "raw",
          format: "pdf",
          fileSize: 0,
          // These are navigation placeholders, not real downloadable papers.
          // Keep them inactive so they never appear as content to students.
          isActive: false,
        });

        // Create solution variant
        await Resource.create({
          title: `${paper.title} (Solution)`,
          description: "",
          resourceType: "pyqs",
          subject: subjectData.subject,
          year: yearData.year,
          paperTag: paper.paperTag,
          paperKey,
          variant: "solution",
          sortOrder: 0,
          url: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/placeholder-${paperKey}-solution.pdf`,
          cloudinaryPublicId: `placeholder-${paperKey}-solution`,
          cloudinaryResourceType: "raw",
          format: "pdf",
          fileSize: 0,
          isActive: false,
        });

        created += 2;
        console.log(`Created: ${paperKey} (questions + solution)`);
      }
    }
  }

  console.log(`\nSeeding complete. Created: ${created} resources, Skipped: ${skipped}.`);
  console.log("\nNOTE: Placeholder records are inactive. Upload real PDFs via /admin-upload or POST /api/resources/upload-pair.");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
