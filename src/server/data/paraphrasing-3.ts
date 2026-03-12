import type { ParaphraseDrill } from "../../shared/schemas/collocation.schema.js";

export const paraphrasePart3: ParaphraseDrill[] = [
  // synonym (para-31 to para-34)
  {
    id: "para-31",
    original: "The number of people using public transport has risen sharply.",
    method: "synonym",
    paraphrases: [
      "The proportion of individuals relying on public transit has increased dramatically.",
      "There has been a marked surge in the number of commuters utilising public transportation.",
    ],
    explanation:
      "'Number of people' → 'proportion of individuals'; 'using' → 'relying on / utilising'; 'public transport' → 'public transit / public transportation'; 'risen sharply' → 'increased dramatically / marked surge'. Each substitution elevates precision without distorting the statistical claim.",
  },
  {
    id: "para-32",
    original: "Many governments have introduced policies to tackle unemployment.",
    method: "synonym",
    paraphrases: [
      "Numerous administrations have implemented measures to address joblessness.",
      "A range of governing bodies have adopted strategies to combat rising unemployment rates.",
    ],
    explanation:
      "'Many governments' → 'numerous administrations / governing bodies'; 'introduced' → 'implemented / adopted'; 'policies' → 'measures / strategies'; 'tackle' → 'address / combat'; 'unemployment' → 'joblessness / unemployment rates'. The substitutions are precise and register-appropriate.",
  },
  {
    id: "para-33",
    original: "Access to clean water is a fundamental human right.",
    method: "synonym",
    paraphrases: [
      "The availability of safe drinking water constitutes a basic entitlement of all people.",
      "Obtaining potable water is widely regarded as an inalienable right of every individual.",
    ],
    explanation:
      "'Access to' → 'availability of / obtaining'; 'clean water' → 'safe drinking water / potable water'; 'fundamental' → 'basic / inalienable'; 'human right' → 'entitlement of all people / right of every individual'. 'Potable' and 'inalienable' are strong band 7-8 lexical choices.",
  },
  {
    id: "para-34",
    original: "Social media has transformed the way people interact with each other.",
    method: "synonym",
    paraphrases: [
      "Online networking platforms have revolutionised the manner in which individuals communicate.",
      "The proliferation of social networking sites has fundamentally altered interpersonal communication.",
    ],
    explanation:
      "'Social media' → 'online networking platforms / social networking sites'; 'transformed' → 'revolutionised / fundamentally altered'; 'the way people interact' → 'the manner in which individuals communicate / interpersonal communication' (nominalisation). Multiple simultaneous substitutions characterise band 8.",
  },

  // word-form (para-35 to para-38)
  {
    id: "para-35",
    original: "Investing in education significantly improves economic outcomes.",
    method: "word-form",
    paraphrases: [
      "Educational investment leads to a significant improvement in economic performance.",
      "There is a significant correlation between investment in education and enhanced economic productivity.",
    ],
    explanation:
      "'Investing' (gerund) → 'educational investment' (noun phrase). 'Improves' (verb) → 'leads to a significant improvement' (noun phrase collocation) or 'enhanced economic productivity' (adjectival noun phrase). Nominalisation produces the abstract, impersonal register of academic writing.",
  },
  {
    id: "para-36",
    original: "Environmental pollution threatens the survival of many species.",
    method: "word-form",
    paraphrases: [
      "Environmental pollutants pose a serious threat to the survival of numerous species.",
      "The presence of environmental contamination represents a grave threat to biodiversity.",
    ],
    explanation:
      "'Pollution' (abstract noun) → 'environmental pollutants' (concrete noun, plural). 'Threatens' (verb) → 'pose a serious threat to / represents a grave threat to' (verb+noun collocation). 'Survival of many species' → 'biodiversity' (technical term that compresses the idea).",
  },
  {
    id: "para-37",
    original: "The rapid growth of cities has created housing shortages.",
    method: "word-form",
    paraphrases: [
      "Rapid urban expansion has resulted in significant housing deficits.",
      "The pace of urbanisation has been a key contributor to acute shortages in residential accommodation.",
    ],
    explanation:
      "'Rapid growth of cities' → 'rapid urban expansion' (nominalisation with adjective) or 'pace of urbanisation' (abstract noun). 'Created' → 'resulted in / been a key contributor to' (verb+preposition collocation). 'Housing shortages' → 'housing deficits / shortages in residential accommodation' (varied nominal forms).",
  },
  {
    id: "para-38",
    original: "Criminal behaviour can often be attributed to social inequality.",
    method: "word-form",
    paraphrases: [
      "Crime frequently has its roots in socioeconomic inequality.",
      "Social inequalities are often cited as a primary determinant of criminal activity.",
    ],
    explanation:
      "'Criminal behaviour' (adjective+noun) → 'crime' (simple noun) or 'criminal activity' (varied collocation). 'Can be attributed to' (passive attribution) → 'has its roots in' or 'are often cited as a primary determinant of' (different attribution collocations). 'Social inequality' → 'socioeconomic inequality' (more precise adjective).",
  },

  // restructure (para-39 to para-42)
  {
    id: "para-39",
    original: "While some argue that technology benefits education, others disagree.",
    method: "restructure",
    paraphrases: [
      "The extent to which technology enhances educational outcomes remains a contested issue.",
      "Opinions are divided regarding whether technological integration in education is beneficial.",
    ],
    explanation:
      "The 'while some…others disagree' contrastive structure is replaced with a nominalised statement of debate ('remains a contested issue') or an impersonal opinion-framing construction ('opinions are divided regarding'). The meaning is preserved in a more analytical, impersonal register.",
  },
  {
    id: "para-40",
    original: "Governments should prioritise healthcare over military spending.",
    method: "restructure",
    paraphrases: [
      "Healthcare expenditure warrants greater governmental priority than investment in defence.",
      "The allocation of public funds to healthcare should take precedence over military budgets.",
    ],
    explanation:
      "The subject is shifted from 'governments' (agent) to 'healthcare expenditure' or 'the allocation of public funds' (nominalised process as subject). 'Prioritise X over Y' is restructured as 'X warrants greater priority than Y' or 'X should take precedence over Y' — different grammatical patterns carrying the same meaning.",
  },
  {
    id: "para-41",
    original: "The percentage of people living in poverty has decreased.",
    method: "restructure",
    paraphrases: [
      "There has been a reduction in the proportion of the population experiencing poverty.",
      "Fewer people are now living below the poverty line, as evidenced by declining poverty rates.",
    ],
    explanation:
      "'The percentage of people living in poverty has decreased' (subject+verb) → 'there has been a reduction in the proportion...' (existential 'there' + nominalisation). Alternatively, the sentence can be split to add an evidential clause, adding cohesion and analytical weight.",
  },
  {
    id: "para-42",
    original: "Children who receive a good education are more likely to succeed.",
    method: "restructure",
    paraphrases: [
      "A high-quality education significantly increases an individual's prospects of success.",
      "Educational attainment in childhood is strongly associated with greater success in later life.",
    ],
    explanation:
      "The relative clause ('children who receive') is restructured as a noun phrase subject ('a high-quality education' or 'educational attainment in childhood'). 'Are more likely to succeed' becomes 'increases prospects of success' (verb+noun) or 'is strongly associated with success' (passive attribution collocation).",
  },

  // active-passive (para-43 to para-46)
  {
    id: "para-43",
    original: "Researchers have discovered a link between diet and mental health.",
    method: "active-passive",
    paraphrases: [
      "A link between diet and mental health has been identified by researchers.",
      "The relationship between dietary habits and mental wellbeing has been established through recent research.",
    ],
    explanation:
      "The active construction ('researchers have discovered') is converted to a passive ('has been identified / established'), which shifts the emphasis from the agent (researchers) to the finding itself — appropriate for academic writing where findings take precedence over their discoverers.",
  },
  {
    id: "para-44",
    original: "The local council demolished several historic buildings last year.",
    method: "active-passive",
    paraphrases: [
      "Several historic buildings were demolished by the local council last year.",
      "A number of buildings of historical significance were torn down by local authorities in the preceding year.",
    ],
    explanation:
      "Active ('the local council demolished') → passive ('were demolished by the local council'). In the second variant, the agent is retained ('by local authorities') but the focus shifts to the buildings. Note also the lexical upgrade: 'several historic' → 'a number of buildings of historical significance'.",
  },
  {
    id: "para-45",
    original: "Universities should provide more practical training for students.",
    method: "active-passive",
    paraphrases: [
      "Students should be provided with greater opportunities for practical training by universities.",
      "More extensive practical training ought to be offered to students within higher education institutions.",
    ],
    explanation:
      "Active modal ('universities should provide') → passive modal ('should be provided with / ought to be offered'). The second passive omits the agent entirely, producing an impersonal recommendation appropriate for formal argumentation.",
  },
  {
    id: "para-46",
    original: "Developing countries are rapidly adopting renewable energy.",
    method: "active-passive",
    paraphrases: [
      "Renewable energy is being rapidly adopted by developing nations.",
      "Clean energy technologies are increasingly being embraced across the developing world.",
    ],
    explanation:
      "Active continuous ('are rapidly adopting') → passive continuous ('is being rapidly adopted'). In the second version, 'renewable energy' is further paraphrased as 'clean energy technologies' and the adverb 'rapidly' is replaced with 'increasingly', shifting from pace to trend.",
  },

  // clause-change (para-47 to para-50)
  {
    id: "para-47",
    original: "Because fossil fuels are finite, alternative energy sources must be developed.",
    method: "clause-change",
    paraphrases: [
      "The finite nature of fossil fuels necessitates the development of alternative energy sources.",
      "Given that fossil fuel reserves are limited, the cultivation of renewable alternatives is imperative.",
    ],
    explanation:
      "'Because [subject+verb]' (adverbial clause) → 'the finite nature of...' (nominalised cause as subject) or 'given that...' (concessive/causal participle). The main clause 'must be developed' → 'necessitates the development of' (verb+noun collocation) or 'is imperative' (adjective predicate).",
  },
  {
    id: "para-48",
    original: "If governments fail to act, climate change will become irreversible.",
    method: "clause-change",
    paraphrases: [
      "Without decisive governmental action, climate change risks becoming an irreversible process.",
      "In the absence of meaningful policy intervention, the effects of climate change may prove impossible to reverse.",
    ],
    explanation:
      "'If governments fail to act' (conditional clause) → 'without decisive governmental action' (prepositional phrase) or 'in the absence of meaningful policy intervention' (prepositional noun phrase). The conditional clause is restructured as a negative condition noun phrase — a more formal academic pattern.",
  },
  {
    id: "para-49",
    original: "Although crime rates have fallen, public fear of crime persists.",
    method: "clause-change",
    paraphrases: [
      "Despite a reduction in crime rates, public anxiety about personal safety remains high.",
      "Notwithstanding declining crime statistics, widespread fear of criminal activity continues to pervade society.",
    ],
    explanation:
      "'Although [clause], [clause]' → 'despite + noun phrase, [clause]' (concessive preposition + nominalisation). 'Crime rates have fallen' → 'a reduction in crime rates' (nominalisation). 'Public fear of crime' → 'public anxiety about personal safety / fear of criminal activity'. 'Notwithstanding' is a formal alternative to 'despite'.",
  },
  {
    id: "para-50",
    original: "As technology advances, many traditional jobs are disappearing.",
    method: "clause-change",
    paraphrases: [
      "With the rapid advancement of technology, numerous traditional occupations are becoming obsolete.",
      "The ongoing pace of technological progress has contributed to the decline of many established industries and job roles.",
    ],
    explanation:
      "'As [clause]' (temporal/causal adverbial) → 'with the rapid advancement of technology' (prepositional noun phrase) or restructured as a main clause subject ('the ongoing pace of technological progress'). 'Are disappearing' → 'are becoming obsolete' (more precise collocation) or 'has contributed to the decline of' (causal noun phrase collocation).",
  },
];
