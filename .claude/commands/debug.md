Debug an issue described as: "$ARGUMENTS"

Follow this systematic debugging approach:

1. **Identify the layer** — Is this a frontend, backend, database, or type issue?
   - Frontend errors: Check browser console, React component state
   - Backend errors: Check server logs, tRPC error responses
   - Type errors: Run `npm run typecheck` and analyze output
   - Database errors: Check MongoDB connection and query results

2. **Check the data flow**:
   - Schema (shared/) → Is the Zod schema correct?
   - Model (server/models/) → Does Mongoose schema match?
   - Service (server/services/) → Is the business logic correct?
   - Router (server/routers/) → Is the tRPC procedure wired correctly?
   - Client → Is the tRPC hook called with correct input?

3. **Run diagnostics**:
   ```bash
   npm run typecheck    # Type errors
   npm run lint         # Lint issues
   npm run test         # Test failures
   ```

4. **Fix the issue** and verify the fix works across the full stack.
