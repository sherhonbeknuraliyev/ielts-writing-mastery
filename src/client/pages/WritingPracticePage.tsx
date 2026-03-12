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

  // Ctrl+S / Cmd+S to save
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
    if (!essay.trim()) {
      toast("Write something first.", "info");
      return;
    }
    if (wordCount < 50) {
      toast("Write at least 50 words before requesting feedback.", "info");
      return;
    }
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

  if (isLoading && promptId) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        <span>Loading prompt…</span>
      </div>
    );
  }

  // ── Focus mode: 3-panel layout filling full viewport ──────────────────
  if (focusMode) {
    return (
      <div className="focus-writing-container">
        {/* Left panel: prompt + plan */}
        <div className="focus-panel focus-panel-left">
          {prompt ? (
            <div className="focus-section">
              <div
                className="focus-section-header"
                onClick={() => setPromptCollapsed((c) => !c)}
              >
                <span>📋 Prompt</span>
                <span>{promptCollapsed ? "▼" : "▲"}</span>
              </div>
              {!promptCollapsed && (
                <div className="focus-section-body">
                  <p style={{ fontSize: "0.85rem", lineHeight: 1.7, margin: 0 }}>{prompt.prompt}</p>
                  {prompt.chartData && (
                    <div style={{ marginTop: "var(--space-2)" }}>
                      <TaskChart chartData={prompt.chartData} />
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : isFree ? (
            <div className="focus-section">
              <div className="focus-section-header">
                <span>✏️ Topic</span>
              </div>
              <div className="focus-section-body">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Your essay topic…"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  style={{ fontSize: "0.85rem" }}
                />
              </div>
            </div>
          ) : null}

          {/* Essay Plan notepad */}
          <div className="focus-section focus-section-grow">
            <div className="focus-section-header">
              <span>📝 Essay Plan</span>
            </div>
            <div className="focus-section-body focus-section-body-grow">
              <textarea
                className="focus-plan-textarea"
                placeholder="Jot down your ideas, structure, key vocabulary…"
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Center: textarea + toolbar */}
        <div className="focus-center">
          <textarea
            className="writing-textarea focus-main-textarea"
            placeholder="Begin writing your essay…"
            value={essay}
            onChange={(e) => handleTextChange(e.target.value)}
            spellCheck
            autoFocus
          />
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
        </div>

        {/* Right panel: structure + checklist + tips */}
        <div className="focus-panel focus-panel-right">
          {prompt?.sampleStructure && prompt.sampleStructure.length > 0 && (
            <div className="focus-section">
              <div className="focus-section-header">
                <span>📐 Structure</span>
              </div>
              <div className="focus-section-body">
                {prompt.sampleStructure.map((s, i) => (
                  <div key={i} style={{ marginBottom: "0.5rem" }}>
                    <div style={{ fontSize: "0.8rem", fontWeight: 600 }}>{s.paragraph}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{s.purpose}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {prompt && prompt.evaluationChecklist.length > 0 && (
            <div className="focus-section">
              <div className="focus-section-header">
                <span>✅ Self-Check</span>
              </div>
              <div className="focus-section-body">
                {prompt.evaluationChecklist.map((item, i) => (
                  <label
                    key={i}
                    style={{ display: "flex", gap: "0.4rem", marginBottom: "0.4rem", fontSize: "0.8rem", cursor: "pointer" }}
                  >
                    <input
                      type="checkbox"
                      checked={checklistState[i] ?? false}
                      onChange={() => toggleChecklist(i)}
                    />
                    <span
                      style={{
                        textDecoration: checklistState[i] ? "line-through" : "none",
                        color: checklistState[i] ? "var(--text-tertiary)" : "var(--text-primary)",
                      }}
                    >
                      {item}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="focus-section">
            <div className="focus-section-header">
              <span>💡 Tips</span>
            </div>
            <div className="focus-section-body">
              <ul style={{ paddingLeft: "1rem", margin: 0, fontSize: "0.8rem", lineHeight: 1.6 }}>
                {(prompt?.tips ?? [
                  "Plan your essay for 5 minutes before writing.",
                  "Use clear topic sentences for each paragraph.",
                  "Aim for 4–5 paragraphs.",
                  "Vary your sentence structure.",
                  "Leave 5 minutes to proofread.",
                ]).map((t, i) => (
                  <li key={i} style={{ marginBottom: "0.3rem" }}>{t}</li>
                ))}
              </ul>
            </div>
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

  // ── Normal mode ────────────────────────────────────────────────────────
  return (
    <div className="writing-workspace">
      {/* Prompt, chart, checklist — hidden in focus mode */}
      {!focusMode && (
        <>
          {/* Chart for Task 1 */}
          {prompt?.chartData && (
            <div className="prompt-box">
              <div className="prompt-box-header" onClick={() => setChartCollapsed((c) => !c)}>
                <h3>📊 Study the chart</h3>
                <span>{chartCollapsed ? "▼ Show chart" : "▲ Hide chart"}</span>
              </div>
              {!chartCollapsed && (
                <div className="prompt-text">
                  <TaskChart chartData={prompt.chartData} />
                </div>
              )}
            </div>
          )}

          {/* Prompt / topic area */}
          {isFree ? (
            <div className="prompt-box">
              <div className="prompt-box-header" onClick={() => setPromptCollapsed((c) => !c)}>
                <h3>✏️ Free Practice</h3>
                <span>{promptCollapsed ? "▼ Show" : "▲ Hide"}</span>
              </div>
              {!promptCollapsed && (
                <div className="prompt-text">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Optional: Enter your essay topic or question…"
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                  />
                </div>
              )}
            </div>
          ) : prompt ? (
            <div className="prompt-box">
              <div className="prompt-box-header" onClick={() => setPromptCollapsed((c) => !c)}>
                <h3>
                  📋 Task Prompt
                  <span className="badge badge-gray" style={{ marginLeft: 8 }}>{prompt.difficulty}</span>
                  <span className="badge badge-info" style={{ marginLeft: 4 }}>{prompt.category}</span>
                </h3>
                <span>{promptCollapsed ? "▼ Expand" : "▲ Collapse"}</span>
              </div>
              {!promptCollapsed && <div className="prompt-text">{prompt.prompt}</div>}
            </div>
          ) : null}
        </>
      )}

      {/* Writing layout */}
      <div className="writing-layout" style={{ flex: 1, minHeight: 0 }}>
        <div className="writing-main">
          {!focusMode && (
            <div className="writing-main-toolbar">
              <button
                className="btn btn-ghost btn-sm focus-mode-btn"
                onClick={enterFocus}
                title="Enter focus mode (hides sidebar)"
              >
                ⛶ Focus Mode
              </button>
            </div>
          )}
          <textarea
            className="writing-textarea"
            placeholder={focusMode ? "Just write…" : "Begin writing your essay here…\n\nRemember to plan your structure before you start."}
            value={essay}
            onChange={(e) => handleTextChange(e.target.value)}
            spellCheck
            autoFocus={focusMode}
          />
        </div>

        {/* Guide sidebar — hidden in focus mode */}
        {!focusMode && (
          <>
            {/* Evaluation checklist */}
            {prompt && prompt.evaluationChecklist.length > 0 && (
              <div className="eval-checklist">
                <div className="eval-checklist-title">Self-Check</div>
                {prompt.evaluationChecklist.map((item, i) => (
                  <label key={i} className="eval-check-item">
                    <input
                      type="checkbox"
                      checked={checklistState[i] ?? false}
                      onChange={() => toggleChecklist(i)}
                    />
                    <span className={checklistState[i] ? "checked-item" : ""}>{item}</span>
                  </label>
                ))}
              </div>
            )}
            {prompt ? (
              <GuidePanel prompt={prompt} />
            ) : (
              <div className="sidebar-panel">
                <div className="sidebar-panel-header">
                  <h4>💡 General Tips</h4>
                </div>
                <div className="sidebar-panel-body">
                  <ul className="tips-list">
                    <li>Plan your essay for 5 minutes before writing.</li>
                    <li>Use clear topic sentences for each paragraph.</li>
                    <li>Aim for 4–5 paragraphs: intro, 2–3 body, conclusion.</li>
                    <li>Vary your sentence structure and vocabulary.</li>
                    <li>Leave 5 minutes to proofread at the end.</li>
                  </ul>
                </div>
              </div>
            )}
          </>
        )}
      </div>

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
