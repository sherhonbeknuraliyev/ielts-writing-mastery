import { useState, useCallback, useRef, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { trpc } from "../utils/trpc.js";
import { WritingToolbar } from "../components/WritingToolbar.js";
import { GuidePanel } from "../components/GuidePanel.js";
import { TaskChart } from "../components/TaskChart.js";
import { AiFeedbackPanel } from "../components/AiFeedbackPanel.js";
import { ModelAnswerViewer } from "../components/ModelAnswerViewer.js";
import { useFocusModeContext } from "../components/Layout.js";
import { useToast } from "../utils/toast.js";
import type { ReactNode } from "react";

function FocusCollapsible({
  label,
  defaultOpen = false,
  grow = false,
  children,
}: {
  label: string;
  defaultOpen?: boolean;
  grow?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={grow ? "focus-collapse focus-collapse-grow" : "focus-collapse"}>
      <div className="focus-collapse-header" onClick={() => setOpen((o) => !o)}>
        <span>{label}</span>
        <span style={{ fontSize: "0.7rem" }}>{open ? "▲" : "▼"}</span>
      </div>
      {open && <div className="focus-collapse-body">{children}</div>}
    </div>
  );
}

function countWords(text: string) {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}
function countParagraphs(text: string) {
  return text.trim() === "" ? 0 : text.trim().split(/\n\s*\n/).length;
}

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

function WhatsNextWriting({ onTryAnother, onScrollModel }: { onTryAnother: () => void; onScrollModel: () => void }) {
  return (
    <div className="whats-next-panel">
      <h3 className="whats-next-title">What's Next?</h3>
      <div className="whats-next-options">
        <button className="whats-next-btn" onClick={onTryAnother}>
          📝 Try another prompt
        </button>
        <button className="whats-next-btn" onClick={onScrollModel}>
          📖 Review model answer
        </button>
        <Link to="/vocabulary" className="whats-next-btn">
          📚 Practice vocabulary
        </Link>
      </div>
    </div>
  );
}

const DEFAULT_TIPS = [
  "Plan for 5 minutes before writing.",
  "Clear topic sentences per paragraph.",
  "4–5 paragraphs: intro, 2–3 body, conclusion.",
  "Vary sentence structure and vocabulary.",
  "Proofread in the last 5 minutes.",
];

export function WritingPracticePage() {
  const { promptId } = useParams<{ promptId: string }>();
  const navigate = useNavigate();
  const isFree = !promptId;

  const [essay, setEssay] = useState("");
  const [plan, setPlan] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [promptCollapsed, setPromptCollapsed] = useState(false);
  const [chartCollapsed, setChartCollapsed] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [aiFeedback, setAiFeedback] = useState<AiFeedback | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showModel, setShowModel] = useState(false);
  const [checklistState, setChecklistState] = useState<Record<number, boolean>>({});
  const [showWhatsNext, setShowWhatsNext] = useState(false);
  const startTimeRef = useRef<number>(0);
  const modelRef = useRef<HTMLDivElement>(null);

  const { focusMode, enter: enterFocus } = useFocusModeContext();
  const { toast } = useToast();

  const { data: prompt, isLoading } = trpc.prompt.getById.useQuery(
    { id: promptId! },
    { enabled: !!promptId }
  );

  const createMutation = trpc.writing.create.useMutation({
    onSuccess: (data) => {
      setSavedId(String((data as { _id?: unknown })._id ?? ""));
      toast("Draft saved!");
    },
    onError: (err) => toast("Save failed: " + err.message, "error"),
  });

  const updateMutation = trpc.writing.update.useMutation({
    onError: (err) => toast("Update failed: " + err.message, "error"),
  });

  const evaluateMutation = trpc.ai.evaluateEssay.useMutation({
    onSuccess: (data) => {
      const feedback = data as AiFeedback;
      setAiFeedback(feedback);
      setShowFeedback(true);
      setShowWhatsNext(true);
      if (savedId) {
        updateMutation.mutate({ id: savedId, content: essay, wordCount: countWords(essay), timeSpent: elapsed() });
      }
    },
    onError: (err) => toast("AI feedback failed: " + err.message, "error"),
  });

  const elapsed = () =>
    startTimeRef.current > 0 ? Math.round((Date.now() - startTimeRef.current) / 1000) : 0;

  const wordCount = countWords(essay);
  const charCount = essay.length;
  const paraCount = countParagraphs(essay);
  const minWords = prompt?.wordLimit.min ?? (isFree ? 0 : 250);
  const maxWords = prompt?.wordLimit.max ?? (isFree ? 9999 : 300);
  const timeLimit = prompt?.timeLimit ?? 40;

  const handleTextChange = (value: string) => {
    if (!hasStarted && value.length > 0) {
      setHasStarted(true);
      startTimeRef.current = Date.now();
    }
    setEssay(value);
  };

  const handleSave = useCallback(() => {
    if (!essay.trim()) {
      toast("Nothing to save yet.", "info");
      return;
    }
    const type = isFree ? "free-practice" : (prompt?.type ?? "task2");
    const elapsedSecs = elapsed();
    if (savedId) {
      updateMutation.mutate({ id: savedId, content: essay, wordCount, timeSpent: elapsedSecs });
      toast("Draft updated!");
    } else {
      createMutation.mutate({
        promptId: promptId ?? undefined,
        type: type as "task1-academic" | "task1-general" | "task2" | "free-practice",
        promptText: isFree ? customTopic || undefined : prompt?.prompt,
        content: essay,
        wordCount,
        timeSpent: elapsedSecs,
      });
    }
  }, [essay, isFree, prompt, savedId, promptId, customTopic, wordCount, toast, updateMutation, createMutation]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSave]);

  const handleFeedback = () => {
    if (!essay.trim()) { toast("Write something first.", "info"); return; }
    if (wordCount < 50) { toast("Write at least 50 words before requesting feedback.", "info"); return; }
    const taskType = isFree ? "task2" : (prompt?.type ?? "task2");
    const promptText = isFree ? (customTopic || "Free practice — no specific prompt") : (prompt?.prompt ?? "");
    evaluateMutation.mutate({ taskType, prompt: promptText, essay });
  };

  const toggleChecklist = (i: number) => {
    setChecklistState((s) => ({ ...s, [i]: !s[i] }));
  };

  const handleScrollModel = () => {
    setShowModel(true);
    setTimeout(() => modelRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const toolbar = (
    <WritingToolbar
      wordCount={wordCount}
      charCount={charCount}
      paraCount={paraCount}
      minWords={minWords}
      maxWords={maxWords}
      timeLimit={timeLimit}
      hasStarted={hasStarted}
      hasSaved={!!savedId}
      onSave={handleSave}
      onFeedback={handleFeedback}
      onViewModel={() => setShowModel(true)}
      isSaving={createMutation.isPending || updateMutation.isPending}
      isEvaluating={evaluateMutation.isPending}
    />
  );

  if (isLoading && promptId) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        <span>Loading prompt…</span>
      </div>
    );
  }

  // ── Focus mode ──────────────────────────────────────────────────────────
  if (focusMode) {
    return (
      <div className="focus-writing">
        {/* Chart bar — full width, only for Task 1 */}
        {prompt?.chartData && (
          <div className="focus-chart-bar">
            <FocusCollapsible label="📊 Chart" defaultOpen>
              <TaskChart chartData={prompt.chartData} />
            </FocusCollapsible>
          </div>
        )}

        <div className="focus-columns">
          {/* Left: prompt + plan */}
          <div className="focus-col-left">
            {prompt ? (
              <FocusCollapsible label="📋 Prompt" defaultOpen>
                <p style={{ fontSize: "0.82rem", lineHeight: 1.7, margin: 0 }}>{prompt.prompt}</p>
              </FocusCollapsible>
            ) : isFree ? (
              <FocusCollapsible label="✏️ Topic" defaultOpen>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Your essay topic…"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  style={{ fontSize: "0.82rem" }}
                />
              </FocusCollapsible>
            ) : null}

            <div className="focus-plan-area">
              <div className="focus-collapse-header" style={{ cursor: "default" }}>
                <span>📝 Essay Plan</span>
              </div>
              <textarea
                placeholder="Ideas, structure, key words…"
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
              />
            </div>
          </div>

          {/* Center: textarea + toolbar */}
          <div className="focus-col-center">
            <textarea
              className="writing-textarea"
              placeholder="Begin writing your essay…"
              value={essay}
              onChange={(e) => handleTextChange(e.target.value)}
              spellCheck
              autoFocus
            />
            {toolbar}
          </div>

          {/* Right: structure + checklist + tips */}
          <div className="focus-col-right">
            {prompt?.sampleStructure && prompt.sampleStructure.length > 0 && (
              <FocusCollapsible label="📐 Structure" defaultOpen>
                {prompt.sampleStructure.map((s, i) => (
                  <div key={i} style={{ marginBottom: "0.4rem" }}>
                    <div style={{ fontSize: "0.78rem", fontWeight: 600 }}>{s.paragraph}</div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>{s.purpose}</div>
                  </div>
                ))}
              </FocusCollapsible>
            )}

            {prompt && prompt.evaluationChecklist.length > 0 && (
              <FocusCollapsible label={`✅ Checklist (${prompt.evaluationChecklist.length})`}>
                {prompt.evaluationChecklist.map((item, i) => (
                  <label key={i} className="focus-check-item">
                    <input
                      type="checkbox"
                      checked={checklistState[i] ?? false}
                      onChange={() => toggleChecklist(i)}
                    />
                    <span style={{
                      textDecoration: checklistState[i] ? "line-through" : "none",
                      color: checklistState[i] ? "var(--text-tertiary)" : "var(--text-primary)",
                    }}>{item}</span>
                  </label>
                ))}
              </FocusCollapsible>
            )}

            <FocusCollapsible label="💡 Tips">
              <ul style={{ paddingLeft: "0.9rem", margin: 0 }}>
                {(prompt?.tips ?? DEFAULT_TIPS).map((t, i) => (
                  <li key={i} style={{ marginBottom: "0.25rem" }}>{t}</li>
                ))}
              </ul>
            </FocusCollapsible>
          </div>
        </div>

        {showFeedback && aiFeedback && (
          <AiFeedbackPanel feedback={aiFeedback} onClose={() => setShowFeedback(false)} />
        )}
        {showModel && prompt && (
          <ModelAnswerViewer
            band7={prompt.modelAnswers.band7}
            band8={prompt.modelAnswers.band8}
            annotations={prompt.annotations}
            keyVocabulary={prompt.keyVocabulary}
            onClose={() => setShowModel(false)}
          />
        )}
      </div>
    );
  }

  // ── Normal mode ─────────────────────────────────────────────────────────
  return (
    <div className="writing-page">
      {/* Prompt bar — full width, collapsible, Focus Mode button in header */}
      {prompt?.chartData && (
        <div className="writing-prompt-bar" style={{ flexDirection: "column", gap: "var(--space-2)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
            <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>📊 Study the chart</span>
            <div className="writing-prompt-bar prompt-meta" style={{ gap: "var(--space-3)" }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setChartCollapsed((c) => !c)}
              >
                {chartCollapsed ? "▼ Show" : "▲ Hide"}
              </button>
              <button className="btn btn-ghost btn-sm" onClick={enterFocus}>⛶ Focus Mode</button>
            </div>
          </div>
          {!chartCollapsed && <TaskChart chartData={prompt.chartData} />}
        </div>
      )}

      {isFree ? (
        <div className="writing-prompt-bar">
          <div style={{ flex: 1 }}>
            {!promptCollapsed && (
              <input
                type="text"
                className="form-input"
                placeholder="Optional: Enter your essay topic or question…"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
              />
            )}
            {promptCollapsed && <span style={{ color: "var(--text-tertiary)", fontSize: "0.9rem" }}>Free Practice</span>}
          </div>
          <div className="prompt-meta">
            <button className="btn btn-ghost btn-sm" onClick={() => setPromptCollapsed((c) => !c)}>
              {promptCollapsed ? "▼ Show" : "▲ Hide"}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={enterFocus}>⛶ Focus Mode</button>
          </div>
        </div>
      ) : prompt && !prompt.chartData ? (
        <div className="writing-prompt-bar">
          <div className="prompt-text">
            {!promptCollapsed ? (
              <>
                <div style={{ marginBottom: "var(--space-1)", display: "flex", gap: "var(--space-2)" }}>
                  <span className="badge badge-gray">{prompt.difficulty}</span>
                  <span className="badge badge-info">{prompt.category}</span>
                </div>
                {prompt.prompt}
              </>
            ) : (
              <span style={{ color: "var(--text-tertiary)", fontSize: "0.9rem" }}>📋 Task Prompt (collapsed)</span>
            )}
          </div>
          <div className="prompt-meta">
            <button className="btn btn-ghost btn-sm" onClick={() => setPromptCollapsed((c) => !c)}>
              {promptCollapsed ? "▼ Expand" : "▲ Collapse"}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={enterFocus}>⛶ Focus Mode</button>
          </div>
        </div>
      ) : null}

      {/* Writing body: textarea + guide sidebar */}
      <div className="writing-body">
        <div className="writing-body-main">
          <textarea
            className="writing-textarea"
            placeholder="Begin writing your essay here…&#10;&#10;Remember to plan your structure before you start."
            value={essay}
            onChange={(e) => handleTextChange(e.target.value)}
            spellCheck
          />
          {toolbar}
        </div>

        <div className="writing-guide">
          {prompt ? (
            <GuidePanel
              prompt={prompt}
              checklistState={checklistState}
              onToggleChecklist={toggleChecklist}
            />
          ) : (
            <div className="guide-section">
              <div className="guide-section-header">💡 General Tips</div>
              <div className="guide-section-body">
                <ul className="tips-list">
                  {DEFAULT_TIPS.map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {showWhatsNext && aiFeedback && (
        <WhatsNextWriting
          onTryAnother={() => navigate(isFree ? "/writing/free" : "/writing/task2")}
          onScrollModel={handleScrollModel}
        />
      )}

      {showFeedback && aiFeedback && (
        <AiFeedbackPanel feedback={aiFeedback} onClose={() => setShowFeedback(false)} />
      )}

      <div ref={modelRef}>
        {showModel && prompt && (
          <ModelAnswerViewer
            band7={prompt.modelAnswers.band7}
            band8={prompt.modelAnswers.band8}
            annotations={prompt.annotations}
            keyVocabulary={prompt.keyVocabulary}
            onClose={() => setShowModel(false)}
          />
        )}
      </div>
    </div>
  );
}
