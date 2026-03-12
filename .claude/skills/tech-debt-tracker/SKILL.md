---
name: tech-debt-tracker
description: Track and manage technical debt in this project. Use when auditing code quality, planning refactoring sprints, or when asked about technical debt, code smells, or areas that need improvement.
---

# Tech Debt Tracker

## How to Audit

### 1. File Size Violations
```bash
# Find files over 300 lines (our limit)
find src/ -name "*.ts" -o -name "*.tsx" | xargs wc -l | sort -rn | awk '$1 > 300'
```
**Fix:** Split using patterns in the `project-conventions` skill.

### 2. Type Safety Issues
```bash
npm run typecheck 2>&1 | head -50
```
Look for:
- `any` types — replace with specific types or `unknown`
- Missing return types on exported functions
- Implicit `any` from untyped dependencies

### 3. Code Smells in This Stack

| Smell | Where to Look | Fix |
|-------|--------------|-----|
| Business logic in routers | `src/server/routers/*.ts` | Move to services |
| Manual type definitions | `src/shared/`, `src/client/` | Derive from Zod with `z.infer` |
| Inline styles in React Native | `src/mobile/src/**/*.tsx` | Use `StyleSheet.create()` |
| Raw fetch instead of tRPC | `src/client/**/*.tsx` | Use `trpc.*.useQuery()` |
| Mongoose docs in API responses | `src/server/services/*.ts` | Use `.lean()`, return plain objects |
| No pagination on list queries | `src/server/services/*.ts` | Use `paginationSchema` |
| Catch-all error handling | Anywhere | Use specific `TRPCError` codes |
| Barrel export bloat | `*/index.ts` | Only re-export what's needed |

### 4. Dependency Health
```bash
npm outdated                    # Check for updates
npm audit                       # Security vulnerabilities
npx depcheck                    # Unused dependencies
```

### 5. Test Coverage Gaps
```bash
npm run test -- --coverage      # Identify untested code
```
Priority: test services first (business logic), then routers (integration).

## Debt Classification

| Priority | Type | Example |
|----------|------|---------|
| P0 — Now | Security | Unvalidated input, exposed secrets |
| P1 — This Sprint | Correctness | Missing error handling, data loss risk |
| P2 — Next Sprint | Maintainability | Files over 300 lines, duplicated logic |
| P3 — Backlog | Optimization | Missing indexes, unnecessary re-renders |

## Tracking Format
Add `// TECH-DEBT:` comments for inline tracking:
```ts
// TECH-DEBT: P2 — Extract pagination logic into shared utility
// TECH-DEBT: P3 — Add compound index for (userId, createdAt)
```

Search all debt:
```bash
grep -rn "TECH-DEBT" src/
```
