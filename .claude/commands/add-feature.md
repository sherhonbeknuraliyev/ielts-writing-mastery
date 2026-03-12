Add a new feature/entity called "$ARGUMENTS" to the project. Follow these steps exactly:

1. **Schema** — Create `src/shared/schemas/$ARGUMENTS.schema.ts`:
   - Base Zod schema with all fields (_id, timestamps, entity-specific fields)
   - `create${Name}Schema` (omit _id, createdAt, updatedAt)
   - `update${Name}Schema` (partial of create)
   - Export all inferred types
   - Add export to `src/shared/schemas/index.ts`

2. **Model** — Create `src/server/models/$ARGUMENTS.model.ts`:
   - Mongoose schema matching the Zod schema
   - Add appropriate indexes
   - Export model and document type
   - Add export to `src/server/models/index.ts`

3. **Service** — Create `src/server/services/$ARGUMENTS.service.ts`:
   - findAll (with pagination), findById, create, update, delete
   - Return plain objects (not Mongoose documents)
   - Use shared types for input parameters

4. **Router** — Create `src/server/routers/$ARGUMENTS.router.ts`:
   - CRUD procedures using shared Zod schemas for validation
   - Use appropriate procedure types (public/protected/admin)
   - Register in `src/server/routers/index.ts`

5. **Frontend** — Create:
   - `src/client/pages/${Name}sPage.tsx` — main page with list + create form
   - `src/client/components/${Name}List.tsx` — list display component
   - `src/client/components/Create${Name}Form.tsx` — creation form
   - Add route in `src/client/App.tsx`
   - Add nav link in `src/client/components/Layout.tsx`

Keep every file under 300 lines. Use existing User feature as reference pattern.
