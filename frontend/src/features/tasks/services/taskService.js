import { API_URL } from "../../../config/api";

export const getHeaders = () => ({
  "Content-Type": "application/json",
});

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
};

export const fetchTasksAPI = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, val]) => {
    if (val) params.append(key, val);
  });
  const query = params.toString() ? `?${params.toString()}` : "";
  const res = await fetch(`${API_URL}/tasks${query}`, { headers: getHeaders(), credentials: "include" });
  return handleResponse(res);
};

export const createTaskAPI = async (task) => {
  const res = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    credentials: "include",
    headers: getHeaders(),
    body: JSON.stringify(task),
  });
  return handleResponse(res);
};

export const updateTaskAPI = async (id, task) => {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: getHeaders(),
    body: JSON.stringify(task),
  });
  return handleResponse(res);
};

export const deleteTaskAPI = async (id) => {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: "DELETE",
    credentials: "include",
    headers: getHeaders(),
  });
  return handleResponse(res);
};
