const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
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
  const res = await fetch(`${API_URL}/tasks${query}`, { headers: getHeaders() });
  return handleResponse(res);
};

export const createTaskAPI = async (task) => {
  const res = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(task),
  });
  return handleResponse(res);
};

export const updateTaskAPI = async (id, task) => {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(task),
  });
  return handleResponse(res);
};

export const deleteTaskAPI = async (id) => {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return handleResponse(res);
};
