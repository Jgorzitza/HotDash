---
description: Documentation policy with CI-enforced allowed Markdown paths
globs:
  - "**/*.md"
  - "docs/**/*"
  - "feedback/**/*"
alwaysApply: true
---

# Documentation Policy

**Source:** `docs/RULES.md`
**Enforcement:** CI-enforced via `scripts/policy/check-docs.mjs` and `Dangerfile.js`

## Allowed Markdown Paths (CI-Enforced)

**ONLY these paths are allowed for Markdown files:**

```
README.md
APPLY.md
docs/NORTH_STAR.md
docs/RULES.md
docs/OPERATING_MODEL.md
docs/ARCHIVE_INDEX.md
docs/runbooks/{manager_*,agent_*,ai_agent_review_checklist.md,drift_checklist.md}
docs/directions/<agent|role>.md
docs/directions/agenttemplate.md
docs/manager/{PROJECT_PLAN.md,IMPLEMENTATION_PLAYBOOK.md}
docs/planning/<agent>-<task>-<YYYYMMDD>.md  # TTL 2 days
docs/specs/**
docs/integrations/**
feedback/<agent>/<YYYY-MM-DD>.md
docs/_archive/**
mcp/**  # MCP tools documentation (critical infrastructure - DO NOT REMOVE)
```

## Rules for Markdown Files

### ✅ ALLOWED
- Create/modify files in the paths listed above
- Add new specs in `docs/specs/`
- Add new integration docs in `docs/integrations/`
- Write daily feedback to `feedback/<agent>/<YYYY-MM-DD>.md`
- Update MCP documentation in `mcp/` (carefully)

### ❌ FORBIDDEN
- Create `.md` files outside the allowed paths
- Modify markdown files in other agents' directories
- Create documentation in arbitrary locations
- Bypass the CI policy checks

## Special Protected Paths

### MCP Directory (`mcp/**`)
- **Status:** PROTECTED INFRASTRUCTURE
- **Purpose:** Critical MCP tools documentation (6 active servers)
- **CI Protection:** YES (check-docs.mjs, Dangerfile.js, RULES.md)
- **Action:** DO NOT REMOVE - See `mcp/PROTECTION_NOTICE.md`

### Planning Directory (`docs/planning/`)
- **TTL:** 2 days
- **Cleanup:** Automated via `scripts/ops/archive-docs.mjs`
- **Format:** `<agent>-<task>-<YYYYMMDD>.md`

### Archive Directory (`docs/_archive/`)
- **Purpose:** Historical documentation
- **Process:** Use `git mv` to archive, preserve history
- **Access:** Read-only for reference

## Enforcement

### CI Checks
```bash
# Run locally before committing
node scripts/policy/check-docs.mjs
```

**Expected output:** `✅ Docs policy check passed.`

### Danger (PR Validation)
- Automatically checks all PRs
- Blocks merge if disallowed `.md` files detected
- Reports violations in PR comments

### Violations
If you create a disallowed `.md` file:
```
❌ Docs policy violation. Disallowed Markdown paths:
  - path/to/file.md

Allowed Markdown paths are listed in docs/RULES.md.
```

**Fix:** Move the file to an allowed location or remove it

## Daily Drift Sweep

**Manager responsibility:**
- Run docs policy check during startup
- Archive planning files > 2 days old
- Check for stray `.md` files
- Verify no cross-agent edits

```bash
# Planning TTL sweep
node scripts/ops/archive-docs.mjs
git commit -am "chore: planning TTL sweep" && git push
```

## Agent-Specific Rules

### What Each Agent Can Write

**All agents:**
- ✅ Own feedback file: `feedback/<agent>/<YYYY-MM-DD>.md`
- ✅ Code in Allowed paths (from Issue)
- ❌ Other agents' feedback files
- ❌ Governance docs (NORTH_STAR, RULES, OPERATING_MODEL)

**Manager only:**
- ✅ `docs/NORTH_STAR.md`
- ✅ `docs/RULES.md`
- ✅ `docs/OPERATING_MODEL.md`
- ✅ `docs/directions/<agent>.md`
- ✅ `docs/manager/PROJECT_PLAN.md`
- ✅ `docs/manager/IMPLEMENTATION_PLAYBOOK.md`

**Any agent (with approval):**
- ✅ `docs/specs/**` (new specs)
- ✅ `docs/integrations/**` (integration docs)
- ✅ `docs/runbooks/**` (runbook updates)

## Verification Checklist

Before committing any `.md` file:

- [ ] Is the path in the allowed list above?
- [ ] Did I run `node scripts/policy/check-docs.mjs`?
- [ ] Does the check pass?
- [ ] Is this my agent's feedback file or an allowed shared doc?
- [ ] If it's a planning doc, is it < 2 days old?

## Common Mistakes to Avoid

❌ Creating `docs/notes.md` (not in allow-list)
❌ Creating `app/README.md` (not in allow-list)
❌ Creating `packages/foo/DESIGN.md` (not in allow-list)
❌ Modifying another agent's feedback file
❌ Creating markdown in arbitrary directories

✅ Use `docs/specs/` for design docs
✅ Use `docs/integrations/` for integration notes
✅ Use your own feedback file for daily logs
✅ Use `docs/planning/` for short-lived planning (< 2 days)

