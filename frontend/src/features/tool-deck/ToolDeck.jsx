import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ListTodo,
  BookOpen,
  Calculator,
  TrendingUp,
  Plus,
  Check,
  CheckSquare,
  Pin,
  Trash2,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Search,
  Sparkles,
  FileText,
  Eye,
  Download,
  FolderOpen,
  Sidebar,
  Command,
  X,
  ClipboardCheck,
} from "lucide-react";
import MagneticMorphingNav from "../../components/layout/MagneticMorphingNav";
import useTasks from "../../hooks/useTasks";
import { fetchResources } from "../../services/resourceService";
import { API_URL } from "../../config/api";
import PdfViewer from "../resources/components/PdfViewer";
import SGPA from "../sgpa/SGPA";
import CGPA from "../cgpa/CGPA";
import InternalMarksPage from "../internalMarks/InternalMarksPage";
import WarmTooltip from "../../components/ui/WarmTooltip";
import "../sgpa/pages/Sgpapage.css";
import "../cgpa/cgpa.css";
import "../internalMarks/InternalMarksPage.css";
import "./toolDeck.css";

const MotionDiv = motion.div;

const getAttachmentUrl = (url) =>
  url?.replace("/upload/", "/upload/fl_attachment/") || url;

const VALID_TABS = ["todos", "notes", "sgpa", "cgpa", "internals"];
const resolveTab = (tab) => {
  if (tab === "calculator") return "sgpa";
  if (tab === "internal" || tab === "internals") return "internals";
  return VALID_TABS.includes(tab) ? tab : null;
};

export default function ToolDeck({ initialTab = "todos" }) {
  const settingsReady = useRef(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const queryTab = searchParams.get("tab");

  const [internalTab, setInternalTab] = useState(() => {
    const resolvedQuery = resolveTab(queryTab);
    if (resolvedQuery) return resolvedQuery;
    try {
      const saved = resolveTab(localStorage.getItem("edubits_tool_deck_preference"));
      if (saved) return saved;
    } catch {
      // ignore
    }
    return resolveTab(initialTab) || "todos";
  });

  const activeTab = resolveTab(queryTab) || internalTab;

  const handleTabChange = (tabId) => {
    setInternalTab(tabId);
    setSearchParams({ tab: tabId });
    try {
      localStorage.setItem("edubits_tool_deck_preference", tabId);
    } catch {
      // ignore
    }
  };

  // --- TODOS STATE & ACTIONS ---
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const [newTodo, setNewTodo] = useState("");
  const [filter, setFilter] = useState("all");
  const [expandedTasks, setExpandedTasks] = useState({});
  const [pinnedTasks, setPinnedTasks] = useState(() => {
    try {
      const saved = localStorage.getItem("edubits_pinned_tasks");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [subtasksMap, setSubtasksMap] = useState(() => {
    try {
      const saved = localStorage.getItem("edubits_subtasks_map");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Migrate existing browser-only deck data once, then keep the server copy current.
  useEffect(() => {
    let active = true;
    const keys = ["subjects", "simForm", "sgpaList", "edubits_pinned_tasks", "edubits_subtasks_map"];
    fetch(`${API_URL}/users/me/settings`, { credentials: "include" })
      .then((response) => response.ok ? response.json() : null)
      .then(async (data) => {
        if (!active || !data) return;
        const serverSettings = data.settings || {};
        const localSettings = Object.fromEntries(keys.flatMap((key) => {
          try {
            const value = localStorage.getItem(key);
            return value === null ? [] : [[key, JSON.parse(value)]];
          } catch { return []; }
        }));
        const migration = Object.fromEntries(Object.entries(localSettings).filter(([key]) => serverSettings[key] === undefined));
        const settings = { ...localSettings, ...serverSettings };
        if (Object.keys(migration).length) {
          await fetch(`${API_URL}/users/me/settings`, {
            method: "PUT", credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ settings: migration }),
          });
        }
        if (!active) return;
        for (const key of keys) {
          if (settings[key] !== undefined) localStorage.setItem(key, JSON.stringify(settings[key]));
        }
        if (settings.edubits_pinned_tasks) setPinnedTasks(settings.edubits_pinned_tasks);
        if (settings.edubits_subtasks_map) setSubtasksMap(settings.edubits_subtasks_map);
        if (settings.sgpaList) setSgpaList(settings.sgpaList);
        settingsReady.current = true;
        window.dispatchEvent(new Event("edubits-settings-loaded"));
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const persistToolSettings = useCallback((patch) => {
    if (!settingsReady.current) return;
    const keys = ["subjects", "simForm", "sgpaList", "edubits_pinned_tasks", "edubits_subtasks_map"];
    const settings = {};
    for (const key of keys) {
      try {
        const value = localStorage.getItem(key);
        if (value !== null) settings[key] = JSON.parse(value);
      } catch { /* ignore malformed legacy values */ }
    }
    fetch(`${API_URL}/users/me/settings`, {
      method: "PUT", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings: { ...settings, ...patch } }),
    }).catch(() => {});
  }, []);


  const [newSubtaskInputs, setNewSubtaskInputs] = useState({});
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const pendingCount = useMemo(() => {
    return tasks.filter((t) => t.status !== "done").length;
  }, [tasks]);

  const handleAddTodo = (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    addTask({
      title: newTodo.trim(),
      status: "todo",
      priority: "medium",
      type: "assignment",
    });
    setNewTodo("");
  };

  const togglePin = (taskId) => {
    const isPinned = pinnedTasks.includes(taskId);
    const updated = isPinned ? pinnedTasks.filter((id) => id !== taskId) : [...pinnedTasks, taskId];
    setPinnedTasks(updated);
    try {
      localStorage.setItem("edubits_pinned_tasks", JSON.stringify(updated));
    } catch {
      // ignore
    }
    persistToolSettings({ edubits_pinned_tasks: updated });

  };

  const handleToggleTaskStatus = (task) => {
    const nextStatus = task.status === "done" ? "todo" : "done";
    updateTask(task._id, { status: nextStatus });
    if (nextStatus === "done" && typeof window !== "undefined") {
      import("canvas-confetti").then((m) => {
        const confetti = m.default || m;
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.8 },
          colors: ["#3e9b8f", "#5cc2b4", "#115d62", "#ffffff"],
        });
      }).catch(() => {});
    }
  };

  const handleStartEdit = (task) => {
    setEditingTaskId(task._id);
    setEditingText(task.title);
  };

  const handleSaveEdit = (taskId) => {
    if (editingText.trim()) {
      updateTask(taskId, { title: editingText.trim() });
    }
    setEditingTaskId(null);
    setEditingText("");
  };

  const toggleExpand = (taskId) => {
    setExpandedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const handleAddSubtask = (taskId, e) => {
    e.preventDefault();
    const text = (newSubtaskInputs[taskId] || "").trim();
    if (!text) return;

    const currentSubtasks = subtasksMap[taskId] || [];
    const updated = [
      ...currentSubtasks,
      { id: Date.now().toString(), text, done: false },
    ];

    const nextMap = { ...subtasksMap, [taskId]: updated };
    setSubtasksMap(nextMap);
    setNewSubtaskInputs((prev) => ({ ...prev, [taskId]: "" }));
    try {
      localStorage.setItem("edubits_subtasks_map", JSON.stringify(nextMap));
    } catch {
      // ignore
    }
    persistToolSettings({ edubits_subtasks_map: nextMap });

  };

  const handleToggleSubtask = (taskId, subtaskId) => {
    const currentSubtasks = subtasksMap[taskId] || [];
    const updated = currentSubtasks.map((st) =>
      st.id === subtaskId ? { ...st, done: !st.done } : st
    );
    const nextMap = { ...subtasksMap, [taskId]: updated };
    setSubtasksMap(nextMap);
    try {
      localStorage.setItem("edubits_subtasks_map", JSON.stringify(nextMap));
    } catch {
      // ignore
    }
    persistToolSettings({ edubits_subtasks_map: nextMap });

  };

  const handleDeleteSubtask = (taskId, subtaskId) => {
    const currentSubtasks = subtasksMap[taskId] || [];
    const updated = currentSubtasks.filter((st) => st.id !== subtaskId);
    const nextMap = { ...subtasksMap, [taskId]: updated };
    setSubtasksMap(nextMap);
    try {
      localStorage.setItem("edubits_subtasks_map", JSON.stringify(nextMap));
    } catch {
      // ignore
    }
    persistToolSettings({ edubits_subtasks_map: nextMap });

  };

  const filteredTasks = useMemo(() => {
    const list = tasks.filter((t) => {
      if (filter === "pending") return t.status !== "done";
      if (filter === "completed") return t.status === "done";
      return true;
    });

    return list.sort((a, b) => {
      const aPinned = pinnedTasks.includes(a._id);
      const bPinned = pinnedTasks.includes(b._id);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [tasks, filter, pinnedTasks]);

  // --- NOTES (EXACT AI SITE WORKSPACE & EXPLORER DESIGN) ---
  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [isExplorerOpen, setIsExplorerOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("All");
  const [openFiles, setOpenFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [pdfViewer, setPdfViewer] = useState({ open: false, url: "", title: "" });
  const [showFileMenu, setShowFileMenu] = useState(false);
  const menuRef = useRef(null);

  const loadNotes = useCallback(async () => {
    setLoadingNotes(true);
    try {
      const data = await fetchResources({ type: "notes" });
      const fetched = data || [];
      setNotes(fetched);
      setOpenFiles((prev) => {
        if (prev.length === 0 && fetched.length > 0) {
          setActiveFile(fetched[0]);
          return [fetched[0]];
        }
        return prev;
      });
    } catch (err) {
      console.warn("Could not load notes:", err);
    } finally {
      setLoadingNotes(false);
    }
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

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

  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      if (selectedYear !== "All" && n.year !== selectedYear) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = n.title?.toLowerCase().includes(q);
        const matchesSubject = n.subject?.toLowerCase().includes(q);
        const matchesDesc = n.description?.toLowerCase().includes(q);
        const matchesYear = n.year?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSubject && !matchesDesc && !matchesYear) return false;
      }
      return true;
    });
  }, [notes, selectedYear, searchQuery]);

  const openNote = (note) => {
    const existing = openFiles.find((f) => f._id === note._id);
    if (!existing) {
      setOpenFiles((prev) => [...prev, note]);
    }
    setActiveFile(note);
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setIsExplorerOpen(false);
    }
  };

  const closeNote = (e, noteId) => {
    e.stopPropagation();
    const remain = openFiles.filter((f) => f._id !== noteId);
    setOpenFiles(remain);
    if (activeFile?._id === noteId) {
      setActiveFile(remain.length > 0 ? remain[remain.length - 1] : null);
    }
  };

  // --- SGPA & CGPA STATE ---
  const [sgpaList, setSgpaList] = useState(() => {
    try {
      const saved = localStorage.getItem("sgpaList");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const removeSGPA = (id) => setSgpaList((prev) => prev.filter((s) => s.id !== id));

  useEffect(() => {
    try {
      localStorage.setItem("sgpaList", JSON.stringify(sgpaList));
    } catch {
      // ignore
    }
    persistToolSettings({ sgpaList });
  }, [sgpaList, persistToolSettings]);

  // Main navigation tabs (Todos, Notes, SGPA, CGPA, Internals)
  const navTabs = [
    { id: "todos", label: "Todo", icon: <ListTodo size={15} />, count: pendingCount },
    { id: "notes", label: "Notes", icon: <BookOpen size={15} />, count: notes.length },
    { id: "sgpa", label: "SGPA", icon: <Calculator size={15} /> },
    { id: "cgpa", label: "CGPA", icon: <TrendingUp size={15} /> },
    { id: "internals", label: "Internals", icon: <ClipboardCheck size={15} /> },
  ];

  return (
    <div className="tooldeck-page">
      {/* HERO SECTION - Exact Reference AI Site Layout */}
      <div className="hero-sticky-wrapper">
        <div className="tooldeck-hero">
          <h1 className="tooldeck-title">TOOL DECK</h1>
          <p className="tooldeck-subtitle">
            {activeTab === "todos" && (
              <>
                You have <span className="tooldeck-pending-badge">{pendingCount}</span> pending task{pendingCount !== 1 ? "s" : ""}
              </>
            )}
            {activeTab === "notes" && (
              <>
                You have <span className="tooldeck-pending-badge">{notes.length}</span> verified note{notes.length !== 1 ? "s" : ""} in your academic drive
              </>
            )}
            {activeTab === "sgpa" && (
              <>
                Calculate your semester GPA from subject credits and grades
              </>
            )}
            {activeTab === "cgpa" && (
              <>
                Combine semesters, calculate cumulative CGPA, or predict target SGPA
              </>
            )}
            {activeTab === "internals" && (
              <>
                Calculate internal assessment marks and grade criteria for your semester
              </>
            )}
          </p>

          {activeTab === "todos" && (
            <div className="tooldeck-search-wrapper">
              <form onSubmit={handleAddTodo} className="tooldeck-search-bar">
                <input
                  type="text"
                  className="tooldeck-search-input"
                  placeholder="Create a new task..."
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                />
                <div className="tooldeck-search-actions">
                  <span className="tooldeck-kbd">ENTER</span>
                  <WarmTooltip content="Add new task" shortcut="↵" side="top">
                    <button type="submit" className="tooldeck-search-btn" title="Add task">
                      <Plus size={18} />
                    </button>
                  </WarmTooltip>
                </div>
              </form>
              <div className="tooldeck-footer-hint">#Start typing to create a new task.</div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Magnetic Morphing Capsule Navigation */}
      <div className="sticky-nav-container">
        <MagneticMorphingNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
          tabs={navTabs}
          mobileIconOnly
        />
      </div>

      {/* VIEW 1: TODOS (TASKS) */}
      {activeTab === "todos" && (
        <div className="tooldeck-tasks-container">
          <div className="tooldeck-section-header">
            <div className="tooldeck-section-title">
              <ListTodo size={24} />
              <span>My Tasks</span>
            </div>

            <div className="tooldeck-filter-pills">
              {["all", "pending", "completed"].map((f) => (
                <WarmTooltip
                  key={f}
                  content={`Show ${f} tasks`}
                  side="bottom"
                >
                  <button
                    type="button"
                    onClick={() => setFilter(f)}
                    className={`tooldeck-filter-btn ${filter === f ? "active" : ""}`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                </WarmTooltip>
              ))}
            </div>
          </div>

          <div className="tooldeck-task-list">
            {filteredTasks.length === 0 ? (
              <div className="tooldeck-empty-state">
                <CheckSquare size={48} strokeWidth={1} className="tooldeck-empty-icon" />
                <p>No tasks yet. Add one above!</p>
              </div>
            ) : (
              filteredTasks.map((task) => {
                const isPinned = pinnedTasks.includes(task._id);
                const isExpanded = !!expandedTasks[task._id];
                const subtasks = subtasksMap[task._id] || [];
                const completedSubtasks = subtasks.filter((st) => st.done).length;
                const isDone = task.status === "done";

                return (
                  <div
                    key={task._id}
                    className={`tooldeck-task-card ${isDone ? "completed" : ""} ${
                      isPinned ? "pinned" : ""
                    }`}
                  >
                    <div
                      className="tooldeck-task-header"
                      onClick={() => toggleExpand(task._id)}
                    >
                      {/* Checkbox */}
                      <div
                        className={`tooldeck-checkbox ${isDone ? "checked" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleTaskStatus(task);
                        }}
                        role="checkbox"
                        aria-checked={isDone}
                        title={isDone ? "Mark incomplete" : "Mark completed"}
                      >
                        {isDone && <Check size={12} strokeWidth={3.5} />}
                      </div>

                      {/* Main Title & Subtasks Counter */}
                      <div className="tooldeck-task-content">
                        {editingTaskId === task._id ? (
                          <input
                            type="text"
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            onBlur={() => handleSaveEdit(task._id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveEdit(task._id);
                              if (e.key === "Escape") setEditingTaskId(null);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="tooldeck-inline-input"
                            autoFocus
                          />
                        ) : (
                          <span
                            className={`tooldeck-task-title ${isDone ? "completed" : ""}`}
                            onDoubleClick={(e) => {
                              e.stopPropagation();
                              handleStartEdit(task);
                            }}
                            title="Double-click to edit"
                          >
                            {task.title}
                          </span>
                        )}

                        {subtasks.length > 0 && (
                          <p className="tooldeck-task-subtasks-summary">
                            {completedSubtasks}/{subtasks.length} subtasks
                          </p>
                        )}
                      </div>

                      {/* Action Icons */}
                      <div className="tooldeck-task-actions">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePin(task._id);
                          }}
                          className={`tooldeck-action-btn pin-btn ${isPinned ? "pinned" : ""}`}
                          title={isPinned ? "Unpin task" : "Pin task to top"}
                        >
                          <Pin size={18} className={isPinned ? "fill-current" : ""} />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(task._id);
                          }}
                          className={`tooldeck-action-btn chevron-btn ${isExpanded ? "expanded" : ""}`}
                          title="Toggle subtasks"
                        >
                          <ChevronDown
                            size={18}
                            className={`tooldeck-chevron ${isExpanded ? "rotated" : ""}`}
                          />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTask(task._id);
                          }}
                          className="tooldeck-action-btn delete-btn"
                          title="Delete task"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Subtasks Drawer */}
                    <div
                      className={`tooldeck-subtasks-drawer ${isExpanded ? "expanded" : ""}`}
                    >
                      <div className="tooldeck-subtasks-inner">
                        <div className="tooldeck-subtasks-tree">
                          {/* Connecting Tree Line */}
                          <div className="tooldeck-tree-line" />

                          {/* Subtasks List */}
                          {subtasks.map((st) => (
                            <div key={st.id} className="tooldeck-subtask-row">
                              <div
                                className={`tooldeck-sub-checkbox ${st.done ? "checked" : ""}`}
                                onClick={() => handleToggleSubtask(task._id, st.id)}
                                role="checkbox"
                                aria-checked={st.done}
                              >
                                {st.done && <Check size={10} strokeWidth={3.5} />}
                              </div>

                              <span
                                className={`tooldeck-subtask-label ${st.done ? "done" : ""}`}
                              >
                                {st.text}
                              </span>

                              <button
                                type="button"
                                onClick={() => handleDeleteSubtask(task._id, st.id)}
                                className="tooldeck-subtask-remove"
                                title="Remove step"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}

                          {/* Add Subtask Step Input */}
                          <form
                            onSubmit={(e) => handleAddSubtask(task._id, e)}
                            className="tooldeck-add-step-form"
                          >
                            <div className="tooldeck-add-step-icon">
                              <Plus size={14} />
                            </div>
                            <input
                              type="text"
                              value={newSubtaskInputs[task._id] || ""}
                              onChange={(e) =>
                                setNewSubtaskInputs((prev) => ({
                                  ...prev,
                                  [task._id]: e.target.value,
                                }))
                              }
                              placeholder="Add a step..."
                              className="tooldeck-add-step-input"
                            />
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: NOTES (EXACT REFERENCE AI SITE WORKSPACE & EXPLORER DESIGN) */}
      {activeTab === "notes" && (
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
                  <WarmTooltip content="Collapse Explorer" shortcut="Ctrl+B" side="right">
                    <button
                      type="button"
                      onClick={() => setIsExplorerOpen(false)}
                      className="tooldeck-explorer-close-btn"
                      title="Collapse Explorer (Ctrl+B)"
                    >
                      <ChevronLeft size={16} />
                    </button>
                  </WarmTooltip>
                </div>

                <div className="tooldeck-explorer-search">
                  <div className="tooldeck-explorer-search-input-wrap">
                    <Search size={14} className="tooldeck-explorer-search-icon" />
                    <input
                      type="text"
                      placeholder="Search files..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="tooldeck-explorer-search-input"
                    />
                  </div>
                </div>

                <div className="tooldeck-explorer-years">
                  {["All", "1st Year", "2nd Year", "3rd Year", "4th Year"].map((yr) => (
                    <WarmTooltip key={yr} content={`Filter by ${yr}`} side="bottom">
                      <button
                        type="button"
                        onClick={() => setSelectedYear(yr)}
                        className={`tooldeck-explorer-year-btn ${selectedYear === yr ? "active" : ""}`}
                      >
                        {yr === "All" ? "All" : yr.replace(" Year", "Y")}
                      </button>
                    </WarmTooltip>
                  ))}
                </div>

                <div className="tooldeck-explorer-files">
                  {loadingNotes ? (
                    <div className="tooldeck-explorer-loading">Loading notes...</div>
                  ) : filteredNotes.length === 0 ? (
                    <div className="tooldeck-explorer-empty">
                      No files matching "{searchQuery || selectedYear}"
                    </div>
                  ) : (
                    filteredNotes.map((note) => {
                      const isActive = activeFile?._id === note._id;
                      return (
                        <div
                          key={note._id}
                          onClick={() => openNote(note)}
                          className={`tooldeck-explorer-item ${isActive ? "active" : ""}`}
                          title={`${note.title} (${note.subject || "General"})`}
                        >
                          <FileText size={15} className="tooldeck-explorer-item-icon" />
                          <div className="tooldeck-explorer-item-info">
                            <span className="tooldeck-explorer-item-name">{note.title}</span>
                            <span className="tooldeck-explorer-item-meta">
                              {note.subject || "Core"} • {note.year || "1st Year"}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </MotionDiv>
            )}
          </AnimatePresence>

          {/* --- RIGHT: EDITOR / DOCUMENT VIEWER --- */}
          <div className="tooldeck-editor-panel">
            <div className="tooldeck-editor-header">
              {!isExplorerOpen && (
                <WarmTooltip content="Show Explorer" shortcut="Ctrl+B" side="right">
                  <button
                    type="button"
                    onClick={() => setIsExplorerOpen(true)}
                    className="tooldeck-editor-toggle-btn"
                    title="Show Explorer (Ctrl+B)"
                  >
                    <Sidebar size={17} />
                  </button>
                </WarmTooltip>
              )}

              <div className="tooldeck-file-menu-wrap" ref={menuRef}>
                <WarmTooltip content="File operations" side="bottom">
                  <button
                    type="button"
                    onClick={() => setShowFileMenu(!showFileMenu)}
                    className={`tooldeck-file-menu-btn ${showFileMenu ? "active" : ""}`}
                  >
                    <FolderOpen size={15} />
                    <span>File</span>
                  </button>
                </WarmTooltip>

                <AnimatePresence>
                  {showFileMenu && (
                    <MotionDiv
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="tooldeck-file-dropdown"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setIsExplorerOpen(true);
                          setShowFileMenu(false);
                        }}
                        className="tooldeck-dropdown-item"
                      >
                        <Sidebar size={15} />
                        <span>Show Explorer</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOpenFiles([]);
                          setActiveFile(null);
                          setShowFileMenu(false);
                        }}
                        className="tooldeck-dropdown-item"
                      >
                        <X size={15} />
                        <span>Close All Tabs</span>
                      </button>
                    </MotionDiv>
                  )}
                </AnimatePresence>
              </div>

              <div className="tooldeck-divider-vertical" />

              <div className="tooldeck-tabs-strip">
                {openFiles.length === 0 ? (
                  <span className="tooldeck-no-tabs-hint">No open files</span>
                ) : (
                  openFiles.map((file) => {
                    const isTabActive = activeFile?._id === file._id;
                    return (
                      <div
                        key={file._id}
                        onClick={() => setActiveFile(file)}
                        className={`tooldeck-tab ${isTabActive ? "active" : ""}`}
                        title={file.title}
                      >
                        <FileText
                          size={13}
                          className={`tooldeck-tab-icon ${isTabActive ? "active" : ""}`}
                        />
                        <span className="tooldeck-tab-title">{file.title}</span>
                        <button
                          type="button"
                          onClick={(e) => closeNote(e, file._id)}
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

              {activeFile && (
                <div className="tooldeck-header-actions">
                  {activeFile.url && (
                    <WarmTooltip content="Download PDF document" side="bottom">
                      <a
                        href={getAttachmentUrl(activeFile.url)}
                        download
                        className="tooldeck-icon-action-btn"
                        title="Download PDF document"
                        aria-label="Download"
                      >
                        <Download size={16} />
                      </a>
                    </WarmTooltip>
                  )}

                  {activeFile.url && (
                    <WarmTooltip content="Open Fullscreen PDF Viewer" side="bottom">
                      <button
                        type="button"
                        onClick={() => setPdfViewer({ open: true, url: activeFile.url, title: activeFile.title })}
                        className="tooldeck-icon-action-btn"
                        title="Open Fullscreen PDF Viewer"
                        aria-label="Fullscreen"
                      >
                        <Eye size={16} />
                      </button>
                    </WarmTooltip>
                  )}

                  {activeFile.subject && activeFile.year && (
                    <WarmTooltip content="Open Subject in Resources" side="bottom">
                      <Link
                        to={`/resources/${encodeURIComponent(activeFile.year)}/${encodeURIComponent(activeFile.subject)}`}
                        className="tooldeck-icon-action-btn"
                        title="Open Subject in Resources"
                        aria-label="Subject"
                      >
                        <ExternalLink size={16} />
                      </Link>
                    </WarmTooltip>
                  )}
                </div>
              )}
            </div>

            <div className="tooldeck-workspace-body">
              {activeFile ? (
                activeFile.url ? (
                  <div className="tooldeck-pdf-container">
                    <iframe
                      src={`${activeFile.url}#toolbar=0`}
                      title={activeFile.title}
                      className="tooldeck-pdf-iframe"
                    />
                  </div>
                ) : (
                  <div className="tooldeck-text-doc">
                    <h2 className="tooldeck-text-doc-title">{activeFile.title}</h2>
                    <p className="tooldeck-text-doc-body">
                      {activeFile.description || "No preview text available for this document."}
                    </p>
                  </div>
                )
              ) : (
                <div className="tooldeck-start-screen">
                  <div className="tooldeck-start-icon-wrap">
                    <Command size={44} />
                  </div>
                  <h2 className="tooldeck-start-title">Get Started</h2>
                  <div className="tooldeck-start-commands">
                    <button
                      type="button"
                      className="tooldeck-start-cmd-row"
                      onClick={() => {
                        if (filteredNotes.length > 0) openNote(filteredNotes[0]);
                        else setIsExplorerOpen(true);
                      }}
                    >
                      <div className="tooldeck-start-cmd-left">
                        <FileText size={16} />
                        <span>Open First Note</span>
                      </div>
                      <span className="tooldeck-start-kbd">ENTER</span>
                    </button>

                    <button
                      type="button"
                      className="tooldeck-start-cmd-row"
                      onClick={() => setIsExplorerOpen(!isExplorerOpen)}
                    >
                      <div className="tooldeck-start-cmd-left">
                        <Sidebar size={16} />
                        <span>{isExplorerOpen ? "Hide Explorer" : "Show Explorer"}</span>
                      </div>
                      <span className="tooldeck-start-kbd">CTRL B</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <PdfViewer
            key={`${pdfViewer.open}-${pdfViewer.url}`}
            isOpen={pdfViewer.open}
            onClose={() => setPdfViewer({ open: false, url: "", title: "" })}
            url={pdfViewer.url}
            title={pdfViewer.title}
          />
        </div>
      )}

      {/* VIEW 3: SGPA CALCULATOR (MAIN TAB) */}
      {activeTab === "sgpa" && (
        <div className="tooldeck-calculator-view">
          <SGPA setSgpaList={setSgpaList} sgpaCount={sgpaList.length} />
        </div>
      )}

      {/* VIEW 4: CGPA CALCULATOR (MAIN TAB) */}
      {activeTab === "cgpa" && (
        <div className="tooldeck-calculator-view">
          <CGPA sgpaList={sgpaList} removeSGPA={removeSGPA} />
        </div>
      )}

      {/* VIEW 5: INTERNAL MARKS CALCULATOR (MAIN TAB) */}
      {activeTab === "internals" && (
        <div className="tooldeck-calculator-view">
          <InternalMarksPage embedded />
        </div>
      )}
    </div>
  );
}
