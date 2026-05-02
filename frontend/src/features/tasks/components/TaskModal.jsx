import { useEffect, useState } from "react";
import "../../../styles/taskTracker.css";

export default function TaskModal({
  isOpen,
  onClose,
  onSubmit,
  editingTask,
}) {
  const [form, setForm] = useState({
    title: "",
    subject: "",
    type: "assignment",
    deadline: "",
    priority: "medium",
    status: "todo",
  });

  useEffect(() => {
    if (editingTask) {
      setForm({
        title: editingTask.title || "",
        subject: editingTask.subject || "",
        type: editingTask.type || "assignment",
        deadline: editingTask.deadline
          ? editingTask.deadline.split("T")[0]
          : "",
        priority: editingTask.priority || "medium",
        status: editingTask.status || "todo",
      });
    } else {
      resetForm();
    }
  }, [editingTask]);

  const resetForm = () => {
    setForm({
      title: "",
      subject: "",
      type: "assignment",
      deadline: "",
      priority: "medium",
      status: "todo",
    });
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!form.title.trim()) {
      alert("Title is required");
      return;
    }

    onSubmit(form);
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="task-modal-overlay" onClick={onClose}>
      <div className="task-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="task-modal-title">
          {editingTask ? "Edit Task" : "Add Task"}
        </h2>

        <div className="task-form-group">
          <label className="task-form-label">TITLE *</label>
          <input
            className=""
            placeholder="e.g. Submit DSA assignment"
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
          />
        </div>

        <div className="task-form-row">
          <div className="task-form-group">
            <label className="task-form-label">SUBJECT</label>
            <input
              className=""
              placeholder="e.g. Programming"
              value={form.subject}
              onChange={(e) => handleChange("subject", e.target.value)}
            />
          </div>

          <div className="task-form-group">
            <label className="task-form-label">TYPE</label>
            <select
              className=""
              value={form.type}
              onChange={(e) => handleChange("type", e.target.value)}
            >
              <option value="assignment">Assignment</option>
              <option value="project">Project</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="task-form-row">
          <div className="task-form-group">
            <label className="task-form-label">DEADLINE</label>
            <input
              type="date"
              className="input"
              value={form.deadline}
              onChange={(e) => handleChange("deadline", e.target.value)}
            />
          </div>

          <div className="task-form-group">
            <label className="task-form-label">PRIORITY</label>
            <select
              className=""
              value={form.priority}
              onChange={(e) => handleChange("priority", e.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div className="task-form-group">
          <label className="task-form-label">STATUS</label>
          <select
            className=""
            value={form.status}
            onChange={(e) => handleChange("status", e.target.value)}
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div className="task-modal-actions">
          <button className="task-btn-cancel" onClick={onClose}>
            Cancel
          </button>

          <button className="task-btn-add" onClick={handleSubmit}>
            {editingTask ? "Update Task" : "Add Task"}
          </button>
        </div>
      </div>
    </div>
  );
}