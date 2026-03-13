import { useState } from "react";
import type { WritingPrompt } from "@shared/schemas/prompt.schema.js";

interface Props {
  prompt: WritingPrompt;
  checklistState?: Record<number, boolean>;
  onToggleChecklist?: (i: number) => void;
}

export function GuidePanel({ prompt, checklistState = {}, onToggleChecklist }: Props) {
  const [showStructure, setShowStructure] = useState(true);
  const [showTips, setShowTips] = useState(true);
  const [showChecklist, setShowChecklist] = useState(true);

  return (
    <>
      {/* Structure */}
      {prompt.sampleStructure.length > 0 && (
        <div className="guide-section">
          <div className="guide-section-header" onClick={() => setShowStructure((s) => !s)}>
            <span>📐 Sample Structure</span>
            <span>{showStructure ? "▲" : "▼"}</span>
          </div>
          {showStructure && (
            <div className="guide-section-body">
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
      )}

      {/* Tips */}
      {prompt.tips.length > 0 && (
        <div className="guide-section">
          <div className="guide-section-header" onClick={() => setShowTips((s) => !s)}>
            <span>💡 Writing Tips</span>
            <span>{showTips ? "▲" : "▼"}</span>
          </div>
          {showTips && (
            <div className="guide-section-body">
              <ul className="tips-list">
                {prompt.tips.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Checklist */}
      {prompt.evaluationChecklist.length > 0 && (
        <div className="guide-section">
          <div className="guide-section-header" onClick={() => setShowChecklist((s) => !s)}>
            <span>✅ Self-Check</span>
            <span>{showChecklist ? "▲" : "▼"}</span>
          </div>
          {showChecklist && (
            <div className="guide-section-body">
              {prompt.evaluationChecklist.map((item, i) => (
                <label key={i} className="eval-check-item">
                  <input
                    type="checkbox"
                    checked={checklistState[i] ?? false}
                    onChange={() => onToggleChecklist?.(i)}
                  />
                  <span className={checklistState[i] ? "checked-item" : ""}>{item}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
