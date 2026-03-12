# Adding Features — Step by Step

This is a checklist for adding a new feature (e.g., "Post" entity) to the app.

## 1. Define the Schema
Create `src/shared/schemas/post.schema.ts`:
- Define the base Zod schema with all fields
- Create `createPostSchema` (omit _id, timestamps)
- Create `updatePostSchema` (partial of create)
- Export inferred types

Add export to `src/shared/schemas/index.ts`.

## 2. Create the Model
Create `src/server/models/post.model.ts`:
- Define Mongoose schema matching the Zod schema
- Add indexes for query patterns
- Export the model

Add export to `src/server/models/index.ts`.

## 3. Create the Service
Create `src/server/services/post.service.ts`:
- Implement CRUD methods: findAll, findById, create, update, delete
- Each method takes validated input, returns plain objects
- Handle pagination using the shared pagination schema

## 4. Create the Router
Create `src/server/routers/post.router.ts`:
- Define tRPC procedures for each operation
- Use shared Zod schemas for input validation
- Call service methods

Register in `src/server/routers/index.ts`:
```ts
import { postRouter } from "./post.router.js";
export const appRouter = router({
  user: userRouter,
  post: postRouter,  // Add here
});
```

## 5. Create Frontend Components
- `src/client/pages/PostsPage.tsx` — main page
- `src/client/components/PostList.tsx` — list display
- `src/client/components/CreatePostForm.tsx` — creation form

## 6. Add the Route
In `src/client/App.tsx`, add:
```tsx
import { PostsPage } from "./pages/PostsPage.js";
// In Routes:
<Route path="/posts" element={<PostsPage />} />
```

## 7. Add Navigation
In `src/client/components/Layout.tsx`, add link:
```tsx
<Link to="/posts">Posts</Link>
```

That's it! Types flow automatically from schema -> server -> client.
