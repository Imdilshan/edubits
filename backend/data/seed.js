require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Topic = require("../models/Topic");
const Question = require("../models/Question");

const htmlQ = require("./questions/html");
const cssQ = require("./questions/css");
const jsQ = require("./questions/js");
const reactQ = require("./questions/react");
const daaQ = require("./questions/daa");
const javaQ = require("./questions/java");
const madQ = require("./questions/mad");
const blockchainQ = require("./questions/blockchain");
const bigdataQ = require("./questions/bigdata");
const cybersecurityQ = require("./questions/cybersecurity");

const MONGO_URI =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  "mongodb://localhost:27017/edubits";

async function seed() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if ((adminEmail || adminPassword) && (!adminEmail || !adminPassword || adminPassword.length < 12)) {
    throw new Error("Set both SEED_ADMIN_EMAIL and a SEED_ADMIN_PASSWORD of at least 12 characters to bootstrap an admin.");
  }

  await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  });

  console.log("📦 Connected to MongoDB");

  const topicData = [
    {
      name: "Big Data",
      description:
        "Big Data Nptel",
      icon: "",
      color: "#06b6d4",
      mode: "nptel",
      image: "/images/subjects/big_data.png",
      position: { x: 300, y: 50 },
      passingScore: 70,
      order: 0,
      prerequisites: [],
    },
    {
      name: "Cyber Security",
      description: "Cyber Security & Cyber Threat Nptel",
      icon: "",
      color: "#ef4444",
      mode: "nptel",
      image: "/images/subjects/cyber.png",
      position: { x: 500, y: 50 },
      passingScore: 70,
      order: 1,
      prerequisites: [],
    },
    {
      name: "HTML Fundamentals",
      description: "Learn the building blocks of the web",
      icon: "",
      color: "#e34c26",
      mode: "viva",
      image: "/images/subjects/html.png",
      position: { x: 100, y: 250 },
      passingScore: 60,
      order: 2,
      prerequisites: [],
    },
    {
      name: "CSS Styling",
      description: "Style and layout web pages beautifully",
      icon: "",
      color: "#264de4",
      mode: "viva",
      image: "/images/subjects/css.png",
      position: { x: 300, y: 250 },
      passingScore: 60,
      order: 3,
      prerequisites: [],
    },
    {
      name: "JavaScript",
      description: "Add interactivity with programming",
      icon: "",
      color: "#f7df1e",
      mode: "viva",
      image: "/images/subjects/js.png",
      position: { x: 500, y: 250 },
      passingScore: 60,
      order: 4,
      prerequisites: [],
    },
    {
      name: "React",
      description: "Learn React fundamentals",
      icon: "",
      color: "#61dafb",
      mode: "viva",
      image: "/images/subjects/react.png",
      position: { x: 700, y: 250 },
      passingScore: 60,
      order: 5,
      prerequisites: [],
    },
    {
      name: "Java",
      description: "Object-oriented programming with Java",
      icon: "",
      color: "#f97316",
      mode: "viva",
      image: "/images/subjects/java.png",
      position: { x: 900, y: 350 },
      passingScore: 70,
      order: 6,
      prerequisites: [],
    },
    {
      name: "DAA (Algorithms)",
      description: "Learn algorithm design",
      icon: "",
      color: "#22c55e",
      mode: "viva",
      image: "/images/subjects/daa.png",
      position: { x: 900, y: 150 },
      passingScore: 70,
      order: 7,
      prerequisites: [],
    },
    {
      name: "Mobile App Development",
      description: "Mobile Application Development Nptel",
      icon: "",
      color: "#8b5cf6",
      mode: "nptel",
      image: "/images/subjects/mad.png",
      position: { x: 1100, y: 250 },
      passingScore: 60,
      order: 8,
      prerequisites: [],
    },
    {
      name: "Blockchain",
      description: "Explore blockchain technology.",
      icon: "",
      color: "#a855f7",
      mode: "viva",
      image: "/images/subjects/blockchain.png",
      position: { x: 1300, y: 250 },
      passingScore: 70,
      order: 9,
      prerequisites: [],
    },
  ];

  // Validate all question-to-topic mappings and question documents before
  // clearing the current quiz data. This prevents a failed seed from leaving
  // topics with no questions.
  const questionGroups = [
    [htmlQ, "HTML Fundamentals"],
    [cssQ, "CSS Styling"],
    [jsQ, "JavaScript"],
    [reactQ, "React"],
    [javaQ, "Java"],
    [daaQ, "DAA (Algorithms)"],
    [madQ, "Mobile App Development"],
    [blockchainQ, "Blockchain"],
    [bigdataQ, "Big Data"],
    [cybersecurityQ, "Cyber Security"],
  ];

  const topicNames = new Set(topicData.map(({ name }) => name));
  const missingTopicNames = questionGroups
    .map(([, topicName]) => topicName)
    .filter((topicName) => !topicNames.has(topicName));

  if (missingTopicNames.length) {
    throw new Error(`Seed references missing topics: ${missingTopicNames.join(", ")}`);
  }

  const placeholderTopicId = new mongoose.Types.ObjectId();
  const questionsToValidate = questionGroups.flatMap(([data]) =>
    data.map((question) => ({
      ...question,
      topicId: placeholderTopicId,
      source: question.source || "manual",
    }))
  );

  if (!questionsToValidate.length) {
    throw new Error("❌ No questions found");
  }

  await Promise.all(
    questionsToValidate.map((question) => new Question(question).validate())
  );

  await Question.deleteMany({});
  await Topic.deleteMany({});

  console.log("🧹 Cleared old topics");
  console.log("🧹 Cleared old questions");

  const topics = {};

  for (const t of topicData) {
    const topic = await Topic.create(t);
    topics[t.name] = topic;
  }

  console.log("✅ Topics created");

  const questions = questionGroups.flatMap(([data, topicName]) =>
    data.map((question) => ({
      ...question,
      topicId: topics[topicName]._id,
      source: question.source || "manual",
    }))
  );

  await Question.insertMany(questions);
  console.log(`✅ ${questions.length} questions inserted`);
  if (adminEmail || adminPassword) {
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await User.create({
        name: "Admin",
        email: adminEmail,
        password: await bcrypt.hash(adminPassword, 12),
        role: "admin",
        totalScore: 0,
      });
      console.log("✅ Admin created from configured seed credentials");
    } else {
      console.log("ℹ️ Configured admin already exists");
    }
  } else {
    console.log("ℹ️ Admin bootstrap skipped; configure SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD when needed");
  }
  console.log("\n🎉 Seed complete");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
