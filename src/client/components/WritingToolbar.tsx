import { useTimer } from "../hooks/useTimer.js";
import { useEffect } from "react";

interface Props {
  wordCount: number;
  charCount: number;
  paraCount: number;
  minWords: number;
  maxWords: number;
  timeLimit: number;
  hasStarted: boolean;
  hasSaved?: boolean;
  onSave: () => void;
  onFeedback: () => void;
  onViewModel: () => void;
  isSaving?: boolean;
  isEvaluating?: boolean;
}

export function WritingToolbar({
  wordCount,
  charCount,
  paraCount,
  minWords,
  maxWords,
  timeLimit,
  hasStarted,
  onSave,
  onFeedback,
  onViewModel,
  isSaving,
  isEvaluating,
}: Props) {
  const timer = useTimer(timeLimit);

  useEffect(() => {
    if (hasStarted && !timer.isRunning && timer.timeLeft === timeLimit * 60) {
      timer.start();
    }
  }, [hasStarted]);

  const wcClass =
    wordCount === 0
      ? "word-count"
      : wordCount < minWords
      ? "word-count wc-low"
      : wordCount <= maxWords
      ? "word-count wc-good"
      : "word-count wc-over";

  const timerClass =
    timer.urgency === "danger"
      ? "timer danger"
      : timer.urgency === "warning"
      ? "timer warning"
      : "timer";

  return (
    <div className="writing-toolbar">
      <span className={wcClass}>
        {wordCount} words
      </span>
      <span className="writing-stat">{minWords}–{maxWords} target</span>
      <span className="writing-stat">· {charCount} chars</span>
      <span className="writing-stat">· {paraCount} para</span>

      <span className="toolbar-spacer" />

      <span className={timerClass}>{timer.formatted}</span>

      <button
        className="btn btn-ghost btn-sm"
        onClick={onSave}
        disabled={isSaving}
      >
        {isSaving ? "Saving…" : "Save"}
      </button>

      <button
        className="btn btn-secondary btn-sm"
        onClick={onFeedback}
        disabled={isEvaluating}
      >
        {isEvaluating ? "Evaluating…" : "AI Feedback"}
      </button>

      <button className="btn btn-primary btn-sm" onClick={onViewModel}>
        Model Answer
      </button>
    </div>
  );
}
