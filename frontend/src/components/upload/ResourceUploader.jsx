// src/components/upload/ResourceUploader.jsx
// ─────────────────────────────────────────────────────────────
// Admin-only component for uploading PDFs / images to Cloudinary
// via the backend API.
//
// Props:
//   onSuccess(resource) – called after a successful upload
//   defaultType         – pre-selects the resource type dropdown
// ─────────────────────────────────────────────────────────────

import { useState, useRef } from "react";
import { uploadResource, RESOURCE_TYPES } from "../../services/resourceService";

const RESOURCE_TYPE_LABELS = {
  pyq:       "PYQ (Previous Year Question Paper)",
  notes:     "Notes",
  pdf:       "PDF (other)",
  image:     "Image",
  thumbnail: "Thumbnail",
  other:     "Other",
};

export default function ResourceUploader({ onSuccess, defaultType = "pyq" }) {
  const [file,         setFile]         = useState(null);
  const [resourceType, setResourceType] = useState(defaultType);
  const [title,        setTitle]        = useState("");
  const [subject,      setSubject]      = useState("");
  const [year,         setYear]         = useState("");
  const [semester,     setSemester]     = useState("");
  const [paperTag,     setPaperTag]     = useState("");
  const [progress,     setProgress]     = useState(0);
  const [status,       setStatus]       = useState("idle"); // idle | uploading | success | error
  const [errorMsg,     setErrorMsg]     = useState("");
  const fileInputRef = useRef(null);

  const reset = () => {
    setFile(null);
    setTitle("");
    setSubject("");
    setYear("");
    setSemester("");
    setPaperTag("");
    setProgress(0);
    setStatus("idle");
    setErrorMsg("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file)  return setErrorMsg("Please select a file.");
    if (!title) return setErrorMsg("Title is required.");

    setErrorMsg("");
    setStatus("uploading");
    setProgress(0);

    try {
      const resource = await uploadResource(
        file,
        { title, resourceType, subject, year, semester, paperTag },
        setProgress
      );
      setStatus("success");
      onSuccess?.(resource);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || "Upload failed.");
      setStatus("error");
    }
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.heading}>Upload Resource</h3>

      {status === "success" ? (
        <div style={styles.successBox}>
          <span>✅ Uploaded successfully!</span>
          <button style={styles.btnSecondary} onClick={reset}>Upload another</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Resource type */}
          <label style={styles.label}>Resource Type *</label>
          <select
            style={styles.input}
            value={resourceType}
            onChange={(e) => setResourceType(e.target.value)}
          >
            {Object.entries(RESOURCE_TYPE_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>

          {/* Title */}
          <label style={styles.label}>Title *</label>
          <input
            style={styles.input}
            type="text"
            placeholder="e.g. COA Practice 0"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          {/* Subject */}
          <label style={styles.label}>Subject</label>
          <input
            style={styles.input}
            type="text"
            placeholder="e.g. COA"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />

          {/* Year + Semester row */}
          <div style={styles.row}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Year</label>
              <input
                style={styles.input}
                type="text"
                placeholder="e.g. 2nd Year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Semester</label>
              <input
                style={styles.input}
                type="number"
                min="1" max="8"
                placeholder="e.g. 3"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
              />
            </div>
          </div>

          {/* Paper tag (PYQ-specific) */}
          {resourceType === "pyq" && (
            <>
              <label style={styles.label}>Paper Tag</label>
              <input
                style={styles.input}
                type="text"
                placeholder="e.g. mst1, est1, Practice 0"
                value={paperTag}
                onChange={(e) => setPaperTag(e.target.value)}
              />
            </>
          )}

          {/* File input */}
          <label style={styles.label}>File *</label>
          <input
            ref={fileInputRef}
            style={styles.fileInput}
            type="file"
            accept={
              ["pyq", "notes", "pdf"].includes(resourceType)
                ? "application/pdf"
                : "image/jpeg,image/png,image/webp,application/pdf"
            }
            onChange={(e) => setFile(e.target.files[0] || null)}
            required
          />
          {file && (
            <p style={styles.fileInfo}>
              {file.name} — {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          )}

          {/* Progress bar */}
          {status === "uploading" && (
            <div style={styles.progressTrack}>
              <div style={{ ...styles.progressFill, width: `${progress}%` }} />
              <span style={styles.progressLabel}>{progress}%</span>
            </div>
          )}

          {/* Error */}
          {errorMsg && <p style={styles.error}>{errorMsg}</p>}

          {/* Actions */}
          <div style={styles.actions}>
            <button type="button" style={styles.btnSecondary} onClick={reset}>
              Reset
            </button>
            <button
              type="submit"
              style={status === "uploading" ? styles.btnDisabled : styles.btnPrimary}
              disabled={status === "uploading"}
            >
              {status === "uploading" ? `Uploading… ${progress}%` : "Upload"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// ── Minimal inline styles (no extra CSS file needed) ──────────
const styles = {
  card: {
    background:   "var(--card, #1e1e2e)",
    border:       "1px solid var(--border, #333)",
    borderRadius: 12,
    padding:      24,
    maxWidth:     520,
  },
  heading: { marginBottom: 16, fontSize: 18 },
  form:    { display: "flex", flexDirection: "column", gap: 6 },
  label:   { fontSize: 13, opacity: 0.7, marginTop: 6 },
  input: {
    padding:      "8px 12px",
    borderRadius: 8,
    border:       "1px solid var(--border, #333)",
    background:   "var(--input-bg, #111)",
    color:        "inherit",
    fontSize:     14,
    width:        "100%",
    boxSizing:    "border-box",
  },
  fileInput: { fontSize: 13, marginTop: 4 },
  fileInfo:  { fontSize: 12, opacity: 0.6, margin: "4px 0 0" },
  row:       { display: "flex", gap: 12 },
  progressTrack: {
    position:     "relative",
    height:       8,
    background:   "#333",
    borderRadius: 4,
    marginTop:    8,
    overflow:     "hidden",
  },
  progressFill: {
    position:   "absolute",
    top: 0, left: 0, bottom: 0,
    background: "var(--accent, #6c63ff)",
    transition: "width 0.2s",
  },
  progressLabel: { fontSize: 11, textAlign: "center", display: "block", marginTop: 2 },
  error:   { color: "#f87171", fontSize: 13, marginTop: 4 },
  actions: { display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 12 },
  btnPrimary: {
    padding:      "8px 20px",
    borderRadius: 8,
    border:       "none",
    background:   "var(--accent, #6c63ff)",
    color:        "#fff",
    cursor:       "pointer",
    fontWeight:   600,
  },
  btnSecondary: {
    padding:      "8px 16px",
    borderRadius: 8,
    border:       "1px solid var(--border, #333)",
    background:   "transparent",
    color:        "inherit",
    cursor:       "pointer",
  },
  btnDisabled: {
    padding:      "8px 20px",
    borderRadius: 8,
    border:       "none",
    background:   "#555",
    color:        "#aaa",
    cursor:       "not-allowed",
    fontWeight:   600,
  },
  successBox: {
    display:        "flex",
    alignItems:     "center",
    justifyContent: "space-between",
    padding:        12,
    background:     "#16a34a22",
    borderRadius:   8,
    gap:            12,
  },
};
