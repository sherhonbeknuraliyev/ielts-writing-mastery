import type { ParaphraseDrill } from "../../shared/schemas/collocation.schema.js";

export const paraphrasePart1: ParaphraseDrill[] = [
  // synonym (6 drills: para-01 to para-06)
  {
    id: "para-01",
    original: "The government should allocate more funds to education.",
    method: "synonym",
    paraphrases: [
      "The authorities ought to dedicate greater financial resources to the education sector.",
      "Government bodies should channel additional funding towards educational provision.",
    ],
    explanation:
      "'Government' → 'authorities/government bodies'; 'allocate' → 'dedicate/channel'; 'funds' → 'financial resources/funding'. Each substitution raises precision without altering the core argument.",
  },
  {
    id: "para-02",
    original: "Many people believe that technology has improved modern life.",
    method: "synonym",
    paraphrases: [
      "A large proportion of individuals hold the view that technology has enhanced contemporary living.",
      "Numerous people are of the opinion that technological advances have benefited daily life in the modern era.",
    ],
    explanation:
      "'Many people' → 'a large proportion of individuals/numerous people'; 'believe' → 'hold the view/are of the opinion'; 'improved' → 'enhanced/benefited'; 'modern life' → 'contemporary living/daily life in the modern era'.",
  },
  {
    id: "para-03",
    original: "Rising unemployment is a serious problem in many countries.",
    method: "synonym",
    paraphrases: [
      "Increasing joblessness constitutes a significant challenge in numerous nations.",
      "The growing rate of unemployment represents a grave concern across a wide range of countries.",
    ],
    explanation:
      "'Rising' → 'increasing/growing'; 'unemployment' → 'joblessness'; 'serious problem' → 'significant challenge/grave concern'; 'many countries' → 'numerous nations/a wide range of countries'.",
  },
  {
    id: "para-04",
    original: "Children spend too much time watching television.",
    method: "synonym",
    paraphrases: [
      "Young people devote an excessive amount of time to viewing television programmes.",
      "Children allocate a disproportionate number of hours to screen-based entertainment.",
    ],
    explanation:
      "'Children' → 'young people'; 'spend' → 'devote/allocate'; 'too much time' → 'an excessive amount of time/a disproportionate number of hours'; 'watching television' → 'viewing television programmes/screen-based entertainment'.",
  },
  {
    id: "para-05",
    original: "Cities are becoming more crowded due to migration.",
    method: "synonym",
    paraphrases: [
      "Urban centres are growing increasingly congested as a result of population movement.",
      "Metropolitan areas are experiencing rising population density owing to migratory patterns.",
    ],
    explanation:
      "'Cities' → 'urban centres/metropolitan areas'; 'crowded' → 'congested/high population density'; 'due to' → 'as a result of/owing to'; 'migration' → 'population movement/migratory patterns'.",
  },
  {
    id: "para-06",
    original: "It is important to protect the natural environment.",
    method: "synonym",
    paraphrases: [
      "It is imperative to safeguard the natural world.",
      "Preserving the ecological environment is of paramount importance.",
    ],
    explanation:
      "'Important' → 'imperative/of paramount importance'; 'protect' → 'safeguard/preserve'; 'natural environment' → 'the natural world/the ecological environment'.",
  },

  // word-form (6 drills: para-07 to para-12)
  {
    id: "para-07",
    original: "The rapid development of technology has transformed communication.",
    method: "word-form",
    paraphrases: [
      "Technology has developed rapidly, transforming how people communicate.",
      "Rapid technological development has fundamentally altered communication patterns.",
    ],
    explanation:
      "'Development' (noun) → 'developed' (verb); 'technology' (noun) → 'technological' (adjective). Shifting word forms allows different sentence structures while preserving meaning.",
  },
  {
    id: "para-08",
    original: "The education of children is a responsibility of the state.",
    method: "word-form",
    paraphrases: [
      "The state is responsible for educating children.",
      "Educating children is a state responsibility.",
    ],
    explanation:
      "'Education' (noun) → 'educating' (gerund/verb form); 'responsibility' (noun) → 'responsible' (adjective). These transformations allow the sentence to be reconstructed around different grammatical centres.",
  },
  {
    id: "para-09",
    original: "The government made an investment in renewable energy.",
    method: "word-form",
    paraphrases: [
      "The government invested in renewable energy.",
      "Governmental investment in renewable energy was made.",
    ],
    explanation:
      "'Made an investment' (noun phrase) → 'invested' (verb); 'government' (noun) → 'governmental' (adjective). Converting from a noun-heavy structure to a verb-centred one creates a more direct, concise sentence.",
  },
  {
    id: "para-10",
    original: "There has been a significant increase in the number of people using social media.",
    method: "word-form",
    paraphrases: [
      "Social media use has increased significantly.",
      "The number of social media users has grown significantly.",
    ],
    explanation:
      "'Increase' (noun) → 'increased' (verb); 'using' (gerund) → 'users' (noun). Restructuring around the verb reduces wordiness and improves flow.",
  },
  {
    id: "para-11",
    original: "Air pollution causes damage to human health.",
    method: "word-form",
    paraphrases: [
      "Air pollution damages human health.",
      "Human health is damaged by air pollution.",
    ],
    explanation:
      "'Causes damage' (verb + noun) → 'damages' (single verb). Replacing a verb-noun collocation with a direct verb is a hallmark of concise, high-band writing.",
  },
  {
    id: "para-12",
    original: "The solution to the problem of obesity lies in better education.",
    method: "word-form",
    paraphrases: [
      "Obesity can be solved through improved educational initiatives.",
      "Better education is instrumental in solving the problem of obesity.",
    ],
    explanation:
      "'Solution' (noun) → 'solving/solved' (verb forms); 'better' (adjective) → 'improved' (adjective, more academic register). Shifting the verb form reshapes clause structure.",
  },

  // restructure (3 drills: para-13 to para-15, continued in part 2)
  {
    id: "para-13",
    original: "Although the economy has grown, unemployment remains high.",
    method: "restructure",
    paraphrases: [
      "Unemployment remains high despite the growth of the economy.",
      "The economy has grown; nevertheless, unemployment persists at high levels.",
    ],
    explanation:
      "The concessive clause 'although…' is restructured into 'despite + noun phrase' or a contrastive adverb ('nevertheless'). Both alternatives maintain the contrast while varying syntactic form.",
  },
  {
    id: "para-14",
    original: "If the government invests in public transport, air pollution will decrease.",
    method: "restructure",
    paraphrases: [
      "Government investment in public transport would lead to a reduction in air pollution.",
      "Air pollution is likely to decrease as a result of government investment in public transport.",
    ],
    explanation:
      "The conditional 'if…will' structure is recast as a noun phrase ('government investment') or as a result clause. This eliminates the conditional mood and produces a more assertive academic tone.",
  },
  {
    id: "para-15",
    original: "Crime rates are rising because many young people lack employment opportunities.",
    method: "restructure",
    paraphrases: [
      "The lack of employment opportunities among young people is driving rising crime rates.",
      "Rising crime rates can be attributed to the shortage of employment opportunities for young people.",
    ],
    explanation:
      "The causal clause ('because…') is restructured into a subject-focused sentence or a passive construction with 'attributed to'. Both restructured forms foreground the cause more prominently.",
  },
];
