require("dotenv").config();

const express    = require("express");
const cors       = require("cors");
const path       = require("path");
const { randomUUID } = require("crypto");
const rateLimit  = require("express-rate-limit");
const connectDB  = require("./config/db");
const passport   = require("./config/passport");

require("./config/cloudinary");

// Fail fast if required secrets are missing
["MONGO_URI", "JWT_SECRET", "FRONTEND_URL"].forEach((key) => {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
});

if (
  process.env.NODE_ENV === "production" &&
  (process.env.JWT_SECRET.length < 32 || /replace|example|your[_ -]?secret|change[_ -]?me/i.test(process.env.JWT_SECRET))
) {
  console.error("Set JWT_SECRET to a unique random value of at least 32 characters in production");
  process.exit(1);
}

const app = express();

// Baseline browser protections for API and redirect responses.
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'; base-uri 'none'");
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
});

// Give each request a safe correlation ID and prevent controller catch blocks
// from returning database or infrastructure error details to clients.
app.use((req, res, next) => {
  req.requestId = randomUUID();
  res.setHeader("X-Request-ID", req.requestId);
  const json = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode >= 500) {
      body = { error: "Internal server error", requestId: req.requestId };
    }
    return json(body);
  };
  next();
});

// Behind Render/Vercel/etc. there is one proxy hop. Without this, every user
// shares the proxy's IP and the rate limiter below counts them all together.
app.set("trust proxy", 1);

connectDB();

// Allowed browser origins. Add extra ones via CORS_ORIGINS (comma-separated).
const allowedOrigins = new Set(
  [
    process.env.FRONTEND_URL,
    ...(process.env.CORS_ORIGINS || "").split(","),
    "https://edubits-ten.vercel.app",
    "https://edubits0.vercel.app",
    // Local development only
    ...(process.env.NODE_ENV !== "production"
      ? ["http://localhost:5173", "http://192.168.0.113:5173"]
      : []),
  ]
    .map((o) => (o || "").trim().replace(/\/$/, ""))
    .filter(Boolean)
);

app.use(cors({
  origin: (origin, callback) => {
    // Requests with no Origin header (curl, health checks, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.has(origin)) return callback(null, true);
    callback(new Error("CORS blocked: " + origin));
  },
  credentials: true,
}));

// Cookies are sent automatically by browsers, so reject cross-origin writes
// even when a browser would otherwise attach the session cookie.
app.use((req, res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  const origin = req.get("Origin");
  if (origin && !allowedOrigins.has(origin.replace(/\/$/, ""))) {
    return res.status(403).json({ error: "Origin not allowed", requestId: req.requestId });
  }
  next();
});

// Rate limiting — 150 requests per 15 minutes per IP
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please slow down" },
}));

app.use(express.json());
app.use(passport.initialize());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] [${req.requestId}] ${req.method} ${req.path}`);
  next();
});

app.use("/api/pyq-progress", require("./routes/pyqProgressRoutes"));

// Health check — keeps Render free tier alive via UptimeRobot
app.get("/health", (req, res) => res.status(200).json({ status: "ok", ts: Date.now() }));

app.use("/api/auth",        require("./routes/authRoutes"));
app.use("/api/tasks",       require("./routes/taskRoutes"));
app.use("/api/pyqs",        require("./routes/pyqRoutes"));
app.use("/api/resources",   require("./routes/resourceRoutes"));
app.use("/api/topics",      require("./routes/topics"));
app.use("/api/questions",   require("./routes/questions"));
app.use("/api/quiz",        require("./routes/quiz"));
app.use("/api/leaderboard", require("./routes/leaderboard"));
app.use("/api/users",       require("./routes/users"));
app.use("/api/programming", require("./features/programming/routes/programmingRoutes"));

app.get("/api/test-cloudinary", require("./middleware/authMiddleware"), async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  try {
    const cloudinary = require("./config/cloudinary");
    await cloudinary.api.ping();
    res.json({ success: true });
  } catch {
    res.status(503).json({ success: false, message: "Cloudinary is unavailable" });
  }
});

app.get("/", (req, res) => {
  res.json({ message: "Edubits API running", status: "ok" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  if (err?.message?.startsWith("CORS")) {
    return res.status(403).json({ error: "Origin not allowed", requestId: req.requestId });
  }
  // body-parser / multer errors carry their own 4xx status (e.g. malformed JSON)
  const status =
    err?.name === "MulterError" ? 400
    : err?.status >= 400 && err?.status < 500 ? err.status
    : 500;
  res.status(status).json({
    error: status >= 500 ? "Internal server error" : "Invalid request",
    requestId: req.requestId,
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
