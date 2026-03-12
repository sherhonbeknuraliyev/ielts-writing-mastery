Sync skills from the alirezarezvani/claude-skills repository.

Steps:
1. Check which skills are available:
```bash
gh api 'repos/alirezarezvani/claude-skills/git/trees/main?recursive=1' --jq '.tree[].path' | grep 'SKILL.md'
```

2. The user will specify which skills to sync. For each requested skill, fetch it:
```bash
gh api "repos/alirezarezvani/claude-skills/contents/<path>/SKILL.md" --jq '.content' | base64 -d
```

3. Review the fetched skill content and adapt it for this project:
   - Replace technology references to match our stack (Express, tRPC, MongoDB, React, React Native)
   - Keep it under 300 lines
   - Ensure the YAML frontmatter has valid `name` and `description`
   - Save to `.claude/skills/<skill-name>/SKILL.md`

4. Report what was synced and any adaptations made.

Available categories in alirezarezvani/claude-skills:
- `engineering/` — CI/CD, API design, database, observability, performance
- `engineering-team/` — Frontend, backend, fullstack, QA, DevOps, security
- `product-team/` — Product management, UX, design systems, competitive analysis
- `business-growth/` — Customer success, sales, revenue ops
- `marketing-skill/` — Content, SEO, CRO, pricing, launch strategy
- `finance/` — Financial analysis, SaaS metrics
- `project-management/` — Jira, scrum, PM workflows

Example usage:
```
/sync-skills engineering/api-design-reviewer
/sync-skills marketing-skill/seo-audit
/sync-skills product-team/ux-researcher-designer
```
