import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  BookOpen,
  FolderOpen,
  FileText,
  ListVideo,
  FileQuestion,
  Loader2,
  AlertCircle,
  ArrowLeft,
  CheckSquare,
  Square,
  ExternalLink,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { fetchResources, fetchProgress, updateProgress } from "../../../services/resourceService";
import { useAuth } from "../../../context/AuthContext";
import PdfViewer from "../components/PdfViewer";
import "./Resources.css";

const TABS = [
  { id: "pyqs", label: "PYQs", icon: FileQuestion },
  { id: "playlists", label: "Playlists", icon: ListVideo },
  { id: "notes", label: "Notes", icon: FileText },
];

export default function SubjectPage() {
  const { year, subject } = useParams();
  const decodedYear = decodeURIComponent(year);
  const decodedSubject = decodeURIComponent(subject);
  const { token } = useAuth();

  const [activeTab, setActiveTab] = useState("pyqs");
  const [pyqs, setPyqs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [notes, setNotes] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Viewer state
  const [viewer, setViewer] = useState({ open: false, url: "", title: "", paperKey: "", variant: "", linkedUrl: "" });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [pyqsRes, playlistsRes, notesRes, progressRes] = await Promise.all([
        fetchResources({ type: "pyqs", year: decodedYear, subject: decodedSubject }),
        fetchResources({ type: "playlist", year: decodedYear, subject: decodedSubject }),
        fetchResources({ type: "notes", year: decodedYear, subject: decodedSubject }),
        token ? fetchProgress() : Promise.resolve({ data: { success: true, progress: [] } }),
      ]);

      setPyqs(pyqsRes || []);
      setPlaylists(playlistsRes || []);
      setNotes(notesRes || []);

      if (progressRes.data?.success) {
        const map = {};
        progressRes.data.progress.forEach((p) => {
          map[p.paperKey] = { attempted: p.attempted, notes: p.notes };
        });
        setProgressMap(map);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [decodedYear, decodedSubject, token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAttemptedToggle = async (paperKey, current) => {
    const next = !current;
    setProgressMap((prev) => ({ ...prev, [paperKey]: { ...prev[paperKey], attempted: next } }));
    try {
      await updateProgress(paperKey, { attempted: next });
    } catch (err) {
      console.error("Failed to update progress:", err);
    }
  };

  const handleNotesChange = async (paperKey, notesText) => {
    setProgressMap((prev) => ({ ...prev, [paperKey]: { ...prev[paperKey], notes: notesText } }));
    try {
      await updateProgress(paperKey, { notes: notesText });
    } catch (err) {
      console.error("Failed to update notes:", err);
    }
  };

  const openViewer = (resource, linkedResource) => {
    setViewer({
      open: true,
      url: resource.url,
      title: resource.title,
      paperKey: resource.paperKey,
      variant: resource.variant,
      linkedUrl: linkedResource?.url || "",
    });
  };

  const closeViewer = () => setViewer({ open: false, url: "", title: "", paperKey: "", variant: "", linkedUrl: "" });

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
    return Object.entries(pairs)
      .map(([paperKey, variants]) => ({
        paperKey,
        questions: variants.questions,
        solution: variants.solution,
      }))
      .filter((p) => p.questions)
      .sort((a, b) => (a.questions?.paperTag || "").localeCompare(b.questions?.paperTag || ""));
  }, [pyqs]);

  if (loading) return <div className="resources-loading"><Loader2 className="spin" size={32} /> Loading resources…</div>;
  if (error) return <div className="resources-error"><AlertCircle size={32} /> {error}</div>;

  const renderPyqsTab = () => (
    <div className="resources-tab-content">
      {paperPairs.length === 0 ? (
        <div className="resources-empty">
          <FileQuestion size={48} />
          <p>No PYQs found for this subject</p>
        </div>
      ) : (
        <div className="paper-pairs-grid">
          {paperPairs.map(({ paperKey, questions, solution }) => {
            const progress = progressMap[paperKey] || { attempted: false, notes: "" };
            return (
              <div key={paperKey} className="paper-pair-card">
                <div className="paper-pair-header">
                  <h4 className="paper-pair-title">{questions?.title || "Untitled"}</h4>
                  <span className={`paper-tag ${progress.attempted ? "attempted" : ""}`}>
                    {questions?.paperTag || "Paper"}
                    {progress.attempted && <CheckSquare size={14} />}
                  </span>
                </div>

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
                      <a
                        href={questions.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pdf-card-external"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink size={14} />
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
                      <a
                        href={solution.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pdf-card-external"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink size={14} />
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

                <div className="paper-pair-notes">
                  <label className="notes-label">My Notes</label>
                  <textarea
                    className="notes-textarea"
                    placeholder="Add your notes for this paper…"
                    value={progress.notes || ""}
                    onChange={(e) => handleNotesChange(paperKey, e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
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
          {playlists.map((pl) => (
            <div key={pl._id} className="playlist-card">
              <div className="playlist-thumb">
                {pl.url?.includes("youtube") && (
                  <a href={pl.url} target="_blank" rel="noopener noreferrer">
                    <img src={`https://img.youtube.com/vi/${extractVideoId(pl.url)}/hqdefault.jpg`} alt={pl.title} />
                  </a>
                )}
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
              <a href={note.url} target="_blank" rel="noopener noreferrer" className="note-link">
                <ExternalLink size={14} /> Open Note
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  function extractVideoId(url) {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=|youtube\.com\/playlist\?list=)([^&]+)/);
    return match ? match[1] : "";
  }

  return (
    <div className="resources-page subject-page">
      <header className="resources-header">
        <Link to={`/resources/${encodeURIComponent(decodedYear)}`} className="back-link">
          <ArrowLeft size={20} /> Back
        </Link>
        <div className="header-content">
          <h1><BookOpen size={28} /> {decodedSubject}</h1>
          <span className="year-badge">{decodedYear}</span>
        </div>
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
        isOpen={viewer.open}
        onClose={closeViewer}
        url={viewer.url}
        title={viewer.title}
        paperKey={viewer.paperKey}
        variant={viewer.variant}
        onToggleVariant={toggleVariant}
        linkedUrl={viewer.linkedUrl}
      />
    </div>
  );
}