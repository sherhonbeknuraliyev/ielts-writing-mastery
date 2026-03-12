---
name: zod-schemas
description: Patterns for Zod schemas in this project. Use when creating or modifying data schemas, validation rules, or TypeScript types in src/shared/schemas/. Zod schemas are the single source of truth for types across web, mobile, and server.
---

# Zod Schema Patterns

## Location
All schemas go in `src/shared/schemas/`. They are imported by server, web client, and mobile app.

## Standard Schema Pattern

File: `src/shared/schemas/entity.schema.ts`

```ts
import { z } from "zod";

// Base schema — full entity shape including DB fields
export const entitySchema = z.object({
  _id: z.string(),
  name: z.string().min(1, "Name is required"),
  status: z.enum(["active", "inactive"]).default("active"),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Create — omit auto-generated fields
export const createEntitySchema = entitySchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
});

// Update — partial of create (all fields optional)
export const updateEntitySchema = createEntitySchema.partial();

// Types — ALWAYS infer from schemas, never define manually
export type Entity = z.infer<typeof entitySchema>;
export type CreateEntity = z.infer<typeof createEntitySchema>;
export type UpdateEntity = z.infer<typeof updateEntitySchema>;
```

## Register in barrel export
Add to `src/shared/schemas/index.ts`:
```ts
export * from "./entity.schema.js";
```

## Common Schema Utilities
Already defined in `src/shared/schemas/common.schema.ts`:
- `paginationSchema` — `{ page, limit }` with defaults
- `idParamSchema` — `{ id: string }`
- `searchSchema` — `{ q?: string }`
- `paginatedResponseSchema(itemSchema)` — paginated wrapper

## Schema Composition
```ts
// Extend another schema
const adminUserSchema = userSchema.extend({
  permissions: z.array(z.string()),
});

// Merge schemas
const inputSchema = idParamSchema.merge(updateEntitySchema);

// Pick specific fields
const publicUserSchema = userSchema.pick({ name: true, email: true });
```

## Validation Rules
```ts
z.string().email("Invalid email")
z.string().min(8, "Too short").max(100, "Too long")
z.number().int().min(0).max(1000)
z.enum(["a", "b", "c"])
z.array(z.string()).min(1, "At least one required")
z.string().regex(/^[a-z]+$/, "Lowercase only")
z.string().url("Invalid URL")
z.string().uuid("Invalid UUID")
z.coerce.date() // Coerces strings to Date
```

## Key Rules
- **Never define types manually** — always use `z.infer<typeof schema>`
- Schemas live ONLY in `src/shared/schemas/`
- Both server (tRPC) and client (forms) use the same schemas
- Add `.js` extension when importing: `from "./entity.schema.js"`
