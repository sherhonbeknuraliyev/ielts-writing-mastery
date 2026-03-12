Explain how "$ARGUMENTS" works in this project.

## How to explain:

1. **Find the relevant files** — search the codebase for the feature/concept

2. **Trace the data flow** — for any feature, follow this path:
   ```
   Zod Schema (src/shared/schemas/)
     → Mongoose Model (src/server/models/)
     → Service (src/server/services/)
     → tRPC Router (src/server/routers/)
     → React Component (src/client/)
   ```

3. **Show the key code** — reference specific files and line numbers

4. **Explain the connections** — how types flow, how data transforms at each layer

## Architecture quick reference:
- **Shared schemas** define the shape of data AND validation. Types are inferred, never manual.
- **Models** mirror schemas but add DB concerns (indexes, hooks).
- **Services** contain all business logic. They're framework-agnostic — no Express or tRPC awareness.
- **Routers** are thin wiring: validate input (Zod) → call service → return result.
- **Client** uses tRPC hooks which wrap React Query. Types are automatic from the router.
- **Path aliases**: `@shared/`, `@client/`, `@server/` map to `src/` subdirectories.

Keep the explanation concise. Use file paths and line numbers so the user can navigate.
