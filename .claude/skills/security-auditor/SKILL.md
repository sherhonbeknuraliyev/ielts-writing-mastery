---
name: security-auditor
description: Security auditing for this Express + tRPC + MongoDB project. Use when reviewing code for vulnerabilities, hardening the application, or when asked about security best practices. Covers OWASP top 10, auth patterns, and MongoDB-specific security.
---

# Security Auditor

## Quick Audit Checklist

### Authentication & Authorization
- [ ] Auth token extracted in `src/server/trpc/context.ts`
- [ ] JWT verified before setting `ctx.user`
- [ ] `protectedProcedure` used for authenticated routes
- [ ] `adminProcedure` used for admin-only routes
- [ ] Passwords hashed with bcrypt (never stored plaintext)
- [ ] JWT secret from env var, not hardcoded
- [ ] Token expiration set (not infinite)

### Input Validation (OWASP: Injection)
- [ ] All tRPC inputs validated with Zod schemas
- [ ] No raw user input in Mongoose queries
- [ ] No `$where`, `$expr` with user-controlled data
- [ ] ObjectId inputs validated before MongoDB queries
- [ ] File uploads validated (type, size limits)

### Data Exposure
- [ ] Passwords excluded: `.select("-password")` on all user queries
- [ ] API responses don't leak internal IDs, stack traces, or debug info
- [ ] Error messages are generic in production
- [ ] `.env` in `.gitignore`
- [ ] No secrets in client-side code

### MongoDB-Specific
- [ ] No `$where` operator (allows arbitrary JS execution)
- [ ] Query operators from user input sanitized (prevent `$gt`, `$ne` injection)
- [ ] Connection string uses authentication
- [ ] Database user has minimal required permissions

### HTTP Security Headers
Add to `src/server/index.ts`:
```ts
import helmet from "helmet";
app.use(helmet());
```

### Rate Limiting
```ts
import rateLimit from "express-rate-limit";
app.use("/api/", rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
}));
```

### CORS
Restrict in production:
```ts
app.use(cors({
  origin: process.env.NODE_ENV === "production"
    ? process.env.CLIENT_URL
    : "http://localhost:3000",
  credentials: true,
}));
```

## Common Vulnerabilities in This Stack

| Vulnerability | Risk | Check |
|--------------|------|-------|
| NoSQL injection | High | Never pass raw user input to Mongoose queries |
| Missing auth on routes | High | Every mutation should use protectedProcedure |
| JWT secret in code | Critical | Must be in .env, never committed |
| Password in API response | High | Always `.select("-password")` |
| No rate limiting | Medium | Add express-rate-limit |
| Verbose errors in prod | Medium | Don't expose stack traces |

## Scan Commands
```bash
npm audit                           # Known vulnerabilities in deps
grep -rn "password" src/server/     # Check password handling
grep -rn "\$where" src/server/      # Dangerous MongoDB operator
grep -rn "eval(" src/               # Code injection risk
grep -rn "innerHTML" src/client/    # XSS risk
```
