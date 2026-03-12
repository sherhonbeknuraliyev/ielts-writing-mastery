import { useState, useEffect, useRef } from "react";

export function useStudySession() {
  const [seconds, setSeconds] = useState(0);
  const [showBreakReminder, setShowBreakReminder] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (seconds > 0 && seconds % (45 * 60) === 0) {
      setShowBreakReminder(true);
      setTimeout(() => setShowBreakReminder(false), 30000);
    }
  }, [seconds]);

  const dismissBreak = () => setShowBreakReminder(false);

  const formatted = `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;

  return { seconds, formatted, showBreakReminder, dismissBreak };
}
