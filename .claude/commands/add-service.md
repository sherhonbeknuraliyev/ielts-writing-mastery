Create a backend service + router for "$ARGUMENTS". The Zod schema and Mongoose model should already exist.

1. **Service** — Create `src/server/services/$ARGUMENTS.service.ts`:
   - Import the model from `../models/$ARGUMENTS.model.js`
   - Import types from `@shared/schemas/$ARGUMENTS.schema.js`
   - Implement: findAll (paginated), findById, create, update, delete
   - All methods return plain objects with `_id` as string
   - Use `.lean()` on Mongoose queries for performance

2. **Router** — Create `src/server/routers/$ARGUMENTS.router.ts`:
   - Import procedures from `../trpc/trpc.js`
   - Import service and shared Zod schemas
   - Create list, getById, create, update, delete procedures
   - Register in `src/server/routers/index.ts`

Follow the exact pattern in `user.service.ts` and `user.router.ts`.
