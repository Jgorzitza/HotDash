# DevOps Direction v7.0 — Growth Engine Integration

📌 **FIRST ACTION: Git Setup**
```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251021
git pull origin manager-reopen-20251021
```

**Owner**: Manager  
**Effective**: 2025-10-21T16:45Z  
**Version**: 7.0  
**Status**: ACTIVE — Phase 10 CI Guards + Phase 11 GA4 Config (Growth Engine)

---

## ✅ PREVIOUS WORK COMPLETE

**Completed** (from feedback/devops/2025-10-21.md):
- ✅ DEVOPS-001: P0 deployment v74 (healthy after v72/v73 crashes)
- ✅ DEVOPS-002-005: CI/CD, monitoring, migrations, rollback
- ✅ DEVOPS-007-012: Analytics tables, APM, workflows, monitoring, log aggregation
- ⏸️ DEVOPS-006: DATA-006 indexes (blocked - network issue, Manager will apply)

**Total Output**: 6 workflows, 2 monitoring scripts, 3 runbooks, v74 healthy, 14 MCP calls

**Lesson Learned**: ALWAYS use mcp_fly_fly-logs BEFORE escalating issues

---

## 🎯 NEW: Growth Engine Architecture (Effective 2025-10-21)

**Context**: Growth Engine Final Pack integrated into project (commit: 546bd0e)

### Security & Evidence Requirements (CI Merge Blockers)
1. **MCP Evidence JSONL** (code changes): `artifacts/devops/<date>/mcp/<tool>.jsonl`
2. **Heartbeat NDJSON** (tasks >2h): `artifacts/devops/<date>/heartbeat.ndjson` (15min max staleness)
3. **Dev MCP Ban**: NO Dev MCP imports in `app/` (production code only)
4. **PR Template**: Must include MCP Evidence + Heartbeat + Dev MCP Check sections

**See**: `.cursor/rules/10-growth-engine-pack.mdc` for full requirements

---

## 🚀 PHASE 10: CI Guards Enhancement (4 hours) — P1 PRIORITY

**Objective**: Enhance existing CI workflows with MCP Evidence, Heartbeat, and Dev MCP Ban checks

### Context

**Growth Engine Pack Requirements**:
- **guard-mcp**: Verify MCP evidence JSONL files exist and valid
- **idle-guard**: Verify heartbeat not stale (>15min) for long tasks
- **dev-mcp-ban**: FAIL if Dev MCP imports in `app/` (production safety)

**CI Enforcement**: These are CI merge blockers (PRs cannot merge without compliance)

---

### DEVOPS-014: CI Guards Implementation (4h)

**File 1**: `scripts/ci/verify-mcp-evidence.js` (NEW)

**Purpose**: Verify MCP Evidence JSONL files from PR

```javascript
// Parse PR body for MCP Evidence section
// Extract JSONL file paths
// Verify files exist
// Validate JSONL format

const fs = require('fs');
const path = require('path');

function parsePRBody(prBody) {
  // Extract MCP Evidence section
  const match = prBody.match(/## MCP Evidence.*?\n([\s\S]*?)\n##/);
  if (!match) {
    throw new Error("MCP Evidence section missing from PR body");
  }
  
  const section = match[1];
  
  // Check for "non-code change" exemption
  if (section.includes("No MCP usage - non-code change")) {
    console.log("✅ Non-code change - MCP evidence not required");
    return null;
  }
  
  // Extract file paths (artifacts/<agent>/<date>/mcp/*.jsonl)
  const pathMatches = section.matchAll(/artifacts\/([^\/]+)\/([^\/]+)\/mcp\/([^\s]+\.jsonl)/g);
  const paths = Array.from(pathMatches).map(m => m[0]);
  
  if (paths.length === 0) {
    throw new Error("No MCP evidence JSONL paths found in PR body");
  }
  
  return paths;
}

function validateJSONL(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`MCP evidence file not found: ${filePath}`);
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.trim().split('\n');
  
  if (lines.length === 0) {
    throw new Error(`MCP evidence file is empty: ${filePath}`);
  }
  
  // Validate each line is valid JSON
  lines.forEach((line, idx) => {
    try {
      const obj = JSON.parse(line);
      
      // Verify required fields
      if (!obj.tool || !obj.timestamp) {
        throw new Error(`Line ${idx + 1}: Missing required fields (tool, timestamp)`);
      }
    } catch (error) {
      throw new Error(`Line ${idx + 1} is not valid JSON: ${error.message}`);
    }
  });
  
  console.log(`✅ Valid JSONL: ${filePath} (${lines.length} entries)`);
}

async function main() {
  const prBody = process.env.PR_BODY;
  
  if (!prBody) {
    throw new Error("PR_BODY environment variable not set");
  }
  
  const paths = parsePRBody(prBody);
  
  if (paths === null) {
    // Non-code change exemption
    process.exit(0);
  }
  
  // Validate all files
  paths.forEach(validateJSONL);
  
  console.log(`\n✅ MCP Evidence Check PASSED: ${paths.length} file(s) validated`);
}

main().catch(error => {
  console.error(`\n❌ MCP Evidence Check FAILED: ${error.message}`);
  process.exit(1);
});
```

**File 2**: `scripts/ci/verify-heartbeat.js` (NEW)

**Purpose**: Verify heartbeat not stale for long-running tasks

```javascript
const fs = require('fs');

function parseHeartbeatSection(prBody) {
  const match = prBody.match(/## Heartbeat.*?\n([\s\S]*?)\n##/);
  if (!match) {
    throw new Error("Heartbeat section missing from PR body");
  }
  
  const section = match[1];
  
  // Check for "<2h single session" exemption
  if (section.includes("<2h single session") || section.includes("<2 hours")) {
    console.log("✅ Single session (<2h) - heartbeat not required");
    return null;
  }
  
  // Extract heartbeat file path
  const pathMatch = section.match(/artifacts\/([^\/]+)\/([^\/]+)\/heartbeat\.ndjson/);
  if (!pathMatch) {
    throw new Error("No heartbeat file path found in PR body");
  }
  
  return pathMatch[0];
}

function verifyHeartbeat(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Heartbeat file not found: ${filePath}`);
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.trim().split('\n');
  
  if (lines.length === 0) {
    throw new Error(`Heartbeat file is empty: ${filePath}`);
  }
  
  // Parse last heartbeat
  const lastLine = lines[lines.length - 1];
  const lastHeartbeat = JSON.parse(lastLine);
  
  if (!lastHeartbeat.timestamp) {
    throw new Error("Last heartbeat missing timestamp");
  }
  
  // Check staleness (should be within 15 minutes of task completion)
  const lastTimestamp = new Date(lastHeartbeat.timestamp);
  const now = new Date();
  const minutesAgo = (now - lastTimestamp) / 1000 / 60;
  
  console.log(`Last heartbeat: ${lastHeartbeat.timestamp} (${minutesAgo.toFixed(1)} minutes ago)`);
  
  // Only fail if task is "doing" and stale >15min
  // If task is "done", we don't enforce staleness
  if (lastHeartbeat.status === 'doing' && minutesAgo > 15) {
    throw new Error(`Heartbeat stale: Last update ${minutesAgo.toFixed(1)} minutes ago (>15min threshold)`);
  }
  
  console.log(`✅ Heartbeat OK: ${lines.length} entries`);
}

async function main() {
  const prBody = process.env.PR_BODY;
  
  if (!prBody) {
    throw new Error("PR_BODY environment variable not set");
  }
  
  const path = parseHeartbeatSection(prBody);
  
  if (path === null) {
    // Single session exemption
    process.exit(0);
  }
  
  verifyHeartbeat(path);
  
  console.log(`\n✅ Heartbeat Check PASSED`);
}

main().catch(error => {
  console.error(`\n❌ Heartbeat Check FAILED: ${error.message}`);
  process.exit(1);
});
```

**File 3**: `.github/workflows/deploy-staging.yml` (UPDATE)

**Add CI Guards**:

```yaml
name: Deploy to Staging

on:
  push:
    branches:
      - manager-reopen-*
      - daily/*
  workflow_dispatch:

jobs:
  ci-guards:
    name: CI Guards (MCP Evidence, Heartbeat, Dev MCP Ban)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Get PR Body
        if: github.event_name == 'pull_request'
        id: pr
        uses: actions/github-script@v7
        with:
          script: |
            const pr = await github.rest.pulls.get({
              owner: context.repo.owner,
              repo: context.repo.repo,
              pull_number: context.issue.number
            });
            core.setOutput('body', pr.data.body);
      
      - name: Verify MCP Evidence
        if: github.event_name == 'pull_request'
        env:
          PR_BODY: ${{ steps.pr.outputs.body }}
        run: node scripts/ci/verify-mcp-evidence.js
      
      - name: Verify Heartbeat
        if: github.event_name == 'pull_request'
        env:
          PR_BODY: ${{ steps.pr.outputs.body }}
        run: node scripts/ci/verify-heartbeat.js
      
      - name: Dev MCP Ban Check
        run: |
          echo "Checking for Dev MCP imports in production code..."
          
          # Fail if Dev MCP found in app/
          if grep -r "mcp.*dev\|dev.*mcp" app/ --include="*.ts" --include="*.tsx" -i; then
            echo "❌ Dev MCP imports detected in production code (app/ directory)"
            echo "Dev MCP is for development/staging ONLY"
            exit 1
          fi
          
          echo "✅ No Dev MCP imports found in production code"

  deploy:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: ci-guards
    # ... rest of deployment job
```

**Acceptance**:
- ✅ MCP evidence verification script (parse PR, validate JSONL)
- ✅ Heartbeat verification script (parse PR, check staleness)
- ✅ Dev MCP ban check (grep app/ for Dev MCP imports)
- ✅ Enhanced deploy-staging.yml workflow
- ✅ CI guards run BEFORE deployment
- ✅ Exemptions handled (non-code change, <2h tasks)
- ✅ Clear error messages

**MCP Required**: 
- Context7 → GitHub Actions workflow syntax

---

## 🔄 PHASE 11: GA4 Custom Dimension Configuration (1 hour) — P0 CRITICAL

**Objective**: Create GA4 custom dimension `hd_action_key` for action attribution

### Context

**GA4 Property**: 339826228  
**Custom Dimension**: `hd_action_key` (event scope)  
**Purpose**: Track which approved action led to revenue (7d/14d/28d windows)

**Flow**:
```
1. Action approved → action_key generated: "seo-fix-powder-board-2025-10-21"
2. User clicks → Engineer's client emits gtag event with hd_action_key
3. Analytics service queries GA4 for hd_action_key performance
4. Action Queue re-ranks based on realized ROI
```

---

### DEVOPS-015: GA4 Custom Dimension Setup (1h)

**Manual Steps** (GA4 Admin Console):

1. **Login to GA4**:
   - Navigate to https://analytics.google.com/
   - Select Property 339826228

2. **Create Custom Dimension**:
   - Admin → Data display → Custom definitions
   - Click "Create custom dimensions"
   - **Dimension name**: `Action Key`
   - **Scope**: `Event`
   - **Description**: `HotDash Action Queue attribution key (format: type-target-YYYY-MM-DD)`
   - **Event parameter**: `hd_action_key`
   - Click "Save"

3. **Verify Dimension**:
   - Check dimension appears in list
   - Note dimension ID (e.g., `customEvent:hd_action_key`)

4. **Test with DebugView**:
   - Open DebugView in GA4
   - Trigger test event from dev environment:
     ```javascript
     gtag('event', 'page_view', {
       hd_action_key: 'test-product-2025-10-21'
     });
     ```
   - Verify custom dimension appears in DebugView

5. **Document Configuration**:
   - Create `docs/integrations/ga4-custom-dimension.md`:
     ```markdown
     # GA4 Custom Dimension: hd_action_key
     
     **Property**: 339826228
     **Dimension Name**: Action Key
     **Scope**: Event
     **Event Parameter**: hd_action_key
     **Format**: `{type}-{target_slug}-{YYYY-MM-DD}`
     
     **Examples**:
     - `seo-fix-powder-board-2025-10-21`
     - `inventory-reorder-thermal-gloves-2025-10-22`
     - `content-update-home-page-2025-10-23`
     
     **Usage**:
     - Engineer emits in client tracking (ENG-032, 033)
     - Analytics queries via GA4 Data API (ANALYTICS-017)
     - Tracks revenue attribution over 7d/14d/28d windows
     
     **Testing**:
     - Dev environment: Use DebugView to verify
     - Staging: Check real-time reports
     - Production: Verify in Realtime + Standard reports
     ```

6. **Update Environment Variables**:
   - Add to `.env` (local):
     ```
     GA4_PROPERTY_ID=339826228
     GA4_CUSTOM_DIMENSION_ACTION_KEY=customEvent:hd_action_key
     ```
   - Add to Fly.io secrets:
     ```bash
     fly secrets set GA4_PROPERTY_ID=339826228 GA4_CUSTOM_DIMENSION_ACTION_KEY=customEvent:hd_action_key
     ```

**Acceptance**:
- ✅ Custom dimension `hd_action_key` created in GA4
- ✅ Scope = Event
- ✅ Event parameter = `hd_action_key`
- ✅ Tested in DebugView (dimension visible)
- ✅ Documentation created
- ✅ Environment variables updated (local + Fly.io)

**MCP Required**: 
- Context7 → Google Analytics 4 admin setup (if available)
- Web search → "GA4 custom dimensions create event scope" (if needed)

---

## 📋 Acceptance Criteria (All Tasks)

### Phase 10: CI Guards Enhancement (4h)
- ✅ DEVOPS-014: CI guards implementation (MCP evidence, heartbeat, dev-mcp-ban scripts + workflow update)
- ✅ All 3 checks functional
- ✅ Exemptions handled correctly
- ✅ Clear error messages

### Phase 11: GA4 Custom Dimension (1h)
- ✅ DEVOPS-015: GA4 custom dimension created and tested
- ✅ Documentation created
- ✅ Environment variables updated

---

## 🔧 Tools & Resources

### MCP Tools (MANDATORY)
1. **Context7 MCP**: For workflow development
   - GitHub Actions syntax, workflow patterns

2. **Fly MCP**: For secrets management
   - `fly secrets set` commands

3. **Web Search**: If needed for GA4 setup
   - "GA4 custom dimensions create event scope"

### Evidence Requirements (CI Merge Blockers)
1. **MCP Evidence JSONL**: `artifacts/devops/<date>/mcp/ci-guards.jsonl`, `mcp/ga4-config.jsonl`
2. **Heartbeat NDJSON**: `artifacts/devops/<date>/heartbeat.ndjson` (append every 15min if >2h)
3. **Dev MCP Check**: Verify NO Dev MCP imports in `app/`
4. **PR Template**: Fill out all sections

### Testing
- Test MCP evidence verification script (valid/invalid JSONL)
- Test heartbeat verification script (recent/stale)
- Test Dev MCP ban check (should find test imports)
- Test GA4 dimension in DebugView

---

## 🎯 Execution Order

**START NOW** - No idle time:

1. **DEVOPS-014**: CI Guards Implementation (4h) → START IMMEDIATELY
   - Pull Context7: GitHub Actions workflow syntax
   - Create verify-mcp-evidence.js script
   - Create verify-heartbeat.js script
   - Update deploy-staging.yml workflow
   - Test all 3 checks locally
   - Commit and push

2. **DEVOPS-015**: GA4 Custom Dimension (1h)
   - Login to GA4 Property 339826228
   - Create custom dimension `hd_action_key` (event scope)
   - Test in DebugView
   - Document configuration
   - Update environment variables (Fly.io secrets)

**Total**: 5 hours (Phase 10: 4h, Phase 11: 1h)

**Expected Output**:
- 2 CI verification scripts (~300-400 lines)
- 1 updated GitHub Actions workflow
- 1 GA4 custom dimension configured
- 1 documentation file
- Environment variables updated

---

## 🚨 Critical Reminders

1. **NO IDLE**: Start DEVOPS-014 immediately
2. **MCP FIRST**: Pull Context7 docs BEFORE workflow changes
3. **Evidence JSONL**: Create `artifacts/devops/2025-10-21/mcp/` and log every MCP call
4. **Heartbeat**: If >2h, append to `artifacts/devops/2025-10-21/heartbeat.ndjson` every 15min
5. **Test CI Guards**: Run scripts locally before pushing
6. **GA4 Access**: Verify access to Property 339826228 before starting DEVOPS-015
7. **Fly Secrets**: Use `fly secrets set` for environment variables
8. **Feedback**: Update `feedback/devops/2025-10-21.md` every 2 hours

**Questions or blockers?** → Escalate immediately in feedback

**Let's build! 🚀**

---

## ✅ v7.0 Complete + P0 Blockers Cleared (2025-10-21T17:20Z)

DEVOPS-001-013 complete. v74 deployed and healthy. DEVOPS-014 (CI Guards) active.

---

## 🔧 MANDATORY: DEV MEMORY

```typescript
import { logDecision } from '~/services/decisions.server';
await logDecision({
  scope: 'build',
  actor: 'devops',
  action: 'deployment_complete',
  rationale: 'DEVOPS-014: CI guards implemented and tested',
  evidenceUrl: 'artifacts/devops/2025-10-21/ci-guards-complete.md'
});
```

Call at EVERY deployment/infrastructure task.
