require("dotenv").config();

const express    = require("express");
const cors       = require("cors");
const path       = require("path");
const connectDB  = require("./config/db");
const passport   = require("./config/passport");

require("./config/cloudinary");

const app = express();

connectDB();

const allowedOrigins = [
  "http://localhost:5173",
  "http://192.168.0.113:5173",
  "https://edubits-ten.vercel.app",
  "https://edubits0.vercel.app",
];

app.use(cors({
  origin: (origin, callback) => {
    console.log("Origin:", origin);
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error("CORS blocked: " + origin));
  },
  credentials: true,
}));

app.use(express.json());
app.use(passport.initialize());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use("/api/auth",        require("./routes/authRoutes"));
app.use("/api/tasks",       require("./routes/taskRoutes"));
app.use("/api/pyqs",        require("./routes/pyqRoutes"));        
app.use("/api/resources",   require("./routes/resourceRoutes"));   
app.use("/api/topics",      require("./routes/topics"));
app.use("/api/questions",   require("./routes/questions"));
app.use("/api/quiz",        require("./routes/quiz"));
app.use("/api/leaderboard", require("./routes/leaderboard"));
app.use("/api/users",       require("./routes/users"));

app.get("/api/test-cloudinary", async (req, res) => {
  try {
    const cloudinary = require("./config/cloudinary");
    const result = await cloudinary.api.ping();
    res.json({ success: true, result });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

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
