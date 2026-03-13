import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { trpc } from "../utils/trpc.js";
import type { ParaphraseDrill } from "@shared/schemas/collocation.schema.js";

const METHOD_LABELS: Record<string, string> = {
  synonym: "Synonym Substitution",
  "word-form": "Word Form Change",
  restructure: "Sentence Restructuring",
  "active-passive": "Active ↔ Passive Voice",
  "clause-change": "Clause Type Change",
};

interface AiResult {
  isCorrect: boolean;
  score: number;
  feedback: string;
  improvedVersion?: string;
}

function DrillCard({ drill, onNext }: { drill: ParaphraseDrill; onNext: () => void }) {
  const [userText, setUserText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showModels, setShowModels] = useState(false);
  const [aiResult, setAiResult] = useState<AiResult | null>(null);

  const validateMutation = trpc.ai.validateExercise.useMutation({
    onSuccess: (data) => setAiResult(data as AiResult),
  });

  const handleSubmit = () => {
    if (!userText.trim()) return;
    setSubmitted(true);
    setShowModels(true);
  };

  const handleAiValidate = () => {
    validateMutation.mutate({
      exerciseType: "paraphrase",
      question: drill.original,
      modelAnswer: drill.paraphrases[0] ?? "",
      userAnswer: userText,
    });
  };

  return (
    <div className="card">
      <div className="card-body">
        <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-4)", flexWrap: "wrap" }}>
          <span className="badge badge-primary">{METHOD_LABELS[drill.method] ?? drill.method}</span>
        </div>

        <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "var(--space-4)", marginBottom: "var(--space-4)" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "var(--space-2)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Original</div>
          <p style={{ lineHeight: 1.8, color: "var(--text-primary)", fontStyle: "italic" }}>{drill.original}</p>
        </div>

        <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "var(--space-3)", padding: "var(--space-2) var(--space-3)", background: "var(--warning-light)", borderRadius: "var(--radius-sm)" }}>
          {drill.explanation}
        </div>

        <div style={{ marginBottom: "var(--space-4)" }}>
          <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "var(--space-2)", color: "var(--text-primary)" }}>
            Your Paraphrase
          </label>
          <textarea
            className="recall-sentence-area"
            rows={3}
            placeholder="Write your paraphrase here…"
            value={userText}
            disabled={submitted}
            onChange={(e) => setUserText(e.target.value)}
          />
        </div>

        {!submitted && (
          <button className="btn btn-primary" disabled={!userText.trim()} onClick={handleSubmit}>
            Check
          </button>
        )}

        {submitted && (
          <div style={{ marginTop: "var(--space-4)" }}>
            {showModels && (
              <div>
                <div className="answer-comparison">
                  <div className="answer-column user">
                    <div className="answer-column-label">Your paraphrase</div>
                    <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{userText}</div>
                  </div>
                  <div className="answer-column model">
                    <div className="answer-column-label">Model paraphrases</div>
                    <ul style={{ listStyle: "none", padding: 0 }}>
                      {drill.paraphrases.map((p, i) => (
                        <li key={i} style={{ marginBottom: "var(--space-2)", lineHeight: 1.6, borderBottom: i < drill.paraphrases.length - 1 ? "1px solid var(--border)" : "none", paddingBottom: "var(--space-2)" }}>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {aiResult ? (
                  <div className={`exercise-feedback ${aiResult.isCorrect ? "feedback-correct" : "feedback-incorrect"}`} style={{ marginTop: "var(--space-3)" }}>
                    <strong>AI Score: {aiResult.score}/10</strong>
                    <div style={{ marginTop: "var(--space-1)" }}>{aiResult.feedback}</div>
                    {aiResult.improvedVersion && (
                      <div style={{ marginTop: "var(--space-2)" }}>
                        <strong>Improved:</strong> {aiResult.improvedVersion}
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ marginTop: "var(--space-3)" }}
                    onClick={handleAiValidate}
                    disabled={validateMutation.isPending}
                  >
                    {validateMutation.isPending ? "Checking with AI…" : "Get AI Validation"}
                  </button>
                )}
              </div>
            )}

            <button className="btn btn-primary" style={{ marginTop: "var(--space-4)" }} onClick={onNext}>
              Next Drill →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function ParaphrasePage() {
  const [index, setIndex] = useState(0);
  const { data: drills, isLoading, error } = trpc.paraphrase.list.useQuery();

  if (isLoading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        <span>Loading paraphrase drills…</span>
      </div>
    );
  }

  if (error) {
    return <div className="error-state">Failed to load drills. Please try again.</div>;
  }

  const allDrills = (drills ?? []) as ParaphraseDrill[];

  if (allDrills.length === 0) {
    return (
      <div>
        <div className="page-header">
          <h1>Paraphrasing Lab</h1>
        </div>
        <div className="empty-state">
          <div className="empty-state-icon"><RefreshCw size={48} /></div>
          <h3>No drills loaded yet</h3>
          <p>Run the seed script to populate paraphrase data.</p>
        </div>
      </div>
    );
  }

  const current = allDrills[index % allDrills.length]!;
  const completed = Math.floor(index / allDrills.length) * allDrills.length + (index % allDrills.length);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Paraphrasing Lab</h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "var(--space-1)" }}>
            Master 5 paraphrase techniques for Band 7+ lexical resource
          </p>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
        <span className="text-sm text-muted">
          Drill {(index % allDrills.length) + 1} of {allDrills.length}
          {index >= allDrills.length && ` · Round ${Math.floor(index / allDrills.length) + 1}`}
        </span>
        <span className="text-sm text-muted">{completed} completed</span>
      </div>

      <div style={{ height: 6, background: "var(--border)", borderRadius: "var(--radius-xl)", marginBottom: "var(--space-6)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${((index % allDrills.length) / allDrills.length) * 100}%`, background: "var(--accent)", borderRadius: "var(--radius-xl)", transition: "width 0.3s" }} />
      </div>

      <DrillCard key={index} drill={current} onNext={() => setIndex((i) => i + 1)} />
    </div>
  );
}
