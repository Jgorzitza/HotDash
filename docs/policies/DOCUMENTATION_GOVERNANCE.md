---
epoch: 2025.10.E1
doc: docs/policies/DOCUMENTATION_GOVERNANCE.md
owner: manager
created: 2025-10-12T23:40:00Z
classification: POLICY - MANDATORY COMPLIANCE
enforcement: STRICT - ALL AGENTS MUST FOLLOW
---

# 📋 DOCUMENTATION GOVERNANCE POLICY

**Purpose**: Ensure consistent, accurate direction for all 18 agents and prevent documentation drift.

**Scope**: All documentation in the HotDash project, especially direction files and runbooks.

**Enforcement**: Strict - violations result in immediate correction and process review.

---

## 🎯 SINGLE SOURCE OF TRUTH HIERARCHY

### Priority Order for Agent Direction:

1. **docs/runbooks/** - Centralized assignment documents (HIGHEST PRIORITY)
2. **docs/directions/** - Agent-specific execution details
3. **feedback/** - Work logging only (NEVER for direction)

**Rule**: Agents check docs/runbooks/ first, then docs/directions/, never feedback/ for direction.

---

## 📝 DIRECTION FILE REQUIREMENTS

### Mandatory Sections (All Direction Files Must Have):

1. **START HERE NOW** section with:
   - Specific tasks and commands
   - MCP tool requirements
   - Timeline estimates
   - Success metrics

2. **MCP Tools Required** section with:
   - Explicit MCP tool names
   - Specific function calls
   - Forbidden practices

3. **Timeline** section with:
   - Hour/minute estimates
   - Checkpoint times
   - Completion deadlines

### Validation Process:

**Before Any Major Assignment Update**:
1. Create/update centralized assignment document in docs/runbooks/
2. Update all affected agent direction files
3. Run validation script to verify required sections
4. Announce changes in feedback/manager.md

**After Updates**:
1. Monitor feedback for confusion or misaligned work
2. Correct immediately if issues found
3. Update process if systemic problems identified

---

## 🚫 FORBIDDEN PRACTICES

### Documentation Violations:

1. **Creating New Direction Files** - Agents must not create new .md files without manager approval
2. **Editing Direction Files** - Agents must not modify direction files; request changes via manager
3. **Using Feedback for Direction** - Agents must not use feedback/ for direction guidance
4. **Multiple Sources of Truth** - Only one current assignment document per major initiative

### Communication Violations:

1. **Not Checking Centralized Documents** - Agents must check docs/runbooks/ for assignments
2. **Not Following MCP Requirements** - Agents must use specified MCP tools, not alternatives
3. **Working on Deprecated Tasks** - Agents must not work on tasks marked as "DO NOT WORK ON"

---

## ⚠️ SPECIFIC PROHIBITIONS

### GDPR Work (STRICTLY FORBIDDEN):
- **DO NOT WORK ON GDPR** - Explicit manager directive
- **DO NOT WORK ON CCPA** - Explicit manager directive
- **DO NOT WORK ON Privacy Compliance** - Focus on security only
- **Violation**: Immediate work stoppage and manager notification required

### MCP Tool Usage (MANDATORY):
- **Shopify Work** → Shopify MCP (mcp_shopify_*)
- **React Router 7** → Context7 MCP (mcp_context7_*)
- **Database Work** → Supabase MCP (mcp_supabase_*)
- **Fly Deployments** → Fly MCP (mcp_fly_*)
- **Git Operations** → GitHub MCP (mcp_github-official_*)
- **File Searching** → grep tool (MANDATORY - no manual searching)

### Forbidden Alternatives:
- ❌ fly CLI (use Fly MCP)
- ❌ psql (use Supabase MCP)
- ❌ Manual file searching (use grep)
- ❌ Guessing React patterns (use Context7 MCP)

---

## 🔧 PROCESS FOR DIRECTION UPDATES

### Manager Process:
1. **Create/Update Assignment Document** in docs/runbooks/
2. **Update All Affected Direction Files** with START HERE NOW sections
3. **Run Validation Script** to verify required sections
4. **Announce Changes** in feedback/manager.md
5. **Monitor Compliance** for 24 hours after changes

### Agent Process:
1. **Check docs/runbooks/** first for assignments
2. **Use docs/directions/** for detailed execution
3. **Log work in feedback/** only
4. **Request clarification** if confused (do not guess)

### Escalation Process:
1. **Agent Confusion** → Ask in feedback/<agent>.md
2. **Manager Response** → Update direction files and announce
3. **Process Issues** → Update this governance document

---

## 📊 COMPLIANCE MONITORING

### Daily Checks:
- **Direction File Validation**: Automated script runs daily
- **Documentation Consistency**: Manager review of assignment documents
- **Agent Confusion Reports**: Monitor feedback for direction-related questions

### Weekly Reviews:
- **Process Effectiveness**: Review documentation governance
- **Agent Compliance**: Check for direction violations
- **Update Needs**: Identify process improvements

### Incident Response:
- **Immediate Correction**: Fix direction inconsistencies within 1 hour
- **Root Cause Analysis**: Document why issue occurred
- **Process Improvement**: Update governance to prevent recurrence

---

## 🎯 SUCCESS METRICS

### Documentation Quality:
- **Direction File Compliance**: 100% of agents have required sections
- **Documentation Consistency**: 0% conflicting direction sources
- **Agent Confusion Reports**: <1 per week
- **Update Time**: <30 minutes for major direction changes

### Process Effectiveness:
- **Missed Updates**: 0% (automated validation)
- **Documentation Drift**: 0% (single source of truth)
- **Agent Alignment**: 100% (all agents following current assignments)
- **Execution Velocity**: Maintained or improved

---

## 📋 ENFORCEMENT

### Violations:
1. **Missing START HERE NOW Section** → Immediate correction required
2. **No MCP Tool References** → Immediate correction required
3. **Working on Forbidden Tasks** (GDPR, etc.) → Immediate work stoppage
4. **Using Wrong Documentation Sources** → Immediate clarification

### Consequences:
1. **First Violation**: Immediate correction and process review
2. **Repeated Violations**: Process improvement requirements
3. **Systemic Issues**: Governance document update

---

## 🚀 CONTINUOUS IMPROVEMENT

### Process Evolution:
- **Regular Review**: This policy reviewed monthly
- **Agent Feedback**: Process improvement suggestions welcome
- **Effectiveness Tracking**: Metrics reviewed weekly
- **Update Process**: Changes documented and announced

### Automation Goals:
- **Validation Script**: Automated checking of direction file requirements
- **Update Script**: Batch update of multiple direction files
- **Notification System**: Automated alerts for direction changes
- **Compliance Dashboard**: Real-time direction file health monitoring

---

**Policy Effective**: 2025-10-12T23:40:00Z
**Review Date**: 2025-11-12 (30 days)
**Enforcement**: Immediate - all agents must comply
**Owner**: Manager (exclusive authority for direction file modifications)

---

**Manager Note**: This governance policy prevents the documentation management failures that led to the 7/18 agents missing START HERE NOW sections incident. Strict compliance required from all agents.

