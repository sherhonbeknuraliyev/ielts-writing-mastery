# Architecture Guide

## Overview
Monorepo-style fullstack app. Client and server live in one project and share types through `src/shared/`.

## Request Flow
```
Browser -> Vite proxy (:3000/api/*) -> Express (:4000) -> tRPC Router -> Service -> Mongoose -> MongoDB
```

In production, the built client is served statically and API calls go directly to Express.

## Directory Structure

### src/shared/ — Shared Code
The bridge between client and server. Contains:
- **schemas/**: Zod schemas that define data shapes AND validation rules. Types are inferred from schemas using `z.infer<>`. Never define types manually — derive them from Zod.
- **constants/**: App-wide constants (roles, pagination defaults, etc.)

### src/server/ — Backend
- **db/**: Database connection and seed scripts
- **models/**: Mongoose schemas and models. These mirror the Zod schemas but add DB-specific config (indexes, hooks, etc.)
- **services/**: Business logic. Pure functions that take validated input and return data. No Express/tRPC awareness — services are framework-agnostic.
- **routers/**: tRPC routers that wire up validation to service calls. Thin layer — no business logic here.
- **trpc/**: tRPC setup, context creation, middleware (auth, admin)

### src/client/ — Frontend
- **components/**: Reusable UI components. One component per file.
- **pages/**: Route-level components. Each maps to a URL path.
- **hooks/**: Custom React hooks. One hook per file.
- **utils/**: Utility functions (tRPC client setup, formatters, etc.)

## Adding a New Database Model

### Step 1: Zod Schema (shared/)
Define the shape with Zod. Export inferred types.

### Step 2: Mongoose Model (server/models/)
Create a Mongoose schema that matches the Zod schema. Add indexes, hooks, virtuals as needed.

### Step 3: Service (server/services/)
Write CRUD operations. Services receive validated data (already parsed by tRPC + Zod). Return plain objects.

### Step 4: Router (server/routers/)
Create tRPC procedures. Each procedure: define input schema -> call service -> return result.

### Step 5: Register Router
Add to `src/server/routers/index.ts` in the appRouter.

### Step 6: Frontend
Use `trpc.feature.method.useQuery()` or `.useMutation()` in React components. Types are automatic.

## Auth Pattern
Context is created per-request in `src/server/trpc/context.ts`. It extracts the auth token from headers. Middleware in `src/server/trpc/trpc.ts` checks auth state and provides `protectedProcedure` and `adminProcedure` for protected routes.

## Error Handling
tRPC handles errors automatically. Throw `TRPCError` in services/routers with appropriate codes. Client receives typed errors through React Query.
