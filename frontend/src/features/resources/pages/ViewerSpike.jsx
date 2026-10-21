import { useState, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "./ViewerSpike.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

const TEST_PDF_URL = "https://pdfobject.com/pdf/sample.pdf";

export default function ViewerSpike() {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const onDocumentLoadSuccess = useCallback(({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
    console.log("[ViewerSpike] Document loaded, pages:", numPages);
  }, []);

  const onDocumentLoadError = useCallback((err) => {
    setError(err.message);
    setLoading(false);
    console.error("[ViewerSpike] Document load error:", err);
  }, []);

  const onLoadError = useCallback((err) => {
    console.error("[ViewerSpike] Page load error:", err);
  }, []);

  const goToPreviousPage = () => setPageNumber((p) => Math.max(1, p - 1));
  const goToNextPage = () => setPageNumber((p) => Math.min(numPages || 1, p + 1));

  return (
    <div className="viewer-spike">
      <h1>PDF Viewer Spike (react-pdf + Cloudinary)</h1>
      <p className="test-url">Testing URL: <code>{TEST_PDF_URL}</code></p>

      {error && (
        <div className="error-box">
          <strong>Error:</strong> {error}
        </div>
      )}

      {!error && (
        <div className="viewer-container">
          {loading && <div className="loading">Loading PDF...</div>}

          <Document
            file={TEST_PDF_URL}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={loading}
          >
            <Page
              pageNumber={pageNumber}
              width={800}
              onLoadError={onLoadError}
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
          </Document>

          {numPages && (
            <div className="viewer-controls">
              <button onClick={goToPreviousPage} disabled={pageNumber <= 1}>
                Previous
              </button>
              <span>
                Page {pageNumber} of {numPages}
              </span>
              <button onClick={goToNextPage} disabled={pageNumber >= numPages}>
                Next
              </button>
            </div>
          )}
        </div>
      )}

      <div className="notes">
        <h3>Spike Checklist:</h3>
        <ul>
          <li>✓ react-pdf installed</li>
          <li>☐ Cloudinary PDF delivery enabled (Security settings)</li>
          <li>☐ PDF renders from Cloudinary URL</li>
          <li>☐ Works from Vercel preview origin</li>
          <li>☐ Text selection works</li>
          <li>☐ No CORS errors</li>
        </ul>
      </div>
    </div>
  );
}