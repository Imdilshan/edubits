const express = require("express");
const router = express.Router();

const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask
} = require("../controllers/taskController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("", authMiddleware, createTask);
router.get("", authMiddleware, getTasks);
router.get("/:id", authMiddleware, getTaskById);

router.patch("/:id", authMiddleware, updateTask);

router.put("/:id", authMiddleware, updateTask);
router.delete("/:id", authMiddleware, deleteTask);

module.exports = router;