import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  FileText,
  ListVideo,
  FileQuestion,
  Loader2,
  AlertCircle,
  CheckSquare,
  Square,
  ExternalLink,
  Download,
  Eye,
  Maximize2,
  Sidebar,
  ChevronLeft,
  Search,
  Check,
  X,
  Sparkles,
  Play,
} from "lucide-react";
import { fetchResources } from "../../../services/resourceService";
import { useResourcesProgress } from "../resourcesProgressContext";
import PdfViewer from "../components/PdfViewer";
import WarmTooltip from "../../../components/ui/WarmTooltip";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../../components/ui/Breadcrumb";
import "../../tool-deck/toolDeck.css";
import "./SubjectWorkspace.css";
import "./Resources.css";
import { recordRecentActivity } from "../../../utils/recentActivity";

const MotionDiv = motion.div;

const SLOTS = ["MST 1", "IMP MST 1", "MST 2", "IMP MST 2", "EST", "IMP EST"];

const getAttachmentUrl = (url) =>
  url?.replace("/upload/", "/upload/fl_attachment/") || url;

const getFullWidthPdfUrl = (url) => {
  if (!url) return "";
  const baseUrl = url.split("#")[0];
  return `${baseUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH&zoom=page-width&pagemode=none`;
};

function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const listId = parsed.searchParams.get("list");
    if (listId) {
      return `https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(listId)}`;
    }
    const vId = parsed.searchParams.get("v");
    if (vId) {
      return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(vId)}`;
    }
    if (parsed.hostname.includes("youtu.be")) {
      const vIdPath = parsed.pathname.slice(1);
      if (vIdPath) {
        return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(vIdPath)}`;
      }
    }
  } catch {
    return null;
  }
  return null;
}

export default function SubjectPage() {
  const { year, subject } = useParams();
  const decodedYear = decodeURIComponent(year || "");
  const decodedSubject = decodeURIComponent(subject || "");
  const { progressMap, saveProgress } = useResourcesProgress();

  const [activeTab, setActiveTab] = useState("pyqs");
  const [pyqs, setPyqs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Workspace & Explorer state (shows explorer sidebar by default on mobile and PC)
  const [isExplorerOpen, setIsExplorerOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [openFiles, setOpenFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);

  // Modal Fullscreen PdfViewer state
  const [viewer, setViewer] = useState({
    open: false,
    url: "",
    title: "",
    variant: "",
    linkedUrl: "",
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resources = await fetchResources({
        year: decodedYear,
        subject: decodedSubject,
      });
      setPyqs(resources.filter((r) => r.resourceType === "pyqs"));
      setPlaylists(resources.filter((r) => r.resourceType === "playlist"));
      setNotes(resources.filter((r) => r.resourceType === "notes"));
    } catch {
      setError("Failed to load resources. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [decodedYear, decodedSubject]);

  useEffect(() => {
    loadData();
    if (decodedSubject && decodedYear) {
      recordRecentActivity({
        id: `subject-${decodedSubject}`,
        type: "resource",
        title: decodedSubject,
        subtitle: `${decodedYear} • PYQs & Notes`,
        href: `/resources/${encodeURIComponent(decodedYear)}/${encodeURIComponent(decodedSubject)}`,
        icon: "Layers",
      });
    }
  }, [loadData, decodedSubject, decodedYear]);

  // Group PYQs into the 6 standard slots
  const paperPairs = useMemo(() => {
    const pairs = {};
    pyqs.forEach((p) => {
      if (!pairs[p.paperKey]) pairs[p.paperKey] = {};
      pairs[p.paperKey][p.variant] = p;
    });

    const normalizeTag = (value) =>
      String(value || "")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .replace(/^IMPORTANT/, "IMP");

    const bySlot = new Map();
    Object.entries(pairs).forEach(([paperKey, variants]) => {
      if (!variants.questions) return;
      const normalizedTag = normalizeTag(
        variants.questions.paperTag || variants.questions.title
      );
      const slot = SLOTS.find(
        (candidate) => normalizeTag(candidate) === normalizedTag
      );
      const existing = bySlot.get(slot);
      const uploadedAt = new Date(variants.questions.createdAt || 0).getTime();
      const existingAt = new Date(existing?.questions?.createdAt || 0).getTime();
      if (slot && (!existing || uploadedAt >= existingAt)) {
        bySlot.set(slot, {
          paperKey,
          questions: variants.questions,
          solution: variants.solution,
        });
      }
    });

    return SLOTS.map((slot) => ({ slot, ...(bySlot.get(slot) || {}) }));
  }, [pyqs]);

  // Sorted and filtered playlists
  const sortedPlaylists = useMemo(() => {
    return playlists
      .filter(
        (pl) =>
          !(
            decodedSubject === "Computer Networks" &&
            (pl.title || "").trim().toLowerCase() === "cn unit 1"
          )
      )
      .sort((a, b) => {
        const getUnit = (title) =>
          Number(title.match(/\bunit\s*(\d+)\b/i)?.[1] || Infinity);
        return getUnit(a.title || "") - getUnit(b.title || "");
      });
  }, [playlists, decodedSubject]);

  const handleAttemptedToggle = useCallback(
    async (paperKey, current) => {
      const next = !current;
      try {
        await saveProgress(paperKey, { attempted: next });
      } catch {
        console.error("[Resources] Attempt status could not be saved");
      }
    },
    [saveProgress]
  );

  // Initial tab selection once data arrives (only open if paper is uploaded)
  const initialOpenDoneRef = useRef(false);
  useEffect(() => {
    if (loading || initialOpenDoneRef.current) return;
    initialOpenDoneRef.current = true;

    // Find first slot that actually has questions uploaded
    const firstUploaded = paperPairs.find((p) => Boolean(p.questions));
    if (firstUploaded) {
      const initialItem = {
        id: `pyq-${firstUploaded.slot}`,
        type: "pyq",
        slot: firstUploaded.slot,
        title: firstUploaded.slot,
        paperKey: firstUploaded.paperKey,
        questions: firstUploaded.questions,
        solution: firstUploaded.solution,
        activeVariant: "questions",
      };
      setOpenFiles([initialItem]);
      setActiveFile(initialItem);
      // Auto-check on open
      if (firstUploaded.paperKey && !progressMap[firstUploaded.paperKey]?.attempted) {
        handleAttemptedToggle(firstUploaded.paperKey, false);
      }
    }
  }, [loading, paperPairs, progressMap, handleAttemptedToggle]);

  // Keyboard shortcut Ctrl+B / Cmd+B for explorer sidebar toggle
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setIsExplorerOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const openViewer = (resource, linkedResource, customTitle) => {
    setViewer({
      open: true,
      url: resource.url,
      title: customTitle || resource.title,
      variant: resource.variant,
      linkedUrl: linkedResource?.url || "",
    });
  };

  const closeViewer = () =>
    setViewer({ open: false, url: "", title: "", variant: "", linkedUrl: "" });

  const toggleVariant = () => {
    if (viewer.linkedUrl) {
      setViewer((v) => ({
        ...v,
        url: v.linkedUrl,
        title:
          v.variant === "questions"
            ? v.title.replace(" (Solution)", "") + " (Solution)"
            : v.title.replace(" (Solution)", ""),
        variant: v.variant === "questions" ? "solution" : "questions",
        linkedUrl: v.url,
      }));
    }
  };

  // Open item in workspace tab strip
  const handleOpenFile = (item, closeExplorerOnMobile = true) => {
    const existing = openFiles.find((f) => f.id === item.id);
    if (!existing) {
      setOpenFiles((prev) => [...prev, item]);
    }
    setActiveFile(item);

    // Auto check attempted status on open if not already checked
    if (item.type === "pyq" && item.paperKey && !progressMap[item.paperKey]?.attempted) {
      handleAttemptedToggle(item.paperKey, false);
    }

    if (closeExplorerOnMobile && typeof window !== "undefined" && window.innerWidth < 768) {
      setIsExplorerOpen(false);
    }
  };

  // Close item tab
  const handleCloseFile = (e, fileId) => {
    e.stopPropagation();
    const remaining = openFiles.filter((f) => f.id !== fileId);
    setOpenFiles(remaining);
    if (activeFile?.id === fileId) {
      setActiveFile(remaining.length > 0 ? remaining[remaining.length - 1] : null);
    }
  };

  // Switch PYQ variant between questions and solution
  const handleVariantSwitch = (variant) => {
    if (!activeFile || activeFile.type !== "pyq") return;
    const updated = {
      ...activeFile,
      activeVariant: variant,
    };
    setActiveFile(updated);
    setOpenFiles((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
  };

  // Navigation tabs for MagneticMorphingNav
  const uploadedPyqsCount = useMemo(
    () => paperPairs.filter((p) => p.questions).length,
    [paperPairs]
  );
  const navTabs = [
    {
      id: "pyqs",
      label: "PYQs",
      icon: <FileQuestion size={15} />,
      count: uploadedPyqsCount,
    },
    {
      id: "playlists",
      label: "Playlists",
      icon: <ListVideo size={15} />,
      count: sortedPlaylists.length,
    },
    {
      id: "notes",
      label: "Notes",
      icon: <FileText size={15} />,
      count: notes.length,
    },
  ];

  // Filtering Explorer Items based on Search Query (Only show uploaded papers)
  const filteredPaperPairs = useMemo(() => {
    const uploadedOnly = paperPairs.filter((p) => Boolean(p.questions));
    if (!searchQuery.trim()) return uploadedOnly;
    const q = searchQuery.toLowerCase();
    return uploadedOnly.filter(
      (p) =>
        p.slot.toLowerCase().includes(q) ||
        p.questions?.title?.toLowerCase().includes(q) ||
        p.questions?.paperTag?.toLowerCase().includes(q)
    );
  }, [paperPairs, searchQuery]);

  const filteredPlaylists = useMemo(() => {
    if (!searchQuery.trim()) return sortedPlaylists;
    const q = searchQuery.toLowerCase();
    return sortedPlaylists.filter(
      (pl) =>
        pl.title?.toLowerCase().includes(q) ||
        pl.description?.toLowerCase().includes(q)
    );
  }, [sortedPlaylists, searchQuery]);

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const q = searchQuery.toLowerCase();
    return notes.filter(
      (n) =>
        n.title?.toLowerCase().includes(q) ||
        n.description?.toLowerCase().includes(q)
    );
  }, [notes, searchQuery]);

  if (loading) {
    return (
      <div className="resources-loading">
        <Loader2 className="spin" size={32} /> Loading resources…
      </div>
    );
  }

  if (error) {
    return (
      <div className="resources-error">
        <AlertCircle size={32} /> {error}{" "}
        <button onClick={loadData}>Retry</button>
      </div>
    );
  }

  // Active PYQ helpers
  const activePdfUrl =
    activeFile?.type === "pyq"
      ? activeFile.activeVariant === "solution" && activeFile.solution
        ? activeFile.solution.url
        : activeFile.questions?.url
      : activeFile?.type === "note"
      ? activeFile.url
      : null;

  const activePdfTitle =
    activeFile?.type === "pyq"
      ? `${activeFile.slot} (${activeFile.activeVariant === "solution" ? "Solution" : "Questions"})`
      : activeFile?.title || "Document";

  return (
    <div className="subject-workspace-page">
      {/* Top Header & Breadcrumb */}
      <header className="subject-workspace-header">
        <Breadcrumb className="res-breadcrumb-wrap">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink to="/resources?all=true">Resources</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink to={`/resources/${encodeURIComponent(decodedYear)}`}>
                {decodedYear}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{decodedSubject}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="subject-workspace-bar">
          <h1 className="subject-workspace-heading">
            <Layers size={27} />
            <span>{decodedSubject}</span>
          </h1>

          {/* Resource Type Switcher matching YearPage .res-year-switcher */}
          <div className="subject-tab-switcher" role="tablist" aria-label="Resource category">
            {navTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <WarmTooltip
                  key={tab.id}
                  content={`Browse ${tab.label} (${tab.count})`}
                  side="bottom"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => {
                      const tabId = tab.id;
                      setActiveTab(tabId);
                      if (typeof window !== "undefined" && window.innerWidth < 768) {
                        setIsExplorerOpen(true);
                      }
                      if (tabId === "playlists" && sortedPlaylists.length > 0) {
                        const currentIsPlaylist = activeFile?.type === "playlist";
                        if (!currentIsPlaylist) {
                          const firstPl = sortedPlaylists[0];
                          handleOpenFile({
                            id: `playlist-${firstPl._id}`,
                            type: "playlist",
                            title: firstPl.title,
                            description: firstPl.description,
                            url: firstPl.url,
                            raw: firstPl,
                          }, false);
                        }
                      } else if (tabId === "pyqs") {
                        const currentIsPyq = activeFile?.type === "pyq";
                        if (!currentIsPyq) {
                          const firstUploaded = paperPairs.find((p) => p.questions) || paperPairs[0];
                          if (firstUploaded) {
                            handleOpenFile({
                              id: `pyq-${firstUploaded.slot}`,
                              type: "pyq",
                              slot: firstUploaded.slot,
                              title: firstUploaded.slot,
                              paperKey: firstUploaded.paperKey,
                              questions: firstUploaded.questions,
                              solution: firstUploaded.solution,
                              activeVariant: "questions",
                            }, false);
                          }
                        }
                      } else if (tabId === "notes" && notes.length > 0) {
                        const currentIsNote = activeFile?.type === "note";
                        if (!currentIsNote) {
                          const firstNote = notes[0];
                          handleOpenFile({
                            id: `note-${firstNote._id}`,
                            type: "note",
                            title: firstNote.title,
                            description: firstNote.description,
                            url: firstNote.url,
                            raw: firstNote,
                          }, false);
                        }
                      }
                    }}
                    className={`subject-tab-switcher-btn ${isActive ? "active" : ""}`}
                  >
                    {tab.label}
                  </button>
                </WarmTooltip>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Workspace Frame (AI Site Notes UI Exact Style) */}
      <div className="tooldeck-workspace-frame">
        {/* --- LEFT SIDEBAR (EXPLORER) --- */}
        <AnimatePresence initial={false}>
          {isExplorerOpen && (
            <MotionDiv
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="tooldeck-explorer-panel"
            >
              <div className="tooldeck-explorer-head">
                <span className="tooldeck-explorer-title">EXPLORER</span>
                <button
                  type="button"
                  onClick={() => setIsExplorerOpen(false)}
                  className="tooldeck-explorer-close-btn"
                  title="Collapse Explorer (Ctrl+B)"
                >
                  <ChevronLeft size={16} />
                </button>
              </div>

              <div className="tooldeck-explorer-search">
                <div className="tooldeck-explorer-search-input-wrap">
                  <Search size={14} className="tooldeck-explorer-search-icon" />
                  <input
                    type="text"
                    placeholder={`Search ${activeTab}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="tooldeck-explorer-search-input"
                  />
                </div>
              </div>

              {/* Explorer File List based on Active Tab */}
              <div className="tooldeck-explorer-files">
                {activeTab === "pyqs" &&
                  (filteredPaperPairs.length === 0 ? (
                    <div className="tooldeck-explorer-empty">
                      {searchQuery
                        ? `No paper slots matching "${searchQuery}"`
                        : "No papers uploaded yet for this subject"}
                    </div>
                  ) : (
                    filteredPaperPairs.map(({ slot, paperKey, questions, solution }) => {
                      const fileId = `pyq-${slot}`;
                      const isActive = activeFile?.id === fileId;
                      const isAttempted = progressMap[paperKey]?.attempted;

                      return (
                        <div
                          key={slot}
                          onClick={() =>
                            handleOpenFile({
                              id: fileId,
                              type: "pyq",
                              slot,
                              title: slot,
                              paperKey,
                              questions,
                              solution,
                              activeVariant: "questions",
                            })
                          }
                          className={`tooldeck-explorer-item ${isActive ? "active" : ""}`}
                          title={`${slot} (Uploaded)`}
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAttemptedToggle(paperKey, isAttempted);
                            }}
                            className={`tooldeck-item-checkbox-btn ${isAttempted ? "checked" : ""}`}
                            title={isAttempted ? "Attempted (click to unmark)" : "Click to mark attempted"}
                            aria-label={isAttempted ? "Attempted" : "Mark attempted"}
                          >
                            {isAttempted ? (
                              <CheckSquare size={16} className="text-teal-400" />
                            ) : (
                              <Square size={16} />
                            )}
                          </button>
                          <div className="tooldeck-explorer-item-info">
                            <span className="tooldeck-explorer-item-name">{slot}</span>
                            <span className="tooldeck-explorer-item-meta">
                              {solution ? "Questions • Solution" : "Questions"}
                            </span>
                          </div>
                          <span className={`tooldeck-explorer-item-badge ${isAttempted ? "attempted" : "available"}`}>
                            {isAttempted ? "Done" : "PDF"}
                          </span>
                        </div>
                      );
                    })
                  ))}

                {activeTab === "playlists" &&
                  (filteredPlaylists.length === 0 ? (
                    <div className="tooldeck-explorer-empty">
                      No playlists found for this subject
                    </div>
                  ) : (
                    filteredPlaylists.map((pl) => {
                      const fileId = `playlist-${pl._id}`;
                      const isActive = activeFile?.id === fileId;

                      return (
                        <div
                          key={pl._id}
                          onClick={() =>
                            handleOpenFile({
                              id: fileId,
                              type: "playlist",
                              title: pl.title,
                              description: pl.description,
                              url: pl.url,
                              raw: pl,
                            })
                          }
                          className={`tooldeck-explorer-item ${isActive ? "active" : ""}`}
                          title={pl.title}
                        >
                          <ListVideo size={16} className="tooldeck-explorer-item-icon" />
                          <div className="tooldeck-explorer-item-info">
                            <span className="tooldeck-explorer-item-name">
                              {pl.title}
                            </span>
                            <span className="tooldeck-explorer-item-meta">
                              {pl.description || "Video playlist"}
                            </span>
                          </div>
                          <Play size={12} className="opacity-60 shrink-0" />
                        </div>
                      );
                    })
                  ))}

                {activeTab === "notes" &&
                  (filteredNotes.length === 0 ? (
                    <div className="tooldeck-explorer-empty">
                      No notes found for this subject
                    </div>
                  ) : (
                    filteredNotes.map((note) => {
                      const fileId = `note-${note._id}`;
                      const isActive = activeFile?.id === fileId;

                      return (
                        <div
                          key={note._id}
                          onClick={() =>
                            handleOpenFile({
                              id: fileId,
                              type: "note",
                              title: note.title,
                              description: note.description,
                              url: note.url,
                              raw: note,
                            })
                          }
                          className={`tooldeck-explorer-item ${isActive ? "active" : ""}`}
                          title={note.title}
                        >
                          <FileText size={16} className="tooldeck-explorer-item-icon" />
                          <div className="tooldeck-explorer-item-info">
                            <span className="tooldeck-explorer-item-name">
                              {note.title}
                            </span>
                            <span className="tooldeck-explorer-item-meta">
                              {note.description || "PDF Notes"}
                            </span>
                          </div>
                          <span className="tooldeck-explorer-item-badge available">
                            PDF
                          </span>
                        </div>
                      );
                    })
                  ))}
              </div>
            </MotionDiv>
          )}
        </AnimatePresence>

        {/* Mobile Backdrop when Explorer is Open */}
        {isExplorerOpen && (
          <div
            className="tooldeck-explorer-backdrop"
            onClick={() => setIsExplorerOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* --- RIGHT: EDITOR / WORKSPACE STAGE --- */}
        <div className="tooldeck-editor-panel">
          {/* Header Tab Strip & Tools Merged in a Single Row */}
          <div className="tooldeck-editor-header">
            <div className="tooldeck-header-left">
              {!isExplorerOpen && (
                <WarmTooltip content="Show Explorer (Ctrl+B)" side="bottom">
                  <button
                    type="button"
                    onClick={() => setIsExplorerOpen(true)}
                    className="tooldeck-editor-toggle-btn"
                    title="Show Explorer (Ctrl+B)"
                  >
                    <Sidebar size={16} />
                  </button>
                </WarmTooltip>
              )}

              {/* Tab Strip */}
              <div className="tooldeck-tabs-strip">
                {openFiles.length === 0 ? (
                  <span className="tooldeck-no-tabs-hint">No open files</span>
                ) : (
                  openFiles.map((file) => {
                    const isTabActive = activeFile?.id === file.id;
                    const IconComponent =
                      file.type === "pyq"
                        ? FileQuestion
                        : file.type === "playlist"
                        ? ListVideo
                        : FileText;

                    return (
                      <div
                        key={file.id}
                        onClick={() => setActiveFile(file)}
                        className={`tooldeck-tab ${isTabActive ? "active" : ""}`}
                        title={file.title}
                      >
                        <IconComponent
                          size={13}
                          className={`tooldeck-tab-icon ${isTabActive ? "active" : ""}`}
                        />
                        <span className="tooldeck-tab-title">{file.title}</span>
                        <button
                          type="button"
                          onClick={(e) => handleCloseFile(e, file.id)}
                          className="tooldeck-tab-close"
                          title="Close tab"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Single Row Controls & Icon-Only Actions on Right */}
            {activeFile && (
              <div className="tooldeck-header-tools">
                {/* Questions / Solution toggle */}
                {activeFile.type === "pyq" && (
                  <div className="subject-variant-group">
                    <button
                      type="button"
                      onClick={() => handleVariantSwitch("questions")}
                      className={`subject-variant-btn ${
                        activeFile.activeVariant === "questions" ? "active" : ""
                      }`}
                      disabled={!activeFile.questions}
                    >
                      Questions
                    </button>
                    <button
                      type="button"
                      onClick={() => handleVariantSwitch("solution")}
                      className={`subject-variant-btn ${
                        activeFile.activeVariant === "solution" ? "active" : ""
                      }`}
                      disabled={!activeFile.solution}
                      title={
                        activeFile.solution
                          ? "View Solution"
                          : "Solution not uploaded yet"
                      }
                    >
                      Solution
                    </button>
                  </div>
                )}

                {/* Right: Icon-only actions with no outline / no background */}
                <div className="tooldeck-header-actions">
                  {activePdfUrl && (
                    <WarmTooltip content="Download PDF" side="bottom">
                      <a
                        href={getAttachmentUrl(activePdfUrl)}
                        download
                        className="tooldeck-icon-action-btn"
                        aria-label="Download PDF"
                      >
                        <Download size={15} />
                      </a>
                    </WarmTooltip>
                  )}

                  {activePdfUrl && (
                    <WarmTooltip content="Fullscreen" side="bottom">
                      <button
                        type="button"
                        onClick={() => {
                          if (activeFile.type === "pyq") {
                            const targetResource =
                              activeFile.activeVariant === "solution"
                                ? activeFile.solution
                                : activeFile.questions;
                            const linked =
                              activeFile.activeVariant === "solution"
                                ? activeFile.questions
                                : activeFile.solution;
                            if (targetResource) openViewer(targetResource, linked, activeFile.slot);
                          } else if (activeFile.type === "note") {
                            openViewer(activeFile, null, activeFile.title);
                          }
                        }}
                        className="tooldeck-icon-action-btn"
                        aria-label="Fullscreen"
                      >
                        <Maximize2 size={15} />
                      </button>
                    </WarmTooltip>
                  )}

                  {activeFile.type === "playlist" && activeFile.url && (
                    <WarmTooltip content="Open on YouTube" side="bottom">
                      <a
                        href={activeFile.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="tooldeck-icon-action-btn"
                        aria-label="Open on YouTube"
                      >
                        <ExternalLink size={15} />
                      </a>
                    </WarmTooltip>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Body Stage */}
          <div className="tooldeck-workspace-body">
            {/* Case 1: Active PYQ */}
            {activeFile?.type === "pyq" && (
              <>
                {activePdfUrl ? (
                  <div className="tooldeck-pdf-container">
                    <iframe
                      src={getFullWidthPdfUrl(activePdfUrl)}
                      className="tooldeck-pdf-iframe"
                      title={activePdfTitle}
                    />
                  </div>
                ) : (
                  <div className="subject-empty-slot-stage">
                    <div className="subject-empty-slot-icon">
                      <FileQuestion size={30} />
                    </div>
                    <h3 className="subject-empty-slot-title">
                      {activeFile.slot} Not Uploaded
                    </h3>
                    <p className="subject-empty-slot-desc">
                      This question paper or solution has not been uploaded yet. You can
                      upload this paper from the admin dashboard.
                    </p>
                    <span className="subject-empty-slot-tag">
                      Slot: {activeFile.slot}
                    </span>
                  </div>
                )}
              </>
            )}

            {/* Case 2: Active Playlist */}
            {activeFile?.type === "playlist" && (
              <div className="subject-video-stage">
                <div className="subject-video-card-frame">
                  <div className="subject-video-player-wrap">
                    {getYouTubeEmbedUrl(activeFile.url) ? (
                      <iframe
                        src={getYouTubeEmbedUrl(activeFile.url)}
                        title={`${activeFile.title} player`}
                        loading="lazy"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-muted">
                        <ListVideo size={48} className="opacity-40 mb-2" />
                        <span>Preview not available</span>
                      </div>
                    )}
                  </div>
                  <div className="subject-video-card-info">
                    <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                      <h3 className="subject-video-card-title">{activeFile.title}</h3>
                      <a
                        href={activeFile.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="subject-video-yt-btn"
                      >
                        <ExternalLink size={13} /> Open on YouTube
                      </a>
                    </div>
                    <p className="subject-video-card-desc">
                      {activeFile.description || "Video playlist and lecture unit."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Case 3: Active Note */}
            {activeFile?.type === "note" && (
              <div className="tooldeck-pdf-container">
                {activeFile.url ? (
                  <iframe
                    src={getFullWidthPdfUrl(activeFile.url)}
                    className="tooldeck-pdf-iframe"
                    title={activeFile.title}
                  />
                ) : (
                  <div className="tooldeck-text-doc">
                    <h2 className="tooldeck-text-doc-title">{activeFile.title}</h2>
                    <p className="tooldeck-text-doc-body">
                      {activeFile.description || "No preview content available."}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Case 4: No Open Files (Start Screen - AI Site Exact Layout) */}
            {!activeFile && (
              <div className="tooldeck-start-screen">
                <div className="tooldeck-start-icon-wrap">
                  <Sparkles size={48} />
                </div>
                <h2 className="tooldeck-start-title">{decodedSubject} Academic Drive</h2>
                <div className="tooldeck-start-commands">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("pyqs");
                      const firstUploaded = paperPairs.find((p) => Boolean(p.questions));
                      if (firstUploaded) {
                        handleOpenFile({
                          id: `pyq-${firstUploaded.slot}`,
                          type: "pyq",
                          slot: firstUploaded.slot,
                          title: firstUploaded.slot,
                          paperKey: firstUploaded.paperKey,
                          questions: firstUploaded.questions,
                          solution: firstUploaded.solution,
                          activeVariant: "questions",
                        });
                      }
                    }}
                    className="tooldeck-start-cmd-row"
                  >
                    <div className="tooldeck-start-cmd-left">
                      <FileQuestion size={16} />
                      <span>Open Question Papers</span>
                    </div>
                    <span className="tooldeck-start-kbd">PYQ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("playlists");
                      if (sortedPlaylists.length > 0) {
                        const pl = sortedPlaylists[0];
                        handleOpenFile({
                          id: `playlist-${pl._id}`,
                          type: "playlist",
                          title: pl.title,
                          description: pl.description,
                          url: pl.url,
                          raw: pl,
                        });
                      }
                    }}
                    className="tooldeck-start-cmd-row"
                  >
                    <div className="tooldeck-start-cmd-left">
                      <ListVideo size={16} />
                      <span>Browse Video Playlists</span>
                    </div>
                    <span className="tooldeck-start-kbd">VIDEOS</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("notes");
                      if (notes.length > 0) {
                        const note = notes[0];
                        handleOpenFile({
                          id: `note-${note._id}`,
                          type: "note",
                          title: note.title,
                          description: note.description,
                          url: note.url,
                          raw: note,
                        });
                      }
                    }}
                    className="tooldeck-start-cmd-row"
                  >
                    <div className="tooldeck-start-cmd-left">
                      <FileText size={16} />
                      <span>Read Study Notes</span>
                    </div>
                    <span className="tooldeck-start-kbd">NOTES</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen PdfViewer Modal */}
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
