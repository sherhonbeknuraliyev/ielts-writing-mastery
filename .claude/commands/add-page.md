Add a new page called "$ARGUMENTS" to the React frontend.

1. Create `src/client/pages/${Name}Page.tsx` with a basic page component
2. Add the route in `src/client/App.tsx` inside the Layout route
3. Add a navigation link in `src/client/components/Layout.tsx`

If this page needs data from the API, use tRPC hooks:
```tsx
const query = trpc.entity.list.useQuery({ page: 1, limit: 20 });
```

Keep the page component under 300 lines. If it gets complex, extract sub-components into `src/client/components/`.
