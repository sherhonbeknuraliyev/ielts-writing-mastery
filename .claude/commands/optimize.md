Optimize the performance of: "$ARGUMENTS"

## Backend optimization checklist:

### MongoDB/Mongoose:
- Use `.lean()` on queries that return data to client (skip Mongoose hydration)
- Add indexes for fields used in queries/filters: `schema.index({ field: 1 })`
- Use `.select("field1 field2")` to return only needed fields
- Use `Promise.all()` for independent parallel queries
- Paginate all list endpoints (already built into template)

### tRPC/Express:
- Keep routers thin — move logic to services
- Use tRPC's batching (already enabled via `httpBatchLink`)
- Add caching headers for GET-like queries when appropriate

## Frontend optimization checklist:

### React Query (via tRPC):
- Set appropriate `staleTime` — don't refetch data that rarely changes
- Use `placeholderData` for instant perceived loading
- Use `select` to transform/filter data and prevent unnecessary re-renders:
  ```ts
  trpc.user.list.useQuery(input, {
    select: (data) => data.items.filter(u => u.role === "admin"),
  });
  ```

### React components:
- Avoid creating objects/arrays in JSX props (causes re-renders)
- Extract expensive computations into `useMemo`
- Extract callback functions into `useCallback` when passed as props
- Split large components — smaller components re-render independently

### Bundle size:
- Run `npx vite-bundle-visualizer` to analyze
- Lazy load routes: `const Page = lazy(() => import("./pages/Page.js"))`
- Check for large dependencies and find lighter alternatives

After optimizing, run `npm run build` to verify no regressions.
