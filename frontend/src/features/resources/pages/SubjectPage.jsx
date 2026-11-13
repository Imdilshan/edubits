import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Layers,
  FileText,
  ListVideo,
  FileQuestion,
  Loader2,
  AlertCircle,
  ArrowLeft,
  CheckSquare,
  Square,
  ExternalLink,
  Download,
  Eye,
} from "lucide-react";
import { fetchResources } from "../../../services/resourceService";
import { useResourcesProgress } from "../resourcesProgressContext";
import PdfViewer from "../components/PdfViewer";
import "./Resources.css";

const TABS = [
  { id: "pyqs", label: "PYQs", icon: FileQuestion },
  { id: "playlists", label: "Playlists", icon: ListVideo },
  { id: "notes", label: "Notes", icon: FileText },
];

const getAttachmentUrl = (url) => url?.replace("/upload/", "/upload/fl_attachment/") || url;

export default function SubjectPage() {
  const { year, subject } = useParams();
  const decodedYear = decodeURIComponent(year);
  const decodedSubject = decodeURIComponent(subject);
  const { progressMap, saveProgress } = useResourcesProgress();

  const [activeTab, setActiveTab] = useState("pyqs");
  const [pyqs, setPyqs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Viewer state
  const [viewer, setViewer] = useState({ open: false, url: "", title: "", variant: "", linkedUrl: "" });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resources = await fetchResources({ year: decodedYear, subject: decodedSubject });
      setPyqs(resources.filter((resource) => resource.resourceType === "pyqs"));
      setPlaylists(resources.filter((resource) => resource.resourceType === "playlist"));
      setNotes(resources.filter((resource) => resource.resourceType === "notes"));
    } catch {
      setError("Failed to load resources. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [decodedYear, decodedSubject]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAttemptedToggle = async (paperKey, current) => {
    const next = !current;
    try {
      await saveProgress(paperKey, { attempted: next });
    } catch {
      console.error("[Resources] Attempt status could not be saved");
    }
  };

  const openViewer = (resource, linkedResource) => {
    setViewer({
      open: true,
      url: resource.url,
      title: resource.title,
      variant: resource.variant,
      linkedUrl: linkedResource?.url || "",
    });
  };

  const closeViewer = () => setViewer({ open: false, url: "", title: "", variant: "", linkedUrl: "" });

  const toggleVariant = () => {
    if (viewer.linkedUrl) {
      setViewer((v) => ({
        ...v,
        url: v.linkedUrl,
        title: v.variant === "questions" ? v.title.replace(" (Solution)", "") + " (Solution)" : v.title.replace(" (Solution)", ""),
        variant: v.variant === "questions" ? "solution" : "questions",
        linkedUrl: v.url,
      }));
    }
  };

  // Group PYQs by paperKey
  const paperPairs = useMemo(() => {
    const pairs = {};
    pyqs.forEach((p) => {
      if (!pairs[p.paperKey]) pairs[p.paperKey] = {};
      pairs[p.paperKey][p.variant] = p;
    });
    const slots = ["MST 1", "IMP MST 1", "MST 2", "IMP MST 2", "EST", "IMP EST"];
    const normalizeTag = (value) => String(value || "")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .replace(/^IMPORTANT/, "IMP");
    const bySlot = new Map();
    Object.entries(pairs).forEach(([paperKey, variants]) => {
      if (!variants.questions) return;
      const normalizedTag = normalizeTag(variants.questions.paperTag || variants.questions.title);
      const slot = slots.find((candidate) => normalizeTag(candidate) === normalizedTag);
      const existing = bySlot.get(slot);
      const uploadedAt = new Date(variants.questions.createdAt || 0).getTime();
      const existingAt = new Date(existing?.questions?.createdAt || 0).getTime();
      if (slot && (!existing || uploadedAt >= existingAt)) bySlot.set(slot, {
        paperKey,
        questions: variants.questions,
        solution: variants.solution,
      });
    });
    return slots.map((slot) => ({ slot, ...(bySlot.get(slot) || {}) }));
  }, [pyqs]);

  if (loading) return <div className="resources-loading"><Loader2 className="spin" size={32} /> Loading resources…</div>;
  if (error) return <div className="resources-error"><AlertCircle size={32} /> {error} <button onClick={loadData}>Retry</button></div>;

  const renderPyqsTab = () => (
    <div className="resources-tab-content">
      <div className="paper-pairs-grid">
        {paperPairs.map(({ slot, paperKey, questions, solution }) => {
            const progress = progressMap[paperKey] || { attempted: false };
            return (
              <div key={slot} className={`paper-pair-card ${questions ? "" : "paper-pair-card-empty"}`}>
                <div className="paper-pair-header">
                  <h4 className="paper-pair-title">{slot}</h4>
                  <span className={`paper-tag ${progress.attempted ? "attempted" : ""}`}>
                    {questions ? (questions.paperTag || slot) : "Not uploaded"}
                    {progress.attempted && <CheckSquare size={14} />}
                  </span>
                </div>

                {questions ? <>
                <div className="paper-pair-pdfs">
                  <div className="pdf-card questions-card">
                    <div className="pdf-card-badge questions">Questions</div>
                    <button
                      className="pdf-card-preview"
                      onClick={() => openViewer(questions, solution)}
                      disabled={!questions?.url}
                    >
                      <FileQuestion size={32} />
                      <span>Open Questions</span>
                    </button>
                    {questions?.url && (
                      <a href={getAttachmentUrl(questions.url)} download className="pdf-card-external" aria-label="Download questions PDF" title="Download questions PDF">
                        <Download size={14} />
                      </a>
                    )}
                  </div>

                  {solution && (
                    <div className="pdf-card solution-card">
                      <div className="pdf-card-badge solution">Solution</div>
                      <button
                        className="pdf-card-preview"
                        onClick={() => openViewer(solution, questions)}
                        disabled={!solution?.url}
                      >
                        <FileQuestion size={32} />
                        <span>Open Solution</span>
                      </button>
                      <a href={getAttachmentUrl(solution.url)} download className="pdf-card-external" aria-label="Download solution PDF" title="Download solution PDF">
                        <Download size={14} />
                      </a>
                    </div>
                  )}
                </div>

                <div className="paper-pair-actions">
                  <button
                    className={`attempt-btn ${progress.attempted ? "done" : ""}`}
                    onClick={() => handleAttemptedToggle(paperKey, progress.attempted)}
                  >
                    {progress.attempted ? <CheckSquare size={16} /> : <Square size={16} />}
                    <span>{progress.attempted ? "Attempted" : "Mark Attempted"}</span>
                  </button>
                </div>

                </> : <div className="paper-slot-empty">Upload this paper from the admin dashboard.</div>}
              </div>
            );
        })}
      </div>
    </div>
  );

  const renderPlaylistsTab = () => (
    <div className="resources-tab-content">
      {playlists.length === 0 ? (
        <div className="resources-empty">
          <ListVideo size={48} />
          <p>No playlists found for this subject</p>
        </div>
      ) : (
        <div className="playlists-grid">
          {playlists
            .filter((playlist) => !(
              decodedSubject === "Computer Networks" &&
              (playlist.title || "").trim().toLowerCase() === "cn unit 1"
            ))
            .sort((a, b) => {
            const getUnit = (title) => Number(title.match(/\bunit\s*(\d+)\b/i)?.[1] || Infinity);
            return getUnit(a.title || "") - getUnit(b.title || "");
            })
            .map((pl) => (
            <div key={pl._id} className="playlist-card">
              <div className="playlist-thumb">
                {extractPlaylistId(pl.url) ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(extractPlaylistId(pl.url))}`}
                    title={`${pl.title} preview`}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                ) : <ListVideo size={36} aria-hidden="true" />}
              </div>
              <div className="playlist-info">
                <h4>{pl.title}</h4>
                <p>{pl.description || "Playlist"}</p>
                <a href={pl.url} target="_blank" rel="noopener noreferrer" className="playlist-link">
                  <ExternalLink size={14} /> Open on YouTube
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderNotesTab = () => (
    <div className="resources-tab-content">
      {notes.length === 0 ? (
        <div className="resources-empty">
          <FileText size={48} />
          <p>No notes found for this subject</p>
        </div>
      ) : (
        <div className="notes-list">
          {notes.map((note) => (
            <div key={note._id} className="note-card">
              <h4>{note.title}</h4>
              <p>{note.description || ""}</p>
              <button type="button" className="note-link" onClick={() => openViewer(note, null)}>
                <Eye size={14} /> View PDF
              </button>
              <a href={getAttachmentUrl(note.url)} download className="note-link">
                <Download size={14} /> Download PDF
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  function extractPlaylistId(url) {
    try {
      const parsed = new URL(url);
      return parsed.searchParams.get("list") || "";
    } catch { return ""; }
  }

  return (
    <div className="resources-page subject-page">
      <header className="resources-header subject-page-header">
        <div className="header-content">
          <h1>
            <Layers size={28} />
            {decodedSubject}
          </h1>
          <span className="year-badge">{decodedYear}</span>
        </div>

        <Link
          to={`/resources/${encodeURIComponent(decodedYear)}`}
          className="back-link"
        >
          <ArrowLeft size={16} />
          Back
        </Link>
      </header>


      <div className="resources-tabs" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon size={18} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="resources-tab-panel">
        {activeTab === "pyqs" && renderPyqsTab()}
        {activeTab === "playlists" && renderPlaylistsTab()}
        {activeTab === "notes" && renderNotesTab()}
      </div>

      <PdfViewer
        key={`${viewer.open}-${viewer.url}`}
        isOpen={viewer.open}
        onClose={closeViewer}
        url={viewer.url}
        title={viewer.title}
        variant={viewer.variant}
        onToggleVariant={toggleVariant}
        linkedUrl={viewer.linkedUrl}
      />
    </div>
  );
}
