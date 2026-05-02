

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

connectDB();

const allowedOrigins = [
  "http://localhost:5173",
  "http://192.168.0.113:5173",
  "https://edubits-ten.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    console.log("Origin:", origin);

    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } 
    else {
      callback(new Error("CORS blocked: " + origin));
    }
  },
  credentials: true,
}));


app.use(express.json());

app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.url}`
  );
  next();
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));

app.get("/", (req, res) => {
  res.json({ message: "Edubits API running", status: "ok" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);

  if (err.message.startsWith("CORS")) {
    return res.status(403).json({ error: err.message });
  }

  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});