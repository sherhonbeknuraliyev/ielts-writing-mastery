import { useState, useEffect } from "react";
import { trpc } from "../utils/trpc.js";
import type { SkillExercise } from "@shared/schemas/skill.schema.js";

export interface ExerciseResult {
  exerciseId: string;
  correct: boolean;
  userAnswer: string;
}

interface Props {
  exercises: SkillExercise[];
  onComplete: (results: ExerciseResult[]) => void;
}

type SubmitState =
  | { kind: "idle" }
  | { kind: "auto"; correct: boolean }
  | { kind: "self"; rated: boolean | null; aiResult?: AiResult | null; aiLoading?: boolean };

interface AiResult {
  isCorrect: boolean;
  score: number;
  feedback: string;
  improvedVersion?: string;
}

const SUBJECTIVE = new Set([
  "rewrite", "transform-upgrade", "sentence-combining", "find-errors",
  "paraphrase", "formalize", "cohesion-repair", "idea-development",
]);

function isAutoCorrect(answer: string, ex: SkillExercise): boolean {
  const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
  const a = norm(answer);
  if (a === norm(ex.correctAnswer)) return true;
  return (ex.alternativeAnswers ?? []).some((alt: string) => a === norm(alt));
}

interface ExState {
  answer: string;
  submit: SubmitState;
}

function getPlaceholder(type: string): string {
  const map: Record<string, string> = {
    "error-correction": "Write the corrected sentence…",
    "rewrite": "Rewrite the sentence here…",
    "transform-upgrade": "Write the upgraded version…",
    "find-errors": "Write the corrected paragraph…",
    "paraphrase": "Write your paraphrase…",
    "formalize": "Write the formal academic version…",
    "cohesion-repair": "Rewrite with improved cohesion…",
    "idea-development": "Develop the paragraph here…",
    "sentence-combining": "Write the combined sentence…",
  };
  return map[type] ?? "Your answer…";
}

function formatType(type: string) {
  return type.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
}

function getScoreMsg(score: number, total: number) {
  const p = score / total;
  if (p === 1) return "Perfect score!";
  if (p >= 0.8) return "Excellent work.";
  if (p >= 0.6) return "Good — review the incorrect ones.";
  return "Keep practising and try again.";
}

function AiValidateButton({
  ex,
  userAnswer,
  onResult,
  loading,
}: {
  ex: SkillExercise;
  userAnswer: string;
  onResult: (r: AiResult) => void;
  loading: boolean;
}) {
  const validate = trpc.ai.validateExercise.useMutation({
    onSuccess: (data) => onResult(data as AiResult),
  });

  return (
    <button
      className="btn btn-secondary btn-sm"
      onClick={() =>
        validate.mutate({
          exerciseType: ex.type,
          question: ex.question,
          modelAnswer: ex.correctAnswer,
          userAnswer,
        })
      }
      disabled={loading || validate.isPending}
    >
      {validate.isPending ? "Checking with AI…" : "Get AI Validation"}
    </button>
  );
}

export function ExerciseRunner({ exercises, onComplete }: Props) {
  const [current, setCurrent] = useState(0);
  const [states, setStates] = useState<Record<string, ExState>>(() => {
    const init: Record<string, ExState> = {};
    for (const ex of exercises) {
      init[ex.id] = { answer: "", submit: { kind: "idle" } };
    }
    return init;
  });
  const [results, setResults] = useState<ExerciseResult[]>([]);
  const [done, setDone] = useState(false);

  const ex = exercises[current];
  if (!ex) return null;
  const state = states[ex.id]!;

  const setAnswer = (v: string) =>
    setStates((s) => ({ ...s, [ex.id]: { ...s[ex.id]!, answer: v } }));

  const submit = () => {
    if (state.submit.kind !== "idle") return;
    if (SUBJECTIVE.has(ex.type)) {
      setStates((s) => ({ ...s, [ex.id]: { ...s[ex.id]!, submit: { kind: "self", rated: null } } }));
    } else {
      const correct = isAutoCorrect(state.answer, ex);
      setStates((s) => ({ ...s, [ex.id]: { ...s[ex.id]!, submit: { kind: "auto", correct } } }));
    }
  };

  const rate = (v: boolean) => {
    setStates((s) => {
      const prev = s[ex.id]!.submit;
      if (prev.kind !== "self") return s;
      return { ...s, [ex.id]: { ...s[ex.id]!, submit: { ...prev, rated: v } } };
    });
  };

  const setAiResult = (r: AiResult) => {
    setStates((s) => {
      const prev = s[ex.id]!.submit;
      if (prev.kind !== "self") return s;
      // Preserve the user's self-rating; only set rated from AI if user hasn't rated yet
      const rated = prev.rated !== null ? prev.rated : r.isCorrect;
      return { ...s, [ex.id]: { ...s[ex.id]!, submit: { ...prev, aiResult: r, rated } } };
    });
  };

  const canAdvance = () => {
    const st = state.submit;
    if (st.kind === "idle") return false;
    if (st.kind === "auto") return true;
    return st.rated !== null;
  };

  const advance = () => {
    const st = state.submit;
    const correct =
      st.kind === "auto" ? st.correct : st.kind === "self" ? (st.rated ?? false) : false;
    const newResult: ExerciseResult = { exerciseId: ex.id, correct, userAnswer: state.answer };
    const newResults = [...results, newResult];
    if (current + 1 >= exercises.length) {
      setResults(newResults);
      setDone(true);
      onComplete(newResults);
    } else {
      setResults(newResults);
      setCurrent((c) => c + 1);
    }
  };

  const score = results.filter((r) => r.correct).length;

  // Keyboard shortcuts: Enter/Space to advance when feedback is shown
  useEffect(() => {
    if (!canAdvance()) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        const tag = (e.target as HTMLElement).tagName;
        if (tag === "TEXTAREA" || tag === "INPUT" || tag === "BUTTON") return;
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  if (done) {
    const total = exercises.length;
    const pct = Math.round((score / total) * 100);
    return (
      <div className="exercise-section">
        <div className="score-summary">
          <h3>Exercises Complete!</h3>
          <div className="score-big">{score}/{total}</div>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.9rem" }}>
            {pct}% — {getScoreMsg(score, total)}
          </p>
        </div>
        <div style={{ marginTop: "var(--space-6)" }}>
          <h3 style={{ marginBottom: "var(--space-3)" }}>Review</h3>
          {exercises.map((e, i) => {
            const r = results.find((x) => x.exerciseId === e.id);
            return (
              <div key={e.id} className={`exercise-card ${r?.correct ? "correct-card" : "incorrect-card"}`}>
                <div className="exercise-number">{i + 1}. {formatType(e.type)} — {r?.correct ? "Correct" : "Incorrect"}</div>
                <div className="exercise-question">{e.question}</div>
                {!r?.correct && (
                  <div className="exercise-feedback feedback-incorrect">
                    <strong>Model answer:</strong> {e.correctAnswer}
                    <div style={{ marginTop: "var(--space-1)" }}>{e.explanation}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const submitted = state.submit.kind !== "idle";
  const autoCorrect = state.submit.kind === "auto" && state.submit.correct;
  const autoWrong = state.submit.kind === "auto" && !state.submit.correct;
  const selfState = state.submit.kind === "self" ? state.submit : null;

  return (
    <div className="exercise-section">
      <div style={{ marginBottom: "var(--space-5)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-tertiary)", marginBottom: "var(--space-2)" }}>
          <span>Exercise {current + 1} of {exercises.length}</span>
          <span>{score} correct so far</span>
        </div>
        <div style={{ height: 6, background: "var(--border-light)", borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(current / exercises.length) * 100}%`, background: "var(--accent)", borderRadius: "var(--radius-xl)", transition: "width 0.3s" }} />
        </div>
      </div>

      <div className="exercise-card">
        <div className="exercise-number">{formatType(ex.type)}</div>
        {ex.context && (
          <div className="exercise-context">{ex.context}</div>
        )}
        <div className="exercise-question">{ex.question}</div>

        {ex.type === "fill-blank" ? (
          <input
            type="text"
            className={`recall-input${autoCorrect ? " correct" : autoWrong ? " incorrect" : ""}`}
            placeholder="Fill in the blank…"
            value={state.answer}
            disabled={submitted}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !submitted) submit(); }}
          />
        ) : (
          <textarea
            className="recall-sentence-area"
            rows={4}
            placeholder={getPlaceholder(ex.type)}
            value={state.answer}
            disabled={submitted}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && !submitted) {
                e.preventDefault();
                submit();
              }
            }}
          />
        )}

        {!submitted && (
          <button
            className="btn btn-primary"
            style={{ marginTop: "var(--space-4)" }}
            disabled={!state.answer.trim()}
            onClick={submit}
          >
            Check Answer
          </button>
        )}

        {state.submit.kind === "auto" && (
          <div className={`exercise-feedback ${state.submit.correct ? "feedback-correct" : "feedback-incorrect"}`} style={{ marginTop: "var(--space-4)" }}>
            <strong>{state.submit.correct ? "Correct!" : "Incorrect."}</strong>
            {!state.submit.correct && (
              <span> Correct answer: <em>{ex.correctAnswer}</em></span>
            )}
            <div style={{ marginTop: "var(--space-1)" }}>{ex.explanation}</div>
          </div>
        )}

        {selfState && (
          <div style={{ marginTop: "var(--space-4)" }}>
            <div className="answer-comparison">
              <div className="answer-column user">
                <div className="answer-column-label">Your answer</div>
                <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{state.answer || <em>No answer</em>}</div>
              </div>
              <div className="answer-column model">
                <div className="answer-column-label">Model answer</div>
                <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{ex.correctAnswer}</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-3)", flexWrap: "wrap" }}>
              {!selfState.aiResult && (
                <AiValidateButton ex={ex} userAnswer={state.answer} onResult={setAiResult} loading={false} />
              )}
              <div className="self-rate-panel" style={{ display: "flex", gap: "var(--space-2)", flex: 1 }}>
                <button
                  className={`self-rate-btn correct${selfState.rated === true ? " selected" : ""}`}
                  onClick={() => rate(true)}
                >
                  I got it right
                </button>
                <button
                  className={`self-rate-btn incorrect${selfState.rated === false ? " selected" : ""}`}
                  onClick={() => rate(false)}
                >
                  Needs review
                </button>
              </div>
            </div>

            {selfState.rated !== null && (
              <div className={`exercise-feedback ${selfState.rated ? "feedback-correct" : "feedback-incorrect"}`} style={{ marginTop: "var(--space-3)" }}>
                <strong>Your assessment:</strong> {selfState.rated ? "Got it right" : "Needs review"}
                <div style={{ marginTop: "var(--space-1)" }}>{ex.explanation}</div>
              </div>
            )}

            {selfState.aiResult && (
              <div className={`exercise-feedback ${selfState.aiResult.isCorrect ? "feedback-correct" : "feedback-incorrect"}`} style={{ marginTop: "var(--space-3)" }}>
                <strong>AI Score: {selfState.aiResult.score}/10</strong>
                <div style={{ marginTop: "var(--space-1)" }}>{selfState.aiResult.feedback}</div>
                {selfState.aiResult.improvedVersion && (
                  <div style={{ marginTop: "var(--space-2)" }}>
                    <strong>Improved:</strong> {selfState.aiResult.improvedVersion}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {canAdvance() && (
          <button className="btn btn-primary" style={{ marginTop: "var(--space-4)" }} onClick={advance}>
            {current + 1 < exercises.length ? "Next Exercise →" : "Finish"}
          </button>
        )}
      </div>
    </div>
  );
}
