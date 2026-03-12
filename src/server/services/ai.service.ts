const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "";
const MODEL = "deepseek-chat";

async function callDeepSeek(messages: { role: string; content: string }[], temperature = 0.3) {
  const res = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({ model: MODEL, messages, temperature, max_tokens: 2000 }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DeepSeek API error: ${res.status} ${err}`);
  }
  const data = await res.json() as { choices: { message: { content: string } }[] };
  return data.choices[0]?.message?.content ?? "";
}

export const aiService = {
  async evaluateEssay(params: {
    taskType: string;
    prompt: string;
    essay: string;
  }) {
    const systemPrompt = `You are an expert IELTS examiner. Evaluate the following IELTS ${params.taskType === "task2" ? "Task 2 essay" : "Task 1 report"} strictly according to the official IELTS band descriptors.

Return your evaluation as a JSON object with this EXACT structure (no markdown, just valid JSON):
{
  "taskAchievement": <number 0-9, can use 0.5>,
  "coherenceCohesion": <number 0-9, can use 0.5>,
  "lexicalResource": <number 0-9, can use 0.5>,
  "grammaticalRange": <number 0-9, can use 0.5>,
  "overallBand": <number 0-9, can use 0.5>,
  "errors": [{"original": "<exact text with error>", "corrected": "<corrected version>", "explanation": "<brief explanation>"}],
  "vocabularySuggestions": [{"original": "<basic phrase used>", "upgraded": "<band 7-8 alternative>"}],
  "tips": ["<specific improvement tip 1>", "<tip 2>", "<tip 3>"],
  "summary": "<2-3 sentence overall assessment>"
}

Be strict but fair. A typical student at 6.5 level should get scores reflecting areas for improvement to reach 7.5.
Limit errors to the 5 most important ones. Limit vocabulary suggestions to 5. Give exactly 3 tips.`;

    const userMessage = `Task prompt: ${params.prompt}\n\nStudent's essay:\n${params.essay}`;
    const response = await callDeepSeek([
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ], 0.2);

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in response");
      return JSON.parse(jsonMatch[0]);
    } catch {
      throw new Error("Failed to parse AI feedback");
    }
  },

  async validateExercise(params: {
    exerciseType: string;
    question: string;
    modelAnswer: string;
    userAnswer: string;
  }) {
    const systemPrompt = `You are an IELTS writing expert. A student is doing a "${params.exerciseType}" exercise. Evaluate their answer.

IMPORTANT RULES:
- Compare the student's answer to the MODEL ANSWER, not the original question.
- The "improvedVersion" must be an IMPROVED version of the STUDENT'S answer — keep their style and intent but fix errors and improve quality. Do NOT just copy the original question or the model answer.
- Be encouraging but honest. Explain specifically what the student did well and what needs work.
- For transform/rewrite exercises: the student should change the sentence structure, not just the words.

Return a JSON object with this EXACT structure (no markdown, just valid JSON):
{
  "isCorrect": <boolean — true if the student captured the core meaning with acceptable grammar>,
  "score": <number 0-10>,
  "feedback": "<specific feedback: what's good, what errors exist, what could be better>",
  "improvedVersion": "<take the STUDENT'S answer and fix/improve it — keep their approach but make it band 7-8 quality. Must be DIFFERENT from both the original question and the model answer.>"
}`;

    const userMessage = `Original question/sentence: ${params.question}\nModel answer (ideal): ${params.modelAnswer}\nStudent's answer (evaluate this): ${params.userAnswer}`;
    const response = await callDeepSeek([
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ], 0.2);

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found");
      return JSON.parse(jsonMatch[0]);
    } catch {
      throw new Error("Failed to parse AI validation");
    }
  },
};
