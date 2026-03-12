---
name: project-conventions
description: Core conventions for this fullstack TypeScript project. Use when writing or modifying any code in this repository — enforces file size limits, naming patterns, import style, and architectural rules.
---

# Project Conventions

## File Rules
- **Max 300 lines per file.** If a file exceeds this, split it immediately.
- One component/hook/service/model/router per file.
- Named exports only — never use `export default`.
- Use `.js` extensions in all import paths (ESM requirement).
- Use `import type` for type-only imports.

## Naming Conventions

### Files
| Type | Pattern | Example |
|------|---------|---------|
| Zod schema | `entity.schema.ts` | `post.schema.ts` |
| Mongoose model | `entity.model.ts` | `post.model.ts` |
| Service | `entity.service.ts` | `post.service.ts` |
| tRPC router | `entity.router.ts` | `post.router.ts` |
| React component | `EntityName.tsx` | `PostList.tsx` |
| React page | `EntityPage.tsx` | `PostsPage.tsx` |
| React hook | `useEntity.ts` | `usePosts.ts` |
| RN screen | `EntityScreen.tsx` | `UsersScreen.tsx` |
| RN component | `EntityCard.tsx` | `UserCard.tsx` |
| Test | `entity.service.test.ts` | `post.service.test.ts` |

### Code
| Type | Pattern | Example |
|------|---------|---------|
| Schema | `entitySchema` | `postSchema` |
| Create schema | `createEntitySchema` | `createPostSchema` |
| Type | `Entity` | `Post` |
| Model | `EntityModel` | `PostModel` |
| Service | `entityService` | `postService` |
| Router | `entityRouter` | `postRouter` |

## Architecture Rules
- **Shared schemas are the single source of truth.** Never manually define API types.
- Types are inferred from Zod: `type Post = z.infer<typeof postSchema>`
- Services contain business logic. They receive validated data and return plain objects.
- Routers are thin — they wire Zod validation to service calls. No logic in routers.
- Components receive typed props. No `any` types.
- Path aliases: `@shared/`, `@client/`, `@server/`, `@mobile/`

## When Splitting Files
- Component does data fetching + rendering → extract hook into `hooks/`
- Component has multiple visual sections → extract sub-components
- Service file grows → split by operation type (queries vs mutations)
- Router grows → split into sub-routers and merge with `router()`
