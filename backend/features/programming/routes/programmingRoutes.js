// const express = require("express");
// const router = express.Router();

// const {
//   getTopics, getTopic, createTopic, updateTopic, deleteTopic,
//   getProblems, getProblem, createProblem, updateProblem, deleteProblem,
// } = require("../controllers/programmingController");

// const protect = require("../../../middleware/authMiddleware");
// const adminOnly = (req, res, next) => {
//   if (req.user?.role !== "admin") {
//     return res.status(403).json({ error: "Admin access required" });
//   }
//   next();
// };

// // Topics
// router.get("/topics",          protect, getTopics);
// router.get("/topics/:id",      protect, getTopic);
// router.post("/topics",         protect, adminOnly, createTopic);
// router.put("/topics/:id",      protect, adminOnly, updateTopic);
// router.delete("/topics/:id",   protect, adminOnly, deleteTopic);

// // Problems
// router.get("/problems",        protect, getProblems);
// router.get("/problems/:id",    protect, getProblem);
// router.post("/problems",       protect, adminOnly, createProblem);
// router.put("/problems/:id",    protect, adminOnly, updateProblem);
// router.delete("/problems/:id", protect, adminOnly, deleteProblem);

// module.exports = router;


const express = require("express");
const router = express.Router();

const {
  getTopics, getTopic, createTopic, updateTopic, deleteTopic,
  getProblems, getProblem, createProblem, updateProblem, deleteProblem,
  getMyProgress, toggleProgress,
} = require("../controllers/programmingController");

const protect = require("../../../middleware/authMiddleware");
const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

// Topics
router.get("/topics",          protect, getTopics);
router.get("/topics/:id",      protect, getTopic);
router.post("/topics",         protect, adminOnly, createTopic);
router.put("/topics/:id",      protect, adminOnly, updateTopic);
router.delete("/topics/:id",   protect, adminOnly, deleteTopic);

// Progress (per-user)
router.get("/problems/progress",   protect, getMyProgress);
router.put("/problems/:id/progress", protect, toggleProgress);

// Problems
router.get("/problems",        protect, getProblems);
router.get("/problems/:id",    protect, getProblem);
router.post("/problems",       protect, adminOnly, createProblem);
router.put("/problems/:id",    protect, adminOnly, updateProblem);
router.delete("/problems/:id", protect, adminOnly, deleteProblem);

module.exports = router;