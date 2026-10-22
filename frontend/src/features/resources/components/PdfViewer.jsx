import { useState, useCallback, useEffect } from "react";
import { X, Download, Maximize2, Minimize2 } from "lucide-react";
import "./PdfViewer.css";

const getAttachmentUrl = (sourceUrl) =>
  sourceUrl?.replace("/upload/", "/upload/fl_attachment/") || sourceUrl;

export default function PdfViewer({
  isOpen,
  onClose,
  url,
  title,
  variant,
  onToggleVariant,
  linkedUrl,
}) {
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleDownload = useCallback(() => {
    const a = document.createElement("a");
    a.href = getAttachmentUrl(url);
    a.download = `${title || "document"}.pdf`;
    a.click();
  }, [url, title]);

  // Hooks must run on every render, so this sits above the early return.
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={`pdf-viewer-overlay ${isFullscreen ? "fullscreen" : ""}`} onClick={onClose}>
      <div className="pdf-viewer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="pdf-viewer-header">
          <div className="pdf-viewer-title">
            <span>{title}</span>
            {variant && (
              <span className={`pdf-variant-badge ${variant}`}>{variant}</span>
            )}
          </div>
          <div className="pdf-viewer-actions">
            {linkedUrl && onToggleVariant && (
              <button
                className="pdf-action-btn"
                onClick={onToggleVariant}
                title={`Switch to ${variant === "questions" ? "solution" : "questions"}`}
              >
                🔄 {variant === "questions" ? "Solution" : "Questions"}
              </button>
            )}
            <button className="pdf-action-btn" onClick={handleDownload} title="Download">
              <Download size={16} />
            </button>
            <button
              className="pdf-action-btn"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button className="pdf-action-btn pdf-close-btn" onClick={onClose} title="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        {error && (
          <div className="pdf-viewer-error">
            <p>Failed to load PDF: {error}</p>
            <button type="button" onClick={() => setError(null)}>Retry</button>
            <a href={getAttachmentUrl(url)} download={`${title || "document"}.pdf`}>
              Download PDF
            </a>
          </div>
        )}

        {!error && (
          <div className="pdf-viewer-content">
            <iframe
              key={url}
              title={`${title || "PDF"} preview`}
              src={url}
              className="pdf-viewer-frame"
              onError={() => setError("The browser could not display this PDF.")}
            />
          </div>
        )}
      </div>
    </div>
  );
}
