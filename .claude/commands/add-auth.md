Add authentication to this project. Implementation plan:

## Backend:

### 1. Install dependencies
```bash
npm install jsonwebtoken bcryptjs
npm install -D @types/jsonwebtoken @types/bcryptjs
```

### 2. Create `src/shared/schemas/auth.schema.ts`:
- `loginSchema` (email + password)
- `registerSchema` (name + email + password)
- `authResponseSchema` (user + token)
- Export inferred types

### 3. Create `src/server/services/auth.service.ts`:
- `register(data)` — hash password with bcrypt, create user, return JWT
- `login(data)` — verify password, return JWT
- `verifyToken(token)` — decode and verify JWT
- Use `process.env.JWT_SECRET` for signing

### 4. Create `src/server/routers/auth.router.ts`:
- `auth.register` — public mutation
- `auth.login` — public mutation
- `auth.me` — protected query (return current user from context)
- Register in `src/server/routers/index.ts`

### 5. Update `src/server/trpc/context.ts`:
- If Authorization header has a valid JWT, decode it
- Set `ctx.user` with the decoded user data
- This makes `protectedProcedure` and `adminProcedure` work automatically

### 6. Add to `.env.example`:
```
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
```

## Frontend:

### 7. Create `src/client/hooks/useAuth.ts`:
- React Context for auth state (user + token)
- `login()`, `logout()`, `register()` methods
- Store token in localStorage
- Set token in tRPC client headers
- Export `useAuth` hook

### 8. Create `src/client/components/AuthGuard.tsx`:
- Wrap protected routes
- Redirect to login if not authenticated

### 9. Create `src/client/pages/LoginPage.tsx` and `RegisterPage.tsx`

### 10. Update `src/client/App.tsx`:
- Add auth routes
- Wrap protected routes with AuthGuard

Keep every file under 300 lines. Hash passwords, never store plaintext.
