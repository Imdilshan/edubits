import React, { useState } from "react";
import Editor from "@monaco-editor/react";

export default function ProTab({ problem }) {
  const [language, setLanguage] = useState("java");

  const code = problem.proCode?.[language] || "";

  return (
    <div className="prog-editor-wrap">
      <div className="prog-lang-toggle">
        <button
          className={language === "java" ? "is-active" : ""}
          onClick={() => setLanguage("java")}
        >
          Java
        </button>
        <button
          className={language === "cpp" ? "is-active" : ""}
          onClick={() => setLanguage("cpp")}
        >
          C++
        </button>
      </div>

      <Editor
        height="420px"
        theme="vs-dark"
        language={language === "cpp" ? "cpp" : "java"}
        value={code}
      />

      {problem.originalProblemUrl ? (
        <a
          className="prog-try-original-btn"
          href={problem.originalProblemUrl}
          target="_blank"
          rel="noreferrer"
        >
          Try your code on the original problem ↗
        </a>
      ) : (
        <p className="prog-no-link">No original problem link added.</p>
      )}
    </div>
  );
}