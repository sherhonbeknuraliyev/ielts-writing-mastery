Refactor the code described by: "$ARGUMENTS"

## Refactoring rules for this project:

### When to split a file:
- Over 300 lines → must split
- Multiple responsibilities → split by concern
- Component does data fetching + rendering → extract a hook

### How to split React components:
- Extract data logic into `src/client/hooks/use<Feature>.ts`
- Extract sub-sections into `src/client/components/<SubComponent>.tsx`
- Page stays as orchestrator, components handle rendering

### How to split services:
- Group related operations into separate service files
- Example: `user.service.ts` → `user-query.service.ts` + `user-mutation.service.ts`
- Keep the router pointing to correct service files

### How to split routers:
- Split by operation type or sub-feature
- Use tRPC's `router()` to merge sub-routers
- Example: `post.router.ts` → `post-query.router.ts` + `post-mutation.router.ts`

### General rules:
- Never break the type safety chain (Zod → tRPC → React Query)
- Update barrel exports (index.ts) when moving files
- Run `npm run typecheck` after refactoring to verify nothing broke
- Keep imports using path aliases (@shared/, @client/, @server/)
