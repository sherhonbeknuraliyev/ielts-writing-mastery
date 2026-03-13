import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FileText, BookOpen, Brain, Zap } from "lucide-react";
import { trpc } from "../utils/trpc.js";
import { ExerciseRunner } from "../components/ExerciseRunner.js";
import type { ExerciseResult } from "../components/ExerciseRunner.js";
import type { Skill } from "@shared/schemas/skill.schema.js";

const CONTENT_STYLES: Record<string, React.CSSProperties> = {
  heading: { fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginTop: "var(--space-6)", marginBottom: "var(--space-2)" },
  paragraph: { lineHeight: 1.8, color: "var(--text-primary)", marginBottom: "var(--space-3)" },
  example: { background: "var(--accent-light)", borderLeft: "3px solid var(--accent)", padding: "var(--space-3) var(--space-4)", borderRadius: "var(--radius-sm)", fontStyle: "italic", color: "var(--text-primary)", marginBottom: "var(--space-3)" },
  rule: { background: "var(--success-light)", borderLeft: "3px solid var(--success)", padding: "var(--space-3) var(--space-4)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", marginBottom: "var(--space-3)" },
  tip: { background: "var(--warning-light)", borderLeft: "3px solid var(--warning)", padding: "var(--space-3) var(--space-4)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", marginBottom: "var(--space-3)" },
  warning: { background: "var(--error-light)", borderLeft: "3px solid var(--error)", padding: "var(--space-3) var(--space-4)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", marginBottom: "var(--space-3)" },
  comparison: { background: "var(--bg-secondary)", border: "1px solid var(--border)", padding: "var(--space-3) var(--space-4)", borderRadius: "var(--radius)", color: "var(--text-primary)", marginBottom: "var(--space-3)", fontFamily: "var(--font-mono)", fontSize: "0.875rem" },
};

function ContentBlock({ type, text }: { type: string; text: string }) {
  const style = CONTENT_STYLES[type] ?? CONTENT_STYLES.paragraph!;
  if (type === "heading") return <h3 style={style}>{text}</h3>;
  return <div style={style}>{text}</div>;
}

function ScoreSummary({ results, onRetry, skill, allSkills }: { results: ExerciseResult[]; onRetry: () => void; skill: Skill; allSkills: Skill[] }) {
  const score = results.filter((r) => r.correct).length;
  const total = results.length;
  const pct = Math.round((score / total) * 100);
  const navigate = useNavigate();

  // Find next skill in same module
  const moduleSkills = allSkills.filter((s) => s.module === skill.module);
  const idx = moduleSkills.findIndex((s) => s.id === skill.id);
  const nextInModule = idx >= 0 && idx + 1 < moduleSkills.length ? moduleSkills[idx + 1] : null;

  // Find a skill from a different module
  const otherModuleSkill = allSkills.find((s) => s.module !== skill.module);

  return (
    <div style={{ marginTop: "var(--space-8)" }}>
      <div className="score-summary">
        <h3>Exercises Complete!</h3>
        <div className="score-big">{score}/{total}</div>
        <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.9rem" }}>
          {pct}% — {pct === 100 ? "Perfect!" : pct >= 80 ? "Excellent work." : pct >= 60 ? "Good — review the ones you missed." : "Keep practising."}
        </p>
      </div>
      <div style={{ marginTop: "var(--space-4)", textAlign: "center" }}>
        <button className="btn btn-ghost" onClick={onRetry}>
          Try Again
        </button>
      </div>
      <div className="whats-next-panel" style={{ marginTop: "var(--space-6)" }}>
        <h3 className="whats-next-title">What's Next?</h3>
        <div className="whats-next-options">
          {nextInModule && (
            <button className="whats-next-btn" onClick={() => navigate(`/skills/${nextInModule.id}`)}>
              Next: {nextInModule.title}
            </button>
          )}
          {!nextInModule && otherModuleSkill && (
            <button className="whats-next-btn" onClick={() => navigate(`/skills/${otherModuleSkill.id}`)}>
              Try: {otherModuleSkill.title}
            </button>
          )}
          <button className="whats-next-btn" onClick={() => navigate("/skills")}>
            <Brain size={14} /> Back to Skills
          </button>
          <button className="whats-next-btn" onClick={() => navigate("/daily-challenge")}>
            <Zap size={14} /> Try Daily Challenge
          </button>
        </div>
      </div>
    </div>
  );
}

type Phase = "learn" | "practice" | "done";

function SkillDetail({ skill, allSkills }: { skill: Skill; allSkills: Skill[] }) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("learn");
  const [results, setResults] = useState<ExerciseResult[]>([]);

  useEffect(() => {
    localStorage.setItem("last-skill-id", skill.id);
  }, [skill.id]);

  return (
    <div>
      <div className="page-header">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate("/skills")} style={{ marginBottom: "var(--space-3)" }}>
          ← Back to Skills
        </button>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--space-4)", flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: "1.5rem" }}>{skill.title}</h1>
            <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-2)", flexWrap: "wrap" }}>
              <span className="badge badge-primary">Target: {skill.targetBand}</span>
              <span className="badge badge-gray">
                {skill.criterion.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </span>
              <span className="badge badge-gray">
                {skill.module.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </span>
            </div>
          </div>
          {phase === "learn" && skill.exercises.length > 0 && (
            <button className="btn btn-primary" onClick={() => setPhase("practice")}>
              Start Exercises ({skill.exercises.length})
            </button>
          )}
        </div>
      </div>

      {phase === "learn" && (
        <div className="grid-2" style={{ gap: "var(--space-6)", alignItems: "start" }}>
          <div className="card">
            <div className="card-body">
              <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "var(--space-4)" }}>Lesson Content</h2>
              {skill.content.map((block, i) => (
                <ContentBlock key={i} type={block.type} text={block.text} />
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <div className="card">
              <div className="card-body">
                <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "var(--space-3)" }}>Key Takeaways</h2>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {skill.keyTakeaways.map((t, i) => (
                    <li key={i} style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-3)", fontSize: "0.875rem", lineHeight: 1.6, color: "var(--text-primary)" }}>
                      <span style={{ color: "var(--success)", fontWeight: 700, flexShrink: 0 }}>✓</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {skill.exercises.length > 0 && (
              <div className="card" style={{ background: "var(--accent-light)", border: "1px solid var(--accent)" }}>
                <div className="card-body" style={{ textAlign: "center" }}>
                  <div style={{ marginBottom: "var(--space-2)", display: "flex", justifyContent: "center" }}><FileText size={48} /></div>
                  <h3 style={{ marginBottom: "var(--space-2)" }}>{skill.exercises.length} Practice Exercises</h3>
                  <p className="text-sm text-muted" style={{ marginBottom: "var(--space-4)" }}>
                    Apply what you've learned with targeted exercises
                  </p>
                  <button className="btn btn-primary" onClick={() => setPhase("practice")}>
                    Start Exercises
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {phase === "practice" && (
        <ExerciseRunner
          exercises={skill.exercises}
          onComplete={(r) => {
            setResults(r);
            setPhase("done");
          }}
        />
      )}

      {phase === "done" && (
        <ScoreSummary results={results} onRetry={() => { setResults([]); setPhase("practice"); }} skill={skill} allSkills={allSkills} />
      )}
    </div>
  );
}

export function SkillDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: skill, isLoading, error } = trpc.skill.getById.useQuery(
    { id: id! },
    { enabled: !!id }
  );
  const { data: allSkillsData } = trpc.skill.list.useQuery(undefined);

  if (isLoading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        <span>Loading skill…</span>
      </div>
    );
  }

  if (error || !skill) {
    return <div className="error-state">Skill not found.</div>;
  }

  return <SkillDetail skill={skill as Skill} allSkills={(allSkillsData ?? []) as Skill[]} />;
}
