const express = require("express");
const router = express.Router();
const {
  getTopics, getTopic, createTopic, updateTopic, deleteTopic,
} = require("../controllers/topicController");

const protect = require("../middleware/authMiddleware");
const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

router.get("/",        protect, getTopics);
router.get("/:id",     protect, getTopic);
router.post("/",       protect, adminOnly, createTopic);
router.put("/:id",     protect, adminOnly, updateTopic);
router.delete("/:id",  protect, adminOnly, deleteTopic);

module.exports = router;