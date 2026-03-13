import { useState, useEffect, useRef } from "react";
import { trpc } from "../utils/trpc.js";
import { ExerciseRunner } from "../components/ExerciseRunner.js";
import type { ExerciseResult } from "../components/ExerciseRunner.js";
import type { SkillExercise } from "@shared/schemas/skill.schema.js";

interface ChallengeEntry {
  date: string;
  score: number;
  total: number;
  timeTaken: number;
}

const CHALLENGE_KEY = "daily-challenges";
const CHALLENGE_COUNT = 10;
const TIMER_SECONDS = 600;

function loadChallenges(): ChallengeEntry[] {
  try {
    return JSON.parse(localStorage.getItem(CHALLENGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveChallenge(entry: ChallengeEntry) {
  try {
    const existing = loadChallenges();
    existing.push(entry);
    localStorage.setItem(CHALLENGE_KEY, JSON.stringify(existing.slice(-90)));
  } catch {
    // ignore
  }
}

function getPrevDay(date: string): string {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function getStreak(challenges: ChallengeEntry[]): number {
  if (challenges.length === 0) return 0;
  const today = new Date().toISOString().slice(0, 10);
  const dates = [...new Set(challenges.map((c) => c.date))].sort().reverse();
  if (dates[0] !== today && dates[0] !== getPrevDay(today)) return 0;
  let streak = 0;
  let check = today;
  for (const d of dates) {
    if (d === check) {
      streak++;
      check = getPrevDay(check);
    } else if (d < check) {
      break;
    }
  }
  return streak;
}

function pickRandom<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy.slice(0, n);
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function DailyChallengePage() {
  const [phase, setPhase] = useState<"start" | "running" | "done">("start");
  const [selected, setSelected] = useState<SkillExercise[]>([]);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [timeUsed, setTimeUsed] = useState(0);
  const [finalResults, setFinalResults] = useState<ExerciseResult[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: skills } = trpc.skill.list.useQuery(undefined);

  const challenges = loadChallenges();
  const streak = getStreak(challenges);
  const lastChallenge = challenges.length > 0 ? challenges[challenges.length - 1] : null;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startChallenge = () => {
    const allExercises: SkillExercise[] = [];
    for (const skill of (skills ?? [])) {
      for (const exercise of skill.exercises) {
        allExercises.push(exercise);
      }
    }
    if (allExercises.length === 0) return;
    const picked = pickRandom(allExercises, Math.min(CHALLENGE_COUNT, allExercises.length));
    setSelected(picked);
    setTimeLeft(TIMER_SECONDS);
    setPhase("running");

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const handleComplete = (results: ExerciseResult[]) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const used = TIMER_SECONDS - timeLeft;
    setTimeUsed(used);
    setFinalResults(results);
    setPhase("done");

    const today = new Date().toISOString().slice(0, 10);
    const score = results.filter((r) => r.correct).length;
    saveChallenge({ date: today, score, total: results.length, timeTaken: used });
  };

  if (phase === "start") {
    return (
      <div>
        <div className="page-header">
          <h1>Daily Challenge</h1>
          <p>10 mixed exercises from all skills — beat the clock!</p>
        </div>
        <div className="challenge-start card">
          <div className="card-body">
            {streak > 0 && (
              <div style={{ marginBottom: "var(--space-6)" }}>
                <span className="challenge-streak">
                  {streak} day{streak > 1 ? "s" : ""} in a row!
                </span>
              </div>
            )}
            <h2 style={{ marginBottom: "var(--space-4)" }}>How it works</h2>
            <ul style={{ textAlign: "left", maxWidth: 480, margin: "0 auto var(--space-6)", lineHeight: 2, color: "var(--text-secondary)" }}>
              <li>10 random exercises drawn from all skill modules</li>
              <li>Mixed topics for better retention</li>
              <li>10-minute countdown timer</li>
              <li>Score tracked daily to build your streak</li>
            </ul>
            {lastChallenge && (
              <p style={{ color: "var(--text-tertiary)", marginBottom: "var(--space-6)" }}>
                Last attempt: <strong>{lastChallenge.score}/{lastChallenge.total}</strong> in {formatTime(lastChallenge.timeTaken)}
              </p>
            )}
            <button
              className="btn btn-primary"
              style={{ fontSize: "1.1rem", padding: "var(--space-3) var(--space-8)" }}
              onClick={startChallenge}
              disabled={!skills || skills.length === 0}
            >
              {!skills || skills.length === 0 ? "No skills loaded yet" : "Start Challenge"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "running") {
    return (
      <div>
        <div className="page-header">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-3)" }}>
            <h1>Daily Challenge</h1>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: timeLeft < 60 ? "var(--error)" : "var(--accent)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
        <ExerciseRunner exercises={selected} onComplete={handleComplete} />
      </div>
    );
  }

  const score = finalResults.filter((r) => r.correct).length;
  const total = finalResults.length;
  const pct = Math.round((score / total) * 100);

  return (
    <div>
      <div className="page-header">
        <h1>Challenge Complete!</h1>
      </div>
      <div className="score-summary">
        <h3>Your Score</h3>
        <div className="score-big">{score}/{total}</div>
        <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.9rem" }}>
          {pct}% correct &mdash; completed in {formatTime(timeUsed)}
        </p>
      </div>

      <div style={{ marginTop: "var(--space-6)", display: "flex", gap: "var(--space-3)" }}>
        <button className="btn btn-primary" onClick={() => setPhase("start")}>
          Back to Start
        </button>
        <button className="btn btn-ghost" onClick={startChallenge}>
          Try Again
        </button>
      </div>
    </div>
  );
}
