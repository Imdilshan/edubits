require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose = require("mongoose");

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
  await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  });

  console.log("📦 Connected to MongoDB");

  await Question.deleteMany({});
  await Topic.deleteMany({});

  console.log("🧹 Cleared old topics");
  console.log("🧹 Cleared old questions");

  const topicData = [
    {
      name: "Big Data",
      description:
        "Explore big data analytics, distributed computing, Hadoop, Spark, and large-scale data processing through NPTEL courses.",
      icon: "",
      color: "#06b6d4",
      mode: "nptel",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop",
      position: { x: 300, y: 50 },
      passingScore: 70,
      order: 0,
      prerequisites: [],
    },
    {
      name: "Cyber Security",
      description:
        "Learn cybersecurity fundamentals, network security, cryptography, ethical hacking, and threat detection through NPTEL courses.",
      icon: "",
      color: "#ef4444",
      mode: "nptel",
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=250&fit=crop",
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
      image: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=400&h=250&fit=crop",
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
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop",
      position: { x: 300, y: 250 },
      passingScore: 60,
      order: 3,
      prerequisites: [],
    },
    {
      name: "JavaScript Basics",
      description: "Add interactivity with programming fundamentals",
      icon: "",
      color: "#f7df1e",
      mode: "viva",
      image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=250&fit=crop",
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
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop",
      position: { x: 700, y: 250 },
      passingScore: 60,
      order: 5,
      prerequisites: [],
    },
    {
      name: "Java Programming",
      description: "Object-oriented programming with Java",
      icon: "",
      color: "#f97316",
      mode: "viva",
      image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=250&fit=crop",
      position: { x: 900, y: 350 },
      passingScore: 70,
      order: 6,
      prerequisites: [],
    },
    {
      name: "DAA (Algorithms)",
      description: "Learn problem solving and algorithm design",
      icon: "",
      color: "#22c55e",
      mode: "viva",
      image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400&h=250&fit=crop",
      position: { x: 900, y: 150 },
      passingScore: 70,
      order: 7,
      prerequisites: [],
    },
    {
      name: "Mobile App Development",
      description: "Build mobile apps for Android and iOS",
      icon: "",
      color: "#8b5cf6",
      mode: "viva",
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=250&fit=crop",
      position: { x: 1100, y: 250 },
      passingScore: 60,
      order: 8,
      prerequisites: [],
    },
    {
      name: "Blockchain",
      description: "Explore blockchain technology, cryptocurrency, smart contracts, and Web3 through NPTEL courses.",
      icon: "",
      color: "#a855f7",
      mode: "nptel",
      image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=250&fit=crop",
      position: { x: 1300, y: 250 },
      passingScore: 70,
      order: 9,
      prerequisites: [],
    },
  ];

  const topics = {};

  for (const t of topicData) {
    const topic = await Topic.create(t);
    topics[t.name] = topic;
  }

  console.log("✅ Topics created");

  const questions = [
    ...htmlQ.map((q) => ({
      ...q,
      topicId: topics["HTML Fundamentals"]._id,
      source: q.source || "manual",
    })),
    ...cssQ.map((q) => ({
      ...q,
      topicId: topics["CSS Styling"]._id,
      source: q.source || "manual",
    })),
    ...jsQ.map((q) => ({
      ...q,
      topicId: topics["JavaScript Basics"]._id,
      source: q.source || "manual",
    })),
    ...reactQ.map((q) => ({
      ...q,
      topicId: topics["React"]._id,
      source: q.source || "manual",
    })),
    ...javaQ.map((q) => ({
      ...q,
      topicId: topics["Java Programming"]._id,
      source: q.source || "manual",
    })),
    ...daaQ.map((q) => ({
      ...q,
      topicId: topics["DAA (Algorithms)"]._id,
      source: q.source || "manual",
    })),
    ...madQ.map((q) => ({
      ...q,
      topicId: topics["Mobile App Development"]._id,
      source: q.source || "manual",
    })),
    ...blockchainQ.map((q) => ({
      ...q,
      topicId: topics["Blockchain"]._id,
      source: q.source || "manual",
    })),
    ...bigdataQ.map((q) => ({
      ...q,
      topicId: topics["Big Data"]._id,
      source: q.source || "manual",
    })),
    ...cybersecurityQ.map((q) => ({
      ...q,
      topicId: topics["Cyber Security"]._id,
      source: q.source || "manual",
    })),
  ];

  if (!questions.length) {
    throw new Error("❌ No questions found");
  }
  await Question.insertMany(questions);
  console.log(`✅ ${questions.length} questions inserted`);
  const existingAdmin = await User.findOne({
    email: "admin@quizengine.dev",
  });

  if (!existingAdmin) {
    await User.create({
      name: "Admin",
      email: "admin@quizengine.dev",
      password: "admin123",
      role: "admin",
      totalScore: 0,
    });

    console.log("✅ Admin created");
  } else {
    console.log("ℹ️ Admin already exists");
  }
  console.log("\n🎉 Seed complete");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});