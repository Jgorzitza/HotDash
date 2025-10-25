# QA Dispatch Plan — 2025-10-20

**Dispatcher**: QA DISPATCHER (Claude)
**Date**: 2025-10-20
**Status**: READY FOR EXECUTION
**Open PRs**: 5 (PRs #103-107)

---

## Canon Alignment (COMPLETE)

**Read & Internalized**:
- ✅ `docs/NORTH_STAR.md` - Vision: Operator-first control center, HITL workflow, 8 tiles
- ✅ `docs/OPERATING_MODEL.md` - Pipeline: Signals→Suggestions→Approvals→Actions→Audit→Learn
- ✅ `docs/RULES.md` - No ad-hoc .md files, MCP-first, React Router 7 only, design protection
- ✅ `README.md` - Complete vision (Option A), 57 design specs, 38 tasks

**Key Principles**:
1. **Design Spec Compliance**: ALL features match `/docs/design/` exactly (70% gaps unacceptable)
2. **MCP-First**: Shopify Dev + Context7 validation MANDATORY (log conversation IDs)
3. **React Router 7 ONLY**: NO `@remix-run` imports (verify with `rg "@remix-run" app/`)
4. **Proof > Prose**: BLOCKERS require evidence (screenshot, HAR, console, test output)
5. **HITL Quality**: Grading sliders (tone/accuracy/policy 1-5) for all customer-facing
6. **No Ad-Hoc Files**: Use feedback files, never create STATUS/URGENT/PLAN .md files

---

## Open PRs Requiring QA Dispatch

### PR #107: engineer: P1 server fix + utilities (partial)
- **Branch**: `engineer/oct19-p1-server-fix-partial`
- **Agent**: Engineer
- **Status**: OPEN (2025-10-20T02:55:05Z)
- **Scope**: Server startup fixes, utility functions
- **QA Priority**: P1 (server stability critical)

### PR #106: devops: CI/CD hardening (60% - partial)
- **Branch**: `devops/oct19-partial-ci-deploy-hardening`
- **Agent**: DevOps
- **Status**: OPEN (2025-10-20T02:51:34Z)
- **Scope**: CI/CD guardrails, deployment hardening
- **QA Priority**: P1 (infrastructure security)

### PR #105: ads: Campaign system (65% - partial)
- **Branch**: `ads/oct19-partial-campaign-system`
- **Agent**: Ads
- **Status**: OPEN (2025-10-20T02:51:22Z)
- **Scope**: Ads campaign tracking, metrics
- **QA Priority**: P2 (feature work)

### PR #104: manager: Direction updates + date corrections (all agents)
- **Branch**: `manager/oct19-direction-updates-v2`
- **Agent**: Manager
- **Status**: OPEN (2025-10-20T02:50:35Z)
- **Scope**: Agent direction files, documentation
- **QA Priority**: P1 (governance docs)

### PR #103: seo: Anomaly triage runbook + 100% tests
- **Branch**: `seo/oct19-anomaly-triage`
- **Agent**: SEO
- **Status**: OPEN (2025-10-20T02:49:38Z)
- **Scope**: SEO anomaly detection, runbooks
- **QA Priority**: P2 (feature work)

---

## Dispatch Strategy

### Phase 1: High-Priority PRs (P1) - IMMEDIATE
**PRs**: #104 (manager), #106 (devops), #107 (engineer)

**Rationale**: Governance docs and infrastructure changes affect all agents

### Phase 2: Feature PRs (P2) - NEXT
**PRs**: #103 (seo), #105 (ads)

**Rationale**: Feature work can proceed after infrastructure is stable

---

## Sub-Agent Assignments

### 1. qa-pr-diff-reviewer
**Scope**: ALL 5 PRs (unified diff analysis)
**Checks**:
- Issue linkage (`Fixes #<issue>`)
- Allowed paths adherence
- DoD completeness
- MCP evidence logged
- NO `@remix-run` imports
- Design spec references (if UI/UX work)
- No ad-hoc .md files created

**Output**: `reports/qa/pr/pr_{NUMBER}_diff_review.md`

---

### 2. qa-e2e-shopify-admin
**Scope**: PR #107 (if UI changes), PR #105 (if UI changes)
**Target**: https://admin.shopify.com/store/hotroddash/apps/hotdash
**Checks**:
- No uncaught exceptions after app mount
- Console.error count = 0 on happy path
- First paint <3s
- Tiles load correctly
- Modals open/close
- Navigation functional

**Output**: `reports/qa/e2e/{PR}/`
- `e2e_results.md`
- `har_files/`
- `screenshots/`
- `console_logs.txt`

**Evidence**: Chrome DevTools MCP required

---

### 3. api-contract-validator
**Scope**: PR #107 (if API changes), PR #105 (ads metrics API)
**Checks**:
- Shopify GraphQL validated with MCP (conversation IDs logged)
- Request/response examples documented
- Breaking changes flagged
- Error surfaces documented (timeouts, retries, rate limits)
- Supabase RLS policies present
- API contracts match design specs

**Output**: `reports/qa/api/{PR}/`
- `api_contract_validation.md`
- `pacts/` (contract test artifacts)
- `graphql_validation.md`

**Evidence**: Shopify Dev MCP conversation IDs required

---

### 4. mcp-tools-qa
**Scope**: ALL PRs (MCP evidence verification)
**Checks**:
- Shopify Dev MCP: `validate_graphql_codeblocks` used
- Context7 MCP: React Router 7 patterns verified
- Conversation IDs logged in feedback files
- NO Shopify code without MCP validation
- NO library usage without Context7 verification

**Output**: `reports/qa/mcp/{PR}/mcp_evidence_audit.md`

**Enforcement**: BLOCKER if MCP evidence missing

---

### 5. qa-a11y-polaris
**Scope**: PR #107 (if UI changes), PR #105 (if UI changes)
**Checks**:
- WCAG 2.2 AA compliance
- Polaris component usage correct
- Keyboard navigation functional
- Screen reader compatibility
- Color contrast ratios
- Focus management
- ARIA attributes proper

**Output**: `reports/qa/a11y/{PR}/`
- `a11y_audit.md`
- `axe_results.json`
- `polaris_compliance.md`

**Severity**:
- WCAG A failures → BLOCKER
- WCAG AA issues → WARN

---

### 6. qa-sec-scanner
**Scope**: ALL 5 PRs
**Checks**:
- NO secrets in diff (Gitleaks)
- Dependency updates scanned (npm audit, OSV)
- Outbound domain changes approved
- RLS policies present on new tables
- No PII in logs
- GitHub Push Protection honored

**Output**: `reports/qa/sec/{PR}/`
- `security_scan.md`
- `gitleaks_report.json`
- `dependency_audit.md`
- `domain_allowlist_changes.md`

**Evidence**: Gitleaks output, npm audit results

---

### 7. docs-qa-validator
**Scope**: PR #104 (manager docs), ALL PRs (if .md changes)
**Checks**:
- New/changed .md in canonical paths (RULES.md allow-list)
- Internal links resolve
- No ad-hoc .md files (STATUS, URGENT, PLAN, etc.)
- Root .md count ≤ 6
- 3-Question Test passed for any new files
- Design file protection honored (no deletions in `/docs/design/**`)

**Output**: `reports/qa/docs/{PR}/`
- `docs_validation.md`
- `link_check.md`
- `canonical_path_audit.md`

**Enforcement**: BLOCKER if ad-hoc .md files created

---

### 8. qa-data-telemetry
**Scope**: PR #105 (ads metrics), PR #103 (SEO anomalies)
**Checks**:
- NO PII in GA4 events or logs
- Event schemas documented
- Sampling/cardinality changes flagged
- GSC export scripts stable
- Analytics endpoints tested
- Data pipeline health

**Output**: `reports/qa/data/{PR}/`
- `data_telemetry_audit.md`
- `ga4_events_validation.md`
- `pii_check.md`

---

## Quality Bars (ENFORCE)

### BLOCKERS (Must Fix Before Merge)
1. **Secrets in diff** (Gitleaks failure)
2. **WCAG A failures** (accessibility)
3. **Uncaught exceptions** in Admin surface
4. **Breaking API changes** without documentation
5. **Missing MCP evidence** (Shopify/library code)
6. **@remix-run imports** present
7. **Ad-hoc .md files** created
8. **Design file deletions** without CEO approval
9. **Issue linkage missing** (`Fixes #<issue>`)
10. **Allowed paths violated**

### WARNINGS (Should Fix Soon)
1. **WCAG AA issues** (accessibility)
2. **console.error** on non-critical paths
3. **Missing design spec references** (UI work)
4. **Incomplete DoD** checkboxes
5. **Performance degradation** (P95 >3s)
6. **Minimal implementation** (30% vs. designed features)

---

## Execution Plan

### Step 1: Fan-Out to Sub-Agents (PARALLEL)
Execute all 8 agents concurrently on assigned PRs:
- `qa-pr-diff-reviewer`: PRs #103-107
- `qa-e2e-shopify-admin`: PRs #105, #107 (if UI)
- `api-contract-validator`: PRs #105, #107 (if API)
- `mcp-tools-qa`: PRs #103-107
- `qa-a11y-polaris`: PRs #105, #107 (if UI)
- `qa-sec-scanner`: PRs #103-107
- `docs-qa-validator`: PR #104 + any .md changes
- `qa-data-telemetry`: PRs #103, #105

**Timeline**: 30-60 minutes per agent

---

### Step 2: Collection & Normalization
Require each agent to write artifacts to assigned folders:
- `reports/qa/pr/{PR}/`
- `reports/qa/e2e/{PR}/`
- `reports/qa/api/{PR}/`
- `reports/qa/mcp/{PR}/`
- `reports/qa/a11y/{PR}/`
- `reports/qa/sec/{PR}/`
- `reports/qa/docs/{PR}/`
- `reports/qa/data/{PR}/`

**Format**: Markdown with artifact links, normalized severity (BLOCKER/WARN/NOTE)

---

### Step 3: Consolidated Reports
For each PR, produce:
`reports/manager/2025-10-20/qa_consolidated_{PR_NUMBER}.md`

**Contents**:
- Summary table by agent (pass/blocker/warn counts)
- BLOCKERS (grouped by theme): file/route/endpoint → evidence link(s) → exact next step
- WARNINGS: ditto
- Green signals (what's proven working)
- "Next 24–48h" actions mapped to owners (by agent/role)
- Draft PR comment body (Manager can post)

---

### Step 4: PR Comments
Single consolidated comment per PR with:
- Executive summary (PASS/BLOCKER/WARN)
- Top 5 blockers with evidence links
- Top 5 warnings with evidence links
- Artifact folder links
- Next actions with owners

---

## Success Criteria

### QA Dispatch Complete When:
- ✅ ALL 8 agents have run (or N/A with justification)
- ✅ ALL PRs have consolidated reports
- ✅ ALL BLOCKERS have evidence + next steps
- ✅ PR comment bodies ready for Manager to post
- ✅ Artifact links verified (all paths exist)

---

## Escalation Protocol

### Direction Conflicts
If `docs/directions/*.md` conflict:
- Prefer most recent Manager file
- Note conflict in consolidated report
- Request Manager clarification

### Proof Gaps
If requested proof cannot be gathered (e.g., auth blocked):
- Produce self-contained repro recipe
- Mark item NOT VERIFIED
- Escalate to Manager with unblock request

---

## Execution Status

**Status**: AWAITING MANAGER APPROVAL TO EXECUTE

**Next Actions**:
1. Manager reviews this dispatch plan
2. Manager approves execution (or provides adjustments)
3. QA Dispatcher fans out to 8 sub-agents
4. Sub-agents execute in parallel (30-60 min)
5. QA Dispatcher collects and consolidates
6. Manager reviews consolidated reports
7. Manager posts PR comments or requests fixes

---

## Timeline

**Plan Creation**: 2025-10-20T00:45:00Z
**Estimated Execution**: 60-90 minutes (parallel agent execution)
**Estimated Consolidation**: 30 minutes
**Total**: ~2 hours from approval to consolidated reports

---

**QA DISPATCHER**: Ready to execute on Manager approval 🚀
