import { WritingModel } from "../models/writing.model.js";
import type {
  AnalyticsResponse,
  Recommendation,
} from "../../shared/schemas/analytics.schema.js";

const CRITERIA_KEYS = [
  "taskAchievement",
  "coherenceCohesion",
  "lexicalResource",
  "grammaticalRange",
] as const;

type CriterionKey = (typeof CRITERIA_KEYS)[number];

const CRITERIA_NAMES: Record<CriterionKey, string> = {
  taskAchievement: "Task Achievement",
  coherenceCohesion: "Coherence & Cohesion",
  lexicalResource: "Lexical Resource",
  grammaticalRange: "Grammatical Range & Accuracy",
};

const CRITERIA_LINKS: Record<CriterionKey, string> = {
  coherenceCohesion: "/skills?module=writing-techniques",
  lexicalResource: "/vocabulary",
  grammaticalRange: "/skills?module=error-elimination",
  taskAchievement: "/skills?module=writing-techniques",
};

function categorizeError(explanation: string): string {
  const lower = explanation.toLowerCase();
  if (lower.includes("article") || lower.includes("a/an") || lower.includes("the")) {
    return "Articles";
  }
  if (lower.includes("subject") && lower.includes("verb")) {
    return "Subject-Verb Agreement";
  }
  if (lower.includes("tense")) {
    return "Verb Tenses";
  }
  if (lower.includes("preposition")) {
    return "Prepositions";
  }
  if (lower.includes("singular") || lower.includes("plural") || lower.includes("countable")) {
    return "Singular/Plural";
  }
  if (lower.includes("comma") || lower.includes("semicolon") || lower.includes("punctuation")) {
    return "Punctuation";
  }
  if (lower.includes("word order") || lower.includes("syntax")) {
    return "Word Order";
  }
  if (lower.includes("spelling")) {
    return "Spelling";
  }
  if (lower.includes("run-on") || lower.includes("fragment") || lower.includes("sentence structure")) {
    return "Sentence Structure";
  }
  return "Other Grammar";
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export const analyticsService = {
  async getAnalytics(userId: string): Promise<AnalyticsResponse> {
    const writings = await WritingModel.find({
      userId,
      aiFeedback: { $exists: true },
    }).sort({ createdAt: 1 });

    const totalEvaluated = writings.length;

    if (totalEvaluated < 3) {
      return { totalEvaluated, sufficient: false };
    }

    // criteriaAverages
    const criteriaAverages = {
      taskAchievement: round2(avg(writings.map((w) => w.aiFeedback!.taskAchievement))),
      coherenceCohesion: round2(avg(writings.map((w) => w.aiFeedback!.coherenceCohesion))),
      lexicalResource: round2(avg(writings.map((w) => w.aiFeedback!.lexicalResource))),
      grammaticalRange: round2(avg(writings.map((w) => w.aiFeedback!.grammaticalRange))),
    };

    // weakestCriterion
    let worstKey: CriterionKey = CRITERIA_KEYS[0];
    let bestKey: CriterionKey = CRITERIA_KEYS[0];
    for (const key of CRITERIA_KEYS) {
      if (criteriaAverages[key] < criteriaAverages[worstKey]) worstKey = key;
      if (criteriaAverages[key] > criteriaAverages[bestKey]) bestKey = key;
    }
    const weakestCriterion = {
      name: CRITERIA_NAMES[worstKey],
      key: worstKey,
      average: criteriaAverages[worstKey],
      gap: round2(criteriaAverages[bestKey] - criteriaAverages[worstKey]),
    };

    // bandTrend
    const bandTrend = writings.map((w) => ({
      date: w.createdAt.toISOString().split("T")[0],
      overallBand: w.aiFeedback!.overallBand,
      taskAchievement: w.aiFeedback!.taskAchievement,
      coherenceCohesion: w.aiFeedback!.coherenceCohesion,
      lexicalResource: w.aiFeedback!.lexicalResource,
      grammaticalRange: w.aiFeedback!.grammaticalRange,
    }));

    // errorPatterns
    const errorMap = new Map<
      string,
      { count: number; examples: { original: string; corrected: string }[] }
    >();
    for (const w of writings) {
      for (const err of w.aiFeedback!.errors) {
        const category = categorizeError(err.explanation);
        const existing = errorMap.get(category);
        if (existing) {
          existing.count += 1;
          if (existing.examples.length < 2) {
            existing.examples.push({ original: err.original, corrected: err.corrected });
          }
        } else {
          errorMap.set(category, {
            count: 1,
            examples: [{ original: err.original, corrected: err.corrected }],
          });
        }
      }
    }
    const errorPatterns = Array.from(errorMap.entries())
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // recurringSuggestions
    const suggestionMap = new Map<string, { upgrades: Set<string>; count: number }>();
    for (const w of writings) {
      for (const s of w.aiFeedback!.vocabularySuggestions) {
        const key = s.original.toLowerCase();
        const existing = suggestionMap.get(key);
        if (existing) {
          existing.count += 1;
          existing.upgrades.add(s.upgraded);
        } else {
          suggestionMap.set(key, { upgrades: new Set([s.upgraded]), count: 1 });
        }
      }
    }
    const recurringSuggestions = Array.from(suggestionMap.entries())
      .filter(([, data]) => data.count >= 2)
      .map(([original, data]) => ({
        original,
        suggestedUpgrades: Array.from(data.upgrades),
        count: data.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // timeManagement
    const task1Times = writings
      .filter((w) => w.type === "task1-academic" || w.type === "task1-general")
      .map((w) => w.timeSpent)
      .filter((t) => t > 0);
    const task2Times = writings
      .filter((w) => w.type === "task2")
      .map((w) => w.timeSpent)
      .filter((t) => t > 0);
    const timeManagement = {
      task1Average: task1Times.length > 0 ? round2(avg(task1Times)) : null,
      task2Average: task2Times.length > 0 ? round2(avg(task2Times)) : null,
      task1Target: 1200,
      task2Target: 2400,
    };

    // selfAwareness
    const selfWritings = writings.filter(
      (w) => w.selfEvaluation && w.aiFeedback
    );

    let selfAwareness: AnalyticsResponse["selfAwareness"] = null;
    if (selfWritings.length > 0) {
      const gaps: number[] = [];
      const perCriterionData: Record<
        CriterionKey,
        { selfVals: number[]; aiVals: number[] }
      > = {
        taskAchievement: { selfVals: [], aiVals: [] },
        coherenceCohesion: { selfVals: [], aiVals: [] },
        lexicalResource: { selfVals: [], aiVals: [] },
        grammaticalRange: { selfVals: [], aiVals: [] },
      };

      for (const w of selfWritings) {
        for (const key of CRITERIA_KEYS) {
          const selfVal = w.selfEvaluation![key];
          const aiVal = w.aiFeedback![key];
          if (selfVal !== undefined && selfVal !== null) {
            gaps.push(Math.abs(selfVal - aiVal));
            perCriterionData[key].selfVals.push(selfVal);
            perCriterionData[key].aiVals.push(aiVal);
          }
        }
      }

      const withinHalfBand = gaps.filter((g) => g <= 0.5).length;
      const accuracy = gaps.length > 0 ? round2((withinHalfBand / gaps.length) * 100) : 0;
      const averageGap = round2(avg(gaps));

      const perCriterion = CRITERIA_KEYS.filter(
        (key) => perCriterionData[key].selfVals.length > 0
      ).map((key) => {
        const selfAvg = round2(avg(perCriterionData[key].selfVals));
        const aiAvg = round2(avg(perCriterionData[key].aiVals));
        return {
          criterion: CRITERIA_NAMES[key],
          key,
          selfAvg,
          aiAvg,
          gap: round2(Math.abs(selfAvg - aiAvg)),
        };
      });

      selfAwareness = { averageGap, accuracy, perCriterion };
    }

    // recommendations
    const recommendations: Recommendation[] = [];

    if (weakestCriterion.gap > 0.5) {
      const key = worstKey;
      recommendations.push({
        type: "criterion",
        title: `Improve ${CRITERIA_NAMES[key]}`,
        description: `Your ${CRITERIA_NAMES[key]} score averages ${weakestCriterion.average.toFixed(1)}, which is ${weakestCriterion.gap.toFixed(1)} below your strongest criterion. Focus practice here for the fastest band improvement.`,
        link: CRITERIA_LINKS[key],
      });
    }

    if (errorPatterns.length > 0 && errorPatterns[0].count > 3) {
      recommendations.push({
        type: "error",
        title: `Fix Recurring ${errorPatterns[0].category} Errors`,
        description: `You have made ${errorPatterns[0].category.toLowerCase()} errors ${errorPatterns[0].count} times across your essays. Targeted grammar practice will help eliminate these.`,
        link: "/skills?module=error-elimination",
      });
    }

    const topSuggestion = recurringSuggestions[0];
    if (topSuggestion && topSuggestion.count > 3) {
      recommendations.push({
        type: "vocabulary",
        title: "Expand Vocabulary Range",
        description: `The word "${topSuggestion.original}" has appeared ${topSuggestion.count} times. Diversifying your vocabulary will improve your Lexical Resource score.`,
        link: "/vocabulary",
      });
    }

    if (timeManagement.task1Average !== null && timeManagement.task1Average > timeManagement.task1Target * 1.2) {
      recommendations.push({
        type: "time",
        title: "Practice Timed Task 1 Writing",
        description: `Your average Task 1 time is ${Math.round(timeManagement.task1Average / 60)} minutes, exceeding the recommended 20 minutes. Timed practice will help you work more efficiently.`,
        link: "/skills?module=writing-techniques",
      });
    }

    if (timeManagement.task2Average !== null && timeManagement.task2Average > timeManagement.task2Target * 1.2) {
      recommendations.push({
        type: "time",
        title: "Practice Timed Task 2 Writing",
        description: `Your average Task 2 time is ${Math.round(timeManagement.task2Average / 60)} minutes, exceeding the recommended 40 minutes. Timed practice will help you work more efficiently.`,
        link: "/skills?module=writing-techniques",
      });
    }

    if (selfAwareness && selfAwareness.averageGap > 1.0) {
      recommendations.push({
        type: "practice",
        title: "Calibrate Your Self-Evaluation",
        description: `Your self-assessments differ from AI scores by an average of ${selfAwareness.averageGap.toFixed(1)} bands. Reviewing examiner criteria will help you self-evaluate more accurately.`,
        link: "/skills?module=writing-techniques",
      });
    }

    return {
      totalEvaluated,
      sufficient: true,
      criteriaAverages,
      weakestCriterion,
      bandTrend,
      errorPatterns,
      recurringSuggestions,
      timeManagement,
      selfAwareness,
      recommendations,
    };
  },
};
