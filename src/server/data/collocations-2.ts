import type { CollocationSet } from "../../shared/schemas/collocation.schema.js";

const health: CollocationSet = {
  topic: "Health",
  description: "Physical and mental health, healthcare systems, and public health policy",
  collocations: [
    {
      phrase: "stay healthy",
      meaning: "maintain good physical and mental condition",
      example: "People are more informed than ever about how to stay healthy through diet and exercise.",
      bandLevel: "6",
    },
    {
      phrase: "sedentary lifestyle",
      meaning: "a way of life involving little physical activity",
      example: "A sedentary lifestyle has been directly linked to rising rates of obesity and cardiovascular disease.",
      bandLevel: "7",
    },
    {
      phrase: "preventive healthcare",
      meaning: "medical care aimed at preventing illness rather than treating it",
      example: "Investment in preventive healthcare reduces long-term costs on national health systems.",
      bandLevel: "7",
    },
    {
      phrase: "mental well-being",
      meaning: "a state of positive psychological health and emotional balance",
      example: "Employers have a duty of care to support the mental well-being of their workforce.",
      bandLevel: "7",
    },
    {
      phrase: "balanced diet",
      meaning: "eating a variety of foods in the correct proportions to maintain good health",
      example: "Nutritionists emphasise that a balanced diet is more effective than any single supplement.",
      bandLevel: "7",
    },
    {
      phrase: "healthcare system",
      meaning: "the organised provision of medical services within a country",
      example: "An ageing population places significant strain on any healthcare system.",
      bandLevel: "7",
    },
    {
      phrase: "chronic disease",
      meaning: "a long-lasting illness that requires ongoing management",
      example: "The prevalence of chronic disease is rising sharply in both developed and developing nations.",
      bandLevel: "7",
    },
    {
      phrase: "holistic approach to health",
      meaning: "treating the whole person, addressing physical, mental, and social factors",
      example: "A holistic approach to health recognises that social conditions are as significant as biological ones.",
      bandLevel: "8",
    },
    {
      phrase: "alleviate the burden on healthcare systems",
      meaning: "reduce the pressure and demand placed on medical services",
      example: "Encouraging healthier lifestyles is one of the most effective ways to alleviate the burden on healthcare systems.",
      bandLevel: "8",
    },
    {
      phrase: "precipitate a public health crisis",
      meaning: "cause a serious, widespread deterioration in the health of a population",
      example: "Inadequate regulation of processed food could precipitate a public health crisis of significant proportions.",
      bandLevel: "8",
    },
    {
      phrase: "epidemiological evidence",
      meaning: "data from population-level studies on the distribution of disease",
      example: "Epidemiological evidence clearly demonstrates the link between air pollution and respiratory illness.",
      bandLevel: "8",
    },
    {
      phrase: "health disparities",
      meaning: "inequalities in health outcomes between different social or demographic groups",
      example: "Addressing health disparities requires targeted investment in deprived communities.",
      bandLevel: "8",
    },
    {
      phrase: "mental health stigma",
      meaning: "negative social attitudes that discourage people from seeking psychiatric help",
      example: "Reducing mental health stigma is a prerequisite for increasing treatment uptake among young men.",
      bandLevel: "7",
    },
    {
      phrase: "physical inactivity",
      meaning: "insufficient engagement in bodily exercise",
      example: "Physical inactivity is now classified by the WHO as a global pandemic.",
      bandLevel: "7",
    },
    {
      phrase: "universal healthcare",
      meaning: "a system ensuring all citizens have access to medical services without financial hardship",
      example: "Advocates of universal healthcare argue that health is a fundamental human right.",
      bandLevel: "7",
    },
    {
      phrase: "health literacy",
      meaning: "the ability to understand and use health information to make informed decisions",
      example: "Low health literacy prevents many individuals from accessing appropriate medical care.",
      bandLevel: "7",
    },
  ],
};

const urbanization: CollocationSet = {
  topic: "Urbanization",
  description: "City growth, migration, housing, and urban planning",
  collocations: [
    {
      phrase: "move to the city",
      meaning: "relocate from a rural area to an urban centre",
      example: "Millions of people continue to move to the city in search of better economic opportunities.",
      bandLevel: "6",
    },
    {
      phrase: "rural-to-urban migration",
      meaning: "the movement of people from countryside areas to cities",
      example: "Rural-to-urban migration has intensified pressure on housing and public services in major cities.",
      bandLevel: "7",
    },
    {
      phrase: "urban sprawl",
      meaning: "the uncontrolled spread of cities into surrounding rural areas",
      example: "Unchecked urban sprawl has led to the destruction of agricultural land and natural habitats.",
      bandLevel: "7",
    },
    {
      phrase: "affordable housing",
      meaning: "accommodation priced within reach of low- and middle-income residents",
      example: "The shortage of affordable housing in major cities is a crisis that demands urgent policy attention.",
      bandLevel: "7",
    },
    {
      phrase: "public transportation",
      meaning: "shared transport services available to the general population",
      example: "Investing in public transportation is central to reducing urban congestion and carbon emissions.",
      bandLevel: "7",
    },
    {
      phrase: "infrastructure development",
      meaning: "the building or improvement of roads, utilities, and public services",
      example: "Rapid population growth has outpaced infrastructure development in many emerging cities.",
      bandLevel: "7",
    },
    {
      phrase: "strain existing infrastructure",
      meaning: "put excessive pressure on public systems and facilities",
      example: "Mass migration to capital cities continues to strain existing infrastructure beyond its capacity.",
      bandLevel: "8",
    },
    {
      phrase: "exacerbate socioeconomic disparities",
      meaning: "worsen existing inequalities between wealthier and poorer social groups",
      example: "Unplanned urban growth tends to exacerbate socioeconomic disparities between neighbourhoods.",
      bandLevel: "8",
    },
    {
      phrase: "gentrification",
      meaning: "the transformation of a low-income area as wealthier residents move in, often displacing existing communities",
      example: "Critics argue that gentrification, while improving amenities, ultimately displaces long-standing communities.",
      bandLevel: "8",
    },
    {
      phrase: "urban regeneration",
      meaning: "the planned renewal and improvement of deteriorating urban areas",
      example: "Successful urban regeneration schemes combine housing improvements with investment in local employment.",
      bandLevel: "8",
    },
    {
      phrase: "densification",
      meaning: "increasing the density of development in an existing urban area",
      example: "Experts advocate for urban densification as a more sustainable alternative to outward expansion.",
      bandLevel: "8",
    },
    {
      phrase: "social segregation",
      meaning: "the separation of different social or ethnic groups within an urban area",
      example: "Poorly planned housing policy has historically reinforced social segregation in many cities.",
      bandLevel: "8",
    },
    {
      phrase: "urban poverty",
      meaning: "deprivation experienced by people living in city environments",
      example: "Urban poverty concentrations in informal settlements present complex challenges for policymakers.",
      bandLevel: "7",
    },
    {
      phrase: "smart city",
      meaning: "an urban area that uses digital technology to improve services and quality of life",
      example: "Smart city initiatives use data analytics to optimise traffic flow and reduce energy consumption.",
      bandLevel: "7",
    },
    {
      phrase: "overcrowding",
      meaning: "too many people occupying a space, causing poor living conditions",
      example: "Overcrowding in informal urban settlements is a significant public health concern.",
      bandLevel: "7",
    },
    {
      phrase: "land use planning",
      meaning: "the regulation and organisation of how land in an area is used",
      example: "Effective land use planning is essential to balance residential needs with green space preservation.",
      bandLevel: "7",
    },
  ],
};

const crimeLaw: CollocationSet = {
  topic: "Crime and Law",
  description: "Criminal behaviour, justice systems, and law enforcement",
  collocations: [
    {
      phrase: "commit a crime",
      meaning: "carry out an illegal act",
      example: "Research suggests that individuals who commit a crime are more likely to have experienced poverty.",
      bandLevel: "6",
    },
    {
      phrase: "deter criminal behaviour",
      meaning: "discourage people from engaging in illegal acts",
      example: "Stiffer penalties are intended to deter criminal behaviour, though evidence of their effectiveness is mixed.",
      bandLevel: "7",
    },
    {
      phrase: "rehabilitation of offenders",
      meaning: "the process of reforming criminals so they can reintegrate into society",
      example: "The rehabilitation of offenders through education and vocational training reduces reoffending rates.",
      bandLevel: "7",
    },
    {
      phrase: "law enforcement",
      meaning: "the agencies and processes responsible for upholding the law",
      example: "Effective law enforcement requires both adequate funding and community trust.",
      bandLevel: "7",
    },
    {
      phrase: "crime prevention",
      meaning: "strategies designed to reduce the incidence of criminal activity",
      example: "Investment in social programmes is widely regarded as a long-term approach to crime prevention.",
      bandLevel: "7",
    },
    {
      phrase: "criminal justice system",
      meaning: "the network of institutions that enforce the law and administer justice",
      example: "Disparities in outcomes reveal systemic biases embedded within the criminal justice system.",
      bandLevel: "7",
    },
    {
      phrase: "recidivism rates",
      meaning: "the proportion of convicted offenders who reoffend after release",
      example: "Countries that prioritise rehabilitation consistently report lower recidivism rates than those focused on punishment.",
      bandLevel: "8",
    },
    {
      phrase: "punitive measures",
      meaning: "harsh penalties intended to punish rather than reform",
      example: "Critics argue that reliance on punitive measures fails to address the root causes of crime.",
      bandLevel: "8",
    },
    {
      phrase: "restorative justice",
      meaning: "an approach that focuses on reconciliation between offenders and victims",
      example: "Restorative justice programmes have shown promising results in reducing youth reoffending.",
      bandLevel: "8",
    },
    {
      phrase: "socioeconomic determinants of crime",
      meaning: "the economic and social factors that contribute to criminal behaviour",
      example: "Addressing the socioeconomic determinants of crime is more cost-effective than expanding prison capacity.",
      bandLevel: "8",
    },
    {
      phrase: "zero-tolerance policy",
      meaning: "a strict approach that imposes severe penalties for any violation of rules",
      example: "A zero-tolerance policy toward minor offences has been criticised for disproportionately affecting marginalised communities.",
      bandLevel: "7",
    },
    {
      phrase: "organised crime",
      meaning: "coordinated criminal activity carried out by structured groups",
      example: "The proliferation of organised crime undermines both economic stability and public trust in institutions.",
      bandLevel: "7",
    },
    {
      phrase: "judicial independence",
      meaning: "the principle that courts operate free from political interference",
      example: "Judicial independence is a cornerstone of democratic governance and the rule of law.",
      bandLevel: "8",
    },
    {
      phrase: "incarceration rate",
      meaning: "the proportion of the population imprisoned at a given time",
      example: "Nations with the highest incarceration rates do not necessarily have the lowest crime rates.",
      bandLevel: "7",
    },
    {
      phrase: "white-collar crime",
      meaning: "financially motivated non-violent crime committed by professionals",
      example: "White-collar crime, though less visible, can cause considerable economic and social harm.",
      bandLevel: "7",
    },
  ],
};

export const collocationsPart2: CollocationSet[] = [health, urbanization, crimeLaw];
