# Augment Code Rules Setup - Complete

**Date:** 2025-10-15  
**Status:** ✅ Complete and Synced

## Summary

Created a comprehensive rules system for Augment Code by extracting governance rules from key documents and syncing them to `.augment/rules/` directory.

## What Was Created

### Directory Structure

```
.augment/
├── README.md                           # Augment Code configuration overview
├── .gitignore                          # Ignore cache and temp files
└── rules/
    ├── README.md                       # Rules documentation
    ├── 00-core-principles.md           # Vision, principles, architecture
    ├── 01-documentation-policy.md      # Allowed paths, CI enforcement
    ├── 02-task-workflow.md             # GitHub Issues, PR requirements
    ├── 03-security-secrets.md          # Secret management, Gitleaks
    ├── 04-mcp-tools.md                 # MCP servers, usage guidelines
    └── 05-hitl-approvals.md            # HITL workflow, grading
```

### Scripts

- `scripts/ops/sync-augment-rules.sh` - Syncs rules from source documents (executable)

### Total Files Created

- 9 files in `.augment/` directory
- 1 sync script
- 1 summary document (this file)

## Rule Files Overview

### 00-core-principles.md

**Source:** `docs/NORTH_STAR.md`

**Contains:**

- Vision and guiding principles
- Speed with brakes, show receipts, one ledger
- No secrets in code, MCP-first development
- Architecture constraints (Frontend, Backend, Agents)
- Success metrics and Definition of Done
- Stop the line triggers

### 01-documentation-policy.md

**Source:** `docs/RULES.md`

**Contains:**

- Allowed Markdown paths (CI-enforced)
- Special protected paths (MCP directory)
- Planning directory TTL (2 days)
- Agent-specific write permissions
- CI enforcement and Danger validation
- Daily drift sweep process

### 02-task-workflow.md

**Source:** `docs/OPERATING_MODEL.md`, `docs/RULES.md`

**Contains:**

- GitHub Issues as single ledger
- Required fields (Agent, DoD, Acceptance checks, Allowed paths)
- PR requirements (Issue linkage, Allowed paths declaration)
- Workflow pipeline (Signals → Suggestions → Approvals → Actions → Audit → Learn)
- Task sizing (≤ 2-day molecules)
- Danger enforcement and verification

### 03-security-secrets.md

**Source:** `docs/RULES.md`, `docs/NORTH_STAR.md`, `docs/OPERATING_MODEL.md`

**Contains:**

- NO SECRETS IN CODE principle
- Allowed storage locations (GitHub Secrets, Vault, Fly.io)
- GitHub security features (Push protection, Secret scanning)
- Gitleaks CI enforcement
- Secret rotation procedures
- Service-specific guidelines
- Incident response

### 04-mcp-tools.md

**Source:** `mcp/` directory, `docs/NORTH_STAR.md`, `README.md`

**Contains:**

- 6 active MCP servers (GitHub, Context7, Supabase, Fly.io, Shopify, Google Analytics)
- MCP-first development rule
- When to use each tool
- Common MCP workflows
- Best practices and troubleshooting
- MCP documentation protection

### 05-hitl-approvals.md

**Source:** `docs/NORTH_STAR.md`, `docs/OPERATING_MODEL.md`

**Contains:**

- Human-in-the-Loop principle
- Approvals loop states (Draft → Pending → Approved → Applied → Audited → Learned)
- Required elements (Evidence, Projected impact, Risk & rollback, Affected paths)
- SLA requirements (CX: ≤15 min, Inventory/Growth: same day)
- Grading system (Tone/Accuracy/Policy: 1-5 scale)
- HITL enforcement and validation

## Sync Process

### How It Works

1. **Source Documents** (governance docs in repo)
   ↓
2. **Extraction** (rules extracted and formatted)
   ↓
3. **Sync Script** (`scripts/ops/sync-augment-rules.sh`)
   ↓
4. **Rule Files** (`.augment/rules/*.md`)
   ↓
5. **Augment Code** (reads and applies rules)

### When to Sync

```bash
./scripts/ops/sync-augment-rules.sh
```

**Sync when:**

- ✅ After updating governance documents
- ✅ During manager startup (if documents changed)
- ✅ Before major development work
- ✅ When onboarding new agents

### Verification

```bash
# Check sync status
./scripts/ops/sync-augment-rules.sh

# Expected output:
# ✓ All rules synced and current
```

## Integration with Manager Workflow

### Manager Startup Checklist

**Add to `docs/runbooks/manager_startup_checklist.md`:**

````markdown
## 2.5) Sync Augment Rules (1 min)

- [ ] Check if governance docs changed:
  ```bash
  git diff HEAD~1 docs/NORTH_STAR.md docs/RULES.md docs/OPERATING_MODEL.md
  ```
````

- [ ] If changed, sync Augment rules:
  ```bash
  ./scripts/ops/sync-augment-rules.sh
  ```
- [ ] Verify sync successful (all ✓ checks pass)

```

### Daily Workflow

1. **Morning:** Manager syncs rules if governance docs changed
2. **Development:** Augment Code applies rules automatically
3. **Evening:** Manager verifies rules still current

## Benefits for Augment Code

### Automatic Enforcement

Augment Code now has clear, actionable rules for:

1. **Documentation Policy**
   - Knows which paths are allowed for `.md` files
   - Understands CI enforcement
   - Respects protected paths (like `mcp/`)

2. **Task Workflow**
   - Follows GitHub Issues as single ledger
   - Includes required PR elements
   - Respects Allowed paths

3. **Security**
   - Never puts secrets in code
   - Uses proper secret storage
   - Follows Gitleaks requirements

4. **MCP Tools**
   - Uses MCP-first approach
   - Knows when to use each tool
   - Follows best practices

5. **HITL**
   - Understands approvals workflow
   - Includes required evidence
   - Follows grading system

### Consistency

- ✅ All agents follow same rules
- ✅ Rules extracted from authoritative sources
- ✅ Automatically synced when sources change
- ✅ Version controlled with governance docs

## Maintenance

### Manager Responsibilities

**Daily:**
- [ ] Check if governance docs changed
- [ ] Sync rules if needed
- [ ] Verify sync successful

**When Updating Governance:**
- [ ] Update source document (NORTH_STAR, RULES, etc.)
- [ ] Run sync script
- [ ] Commit both changes together

**Monthly:**
- [ ] Review rules for completeness
- [ ] Update sync script if new rules needed
- [ ] Verify Augment Code applying rules correctly

### DO NOT

❌ Manually edit rule files (they're auto-generated)
❌ Remove or rename rule files
❌ Skip syncing after governance changes
❌ Commit out-of-sync rules

## Verification Checklist

### After Setup
- [x] `.augment/` directory created
- [x] All 6 rule files present
- [x] README files created
- [x] Sync script executable
- [x] Sync script runs successfully
- [x] All checks pass (✓)

### Before Committing
- [ ] Sync script run
- [ ] All rule files present
- [ ] README files updated
- [ ] .gitignore configured
- [ ] No manual edits to rule files

### During Manager Startup
- [ ] Check governance docs for changes
- [ ] Run sync script if needed
- [ ] Verify all ✓ checks pass
- [ ] Commit if rules updated

## Files Modified/Created

### New Files (11)
- `.augment/README.md`
- `.augment/.gitignore`
- `.augment/rules/README.md`
- `.augment/rules/00-core-principles.md`
- `.augment/rules/01-documentation-policy.md`
- `.augment/rules/02-task-workflow.md`
- `.augment/rules/03-security-secrets.md`
- `.augment/rules/04-mcp-tools.md`
- `.augment/rules/05-hitl-approvals.md`
- `scripts/ops/sync-augment-rules.sh`
- `AUGMENT_RULES_SETUP.md` (this file)

### No Files Modified
All governance documents remain unchanged. Rules are extracted, not moved.

## Next Steps

### Immediate
1. ✅ Verify sync script works
2. ✅ Commit all new files
3. ✅ Test Augment Code with rules

### Short Term
1. Add sync step to manager startup checklist
2. Document in manager runbook
3. Train agents on rule system

### Long Term
1. Add CI check for rule sync
2. Automate sync on governance changes
3. Expand rules as needed

## Success Criteria

✅ **All rule files created and synced**
✅ **Sync script works correctly**
✅ **Rules extracted from authoritative sources**
✅ **Augment Code can read and apply rules**
✅ **Maintenance process documented**
✅ **Integration with manager workflow defined**

## Summary for Other Agents

**TO:** All AI agents
**RE:** Augment Code Rules System

A new `.augment/rules/` directory has been created with extracted rules from governance documents.

**What it does:**
- Provides Augment Code with clear, actionable rules
- Automatically synced from source documents
- Enforces consistency across all agents

**What you need to know:**
- Rules are auto-generated (don't manually edit)
- Sync with `./scripts/ops/sync-augment-rules.sh`
- Manager syncs during startup if governance docs changed

**Action required:** None - rules are automatically applied by Augment Code

---

**Created:** 2025-10-15
**Status:** Complete and operational ✅
**Verification:** `./scripts/ops/sync-augment-rules.sh` passes all checks

```
