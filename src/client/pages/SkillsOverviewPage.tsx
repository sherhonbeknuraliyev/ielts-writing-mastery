import { useNavigate, useSearchParams } from "react-router-dom";
import { useRef, useEffect, type Ref } from "react";
import { trpc } from "../utils/trpc.js";
import type { Skill } from "@shared/schemas/skill.schema.js";

const MODULE_INFO = {
  "sentence-sophistication": {
    title: "Sentence Sophistication",
    description: "Master complex structures, varied sentence forms, and academic register.",
    icon: "🧠",
    color: "#7c6bc4",
  },
  "error-elimination": {
    title: "Error Elimination",
    description: "Identify and fix common grammatical errors to achieve Band 7+ accuracy.",
    icon: "🎯",
    color: "#dc2626",
  },
  "writing-techniques": {
    title: "Writing Techniques",
    description: "Master essay-writing mechanics — paragraphing, introductions, cohesion, and planning — to push from 6.5 to 7.5+.",
    icon: "✍️",
    color: "#0891b2",
  },
} as const;

const CRITERION_COLOR: Record<string, string> = {
  "task-achievement": "#7c6bc4",
  "coherence-cohesion": "#4fa8b8",
  "lexical-resource": "#d4940d",
  "grammatical-range": "#3a9a6b",
};

function SkillCard({ skill }: { skill: Skill }) {
  const navigate = useNavigate();
  const color = CRITERION_COLOR[skill.criterion] ?? "#6b7280";

  return (
    <div
      className="card card-clickable"
      style={{ borderTop: `3px solid ${color}` }}
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/skills/${skill.id}`)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/skills/${skill.id}`); } }}
    >
      <div className="card-body">
        <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-3)", marginBottom: "var(--space-3)" }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "var(--space-1)" }}>{skill.title}</h3>
            <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
              <span className="badge badge-primary" style={{ background: color, color: "#fff", border: "none" }}>
                Target: {skill.targetBand}
              </span>
              <span className="badge badge-gray">
                {skill.criterion.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </span>
            </div>
          </div>
        </div>
        <p className="text-sm text-muted" style={{ lineHeight: 1.6 }}>{skill.description}</p>
        <div style={{ marginTop: "var(--space-3)", fontSize: "0.75rem", color: "var(--color-gray-400)" }}>
          {skill.exercises.length} exercise{skill.exercises.length !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}

type ModuleKey = "sentence-sophistication" | "error-elimination" | "writing-techniques";

function SkillSection({ module, skills, sectionRef, active }: { module: ModuleKey; skills: Skill[]; sectionRef?: Ref<HTMLDivElement>; active?: boolean }) {
  const info = MODULE_INFO[module];
  const filtered = skills.filter((s) => s.module === module);

  return (
    <div ref={sectionRef} style={{ marginBottom: "var(--space-10)", scrollMarginTop: "var(--space-6)", outline: active ? "2px solid var(--color-primary)" : undefined, borderRadius: active ? "var(--radius-lg)" : undefined, padding: active ? "var(--space-4)" : undefined }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-2)" }}>
        <span style={{ fontSize: "1.5rem" }}>{info.icon}</span>
        <div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>{info.title}</h2>
          <p className="text-sm text-muted">{info.description}</p>
        </div>
        <span className="badge badge-gray" style={{ marginLeft: "auto" }}>{filtered.length} skills</span>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <p>No skills loaded yet. Run the seed script.</p>
        </div>
      ) : (
        <div className="grid-auto">
          {filtered.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      )}
    </div>
  );
}

const MODULES: ModuleKey[] = ["sentence-sophistication", "error-elimination", "writing-techniques"];

export function SkillsOverviewPage() {
  const { data: skills, isLoading, error } = trpc.skill.list.useQuery(undefined);
  const [searchParams] = useSearchParams();
  const activeModule = searchParams.get("module") as ModuleKey | null;

  const refs = useRef<Partial<Record<ModuleKey, HTMLDivElement>>>({});

  useEffect(() => {
    if (!activeModule || !MODULES.includes(activeModule)) return;
    const el = refs.current[activeModule];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [activeModule]);

  if (isLoading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        <span>Loading skills…</span>
      </div>
    );
  }

  if (error) {
    return <div className="error-state">Failed to load skills. Please try again.</div>;
  }

  const allSkills = (skills ?? []) as Skill[];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Skills Lab</h1>
          <p style={{ color: "var(--color-gray-500)", marginTop: "var(--space-1)" }}>
            Targeted exercises to lift every band descriptor from 6.5 to 7.5+
          </p>
        </div>
      </div>

      {MODULES.map((mod) => (
        <SkillSection
          key={mod}
          module={mod}
          skills={allSkills}
          sectionRef={(el) => { if (el) refs.current[mod] = el; }}
          active={activeModule === mod}
        />
      ))}
    </div>
  );
}
