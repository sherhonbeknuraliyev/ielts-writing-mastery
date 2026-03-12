---
name: agent-workflow-designer
description: Patterns for designing multi-agent AI workflows in TypeScript. Use when building orchestration systems, LLM pipelines, or automating complex tasks with multiple Claude agents using the Anthropic SDK.
---

# Multi-Agent Workflow Designer

## Setup

```ts
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic(); // uses ANTHROPIC_API_KEY env var
```

---

## Pattern 1: Sequential Pipeline

Agents chained — output of one feeds the next.

```ts
async function sequentialPipeline(input: string): Promise<string> {
  const stages = [
    { role: "researcher", prompt: `Research this topic: ${input}` },
    { role: "writer",     prompt: "Write a summary of the research above" },
    { role: "editor",     prompt: "Edit for clarity and conciseness" },
  ];

  let context = "";
  for (const stage of stages) {
    const res = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1024,
      messages: [{ role: "user", content: `${stage.prompt}\n\nContext:\n${context}` }],
    });
    context = res.content[0].type === "text" ? res.content[0].text : "";
  }
  return context;
}
```

**When to use:** Tasks with a clear order of operations where each step needs the previous output.

---

## Pattern 2: Parallel Fan-out / Fan-in

Spawn multiple agents concurrently, then aggregate results.

```ts
async function parallelFanOut(query: string): Promise<string> {
  const specialists = ["legal", "technical", "financial"];

  const results = await Promise.allSettled(
    specialists.map((domain) =>
      client.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 512,
        messages: [{ role: "user", content: `Analyze from a ${domain} perspective: ${query}` }],
      })
    )
  );

  const outputs = results
    .filter((r): r is PromiseFulfilledResult<Anthropic.Message> => r.status === "fulfilled")
    .map((r, i) => {
      const text = r.value.content[0].type === "text" ? r.value.content[0].text : "";
      return `[${specialists[i]}]: ${text}`;
    })
    .join("\n\n");

  // Fan-in: synthesize
  const synthesis = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    messages: [{ role: "user", content: `Synthesize these expert analyses:\n\n${outputs}` }],
  });

  return synthesis.content[0].type === "text" ? synthesis.content[0].text : "";
}
```

**When to use:** Independent subtasks that can run concurrently; reduces total latency.

---

## Pattern 3: Hierarchical Delegation (Orchestrator + Specialists)

Orchestrator breaks down tasks and delegates to specialist agents.

```ts
type Task = { domain: string; prompt: string };

async function orchestrate(goal: string): Promise<string> {
  // Step 1: Orchestrator plans
  const plan = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 512,
    messages: [{
      role: "user",
      content: `Break this goal into 2-3 specialist tasks (JSON array of {domain, prompt}): ${goal}`,
    }],
  });

  const planText = plan.content[0].type === "text" ? plan.content[0].text : "[]";
  const tasks: Task[] = JSON.parse(planText.match(/\[[\s\S]*\]/)?.[0] ?? "[]");

  // Step 2: Delegate in parallel
  const outputs = await Promise.allSettled(
    tasks.map((t) =>
      client.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 512,
        messages: [{ role: "user", content: t.prompt }],
      })
    )
  );

  const results = outputs
    .filter((r): r is PromiseFulfilledResult<Anthropic.Message> => r.status === "fulfilled")
    .map((r, i) => `[${tasks[i]?.domain}]: ${r.value.content[0].type === "text" ? r.value.content[0].text : ""}`)
    .join("\n\n");

  // Step 3: Orchestrator synthesizes
  const final = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 1024,
    messages: [{ role: "user", content: `Combine specialist results into a final answer:\n\n${results}` }],
  });

  return final.content[0].type === "text" ? final.content[0].text : "";
}
```

---

## Pattern 4: Handoff Protocol

Structured context object passed between agents to preserve state.

```ts
interface AgentHandoff {
  task: string;
  completedSteps: string[];
  artifacts: Record<string, string>;
  nextAgent: string;
  metadata: { startedAt: string; tokensUsed: number };
}

async function handoff(ctx: AgentHandoff): Promise<AgentHandoff> {
  const res = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    system: `You are the ${ctx.nextAgent} agent. Pick up where the previous agent left off.`,
    messages: [{
      role: "user",
      content: `Task: ${ctx.task}\nCompleted: ${ctx.completedSteps.join(", ")}\nArtifacts: ${JSON.stringify(ctx.artifacts)}`,
    }],
  });

  const output = res.content[0].type === "text" ? res.content[0].text : "";
  return {
    ...ctx,
    completedSteps: [...ctx.completedSteps, ctx.nextAgent],
    artifacts: { ...ctx.artifacts, [ctx.nextAgent]: output },
    metadata: { ...ctx.metadata, tokensUsed: ctx.metadata.tokensUsed + (res.usage?.output_tokens ?? 0) },
  };
}
```

---

## Pattern 5: Error Recovery with Retry + Model Fallback

```ts
const MODEL_FALLBACK = ["claude-opus-4-5", "claude-sonnet-4-5", "claude-haiku-4-5"];

async function withFallback(
  prompt: string,
  maxRetries = 2
): Promise<string> {
  for (const model of MODEL_FALLBACK) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const res = await client.messages.create({
          model,
          max_tokens: 1024,
          messages: [{ role: "user", content: prompt }],
        });
        return res.content[0].type === "text" ? res.content[0].text : "";
      } catch (err: unknown) {
        const isOverload = err instanceof Anthropic.APIError && err.status === 529;
        if (!isOverload || attempt === maxRetries) break;
        await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt)); // exponential backoff
      }
    }
  }
  throw new Error("All models and retries exhausted");
}
```

---

## Pattern 6: Context Window Budgeting

Prevent context overflow in long-running pipelines.

```ts
const MODEL_CONTEXT_LIMITS: Record<string, number> = {
  "claude-opus-4-5":   200_000,
  "claude-sonnet-4-5": 200_000,
  "claude-haiku-4-5":  200_000,
};

// Rough estimate: 1 token ≈ 4 chars
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function trimTobudget(history: string[], model: string, reserveForOutput = 2048): string[] {
  const limit = (MODEL_CONTEXT_LIMITS[model] ?? 100_000) - reserveForOutput;
  const trimmed: string[] = [];
  let total = 0;

  for (const entry of [...history].reverse()) {
    const tokens = estimateTokens(entry);
    if (total + tokens > limit) break;
    trimmed.unshift(entry);
    total += tokens;
  }

  return trimmed;
}
```

---

## Cost Optimization

| Strategy               | Savings | Trade-off              |
|------------------------|---------|------------------------|
| Haiku for drafts/recon | ~20x    | Lower quality drafts   |
| Sonnet for main work   | ~5x     | vs Opus                |
| Opus only for planning | Minimal | Highest reasoning      |
| Parallel over serial   | Latency | Same cost              |
| Cache system prompts   | ~90%    | Static prompts only    |
| Trim history aggressively | Varies | May lose context    |

```ts
// Prompt caching for repeated system prompts
const res = await client.messages.create({
  model: "claude-sonnet-4-5",
  max_tokens: 1024,
  system: [{
    type: "text",
    text: "You are a specialist agent. Long static instructions here...",
    cache_control: { type: "ephemeral" }, // cache this block
  }],
  messages: [{ role: "user", content: prompt }],
});
```

---

## Pattern Selection Decision Tree

```
Is the task decomposable into independent subtasks?
├── YES → Can subtasks run at the same time?
│         ├── YES → Parallel Fan-out / Fan-in
│         └── NO  → Sequential Pipeline
└── NO  → Does it require multiple expertise domains?
          ├── YES → Hierarchical Delegation (Orchestrator)
          └── NO  → Single agent is sufficient
```

If the task spans multiple turns with shared state: use **Handoff Protocol**.
If reliability matters more than speed: add **Error Recovery with Fallback**.

---

## Common Pitfalls

**Context bloat** — Passing full history between agents inflates cost. Trim to relevant artifacts only.

**Tight coupling** — Avoid agents that depend on exact output format of another. Use JSON for structured handoffs, not free text.

**Silent failures** — `Promise.allSettled` won't throw on partial failures. Always check `.status === "fulfilled"` before using results.

**Model mismatch** — Using Opus for every agent is wasteful. Reserve it for planning/synthesis; use Haiku for recon and drafts.

**Infinite retry loops** — Cap retries. Network errors and 529s are transient; 400s (bad input) will never recover.

**Missing system prompts** — Each agent should have a focused system prompt scoped to its role. Without it, agents behave as generalists.
