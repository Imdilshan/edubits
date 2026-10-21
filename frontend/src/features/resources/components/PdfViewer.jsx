import { useState, useCallback, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { X, ChevronLeft, ChevronRight, Download, Maximize2, Minimize2 } from "lucide-react";
import "./PdfViewer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

export default function PdfViewer({
  isOpen,
  onClose,
  url,
  title,
  paperKey,
  variant,
  onToggleVariant,
  linkedUrl,
}) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const onDocumentLoadSuccess = useCallback(({ numPages }) => {
    setNumPages(numPages);
    setError(null);
  }, []);

  const onDocumentLoadError = useCallback((err) => {
    setError(err.message);
    console.error("[PdfViewer] Document load error:", err);
  }, []);

  const onLoadError = useCallback((err) => {
    console.error("[PdfViewer] Page load error:", err);
  }, []);

  const goToPreviousPage = useCallback(() => setPageNumber((p) => Math.max(1, p - 1)), []);
  const goToNextPage = useCallback(() => setPageNumber((p) => Math.min(numPages || 1, p + 1)), [numPages]);

  const zoomIn = useCallback(() => setScale((s) => Math.min(3, s + 0.25)), []);
  const zoomOut = useCallback(() => setScale((s) => Math.max(0.5, s - 0.25)), []);
  const resetZoom = useCallback(() => setScale(1), []);

  const handleDownload = useCallback(() => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "document"}.pdf`;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.click();
  }, [url, title]);

  // Hooks must run on every render, so this sits above the early return.
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goToPreviousPage();
      if (e.key === "ArrowRight") goToNextPage();
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose, goToPreviousPage, goToNextPage]);

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
            <button className="pdf-action-btn" onClick={zoomOut} title="Zoom out">−</button>
            <button className="pdf-action-btn" onClick={resetZoom} title="Reset zoom">100%</button>
            <button className="pdf-action-btn" onClick={zoomIn} title="Zoom in">+</button>
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
            <a href={url} target="_blank" rel="noopener noreferrer">
              Open in new tab
            </a>
          </div>
        )}

        {!error && (
          <div className="pdf-viewer-content">
            <Document
              file={url}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                onLoadError={onLoadError}
                renderTextLayer={true}
                renderAnnotationLayer={true}
              />
            </Document>
          </div>
        )}

        {numPages && (
          <div className="pdf-viewer-footer">
            <button onClick={goToPreviousPage} disabled={pageNumber <= 1} aria-label="Previous page">
              <ChevronLeft size={20} />
            </button>
            <div className="pdf-page-indicator">
              <span>Page {pageNumber} of {numPages}</span>
            </div>
            <button onClick={goToNextPage} disabled={pageNumber >= numPages} aria-label="Next page">
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}