import { useState } from "react";
import useTasks from "../../../hooks/useTasks";
import TaskColumn from "../components/TaskColumn";
import TaskModal from "../components/TaskModal";
import Stats from "../components/Stats";
import "./TaskPage.css";

import { CheckSquare, Plus, Filter, X } from "lucide-react";

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
    <div className="tasks-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <CheckSquare size={28} strokeWidth={2.2} /> Task Tracker
          </h1>
          <p className="page-subtitle">
            <span className="highlight-red">Plan smarter.</span>{" "}
            <span className="highlight-yellow">Track faster.</span>{" "}
            <span className="highlight-green">Never miss a deadline.</span>
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditingTask(null); setIsOpen(true); }}>
          <Plus size={18} /> Add Task
        </button>
      </div>

      <Stats tasks={tasks} />

      <div className="filters-row">
        <div className="filter-group flex-1">
          <input
            className="form-input"
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          />
        </div>
        <div className="filter-group">
          <select
            className="form-select"
            value={filters.type}
            onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
          >
            <option value="">All Types</option>
            <option value="assignment">Assignment</option>
            <option value="project">Project</option>
            <option value="case-study">Case Study</option>
            <option value="ppt">PPT Presentation</option>
            <option value="worksheet">Worksheet Submission</option>
            <option value="quiz">Quiz</option>
            <option value="surprise-test">Surprise Test</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="filter-group">
          <select
            className="form-select"
            value={filters.priority}
            onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}
          >
            <option value="">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <button className="btn btn-tertiary" onClick={() => setFilters({ search: "", type: "", priority: "", status: "" })}>
          <X size={16} /> Clear
        </button>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading tasks...</p>
        </div>
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
  );
}