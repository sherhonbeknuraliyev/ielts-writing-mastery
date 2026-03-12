import type { BandUpgrade } from "../../shared/schemas/collocation.schema.js";

export const upgradesPart1: BandUpgrade[] = [
  // vocabulary (10 pairs: bu-01 to bu-10)
  {
    id: "bu-01",
    band6: "This is a big problem.",
    band8: "This constitutes a significant challenge.",
    category: "vocabulary",
    explanation:
      "'Big' is informal and imprecise. 'Significant' is formal and quantifiable. 'Constitutes' replaces the weak verb 'is', showing command of formal register expected at band 7+.",
  },
  {
    id: "bu-02",
    band6: "Many people think that technology is good.",
    band8: "It is widely maintained that technology yields considerable benefits.",
    category: "vocabulary",
    explanation:
      "'Many people think' is a weak, over-generalised opener. 'It is widely maintained that' is an impersonal, formal construction. 'Good' is replaced with 'yields considerable benefits', which is more precise and academic.",
  },
  {
    id: "bu-03",
    band6: "There are good and bad effects of globalisation.",
    band8: "Globalisation has both beneficial and detrimental implications.",
    category: "vocabulary",
    explanation:
      "'Good and bad' are simplistic evaluative adjectives. 'Beneficial and detrimental' are more precise and formal. 'Implications' is preferred over 'effects' in analytical writing as it suggests deeper consideration.",
  },
  {
    id: "bu-04",
    band6: "The government needs to do something about poverty.",
    band8: "The government must implement targeted measures to alleviate poverty.",
    category: "vocabulary",
    explanation:
      "'Do something' is vague and informal. 'Implement targeted measures' specifies the type of action. 'Alleviate' is more precise than simply addressing poverty, implying a reduction in its severity.",
  },
  {
    id: "bu-05",
    band6: "Air pollution is getting worse in cities.",
    band8: "Urban air pollution is deteriorating at an alarming rate.",
    category: "vocabulary",
    explanation:
      "'Getting worse' is a colloquial phrasal verb. 'Deteriorating' is a single formal verb that conveys the same meaning. Adding 'at an alarming rate' strengthens the argument with evaluative language appropriate in IELTS essays.",
  },
  {
    id: "bu-06",
    band6: "The number of old people is going up.",
    band8: "The proportion of elderly citizens is rising steadily.",
    category: "vocabulary",
    explanation:
      "'Old people' lacks precision and formality; 'elderly citizens' is both formal and respectful. 'Going up' is colloquial; 'rising steadily' is formal and more informative about the rate of change.",
  },
  {
    id: "bu-07",
    band6: "Social media has changed how people talk to each other.",
    band8: "Social media has fundamentally transformed interpersonal communication.",
    category: "vocabulary",
    explanation:
      "'Changed how people talk to each other' is wordy and informal. 'Fundamentally transformed' uses a strong collocating adverb-verb pair. 'Interpersonal communication' is the precise academic term for the concept.",
  },
  {
    id: "bu-08",
    band6: "Crime is a big issue in many places.",
    band8: "Crime represents a pervasive concern across numerous societies.",
    category: "vocabulary",
    explanation:
      "'Big issue' is vague and informal. 'Pervasive concern' conveys both severity and breadth. 'Places' is non-specific; 'societies' is more analytically appropriate in a social science context.",
  },
  {
    id: "bu-09",
    band6: "It is hard for young people to find a good job.",
    band8: "Young people face considerable difficulty in securing gainful employment.",
    category: "vocabulary",
    explanation:
      "'Hard' and 'find a good job' are informal. 'Considerable difficulty' is a formal noun phrase. 'Securing gainful employment' is the standard academic expression for obtaining satisfactory work.",
  },
  {
    id: "bu-10",
    band6: "Eating unhealthy food can make you sick.",
    band8: "Consumption of nutritionally poor food can precipitate a range of serious health conditions.",
    category: "vocabulary",
    explanation:
      "'Eating unhealthy food can make you sick' is informal and uses second-person address. 'Consumption of nutritionally poor food' is formal noun-phrase-based. 'Precipitate' is a sophisticated verb meaning 'cause suddenly'. The passive construction avoids direct address.",
  },

  // grammar (10 pairs: bu-11 to bu-20)
  {
    id: "bu-11",
    band6: "Technology is useful. It helps people learn.",
    band8: "Technology, which facilitates learning, has proven to be an invaluable resource.",
    category: "grammar",
    explanation:
      "Two short, simple sentences are combined into one using a non-defining relative clause ('which facilitates learning'). This demonstrates the ability to embed information grammatically rather than listing it in separate sentences.",
  },
  {
    id: "bu-12",
    band6: "If the government invests more, the situation will improve.",
    band8: "Were the government to increase its investment, a notable improvement in the situation would likely ensue.",
    category: "grammar",
    explanation:
      "The standard 'if + present' conditional is upgraded to an inverted conditional ('Were the government to…'), which is a mark of advanced grammatical control. 'Would likely ensue' is more formal than 'will improve'.",
  },
  {
    id: "bu-13",
    band6: "Because there are many people in cities, there is a lot of traffic.",
    band8: "The high population density of urban areas inevitably gives rise to significant traffic congestion.",
    category: "grammar",
    explanation:
      "The causal 'because' clause is restructured into a subject-predicate pattern where the cause ('high population density') is the grammatical subject. The complex noun phrase in subject position is a key feature of academic prose.",
  },
  {
    id: "bu-14",
    band6: "More and more companies are using robots. This is because it is cheaper.",
    band8: "The growing adoption of robotics by companies is driven primarily by cost efficiency.",
    category: "grammar",
    explanation:
      "Two simple sentences are collapsed into one using a passive construction ('is driven by'). 'The growing adoption of robotics' is a complex noun phrase that condenses the first sentence into a subject. 'Cost efficiency' replaces 'it is cheaper'.",
  },
  {
    id: "bu-15",
    band6: "Students who study hard will pass their exams. They will also get good jobs.",
    band8: "Diligent study not only equips students to succeed academically but also enhances their long-term career prospects.",
    category: "grammar",
    explanation:
      "Two separate sentences are combined using the correlative structure 'not only…but also', which is a sophisticated coordinating device. The subjects are unified through nominalisation ('diligent study').",
  },
  {
    id: "bu-16",
    band6: "The population is growing. The government needs to build more schools.",
    band8: "The burgeoning population necessitates a significant expansion of educational infrastructure.",
    category: "grammar",
    explanation:
      "Two sentences are merged into one. The causal relationship is expressed through 'necessitates' rather than an explicit connector. Nominalisation ('expansion of educational infrastructure') condenses the second sentence.",
  },
  {
    id: "bu-17",
    band6: "People in poor countries don't have enough food. This is a big problem.",
    band8: "Food insecurity, which disproportionately afflicts populations in lower-income nations, constitutes a profound humanitarian challenge.",
    category: "grammar",
    explanation:
      "The two sentences are unified into a single complex sentence with a non-defining relative clause. 'Disproportionately afflicts' is more precise than 'don't have enough'. 'Constitutes a profound humanitarian challenge' elevates the register significantly.",
  },
  {
    id: "bu-18",
    band6: "Cars cause pollution. Governments should reduce the number of cars.",
    band8: "Given the significant contribution of private vehicle use to atmospheric pollution, governments are justified in pursuing policies to curtail car ownership.",
    category: "grammar",
    explanation:
      "'Given that' or 'given + noun phrase' is a formal participial construction used to introduce a premise. The second clause uses an infinitive ('in pursuing') rather than 'should', making the recommendation more tentative and analytical.",
  },
  {
    id: "bu-19",
    band6: "Some people agree with this view. Some people disagree.",
    band8: "While some scholars endorse this perspective, others advance compelling counterarguments.",
    category: "grammar",
    explanation:
      "The parallel but separate sentences are combined using a concessive 'while' clause. 'Scholars' and 'advance compelling counterarguments' replace vague 'people disagree', and the overall sentence demonstrates command of adversative cohesion.",
  },
  {
    id: "bu-20",
    band6: "The problem will get worse if we don't act now.",
    band8: "Should immediate action not be taken, the problem is likely to deteriorate substantially.",
    category: "grammar",
    explanation:
      "The conditional is inverted ('Should…not be taken') rather than introduced with 'if'. The passive voice removes the informal 'we'. 'Deteriorate substantially' replaces 'get worse', elevating the lexical register.",
  },
];
