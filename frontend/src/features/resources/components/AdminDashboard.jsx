import { useState, useRef } from "react";
import {
  uploadResource,
  uploadPaperPair,
  RESOURCE_TYPES,
} from "../../../services/resourceService";

const RESOURCE_TYPE_LABELS = {
  pyqs: "PYQ (Previous Year Question Paper)",
  notes: "Notes",
  playlist: "Playlist",
  pdf: "PDF (other)",
  image: "Image",
  thumbnail: "Thumbnail",
  other: "Other",
};

const YEAR_OPTIONS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

const SUBJECT_OPTIONS = [
  "Mathematics-I",
  "Digital Electronics",
  "Engineering Physics",
  "LTPS",
  "Biology",
  "COA",
  "DBMS",
  "ADSA",
  "Java",
  "Software Engineering",
  "Operating System",
  "Machine Learning",
  "Probability & Statistics",
  "PBL_Java",
  "Computer Networks",
  "Web Development Fundamentals",
  "Business Analytics",
  "Ethical Hacking",
  "Mathematics-II",
  "OOPS Using Java",
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("paper-pair");
  const [status, setStatus] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Paper Pair form state
  const [ppTitle, setPpTitle] = useState("");
  const [ppSubject, setPpSubject] = useState("");
  const [ppYear, setPpYear] = useState("");
  const [ppSemester, setPpSemester] = useState("");
  const [ppPaperTag, setPpPaperTag] = useState("");
  const [ppQuestionsFile, setPpQuestionsFile] = useState(null);
  const [ppSolutionFile, setPpSolutionFile] = useState(null);

  // Single file form state
  const [sfFile, setSfFile] = useState(null);
  const [sfResourceType, setSfResourceType] = useState("notes");
  const [sfTitle, setSfTitle] = useState("");
  const [sfSubject, setSfSubject] = useState("");
  const [sfYear, setSfYear] = useState("");
  const [sfSemester, setSfSemester] = useState("");
  const [sfPaperTag, setSfPaperTag] = useState("");

  // Question JSON form state
  const [qjFile, setQjFile] = useState(null);
  const [qjSubject, setQjSubject] = useState("");
  const [qjMode, setQjMode] = useState("viva");

  const fileInputRefs = {
    ppQuestions: useRef(null),
    ppSolution: useRef(null),
    sfFile: useRef(null),
    qjFile: useRef(null),
  };

  const resetPaperPair = () => {
    setPpTitle("");
    setPpSubject("");
    setPpYear("");
    setPpSemester("");
    setPpPaperTag("");
    setPpQuestionsFile(null);
    setPpSolutionFile(null);
    if (fileInputRefs.ppQuestions.current) fileInputRefs.ppQuestions.current.value = "";
    if (fileInputRefs.ppSolution.current) fileInputRefs.ppSolution.current.value = "";
  };

  const resetSingleFile = () => {
    setSfFile(null);
    setSfTitle("");
    setSfSubject("");
    setSfYear("");
    setSfSemester("");
    setSfPaperTag("");
    if (fileInputRefs.sfFile.current) fileInputRefs.sfFile.current.value = "";
  };

  const resetQuestionJson = () => {
    setQjFile(null);
    setQjSubject("");
    setQjMode("viva");
    if (fileInputRefs.qjFile.current) fileInputRefs.qjFile.current.value = "";
  };

  const handlePaperPairSubmit = async (e) => {
    e.preventDefault();
    if (!ppQuestionsFile || !ppSolutionFile) return setErrorMsg("Both PDF files are required.");
    if (!ppTitle) return setErrorMsg("Title is required.");
    if (!ppSubject) return setErrorMsg("Subject is required.");
    if (!ppYear) return setErrorMsg("Year is required.");
    if (!ppPaperTag) return setErrorMsg("Paper Tag is required.");

    setErrorMsg("");
    setSuccessMsg("");
    setStatus("uploading");
    setProgress(0);

    try {
      const result = await uploadPaperPair(
        [ppQuestionsFile, ppSolutionFile],
        {
          title: ppTitle,
          subject: ppSubject,
          year: ppYear,
          semester: ppSemester ? Number(ppSemester) : undefined,
          paperTag: ppPaperTag,
        },
        setProgress
      );
      setStatus("success");
      setSuccessMsg(`Paper pair uploaded! Paper Key: ${result.paperKey}`);
      resetPaperPair();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || "Upload failed.");
      setStatus("error");
    }
  };

  const handleSingleFileSubmit = async (e) => {
    e.preventDefault();
    if (!sfFile) return setErrorMsg("Please select a file.");
    if (!sfTitle) return setErrorMsg("Title is required.");

    setErrorMsg("");
    setSuccessMsg("");
    setStatus("uploading");
    setProgress(0);

    try {
      const resource = await uploadResource(
        sfFile,
        {
          title: sfTitle,
          resourceType: sfResourceType,
          subject: sfSubject || undefined,
          year: sfYear || undefined,
          semester: sfSemester ? Number(sfSemester) : undefined,
          paperTag: sfPaperTag || undefined,
        },
        setProgress
      );
      setStatus("success");
      setSuccessMsg(`File uploaded! ID: ${resource._id}`);
      resetSingleFile();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || "Upload failed.");
      setStatus("error");
    }
  };

  const handleQuestionJsonSubmit = async (e) => {
    e.preventDefault();
    if (!qjFile) return setErrorMsg("Please select a JSON file.");
    if (!qjSubject) return setErrorMsg("Subject is required.");

    setErrorMsg("");
    setSuccessMsg("");
    setStatus("uploading");
    setProgress(0);

    try {
      // Read and parse JSON file
      const text = await qjFile.text();
      const questions = JSON.parse(text);

      if (!Array.isArray(questions)) {
        throw new Error("JSON must be an array of question objects");
      }

      // Validate question structure
      for (const q of questions) {
        if (!q.text || !q.options || !Array.isArray(q.options) || typeof q.correctAnswer !== "number") {
          throw new Error("Each question must have text, options array, and correctAnswer index");
        }
      }

      // Upload each question via the existing questions API
      // Note: This uses the questions endpoint, not resources
      const api = (await import("../../../services/resourceService")).default;
      const results = [];

      for (const q of questions) {
        const { data } = await api.post("/questions/bulk", {
          questions: [{
            topicId: q.topicId || "", // Will need topic mapping
            text: q.text,
            options: q.options,
            correctAnswer: q.correctAnswer,
            difficulty: q.difficulty || "medium",
            explanation: q.explanation || "",
            tags: q.tags || [],
            timeLimitSeconds: q.timeLimitSeconds || 30,
          }],
        });
        results.push(data);
      }

      setStatus("success");
      setSuccessMsg(`Uploaded ${questions.length} questions for ${qjSubject} (${qjMode})`);
      resetQuestionJson();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || "Upload failed.");
      setStatus("error");
    }
  };

  const renderPaperPairTab = () => (
    <form onSubmit={handlePaperPairSubmit} style={styles.form}>
      <h3 style={styles.sectionTitle}>Upload PYQ Paper Pair (Questions + Solution)</h3>
      <p style={styles.helpText}>
        Upload both PDFs at once. They will be linked by a shared paper key.
      </p>

      <label style={styles.label}>Title *</label>
      <input
        style={styles.input}
        type="text"
        placeholder="e.g. MST 1"
        value={ppTitle}
        onChange={(e) => setPpTitle(e.target.value)}
        required
      />

      <label style={styles.label}>Subject *</label>
      <select
        style={styles.input}
        value={ppSubject}
        onChange={(e) => setPpSubject(e.target.value)}
        required
      >
        <option value="">Select subject</option>
        {SUBJECT_OPTIONS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <div style={styles.row}>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Year *</label>
          <select
            style={styles.input}
            value={ppYear}
            onChange={(e) => setPpYear(e.target.value)}
            required
          >
            <option value="">Select year</option>
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Semester</label>
          <input
            style={styles.input}
            type="number"
            min="1" max="8"
            placeholder="e.g. 3"
            value={ppSemester}
            onChange={(e) => setPpSemester(e.target.value)}
          />
        </div>
      </div>

      <label style={styles.label}>Paper Tag *</label>
      <input
        style={styles.input}
        type="text"
        placeholder="e.g. MST 1, EST 1, Practice 0"
        value={ppPaperTag}
        onChange={(e) => setPpPaperTag(e.target.value)}
        required
      />

      <div style={styles.fileGroup}>
        <div style={styles.fileInputWrapper}>
          <label style={styles.label}>Questions PDF *</label>
          <input
            ref={fileInputRefs.ppQuestions}
            style={styles.fileInput}
            type="file"
            accept="application/pdf"
            onChange={(e) => setPpQuestionsFile(e.target.files[0] || null)}
            required
          />
          {ppQuestionsFile && (
            <p style={styles.fileInfo}>
              {ppQuestionsFile.name} — {(ppQuestionsFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          )}
        </div>
        <div style={styles.fileInputWrapper}>
          <label style={styles.label}>Solution PDF *</label>
          <input
            ref={fileInputRefs.ppSolution}
            style={styles.fileInput}
            type="file"
            accept="application/pdf"
            onChange={(e) => setPpSolutionFile(e.target.files[0] || null)}
            required
          />
          {ppSolutionFile && (
            <p style={styles.fileInfo}>
              {ppSolutionFile.name} — {(ppSolutionFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          )}
        </div>
      </div>

      {status === "uploading" && (
        <div style={styles.progressTrack}>
          <div style={{ ...styles.progressFill, width: `${progress}%` }} />
          <span style={styles.progressLabel}>{progress}%</span>
        </div>
      )}

      {errorMsg && <p style={styles.error}>{errorMsg}</p>}
      {successMsg && <p style={styles.success}>{successMsg}</p>}

      <div style={styles.actions}>
        <button type="button" style={styles.btnSecondary} onClick={resetPaperPair}>
          Reset
        </button>
        <button
          type="submit"
          style={status === "uploading" ? styles.btnDisabled : styles.btnPrimary}
          disabled={status === "uploading"}
        >
          {status === "uploading" ? `Uploading… ${progress}%` : "Upload Paper Pair"}
        </button>
      </div>
    </form>
  );

  const renderSingleFileTab = () => (
    <form onSubmit={handleSingleFileSubmit} style={styles.form}>
      <h3 style={styles.sectionTitle}>Upload Single Resource</h3>

      <label style={styles.label}>Resource Type *</label>
      <select
        style={styles.input}
        value={sfResourceType}
        onChange={(e) => setSfResourceType(e.target.value)}
      >
        {Object.entries(RESOURCE_TYPE_LABELS).map(([val, label]) => (
          <option key={val} value={val}>{label}</option>
        ))}
      </select>

      <label style={styles.label}>Title *</label>
      <input
        style={styles.input}
        type="text"
        placeholder="e.g. COA Practice 0"
        value={sfTitle}
        onChange={(e) => setSfTitle(e.target.value)}
        required
      />

      <label style={styles.label}>Subject</label>
      <select
        style={styles.input}
        value={sfSubject}
        onChange={(e) => setSfSubject(e.target.value)}
      >
        <option value="">Select subject (optional)</option>
        {SUBJECT_OPTIONS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <div style={styles.row}>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Year</label>
          <select
            style={styles.input}
            value={sfYear}
            onChange={(e) => setSfYear(e.target.value)}
          >
            <option value="">Select year (optional)</option>
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Semester</label>
          <input
            style={styles.input}
            type="number"
            min="1" max="8"
            placeholder="e.g. 3"
            value={sfSemester}
            onChange={(e) => setSfSemester(e.target.value)}
          />
        </div>
      </div>

      <label style={styles.label}>Paper Tag</label>
      <input
        style={styles.input}
        type="text"
        placeholder="e.g. MST 1, Practice 0"
        value={sfPaperTag}
        onChange={(e) => setSfPaperTag(e.target.value)}
      />

      <label style={styles.label}>File *</label>
      <input
        ref={fileInputRefs.sfFile}
        style={styles.fileInput}
        type="file"
        accept={
          ["pyqs", "notes", "pdf"].includes(sfResourceType)
            ? "application/pdf"
            : "image/jpeg,image/png,image/webp,application/pdf"
        }
        onChange={(e) => setSfFile(e.target.files[0] || null)}
        required
      />
      {sfFile && (
        <p style={styles.fileInfo}>
          {sfFile.name} — {(sfFile.size / 1024 / 1024).toFixed(2)} MB
        </p>
      )}

      {status === "uploading" && (
        <div style={styles.progressTrack}>
          <div style={{ ...styles.progressFill, width: `${progress}%` }} />
          <span style={styles.progressLabel}>{progress}%</span>
        </div>
      )}

      {errorMsg && <p style={styles.error}>{errorMsg}</p>}
      {successMsg && <p style={styles.success}>{successMsg}</p>}

      <div style={styles.actions}>
        <button type="button" style={styles.btnSecondary} onClick={resetSingleFile}>
          Reset
        </button>
        <button
          type="submit"
          style={status === "uploading" ? styles.btnDisabled : styles.btnPrimary}
          disabled={status === "uploading"}
        >
          {status === "uploading" ? `Uploading… ${progress}%` : "Upload Resource"}
        </button>
      </div>
    </form>
  );

  const renderQuestionJsonTab = () => (
    <form onSubmit={handleQuestionJsonSubmit} style={styles.form}>
      <h3 style={styles.sectionTitle}>Upload Question JSON</h3>
      <p style={styles.helpText}>
        Upload a JSON file with an array of question objects. Questions will be added to the quiz database.
      </p>

      <label style={styles.label}>Mode *</label>
      <select
        style={styles.input}
        value={qjMode}
        onChange={(e) => setQjMode(e.target.value)}
      >
        <option value="viva">College Viva</option>
        <option value="nptel">NPTEL Preparation</option>
      </select>

      <label style={styles.label}>Subject *</label>
      <select
        style={styles.input}
        value={qjSubject}
        onChange={(e) => setQjSubject(e.target.value)}
        required
      >
        <option value="">Select subject</option>
        {SUBJECT_OPTIONS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <label style={styles.label}>JSON File *</label>
      <input
        ref={fileInputRefs.qjFile}
        style={styles.fileInput}
        type="file"
        accept="application/json"
        onChange={(e) => setQjFile(e.target.files[0] || null)}
        required
      />
      {qjFile && (
        <p style={styles.fileInfo}>
          {qjFile.name} — {(qjFile.size / 1024).toFixed(2)} KB
        </p>
      )}

      <details style={styles.jsonExample}>
        <summary>Expected JSON format</summary>
        <pre style={styles.codeBlock}>{`[
  {
    "text": "What is a closure?",
    "options": ["A function", "A variable", "A function with its lexical scope", "An object"],
    "correctAnswer": 2,
    "difficulty": "medium",
    "explanation": "A closure is a function that retains access to its lexical scope...",
    "tags": ["javascript", "closures"],
    "timeLimitSeconds": 30
  }
]`}</pre>
      </details>

      {status === "uploading" && (
        <div style={styles.progressTrack}>
          <div style={{ ...styles.progressFill, width: `${progress}%` }} />
          <span style={styles.progressLabel}>{progress}%</span>
        </div>
      )}

      {errorMsg && <p style={styles.error}>{errorMsg}</p>}
      {successMsg && <p style={styles.success}>{successMsg}</p>}

      <div style={styles.actions}>
        <button type="button" style={styles.btnSecondary} onClick={resetQuestionJson}>
          Reset
        </button>
        <button
          type="submit"
          style={status === "uploading" ? styles.btnDisabled : styles.btnPrimary}
          disabled={status === "uploading"}
        >
          {status === "uploading" ? `Uploading… ${progress}%` : "Upload Questions"}
        </button>
      </div>
    </form>
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Admin Dashboard</h1>
        <p style={styles.subtitle}>Upload and manage resources</p>
      </div>

      <div style={styles.tabs} role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === "paper-pair"}
          style={{ ...styles.tab, ...(activeTab === "paper-pair" ? styles.tabActive : {}) }}
          onClick={() => { setActiveTab("paper-pair"); setErrorMsg(""); setSuccessMsg(""); setStatus("idle"); }}
        >
          📄 Paper Pair
        </button>
        <button
          role="tab"
          aria-selected={activeTab === "single-file"}
          style={{ ...styles.tab, ...(activeTab === "single-file" ? styles.tabActive : {}) }}
          onClick={() => { setActiveTab("single-file"); setErrorMsg(""); setSuccessMsg(""); setStatus("idle"); }}
        >
          📎 Single File
        </button>
        <button
          role="tab"
          aria-selected={activeTab === "question-json"}
          style={{ ...styles.tab, ...(activeTab === "question-json" ? styles.tabActive : {}) }}
          onClick={() => { setActiveTab("question-json"); setErrorMsg(""); setSuccessMsg(""); setStatus("idle"); }}
        >
          ❓ Question JSON
        </button>
      </div>

      <div style={styles.card} role="tabpanel">
        {activeTab === "paper-pair" && renderPaperPairTab()}
        {activeTab === "single-file" && renderSingleFileTab()}
        {activeTab === "question-json" && renderQuestionJsonTab()}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 720,
    margin: "0 auto",
    padding: "24px 16px",
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 600,
    margin: 0,
    color: "var(--text)",
  },
  subtitle: {
    fontSize: 14,
    color: "var(--muted)",
    margin: "8px 0 0",
  },
  tabs: {
    display: "flex",
    gap: 8,
    marginBottom: 16,
    borderBottom: "1px solid var(--border)",
    paddingBottom: 8,
  },
  tab: {
    padding: "10px 16px",
    borderRadius: 8,
    border: "1px solid var(--border)",
    background: "var(--surface)",
    color: "var(--text-secondary)",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  tabActive: {
    background: "var(--primary)",
    borderColor: "var(--primary)",
    color: "var(--on-primary)",
  },
  card: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    padding: 24,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  sectionTitle: {
    margin: "0 0 4px",
    fontSize: 18,
    fontWeight: 600,
  },
  helpText: {
    margin: "0 0 16px",
    fontSize: 13,
    color: "var(--muted)",
  },
  label: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--text-secondary)",
  },
  input: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid var(--border)",
    background: "var(--bg)",
    color: "var(--text)",
    fontSize: 14,
    width: "100%",
    boxSizing: "border-box",
  },
  row: {
    display: "flex",
    gap: 12,
  },
  fileGroup: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  },
  fileInputWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  fileInput: {
    fontSize: 13,
  },
  fileInfo: {
    fontSize: 12,
    color: "var(--muted)",
    margin: 0,
  },
  progressTrack: {
    position: "relative",
    height: 8,
    background: "var(--border)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    background: "var(--primary)",
    transition: "width 0.2s",
  },
  progressLabel: {
    fontSize: 11,
    textAlign: "center",
    display: "block",
    marginTop: 4,
    color: "var(--muted)",
  },
  error: {
    color: "var(--danger)",
    fontSize: 13,
    margin: 0,
  },
  success: {
    color: "var(--success)",
    fontSize: 13,
    margin: 0,
  },
  actions: {
    display: "flex",
    gap: 12,
    justifyContent: "flex-end",
    marginTop: 8,
  },
  btnPrimary: {
    padding: "10px 20px",
    borderRadius: 8,
    border: "none",
    background: "var(--primary)",
    color: "var(--on-primary)",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 14,
  },
  btnSecondary: {
    padding: "10px 16px",
    borderRadius: 8,
    border: "1px solid var(--border)",
    background: "transparent",
    color: "var(--text)",
    cursor: "pointer",
    fontWeight: 500,
    fontSize: 14,
  },
  btnDisabled: {
    padding: "10px 20px",
    borderRadius: 8,
    border: "none",
    background: "var(--surface-3)",
    color: "var(--muted)",
    cursor: "not-allowed",
    fontWeight: 600,
    fontSize: 14,
  },
  jsonExample: {
    marginTop: 8,
  },
  codeBlock: {
    background: "var(--bg)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: 12,
    fontSize: 12,
    overflow: "auto",
    color: "var(--text-secondary)",
    whiteSpace: "pre-wrap",
  },
};