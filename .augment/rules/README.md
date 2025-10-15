# Augment Code Rules

This directory contains extracted rules from the HotDash governance documents.

## Purpose

These rules are automatically synced from the main governance documents to provide
Augment Code with clear, actionable guidelines for development.

## Source Documents

Rules are extracted from:
- `docs/NORTH_STAR.md` - Vision, principles, architecture
- `docs/RULES.md` - Documentation policy, process, security
- `docs/OPERATING_MODEL.md` - Workflow, task management, approvals
- `README.md` - Quick start, integration guidelines
- `mcp/` - MCP tools documentation

## Rule Files

### 00-core-principles.md
Core principles, vision, architecture constraints, success metrics, and Definition of Done.

**Source:** `docs/NORTH_STAR.md`

### 01-documentation-policy.md
Allowed Markdown paths, CI enforcement, agent-specific rules, and verification.

**Source:** `docs/RULES.md`

### 02-task-workflow.md
GitHub Issues workflow, PR requirements, pipeline, task sizing, and Danger enforcement.

**Source:** `docs/OPERATING_MODEL.md`, `docs/RULES.md`

### 03-security-secrets.md
Secret management, storage locations, GitHub security features, Gitleaks, and rotation.

**Source:** `docs/RULES.md`, `docs/NORTH_STAR.md`, `docs/OPERATING_MODEL.md`

### 04-mcp-tools.md
MCP servers, usage guidelines, when to use each tool, and best practices.

**Source:** `mcp/` directory, `docs/NORTH_STAR.md`, `README.md`

### 05-hitl-approvals.md
Human-in-the-Loop workflow, approvals loop, grading system, and HITL enforcement.

**Source:** `docs/NORTH_STAR.md`, `docs/OPERATING_MODEL.md`

## Sync Process

Rules are synced from source documents using:

```bash
./scripts/ops/sync-augment-rules.sh
```

**When to sync:**
- After updating governance documents
- During manager startup (if documents changed)
- Before major development work
- When onboarding new agents

## Verification

To verify rules are current:

```bash
# Check source documents for changes
git diff docs/NORTH_STAR.md docs/RULES.md docs/OPERATING_MODEL.md

# Re-sync if changes detected
./scripts/ops/sync-augment-rules.sh
```

## Usage in Augment Code

Augment Code automatically reads these rules and applies them during development.

**Rules are enforced for:**
- Code generation
- File modifications
- Documentation updates
- Security practices
- Workflow compliance

## Maintenance

**Manager responsibilities:**
- Sync rules when governance docs change
- Verify rules are current during startup
- Update sync script if new rules added
- Ensure rules reflect current practices

**DO NOT:**
- Manually edit rule files (they're auto-generated)
- Remove or rename rule files
- Bypass rules in development
- Disable rule enforcement

## Last Synced

Check git log for last sync:

```bash
git log -1 --oneline .augment/rules/
```

---

**For questions about rules, see the source documents listed above.**
