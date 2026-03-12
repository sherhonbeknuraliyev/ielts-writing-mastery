Write tests for "$ARGUMENTS". Use Vitest.

## Rules:
- Test file goes next to source: `feature.service.ts` → `feature.service.test.ts`
- Import from the source file directly, not from barrel exports
- Use `describe` blocks grouped by method name
- Test happy path first, then edge cases, then error cases

## Service tests (unit):
```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
```
- Mock Mongoose models using `vi.mock`
- Test each service method independently
- Verify correct data transformation (e.g., `_id` converted to string)
- Test pagination calculations

## Router tests (integration):
```ts
import { createCaller } from "../trpc/test-utils.js";
```
- Use tRPC's `createCallerFactory` to call procedures directly
- Test input validation (send bad data, expect Zod errors)
- Test auth guards (call protected routes without auth, expect UNAUTHORIZED)

## Component tests:
- Use `@testing-library/react` if installed
- Test that components render without crashing
- Test user interactions (form submissions, button clicks)
- Mock tRPC hooks with `vi.mock`

## After writing tests:
Run `npm run test` to verify they pass. Fix any failures.
