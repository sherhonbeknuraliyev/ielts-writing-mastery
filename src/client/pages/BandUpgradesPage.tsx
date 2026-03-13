import { useState } from "react";
import { ArrowUpCircle } from "lucide-react";
import { trpc } from "../utils/trpc.js";
import type { BandUpgrade } from "@shared/schemas/collocation.schema.js";

type Mode = "study" | "practice";

function UpgradeCard({ upgrade, practiceMode }: { upgrade: BandUpgrade; practiceMode: boolean }) {
  const [userText, setUserText] = useState("");
  const [revealed, setRevealed] = useState(false);

  const handleReveal = () => {
    if (!practiceMode || userText.trim()) setRevealed(true);
  };

  return (
    <div className="card" style={{ marginBottom: "var(--space-4)" }}>
      <div className="card-body">
        <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-4)" }}>
          <span className="badge badge-warning">Band 6</span>
          <span className="badge badge-success">Band 8</span>
          <span className="badge badge-gray" style={{ marginLeft: "auto" }}>{upgrade.category}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "var(--space-3)", alignItems: "center", marginBottom: "var(--space-3)" }}>
          <div style={{ background: "var(--warning-light)", borderRadius: "var(--radius)", padding: "var(--space-3)", borderLeft: "3px solid var(--warning)" }}>
            <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--warning)", marginBottom: "var(--space-1)", textTransform: "uppercase" }}>Band 6</div>
            <p style={{ lineHeight: 1.7, color: "var(--text-primary)", fontStyle: "italic" }}>{upgrade.band6}</p>
          </div>

          <div style={{ fontSize: "1.25rem", color: "var(--text-tertiary)", fontWeight: 700 }}>→</div>

          {practiceMode && !revealed ? (
            <div style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius)", padding: "var(--space-3)", borderLeft: "3px solid var(--border)" }}>
              <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--success)", marginBottom: "var(--space-1)", textTransform: "uppercase" }}>Band 8 — your attempt</div>
              <textarea
                className="recall-sentence-area"
                rows={3}
                placeholder="Write your Band 8 upgrade…"
                value={userText}
                onChange={(e) => setUserText(e.target.value)}
                style={{ minHeight: "4rem", fontSize: "0.875rem" }}
              />
              <button
                className="btn btn-primary btn-sm"
                style={{ marginTop: "var(--space-2)" }}
                onClick={handleReveal}
                disabled={!userText.trim()}
              >
                Reveal Answer
              </button>
            </div>
          ) : (
            <div style={{ background: "var(--success-light)", borderRadius: "var(--radius)", padding: "var(--space-3)", borderLeft: "3px solid var(--success)" }}>
              <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--success)", marginBottom: "var(--space-1)", textTransform: "uppercase" }}>Band 8</div>
              <p style={{ lineHeight: 1.7, color: "var(--text-primary)", fontStyle: "italic" }}>{upgrade.band8}</p>
            </div>
          )}
        </div>

        {(revealed || !practiceMode) && (
          <div style={{ background: "var(--accent-light)", borderRadius: "var(--radius-sm)", padding: "var(--space-3)", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            <strong style={{ color: "var(--accent)" }}>Why it works: </strong>
            {upgrade.explanation}
          </div>
        )}

        {practiceMode && revealed && userText.trim() && (
          <div style={{ marginTop: "var(--space-3)" }}>
            <div className="answer-comparison" style={{ marginBottom: 0 }}>
              <div className="answer-column user">
                <div className="answer-column-label">Your version</div>
                <div style={{ lineHeight: 1.6, fontSize: "0.875rem" }}>{userText}</div>
              </div>
              <div className="answer-column model">
                <div className="answer-column-label">Model Band 8</div>
                <div style={{ lineHeight: 1.6, fontSize: "0.875rem" }}>{upgrade.band8}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function BandUpgradesPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [mode, setMode] = useState<Mode>("study");

  const { data: upgrades, isLoading, error } = trpc.bandUpgrade.list.useQuery(
    activeCategory !== "all" ? { category: activeCategory } : undefined
  );

  const allUpgrades = (upgrades ?? []) as BandUpgrade[];
  const categories = ["all", ...Array.from(new Set(allUpgrades.map((u) => u.category)))];

  if (isLoading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        <span>Loading band upgrades…</span>
      </div>
    );
  }

  if (error) {
    return <div className="error-state">Failed to load upgrades. Please try again.</div>;
  }

  const filtered = activeCategory === "all" ? allUpgrades : allUpgrades.filter((u) => u.category === activeCategory);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Band Upgrades</h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "var(--space-1)" }}>
            Transform Band 6 language into Band 8 expressions
          </p>
        </div>
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <button
            className={`btn btn-sm ${mode === "study" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setMode("study")}
          >
            Study
          </button>
          <button
            className={`btn btn-sm ${mode === "practice" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setMode("practice")}
          >
            Practice
          </button>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: "var(--space-6)" }}>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`tab ${activeCategory === cat ? "active" : ""}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat === "all" ? "All Categories" : cat.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><ArrowUpCircle size={48} /></div>
          <h3>No upgrades loaded yet</h3>
          <p>Run the seed script to populate band upgrade data.</p>
        </div>
      ) : (
        <div>
          {mode === "practice" && (
            <div style={{ background: "var(--accent-light)", border: "1px solid var(--accent)", borderRadius: "var(--radius)", padding: "var(--space-3) var(--space-4)", marginBottom: "var(--space-4)", fontSize: "0.875rem", color: "var(--accent-hover)" }}>
              <strong>Practice mode:</strong> The Band 8 version is hidden. Try to write your own upgrade before revealing the model answer.
            </div>
          )}
          {filtered.map((upgrade) => (
            <UpgradeCard key={upgrade.id} upgrade={upgrade} practiceMode={mode === "practice"} />
          ))}
        </div>
      )}
    </div>
  );
}
