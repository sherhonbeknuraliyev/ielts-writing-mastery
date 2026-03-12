import { useState } from "react";
import { Link } from "react-router-dom";
import {
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { trpc } from "../utils/trpc.js";

const RECOMMENDATION_ICONS: Record<string, string> = {
  criterion: "🎯",
  error: "✏️",
  vocabulary: "📚",
  time: "⏱️",
  practice: "💪",
};

function formatSeconds(sec: number | null): string {
  if (sec == null) return "—";
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function ErrorPatternCard({
  category,
  count,
  examples,
}: {
  category: string;
  count: number;
  examples: Array<{ original: string; corrected: string }>;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="error-pattern-card">
      <div
        className="error-pattern-header"
        onClick={() => setOpen((o) => !o)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((o) => !o);
          }
        }}
      >
        <span style={{ fontWeight: 600 }}>{category}</span>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <span className="badge badge-warning">{count}</span>
          <span style={{ fontSize: "0.8rem", color: "var(--color-gray-500)" }}>{open ? "▲" : "▼"}</span>
        </div>
      </div>
      {open && examples.length > 0 && (
        <div className="error-pattern-examples">
          {examples.map((ex, i) => (
            <div key={i} className="error-example">
              <span className="error-example-original">{ex.original}</span>
              <span style={{ color: "var(--color-gray-500)" }}>→</span>
              <span className="error-example-corrected">{ex.corrected}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AnalyticsPage() {
  const { data, isLoading } = trpc.analytics.get.useQuery();

  if (isLoading) {
    return (
      <div style={{ padding: "var(--space-8)", textAlign: "center", color: "var(--color-gray-500)" }}>
        Loading analytics…
      </div>
    );
  }

  if (!data) {
    return (
      <div className="empty-state card" style={{ padding: "var(--space-10)" }}>
        <div className="empty-state-icon">📊</div>
        <h3>No data yet</h3>
        <p>Start writing and getting AI feedback to see your analytics.</p>
        <Link to="/writing/task2" className="btn btn-primary">
          Start Writing
        </Link>
      </div>
    );
  }

  const { totalEvaluated, sufficient } = data;
  const remaining = 3 - totalEvaluated;

  if (!sufficient) {
    return (
      <div>
        <div className="page-header">
          <h1>Your Performance</h1>
          <p className="text-muted">{totalEvaluated} AI-evaluated essay{totalEvaluated !== 1 ? "s" : ""} completed</p>
        </div>
        <div className="empty-state card" style={{ padding: "var(--space-10)" }}>
          <div className="empty-state-icon">📈</div>
          <h3>Almost there!</h3>
          <p>
            You've completed {totalEvaluated} evaluated essay{totalEvaluated !== 1 ? "s" : ""}. Complete {remaining}{" "}
            more to unlock detailed performance insights.
          </p>
          <Link to="/writing/task2" className="btn btn-primary">
            Write an Essay
          </Link>
        </div>
      </div>
    );
  }

  const { criteriaAverages, weakestCriterion, bandTrend, errorPatterns, recurringSuggestions, timeManagement, selfAwareness, recommendations } = data;

  // Radar chart data
  const radarData = criteriaAverages
    ? [
        { subject: "Task Achievement", value: criteriaAverages.taskAchievement },
        { subject: "Coherence", value: criteriaAverages.coherenceCohesion },
        { subject: "Lexical Resource", value: criteriaAverages.lexicalResource },
        { subject: "Grammar", value: criteriaAverages.grammaticalRange },
      ]
    : [];

  // Time management
  const task2Avg = timeManagement?.task2Average ?? null;
  const task2Target = timeManagement?.task2Target ?? 2400;
  const task2WithinTarget = task2Avg != null && task2Avg <= task2Target * 1.2;
  const timeColor = task2Avg == null ? "var(--color-gray-500)" : task2WithinTarget ? "var(--success)" : "var(--warning)";

  // Self-awareness
  const selfAccuracy = selfAwareness?.accuracy ?? null;

  // Sort error patterns by count
  const sortedErrors = [...(errorPatterns ?? [])].sort((a, b) => b.count - a.count);

  return (
    <div>
      <div className="page-header">
        <h1>Your Performance</h1>
        <p className="text-muted">{totalEvaluated} AI-evaluated essay{totalEvaluated !== 1 ? "s" : ""} completed</p>
      </div>

      {/* Section 1: Overview Cards */}
      <div className="analytics-overview">
        {weakestCriterion && (
          <div className="analytics-stat-card">
            <h4>Weakest Area</h4>
            <div className="analytics-stat-value">{weakestCriterion.name}</div>
            <div className="analytics-stat-detail">
              Avg {weakestCriterion.average.toFixed(1)} — {weakestCriterion.gap.toFixed(1)} bands below your best
            </div>
          </div>
        )}

        <div className="analytics-stat-card">
          <h4>Time Management</h4>
          <div className="analytics-stat-value" style={{ color: timeColor }}>
            {formatSeconds(task2Avg)}
          </div>
          <div className="analytics-stat-detail">
            vs target {formatSeconds(task2Target)} for Task 2
          </div>
        </div>

        <div className="analytics-stat-card">
          <h4>Self-Awareness</h4>
          {selfAccuracy != null ? (
            <>
              <div className="analytics-stat-value">{Math.round(selfAccuracy * 100)}%</div>
              <div className="analytics-stat-detail">accuracy vs AI scores</div>
            </>
          ) : (
            <>
              <div className="analytics-stat-value" style={{ fontSize: "1rem", fontWeight: 500 }}>—</div>
              <div className="analytics-stat-detail">Rate your essays to track self-awareness</div>
            </>
          )}
        </div>
      </div>

      {/* Section 2: Band Progress */}
      {bandTrend && bandTrend.length > 0 && (
        <div className="card" style={{ marginBottom: "var(--space-6)" }}>
          <div className="card-header">
            <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 600 }}>Band Score Trend</h2>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={bandTrend} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 9]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <ReferenceLine y={7.5} stroke="var(--accent)" strokeDasharray="4 4" label={{ value: "Target", position: "right", fontSize: 11, fill: "var(--accent)" }} />
                <Line type="monotone" dataKey="overallBand" name="Overall" stroke="var(--accent)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="taskAchievement" name="Task Achievement" stroke="var(--band-ta)" strokeWidth={1.5} strokeOpacity={0.6} dot={false} />
                <Line type="monotone" dataKey="coherenceCohesion" name="Coherence" stroke="var(--band-cc)" strokeWidth={1.5} strokeOpacity={0.6} dot={false} />
                <Line type="monotone" dataKey="lexicalResource" name="Lexical" stroke="var(--band-lr)" strokeWidth={1.5} strokeOpacity={0.6} dot={false} />
                <Line type="monotone" dataKey="grammaticalRange" name="Grammar" stroke="var(--band-gr)" strokeWidth={1.5} strokeOpacity={0.6} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Section 3: Criteria Radar */}
      {radarData.length > 0 && (
        <div className="card" style={{ marginBottom: "var(--space-6)" }}>
          <div className="card-header">
            <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 600 }}>Criteria Breakdown</h2>
          </div>
          <div className="card-body" style={{ display: "flex", justifyContent: "center" }}>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                <Radar name="Score" dataKey="value" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.3} />
                <Tooltip formatter={(v) => [typeof v === "number" ? v.toFixed(1) : v, "Score"]} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Section 4: Error Patterns */}
      {sortedErrors.length > 0 && (
        <div className="card" style={{ marginBottom: "var(--space-6)" }}>
          <div className="card-header">
            <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 600 }}>Recurring Errors</h2>
          </div>
          <div className="card-body">
            {sortedErrors.map((ep) => (
              <ErrorPatternCard
                key={ep.category}
                category={ep.category}
                count={ep.count}
                examples={ep.examples}
              />
            ))}
          </div>
        </div>
      )}

      {/* Section 5: Vocabulary Watch */}
      {recurringSuggestions && recurringSuggestions.length > 0 && (
        <div className="card" style={{ marginBottom: "var(--space-6)" }}>
          <div className="card-header">
            <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 600 }}>Words the AI Keeps Upgrading</h2>
            <p className="text-sm text-muted" style={{ marginTop: "var(--space-1)" }}>
              You've been told to replace these words multiple times — time to learn alternatives
            </p>
          </div>
          <div className="card-body">
            <table className="vocab-watch-table">
              <thead>
                <tr>
                  <th>Word</th>
                  <th>Suggested Upgrades</th>
                  <th>Times</th>
                </tr>
              </thead>
              <tbody>
                {recurringSuggestions.map((rs, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{rs.original}</td>
                    <td style={{ color: "var(--color-gray-600)" }}>{rs.suggestedUpgrades.join(", ")}</td>
                    <td>
                      <span className="badge badge-warning">{rs.count}×</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Section 6: Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="card" style={{ marginBottom: "var(--space-6)" }}>
          <div className="card-header">
            <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 600 }}>What to Practice Next</h2>
          </div>
          <div className="card-body">
            {recommendations.map((rec, i) => (
              <div key={i} className="recommendation-card">
                <div
                  className="recommendation-icon"
                  style={{ background: "var(--accent-light)" }}
                >
                  {RECOMMENDATION_ICONS[rec.type] ?? "💡"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: "var(--space-1)" }}>{rec.title}</div>
                  <div className="text-sm text-muted">{rec.description}</div>
                </div>
                {rec.link && (
                  <Link
                    to={rec.link}
                    className="btn btn-ghost btn-sm"
                    style={{ flexShrink: 0 }}
                  >
                    Go →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
