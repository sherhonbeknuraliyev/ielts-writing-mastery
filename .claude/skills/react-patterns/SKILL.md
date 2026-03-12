---
name: react-patterns
description: Patterns for React web frontend in this project. Use when creating or modifying React components, pages, hooks, or working with files in src/client/. Covers tRPC hook usage, component structure, and React Query patterns.
---

# React Patterns

## Component Pattern

File: `src/client/components/EntityList.tsx`

```tsx
import type { Entity } from "@shared/schemas/entity.schema.js";

interface EntityListProps {
  items: Entity[];
  onDelete?: (id: string) => void;
}

export function EntityList({ items, onDelete }: EntityListProps) {
  if (items.length === 0) {
    return <p>No items found.</p>;
  }
  return (
    <ul>
      {items.map((item) => (
        <li key={item._id}>{item.name}</li>
      ))}
    </ul>
  );
}
```

## Page Pattern

File: `src/client/pages/EntityPage.tsx`

```tsx
import { trpc } from "../utils/trpc.js";
import { EntityList } from "../components/EntityList.js";

export function EntityPage() {
  const query = trpc.entity.list.useQuery({ page: 1, limit: 20 });

  return (
    <div>
      <h1>Entities</h1>
      {query.isLoading && <p>Loading...</p>}
      {query.error && <p>Error: {query.error.message}</p>}
      {query.data && <EntityList items={query.data.items} />}
    </div>
  );
}
```

Register in `src/client/App.tsx`:
```tsx
<Route path="/entities" element={<EntityPage />} />
```

Add nav link in `src/client/components/Layout.tsx`:
```tsx
<Link to="/entities">Entities</Link>
```

## tRPC Hook Patterns

### Queries
```tsx
// Basic query
const { data, isLoading, error } = trpc.entity.list.useQuery({ page: 1, limit: 20 });

// Query with transform
const { data } = trpc.entity.list.useQuery(input, {
  select: (data) => data.items.filter(item => item.status === "active"),
});

// Conditional query
const { data } = trpc.entity.getById.useQuery({ id }, { enabled: !!id });
```

### Mutations
```tsx
const utils = trpc.useUtils();

const createEntity = trpc.entity.create.useMutation({
  onSuccess: () => {
    utils.entity.list.invalidate(); // Refetch list after create
  },
});

// Usage
createEntity.mutate({ name: "New Item" });
```

## Hook Pattern

File: `src/client/hooks/useEntities.ts`

```tsx
import { trpc } from "../utils/trpc.js";

export function useEntities(page = 1) {
  const query = trpc.entity.list.useQuery({ page, limit: 20 });
  return {
    entities: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    error: query.error,
  };
}
```

## Rules
- Named function declarations for components
- Props interface in same file
- One component per file
- Use tRPC hooks for ALL server data — never raw fetch
- Extract data logic into hooks when component gets complex
- Keep pages as orchestrators, components handle rendering
