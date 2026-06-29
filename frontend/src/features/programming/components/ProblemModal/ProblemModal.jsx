import React, { useState } from "react";
import { X } from "lucide-react";
import FixTab from "./FixTab";
import ProTab from "./ProTab";

export default function ProblemModal({ problem, onClose }) {
  const [tab, setTab] = useState("fix");

  return (
    <div className="prog-modal-overlay" onClick={onClose}>
      <div className="prog-modal" onClick={(e) => e.stopPropagation()}>
        <div className="prog-modal-header">
          <h2>{problem.title}</h2>
          <button className="prog-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="prog-modal-tabs">
          <button
            className={`prog-modal-tab ${tab === "fix" ? "is-active" : ""}`}
            onClick={() => setTab("fix")}
          >
            Automata Fix
          </button>
          <button
            className={`prog-modal-tab ${tab === "pro" ? "is-active" : ""}`}
            onClick={() => setTab("pro")}
          >
            Automata Pro
          </button>
        </div>

        <div className="prog-modal-body">
          {tab === "fix" ? (
            <FixTab problem={problem} />
          ) : (
            <ProTab problem={problem} />
          )}
        </div>
      </div>
    </div>
  );
}