Add a new Zod schema for "$ARGUMENTS" to the shared schemas.

1. Create `src/shared/schemas/$ARGUMENTS.schema.ts`:
   - Define the base schema with all fields including `_id: z.string()`, `createdAt: z.date()`, `updatedAt: z.date()`
   - Create `create${Name}Schema` — omit _id and timestamps
   - Create `update${Name}Schema` — partial of create schema
   - Export inferred types using `z.infer<typeof schema>`

2. Add `export * from "./$ARGUMENTS.schema.js";` to `src/shared/schemas/index.ts`

Follow the exact pattern used in `src/shared/schemas/user.schema.ts`. Types must be inferred from Zod — never define them manually.
