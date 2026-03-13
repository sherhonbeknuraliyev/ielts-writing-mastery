import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { trpc } from "../utils/trpc.js";
import { useAuth } from "../utils/auth.js";
import { BAND_DESCRIPTORS } from "@shared/constants/index.js";
import type { Skill } from "@shared/schemas/skill.schema.js";

const CRITERION_INFO = [
  { key: "taskAchievement" as const, label: "Task Achievement", color: "#7c6bc4" },
  { key: "coherenceCohesion" as const, label: "Coherence & Cohesion", color: "#4fa8b8" },
  { key: "lexicalResource" as const, label: "Lexical Resource", color: "#d4940d" },
  { key: "grammaticalRange" as const, label: "Grammatical Range", color: "#3a9a6b" },
];

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [descriptorsOpen, setDescriptorsOpen] = useState(false);

  const { data: stats } = trpc.writing.stats.useQuery();
  const { data: writings } = trpc.writing.list.useQuery({ page: 1, limit: 5 });
  const { data: allSkills } = trpc.skill.list.useQuery(undefined);
  const { data: analytics } = trpc.analytics.get.useQuery();

  const lastSkillId = localStorage.getItem("last-skill-id");
  const lastSkill = lastSkillId ? (allSkills as Skill[] | undefined)?.find((s) => s.id === lastSkillId) : null;

  const today = new Date().toDateString();
  const todayWritings = (writings?.items ?? []).filter((w) => new Date(w.createdAt as Date).toDateString() === today);
  const todayWords = todayWritings.reduce((sum, w) => sum + (w.wordCount ?? 0), 0);

  const recentWritings = writings?.items ?? [];

  return (
    <div>
      <div className="dashboard-welcome">
        <h1>Welcome back, {user?.firstName}!</h1>
        <p>Stay consistent — even one essay a day will lift your band score.</p>
        <div className="quick-actions">
          <button className="quick-action-btn primary" onClick={() => navigate("/writing/task2")}>
            Start Task 2 Essay
          </button>
          <button className="quick-action-btn" onClick={() => navigate("/skills")}>
            Practice Sentence Structures
          </button>
          <button className="quick-action-btn" onClick={() => navigate("/vocabulary")}>
            Build Vocabulary
          </button>
        </div>
      </div>

      {/* Continue where you left off */}
      {(lastSkill || writings?.items?.length) && (
        <div className="continue-section mb-6">
          <div className="section-title">Continue Where You Left Off</div>
          <div className="grid-2" style={{ gap: "var(--space-4)" }}>
            {lastSkill && (
              <div
                className="card card-clickable"
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/skills/${lastSkill.id}`)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/skills/${lastSkill.id}`); } }}
              >
                <div className="card-body">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="badge badge-primary">Skill</span>
                    <span className="text-sm text-muted">Last visited</span>
                  </div>
                  <div style={{ fontWeight: 600 }}>{lastSkill.title}</div>
                  <div className="text-sm text-muted" style={{ marginTop: "var(--space-1)" }}>
                    {lastSkill.exercises.length} exercise{lastSkill.exercises.length !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
            )}
            {writings?.items?.[0] && (
              <div
                className="card card-clickable"
                role="button"
                tabIndex={0}
                onClick={() => navigate("/writing/history")}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate("/writing/history"); } }}
              >
                <div className="card-body">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`badge badge-${(writings.items[0]?.type ?? "task2") === "task2" ? "primary" : "info"}`}>
                      {(writings.items[0]?.type ?? "").replace(/-/g, " ").toUpperCase()}
                    </span>
                    <span className="text-sm text-muted">Last writing</span>
                  </div>
                  <p className="text-sm text-muted" style={{ WebkitLineClamp: 2, display: "-webkit-box", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {(writings.items[0]?.content ?? "").slice(0, 100)}…
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Today's activity */}
      <div className="grid-3 mb-6">
        <div className="stat-card">
          <span className="stat-icon">✍️</span>
          <div className="stat-info">
            <div className="stat-value">{todayWritings.length}</div>
            <div className="stat-label">Essays Today</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📝</span>
          <div className="stat-info">
            <div className="stat-value">{todayWords}</div>
            <div className="stat-label">Words Today</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🏆</span>
          <div className="stat-info">
            <div className="stat-value">{stats?.total ?? 0}</div>
            <div className="stat-label">Total Essays</div>
          </div>
        </div>
      </div>

      {/* AI Score cards */}
      {stats?.averageBands ? (
        <div className="grid-4 mb-6">
          {CRITERION_INFO.map(({ key, label, color }) => (
            <div key={key} className="criterion-card" style={{ borderTopColor: color }}>
              <div className="criterion-card-score" style={{ color }}>
                {stats.averageBands![key]}
              </div>
              <div className="criterion-card-label">{label}</div>
              <div className="criterion-card-sub">avg band</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid-3 mb-6">
          <div className="stat-card">
            <span className="stat-icon">📝</span>
            <div className="stat-info">
              <div className="stat-value">{stats?.total ?? 0}</div>
              <div className="stat-label">Essays Written</div>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">📊</span>
            <div className="stat-info">
              <div className="stat-value">{stats?.writingsPerType?.["task2"] ?? 0}</div>
              <div className="stat-label">Task 2 Essays</div>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">📈</span>
            <div className="stat-info">
              <div className="stat-value">—</div>
              <div className="stat-label">Avg Band (no AI yet)</div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Insights */}
      {analytics?.sufficient ? (
        <div className="card mb-6">
          <div className="card-header">
            <div className="section-title" style={{ marginBottom: 0 }}>Performance Insights</div>
            <Link to="/analytics" className="btn btn-ghost btn-sm">View Full Analytics →</Link>
          </div>
          <div className="card-body dashboard-insights">
            {analytics.criteriaAverages && (
              <div className="dashboard-insights-chart">
                <ResponsiveContainer width={200} height={200}>
                  <RadarChart
                    data={[
                      { subject: "Task", value: analytics.criteriaAverages.taskAchievement },
                      { subject: "Coherence", value: analytics.criteriaAverages.coherenceCohesion },
                      { subject: "Lexical", value: analytics.criteriaAverages.lexicalResource },
                      { subject: "Grammar", value: analytics.criteriaAverages.grammaticalRange },
                    ]}
                    margin={{ top: 5, right: 20, bottom: 5, left: 20 }}
                  >
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                    <Radar dataKey="value" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.3} />
                    <Tooltip formatter={(v) => [typeof v === "number" ? v.toFixed(1) : v, "Score"]} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="dashboard-insights-text">
              {analytics.weakestCriterion && (
                <div
                  style={{
                    padding: "var(--space-3)",
                    background: "var(--warning-light)",
                    borderRadius: "var(--radius)",
                    borderLeft: "3px solid var(--warning)",
                  }}
                >
                  <div className="text-sm" style={{ fontWeight: 600 }}>
                    Focus on {analytics.weakestCriterion.name}
                  </div>
                  <div className="text-sm text-muted">
                    It's {analytics.weakestCriterion.gap.toFixed(1)} bands below your best criterion
                  </div>
                </div>
              )}
              {analytics.recommendations?.[0] && (
                <div style={{ padding: "var(--space-3)", background: "var(--accent-light)", borderRadius: "var(--radius)" }}>
                  <div className="text-sm" style={{ fontWeight: 600 }}>{analytics.recommendations[0].title}</div>
                  <div className="text-sm text-muted">{analytics.recommendations[0].description}</div>
                  {analytics.recommendations[0].link && (
                    <Link to={analytics.recommendations[0].link} className="text-sm" style={{ color: "var(--accent)", textDecoration: "none", marginTop: "var(--space-1)", display: "inline-block" }}>
                      Go →
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : analytics && !analytics.sufficient ? (
        <div
          className="mb-6"
          style={{
            padding: "var(--space-3) var(--space-4)",
            background: "var(--bg-secondary)",
            borderRadius: "var(--radius)",
            border: "1px solid var(--border)",
            color: "var(--text-secondary)",
            fontSize: "var(--text-sm)",
          }}
        >
          Complete {3 - analytics.totalEvaluated} more AI-evaluated essay{3 - analytics.totalEvaluated !== 1 ? "s" : ""} to unlock performance insights.{" "}
          <Link to="/writing/task2" style={{ color: "var(--accent)" }}>Start writing →</Link>
        </div>
      ) : null}

      {/* Recent writings */}
      <div className="section-title">Recent Writings</div>
      {recentWritings.length === 0 ? (
        <div className="empty-state card" style={{ padding: "var(--space-10)" }}>
          <div className="empty-state-icon">✍️</div>
          <h3>No writings yet</h3>
          <p>Start your first writing practice to see your progress here.</p>
          <button className="btn btn-primary" onClick={() => navigate("/writing/task2")}>
            Start Writing
          </button>
        </div>
      ) : (
        <div className="grid-auto mb-8">
          {recentWritings.map((w) => {
            const band = (w as { aiFeedback?: { overallBand?: number } }).aiFeedback?.overallBand;
            return (
              <div
                key={String(w._id)}
                className="card card-clickable"
                role="button"
                tabIndex={0}
                onClick={() => navigate("/writing/history")}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate("/writing/history"); } }}
              >
                <div className="card-body">
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`badge badge-${w.type === "task2" ? "primary" : "info"}`}>
                      {w.type.replace(/-/g, " ").toUpperCase()}
                    </span>
                    {band != null && (
                      <span className="badge badge-success">Band {band}</span>
                    )}
                    <span className="text-xs text-muted">
                      {new Date(w.createdAt as Date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted" style={{ WebkitLineClamp: 2, display: "-webkit-box", WebkitBoxOrient: "vertical", overflow: "hidden", whiteSpace: "normal" }}>
                    {w.content.slice(0, 120)}…
                  </p>
                  <div className="flex gap-3 mt-4">
                    <span className="writing-stat">{w.wordCount} words</span>
                    <span className="writing-stat">{Math.round(w.timeSpent / 60)} min</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Band descriptors (collapsible) */}
      <div className="card">
        <div
          className="card-header"
          style={{ cursor: "pointer", userSelect: "none" }}
          role="button"
          tabIndex={0}
          onClick={() => setDescriptorsOpen((o) => !o)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setDescriptorsOpen((o) => !o); } }}
        >
          <div className="section-title" style={{ marginBottom: 0 }}>
            Band Descriptor Reference
          </div>
          <span>{descriptorsOpen ? "▲ Hide" : "▼ Show"}</span>
        </div>
        {descriptorsOpen && (
          <div className="card-body">
            <div className="grid-2 gap-4">
              {Object.entries(BAND_DESCRIPTORS).map(([key, desc]) => (
                <div key={key} className="descriptor-block">
                  <h4>{desc.name}</h4>
                  <div className="descriptor-row">
                    <span className="badge badge-warning">Band 6</span>
                    <span>{desc.band6}</span>
                  </div>
                  <div className="descriptor-row">
                    <span className="badge badge-primary">Band 7</span>
                    <span>{desc.band7}</span>
                  </div>
                  <div className="descriptor-row">
                    <span className="badge badge-success">Band 8</span>
                    <span>{desc.band8}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
