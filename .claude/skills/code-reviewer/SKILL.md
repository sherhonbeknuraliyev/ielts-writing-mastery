---
name: code-reviewer
description: Automated code review for this fullstack project. Use when reviewing PRs, checking code quality, or when asked to review changes. Covers type safety, security, performance, and project conventions for Express + tRPC + MongoDB + React + React Native.
---

# Code Reviewer

## Review Checklist

### 1. Type Safety (Critical)
- [ ] Types inferred from Zod schemas, not manually defined
- [ ] `import type` used for type-only imports
- [ ] No `any` types (use `unknown` if truly needed)
- [ ] tRPC procedures use shared Zod schemas for input validation
- [ ] No type assertions (`as`) unless justified with comment

### 2. Architecture
- [ ] Business logic in services, NOT in routers or components
- [ ] Routers are thin: validate input → call service → return
- [ ] New feature follows: schema → model → service → router → page
- [ ] Shared types in `src/shared/`, not duplicated across client/server
- [ ] Services return plain objects, not Mongoose documents

### 3. File Organization
- [ ] Every file under 300 lines
- [ ] One component/service/model per file
- [ ] Named exports only (no `export default`)
- [ ] `.js` extensions in import paths
- [ ] Correct directory: components/, pages/, hooks/, services/, routers/

### 4. Security
- [ ] No secrets hardcoded (check for API keys, passwords)
- [ ] Passwords excluded from API responses (`.select("-password")`)
- [ ] User input validated via Zod schemas through tRPC
- [ ] Protected routes use `protectedProcedure` or `adminProcedure`
- [ ] No SQL/NoSQL injection vectors (use Mongoose parameterized queries)
- [ ] CORS configured appropriately

### 5. Performance
- [ ] Mongoose `.lean()` on read queries
- [ ] `Promise.all()` for independent parallel queries
- [ ] Pagination on list endpoints
- [ ] No N+1 query patterns in services
- [ ] React: no object/array literals in JSX props
- [ ] React Native: `FlatList` instead of `ScrollView` + `.map()`

### 6. Error Handling
- [ ] `TRPCError` thrown with appropriate codes
- [ ] Client handles loading, error, and empty states
- [ ] No swallowed errors (empty catch blocks)

### 7. Testing
- [ ] New features have tests
- [ ] Tests next to source files
- [ ] Services tested with mocked Mongoose models
- [ ] Edge cases covered (not just happy path)

## Review Output Format
```
## Review: [file or PR name]

### Issues Found
1. **[severity]** file:line — description
   Fix: suggestion

### Suggestions
- improvement ideas (non-blocking)

### Approved: Yes/No
```

Severity levels: `critical` (must fix), `warning` (should fix), `nit` (style preference)
