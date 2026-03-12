---
name: product-manager
description: Product management toolkit for startup founders. Use when creating PRDs, prioritizing features, writing user stories, planning sprints, or making product decisions. Covers RICE prioritization, customer discovery, and roadmapping.
---

# Product Manager

## Feature Prioritization (RICE)

Score every feature request before building:

| Factor | Question | Scale |
|--------|----------|-------|
| **Reach** | How many users will this affect per quarter? | Number |
| **Impact** | How much will it move the needle? | 0.25 / 0.5 / 1 / 2 / 3 |
| **Confidence** | How sure are we about reach and impact? | 50% / 80% / 100% |
| **Effort** | How many person-weeks? | Number |

**RICE Score = (Reach × Impact × Confidence) / Effort**

Sort by score. Build top items first. Re-score quarterly.

## PRD Template (Keep it short)

```markdown
# Feature: [Name]

## Problem
What user pain does this solve? Who has this problem?

## Solution
What are we building? (2-3 sentences max)

## Success Metrics
- Primary: [metric that proves this worked]
- Secondary: [supporting metric]

## Scope
### In Scope
- [feature 1]
- [feature 2]

### Out of Scope
- [not doing this]

## Technical Notes
- API changes needed
- Database schema changes
- Third-party integrations

## Timeline
- [ ] Schema + API — Week 1
- [ ] Frontend — Week 2
- [ ] Testing + Launch — Week 3
```

## User Story Format
```
As a [user type],
I want to [action],
so that [benefit].

Acceptance Criteria:
- [ ] Given [context], when [action], then [result]
- [ ] Given [context], when [action], then [result]
```

## Sprint Planning
1. Pick top RICE-scored items that fit in 2 weeks
2. Break into tasks (each < 1 day)
3. Assign to `/add-feature`, `/add-page`, or `/add-schema` commands
4. Daily: check progress, unblock

## Customer Discovery Questions
- "What's the hardest part about [problem area]?"
- "Tell me about the last time you [relevant activity]..."
- "What do you currently use to solve this?"
- "If you could wave a magic wand, what would change?"
- Never ask: "Would you use X?" (they'll say yes and not mean it)
