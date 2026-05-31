// src/features/pyqs/PYQsPage.jsx  (UPDATED)
// ─────────────────────────────────────────────────────────────
// Migration strategy for the ClassBank section:
//   Phase 1 (now):  fetch from /api/pyqs first; merge with PAPER_SOURCES
//                   (the hardcoded Google Drive list) as a fallback so the
//                   page keeps working while you re-upload to Cloudinary.
//   Phase 2 (final): once all PDFs are on Cloudinary and in the DB,
//                    delete PAPER_SOURCES and the merge logic below.
//
// This means:
//   • DB entries override any hardcoded entry with the same subject/year/paperTag.
//   • New DB entries appear automatically without a frontend deploy.
//   • Old Google Drive links still work until replaced.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import "./pyqs.css";
import { fetchPyqs } from "../../services/resourceService";

import {
  Folder, BookOpen, Star, Trash2, FileText, Image,
  FileQuestion, Search, ListVideo, PlayCircle,
} from "lucide-react";
import { FolderOpen } from "lucide-react";
import { ArrowLeft, Home } from "lucide-react";

const uid  = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
const esc  = (s) => String(s ?? "");
const STORAGE_KEY = "edubits_local_pyqs";

const emptyForm = { question: "", subject: "", year: "", topic: "", marks: "", answer: "" };

// ── Legacy Google Drive sources (KEEP until fully migrated to Cloudinary)
// Once a subject's PDFs are uploaded to Cloudinary and appear in the DB,
// you can remove that subject block from here.
// NOTE: Google Drive /preview URLs embed the viewer but expose your account
// metadata. Replace these by re-uploading to Cloudinary and deleting here.
const PAPER_SOURCES = [
  {
    year: "1st Year",
    subjects: [
      {
        subject: "Mathematics-II",
        papers: [
          { id: "mst1", title: "mst1", type: "pdf", url: "https://drive.google.com/file/d/1587LMIzAkGPijJ7FbCS8qpiTB3lUKqsK/preview" },
          { id: "mst2", title: "mst2", type: "pdf", url: "https://drive.google.com/file/d/16Q-zKnfSGzNTlJLafuKthQ8JloxISB1A/preview" },
          { id: "est1", title: "est1", type: "pdf", url: "https://drive.google.com/file/d/10E2i7EtHD6_WJuVSL-1u7kgmNjF3DgR0/preview" },
        ],
      },
      { subject: "Digital Electronics", papers: [
        { id: "mst1", title: "mst1", type: "pdf", url: "https://drive.google.com/file/d/1ImyfrlPSahDY7jn6llVrNWPgdZObh6re/preview" },
        { id: "mst2", title: "mst2", type: "pdf", url: "https://drive.google.com/file/d/1X7MXH57AHA-uLCG2aORk-TAWQF_fgyWc/preview" },
        { id: "est1", title: "est1", type: "pdf", url: "https://drive.google.com/file/d/1BPyBOPekIi3N7b2i-oW5AfEfoCd5kFQB/preview" },
      ]},
      // ... (rest of 1st year subjects unchanged from original)
    ],
  },
  {
    year: "2nd Year",
    subjects: [
      { subject: "COA", papers: [
        { id: "coa-2022", title: "Practice 0", type: "pdf", url: "https://drive.google.com/file/d/1uDjwVvsbKiJA9PgOTaVfzvHfwsQrCmJ8/preview" },
        { id: "coa-2024", title: "Practice 1", type: "pdf", url: "https://drive.google.com/file/d/1MZvRTq6k1Lqm42U1MEr7LK-VWWzSGPzA/preview" },
      ]},
      // ... (rest of 2nd year subjects unchanged)
    ],
  },
];

// ── PLAYLIST_SOURCES unchanged — kept exactly as-is ────────────
const PLAYLIST_SOURCES = [
  { year: "2nd Year", subjects: [
    { subject: "Software Engineering", playlists: [
      { id: "se-all", title: "Complete SE Playlist", channel: "Gate Smashers", playlistId: "PLxCzCOWd7aiEed7SKZBnC6ypFDWYLRvB2", thumbVideoId: "kcvEiMFOcoE" },
    ]},
    { subject: "Operating System", playlists: [
      { id: "os-all", title: "Complete OS Playlist", channel: "Gate Smashers", playlistId: "PLxCzCOWd7aiGz9donHRrE9I3Mwn6XdP8p", thumbVideoId: "WJ-UaAaumNA" },
    ]},
    { subject: "DAA", playlists: [
      { id: "daa-p1", title: "DAA Unit 1", channel: "Gate Smashers", playlistId: "PLhx1hByyAqsZ3ZMkKbN9FcSUYad1ShZ3G", thumbVideoId: "0IAPZzGSbME" },
    ]},
  ]},
];

// ── Merge DB pyqs into PAPER_SOURCES structure ─────────────────
// DB pyqs take precedence over hardcoded ones with the same subject+paperTag.
const mergeDbPyqs = (staticSources, dbPyqs) => {
  if (!dbPyqs.length) return staticSources;

  // Build a lookup: "2nd Year::COA::Practice 0" → cloudinary URL
  const dbMap = new Map();
  dbPyqs.forEach((p) => {
    const key = `${p.year}::${p.subject}::${p.paperTag || p.title}`;
    dbMap.set(key, { ...p, fromDB: true });
  });

  // Group DB pyqs by year → subject for new entries
  const dbGrouped = {};
  dbPyqs.forEach((p) => {
    const y = p.year || "Other";
    const s = p.subject || "General";
    if (!dbGrouped[y]) dbGrouped[y] = {};
    if (!dbGrouped[y][s]) dbGrouped[y][s] = [];
    dbGrouped[y][s].push({
      id:    p._id,
      title: p.paperTag || p.title,
      type:  "pdf",
      url:   p.url,
    });
  });

  // Override static entries where DB has a matching key
  const merged = staticSources.map((yearObj) => ({
    ...yearObj,
    subjects: yearObj.subjects.map((subj) => ({
      ...subj,
      papers: subj.papers.map((paper) => {
        const key = `${yearObj.year}::${subj.subject}::${paper.title}`;
        const dbEntry = dbMap.get(key);
        if (dbEntry) {
          // Replace Google Drive URL with Cloudinary URL
          return { ...paper, url: dbEntry.url, fromDB: true };
        }
        return paper;
      }),
    })),
  }));

  // Add entirely new years/subjects from DB that aren't in static sources
  Object.entries(dbGrouped).forEach(([year, subjects]) => {
    let yearObj = merged.find((y) => y.year === year);
    if (!yearObj) {
      yearObj = { year, subjects: [] };
      merged.push(yearObj);
    }
    Object.entries(subjects).forEach(([subject, papers]) => {
      const existing = yearObj.subjects.find((s) => s.subject === subject);
      if (!existing) {
        yearObj.subjects.push({ subject, papers });
      }
    });
  });

  return merged;
};

// ── Playlists component (unchanged) ───────────────────────────
function Playlists() {
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const goHome = () => { setSelectedYear(null); setSelectedSubject(null); };
  const goBackToYears = () => setSelectedSubject(null);
  const openPlaylist = (pl) =>
    window.open(`https://www.youtube.com/playlist?list=${pl.playlistId}`, "_blank", "noopener,noreferrer");
  const thumbUrl = (pl) =>
    pl.thumbVideoId ? `https://img.youtube.com/vi/${pl.thumbVideoId}/hqdefault.jpg` : "";

  return (
    <div className="pyq-wrap">
      <div className="pyq-header">
        <div className="pyq-header-top">
          <h1 className="pyq-title"><ListVideo size={27} /> Playlists</h1>
          {(selectedYear || selectedSubject) && (
            <button className="pyq-btn-home" onClick={goHome}><Home size={16} /><span>Home</span></button>
          )}
        </div>
        <div className="pyq-header-sub">
          {selectedSubject ? selectedSubject.subject : selectedYear ? selectedYear.year : "Select a folder"}
        </div>
      </div>

      {!selectedYear && (
        <div className="pyq-grid">
          {PLAYLIST_SOURCES.map((y) => (
            <div key={y.year} className="pyq-local-card" onClick={() => setSelectedYear(y)} style={{ cursor: "pointer" }}>
              <div className="pyq-lc-question"><Folder size={16} /> {y.year}</div>
              <div className="pyq-lc-tags"><span className="pyq-l-tag lt-sub">{y.subjects.length} subjects</span></div>
            </div>
          ))}
        </div>
      )}

      {selectedYear && !selectedSubject && (
        <>
          <div className="pyq-back-row">
            <button className="pyq-btn-cancel" onClick={goHome}><ArrowLeft size={16} /><span>Back</span></button>
          </div>
          <div className="pyq-grid">
            {selectedYear.subjects.map((s) => (
              <div key={s.subject} className="pyq-local-card" onClick={() => setSelectedSubject(s)} style={{ cursor: "pointer" }}>
                <div className="pyq-lc-question"><FolderOpen size={16} /> {s.subject}</div>
                <div className="pyq-lc-tags"><span className="pyq-l-tag lt-yr">{s.playlists.length} playlist{s.playlists.length !== 1 ? "s" : ""}</span></div>
              </div>
            ))}
          </div>
        </>
      )}

      {selectedSubject && (
        <>
          <div className="pyq-back-row">
            <button className="pyq-btn-cancel" onClick={goBackToYears}><ArrowLeft size={16} /><span>Back</span></button>
          </div>
          <div className="pyq-grid">
            {selectedSubject.playlists.map((pl) => {
              const thumb = thumbUrl(pl);
              return (
                <div key={pl.id} className="pyq-local-card pyq-playlist-card" onClick={() => openPlaylist(pl)} style={{ cursor: "pointer" }}>
                  {thumb ? (
                    <div className="pyq-pl-thumb">
                      <img src={thumb} alt={pl.title} />
                      <div className="pyq-pl-play-overlay"><PlayCircle size={38} /></div>
                    </div>
                  ) : (
                    <div className="pyq-pl-thumb pyq-pl-thumb--empty"><ListVideo size={32} style={{ opacity: 0.4 }} /></div>
                  )}
                  <div className="pyq-lc-question" style={{ marginTop: 4 }}><PlayCircle size={15} /> {pl.title}</div>
                  {pl.channel && <div className="pyq-lc-tags"><span className="pyq-l-tag lt-top">{pl.channel}</span></div>}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ── ClassBank component (updated to use DB + fallback) ─────────
function ClassBank() {
  const [selectedYear,    setSelectedYear]    = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedPaper,   setSelectedPaper]   = useState(null);
  const [search,          setSearch]          = useState("");
  const [sources,         setSources]         = useState(PAPER_SOURCES);
  const [loading,         setLoading]         = useState(true);

  // Fetch DB pyqs on mount and merge over static sources
  useEffect(() => {
    fetchPyqs()
      .then((dbPyqs) => setSources(mergeDbPyqs(PAPER_SOURCES, dbPyqs)))
      .catch((err) => {
        // If API fails (no auth, network error etc.) fall back silently to static
        console.warn("[ClassBank] DB fetch failed, using static sources:", err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const goHome = () => { setSelectedYear(null); setSelectedSubject(null); setSelectedPaper(null); };
  const goBackToYears = () => { setSelectedSubject(null); setSelectedPaper(null); };
  const goBackToSubjects = () => setSelectedPaper(null);

  return (
    <div className="pyq-wrap">
      <div className="pyq-header">
        <div className="pyq-header-top">
          <h1 className="pyq-title"><BookOpen size={27} /> PYQ's</h1>
          {(selectedYear || selectedSubject || selectedPaper) && (
            <button className="pyq-btn-home" onClick={goHome}><Home size={16} /><span>Home</span></button>
          )}
        </div>
        <div className="pyq-header-sub">
          {selectedPaper ? selectedPaper.title : selectedSubject ? selectedSubject.subject : selectedYear ? selectedYear.year : "Select a folder"}
        </div>
      </div>

      {loading && <div style={{ padding: 16, opacity: 0.5 }}>Loading…</div>}

      {!loading && !selectedYear && (
        <div className="pyq-grid">
          {sources.map((y) => (
            <div key={y.year} className="pyq-local-card" onClick={() => setSelectedYear(y)} style={{ cursor: "pointer" }}>
              <div className="pyq-lc-question"><Folder size={16} /> {y.year}</div>
            </div>
          ))}
        </div>
      )}

      {selectedYear && !selectedSubject && (
        <>
          <div className="pyq-back-row">
            <button className="pyq-btn-cancel" onClick={goHome}><ArrowLeft size={16} /><span>Back</span></button>
          </div>
          <div className="pyq-grid">
            {selectedYear.subjects.map((s) => (
              <div key={s.subject} className="pyq-local-card" onClick={() => setSelectedSubject(s)} style={{ cursor: "pointer" }}>
                <div className="pyq-lc-question"><FolderOpen size={16} /> {s.subject}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {selectedSubject && !selectedPaper && (
        <>
          <div className="pyq-back-row">
            <button className="pyq-btn-cancel" onClick={goBackToYears}><ArrowLeft size={16} /><span>Back</span></button>
          </div>
          <div className="pyq-grid">
            {selectedSubject.papers.map((paper) => (
              <div key={paper.id + paper.title} className="pyq-local-card" onClick={() => setSelectedPaper(paper)} style={{ cursor: "pointer" }}>
                <div className="pyq-lc-question">
                  {paper.type === "pdf"   && <FileText    size={16} />}
                  {paper.type === "image" && <Image       size={16} />}
                  {paper.type === "questions" && <FileQuestion size={16} />}
                  {paper.title}
                </div>
                {/* Show a small badge if this paper came from Cloudinary (DB) */}
                {paper.fromDB && (
                  <div className="pyq-lc-tags">
                    <span className="pyq-l-tag lt-top" style={{ fontSize: 10 }}>☁ Cloudinary</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {selectedPaper && selectedPaper.type === "pdf" && (
        <>
          <div className="pyq-back-row">
            <button className="pyq-btn-cancel" onClick={goBackToSubjects}><ArrowLeft size={16} /><span>Back</span></button>
          </div>
          <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)" }}>
            <iframe
              src={selectedPaper.url}
              title={selectedPaper.title}
              style={{ width: "100%", height: "80vh", border: "none" }}
            />
          </div>
        </>
      )}
    </div>
  );
}

// ── Main PYQsPage (tab bar unchanged) ─────────────────────────
export default function PYQsPage() {
  const [mode,      setMode]  = useState("bank");
  const [pyqs,      setPyqs]  = useState(() => {
    try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [stars, setStars] = useState(() => {
    try { return JSON.parse(localStorage.getItem("edubits_pyq_stars") || "[]"); } catch { return []; }
  });
  const [search,     setSearch]     = useState("");
  const [filterSub,  setFilterSub]  = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterStar, setFilterStar] = useState("");
  const [showModal,  setShowModal]  = useState(false);
  const [form,       setForm]       = useState(emptyForm);
  const [openAnswers, setOpenAnswers] = useState({});

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(pyqs)); }, [pyqs]);

  const subjects = [...new Set(pyqs.map((p) => p.subject).filter(Boolean))];
  const years    = [...new Set(pyqs.map((p) => p.year).filter(Boolean))].sort().reverse();

  const filtered = pyqs
    .filter((p) => {
      if (search     && !p.question.toLowerCase().includes(search.toLowerCase()) && !(p.topic || "").toLowerCase().includes(search.toLowerCase())) return false;
      if (filterSub  && p.subject !== filterSub)  return false;
      if (filterYear && p.year    !== filterYear) return false;
      if (filterStar === "starred" && !p.starred) return false;
      return true;
    })
    .sort((a, b) => (b.starred ? 1 : 0) - (a.starred ? 1 : 0) || b.createdAt - a.createdAt);

  const toggleStar   = (id) => setPyqs((prev) => prev.map((p) => p.id === id ? { ...p, starred: !p.starred } : p));
  const deletePYQ    = (id) => { if (!window.confirm("Delete?")) return; setPyqs((prev) => prev.filter((p) => p.id !== id)); };
  const toggleAnswer = (id) => setOpenAnswers((prev) => ({ ...prev, [id]: !prev[id] }));

  const submitForm = () => {
    if (!form.question.trim()) return;
    setPyqs((prev) => [{ id: uid(), ...form, question: form.question.trim(), starred: false, createdAt: Date.now() }, ...prev]);
    setForm(emptyForm);
    setShowModal(false);
  };

  return (
    <div className="pyq-page">
      <div className="pyq-mode-bar">
        <button className={`pyq-mode-tab ${mode === "bank" ? "active" : ""}`} onClick={() => setMode("bank")}>
          <span className="tab-content"><BookOpen size={16} /><span>Pyq's</span></span>
        </button>
        <button className={`pyq-mode-tab ${mode === "mine" ? "active" : ""}`} onClick={() => setMode("mine")}>
          <span className="tab-content"><Folder size={16} /><span>Revision</span></span>
        </button>
        <button className={`pyq-mode-tab ${mode === "playlists" ? "active" : ""}`} onClick={() => setMode("playlists")}>
          <span className="tab-content"><ListVideo size={16} /><span>Playlists</span></span>
        </button>
      </div>

      {mode === "bank"      && <ClassBank />}
      {mode === "playlists" && <Playlists />}
      {mode === "mine"      && (
        <div className="pyq-wrap">
          <div className="pyq-header">
            <div>
              <h1 style={{ display: "flex", alignItems: "center", gap: "8px" }}><Folder size={30} /> Revision</h1>
              <p>Add Your Own questions.</p>
            </div>
            <button className="pyq-btn-add" onClick={() => { setForm(emptyForm); setShowModal(true); }}>+ Add PYQ</button>
          </div>

          <div className="pyq-stats-strip">
            <div className="pyq-strip-item">Total: <strong>{pyqs.length}</strong></div>
            <div className="pyq-strip-item">Showing: <strong>{filtered.length}</strong></div>
            <div className="pyq-strip-item">Subjects: <strong>{subjects.length}</strong></div>
            <div className="pyq-strip-item">Starred: <strong>{pyqs.filter((p) => p.starred).length}</strong></div>
          </div>

          <div className="pyq-toolbar">
            <div className="search-box">
              <Search size={16} />
              <input className="pyq-search" placeholder="Search questions…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select className="pyq-select" value={filterSub}  onChange={(e) => setFilterSub(e.target.value)}>
              <option value="">All Subjects</option>
              {subjects.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select className="pyq-select" value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
              <option value="">All Years</option>
              {years.map((y) => <option key={y}>{y}</option>)}
            </select>
            <select className="pyq-select" value={filterStar} onChange={(e) => setFilterStar(e.target.value)}>
              <option value="">All</option>
              <option value="starred">Starred</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="pyq-state-box">
              <div className="pyq-s-icon"><Folder size={16} /></div>
              <h3>{pyqs.length ? "No matches" : "Your collection is empty"}</h3>
              <p>{pyqs.length ? "Try adjusting your filters." : 'Tap "+ Add PYQ" to start building your personal bank.'}</p>
            </div>
          ) : (
            <div className="pyq-grid">
              {filtered.map((p, i) => (
                <div className="pyq-local-card" key={p.id} style={{ animationDelay: `${Math.min(i, 12) * 0.04}s` }}>
                  <div className="pyq-lc-header">
                    <div className="pyq-lc-question">{esc(p.question)}</div>
                    <div className="pyq-lc-actions">
                      <button className={`pyq-icon-btn ${p.starred ? "starred" : ""}`} onClick={() => toggleStar(p.id)} title="Star"><Star size={16} fill="currentColor" /></button>
                      <button className="pyq-icon-btn danger" onClick={() => deletePYQ(p.id)} title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </div>
                  <div className="pyq-lc-tags">
                    {p.subject && <span className="pyq-l-tag lt-sub">{esc(p.subject)}</span>}
                    {p.year    && <span className="pyq-l-tag lt-yr">{esc(p.year)}</span>}
                    {p.topic   && <span className="pyq-l-tag lt-top">{esc(p.topic)}</span>}
                    {p.marks   && <span className="pyq-l-tag lt-mk">{esc(p.marks)} marks</span>}
                  </div>
                  {p.answer && (
                    <>
                      <div className={`pyq-lc-answer ${openAnswers[p.id] ? "visible" : ""}`}>{esc(p.answer)}</div>
                      <button className="pyq-toggle-ans" onClick={() => toggleAnswer(p.id)}>{openAnswers[p.id] ? "Hide answer" : "Show answer"}</button>
                    </>
                  )}
                  <div className="pyq-lc-footer">
                    <span className="pyq-lc-date">{new Date(p.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="pyq-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="pyq-modal">
            <h3>Add to My Collection</h3>
            <div className="pyq-form-group">
              <label className="pyq-form-label">Question *</label>
              <textarea className="pyq-form-textarea" placeholder="Enter the question…" value={form.question} onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))} autoFocus />
            </div>
            <div className="pyq-form-row">
              <div className="pyq-form-group">
                <label className="pyq-form-label">Subject *</label>
                <input className="pyq-form-input" placeholder="e.g. Mathematics" list="pyq-subj-list" value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} />
                <datalist id="pyq-subj-list">{subjects.map((s) => <option key={s} value={s} />)}</datalist>
              </div>
              <div className="pyq-form-group">
                <label className="pyq-form-label">Year</label>
                <input className="pyq-form-input" placeholder="e.g. 2023" value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))} />
              </div>
            </div>
            <div className="pyq-form-row">
              <div className="pyq-form-group">
                <label className="pyq-form-label">Topic / Unit</label>
                <input className="pyq-form-input" placeholder="e.g. Integration" value={form.topic} onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))} />
              </div>
              <div className="pyq-form-group">
                <label className="pyq-form-label">Marks</label>
                <input className="pyq-form-input" placeholder="e.g. 5" value={form.marks} onChange={(e) => setForm((f) => ({ ...f, marks: e.target.value }))} />
              </div>
            </div>
            <div className="pyq-form-group">
              <label className="pyq-form-label">Answer / Key Points (optional)</label>
              <textarea className="pyq-form-textarea" placeholder="Solution approach, key points…" value={form.answer} onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))} />
            </div>
            <div className="pyq-modal-actions">
              <button className="pyq-btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="pyq-btn-confirm" onClick={submitForm} disabled={!form.question.trim()}>Add Question</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
