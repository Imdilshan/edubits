const express = require("express");
const router = express.Router();
const {
  getQuestions, getQuestion, createQuestion,
  bulkCreateQuestions, updateQuestion, deleteQuestion,
} = require("../controllers/questionController");

const protect = require("../middleware/authMiddleware");

const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

router.get("/",          protect, getQuestions);
router.get("/:id",       protect, getQuestion);
router.post("/",         protect, adminOnly, createQuestion);
router.post("/bulk",     protect, adminOnly, bulkCreateQuestions);
router.put("/:id",       protect, adminOnly, updateQuestion);
router.delete("/:id",    protect, adminOnly, deleteQuestion);

module.exports = router;