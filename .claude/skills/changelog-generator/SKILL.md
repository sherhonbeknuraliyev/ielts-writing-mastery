---
name: changelog-generator
description: Generate changelogs and release notes from git history using conventional commits. Use when preparing a release, writing a CHANGELOG.md, tagging a version, or asked to summarize changes since the last release.
---

# Changelog Generator

## Conventional Commits → SemVer Mapping

| Commit type | Version bump | Changelog section |
|---|---|---|
| `feat:` | minor (0.x.0) | Added |
| `fix:` | patch (0.0.x) | Fixed |
| `refactor:` | patch | Changed |
| `docs:` | patch | (usually omit) |
| `chore:` | patch | (usually omit) |
| `test:` | patch | (usually omit) |
| `BREAKING CHANGE:` footer | major (x.0.0) | Changed (migration note) |

Breaking change syntax:
```
feat!: rename userId to authorId in posts API

BREAKING CHANGE: userId field renamed to authorId in all post responses.
Update any clients reading post.userId to use post.authorId.
```

## Keep a Changelog Format

```markdown
# Changelog

## [Unreleased]

## [1.2.0] - 2026-03-11
### Added
- feat: post creation endpoint with image upload support
- feat(auth): refresh token rotation

### Changed
- refactor: split user service into query and mutation files

### Fixed
- fix: correct pagination offset on posts list endpoint
- fix(auth): validate JWT expiration in middleware

### Removed
- feat!: remove deprecated /api/v1 routes (use /api/trpc)

## [1.1.0] - 2026-02-14
...

[Unreleased]: https://github.com/org/repo/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/org/repo/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/org/repo/compare/v1.0.0...v1.1.0
```

Sections (use only those with content): `Added`, `Changed`, `Fixed`, `Removed`, `Deprecated`, `Security`.

## Bash One-Liners

```bash
# All commits since last tag
git log $(git describe --tags --abbrev=0)..HEAD --oneline

# Conventional commits only, formatted for changelog
git log $(git describe --tags --abbrev=0)..HEAD \
  --pretty=format:"- %s" \
  --grep="^feat\|^fix\|^refactor\|^docs\|^chore"

# Group by type between two tags
git log v1.1.0..v1.2.0 --pretty=format:"%s" | sort

# Show commits with author and date (for attribution)
git log v1.1.0..v1.2.0 --pretty=format:"- %s (%an, %ad)" --date=short

# Find all breaking changes since last tag
git log $(git describe --tags --abbrev=0)..HEAD \
  --pretty=format:"%B" | grep -A2 "BREAKING CHANGE"

# Count commits by type
git log v1.0.0..HEAD --pretty=format:"%s" \
  | grep -oE "^(feat|fix|chore|refactor|docs|test)" | sort | uniq -c

# Last tag name
git describe --tags --abbrev=0

# All tags sorted by version
git tag --sort=-version:refname
```

## Node.js Script — Parse Conventional Commits

`scripts/generate-changelog.ts`

```typescript
import { execSync } from "node:child_process";

type CommitType = "feat" | "fix" | "refactor" | "docs" | "chore" | "test" | "other";

interface ParsedCommit {
  type: CommitType;
  scope: string | null;
  breaking: boolean;
  subject: string;
  hash: string;
}

function getCommitsSinceTag(fromTag?: string): string[] {
  const range = fromTag ? `${fromTag}..HEAD` : "HEAD";
  return execSync(`git log ${range} --pretty=format:"%H %s"`)
    .toString()
    .trim()
    .split("\n")
    .filter(Boolean);
}

function parseCommit(line: string): ParsedCommit {
  const [hash, ...rest] = line.split(" ");
  const message = rest.join(" ");
  const match = message.match(/^(\w+)(\(([^)]+)\))?(!)?:\s*(.+)$/);

  if (!match) {
    return { type: "other", scope: null, breaking: false, subject: message, hash };
  }

  return {
    type: (match[1] as CommitType) ?? "other",
    scope: match[3] ?? null,
    breaking: match[4] === "!",
    subject: match[5],
    hash,
  };
}

function groupBySection(commits: ParsedCommit[]) {
  return {
    breaking: commits.filter((c) => c.breaking),
    added: commits.filter((c) => c.type === "feat" && !c.breaking),
    fixed: commits.filter((c) => c.type === "fix"),
    changed: commits.filter((c) => c.type === "refactor"),
  };
}

function formatCommit(c: ParsedCommit): string {
  const scope = c.scope ? `**${c.scope}**: ` : "";
  return `- ${scope}${c.subject}`;
}

function generateChangelog(version: string, fromTag?: string): string {
  const lastTag = fromTag ?? execSync("git describe --tags --abbrev=0").toString().trim();
  const rawCommits = getCommitsSinceTag(lastTag);
  const commits = rawCommits.map(parseCommit);
  const { breaking, added, fixed, changed } = groupBySection(commits);

  const today = new Date().toISOString().slice(0, 10);
  const lines: string[] = [`## [${version}] - ${today}`];

  if (breaking.length) {
    lines.push("### Changed (Breaking)");
    breaking.forEach((c) => lines.push(formatCommit(c)));
  }
  if (added.length) {
    lines.push("### Added");
    added.forEach((c) => lines.push(formatCommit(c)));
  }
  if (fixed.length) {
    lines.push("### Fixed");
    fixed.forEach((c) => lines.push(formatCommit(c)));
  }
  if (changed.length) {
    lines.push("### Changed");
    changed.forEach((c) => lines.push(formatCommit(c)));
  }

  return lines.join("\n");
}

// Usage: npx tsx scripts/generate-changelog.ts 1.3.0
const version = process.argv[2] ?? "Unreleased";
console.log(generateChangelog(version));
```

Run it:
```bash
npx tsx scripts/generate-changelog.ts 1.3.0
```

## Version Range Changelog

```bash
# Between two specific tags
git log v1.0.0..v1.1.0 --pretty=format:"- %s" \
  --grep="^feat\|^fix"

# Since a date
git log --since="2026-01-01" --pretty=format:"- %s" \
  --grep="^feat\|^fix"

# Unreleased (since last tag)
git log $(git describe --tags --abbrev=0)..HEAD \
  --pretty=format:"- %s"
```

## GitHub Actions — Auto Release Notes on Tag

`.github/workflows/release.yml`

```yaml
name: Release
on:
  push:
    tags: ["v*"]

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - name: Generate changelog
        id: changelog
        run: |
          VERSION=${GITHUB_REF_NAME#v}
          PREV_TAG=$(git describe --tags --abbrev=0 HEAD^ 2>/dev/null || echo "")
          RANGE="${PREV_TAG:+$PREV_TAG..}HEAD"
          NOTES=$(git log $RANGE --pretty=format:"- %s" --grep="^feat\|^fix\|^refactor")
          echo "notes<<EOF" >> $GITHUB_OUTPUT
          echo "$NOTES" >> $GITHUB_OUTPUT
          echo "EOF" >> $GITHUB_OUTPUT

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          body: ${{ steps.changelog.outputs.notes }}
          generate_release_notes: false
```

## Monorepo Notes

This project has `src/client/`, `src/server/`, and `src/mobile/`. Use scopes to target changes:

```
feat(server): add posts tRPC router
fix(client): correct pagination in PostsPage
chore(mobile): update Expo SDK to 53
```

Filter changelog by package:
```bash
# Server changes only
git log v1.0.0..HEAD --pretty=format:"%s" | grep "(server)"

# Mobile changes only
git log v1.0.0..HEAD --pretty=format:"%s" | grep "(mobile)"
```

## Best Practices

- **One logical change per commit.** If `git log --oneline` reads like release notes, commits are the right size.
- **Use scope for cross-cutting changes**: `fix(auth):`, `feat(posts):`, `chore(deps):`.
- **Breaking changes need migration notes** in the commit body under `BREAKING CHANGE:`.
- **Don't squash all commits** into one before release — the history is the changelog source.
- **Tag before deploying**, not after. Tag = what is in production.
- **Keep CHANGELOG.md** checked in and updated at release time, not retroactively.

## Common Pitfalls

- `git describe --tags` fails on repos with no tags — create an initial `v0.0.0` tag.
- Forgetting `--follow-tags` when pushing: `git push --follow-tags origin main`.
- Squash merges on GitHub lose commit type info — use "Squash and merge" with a conventional commit title on the PR.
- `chore:` and `docs:` commits rarely belong in a user-facing changelog — filter them out.
- Breaking change in a `fix:` is still a major bump — the `!` or `BREAKING CHANGE:` footer overrides the type.
