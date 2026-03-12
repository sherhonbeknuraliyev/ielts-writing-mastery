import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { trpc } from "../utils/trpc.js";

type TaskType = "task1-academic" | "task2";

interface Props {
  type: TaskType;
}

const TASK_INFO: Record<TaskType, { title: string; icon: string; description: string; time: number; words: string; criteria: string[] }> = {
  "task1-academic": {
    title: "IELTS Task 1 — Academic",
    icon: "📊",
    description:
      "Describe, summarise or explain information presented in a graph, chart, table or diagram. Write at least 150 words.",
    time: 20,
    words: "150–200 words",
    criteria: ["Task Achievement", "Coherence & Cohesion", "Lexical Resource", "Grammatical Range & Accuracy"],
  },
  task2: {
    title: "IELTS Task 2 — Essay",
    icon: "📝",
    description:
      "Write an essay in response to a point of view, argument or problem. Write at least 250 words. Task 2 carries more weight than Task 1.",
    time: 40,
    words: "250–300 words",
    criteria: ["Task Response", "Coherence & Cohesion", "Lexical Resource", "Grammatical Range & Accuracy"],
  },
};

const DIFFICULTIES = ["all", "intermediate", "advanced", "expert"] as const;
type Filter = (typeof DIFFICULTIES)[number];

const DIFFICULTY_BADGE: Record<string, string> = {
  intermediate: "badge-info",
  advanced: "badge-primary",
  expert: "badge-warning",
};

export function TaskPromptsPage({ type }: Props) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>("all");
  const info = TASK_INFO[type];

  const { data: prompts, isLoading, error } = trpc.prompt.list.useQuery({ type });

  const filtered =
    filter === "all"
      ? (prompts ?? [])
      : (prompts ?? []).filter((p) => p.difficulty === filter);

  if (isLoading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        <span>Loading prompts…</span>
      </div>
    );
  }

  if (error) {
    return <div className="error-state">Failed to load prompts. Please try again.</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>{info.icon} {info.title}</h1>
      </div>

      <div className="info-banner">
        <span className="info-banner-icon">{info.icon}</span>
        <div className="info-banner-content">
          <h3>{info.title}</h3>
          <p>{info.description}</p>
          <div className="info-stats">
            <div className="info-stat">
              <span className="info-stat-value">⏱️ {info.time} min</span>
              <span className="info-stat-label">Time Limit</span>
            </div>
            <div className="info-stat">
              <span className="info-stat-value">📝 {info.words}</span>
              <span className="info-stat-label">Word Target</span>
            </div>
            <div className="info-stat">
              <span className="info-stat-value">📊 {filtered.length}</span>
              <span className="info-stat-label">Prompts</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-6">
        <div className="card-body">
          <div className="section-title" style={{ marginBottom: "var(--space-3)" }}>
            Evaluation Criteria
          </div>
          <div className="flex gap-2 flex-wrap">
            {info.criteria.map((c) => (
              <span key={c} className="badge badge-primary">{c}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="filter-bar">
        {DIFFICULTIES.map((d) => (
          <button
            key={d}
            className={`filter-chip ${filter === d ? "active" : ""}`}
            onClick={() => setFilter(d)}
          >
            {d === "all" ? "All Levels" : d.charAt(0).toUpperCase() + d.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>No prompts found</h3>
          <p>Try a different difficulty filter.</p>
        </div>
      ) : (
        <div className="grid-auto">
          {filtered.map((prompt) => (
            <div
              key={prompt.id}
              className="card card-clickable"
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/writing/practice/${prompt.id}`)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/writing/practice/${prompt.id}`); } }}
            >
              <div className="card-body">
                <div className="flex items-center gap-2 mb-4">
                  <span className={`badge ${DIFFICULTY_BADGE[prompt.difficulty] ?? "badge-gray"}`}>
                    {prompt.difficulty}
                  </span>
                  <span className="badge badge-gray">{prompt.category}</span>
                  {prompt.chartData && (
                    <span className="badge badge-info">📊 Chart included</span>
                  )}
                </div>
                <p className="text-sm" style={{ color: "var(--color-gray-700)", lineHeight: 1.6 }}>
                  {prompt.prompt.slice(0, 140)}{prompt.prompt.length > 140 ? "…" : ""}
                </p>
                <div className="flex gap-3 mt-4">
                  <span className="text-xs text-muted">⏱️ {prompt.timeLimit} min</span>
                  <span className="text-xs text-muted">📝 {prompt.wordLimit.min}–{prompt.wordLimit.max} words</span>
                </div>
              </div>
              <div className="card-footer">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/writing/practice/${prompt.id}`);
                  }}
                >
                  Start Writing
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
