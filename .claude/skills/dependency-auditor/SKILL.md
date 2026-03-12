---
name: dependency-auditor
description: Dependency management and security auditing for this project. Use when updating packages, checking for vulnerabilities, removing unused deps, or evaluating new dependencies to add.
---

# Dependency Auditor

## Regular Audit Commands

```bash
# Security vulnerabilities
npm audit
npm audit fix              # Auto-fix where possible

# Outdated packages
npm outdated

# Unused dependencies (install depcheck first)
npx depcheck

# Check bundle size impact of a dependency
npx bundlephobia <package-name>
```

## When to Update Dependencies

| Update Type | Action | Risk |
|------------|--------|------|
| Patch (1.0.x) | Update immediately | Low — bug fixes |
| Minor (1.x.0) | Update weekly | Low — new features, backward compatible |
| Major (x.0.0) | Plan and test | High — breaking changes possible |

## Update Workflow

```bash
# 1. Check what's outdated
npm outdated

# 2. Update non-breaking (patch + minor)
npm update

# 3. For major updates, update one at a time
npm install package@latest

# 4. Verify after each major update
npm run typecheck && npm run test && npm run build
```

## Key Dependencies to Watch

| Package | Why Critical | Update Notes |
|---------|-------------|--------------|
| `@trpc/server` + `@trpc/client` | Core API layer | Update together, check migration guide |
| `mongoose` | Database layer | Check for query API changes |
| `react` + `react-dom` | UI framework | Update together |
| `zod` | Validation + types | Usually safe to update |
| `vite` | Build tool | Check plugin compatibility |
| `typescript` | Type system | May surface new type errors |
| `expo` | Mobile framework | Follow Expo upgrade guide |

## Before Adding a New Dependency

Ask:
1. **Do we actually need it?** Can we do this with existing deps or stdlib?
2. **How big is it?** Check with `npx bundlephobia <pkg>` — matters for client bundle
3. **Is it maintained?** Check GitHub: recent commits, open issues, bus factor
4. **License compatible?** Must be MIT, Apache-2.0, or BSD
5. **Type support?** Must have TypeScript types (built-in or `@types/`)

## Mobile Dependencies (src/mobile/)
```bash
cd src/mobile
npm outdated
npm audit
npx expo install --check  # Check Expo compatibility
```

Expo manages React Native version compatibility. Always use `npx expo install <pkg>` instead of `npm install` for RN packages.
