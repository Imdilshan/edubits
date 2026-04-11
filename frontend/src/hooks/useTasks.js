import { useState, useEffect, useCallback } from "react";
import { useToast } from "../context/ToastContext";
import {
  fetchTasksAPI,
  createTaskAPI,
  updateTaskAPI,
  deleteTaskAPI,
} from "../features/tasks/services/taskService";

export default function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    priority: "",
    status: "",
  });

  const { showToast } = useToast();

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchTasksAPI(filters);
      setTasks(data.tasks || []);
    } catch (err) {
      showToast(err.message || "Failed to load tasks", "error");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const addTask = async (task) => {
    try {
      await createTaskAPI(task);
      showToast("Task created", "success");
      loadTasks();
    } catch (err) {
      showToast(err.message || "Failed to create task", "error");
    }
  };

  const updateTask = async (id, updated) => {
    try {
      await updateTaskAPI(id, updated);
      showToast("Task updated", "info");
      loadTasks();
    } catch (err) {
      showToast(err.message || "Failed to update task", "error");
    }
  };

  const deleteTask = async (id) => {
    try {
      await deleteTaskAPI(id);
      showToast("Task deleted", "success");
      loadTasks();
    } catch (err) {
      showToast(err.message || "Failed to delete task", "error");
    }
  };

  return { tasks, loading, filters, setFilters, addTask, updateTask, deleteTask };
}
