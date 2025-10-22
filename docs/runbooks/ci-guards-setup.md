# CI Guards Setup and Configuration

## Overview

CI Guards are automated quality checks that run on every pull request to ensure code quality, compliance with Growth Engine rules, and production safety. These guards act as **merge blockers** - pull requests cannot be merged until all guards pass.

**Why CI Guards Matter:**
- **Production Safety**: Prevents Dev MCP tools from reaching production
- **Quality Assurance**: Ensures all code changes include proper evidence
- **Activity Tracking**: Monitors long-running tasks to prevent idle agents
- **Compliance**: Enforces Growth Engine development standards

**Who This Affects:**
- All agents making code changes
- Support team troubleshooting CI failures
- Engineers deploying to production

## CI Guards Implementation

### 1. Guard MCP (MCP Evidence Validation)

**Purpose**: Ensures all code changes include MCP evidence JSONL files  
**Script**: `scripts/ci/verify-mcp-evidence.js`  
**Trigger**: Pull requests  
**Impact**: **BLOCKS MERGE** if evidence missing

**What It Checks:**
- PR body includes "## MCP Evidence" section
- JSONL files exist in `artifacts/<agent>/<date>/mcp/`
- Files contain valid JSON with required fields
- Evidence matches actual code changes

**For Agents:**
```markdown
## MCP Evidence
- artifacts/content/2025-10-22/mcp/shopify-dev.jsonl
- artifacts/content/2025-10-22/mcp/context7.jsonl
```

**For Non-Code Changes:**
```markdown
## MCP Evidence
No MCP usage - non-code change (docs/config only)
```

**Common Failures:**
- Missing JSONL files in artifacts directory
- Invalid JSON format in evidence files
- PR body missing "## MCP Evidence" section

### 2. Idle Guard (Heartbeat Validation)

**Purpose**: Ensures long-running tasks have fresh heartbeat entries  
**Script**: `scripts/ci/verify-heartbeat.js`  
**Trigger**: Pull requests  
**Impact**: **BLOCKS MERGE** if heartbeat stale

**What It Checks:**
- PR body includes "## Heartbeat" section
- NDJSON file exists in `artifacts/<agent>/<date>/`
- Last heartbeat within 15 minutes for "doing" status
- Task completion properly marked as "done"

**For Long Tasks (>2 hours):**
```markdown
## Heartbeat
- artifacts/content/2025-10-22/heartbeat.ndjson
- Last update: 2025-10-22T14:30:00Z (15 minutes ago)
- Status: doing (65% complete)
```

**For Short Tasks (<2 hours):**
```markdown
## Heartbeat
<2h single session - heartbeat not required
```

**Common Failures:**
- Heartbeat file missing for long tasks
- Last heartbeat >15 minutes old for "doing" status
- Task marked as "done" but no completion heartbeat

### 3. Dev MCP Ban (Production Safety)

**Purpose**: Prevents Dev MCP imports in production runtime code  
**Script**: `scripts/ci/verify-dev-mcp-ban.js`  
**Trigger**: All pushes and pull requests  
**Impact**: **CRITICAL - BLOCKS ALL DEPLOYMENTS** if violated

**What It Checks:**
- No Dev MCP imports in `app/` directory (production code)
- No Dev MCP imports in runtime bundles
- Development tools isolated from production code

**Banned Imports (in production code):**
- `@shopify/mcp-server-dev`
- `context7-mcp`
- `chrome-devtools-mcp`
- Any `mcp.*dev` or `dev.*mcp` patterns

**Allowed Locations (Dev MCP OK):**
- `scripts/` (non-runtime dev scripts)
- `tests/` (test utilities)
- `.cursor/` (Cursor IDE config)
- `docs/` (documentation)

**Why This Matters:**
- Dev MCP tools are not production-ready
- Importing them in production causes runtime errors
- This guard prevents production deployment failures

## GitHub Actions Workflow

### Workflow File: `.github/workflows/ci-guards.yml`

**Automated Jobs:**
1. **`guard-mcp`**: Validates MCP evidence JSONL files
2. **`idle-guard`**: Validates heartbeat NDJSON files  
3. **`dev-mcp-ban`**: Scans for Dev MCP imports
4. **`all-guards`**: Aggregates results and fails if any guard fails

**When Guards Run:**
- Pull request events (opened, synchronize, reopened)
- Push to main branch
- Manual trigger via GitHub Actions UI

**Guard Status:**
- ✅ **PASS**: All checks successful, merge allowed
- ❌ **FAIL**: One or more guards failed, merge blocked
- ⏳ **PENDING**: Guards still running

## Required Checks on Main Branch

To make these guards merge blockers, configure the following as required checks:

1. **Guard MCP** - `guard-mcp`
2. **Idle Guard** - `idle-guard`  
3. **Dev MCP Ban** - `dev-mcp-ban`
4. **All Guards** - `all-guards`

## PR Template Requirements

All PRs must include these sections:

```markdown
## MCP Evidence (required for code changes)
- artifacts/<agent>/<date>/mcp/<tool>.jsonl
- (or state "No MCP usage - non-code change")

## Heartbeat (if task >2 hours)
- [ ] Heartbeat files present: artifacts/<agent>/<date>/heartbeat.ndjson
- [ ] OR task completed in single session (<2 hours, no heartbeat required)

## Dev MCP Check (CRITICAL - Production Safety)
- [ ] No Dev MCP imports in runtime bundles (prod code only)
- [ ] Verified: No `mcp.*dev` or `dev.*mcp` imports in app/ (searched with grep)
```

## Evidence File Formats

### MCP Evidence JSONL Format
```json
{"tool":"shopify-dev|context7|web-search","doc_ref":"<url>","request_id":"<id>","timestamp":"2025-10-21T14:30:00Z","purpose":"Learn Polaris Card component"}
```

### Heartbeat NDJSON Format
```json
{"timestamp":"2025-10-21T14:00:00Z","task":"ENG-042","status":"doing","progress":"40%","file":"app/components/Modal.tsx"}
{"timestamp":"2025-10-21T14:15:00Z","task":"ENG-042","status":"doing","progress":"65%","file":"app/routes/modal.test.ts"}
{"timestamp":"2025-10-21T14:30:00Z","task":"ENG-042","status":"done","progress":"100%","file":"tests passing"}
```

## Troubleshooting

### Common Issues

1. **MCP Evidence Missing**
   - Ensure JSONL files are committed to repository
   - Check file paths match PR body exactly
   - Validate JSON format in files

2. **Heartbeat Stale**
   - Update heartbeat every 15 minutes for long tasks
   - Set status to "done" when task completes
   - Use single session exemption for <2h tasks

3. **Dev MCP Import Detected**
   - Remove Dev MCP imports from `app/` directory
   - Move to `scripts/`, `tests/`, or `.cursor/`
   - Use production MCP servers in runtime code

### Debug Commands

```bash
# Test MCP evidence validation
node scripts/ci/verify-mcp-evidence.js

# Test heartbeat validation  
node scripts/ci/verify-heartbeat.js

# Test Dev MCP ban
node scripts/ci/verify-dev-mcp-ban.js

# Run all guards locally
npm run ci:guards
```

## Enforcement

- **Merge Blocked**: PRs cannot merge without passing all guards
- **Production Safety**: Dev MCP ban prevents production deployment issues
- **Evidence Required**: MCP evidence ensures tool-first development
- **Activity Tracking**: Heartbeat prevents idle agent issues

## Success Criteria

- [ ] All three CI guard scripts implemented
- [ ] GitHub Actions workflow configured
- [ ] Required checks enabled on main branch
- [ ] PR template updated with guard sections
- [ ] Documentation complete for agents
- [ ] Local testing commands working