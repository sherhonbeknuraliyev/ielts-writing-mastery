import { useState } from "react";
import type { SkillExercise } from "@shared/schemas/skill.schema.js";

export interface ExerciseResult {
  exerciseId: string;
  correct: boolean;
  userAnswer: string;
}

interface Props {
  exercises: SkillExercise[];
  onComplete: (results: ExerciseResult[]) => void;
  topicBadge?: string;
}

type SubmitState =
  | { kind: "idle" }
  | { kind: "auto"; correct: boolean }
  | { kind: "self"; rated: boolean | null };

interface ExState {
  answer: string;
  builtWords: string[];
  submit: SubmitState;
}

const SUBJECTIVE = new Set(["rewrite", "transformation", "find-errors", "paraphrase", "formalize", "cohesion-repair", "idea-development"]);

function isCorrect(answer: string, ex: SkillExercise): boolean {
  const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
  const a = norm(answer);
  if (a === norm(ex.correctAnswer)) return true;
  return (ex.alternativeAnswers ?? []).some((alt: string) => a === norm(alt));
}

function SelfRatePanel({
  userAnswer,
  modelAnswer,
  explanation,
  rated,
  onRate,
}: {
  userAnswer: string;
  modelAnswer: string;
  explanation: string;
  rated: boolean | null;
  onRate: (v: boolean) => void;
}) {
  return (
    <div>
      <div className="answer-comparison">
        <div className="answer-column user">
          <div className="answer-column-label">Your answer</div>
          <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{userAnswer || <em>No answer</em>}</div>
        </div>
        <div className="answer-column model">
          <div className="answer-column-label">Model answer</div>
          <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{modelAnswer}</div>
        </div>
      </div>
      <div className="self-rate-panel">
        <button
          className={`self-rate-btn correct${rated === true ? " selected" : ""}`}
          onClick={() => onRate(true)}
        >
          I got it right
        </button>
        <button
          className={`self-rate-btn incorrect${rated === false ? " selected" : ""}`}
          onClick={() => onRate(false)}
        >
          I need to review
        </button>
      </div>
      {rated !== null && (
        <div
          className={`exercise-feedback ${rated ? "feedback-correct" : "feedback-incorrect"}`}
          style={{ marginTop: "var(--space-3)" }}
        >
          {explanation}
        </div>
      )}
    </div>
  );
}

export function ExerciseSection({ exercises, onComplete, topicBadge }: Props) {
  const [current, setCurrent] = useState(0);
  const [states, setStates] = useState<Record<string, ExState>>(() => {
    const init: Record<string, ExState> = {};
    for (const ex of exercises) {
      init[ex.id] = { answer: "", builtWords: [], submit: { kind: "idle" } };
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
    const answer = state.answer.trim();
    if (SUBJECTIVE.has(ex.type)) {
      setStates((s) => ({ ...s, [ex.id]: { ...s[ex.id]!, submit: { kind: "self", rated: null } } }));
    } else {
      const correct = isCorrect(answer, ex);
      setStates((s) => ({ ...s, [ex.id]: { ...s[ex.id]!, submit: { kind: "auto", correct } } }));
    }
  };

  const rate = (v: boolean) => {
    setStates((s) => ({ ...s, [ex.id]: { ...s[ex.id]!, submit: { kind: "self", rated: v } } }));
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

  if (done) {
    const total = exercises.length;
    const pct = Math.round((score / total) * 100);
    return (
      <div className="exercise-section">
        <div className="score-summary">
          <h3>Exercise Complete!</h3>
          <div className="score-big">{score}/{total}</div>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.9rem" }}>
            {pct}% — {getScoreMessage(score, total)}
          </p>
        </div>
        <div style={{ marginTop: "var(--space-6)" }}>
          <h3 style={{ marginBottom: "var(--space-3)" }}>Review</h3>
          {exercises.map((e, i) => {
            const r = results.find((x) => x.exerciseId === e.id);
            return (
              <div
                key={e.id}
                className={`exercise-card ${r?.correct ? "correct-card" : "incorrect-card"}`}
              >
                <div className="exercise-number">
                  {i + 1}. {formatType(e.type)} — {r?.correct ? "Correct" : "Incorrect"}
                </div>
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
  const autoIncorrect = state.submit.kind === "auto" && !state.submit.correct;

  return (
    <div className="exercise-section">
      <h2 style={{ marginBottom: "var(--space-4)" }}>Exercises</h2>

      <div style={{ marginBottom: "var(--space-5)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--color-gray-500)", marginBottom: "var(--space-2)" }}>
          <span>Exercise {current + 1} of {exercises.length}</span>
          <span>{score} correct so far</span>
        </div>
        <div style={{ height: 6, background: "var(--color-gray-200)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${(current / exercises.length) * 100}%`,
              background: "var(--color-primary)",
              borderRadius: "var(--radius-full)",
              transition: "width 0.3s",
            }}
          />
        </div>
      </div>

      <div className="exercise-card">
        {topicBadge && <div className="challenge-topic-badge">{topicBadge}</div>}
        <div className="exercise-number">Exercise {current + 1} — {formatType(ex.type)}</div>
        <div className="exercise-question">{ex.question}</div>

        {ex.type === "fill-blank" ? (
          <input
            type="text"
            className={`recall-input${autoCorrect ? " correct" : autoIncorrect ? " incorrect" : ""}`}
            placeholder="Fill in the blank…"
            value={state.answer}
            disabled={submitted}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !submitted) submit(); }}
          />
        ) : (
          <textarea
            className="recall-sentence-area"
            rows={ex.type === "find-errors" || ex.type === "error-correction" ? 5 : 3}
            placeholder={getPlaceholder(ex.type)}
            value={state.answer}
            disabled={submitted}
            onChange={(e) => setAnswer(e.target.value)}
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
          <div
            className={`exercise-feedback ${state.submit.correct ? "feedback-correct" : "feedback-incorrect"}`}
            style={{ marginTop: "var(--space-4)" }}
          >
            <strong>{state.submit.correct ? "Correct!" : "Incorrect."}</strong>
            {!state.submit.correct && (
              <span> Correct answer: <em>{ex.correctAnswer}</em></span>
            )}
            <div style={{ marginTop: "var(--space-1)" }}>{ex.explanation}</div>
          </div>
        )}

        {state.submit.kind === "self" && (
          <div style={{ marginTop: "var(--space-4)" }}>
            <SelfRatePanel
              userAnswer={state.answer}
              modelAnswer={ex.correctAnswer}
              explanation={ex.explanation}
              rated={state.submit.rated}
              onRate={rate}
            />
          </div>
        )}

        {canAdvance() && (
          <button
            className="btn btn-primary"
            style={{ marginTop: "var(--space-4)" }}
            onClick={advance}
          >
            {current + 1 < exercises.length ? "Next Exercise →" : "Finish"}
          </button>
        )}
      </div>
    </div>
  );
}

function getPlaceholder(type: string): string {
  switch (type) {
    case "error-correction": return "Write the corrected sentence…";
    case "rewrite": return "Rewrite the sentence here…";
    case "transform-upgrade": return "Write the upgraded version…";
    case "find-errors": return "Write the corrected paragraph…";
    case "paraphrase": return "Write your paraphrase…";
    case "formalize": return "Write the formal version…";
    case "cohesion-repair": return "Rewrite with improved cohesion…";
    case "idea-development": return "Develop the paragraph…";
    default: return "Your answer…";
  }
}

function formatType(type: string) {
  return type.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
}

function getScoreMessage(score: number, total: number) {
  const pct = score / total;
  if (pct === 1) return "Perfect score! Outstanding work.";
  if (pct >= 0.8) return "Excellent! Almost perfect.";
  if (pct >= 0.6) return "Good job. Review the incorrect ones.";
  return "Keep practising — review the skill and try again.";
}
