import { useState } from "react";

interface Annotation {
  highlight: string;
  technique: string;
  explanation: string;
}

interface Props {
  band7: string;
  band8: string;
  annotations: Annotation[];
  keyVocabulary: string[];
  onClose: () => void;
}

type Tab = "band7" | "band8" | "annotations";

export function ModelAnswerViewer({ band7, band8, annotations, keyVocabulary, onClose }: Props) {
  const [tab, setTab] = useState<Tab>("band7");

  return (
    <div className="ai-feedback-overlay" onClick={onClose}>
      <div className="ai-feedback-panel model-answer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="ai-feedback-header">
          <h2>Model Answers</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="model-answer-tabs">
          <button
            className={`model-tab ${tab === "band7" ? "active" : ""}`}
            onClick={() => setTab("band7")}
          >
            Band 7
          </button>
          <button
            className={`model-tab ${tab === "band8" ? "active" : ""}`}
            onClick={() => setTab("band8")}
          >
            Band 8
          </button>
          {annotations.length > 0 && (
            <button
              className={`model-tab ${tab === "annotations" ? "active" : ""}`}
              onClick={() => setTab("annotations")}
            >
              Annotations
            </button>
          )}
        </div>

        <div className="ai-feedback-body">
          {(tab === "band7" || tab === "band8") && (
            <>
              <div className={`band-label-badge ${tab === "band8" ? "band8" : "band7"}`}>
                {tab === "band7" ? "Band 7 Model Answer" : "Band 8 Model Answer"}
              </div>
              <div className="model-answer-text">
                {(tab === "band7" ? band7 : band8)
                  .split("\n")
                  .filter(Boolean)
                  .map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
              </div>

              {keyVocabulary.length > 0 && (
                <div className="feedback-section" style={{ marginTop: "var(--space-6)" }}>
                  <h4 className="feedback-section-title">Key Vocabulary</h4>
                  <div className="key-vocab-list">
                    {keyVocabulary.map((v, i) => (
                      <span key={i} className="key-vocab-chip">{v}</span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {tab === "annotations" && (
            <div className="annotations-list">
              {annotations.map((ann, i) => (
                <div key={i} className="annotation-item">
                  <div className="annotation-highlight">"{ann.highlight}"</div>
                  <div className="annotation-technique">{ann.technique}</div>
                  <div className="annotation-explanation">{ann.explanation}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
