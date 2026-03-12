import type { ParaphraseDrill } from "../../shared/schemas/collocation.schema.js";

export const paraphrasePart2: ParaphraseDrill[] = [
  // restructure (continued: para-16 to para-18)
  {
    id: "para-16",
    original: "While some people prefer living in cities, others choose rural areas.",
    method: "restructure",
    paraphrases: [
      "People's residential preferences are divided between urban and rural settings.",
      "Urban and rural living each attract different segments of the population.",
    ],
    explanation:
      "The contrastive 'while…others' structure is replaced with a summary noun phrase or a balanced subject. This avoids informal hedging and produces a more analytical tone appropriate for IELTS.",
  },
  {
    id: "para-17",
    original: "When people exercise regularly, their health improves considerably.",
    method: "restructure",
    paraphrases: [
      "Regular exercise leads to a considerable improvement in personal health.",
      "Health improves considerably as a consequence of regular physical activity.",
    ],
    explanation:
      "The temporal 'when' clause is replaced with a causal noun phrase or a 'as a consequence of' construction. The meaning is preserved while the grammatical structure is varied.",
  },
  {
    id: "para-18",
    original: "The population is growing rapidly, so governments must build more housing.",
    method: "restructure",
    paraphrases: [
      "Rapid population growth necessitates an increase in governmental housing provision.",
      "Given the rapid growth of the population, governments are obligated to expand housing supply.",
    ],
    explanation:
      "The additive 'so' is replaced with 'necessitates' (verb expressing result) or 'given + noun phrase' (participial construction). Both avoid coordinator overuse, a common weakness at band 6.",
  },

  // active-passive (6 drills: para-19 to para-24)
  {
    id: "para-19",
    original: "The government has implemented new environmental regulations.",
    method: "active-passive",
    paraphrases: [
      "New environmental regulations have been implemented by the government.",
      "New environmental regulations have been introduced at the governmental level.",
    ],
    explanation:
      "Active → passive: 'the government has implemented' → 'have been implemented by the government'. The third paraphrase omits the agent entirely, appropriate when the focus is on the regulations rather than the actor.",
  },
  {
    id: "para-20",
    original: "Researchers have conducted extensive studies on the effects of social media.",
    method: "active-passive",
    paraphrases: [
      "Extensive studies on the effects of social media have been conducted by researchers.",
      "The effects of social media have been extensively studied.",
    ],
    explanation:
      "Active → passive: 'researchers have conducted' → 'have been conducted'. When the agent ('researchers') is non-specific, omitting it in the passive creates a more objective, academic tone.",
  },
  {
    id: "para-21",
    original: "Factories release large quantities of carbon dioxide into the atmosphere.",
    method: "active-passive",
    paraphrases: [
      "Large quantities of carbon dioxide are released into the atmosphere by factories.",
      "Substantial amounts of carbon dioxide are emitted into the atmosphere through industrial processes.",
    ],
    explanation:
      "Active → passive: 'factories release' → 'are released by factories'. The second paraphrase also substitutes 'emitted' and 'industrial processes', combining passive transformation with synonymy.",
  },
  {
    id: "para-22",
    original: "Critics have questioned the effectiveness of the new policy.",
    method: "active-passive",
    paraphrases: [
      "The effectiveness of the new policy has been questioned by critics.",
      "The new policy's effectiveness has been subjected to considerable scrutiny.",
    ],
    explanation:
      "Active → passive: 'critics have questioned' → 'has been questioned by critics'. The second paraphrase uses 'subjected to scrutiny', a more sophisticated passive construction appropriate for band 7+.",
  },
  {
    id: "para-23",
    original: "Authorities must address the growing problem of homelessness.",
    method: "active-passive",
    paraphrases: [
      "The growing problem of homelessness must be addressed by the authorities.",
      "The escalating issue of homelessness is required to be tackled at an official level.",
    ],
    explanation:
      "Active modal → passive modal: 'authorities must address' → 'must be addressed by the authorities'. Passive constructions with modal verbs are common in formal academic writing.",
  },
  {
    id: "para-24",
    original: "Parents should encourage their children to read books.",
    method: "active-passive",
    paraphrases: [
      "Children should be encouraged by their parents to read books.",
      "The reading of books ought to be actively encouraged among children by parents.",
    ],
    explanation:
      "Active → passive: 'parents should encourage' → 'should be encouraged by parents'. The passive voice shifts focus from the agent (parents) to the recipient (children), which can be stylistically effective depending on emphasis.",
  },

  // clause-change (6 drills: para-25 to para-30)
  {
    id: "para-25",
    original: "Because the population is ageing, healthcare costs are rising.",
    method: "clause-change",
    paraphrases: [
      "The ageing population has led to rising healthcare costs.",
      "Due to the ageing of the population, healthcare expenditure has increased considerably.",
    ],
    explanation:
      "The adverbial clause of reason ('because…') is converted to a noun phrase ('the ageing population') functioning as the subject, or a prepositional phrase ('due to…'). This is a fundamental paraphrasing technique.",
  },
  {
    id: "para-26",
    original: "Since the internet became widespread, access to information has improved dramatically.",
    method: "clause-change",
    paraphrases: [
      "The widespread adoption of the internet has dramatically improved access to information.",
      "The advent of widespread internet access has been accompanied by a dramatic improvement in information availability.",
    ],
    explanation:
      "The temporal 'since' clause is converted into a noun phrase ('the widespread adoption of the internet') as the grammatical subject. This removes the subordinate clause and creates a single, complex noun phrase.",
  },
  {
    id: "para-27",
    original: "Although some argue that private schools provide better education, state schools serve the majority.",
    method: "clause-change",
    paraphrases: [
      "Despite claims that private schools offer superior education, state schools remain the primary provider for most students.",
      "The assertion that private schools deliver better outcomes notwithstanding, the majority of students rely on state provision.",
    ],
    explanation:
      "'Although some argue' (concessive clause) → 'despite claims that' (prepositional phrase) or 'the assertion that…notwithstanding' (absolute construction). These produce a more sophisticated register.",
  },
  {
    id: "para-28",
    original: "If more women entered the workforce, gender pay gaps would narrow.",
    method: "clause-change",
    paraphrases: [
      "Greater female participation in the workforce would contribute to a narrowing of the gender pay gap.",
      "Increased entry of women into the labour market is associated with a reduction in pay disparities between genders.",
    ],
    explanation:
      "The conditional clause ('if…would') is converted to a noun phrase ('greater female participation') as subject. This removes the conditional entirely and reframes the relationship as factual or associative.",
  },
  {
    id: "para-29",
    original: "Even though online learning is convenient, it lacks face-to-face interaction.",
    method: "clause-change",
    paraphrases: [
      "Online learning, despite its convenience, is deficient in opportunities for face-to-face interaction.",
      "The convenience of online learning is offset by its lack of direct interpersonal engagement.",
    ],
    explanation:
      "'Even though' (concessive clause) → 'despite its convenience' (prepositional phrase) or 'is offset by' (main clause expressing contrast). Both maintain the concessive relationship using more varied syntax.",
  },
  {
    id: "para-30",
    original: "When children are exposed to violence in the media, they may develop aggressive behaviour.",
    method: "clause-change",
    paraphrases: [
      "Exposure to media violence in childhood may lead to the development of aggressive behaviour.",
      "Media violence to which children are exposed has been linked to the emergence of aggressive tendencies.",
    ],
    explanation:
      "The temporal 'when' clause is converted to a noun phrase ('exposure to media violence'). The second paraphrase uses a relative clause ('to which children are exposed'), demonstrating command of complex sentence structures valued at band 7+.",
  },
];
