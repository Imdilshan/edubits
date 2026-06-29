import React, { useState } from "react";
import Editor from "@monaco-editor/react";

export default function FixTab({ problem }) {
  const [language, setLanguage] = useState("java");

  const code = problem.fixCode?.[language] || "// No buggy code added for this language yet.";

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

      {problem.originalProblemUrl && (
        <a
          className="prog-original-link"
          href={problem.originalProblemUrl}
          target="_blank"
          rel="noreferrer"
        >
          View original problem ↗
        </a>
      )}
    </div>
  );
}