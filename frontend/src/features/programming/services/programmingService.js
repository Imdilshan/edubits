// const API_URL = import.meta.env.VITE_API_URL;

// const getHeaders = () => ({
//   "Content-Type": "application/json",
//   Authorization: `Bearer ${localStorage.getItem("token")}`,
// });

// const handleResponse = async (res) => {
//   const data = await res.json();
//   if (!res.ok) throw new Error(data.error || "Something went wrong");
//   return data;
// };

// export const fetchTopicsAPI = async () => {
//   const res = await fetch(`${API_URL}/programming/topics`, { headers: getHeaders() });
//   return handleResponse(res);
// };

// export const fetchTopicAPI = async (id) => {
//   const res = await fetch(`${API_URL}/programming/topics/${id}`, { headers: getHeaders() });
//   return handleResponse(res);
// };

// export const fetchProblemsAPI = async (topicId) => {
//   const params = topicId ? `?topicId=${topicId}` : "";
//   const res = await fetch(`${API_URL}/programming/problems${params}`, { headers: getHeaders() });
//   return handleResponse(res);
// };

// export const fetchProblemAPI = async (id) => {
//   const res = await fetch(`${API_URL}/programming/problems/${id}`, { headers: getHeaders() });
//   return handleResponse(res);
// };

const API_URL = import.meta.env.VITE_API_URL;

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
};

export const fetchTopicsAPI = async () => {
  const res = await fetch(`${API_URL}/programming/topics`, { headers: getHeaders() });
  return handleResponse(res);
};

export const fetchTopicAPI = async (id) => {
  const res = await fetch(`${API_URL}/programming/topics/${id}`, { headers: getHeaders() });
  return handleResponse(res);
};

export const fetchProblemsAPI = async (topicId) => {
  const params = topicId ? `?topicId=${topicId}` : "";
  const res = await fetch(`${API_URL}/programming/problems${params}`, { headers: getHeaders() });
  return handleResponse(res);
};

export const fetchProblemAPI = async (id) => {
  const res = await fetch(`${API_URL}/programming/problems/${id}`, { headers: getHeaders() });
  return handleResponse(res);
};
// ---- Admin CRUD ----

export const createProblemAPI = async (body) => {
  const res = await fetch(`${API_URL}/programming/problems`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  return handleResponse(res);
};

export const updateProblemAPI = async (id, body) => {
  const res = await fetch(`${API_URL}/programming/problems/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  return handleResponse(res);
};

export const deleteProblemAPI = async (id) => {
  const res = await fetch(`${API_URL}/programming/problems/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return handleResponse(res);
};