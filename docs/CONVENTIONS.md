# Code Conventions

## File Rules
- **Max 300 lines per file.** If a file grows beyond this, split it.
- One component/hook/service/model per file.
- File names: `kebab-case` for directories, `PascalCase.tsx` for components, `camelCase.ts` for everything else.
- Named exports only. No `export default`.

## TypeScript
- Strict mode enabled. No `any` unless absolutely necessary.
- Derive types from Zod schemas: `type User = z.infer<typeof userSchema>`.
- Use `import type` for type-only imports.
- Use `.js` extensions in import paths (ESM requirement).

## React
- Functional components only, using named function declarations.
- Use React Query (via tRPC hooks) for all server state.
- Keep components focused — split into smaller components when they handle multiple concerns.
- Props interfaces defined in the same file as the component.

## Backend
- Services are the business logic layer. They receive plain validated data and return plain objects.
- Routers are thin — they wire input validation to service calls. No business logic in routers.
- Models define the DB schema. Keep them close to the Zod shared schemas.
- Use `publicProcedure`, `protectedProcedure`, or `adminProcedure` based on auth needs.

## Naming
- Schemas: `entitySchema`, `createEntitySchema`, `updateEntitySchema`
- Types: `Entity`, `CreateEntity`, `UpdateEntity`
- Models: `EntityModel`
- Services: `entityService` (object with methods)
- Routers: `entityRouter`
- Components: `EntityList`, `EntityForm`, `EntityCard`
- Pages: `EntityPage`, `EntityDetailPage`

## Testing
- Test files next to source: `user.service.test.ts`
- Use Vitest for all tests.
- Test services directly (unit tests).
- Test routers with tRPC caller (integration tests).
