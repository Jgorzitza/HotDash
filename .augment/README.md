# Augment Code Configuration

This directory contains configuration and rules for Augment Code AI assistant.

## Structure

```
.augment/
├── README.md           # This file
├── .gitignore          # Ignore cache and temp files
└── rules/              # Extracted rules from governance docs
    ├── README.md       # Rules documentation
    ├── 00-core-principles.md
    ├── 01-documentation-policy.md
    ├── 02-task-workflow.md
    ├── 03-security-secrets.md
    ├── 04-mcp-tools.md
    └── 05-hitl-approvals.md
```

## Purpose

Augment Code reads rules from the `rules/` directory to understand:
- Project principles and architecture
- Documentation policies and allowed paths
- Task workflow and PR requirements
- Security and secrets management
- MCP tools usage guidelines
- HITL and approvals workflow

## Rules Sync

Rules are automatically extracted from governance documents:

**Source Documents:**
- `docs/NORTH_STAR.md` - Vision, principles, architecture
- `docs/RULES.md` - Documentation policy, process, security
- `docs/OPERATING_MODEL.md` - Workflow, task management, approvals
- `README.md` - Quick start, integration guidelines
- `mcp/` - MCP tools documentation

**Sync Command:**
```bash
./scripts/ops/sync-augment-rules.sh
```

**When to Sync:**
- After updating governance documents
- During manager startup (if documents changed)
- Before major development work
- When onboarding new agents

## Rule Files

### 00-core-principles.md
Core principles, vision, architecture constraints, success metrics, Definition of Done.

### 01-documentation-policy.md
Allowed Markdown paths, CI enforcement, agent-specific rules, verification.

### 02-task-workflow.md
GitHub Issues workflow, PR requirements, pipeline, task sizing, Danger enforcement.

### 03-security-secrets.md
Secret management, storage locations, GitHub security features, Gitleaks, rotation.

### 04-mcp-tools.md
MCP servers, usage guidelines, when to use each tool, best practices.

### 05-hitl-approvals.md
Human-in-the-Loop workflow, approvals loop, grading system, HITL enforcement.

## Usage

Augment Code automatically reads these rules during development. No manual action required.

**Rules enforce:**
- ✅ Code generation follows architecture
- ✅ File modifications respect allowed paths
- ✅ Documentation updates comply with policy
- ✅ Security practices are followed
- ✅ Workflow compliance is maintained

## Maintenance

**Manager Responsibilities:**
- Sync rules when governance docs change
- Verify rules are current during startup
- Update sync script if new rules added
- Ensure rules reflect current practices

**DO NOT:**
- ❌ Manually edit rule files (they're auto-generated)
- ❌ Remove or rename rule files
- ❌ Bypass rules in development
- ❌ Disable rule enforcement

## Verification

Check if rules are current:

```bash
# Check for changes in source documents
git diff docs/NORTH_STAR.md docs/RULES.md docs/OPERATING_MODEL.md

# Re-sync if changes detected
./scripts/ops/sync-augment-rules.sh

# Verify sync successful
ls -la .augment/rules/
```

## Integration with Workflow

### Manager Startup
```bash
# Part of manager startup checklist
./scripts/ops/sync-augment-rules.sh
```

### Before Development
```bash
# Ensure rules are current
./scripts/ops/sync-augment-rules.sh

# Start development with Augment Code
# Rules are automatically applied
```

### After Governance Changes
```bash
# Update governance docs
vim docs/NORTH_STAR.md

# Sync rules
./scripts/ops/sync-augment-rules.sh

# Commit both changes
git add docs/NORTH_STAR.md .augment/rules/
git commit -m "docs: update governance and sync rules"
```

## Troubleshooting

### Rules Out of Sync
```bash
# Re-run sync script
./scripts/ops/sync-augment-rules.sh

# Check for errors in output
# Verify all rule files present
```

### Missing Rule Files
```bash
# Check git history
git log --oneline .augment/rules/

# Restore from git if needed
git checkout HEAD -- .augment/rules/

# Or re-run sync
./scripts/ops/sync-augment-rules.sh
```

### Source Documents Changed
```bash
# Sync will detect and update
./scripts/ops/sync-augment-rules.sh

# Commit updated rules
git add .augment/rules/
git commit -m "chore: sync augment rules"
```

## Best Practices

### ✅ DO
- Sync rules when governance docs change
- Verify rules during manager startup
- Keep rules in sync with source documents
- Commit rule changes with governance changes
- Use sync script (don't manually edit)

### ❌ DON'T
- Manually edit rule files
- Skip syncing after governance changes
- Remove or rename rule files
- Bypass rule enforcement
- Commit out-of-sync rules

## CI Integration

Rules are part of the repository and tracked in git.

**CI Checks:**
- Rules directory exists
- All rule files present
- README.md exists
- .gitignore configured

**Future Enhancement:**
- Automated sync check in CI
- Verify rules match source documents
- Block PR if rules out of sync

## Questions?

**For rule content:** See source documents listed above
**For sync process:** See `scripts/ops/sync-augment-rules.sh`
**For Augment Code:** See Augment Code documentation

---

**Last Updated:** 2025-10-15
**Status:** Active and synced ✅

