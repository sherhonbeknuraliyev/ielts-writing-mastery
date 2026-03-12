import { useState } from "react";
import { trpc } from "../utils/trpc.js";

function formatDate(val: string | Date | undefined): string {
  if (!val) return "";
  return new Date(val as string).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatType(type: string) {
  return type.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function BandBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div className="score-bar-item">
      <div className="score-bar-header">
        <span className="score-bar-label">{label}</span>
        <span className="score-bar-value" style={{ color }}>{score}</span>
      </div>
      <div className="score-bar-track">
        <div className="score-bar-fill" style={{ width: `${(score / 9) * 100}%`, background: color }} />
      </div>
    </div>
  );
}

const CRITERION_INFO = [
  { key: "taskAchievement" as const, label: "Task Achievement", color: "#7c6bc4" },
  { key: "coherenceCohesion" as const, label: "Coherence & Cohesion", color: "#4fa8b8" },
  { key: "lexicalResource" as const, label: "Lexical Resource", color: "#d4940d" },
  { key: "grammaticalRange" as const, label: "Grammatical Range", color: "#3a9a6b" },
];

interface WritingItem {
  _id?: unknown;
  type: string;
  wordCount: number;
  timeSpent: number;
  content: string;
  createdAt?: unknown;
  promptText?: string;
  aiFeedback?: {
    overallBand?: number;
    taskAchievement?: number;
    coherenceCohesion?: number;
    lexicalResource?: number;
    grammaticalRange?: number;
    errors?: { original: string; corrected: string; explanation: string }[];
    vocabularySuggestions?: { original: string; upgraded: string }[];
    tips?: string[];
    summary?: string;
  };
}

function WritingCard({ item, onDelete }: { item: WritingItem; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const id = String(item._id ?? "");
  const band = item.aiFeedback?.overallBand;

  return (
    <div className="card" style={{ marginBottom: "var(--space-4)" }}>
      <div
        className="card-header"
        style={{ cursor: "pointer", userSelect: "none" }}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onClick={() => setExpanded((e) => !e)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpanded((prev) => !prev); } }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flexWrap: "wrap" }}>
          <span className={`badge badge-${item.type === "task2" ? "primary" : "info"}`}>
            {formatType(item.type)}
          </span>
          {band != null && <span className="badge badge-success">Band {band}</span>}
          <span className="text-xs text-muted">{formatDate(item.createdAt as string)}</span>
          <span className="writing-stat">{item.wordCount} words</span>
          <span className="writing-stat">{Math.round(item.timeSpent / 60)} min</span>
        </div>
        <span aria-hidden="true" style={{ color: "var(--color-gray-400)", fontSize: "0.85rem" }}>{expanded ? "▲" : "▼"}</span>
      </div>

      {expanded && (
        <div className="card-body">
          {item.promptText && (
            <div style={{ background: "var(--color-gray-50)", borderRadius: "var(--radius)", padding: "var(--space-3)", marginBottom: "var(--space-4)", fontSize: "0.875rem", color: "var(--color-gray-600)", borderLeft: "3px solid var(--color-primary)" }}>
              <strong>Prompt:</strong> {item.promptText}
            </div>
          )}

          <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.8, fontSize: "0.9rem", color: "var(--color-gray-700)", marginBottom: "var(--space-4)" }}>
            {item.content}
          </div>

          {item.aiFeedback && (
            <div style={{ borderTop: "1px solid var(--color-gray-100)", paddingTop: "var(--space-4)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-3)" }}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setShowFeedback((s) => !s)}
                >
                  {showFeedback ? "Hide AI Feedback" : "Show AI Feedback"}
                </button>
              </div>

              {showFeedback && (
                <div>
                  <div className="overall-band" style={{ marginBottom: "var(--space-4)" }}>
                    <div className="overall-band-number">{band}</div>
                    <div className="overall-band-label">Overall Band Score</div>
                  </div>
                  <div className="criterion-scores" style={{ marginBottom: "var(--space-4)" }}>
                    {CRITERION_INFO.map(({ key, label, color }) =>
                      item.aiFeedback?.[key] != null ? (
                        <BandBar key={key} label={label} score={item.aiFeedback[key] as number} color={color} />
                      ) : null
                    )}
                  </div>
                  {item.aiFeedback.summary && (
                    <div className="feedback-section">
                      <h4 className="feedback-section-title">Summary</h4>
                      <p className="feedback-summary">{item.aiFeedback.summary}</p>
                    </div>
                  )}
                  {(item.aiFeedback.tips?.length ?? 0) > 0 && (
                    <div className="feedback-section">
                      <h4 className="feedback-section-title">Improvement Tips</h4>
                      <ol className="feedback-tips">
                        {item.aiFeedback.tips!.map((tip, i) => <li key={i}>{tip}</li>)}
                      </ol>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "var(--space-4)" }}>
            <button
              className="btn btn-ghost btn-sm"
              style={{ color: "var(--color-error)" }}
              onClick={() => {
                if (confirm("Delete this writing?")) onDelete(id);
              }}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function WritingHistoryPage() {
  const utils = trpc.useUtils();
  const { data, isLoading, error } = trpc.writing.list.useQuery({ page: 1, limit: 50 });

  const deleteMutation = trpc.writing.delete.useMutation({
    onSuccess: () => utils.writing.list.invalidate(),
  });

  if (isLoading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        <span>Loading your writings…</span>
      </div>
    );
  }

  if (error) {
    return <div className="error-state">Failed to load writings. Please try again.</div>;
  }

  const writings = (data?.items ?? []) as WritingItem[];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>My Writings</h1>
          <p style={{ color: "var(--color-gray-500)", marginTop: "var(--space-1)" }}>
            {writings.length} essay{writings.length !== 1 ? "s" : ""} saved
          </p>
        </div>
      </div>

      {writings.length === 0 ? (
        <div className="empty-state card" style={{ padding: "var(--space-10)" }}>
          <div className="empty-state-icon">✍️</div>
          <h3>No writings yet</h3>
          <p>Start writing an essay and save it to see your history here.</p>
        </div>
      ) : (
        <div>
          {writings.map((w) => (
            <WritingCard
              key={String(w._id)}
              item={w}
              onDelete={(id) => deleteMutation.mutate({ id })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
