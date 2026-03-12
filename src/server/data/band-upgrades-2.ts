import type { BandUpgrade } from "../../shared/schemas/collocation.schema.js";

export const upgradesPart2: BandUpgrade[] = [
  // cohesion (10 pairs: bu-21 to bu-30)
  {
    id: "bu-21",
    band6: "Firstly, education is important. Secondly, it helps the economy.",
    band8: "Education serves as a cornerstone of economic development, and its significance extends beyond individual advancement.",
    category: "cohesion",
    explanation:
      "Listing connectors ('firstly, secondly') create a mechanical structure. The band 8 version integrates both ideas into one sentence, using 'and its significance extends beyond' to show logical progression and cohesion through ellipsis.",
  },
  {
    id: "bu-22",
    band6: "Also, there is another problem.",
    band8: "Compounding this issue is the equally pressing concern of…",
    category: "cohesion",
    explanation:
      "'Also' is an overused additive connector. 'Compounding this issue' is an inverted construction that both adds information and signals its relationship to the previous point. It demonstrates sophisticated cohesive awareness.",
  },
  {
    id: "bu-23",
    band6: "In conclusion, I think both sides have good points.",
    band8: "In conclusion, while both perspectives carry merit, the long-term evidence more convincingly supports the view that…",
    category: "cohesion",
    explanation:
      "The band 6 conclusion avoids taking a position. The band 8 version acknowledges both sides ('while both perspectives carry merit') but uses 'more convincingly supports' to take a reasoned stance, which is required for a high score.",
  },
  {
    id: "bu-24",
    band6: "But, on the other hand, there are some disadvantages.",
    band8: "Nevertheless, this argument must be considered alongside a number of significant drawbacks.",
    category: "cohesion",
    explanation:
      "'But' is too informal for academic writing. 'Nevertheless' is an adversative connector that creates a more formal contrast. 'Must be considered alongside' shows the writer is weighing evidence rather than simply listing points.",
  },
  {
    id: "bu-25",
    band6: "This shows that the problem is serious. We need to do something.",
    band8: "This evidence underscores the gravity of the situation and points to the urgent need for intervention.",
    category: "cohesion",
    explanation:
      "'This shows' is a weak referencing phrase. 'This evidence underscores' is more precise in identifying what 'this' refers to and uses a stronger verb. The sentence is unified rather than split into two, improving flow.",
  },
  {
    id: "bu-26",
    band6: "There are many reasons for this. One reason is poverty. Another reason is lack of education.",
    band8: "This phenomenon can be attributed to a confluence of factors, most notably entrenched poverty and inadequate access to education.",
    category: "cohesion",
    explanation:
      "Three separate sentences are condensed into one. 'A confluence of factors' implies interconnection rather than a mere list. 'Most notably' is a more elegant enumerative device than 'one reason…another reason'.",
  },
  {
    id: "bu-27",
    band6: "However, this is not always true. For example, in Japan, the crime rate is low.",
    band8: "This claim does not hold universally; Japan, for instance, demonstrates that low crime rates are achievable despite high urbanisation.",
    category: "cohesion",
    explanation:
      "The semicolon creates a tighter logical link than using two separate sentences. 'Does not hold universally' is more academic than 'not always true'. The example is integrated into the argument rather than appended.",
  },
  {
    id: "bu-28",
    band6: "In my opinion, the government is responsible. They should take action.",
    band8: "It is my contention that governmental responsibility is paramount, and that decisive policy action is warranted.",
    category: "cohesion",
    explanation:
      "'In my opinion' is acceptable but common. 'It is my contention that' is a formal, distancing phrase. Combining both ideas into one sentence with parallel 'that' clauses demonstrates cohesive control.",
  },
  {
    id: "bu-29",
    band6: "First, I will talk about the advantages. Then I will talk about the disadvantages.",
    band8: "This essay will first examine the principal advantages before turning to a consideration of the associated disadvantages.",
    category: "cohesion",
    explanation:
      "The band 6 version uses a fragmented, conversational signposting style. The band 8 version integrates both statements into a single sentence using 'before turning to', which creates a logical sequence through subordination rather than listing.",
  },
  {
    id: "bu-30",
    band6: "So, overall, it is clear that education is very important.",
    band8: "Ultimately, the foregoing discussion affirms that education is indispensable to both individual fulfilment and societal progress.",
    category: "cohesion",
    explanation:
      "'So, overall, it is clear' is repetitive and adds little value. 'Ultimately, the foregoing discussion affirms' explicitly refers back to the argument. 'Indispensable to both…and…' is more precise than 'very important'.",
  },

  // register (10 pairs: bu-31 to bu-40)
  {
    id: "bu-31",
    band6: "Kids spend too much time on phones.",
    band8: "Young people allocate a disproportionate amount of time to mobile device usage.",
    category: "register",
    explanation:
      "'Kids' is informal slang inappropriate in academic writing. 'Young people' is neutral and formal. 'Spend too much time' is colloquial; 'allocate a disproportionate amount of time' is precise and registers strong analytical concern.",
  },
  {
    id: "bu-32",
    band6: "The thing is that people don't care about the environment.",
    band8: "A pervasive indifference towards environmental conservation persists among the general populace.",
    category: "register",
    explanation:
      "'The thing is that' is a spoken discourse marker that has no place in formal writing. The band 8 sentence uses a nominalised subject ('a pervasive indifference') and passive-like impersonal construction, appropriate for academic prose.",
  },
  {
    id: "bu-33",
    band6: "A lot of countries are trying to fix the economy.",
    band8: "Numerous nations are endeavouring to stabilise and revitalise their economies.",
    category: "register",
    explanation:
      "'A lot of' is informal; 'numerous' is formal. 'Trying to fix' is colloquial; 'endeavouring to stabilise and revitalise' uses formal vocabulary and is more specific about the nature of the action being taken.",
  },
  {
    id: "bu-34",
    band6: "It's obvious that smoking is bad for your health.",
    band8: "It is well established that tobacco consumption is profoundly detrimental to health.",
    category: "register",
    explanation:
      "'It's obvious' and 'bad for your health' are informal. 'It is well established' cites implicit consensus without claiming personal certainty. 'Tobacco consumption is profoundly detrimental' is formal, precise, and avoids second-person address.",
  },
  {
    id: "bu-35",
    band6: "People nowadays are really stressed at work.",
    band8: "Contemporary employees are increasingly susceptible to occupational stress.",
    category: "register",
    explanation:
      "'People nowadays' lacks precision; 'contemporary employees' specifies the relevant group. 'Really stressed' is informal; 'increasingly susceptible to occupational stress' is formal and implies a trend.",
  },
  {
    id: "bu-36",
    band6: "Companies make a lot of money but don't care about workers.",
    band8: "While corporations generate substantial profits, the welfare of their workforce is frequently overlooked.",
    category: "register",
    explanation:
      "'Make a lot of money' and 'don't care about workers' are casual. 'Generate substantial profits' and 'the welfare of their workforce is frequently overlooked' are formal. The concessive structure ('while…') also improves cohesion.",
  },
  {
    id: "bu-37",
    band6: "We should stop using so much plastic.",
    band8: "It is imperative that plastic consumption be curtailed significantly.",
    category: "register",
    explanation:
      "First-person 'we' is generally avoided in formal IELTS essays. The band 8 version uses an impersonal 'it is imperative that' structure with the subjunctive ('be curtailed'), which is a hallmark of formal academic register.",
  },
  {
    id: "bu-38",
    band6: "Poor countries need help from rich countries.",
    band8: "Lower-income nations require substantial assistance from their wealthier counterparts.",
    category: "register",
    explanation:
      "'Poor countries' and 'rich countries' are evaluatively loaded and imprecise. 'Lower-income nations' and 'wealthier counterparts' are more neutral and analytical. 'Need help' → 'require substantial assistance' raises formality.",
  },
  {
    id: "bu-39",
    band6: "I think this essay has shown that both sides have good arguments.",
    band8: "The preceding analysis demonstrates that both positions are supported by compelling evidence.",
    category: "register",
    explanation:
      "First-person ('I think this essay') is informal and self-referential. 'The preceding analysis demonstrates' is an objective, impersonal construction. 'Good arguments' → 'compelling evidence' is more analytical and formal.",
  },
  {
    id: "bu-40",
    band6: "It is getting harder and harder for young people to buy a house.",
    band8: "Young people face progressively greater obstacles in accessing home ownership.",
    category: "register",
    explanation:
      "'Getting harder and harder' is informal and repetitive. 'Progressively greater obstacles' is a formal noun phrase conveying the same escalating difficulty. 'Buy a house' → 'accessing home ownership' raises lexical precision.",
  },
];
