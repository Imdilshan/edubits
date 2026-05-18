// require("dotenv").config();

// const express = require("express");
// const cors = require("cors");
// const connectDB = require("./config/db");

// const { v2: cloudinary } = require("cloudinary");

// const app = express();
// const pyqRoutes = require("./routes/pyqRoutes");

// connectDB();
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// const allowedOrigins = [
//   "http://localhost:5173",
//   "http://192.168.0.113:5173",
//   "https://edubits-ten.vercel.app"
// ];

// app.use(cors({
//   origin: function (origin, callback) {
//     console.log("Origin:", origin);

//     if (!origin) return callback(null, true);

//     if (allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } 
//     else {
//       callback(new Error("CORS blocked: " + origin));
//     }
//   },
//   credentials: true,
// }));

// app.use(express.json());

// app.use((req, res, next) => {
//   console.log(
//     `[${new Date().toISOString()}] ${req.method} ${req.url}`
//   );
//   next();
// });

// app.use("/api/auth", require("./routes/authRoutes"));
// app.use("/api/tasks", require("./routes/taskRoutes"));
// app.use("/api/pyqs", pyqRoutes);

// app.use("/api/topics", require("./routes/topics"));
// app.use("/api/questions", require("./routes/questions"));
// app.use("/api/quiz", require("./routes/quiz"));
// app.use("/api/leaderboard", require("./routes/leaderboard"));
// app.use("/api/users", require("./routes/users"));

// app.get("/", (req, res) => {
//   res.json({ message: "Edubits API running", status: "ok" });
// });

// app.use((err, req, res, next) => {

//   console.error("Unhandled error:", err);

//   if (err?.message?.startsWith("CORS")) {
//     return res.status(403).json({
//       error: err.message,
//     });
//   }

//   res.status(500).json({
//     error: err?.message || "Internal server error",
//   });
// });

// const PORT = process.env.PORT || 5001;

// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });

require("dotenv").config();

const express = require("express");
const cors    = require("cors");
const path    = require("path");
const connectDB = require("./config/db");

const { v2: cloudinary } = require("cloudinary");

const app = express();
const pyqRoutes = require("./routes/pyqRoutes");

connectDB();

// Cloudinary (used for PYQ uploads only — avatars use local disk)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const allowedOrigins = [
  "http://localhost:5173",
  "http://192.168.0.113:5173",
  "https://edubits-ten.vercel.app",
];

app.use(cors({
  origin: function (origin, callback) {
    console.log("Origin:", origin);
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error("CORS blocked: " + origin));
  },
  credentials: true,
}));

app.use(express.json());

// ── Serve uploaded avatars as static files ────────────────────────────────────
// Avatar URLs stored in DB will be like: /uploads/avatars/avatar_<userId>.jpg
// Accessible at: http://localhost:5001/uploads/avatars/avatar_<userId>.jpg
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use("/api/auth",        require("./routes/authRoutes"));
app.use("/api/tasks",       require("./routes/taskRoutes"));
app.use("/api/pyqs",        pyqRoutes);
app.use("/api/topics",      require("./routes/topics"));
app.use("/api/questions",   require("./routes/questions"));
app.use("/api/quiz",        require("./routes/quiz"));
app.use("/api/leaderboard", require("./routes/leaderboard"));
app.use("/api/users",       require("./routes/users"));

app.get("/", (req, res) => {
  res.json({ message: "Edubits API running", status: "ok" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  if (err?.message?.startsWith("CORS")) {
    return res.status(403).json({ error: err.message });
  }
  res.status(500).json({ error: err?.message || "Internal server error" });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});