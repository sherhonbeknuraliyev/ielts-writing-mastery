import { useState, useMemo } from "react";
import { trpc } from "../utils/trpc.js";
import type { CollocationSet } from "@shared/schemas/collocation.schema.js";

const BAND_FILTER_OPTIONS = ["all", "6", "7", "8"] as const;
type BandFilter = (typeof BAND_FILTER_OPTIONS)[number];

const BAND_BADGE: Record<string, string> = {
  "6": "badge-info",
  "7": "badge-success",
  "8": "badge-primary",
};

const BAND_COLOR: Record<string, string> = {
  "6": "#4fa8b8",
  "7": "#3a9a6b",
  "8": "#7c3aed",
};

function CollocationCard({ entry }: { entry: { phrase: string; meaning: string; example: string; bandLevel: string } }) {
  const badgeClass = BAND_BADGE[entry.bandLevel] ?? "badge-gray";
  const color = BAND_COLOR[entry.bandLevel] ?? "#6b7280";

  return (
    <div className="collocation-card" style={{ borderLeft: `3px solid ${color}` }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--space-2)", marginBottom: "var(--space-2)" }}>
        <span style={{ fontWeight: 700, color: "var(--color-gray-900)", fontSize: "0.95rem" }}>{entry.phrase}</span>
        <span className={`badge ${badgeClass}`} style={{ flexShrink: 0 }}>Band {entry.bandLevel}</span>
      </div>
      <p style={{ fontSize: "0.8rem", color: "var(--color-gray-500)", marginBottom: "var(--space-1)" }}>{entry.meaning}</p>
      <p style={{ fontSize: "0.875rem", color: "var(--color-gray-600)", fontStyle: "italic", lineHeight: 1.6 }}>{entry.example}</p>
    </div>
  );
}

export function VocabularyPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [bandFilter, setBandFilter] = useState<BandFilter>("all");

  const { data: collocations, isLoading } = trpc.collocation.list.useQuery(
    activeCategory !== "all" ? { topic: activeCategory } : undefined
  );
  const { data: topics } = trpc.collocation.topics.useQuery();

  const allSets = (collocations ?? []) as CollocationSet[];

  const filtered = useMemo(() => {
    return allSets.map((set) => ({
      ...set,
      collocations: set.collocations.filter((entry) => {
        if (bandFilter !== "all" && entry.bandLevel !== bandFilter) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          return (
            entry.phrase.toLowerCase().includes(q) ||
            entry.meaning.toLowerCase().includes(q) ||
            entry.example.toLowerCase().includes(q)
          );
        }
        return true;
      }),
    })).filter((set) => set.collocations.length > 0);
  }, [allSets, search, bandFilter]);

  if (isLoading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        <span>Loading vocabulary…</span>
      </div>
    );
  }

  const totalEntries = filtered.reduce((n, s) => n + s.collocations.length, 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Vocabulary Builder</h1>
          <p style={{ color: "var(--color-gray-500)", marginTop: "var(--space-1)" }}>
            Essential IELTS collocations and phrases by topic
          </p>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: "var(--space-4)" }}>
        <button
          className={`tab ${activeCategory === "all" ? "active" : ""}`}
          onClick={() => setActiveCategory("all")}
        >
          All Topics
        </button>
        {(topics ?? []).map((topic: string) => (
          <button
            key={topic}
            className={`tab ${activeCategory === topic ? "active" : ""}`}
            onClick={() => setActiveCategory(topic)}
          >
            {topic.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: "var(--space-3)", marginBottom: "var(--space-6)", flexWrap: "wrap", alignItems: "center" }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search phrases, meanings, examples…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 360, flex: "1 1 220px" }}
        />
        <div className="filter-bar" style={{ marginBottom: 0 }}>
          {BAND_FILTER_OPTIONS.map((b) => (
            <button
              key={b}
              className={`filter-chip ${bandFilter === b ? "active" : ""}`}
              onClick={() => setBandFilter(b)}
            >
              {b === "all" ? "All Bands" : `Band ${b}`}
            </button>
          ))}
        </div>
        {(search || bandFilter !== "all") && (
          <span className="text-sm text-muted">{totalEntries} result{totalEntries !== 1 ? "s" : ""}</span>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <h3>{collocations?.length === 0 ? "No vocabulary loaded yet" : "No results"}</h3>
          <p>{collocations?.length === 0 ? "Run the seed script to populate collocation data." : "Try adjusting your search or filters."}</p>
        </div>
      ) : (
        <div>
          {filtered.map((set) => (
            <div key={set.topic} className="card" style={{ marginBottom: "var(--space-6)" }}>
              <div className="card-header">
                <div>
                  <h3 style={{ fontWeight: 700 }}>{set.topic.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</h3>
                  <p className="text-sm text-muted">{set.description}</p>
                </div>
                <span className="badge badge-gray">{set.collocations.length} phrases</span>
              </div>
              <div className="card-body">
                <div className="collocation-grid">
                  {set.collocations.map((entry, i) => (
                    <CollocationCard key={i} entry={entry} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
