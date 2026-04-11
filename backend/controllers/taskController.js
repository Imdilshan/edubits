const Task = require("../models/Task");

// CREATE TASK
exports.createTask = async (req, res) => {
  try {
    const { title, subject, type, deadline, priority, status } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }

    let parsedDeadline = undefined;
    if (deadline) {
      const d = new Date(deadline);
      if (isNaN(d.getTime())) {
        return res.status(400).json({ error: "Invalid deadline format" });
      }
      parsedDeadline = d;
    }

    const task = await Task.create({
      title: title.trim(),
      subject,
      type,
      deadline: parsedDeadline,
      priority,
      status,
      userId: req.userId,
    });

    res.status(201).json(task);
  } catch (err) {
    if (err.name === "ValidationError") {
      const msg = Object.values(err.errors).map((e) => e.message).join(", ");
      return res.status(400).json({ error: msg });
    }
    res.status(500).json({ error: err.message });
  }
};

// GET ALL TASKS (paginated, filtered, sorted)
exports.getTasks = async (req, res) => {
  try {
    const { status, priority, type, sortBy, order, search, page = 1, limit = 50 } = req.query;

    const filter = { userId: req.userId };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (type) filter.type = type;
    if (search) filter.title = { $regex: search, $options: "i" };

    const sort = sortBy ? { [sortBy]: order === "asc" ? 1 : -1 } : { createdAt: -1 };

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const total = await Task.countDocuments(filter);
    const tasks = await Task.find(filter).sort(sort).skip(skip).limit(limitNum);

    res.json({ total, page: pageNum, pages: Math.ceil(total / limitNum), count: tasks.length, tasks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET SINGLE TASK
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.userId });
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE TASK
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  } catch (err) {
    if (err.name === "ValidationError") {
      const msg = Object.values(err.errors).map((e) => e.message).join(", ");
      return res.status(400).json({ error: msg });
    }
    res.status(500).json({ error: err.message });
  }
};

// DELETE TASK
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};