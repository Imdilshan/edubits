// src/services/resourceService.js
// ─────────────────────────────────────────────────────────────
// Centralised API layer for all resource (PYQ / notes / images) calls.
//
// WHY a dedicated service module:
//   • Components shouldn't know the API base URL or the axios config.
//   • Swapping the backend URL is a one-line change here.
//   • Error normalisation happens in one place.
//
// SECURITY: The auth token comes from localStorage (set by AuthContext).
// The Cloudinary secret NEVER touches the frontend — uploads go to the
// backend, which proxies to Cloudinary using server-side credentials.
// ─────────────────────────────────────────────────────────────

import axios from "axios";

// Vite exposes VITE_* env vars to the browser bundle — safe for the
// API base URL. Cloudinary secrets are NEVER in VITE_* variables.
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// ── Axios instance ─────────────────────────────────────────────
const api = axios.create({
  baseURL: API_BASE,
});

// Attach JWT on every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Resource types ─────────────────────────────────────────────
export const RESOURCE_TYPES = {
  PYQ:       "pyq",
  NOTES:     "notes",
  IMAGE:     "image",
  THUMBNAIL: "thumbnail",
  PDF:       "pdf",
  OTHER:     "other",
};

// ── Upload a resource file ─────────────────────────────────────
/**
 * Upload a file to the backend, which proxies it to Cloudinary.
 *
 * @param {File}   file         – browser File object from <input type="file">
 * @param {Object} metadata     – { title, resourceType, subject?, year?, semester?, paperTag?, description? }
 * @param {Function} onProgress – optional upload progress callback (0–100)
 * @returns Promise<Resource>
 */
export const uploadResource = async (file, metadata, onProgress) => {
  const formData = new FormData();
  formData.append("file", file);

  // Append all metadata fields
  Object.entries(metadata).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== "") {
      formData.append(key, val);
    }
  });

  const { data } = await api.post(
    `/resources/upload?resourceType=${metadata.resourceType || "resources"}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: onProgress
        ? (e) => {
            const pct = Math.round((e.loaded / e.total) * 100);
            onProgress(pct);
          }
        : undefined,
    }
  );

  if (!data.success) throw new Error(data.message || "Upload failed");
  return data.resource;
};

// ── Upload a PYQ specifically ─────────────────────────────────
// Shortcut that hits /api/pyqs/upload (original endpoint — kept for compat)
export const uploadPyq = async (file, { title, subject, semester, year, paperTag }, onProgress) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", title);
  if (subject)  formData.append("subject",  subject);
  if (semester) formData.append("semester", semester);
  if (year)     formData.append("year",     year);
  if (paperTag) formData.append("paperTag", paperTag);

  const { data } = await api.post("/pyqs/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: onProgress
      ? (e) => onProgress(Math.round((e.loaded / e.total) * 100))
      : undefined,
  });

  if (!data.success) throw new Error(data.message || "Upload failed");
  return data.pyq;
};

// ── Fetch resource list ────────────────────────────────────────
export const fetchResources = async ({ type, subject, year, semester } = {}) => {
  const params = {};
  if (type)     params.type     = type;
  if (subject)  params.subject  = subject;
  if (year)     params.year     = year;
  if (semester) params.semester = semester;

  const { data } = await api.get("/resources", { params });
  return data.resources || [];
};

// ── Fetch all PYQs from DB ─────────────────────────────────────
export const fetchPyqs = async ({ subject, year, semester } = {}) => {
  const params = {};
  if (subject)  params.subject  = subject;
  if (year)     params.year     = year;
  if (semester) params.semester = semester;

  const { data } = await api.get("/pyqs", { params });
  return data.pyqs || [];
};

// ── Delete a resource ─────────────────────────────────────────
export const deleteResource = async (id) => {
  const { data } = await api.delete(`/resources/${id}`);
  return data;
};

// ── Update resource metadata ──────────────────────────────────
export const updateResource = async (id, updates) => {
  const { data } = await api.patch(`/resources/${id}`, updates);
  return data.resource;
};

export default api;
