---
name: agent-designer
description: Architecture and design reference for multi-agent AI systems. Use when designing agent topologies, defining roles, choosing communication strategies, setting up guardrails, or planning evaluation frameworks. For implementation code, use agent-workflow-designer instead.
---

# Multi-Agent System Architecture Design

## Architecture Patterns

| Pattern | Structure | Best For | Avoid When |
|---|---|---|---|
| **Single Agent** | One agent, one task | Simple tasks, clear scope | Complex multi-step work |
| **Pipeline** | A → B → C (serial) | Sequential dependencies, ordered transforms | Independent subtasks (parallelism wasted) |
| **Supervisor** | Orchestrator → N workers | Dynamic task assignment, retry routing | All tasks are identical |
| **Swarm** | Agents coordinate peer-to-peer | Emergent behavior, competitive approaches | Determinism required |
| **Hierarchical** | Orchestrator → sub-orchestrators → workers | Large-scale decomposition, domain separation | Simple 2-layer problems |
| **Parallel Fan-out** | One router → N agents → aggregator | Independent subtasks, latency-sensitive | Tasks with shared mutable state |

**Decision heuristic:** Start with Pipeline. Promote to Supervisor when task decomposition is dynamic. Add hierarchy only when a single orchestrator's context would overflow.

---

## Agent Role Definition Framework

Every agent should be defined across five dimensions:

| Dimension | Questions to Answer |
|---|---|
| **Identity** | What is this agent's name and persona? What model tier fits its reasoning needs? |
| **Responsibilities** | What is the ONE primary job? What is explicitly out of scope? |
| **Capabilities** | Which tools can it call? What APIs can it access? |
| **Interfaces** | What input schema does it accept? What output schema does it produce? |
| **Constraints** | Token budget, time limit, retry policy, escalation path |

Keep each agent's responsibility surface small. An agent that does "everything" is a single agent, not a system.

---

## Common Agent Archetypes

| Archetype | Role | Model Tier | Key Trait |
|---|---|---|---|
| **Coordinator** | Plans, delegates, synthesizes | Opus | Sees the whole task; never does leaf work |
| **Specialist** | Deep domain work (legal, code, finance) | Sonnet | Narrow focus, high quality output |
| **Interface** | Formats output for users/APIs | Haiku | Lightweight, deterministic transforms |
| **Monitor** | Validates outputs, detects violations | Sonnet | Skeptical; has override authority |
| **Memory** | Retrieves/stores context across turns | Haiku | Fast lookup, no generation needed |
| **Router** | Classifies input, selects agent path | Haiku | Low-latency decision only |

---

## Tool Design Principles

Good tools are the connective tissue of any agent system.

**Schema design**
- Flat input schemas over deeply nested objects — agents parse them more reliably
- Use enums for constrained fields; free text only where truly open-ended
- Include a `dry_run` flag on any tool with side effects

**Error contracts**
- Return structured errors (`{ error: string, code: string }`) not exceptions
- Include a `retryable` boolean so agents can decide without reasoning about error types
- Never return empty success — always confirm what was done

**Idempotency**
- Every write tool must be safe to call twice with the same arguments
- Use client-supplied IDs (not server-generated) to enable idempotent retries
- Log tool calls with enough context to replay them manually

---

## Communication Patterns

| Pattern | Mechanism | Consistency | Latency |
|---|---|---|---|
| **Message Passing** | Agent returns output; next agent receives it as input | Strong (explicit handoff) | Adds a round-trip |
| **Shared State** | Agents read/write a common context object | Requires locking | Low (no round-trip) |
| **Event-Driven** | Agents emit events; others subscribe | Eventual | Asynchronous |
| **Blackboard** | Central data store all agents read from | Requires coordinator | Medium |

For most systems: use **Message Passing** for correctness, add **Shared State** only for read-heavy context (e.g., a working memory store agents query but rarely write).

---

## Guardrails & Safety

**Input validation layer** (before any agent runs)
- Schema validation: reject malformed inputs immediately
- Scope check: does the request match declared system purpose?
- Rate limiting: per-user and per-agent caps

**Output filtering layer** (before returning to user or next agent)
- Content policy check on generated text
- Structured output validation: does it match the expected schema?
- Confidence threshold: if below threshold, route to human review

**Human-in-the-loop triggers**
- Any irreversible action (delete, publish, send)
- Output confidence below defined threshold
- Agent requests a capability outside its declared tool set
- Two consecutive failures on same task

**Escalation ladder:** Retry → Fallback model → Human review → Fail closed (never silently succeed)

---

## Memory Patterns

| Type | Scope | Storage | Use For |
|---|---|---|---|
| **Short-term** | Single session | In-memory / context window | Current task state, recent turns |
| **Long-term** | Across sessions | Vector DB or key-value store | User preferences, domain knowledge |
| **Shared** | Across agents in one run | Shared context object or DB | Intermediate artifacts, coordination state |
| **Episodic** | Retrievable past runs | Structured log + retrieval index | Learning from prior task outcomes |

Key rule: short-term memory lives in the context window; evict aggressively. Long-term memory is retrieved, not passed whole — always chunk and embed, never dump entire history into prompt.

---

## Evaluation Framework

Track these metrics per agent and per system:

| Metric | What to Measure | Target |
|---|---|---|
| **Task success rate** | % of tasks completed without human intervention | >95% for production |
| **Output quality** | Automated rubric score or human eval sample | Define per use case |
| **Cost per task** | Total token spend / completed tasks | Benchmark at design time |
| **P95 latency** | End-to-end wall clock time | Define per SLA |
| **Fallback rate** | % of calls that hit retry/fallback | <5% steady state |
| **Tool error rate** | % of tool calls that return errors | <2% |
| **Context utilization** | Avg tokens used / model context limit | <60% (headroom for retries) |

Run evals on a fixed golden dataset before deploying changes to orchestration logic.

---

## Architecture Decision Process

Work through these in order before writing any code:

- [ ] What is the single goal of this system? Write it in one sentence.
- [ ] Can a single agent accomplish it? If yes, stop — don't build a system.
- [ ] What are the natural subtasks? Can they run in parallel or must they be sequential?
- [ ] Which subtasks require deep reasoning vs. simple transforms? Assign model tiers accordingly.
- [ ] What tools does each agent need? Are those tools idempotent and schema-defined?
- [ ] How do agents hand off state? Define the interface (schema) before building agents.
- [ ] What can go wrong at each step? Define fallback and escalation for each failure mode.
- [ ] Where must a human approve before proceeding? Mark these as explicit checkpoints.
- [ ] How will you know if the system is working? Define at least one measurable success metric.
- [ ] What is the cost estimate per task at expected volume? Is it acceptable?

---

## Common Pitfalls

**Over-engineering** — More agents = more failure points. Add an agent only when a single agent demonstrably cannot do the job.

**Implicit interfaces** — Agents passing free text instead of structured schemas. One format change breaks the whole pipeline silently.

**Missing failure budgets** — No retry cap, no circuit breaker. One slow tool call blocks the whole system indefinitely.

**Context accumulation** — Passing full history into every agent. Cost and latency grow linearly; trim to artifacts only.

**Role ambiguity** — Two agents with overlapping responsibilities producing conflicting outputs. Each agent must have exactly one owner of each decision.

**No evaluation baseline** — Shipping without a golden dataset means you cannot detect regressions after changes.

**Premature parallelism** — Parallelizing tasks that share mutable state causes race conditions. Serialize first; parallelize only proven-independent tasks.
