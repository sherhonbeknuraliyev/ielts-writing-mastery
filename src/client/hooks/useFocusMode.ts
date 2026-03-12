import { useState, useCallback, useEffect } from "react";

export function useFocusMode() {
  const [focusMode, setFocusMode] = useState(false);

  const enter = useCallback(() => setFocusMode(true), []);
  const exit = useCallback(() => setFocusMode(false), []);
  const toggle = useCallback(() => setFocusMode((f) => !f), []);

  useEffect(() => {
    if (!focusMode) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") exit();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [focusMode, exit]);

  return { focusMode, enter, exit, toggle };
}
