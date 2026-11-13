const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      ...(process.env.NODE_ENV === "production" ? { tls: true } : {}),
    });
    console.info("MongoDB connected");
  } catch {
    console.error("MongoDB connection failed. Check MONGO_URI and database availability.");
    throw new Error("Database connection failed");
  }
};

module.exports = connectDB;
