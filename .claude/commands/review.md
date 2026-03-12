Review the code changes in this project. If specific files are mentioned: "$ARGUMENTS", review those. Otherwise review all uncommitted changes.

## Review checklist:

### 1. Type Safety
- Are types inferred from Zod schemas (not manually defined)?
- Are `import type` used for type-only imports?
- Any `any` types that should be specific?

### 2. Architecture
- Does new code follow the pattern: schema (shared/) → model → service → router → page?
- Is business logic in services, NOT in routers or components?
- Are routers thin (just validation + service calls)?

### 3. File Size
- Is every file under 300 lines? If not, suggest how to split.
- One component/hook/service per file?

### 4. Security
- No secrets hardcoded?
- User input validated with Zod schemas via tRPC?
- Passwords excluded from API responses (`.select("-password")`)?
- Protected routes using `protectedProcedure` or `adminProcedure`?

### 5. Performance
- Mongoose queries using `.lean()` when returning plain objects?
- React components not doing unnecessary re-renders?
- No N+1 queries in services?

### 6. Conventions
- Named exports only (no `export default`)
- `.js` extensions in imports
- Named function declarations for React components
- File naming: `camelCase.ts` for logic, `PascalCase.tsx` for components

Report issues found with file paths and line numbers. Suggest fixes.
