import React from "react";
import { X, FileText, ExternalLink } from "lucide-react";

export default function SolutionModal({ problem, onClose }) {
  const hasBlog = !!problem.blogUrl;
  const hasEn = !!problem.solutionVideoUrlEn;
  const hasHi = !!problem.solutionVideoUrlHi;

  return (
    <div className="prog-modal-overlay" onClick={onClose}>
      <div className="prog-modal" onClick={(e) => e.stopPropagation()}>
        <div className="prog-modal-header">
          <h2>{problem.title} — Solution</h2>
          <button className="prog-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="prog-modal-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {!hasBlog && !hasEn && !hasHi && (
            <p className="prog-empty">No solution added yet for this problem.</p>
          )}

          {hasBlog && (
            <a href={problem.blogUrl} target="_blank" rel="noreferrer" style={linkRowStyle}>
              <FileText size={18} /> Read the blog
            </a>
          )}

          {hasEn && (
            <a href={problem.solutionVideoUrlEn} target="_blank" rel="noreferrer" style={linkRowStyle}>
              <ExternalLink size={18} /> Solution video (English)
            </a>
          )}

          {hasHi && (
            <a href={problem.solutionVideoUrlHi} target="_blank" rel="noreferrer" style={linkRowStyle}>
              <ExternalLink size={18} /> Solution video (Hindi)
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

const linkRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "10px 14px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "var(--surface-2)",
  color: "var(--text)",
  textDecoration: "none",
  fontSize: "0.9rem",
};