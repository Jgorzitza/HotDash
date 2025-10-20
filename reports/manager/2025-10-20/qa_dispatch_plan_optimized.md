# QA Dispatch Plan — OPTIMIZED (2025-10-20)

**Dispatcher**: QA DISPATCHER (Claude)
**Date**: 2025-10-20T01:00:00Z
**Status**: OPTIMIZED & READY FOR EXECUTION

---

## Optimization Analysis

### PR Priority Assessment

**P1 CRITICAL (Infrastructure & Governance)**:
- PR #104: Manager docs (1089 additions, 48 deletions) - ALL agent directions updated
- PR #106: DevOps CI/CD (1904 additions) - Workflows, secrets, rollback
- PR #107: Engineer utilities (1339 additions) - Core libraries, approvals service

**P2 FEATURES (Can Wait)**:
- PR #105: Ads campaign (defer until P1s merged)
- PR #103: SEO runbook (defer until P1s merged)

**Rationale**: Infrastructure and governance changes affect all agents. Block these first to prevent cascading issues.

---

## OPTIMIZED Dispatch Strategy

### Focus: 3 PRs, Smart Agent Selection

Instead of 8 agents × 5 PRs (40 invocations), use:
- **7 agents × 3 PRs = 21 targeted checks**
- Skip redundant checks
- Batch where possible

---

## Agent Assignments (OPTIMIZED)

### 1. qa-pr-diff-reviewer → ALL 3 PRs (P1)
**Why**: Every PR needs diff analysis, issue linkage, DoD checks
**PRs**: #104, #106, #107
**Output**: `reports/qa/pr/pr_{104,106,107}_diff_review.md`
**Key Checks**:
- ✅ Issue linkage present
- ✅ Allowed paths adherence
- ✅ DoD completeness
- ✅ No @remix-run imports
- ✅ No ad-hoc .md files

---

### 2. docs-qa-validator → PR #104 (CRITICAL)
**Why**: Manager updated all 16 agent direction files - canonical path validation critical
**PRs**: #104 only (but also scan #106, #107 for any .md changes)
**Output**: `reports/qa/docs/104/docs_validation.md`
**Key Checks**:
- ✅ All .md in canonical paths (RULES.md allow-list)
- ✅ No ad-hoc .md files (URGENT_DATE_CORRECTION.md flagged!)
- ✅ Root .md count ≤ 6
- ✅ Internal links resolve
- ✅ 3-Question Test passed

**ALERT**: PR #104 creates `docs/directions/URGENT_DATE_CORRECTION.md` - FORBIDDEN PATTERN!

---

### 3. qa-sec-scanner → ALL 3 PRs (P1)
**Why**: Security is non-negotiable for all infrastructure PRs
**PRs**: #104, #106, #107 (batch scan)
**Output**: `reports/qa/sec/batch_scan_p1_prs.md`
**Key Checks**:
- ✅ NO secrets in diffs (Gitleaks)
- ✅ Dependency updates safe (npm audit)
- ✅ No PII in logs
- ✅ RLS on new tables

---

### 4. mcp-tools-qa → PR #107 (Engineer utilities)
**Why**: Engineer created new service files - must have MCP validation evidence
**PRs**: #107 only (Shopify/library code)
**Output**: `reports/qa/mcp/107/mcp_evidence_audit.md`
**Key Checks**:
- ✅ Shopify Dev MCP: `approvals.ts` validated?
- ✅ Context7 MCP: React Router 7 patterns verified?
- ✅ Conversation IDs logged in `feedback/engineer/2025-10-19.md`?
- ✅ NO @remix-run imports (verify with rg)

---

### 5. api-contract-validator → PR #107 (Engineer utilities)
**Why**: `approvals.ts` + `http.server.ts` are new API utilities
**PRs**: #107 only
**Output**: `reports/qa/api/107/api_contract_validation.md`
**Key Checks**:
- ✅ Approvals service functions documented
- ✅ HTTP helpers error handling
- ✅ Type safety (LoaderFunctionArgs, etc.)
- ✅ No breaking changes

---

### 6. qa-e2e-shopify-admin → PR #107 (IF UI changes)
**Why**: If engineer touched UI routes, test live app
**PRs**: #107 (check if app routes changed)
**Output**: `reports/qa/e2e/107/e2e_results.md` OR SKIP
**Decision**: SKIP if no UI changes (check diff first)

---

### 7. qa-a11y-polaris → SKIP ALL (No UI PRs)
**Why**: None of these 3 PRs touch UI components
**Decision**: SKIP for now, revisit when UI PRs arrive

---

### 8. qa-data-telemetry → SKIP ALL (No analytics PRs)
**Why**: No GA4/GSC changes in P1 PRs
**Decision**: SKIP for now, revisit for PR #105 (ads)

---

## Optimized Execution Plan

### Phase 1: Critical Blockers (IMMEDIATE)
**Run in parallel**:
1. `qa-pr-diff-reviewer` → PRs #104, #106, #107 (15 min)
2. `docs-qa-validator` → PR #104 (10 min)
3. `qa-sec-scanner` → Batch scan all 3 PRs (15 min)

**Expected**: 3 agents × 15 min = ~15 min total (parallel)

---

### Phase 2: Deep Dives (NEXT)
**Run in parallel**:
4. `mcp-tools-qa` → PR #107 (20 min)
5. `api-contract-validator` → PR #107 (20 min)

**Expected**: 2 agents × 20 min = ~20 min total (parallel)

---

### Phase 3: Conditional (IF NEEDED)
6. `qa-e2e-shopify-admin` → PR #107 IF UI changes detected (30 min)

**Expected**: 0-30 min depending on diff analysis

---

## Total Timeline

**Optimized**: 35-65 minutes (vs. 120+ minutes in original plan)
**Agents Used**: 5-6 (vs. 8 in original plan)
**PRs Covered**: 3 P1s (vs. 5 in original plan)

**Efficiency Gain**: ~50% faster, focused on what matters

---

## Expected Findings (Predictions)

### PR #104 (Manager docs) - LIKELY BLOCKERS
1. ❌ **URGENT_DATE_CORRECTION.md** in forbidden pattern
   - Violates "No ad-hoc files" rule
   - Should be in `feedback/manager/*.md` instead
   - **Action**: Delete file, move content to feedback

2. ⚠️ **Large direction file changes** (16 files)
   - Need to verify all internal links resolve
   - Check for stale task references

### PR #106 (DevOps CI/CD) - LIKELY PASS
1. ✅ CI workflows are allowed paths (`.github/workflows/`)
2. ✅ Runbooks are allowed (`docs/runbooks/`)
3. ⚠️ Check secrets not hardcoded in workflows

### PR #107 (Engineer utilities) - NEEDS MCP EVIDENCE
1. ⚠️ **MCP evidence required** for `approvals.ts`
   - Must show Shopify Dev MCP validation
   - Must show Context7 verification of React Router 7
2. ⚠️ Check for @remix-run imports (likely clean)
3. ✅ Utilities are in correct paths (`app/lib/`, `app/utils/`)

---

## Consolidated Output

After agents complete, produce:
1. `reports/manager/2025-10-20/qa_consolidated_pr_104.md`
2. `reports/manager/2025-10-20/qa_consolidated_pr_106.md`
3. `reports/manager/2025-10-20/qa_consolidated_pr_107.md`

Each with:
- Executive summary (PASS/BLOCKER/WARN)
- Agent findings table
- Blockers with evidence + next steps
- Warnings with recommendations
- Draft PR comment body

---

## Decision Point: EXECUTE?

**Recommendation**: YES, execute optimized plan

**Why**:
- ✅ Focused on P1 critical PRs
- ✅ Smart agent selection (no redundancy)
- ✅ 50% faster than original plan
- ✅ Likely to find 1 BLOCKER (URGENT_DATE_CORRECTION.md)
- ✅ Clear next steps for Manager

**Alternative**: If you want even faster, I can:
- Run only `qa-pr-diff-reviewer` + `docs-qa-validator` (10 min)
- Flag the URGENT_DATE_CORRECTION.md blocker
- Skip deeper checks until blocker is fixed

**Your call**: Execute optimized plan, or go even faster?

---

## Execution Command (When Approved)

```
EXECUTE:
- Phase 1: qa-pr-diff-reviewer, docs-qa-validator, qa-sec-scanner (parallel)
- Phase 2: mcp-tools-qa, api-contract-validator (parallel)
- Consolidate results
- Report blockers to Manager
```

**Status**: AWAITING YOUR GO/NO-GO 🚀
