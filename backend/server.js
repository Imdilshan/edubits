require("dotenv").config();
process.env.NODE_ENV ||= "production";

const express    = require("express");
const cors       = require("cors");
const { randomUUID } = require("crypto");
const rateLimit  = require("express-rate-limit");
const helmet     = require("helmet");
const connectDB  = require("./config/db");

const requiredEnv = [
  "MONGO_URI",
  "JWT_SECRET",
  "FRONTEND_URL",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];
const isPlaceholder = (value) => /<[^>]+>|^(your[_ -]?|replace|change[_ -]?me|example)/i.test(value || "");
const missingEnv = requiredEnv.filter((key) => !process.env[key] || isPlaceholder(process.env[key]));

if (missingEnv.length) {
  console.error(`Missing or placeholder environment variables: ${missingEnv.join(", ")}`);
  process.exit(1);
}

if (process.env.JWT_SECRET.length < 32) {
  console.error("JWT_SECRET must be a unique random value of at least 32 characters");
  process.exit(1);
}

try {
  const frontendUrl = new URL(process.env.FRONTEND_URL);
  if (!/^https?:$/.test(frontendUrl.protocol) || frontendUrl.origin !== process.env.FRONTEND_URL.replace(/\/$/, "")) {
    throw new Error("invalid origin");
  }
  if (process.env.NODE_ENV === "production" && frontendUrl.protocol !== "https:") {
    throw new Error("HTTPS required in production");
  }
} catch {
  console.error("FRONTEND_URL must be a valid frontend origin (HTTPS in production)");
  process.exit(1);
}

if (!/^mongodb(?:\+srv)?:\/\//i.test(process.env.MONGO_URI)) {
  console.error("MONGO_URI must be a MongoDB connection URL");
  process.exit(1);
}

try {
  const mongoUrl = new URL(process.env.MONGO_URI);
  if (process.env.NODE_ENV === "production" && (!mongoUrl.username || !mongoUrl.password)) {
    throw new Error("credentials required");
  }
} catch {
  console.error("MONGO_URI must be valid and include authenticated credentials in production");
  process.exit(1);
}

if (process.env.BACKEND_URL) {
  try {
    const backendUrl = new URL(process.env.BACKEND_URL);
    if (!/^https?:$/.test(backendUrl.protocol) || (process.env.NODE_ENV === "production" && backendUrl.protocol !== "https:")) {
      throw new Error("invalid backend URL");
    }
  } catch {
    console.error("BACKEND_URL must be a valid HTTPS backend origin in production");
    process.exit(1);
  }
}

require("./config/cloudinary");
const passport = require("./config/passport");

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'none'"],
      scriptSrc: ["'self'"],
      baseUri: ["'none'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
  hsts: process.env.NODE_ENV === "production"
    ? { maxAge: 31_536_000, includeSubDomains: true }
    : false,
}));

// Give each request a safe correlation ID and prevent controller catch blocks
// from returning database or infrastructure error details to clients.
app.use((req, res, next) => {
  const forwardedRequestId = req.get("X-Request-ID");
  req.requestId = /^[0-9a-f-]{36}$/i.test(forwardedRequestId || "")
    ? forwardedRequestId
    : randomUUID();
  res.setHeader("X-Request-ID", req.requestId);
  const json = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode >= 400) {
      body = { error: "Request failed", requestId: req.requestId };
    }
    return json(body);
  };
  next();
});

// Behind Render/Vercel/etc. there is one proxy hop. Without this, every user
// shares the proxy's IP and the rate limiter below counts them all together.
app.set("trust proxy", 1);

const allowedOrigins = new Set(
  [
    process.env.FRONTEND_URL,
    // Local development only
    ...(process.env.NODE_ENV !== "production"
      ? ["http://localhost:5173"]
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
app.use((req, res, next) => {
  console.info(`[${new Date().toISOString()}] [${req.requestId}] ${req.method}`);
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

app.get("/", (req, res) => {
  res.json({ message: "Edubits API running", status: "ok" });
});

app.use((req, res) => {
  res.status(404).json({ error: "Request failed", requestId: req.requestId });
});

app.use((err, req, res, next) => {
  console.error(`[${req.requestId}] Unhandled request error`);
  // body-parser / multer errors carry their own 4xx status (e.g. malformed JSON)
  const status =
    err?.name === "MulterError" ? 400
    : err?.status >= 400 && err?.status < 500 ? err.status
    : 500;
  res.status(status).json({
    error: "Request failed",
    requestId: req.requestId,
  });
});

const PORT = process.env.PORT || 5001;
connectDB()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.info(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(() => {
    console.error("Server startup failed because the database is unavailable.");
    process.exit(1);
  });
