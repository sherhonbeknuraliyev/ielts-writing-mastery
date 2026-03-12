export const APP_NAME = "IELTS Writing Mastery";
export const APP_SUBTITLE = "From 6.5 to 7.5+";

export const BAND_CRITERIA = {
  TASK_ACHIEVEMENT: "task-achievement",
  COHERENCE_COHESION: "coherence-cohesion",
  LEXICAL_RESOURCE: "lexical-resource",
  GRAMMATICAL_RANGE: "grammatical-range",
} as const;

export const BAND_DESCRIPTORS = {
  "task-achievement": {
    name: "Task Achievement",
    band6: "Addresses all parts but some may be more fully covered. Position may become unclear.",
    band7: "Addresses all parts. Clear position throughout. Main ideas extended and supported.",
    band8: "Sufficiently addresses all parts. Well-developed response with relevant, extended ideas.",
  },
  "coherence-cohesion": {
    name: "Coherence & Cohesion",
    band6: "Information arranged coherently. Cohesive devices used but may be faulty or mechanical.",
    band7: "Logically organised. Clear progression. Range of cohesive devices used appropriately.",
    band8: "Information sequenced logically. All aspects of cohesion managed well.",
  },
  "lexical-resource": {
    name: "Lexical Resource",
    band6: "Adequate range. Attempts less common vocabulary with some inaccuracy.",
    band7: "Sufficient range for flexibility and precision. Less common items with some awareness of style.",
    band8: "Wide range used fluently and flexibly. Skilful use of uncommon items.",
  },
  "grammatical-range": {
    name: "Grammatical Range & Accuracy",
    band6: "Mix of simple and complex forms. Some errors but rarely reduce communication.",
    band7: "Variety of complex structures. Frequent error-free sentences. Good control.",
    band8: "Wide range of structures. Majority error-free. Only very occasional errors.",
  },
} as const;

export const WORD_LIMITS = {
  "task1-academic": { min: 150, max: 200 },
  "task1-general": { min: 150, max: 200 },
  "task2": { min: 250, max: 300 },
} as const;

export const TIME_LIMITS = {
  "task1-academic": 20,
  "task1-general": 20,
  "task2": 40,
} as const;

export const COLLOCATION_TOPICS = [
  "education", "technology", "environment", "health",
  "urbanization", "crime-law", "economy", "society-culture", "government",
] as const;

export const AI_RATE_LIMITS = {
  ESSAY_EVALUATIONS_PER_DAY: 5,
  EXERCISE_VALIDATIONS_PER_DAY: 30,
} as const;
