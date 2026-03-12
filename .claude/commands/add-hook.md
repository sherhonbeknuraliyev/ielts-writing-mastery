Create a custom React hook for: "$ARGUMENTS"

## Rules:
- File goes in `src/client/hooks/use<Name>.ts`
- Named export: `export function use<Name>(...) { ... }`
- Add export to `src/client/hooks/index.ts`
- Keep under 300 lines

## Pattern:
```ts
import { useState, useCallback } from "react";

export function useMyHook(initialValue: string) {
  const [state, setState] = useState(initialValue);

  const update = useCallback((newValue: string) => {
    setState(newValue);
  }, []);

  return { state, update } as const;
}
```

## If the hook needs API data:
Use tRPC hooks inside your custom hook:
```ts
import { trpc } from "../utils/trpc.js";

export function useUsers(page = 1) {
  const query = trpc.user.list.useQuery({ page, limit: 20 });
  // transform, combine, or add logic
  return { users: query.data?.items ?? [], isLoading: query.isLoading };
}
```

## If the hook manages complex state:
Consider if this should be a Zustand store instead. Use a hook for:
- Derived/computed state from tRPC queries
- Browser APIs (localStorage, window size, etc.)
- Form state and validation
- Animation/timer logic
