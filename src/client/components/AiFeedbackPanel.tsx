interface AiFeedback {
  taskAchievement: number;
  coherenceCohesion: number;
  lexicalResource: number;
  grammaticalRange: number;
  overallBand: number;
  errors: { original: string; corrected: string; explanation: string }[];
  vocabularySuggestions: { original: string; upgraded: string }[];
  tips: string[];
  summary: string;
}

interface Props {
  feedback: AiFeedback;
  onClose: () => void;
}

const CRITERION_LABELS = [
  { key: "taskAchievement" as const, label: "Task Achievement", color: "#7c6bc4" },
  { key: "coherenceCohesion" as const, label: "Coherence & Cohesion", color: "#4fa8b8" },
  { key: "lexicalResource" as const, label: "Lexical Resource", color: "#d4940d" },
  { key: "grammaticalRange" as const, label: "Grammatical Range", color: "#3a9a6b" },
];

function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  const pct = (score / 9) * 100;
  return (
    <div className="score-bar-item">
      <div className="score-bar-header">
        <span className="score-bar-label">{label}</span>
        <span className="score-bar-value" style={{ color }}>{score}</span>
      </div>
      <div className="score-bar-track">
        <div
          className="score-bar-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

export function AiFeedbackPanel({ feedback, onClose }: Props) {
  return (
    <div className="ai-feedback-overlay" onClick={onClose}>
      <div className="ai-feedback-panel" onClick={(e) => e.stopPropagation()}>
        <div className="ai-feedback-header">
          <h2>AI Essay Feedback</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="ai-feedback-body">
          {/* Overall band */}
          <div className="overall-band">
            <div className="overall-band-number">{feedback.overallBand}</div>
            <div className="overall-band-label">Overall Band Score</div>
          </div>

          {/* Criterion scores */}
          <div className="criterion-scores">
            {CRITERION_LABELS.map(({ key, label, color }) => (
              <ScoreBar key={key} label={label} score={feedback[key]} color={color} />
            ))}
          </div>

          {/* Summary */}
          <div className="feedback-section">
            <h4 className="feedback-section-title">Summary</h4>
            <p className="feedback-summary">{feedback.summary}</p>
          </div>

          {/* Tips */}
          {feedback.tips.length > 0 && (
            <div className="feedback-section">
              <h4 className="feedback-section-title">Improvement Tips</h4>
              <ol className="feedback-tips">
                {feedback.tips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ol>
            </div>
          )}

          {/* Errors */}
          {feedback.errors.length > 0 && (
            <div className="feedback-section">
              <h4 className="feedback-section-title">Errors & Corrections</h4>
              <div className="error-list">
                {feedback.errors.map((err, i) => (
                  <div key={i} className="error-item">
                    <div className="error-original">{err.original}</div>
                    <div className="error-arrow">→</div>
                    <div className="error-corrected">{err.corrected}</div>
                    <div className="error-explanation">{err.explanation}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vocabulary suggestions */}
          {feedback.vocabularySuggestions.length > 0 && (
            <div className="feedback-section">
              <h4 className="feedback-section-title">Vocabulary Upgrades</h4>
              <div className="vocab-suggestions">
                {feedback.vocabularySuggestions.map((v, i) => (
                  <div key={i} className="vocab-suggestion-item">
                    <span className="vocab-original">{v.original}</span>
                    <span className="vocab-arrow">→</span>
                    <span className="vocab-upgraded">{v.upgraded}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
