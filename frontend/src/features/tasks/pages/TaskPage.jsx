import { useState } from "react";
import useTasks from "../../../hooks/useTasks";
import TaskColumn from "../components/TaskColumn";
import TaskModal from "../components/TaskModal";
import Stats from "../components/Stats";

import "../../../styles/taskTracker.css";

export default function TaskPage() {
  const { tasks, loading, filters, setFilters, addTask, updateTask, deleteTask } = useTasks();

  const [isOpen, setIsOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const handleSubmit = (form) => {
    if (editingTask) {
      updateTask(editingTask._id, form);
    } else {
      addTask(form);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setIsOpen(true);
  };

  return (
    <>
    <div className="tasks-page">
      <div className="page-header">
        <div>
          <h1>Task Tracker</h1>
          <p className="hero-tagline">
            <span className="highlight-red">Plan smarter.</span>{" "}
            <span className="highlight-yellow">Track faster.</span>{" "}
            <span className="highlight-green">Never miss a deadline.</span>
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditingTask(null); setIsOpen(true); }}>
          + Add Task
        </button>
      </div>

      <Stats tasks={tasks} />
      <div className="filters">
        <input
          className="filter-input"
          placeholder="Search tasks..."
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
        />
        <select
          className="filter-select"
          value={filters.type}
          onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
        >
          <option value="">All Types</option>
          <option value="assignment">Assignment</option>
          <option value="project">Project</option>
          <option value="other">Other</option>
        </select>
        <select
          className="filter-select"
          value={filters.priority}
          onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}
        >
          <option value="">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {loading && (
        <p style={{ textAlign: "center", color: "var(--muted)", padding: "20px" }}>
          Loading tasks...
        </p>
      )}

      <div className="kanban">
        <TaskColumn title="To Do" status="todo" tasks={tasks} updateTask={updateTask} deleteTask={deleteTask} onEdit={handleEdit} />
        <TaskColumn title="In Progress" status="in-progress" tasks={tasks} updateTask={updateTask} deleteTask={deleteTask} onEdit={handleEdit} />
        <TaskColumn title="Done" status="done" tasks={tasks} updateTask={updateTask} deleteTask={deleteTask} onEdit={handleEdit} />
      </div>

      <TaskModal
        isOpen={isOpen}
        onClose={() => { setIsOpen(false); setEditingTask(null); }}
        onSubmit={handleSubmit}
        editingTask={editingTask}
      />
    </div>
  </>
  );
}
