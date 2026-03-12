Update the Telegram Bot API skill with the latest documentation.

Steps:
1. Fetch the current Telegram Bot API docs from https://core.telegram.org/bots/api
2. Read the existing skill at `.claude/skills/telegram-bot/SKILL.md`
3. Compare and identify:
   - New methods added to the API
   - Changed parameters or response types
   - Deprecated methods
   - New features (payments, inline mode changes, etc.)
4. Update the skill file with:
   - Any new methods with usage examples
   - Updated type definitions
   - New patterns or best practices
   - Updated constraints (file sizes, rate limits, etc.)
5. Keep the skill under 300 lines
6. Keep the YAML frontmatter unchanged
7. Preserve the project-specific helper patterns (bot() function, Express webhook handler)

Report what changed in the API since the last update.
