// import React, { useEffect, useState, useCallback, useRef } from "react";
// import Editor from "@monaco-editor/react";
// import {
//   fetchTopicsAPI,
//   fetchProblemsAPI,
//   createProblemAPI,
//   updateProblemAPI,
//   deleteProblemAPI,
// } from "../services/programmingService";
// import "../styles/programming.css";

// // ─── helpers ────────────────────────────────────────────────────────────────

// const EMPTY_FORM = {
//   title: "",
//   topic: "",
//   difficulty: "medium",
//   originalProblemUrl: "",
//   fixCode: { java: "", cpp: "" },
//   proCode: { java: "", cpp: "" },
// };

// // ─── component ──────────────────────────────────────────────────────────────

// export default function ProgrammingAdmin() {
//   const [topics, setTopics] = useState([]);
//   const [problems, setProblems] = useState([]);
//   const [form, setForm] = useState(EMPTY_FORM);
//   const [editingId, setEditingId] = useState(null);
//   const [codeTab, setCodeTab] = useState("fix"); // fix | pro
//   const [lang, setLang] = useState("java"); // java | cpp
//   const [saving, setSaving] = useState(false);
//   const [status, setStatus] = useState(null); // { type: "success"|"error", msg }
//   const [filterTopic, setFilterTopic] = useState("");
//   const formRef = useRef(null);

//   // ── load ──────────────────────────────────────────────────────────────────

//   const load = useCallback(async () => {
//     try {
//       const [td, pd] = await Promise.all([fetchTopicsAPI(), fetchProblemsAPI()]);
//       setTopics(td.topics);
//       setProblems(pd.problems);
//     } catch (err) {
//       setStatus({ type: "error", msg: err.message });
//     }
//   }, []);

//   useEffect(() => { load(); }, [load]);

//   // ── form helpers ──────────────────────────────────────────────────────────

//   const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

//   const setCode = (section, language, value) =>
//     setForm((f) => ({
//       ...f,
//       [section]: { ...f[section], [language]: value ?? "" },
//     }));

//   const resetForm = () => {
//     setForm(EMPTY_FORM);
//     setEditingId(null);
//     setCodeTab("fix");
//     setLang("java");
//   };

//   const startEdit = (problem) => {
//     setForm({
//       title: problem.title || "",
//       topic: problem.topic?._id || problem.topic || "",
//       difficulty: problem.difficulty || "medium",
//       originalProblemUrl: problem.originalProblemUrl || "",
//       fixCode: {
//         java: problem.fixCode?.java || "",
//         cpp: problem.fixCode?.cpp || "",
//       },
//       proCode: {
//         java: problem.proCode?.java || "",
//         cpp: problem.proCode?.cpp || "",
//       },
//     });
//     setEditingId(problem._id);
//     setCodeTab("fix");
//     setLang("java");
//     // scroll form into view
//     setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
//   };

//   // ── save ──────────────────────────────────────────────────────────────────

//   const handleSave = async () => {
//     if (!form.title.trim()) { setStatus({ type: "error", msg: "Title is required" }); return; }
//     if (!form.topic) { setStatus({ type: "error", msg: "Topic is required" }); return; }

//     setSaving(true);
//     setStatus(null);
//     try {
//       if (editingId) {
//         await updateProblemAPI(editingId, form);
//         setStatus({ type: "success", msg: "Problem updated." });
//       } else {
//         await createProblemAPI(form);
//         setStatus({ type: "success", msg: "Problem created." });
//       }
//       resetForm();
//       await load();
//     } catch (err) {
//       setStatus({ type: "error", msg: err.message });
//     } finally {
//       setSaving(false);
//     }
//   };

//   // ── delete ────────────────────────────────────────────────────────────────

//   const handleDelete = async (id) => {
//     if (!window.confirm("Delete this problem?")) return;
//     try {
//       await deleteProblemAPI(id);
//       if (editingId === id) resetForm();
//       await load();
//       setStatus({ type: "success", msg: "Deleted." });
//     } catch (err) {
//       setStatus({ type: "error", msg: err.message });
//     }
//   };

//   // ── filtered problem list ─────────────────────────────────────────────────

//   const visibleProblems = filterTopic
//     ? problems.filter((p) => (p.topic?._id || p.topic) === filterTopic)
//     : problems;

//   // ── editor value ──────────────────────────────────────────────────────────

//   const editorValue = codeTab === "fix" ? form.fixCode[lang] : form.proCode[lang];
//   const editorLang = lang === "cpp" ? "cpp" : "java";

//   const handleEditorChange = (value) => {
//     if (codeTab === "fix") setCode("fixCode", lang, value);
//     else setCode("proCode", lang, value);
//   };

//   // ── render ────────────────────────────────────────────────────────────────

//   return (
//     <div className="prog-shell fade-in">
//       <h1 className="prog-page-title">Programming Admin</h1>

//       {/* ── Status banner ── */}
//       {status && (
//         <p
//           style={{
//             marginBottom: 16,
//             padding: "10px 16px",
//             borderRadius: 8,
//             background: status.type === "success" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
//             color: status.type === "success" ? "var(--success)" : "var(--danger)",
//             fontSize: "0.9rem",
//           }}
//         >
//           {status.msg}
//         </p>
//       )}

//       {/* ═══════════════════════════════════════════════════════════════════ */}
//       {/* Problem List                                                        */}
//       {/* ═══════════════════════════════════════════════════════════════════ */}

//       <section style={{ marginBottom: 40 }}>
//         <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
//           <h2 style={{ color: "var(--text)", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, margin: 0 }}>
//             Problems ({visibleProblems.length})
//           </h2>

//           {/* topic filter */}
//           <select
//             value={filterTopic}
//             onChange={(e) => setFilterTopic(e.target.value)}
//             style={selectStyle}
//           >
//             <option value="">All topics</option>
//             {topics.map((t) => (
//               <option key={t._id} value={t._id}>{t.name}</option>
//             ))}
//           </select>
//         </div>

//         {visibleProblems.length === 0 ? (
//           <p className="prog-empty">No problems yet.</p>
//         ) : (
//           <table className="prog-table">
//             <thead>
//               <tr>
//                 <th>Title</th>
//                 <th>Topic</th>
//                 <th>Difficulty</th>
//                 <th style={{ width: 120 }}>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {visibleProblems.map((p) => (
//                 <tr
//                   key={p._id}
//                   className="prog-table-row"
//                   style={{ background: editingId === p._id ? "rgba(74,144,226,0.08)" : undefined }}
//                 >
//                   <td className="prog-problem-title">{p.title}</td>
//                   <td style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
//                     {topics.find((t) => t._id === (p.topic?._id || p.topic))?.name || "—"}
//                   </td>
//                   <td className={`prog-difficulty prog-difficulty-${p.difficulty}`}>{p.difficulty}</td>
//                   <td>
//                     <div style={{ display: "flex", gap: 6 }}>
//                       <button
//                         onClick={() => startEdit(p)}
//                         style={{ ...btnStyle, background: "var(--primary)", color: "#fff" }}
//                       >
//                         Edit
//                       </button>
//                       <button
//                         onClick={() => handleDelete(p._id)}
//                         style={{ ...btnStyle, background: "rgba(239,68,68,0.15)", color: "var(--danger)" }}
//                       >
//                         Del
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </section>

//       {/* ═══════════════════════════════════════════════════════════════════ */}
//       {/* Form                                                                */}
//       {/* ═══════════════════════════════════════════════════════════════════ */}

//       <section ref={formRef}>
//         <h2 style={{ color: "var(--text)", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, marginBottom: 20 }}>
//           {editingId ? "Edit Problem" : "New Problem"}
//         </h2>

//         {/* ── Meta fields ── */}
//         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
//           <div style={fieldWrap}>
//             <label style={labelStyle}>Title *</label>
//             <input
//               value={form.title}
//               onChange={(e) => setField("title", e.target.value)}
//               placeholder="e.g. Two Sum"
//               style={inputStyle}
//             />
//           </div>

//           <div style={fieldWrap}>
//             <label style={labelStyle}>Topic *</label>
//             <select
//               value={form.topic}
//               onChange={(e) => setField("topic", e.target.value)}
//               style={selectStyle}
//             >
//               <option value="">Select topic…</option>
//               {topics.map((t) => (
//                 <option key={t._id} value={t._id}>{t.name}</option>
//               ))}
//             </select>
//           </div>

//           <div style={fieldWrap}>
//             <label style={labelStyle}>Difficulty</label>
//             <select
//               value={form.difficulty}
//               onChange={(e) => setField("difficulty", e.target.value)}
//               style={selectStyle}
//             >
//               <option value="easy">Easy</option>
//               <option value="medium">Medium</option>
//               <option value="hard">Hard</option>
//             </select>
//           </div>

//           <div style={fieldWrap}>
//             <label style={labelStyle}>Original Problem URL</label>
//             <input
//               value={form.originalProblemUrl}
//               onChange={(e) => setField("originalProblemUrl", e.target.value)}
//               placeholder="https://leetcode.com/problems/..."
//               style={inputStyle}
//             />
//           </div>
//         </div>

//         {/* ── Code section tabs: Fix / Pro ── */}
//         <div style={{ marginBottom: 10, display: "flex", gap: 8 }}>
//           {["fix", "pro"].map((t) => (
//             <button
//               key={t}
//               onClick={() => setCodeTab(t)}
//               className={`prog-modal-tab ${codeTab === t ? "is-active" : ""}`}
//             >
//               {t === "fix" ? "Automata Fix" : "Automata Pro"}
//             </button>
//           ))}
//         </div>

//         {/* ── Language tabs: Java / C++ ── */}
//         <div className="prog-lang-toggle" style={{ marginBottom: 8 }}>
//           {["java", "cpp"].map((l) => (
//             <button
//               key={l}
//               onClick={() => setLang(l)}
//               className={lang === l ? "is-active" : ""}
//             >
//               {l === "java" ? "Java" : "C++"}
//             </button>
//           ))}
//         </div>

//         {/* ── Monaco Editor ── */}
//         <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, overflow: "hidden", marginBottom: 16 }}>
//           <Editor
//             height="420px"
//             theme="vs-dark"
//             language={editorLang}
//             value={editorValue}
//             onChange={handleEditorChange}
//             options={{
//               fontSize: 14,
//               minimap: { enabled: false },
//               scrollBeyondLastLine: false,
//               wordWrap: "on",
//               tabSize: 4,
//             }}
//           />
//         </div>

//         {/* ── Action buttons ── */}
//         <div style={{ display: "flex", gap: 10 }}>
//           <button
//             onClick={handleSave}
//             disabled={saving}
//             style={{
//               padding: "10px 28px",
//               borderRadius: 8,
//               border: "none",
//               background: "var(--primary)",
//               color: "#fff",
//               fontWeight: 700,
//               fontSize: "0.95rem",
//               cursor: saving ? "not-allowed" : "pointer",
//               opacity: saving ? 0.7 : 1,
//             }}
//           >
//             {saving ? "Saving…" : editingId ? "Update Problem" : "Save Problem"}
//           </button>

//           {editingId && (
//             <>
//               <button
//                 onClick={() => handleDelete(editingId)}
//                 style={{
//                   padding: "10px 24px",
//                   borderRadius: 8,
//                   border: "1px solid var(--danger)",
//                   background: "transparent",
//                   color: "var(--danger)",
//                   fontWeight: 700,
//                   fontSize: "0.95rem",
//                   cursor: "pointer",
//                 }}
//               >
//                 Delete Problem
//               </button>
//               <button
//                 onClick={resetForm}
//                 style={{
//                   padding: "10px 24px",
//                   borderRadius: 8,
//                   border: "1px solid rgba(255,255,255,0.15)",
//                   background: "transparent",
//                   color: "var(--muted)",
//                   fontWeight: 600,
//                   fontSize: "0.95rem",
//                   cursor: "pointer",
//                 }}
//               >
//                 Cancel
//               </button>
//             </>
//           )}
//         </div>
//       </section>
//     </div>
//   );
// }

// // ─── inline styles (small, reusable) ────────────────────────────────────────

// const fieldWrap = { display: "flex", flexDirection: "column", gap: 6 };

// const labelStyle = {
//   fontSize: "0.8rem",
//   fontWeight: 600,
//   color: "var(--muted)",
//   textTransform: "uppercase",
//   letterSpacing: "0.04em",
// };

// const inputStyle = {
//   padding: "9px 12px",
//   borderRadius: 8,
//   border: "1px solid rgba(255,255,255,0.12)",
//   background: "var(--surface-2)",
//   color: "var(--text)",
//   fontSize: "0.9rem",
//   fontFamily: "'DM Sans', sans-serif",
//   outline: "none",
//   width: "100%",
//   boxSizing: "border-box",
// };

// const selectStyle = {
//   ...inputStyle,
//   cursor: "pointer",
// };

// const btnStyle = {
//   padding: "5px 12px",
//   borderRadius: 6,
//   border: "none",
//   fontWeight: 600,
//   fontSize: "0.8rem",
//   cursor: "pointer",
// };

import React, { useEffect, useState, useCallback, useRef } from "react";
import Editor from "@monaco-editor/react";
import {
  fetchTopicsAPI,
  fetchProblemsAPI,
  createProblemAPI,
  updateProblemAPI,
  deleteProblemAPI,
} from "../services/programmingService";
import "../styles/programming.css";

// ─── helpers ────────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  title: "",
  topic: "",
  difficulty: "medium",
  originalProblemUrl: "",
  blogUrl: "",
  solutionVideoUrlEn: "",
  solutionVideoUrlHi: "",
  fixCode: { java: "", cpp: "" },
  proCode: { java: "", cpp: "" },
};

// ─── component ──────────────────────────────────────────────────────────────

export default function ProgrammingAdmin() {
  const [topics, setTopics] = useState([]);
  const [problems, setProblems] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [codeTab, setCodeTab] = useState("fix"); // fix | pro
  const [lang, setLang] = useState("java"); // java | cpp
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null); // { type: "success"|"error", msg }
  const [filterTopic, setFilterTopic] = useState("");
  const formRef = useRef(null);

  // ── load ──────────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    try {
      const [td, pd] = await Promise.all([fetchTopicsAPI(), fetchProblemsAPI()]);
      setTopics(td.topics);
      setProblems(pd.problems);
    } catch (err) {
      setStatus({ type: "error", msg: err.message });
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── form helpers ──────────────────────────────────────────────────────────

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const setCode = (section, language, value) =>
    setForm((f) => ({
      ...f,
      [section]: { ...f[section], [language]: value ?? "" },
    }));

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setCodeTab("fix");
    setLang("java");
  };

  const startEdit = (problem) => {
    setForm({
      title: problem.title || "",
      topic: problem.topic?._id || problem.topic || "",
      difficulty: problem.difficulty || "medium",
      originalProblemUrl: problem.originalProblemUrl || "",
      blogUrl: problem.blogUrl || "",
      solutionVideoUrlEn: problem.solutionVideoUrlEn || "",
      solutionVideoUrlHi: problem.solutionVideoUrlHi || "",
      fixCode: {
        java: problem.fixCode?.java || "",
        cpp: problem.fixCode?.cpp || "",
      },
      proCode: {
        java: problem.proCode?.java || "",
        cpp: problem.proCode?.cpp || "",
      },
    });
    setEditingId(problem._id);
    setCodeTab("fix");
    setLang("java");
    // scroll form into view
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  // ── save ──────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!form.title.trim()) { setStatus({ type: "error", msg: "Title is required" }); return; }
    if (!form.topic) { setStatus({ type: "error", msg: "Topic is required" }); return; }

    setSaving(true);
    setStatus(null);
    try {
      if (editingId) {
        await updateProblemAPI(editingId, form);
        setStatus({ type: "success", msg: "Problem updated." });
      } else {
        await createProblemAPI(form);
        setStatus({ type: "success", msg: "Problem created." });
      }
      resetForm();
      await load();
    } catch (err) {
      setStatus({ type: "error", msg: err.message });
    } finally {
      setSaving(false);
    }
  };

  // ── delete ────────────────────────────────────────────────────────────────

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this problem?")) return;
    try {
      await deleteProblemAPI(id);
      if (editingId === id) resetForm();
      await load();
      setStatus({ type: "success", msg: "Deleted." });
    } catch (err) {
      setStatus({ type: "error", msg: err.message });
    }
  };

  // ── filtered problem list ─────────────────────────────────────────────────

  const visibleProblems = filterTopic
    ? problems.filter((p) => (p.topic?._id || p.topic) === filterTopic)
    : problems;

  // ── editor value ──────────────────────────────────────────────────────────

  const editorValue = codeTab === "fix" ? form.fixCode[lang] : form.proCode[lang];
  const editorLang = lang === "cpp" ? "cpp" : "java";

  const handleEditorChange = (value) => {
    if (codeTab === "fix") setCode("fixCode", lang, value);
    else setCode("proCode", lang, value);
  };

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="prog-shell fade-in">
      <h1 className="prog-page-title">Programming Admin</h1>

      {/* ── Status banner ── */}
      {status && (
        <p
          style={{
            marginBottom: 16,
            padding: "10px 16px",
            borderRadius: 8,
            background: status.type === "success" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
            color: status.type === "success" ? "var(--success)" : "var(--danger)",
            fontSize: "0.9rem",
          }}
        >
          {status.msg}
        </p>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* Problem List                                                        */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      <section style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <h2 style={{ color: "var(--text)", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, margin: 0 }}>
            Problems ({visibleProblems.length})
          </h2>

          {/* topic filter */}
          <select
            value={filterTopic}
            onChange={(e) => setFilterTopic(e.target.value)}
            style={selectStyle}
          >
            <option value="">All topics</option>
            {topics.map((t) => (
              <option key={t._id} value={t._id}>{t.name}</option>
            ))}
          </select>
        </div>

        {visibleProblems.length === 0 ? (
          <p className="prog-empty">No problems yet.</p>
        ) : (
          <table className="prog-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Topic</th>
                <th>Difficulty</th>
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleProblems.map((p) => (
                <tr
                  key={p._id}
                  className="prog-table-row"
                  style={{ background: editingId === p._id ? "rgba(74,144,226,0.08)" : undefined }}
                >
                  <td className="prog-problem-title">{p.title}</td>
                  <td style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                    {topics.find((t) => t._id === (p.topic?._id || p.topic))?.name || "—"}
                  </td>
                  <td className={`prog-difficulty prog-difficulty-${p.difficulty}`}>{p.difficulty}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => startEdit(p)}
                        style={{ ...btnStyle, background: "var(--primary)", color: "#fff" }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        style={{ ...btnStyle, background: "rgba(239,68,68,0.15)", color: "var(--danger)" }}
                      >
                        Del
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* Form                                                                */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      <section ref={formRef}>
        <h2 style={{ color: "var(--text)", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, marginBottom: 20 }}>
          {editingId ? "Edit Problem" : "New Problem"}
        </h2>

        {/* ── Meta fields ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          <div style={fieldWrap}>
            <label style={labelStyle}>Title *</label>
            <input
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              placeholder="e.g. Two Sum"
              style={inputStyle}
            />
          </div>

          <div style={fieldWrap}>
            <label style={labelStyle}>Topic *</label>
            <select
              value={form.topic}
              onChange={(e) => setField("topic", e.target.value)}
              style={selectStyle}
            >
              <option value="">Select topic…</option>
              {topics.map((t) => (
                <option key={t._id} value={t._id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div style={fieldWrap}>
            <label style={labelStyle}>Difficulty</label>
            <select
              value={form.difficulty}
              onChange={(e) => setField("difficulty", e.target.value)}
              style={selectStyle}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div style={fieldWrap}>
            <label style={labelStyle}>Original Problem URL</label>
            <input
              value={form.originalProblemUrl}
              onChange={(e) => setField("originalProblemUrl", e.target.value)}
              placeholder="https://leetcode.com/problems/..."
              style={inputStyle}
            />
          </div>

          <div style={fieldWrap}>
            <label style={labelStyle}>Blog URL</label>
            <input
              value={form.blogUrl}
              onChange={(e) => setField("blogUrl", e.target.value)}
              placeholder="https://..."
              style={inputStyle}
            />
          </div>

          <div style={fieldWrap}>
            <label style={labelStyle}>Solution Video (English)</label>
            <input
              value={form.solutionVideoUrlEn}
              onChange={(e) => setField("solutionVideoUrlEn", e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              style={inputStyle}
            />
          </div>

          <div style={fieldWrap}>
            <label style={labelStyle}>Solution Video (Hindi)</label>
            <input
              value={form.solutionVideoUrlHi}
              onChange={(e) => setField("solutionVideoUrlHi", e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              style={inputStyle}
            />
          </div>
        </div>

        {/* ── Code section tabs: Fix / Pro ── */}
        <div style={{ marginBottom: 10, display: "flex", gap: 8 }}>
          {["fix", "pro"].map((t) => (
            <button
              key={t}
              onClick={() => setCodeTab(t)}
              className={`prog-modal-tab ${codeTab === t ? "is-active" : ""}`}
            >
              {t === "fix" ? "Automata Fix" : "Automata Pro"}
            </button>
          ))}
        </div>

        {/* ── Language tabs: Java / C++ ── */}
        <div className="prog-lang-toggle" style={{ marginBottom: 8 }}>
          {["java", "cpp"].map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={lang === l ? "is-active" : ""}
            >
              {l === "java" ? "Java" : "C++"}
            </button>
          ))}
        </div>

        {/* ── Monaco Editor ── */}
        <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, overflow: "hidden", marginBottom: 16 }}>
          <Editor
            height="420px"
            theme="vs-dark"
            language={editorLang}
            value={editorValue}
            onChange={handleEditorChange}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: "on",
              tabSize: 4,
            }}
          />
        </div>

        {/* ── Action buttons ── */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "10px 28px",
              borderRadius: 8,
              border: "none",
              background: "var(--primary)",
              color: "#fff",
              fontWeight: 700,
              fontSize: "0.95rem",
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Saving…" : editingId ? "Update Problem" : "Save Problem"}
          </button>

          {editingId && (
            <>
              <button
                onClick={() => handleDelete(editingId)}
                style={{
                  padding: "10px 24px",
                  borderRadius: 8,
                  border: "1px solid var(--danger)",
                  background: "transparent",
                  color: "var(--danger)",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  cursor: "pointer",
                }}
              >
                Delete Problem
              </button>
              <button
                onClick={resetForm}
                style={{
                  padding: "10px 24px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "transparent",
                  color: "var(--muted)",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

// ─── inline styles (small, reusable) ────────────────────────────────────────

const fieldWrap = { display: "flex", flexDirection: "column", gap: 6 };

const labelStyle = {
  fontSize: "0.8rem",
  fontWeight: 600,
  color: "var(--muted)",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const inputStyle = {
  padding: "9px 12px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "var(--surface-2)",
  color: "var(--text)",
  fontSize: "0.9rem",
  fontFamily: "'DM Sans', sans-serif",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

const selectStyle = {
  ...inputStyle,
  cursor: "pointer",
};

const btnStyle = {
  padding: "5px 12px",
  borderRadius: 6,
  border: "none",
  fontWeight: 600,
  fontSize: "0.8rem",
  cursor: "pointer",
};