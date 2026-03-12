import { useState } from "react";
import type { WritingPrompt } from "@shared/schemas/prompt.schema.js";

interface Props {
  prompt: WritingPrompt;
}

export function GuidePanel({ prompt }: Props) {
  const [showStructure, setShowStructure] = useState(true);
  const [showTips, setShowTips] = useState(true);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", overflowY: "auto" }}>
      {/* Structure */}
      <div className="sidebar-panel">
        <div className="sidebar-panel-header" onClick={() => setShowStructure((s) => !s)}>
          <h4>📐 Sample Structure</h4>
          <span>{showStructure ? "▲" : "▼"}</span>
        </div>
        {showStructure && (
          <div className="sidebar-panel-body">
            {prompt.sampleStructure.map((s, i) => (
              <div key={i} className="structure-item">
                <div className="structure-para">{s.paragraph}</div>
                <div className="structure-purpose">{s.purpose}</div>
                <div className="structure-count">{s.sentenceCount}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="sidebar-panel">
        <div className="sidebar-panel-header" onClick={() => setShowTips((s) => !s)}>
          <h4>💡 Writing Tips</h4>
          <span>{showTips ? "▲" : "▼"}</span>
        </div>
        {showTips && (
          <div className="sidebar-panel-body">
            <ul className="tips-list">
              {prompt.tips.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
