---
name: git-workflow
description: Git workflow patterns and branch strategy for this project. Use when creating branches, making commits, managing PRs, or when asked about the project's git conventions and release process.
---

# Git Workflow

## Branch Strategy

```
main (or master)      ← production, protected
├── feature/add-posts       ← new feature
├── fix/user-pagination     ← bug fix
├── chore/update-deps       ← maintenance
└── refactor/split-service  ← code improvement
```

## Branch Naming
```
feature/<short-description>   # New feature
fix/<short-description>       # Bug fix
chore/<short-description>     # Maintenance (deps, CI, docs)
refactor/<short-description>  # Code improvement (no behavior change)
```

## Commit Convention
```
feat: add post creation endpoint
fix: correct pagination offset calculation
chore: update mongoose to v8.10
refactor: split user service into query and mutation files
docs: update API examples in ADDING_FEATURES.md
test: add user service unit tests
```

Rules:
- Lowercase, no period at end
- Imperative mood: "add" not "added" or "adds"
- Under 72 characters
- Body for context when the "why" isn't obvious

## PR Workflow

```bash
# 1. Create feature branch
git checkout -b feature/add-posts

# 2. Make changes, commit with conventional commits
git add src/shared/schemas/post.schema.ts
git commit -m "feat: add post Zod schema with create/update variants"

# 3. Push and create PR
git push -u origin feature/add-posts
gh pr create --title "feat: add posts feature" --body "## Summary
- Added post schema, model, service, router
- Added PostsPage with list and create form

## Test plan
- [ ] Create a post via the form
- [ ] Verify posts list loads with pagination
- [ ] Check type safety across the stack"
```

## Code Review Process
1. Author creates PR with description
2. CI runs (lint, typecheck, test, build)
3. Reviewer uses `/review` command or checks manually
4. Author addresses feedback
5. Squash merge to main

## Release Tagging
```bash
git tag -a v1.0.0 -m "Release v1.0.0: initial launch"
git push origin v1.0.0
```

## Emergency Hotfix
```bash
git checkout main
git pull
git checkout -b fix/critical-auth-bypass
# fix the issue
git commit -m "fix: validate JWT expiration in auth middleware"
git push -u origin fix/critical-auth-bypass
# Create PR, get fast review, merge
```
