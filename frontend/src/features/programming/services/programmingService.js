const API_URL = import.meta.env.VITE_API_URL;

const getHeaders = () => ({
  "Content-Type": "application/json",
});

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
};

export const fetchTopicsAPI = async () => {
  const res = await fetch(`${API_URL}/programming/topics`, { headers: getHeaders(), credentials: "include" });
  return handleResponse(res);
};

export const fetchTopicAPI = async (id) => {
  const res = await fetch(`${API_URL}/programming/topics/${id}`, { headers: getHeaders(), credentials: "include" });
  return handleResponse(res);
};

export const fetchProblemsAPI = async (topicId) => {
  const params = topicId ? `?topicId=${topicId}` : "";
  const res = await fetch(`${API_URL}/programming/problems${params}`, { headers: getHeaders(), credentials: "include" });
  return handleResponse(res);
};

export const fetchProblemAPI = async (id) => {
  const res = await fetch(`${API_URL}/programming/problems/${id}`, { headers: getHeaders(), credentials: "include" });
  return handleResponse(res);
};
// ---- Admin CRUD ----

export const createProblemAPI = async (body) => {
  const res = await fetch(`${API_URL}/programming/problems`, {
    method: "POST",
    credentials: "include",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  return handleResponse(res);
};

export const updateProblemAPI = async (id, body) => {
  const res = await fetch(`${API_URL}/programming/problems/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  return handleResponse(res);
};

export const deleteProblemAPI = async (id) => {
  const res = await fetch(`${API_URL}/programming/problems/${id}`, {
    method: "DELETE",
    credentials: "include",
    headers: getHeaders(),
  });
  return handleResponse(res);
};

// ---- Per-user progress ----

export const fetchProgressAPI = async (topicId) => {
  const params = topicId ? `?topicId=${topicId}` : "";
  const res = await fetch(`${API_URL}/programming/problems/progress${params}`, {
    credentials: "include",
    headers: getHeaders(),
  });
  return handleResponse(res);
};

export const toggleProgressAPI = async (problemId, body) => {
  const res = await fetch(`${API_URL}/programming/problems/${problemId}/progress`, {
    method: "PUT",
    credentials: "include",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  return handleResponse(res);
};
