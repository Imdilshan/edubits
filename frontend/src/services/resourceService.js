import axios from "axios";
import { API_URL } from "../config/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});



export const RESOURCE_TYPES = {
  PYQ:       "pyqs",
  NOTES:     "notes",
  IMAGE:     "image",
  THUMBNAIL: "thumbnail",
  PDF:       "pdf",
  OTHER:     "other",
  PLAYLIST:  "playlist",
};

export const uploadResource = async (file, metadata, onProgress) => {
  const formData = new FormData();
  formData.append("file", file);

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

export const uploadPaperPair = async (files, metadata, onProgress) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  Object.entries(metadata).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== "") {
      formData.append(key, val);
    }
  });

  const { data } = await api.post("/resources/upload-pair", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: onProgress
      ? (e) => onProgress(Math.round((e.loaded / e.total) * 100))
      : undefined,
  });

  if (!data.success) throw new Error(data.message || "Upload failed");
  return data;
};

export const createPlaylistLink = async (metadata) => {
  const { data } = await api.post("/resources/playlist", metadata);
  if (!data.success) throw new Error(data.message || "Could not add playlist.");
  return data.resource;
};

export const uploadPyq = async (file, { title, subject, semester, year, paperTag, paperKey, variant }, onProgress) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", title);
  if (subject)  formData.append("subject",  subject);
  if (semester) formData.append("semester", semester);
  if (year)     formData.append("year",     year);
  if (paperTag) formData.append("paperTag", paperTag);
  if (paperKey) formData.append("paperKey", paperKey);
  if (variant)  formData.append("variant",  variant);

  const { data } = await api.post("/pyqs/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: onProgress
      ? (e) => onProgress(Math.round((e.loaded / e.total) * 100))
      : undefined,
  });

  if (!data.success) throw new Error(data.message || "Upload failed");
  return data.pyqs;
};

export const fetchResources = async ({ type, subject, year, semester, paperKey, variant } = {}) => {
  const params = {};
  if (type)     params.type     = type;
  if (subject)  params.subject  = subject;
  if (year)     params.year     = year;
  if (semester) params.semester = semester;
  if (paperKey) params.paperKey = paperKey;
  if (variant)  params.variant  = variant;

  const { data } = await api.get("/resources", { params });
  return (data.resources || []).filter((resource) =>
    !resource.cloudinaryPublicId?.toLowerCase().startsWith("placeholder-") &&
    !/\/placeholder-/i.test(resource.url || "")
  );
};

export const fetchResourcesSummary = async () => {
  try {
    const { data } = await api.get("/resources/summary");
    return data;
  } catch (summaryError) {
    // Keep the page usable while a separately deployed API is still on the
    // previous version, where /:id catches /summary and returns a CastError.
    if (![404, 500].includes(summaryError.response?.status)) throw summaryError;
    const resources = await fetchResources({ type: "pyqs" });
    const years = {};
    const subjects = {};
    resources.forEach((resource) => {
      if (resource.variant !== "questions" || !resource.year || !resource.subject) return;
      years[resource.year] = (years[resource.year] || 0) + 1;
      let subjectSummary = (subjects[resource.year] || []).find((item) => item.subject === resource.subject);
      if (!subjectSummary) {
        subjectSummary = { subject: resource.subject, count: 0, paperKeys: [] };
        (subjects[resource.year] ||= []).push(subjectSummary);
      }
      subjectSummary.count += 1;
      if (resource.paperKey) subjectSummary.paperKeys.push(resource.paperKey);
    });
    return { success: true, years, subjects };
  }
};

export const fetchPyqs = async ({ subject, year, semester, paperKey, variant } = {}) => {
  const params = {};
  if (subject)  params.subject  = subject;
  if (year)     params.year     = year;
  if (semester) params.semester = semester;
  if (paperKey) params.paperKey = paperKey;
  if (variant)  params.variant  = variant;

  const { data } = await api.get("/pyqs", { params });
  return data.pyqss || [];
};

export const deleteResource = async (id) => {
  const { data } = await api.delete(`/resources/${id}`);
  return data;
};

export const updateResource = async (id, updates) => {
  const { data } = await api.patch(`/resources/${id}`, updates);
  return data.resource;
};

export const fetchProgress = async () => {
  const { data } = await api.get("/pyq-progress");
  return data;
};

export const updateProgress = async (paperKey, updates) => {
  const { data } = await api.put(`/pyq-progress/${paperKey}`, updates);
  return data;
};

export default api;
