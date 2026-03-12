Add Express middleware for: "$ARGUMENTS"

## Where middleware goes:
- Create file in `src/server/middleware/<name>.middleware.ts`
- Register in `src/server/index.ts` (for Express-level middleware)
- Or add as tRPC middleware in `src/server/trpc/trpc.ts` (for tRPC-level)

## Express middleware pattern:
```ts
import type { Request, Response, NextFunction } from "express";

export function myMiddleware(req: Request, res: Response, next: NextFunction) {
  // logic here
  next();
}
```

Register in `src/server/index.ts` before the tRPC handler:
```ts
app.use(myMiddleware);
```

## tRPC middleware pattern (preferred for API logic):
```ts
// In src/server/trpc/trpc.ts
const myMiddleware = middleware(async ({ ctx, next }) => {
  // logic here
  return next({ ctx: { ...ctx, newProp: value } });
});

export const myProcedure = publicProcedure.use(myMiddleware);
```

## Common middleware to add:
- **Rate limiting**: Use `express-rate-limit`
- **Logging**: Log request method, path, duration
- **Error handling**: Catch unhandled errors, format response
- **CORS config**: Already added, modify in `src/server/index.ts`
- **Request ID**: Add unique ID to each request for tracing

Keep each middleware file under 300 lines. One middleware per file.
