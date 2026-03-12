import { useState, useEffect, useRef, useCallback } from "react";

export type TimerUrgency = "normal" | "warning" | "danger";

export interface UseTimerReturn {
  timeLeft: number;
  elapsed: number;
  isRunning: boolean;
  urgency: TimerUrgency;
  formatted: string;
  start: () => void;
  pause: () => void;
  reset: () => void;
}

export function useTimer(totalMinutes: number): UseTimerReturn {
  const totalSeconds = totalMinutes * 60;
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            setIsRunning(false);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return clear;
  }, [isRunning]);

  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);
  const reset = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(totalSeconds);
  }, [totalSeconds]);

  const elapsed = totalSeconds - timeLeft;

  const urgency: TimerUrgency =
    timeLeft <= 120 ? "danger" : timeLeft <= 300 ? "warning" : "normal";

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return { timeLeft, elapsed, isRunning, urgency, formatted, start, pause, reset };
}
