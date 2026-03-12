---
name: trpc-patterns
description: Patterns for working with tRPC in this project. Use when creating, modifying, or debugging API routes, tRPC routers, procedures, middleware, or when connecting frontend to backend API calls.
---

# tRPC Patterns

## Architecture
```
Client (trpc.entity.method.useQuery())
  → httpBatchLink → /api/trpc
  → Express middleware → tRPC adapter
  → Router (validates input with Zod) → Service (business logic)
  → Response auto-typed back to client
```

## Creating a Router

File: `src/server/routers/entity.router.ts`

```ts
import { router, publicProcedure, protectedProcedure } from "../trpc/trpc.js";
import { entityService } from "../services/entity.service.js";
import { createEntitySchema, updateEntitySchema } from "@shared/schemas/entity.schema.js";
import { paginationSchema, idParamSchema } from "@shared/schemas/common.schema.js";

export const entityRouter = router({
  list: publicProcedure
    .input(paginationSchema)
    .query(({ input }) => entityService.findAll(input)),

  getById: publicProcedure
    .input(idParamSchema)
    .query(({ input }) => entityService.findById(input.id)),

  create: protectedProcedure
    .input(createEntitySchema)
    .mutation(({ input }) => entityService.create(input)),

  update: protectedProcedure
    .input(idParamSchema.merge(updateEntitySchema))
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return entityService.update(id, data);
    }),

  delete: protectedProcedure
    .input(idParamSchema)
    .mutation(({ input }) => entityService.delete(input.id)),
});
```

## Registering a Router

File: `src/server/routers/index.ts`

```ts
import { entityRouter } from "./entity.router.js";

export const appRouter = router({
  user: userRouter,
  entity: entityRouter, // Add here
});
```

## Procedure Types
- `publicProcedure` — No auth required
- `protectedProcedure` — Must be authenticated (checks `ctx.user`)
- `adminProcedure` — Must be admin role

## Adding Middleware

File: `src/server/trpc/trpc.ts`

```ts
const myMiddleware = middleware(async ({ ctx, next }) => {
  // Add to context
  return next({ ctx: { ...ctx, newValue: "hello" } });
});

export const myProcedure = publicProcedure.use(myMiddleware);
```

## Client Usage (Web)
```tsx
// Query — auto-cached by React Query
const { data, isLoading } = trpc.entity.list.useQuery({ page: 1, limit: 20 });

// Mutation
const createEntity = trpc.entity.create.useMutation({
  onSuccess: () => utils.entity.list.invalidate(),
});
createEntity.mutate({ name: "test" });
```

## Client Usage (Mobile)
Identical to web — same `trpc` import, same hooks, same types.

## Error Handling
Throw `TRPCError` in services or routers:
```ts
import { TRPCError } from "@trpc/server";
throw new TRPCError({ code: "NOT_FOUND", message: "Entity not found" });
```
Codes: `BAD_REQUEST`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `INTERNAL_SERVER_ERROR`
