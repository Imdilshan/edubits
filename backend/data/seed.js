require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose = require("mongoose");

const User = require("../models/User");
const Topic = require("../models/Topic");
const Question = require("../models/Question");

const htmlQ = require("./questions/html");
const cssQ  = require("./questions/css");
const jsQ   = require("./questions/js");
const daaQ  = require("./questions/daa");
const javaQ = require("./questions/java");
const madQ  = require("./questions/mad");

const MONGO_URI =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  "mongodb://localhost:27017/edubits";

async function seed() {
  await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  });

  console.log("📦 Connected to MongoDB");
  await Question.deleteMany();
  console.log("🧹 Cleared old questions");

  const topicData = [
    {
      name: "HTML Fundamentals",
      description: "Learn the building blocks of the web",
      icon: "",
      color: "#e34c26",
      position: { x: 100, y: 250 },
      passingScore: 60,
      order: 0,
    },
    {
      name: "CSS Styling",
      description: "Style and layout web pages beautifully",
      icon: "",
      color: "#264de4",
      position: { x: 300, y: 250 },
      passingScore: 60,
      order: 1,
    },
    {
      name: "JavaScript Basics",
      description: "Add interactivity with programming fundamentals",
      icon: "",
      color: "#f7df1e",
      position: { x: 500, y: 250 },
      passingScore: 60,
      order: 2,
    },
    {
      name: "DAA (Algorithms)",
      description: "Learn problem solving and algorithm design",
      icon: "",
      color: "#22c55e",
      position: { x: 700, y: 150 },
      passingScore: 70,
      order: 3,
    },
    {
      name: "Java Programming",
      description: "Object-oriented programming with Java",
      icon: "",
      color: "#f97316",
      position: { x: 700, y: 350 },
      passingScore: 70,
      order: 4,
    },
    {
      name: "Mobile App Development",
      description: "Build mobile apps for Android and iOS",
      icon: "",
      color: "#8b5cf6",
      position: { x: 900, y: 250 },
      passingScore: 60,
      order: 5,
    },
  ];

  const topics = {};

  for (const t of topicData) {
    const topic = await Topic.findOneAndUpdate(
      { name: t.name },
      t,
      { upsert: true, new: true }
    );
    topics[t.name] = topic;
  }

  console.log("✅ Topics upserted");
  await Topic.findByIdAndUpdate(topics["CSS Styling"]._id, {
    prerequisites: [topics["HTML Fundamentals"]._id],
  });

  await Topic.findByIdAndUpdate(topics["JavaScript Basics"]._id, {
    prerequisites: [topics["CSS Styling"]._id],
  });

  console.log("🔗 Prerequisites linked");
  const questions = [
    ...htmlQ.map(q => ({ ...q, topicId: topics["HTML Fundamentals"]._id })),
    ...cssQ.map(q  => ({ ...q, topicId: topics["CSS Styling"]._id })),
    ...jsQ.map(q   => ({ ...q, topicId: topics["JavaScript Basics"]._id })),
    ...daaQ.map(q  => ({ ...q, topicId: topics["DAA (Algorithms)"]._id })),
    ...javaQ.map(q => ({ ...q, topicId: topics["Java Programming"]._id })),
    ...madQ.map(q  => ({ ...q, topicId: topics["Mobile App Development"]._id })),
  ];

  if (questions.length === 0) {
    throw new Error("❌ No questions found in JSON");
  }

  await Question.insertMany(questions);
  console.log(`✅ ${questions.length} questions inserted`);

  const existingAdmin = await User.findOne({ email: "admin@quizengine.dev" });

  if (!existingAdmin) {
    const admin = new User({
      name: "Admin",
      email: "admin@quizengine.dev",
      password: "admin123",
      role: "admin",
      totalScore: 0,
    });

    await admin.save(); 
    console.log("✅ Admin created");
  } else {
    console.log("ℹ️ Admin already exists");
  }

  console.log("\n🎉 SEED COMPLETE (SAFE)");
  console.log("Admin: admin@quizengine.dev / admin123");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});