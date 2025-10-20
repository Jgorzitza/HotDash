# PR #104 Diff Review

## Executive Summary
- **Status**: BLOCKER
- **Blockers**: 1
- **Warnings**: 2

## Issue Linkage
- [ ] "Fixes #X" present in PR body
- Issue #: NONE (MISSING)

**BLOCKER**: PR body does not contain "Fixes #" or issue linkage

## Allowed Paths Check
- **Declared**: docs/directions/**, feedback/manager/**
- **Actual files**:
  - docs/directions/URGENT_DATE_CORRECTION.md ← FORBIDDEN PATTERN
  - docs/directions/ads.md ✓
  - docs/directions/ai-customer.md ✓
  - docs/directions/ai-knowledge.md ✓
  - docs/directions/analytics.md ✓
  - docs/directions/content.md ✓
  - docs/directions/data.md ✓
  - docs/directions/designer.md ✓
  - docs/directions/devops.md ✓
  - docs/directions/engineer.md ✓
  - docs/directions/integrations.md ✓
  - docs/directions/inventory.md ✓
  - docs/directions/manager.md ✓
  - docs/directions/product.md ✓
  - docs/directions/qa.md ✓
  - docs/directions/seo.md ✓
  - docs/directions/support.md ✓
  - docs/runbooks/agent_startup_checklist.md ✓
  - feedback/manager.md ✓
  - vitest.config.ts ← NOT IN ALLOWED PATHS
- **Compliance**: FAIL

## Forbidden Patterns
- [ ] NO @remix-run imports (verified - N/A for this PR)
- [x] NO ad-hoc .md files (VIOLATION DETECTED)
- **Findings**:
  1. **BLOCKER**: `docs/directions/URGENT_DATE_CORRECTION.md` - Matches forbidden pattern `URGENT_*.md`
  2. **WARN**: `vitest.config.ts` modified but not in declared allowed paths

## DoD Completeness
**PR Body DoD**: Not explicitly stated in PR body

**Expected DoD** (from RULES.md):
- [ ] Acceptance criteria satisfied with tests/evidence
- [ ] Issue linkage present (MISSING)
- [ ] Allowed paths compliance (VIOLATED)
- [ ] No forbidden .md patterns (VIOLATED)
- [ ] CI checks green (cannot verify)

## Blockers

### 1. URGENT_DATE_CORRECTION.md - Forbidden Ad-Hoc File Pattern
- **File:** docs/directions/URGENT_DATE_CORRECTION.md
- **Severity:** BLOCKER
- **Category:** Forbidden Patterns (No Ad-Hoc Files)
- **Description:** File matches forbidden pattern `URGENT_*.md` as specified in NORTH_STAR.md lines 106 and RULES.md line 49. The 3-Question Test was not followed:
  - Q1: Can this go in feedback/manager.md? YES → Should have used that
  - This is a status update that belongs in `feedback/manager/2025-10-19.md`
- **Code:**
  ```markdown
  # 🚨 URGENT: Date Correction for All Agents — 2025-10-19

  **Issue**: Multiple agents wrote feedback to `2025-10-20.md` files
  **Reality**: Today is **October 19, 2025**
  **Action Taken**: All Oct 20 feedback has been consolidated to Oct 19 files
  ```
- **Recommendation:**
  1. Delete `docs/directions/URGENT_DATE_CORRECTION.md`
  2. Move content to `feedback/manager/2025-10-19.md` under "Date Correction Notice"
  3. Update direction files WITHOUT creating ad-hoc notification file
  4. Content in direction files (date correction section) is acceptable

### 2. Missing Issue Linkage
- **File:** PR #104 body
- **Severity:** BLOCKER
- **Category:** Issue Linkage (DoD Requirement)
- **Description:** PR body does not contain "Fixes #<issue>" or any GitHub issue reference. OPERATING_MODEL.md line 28-30 requires: "Every PR must include `Fixes #<issue>` in the body."
- **Recommendation:** Add issue linkage to PR body before merge

## Warnings

### 1. vitest.config.ts Not in Allowed Paths
- **File:** vitest.config.ts
- **Severity:** WARN
- **Category:** Allowed Paths Compliance
- **Description:** PR body declares allowed paths as "docs/directions/**, feedback/manager/**" but modifies `vitest.config.ts` which is outside this scope. Change appears minimal (1 addition, 0 deletions).
- **Code:**
  ```diff
  +++ b/vitest.config.ts
  @@ -0,0 +1 @@
  ```
- **Recommendation:**
  1. Either add "vitest.config.ts" to allowed paths in PR body
  2. Or remove this change from PR if not essential
  3. If essential, document why Manager is modifying test config

### 2. Direction Content Changes - Analytics Discrepancy
- **File:** docs/directions/analytics.md
- **Severity:** WARN
- **Category:** Content Verification
- **Description:** Analytics direction update includes "CRITICAL - WORK VERIFICATION REQUIRED" warning about missing files that were reported complete. This indicates potential git history issue or agent work loss.
- **Code:**
  ```markdown
  **Problem**: You reported 5 files complete on Oct 19, but they don't exist in repo:
  - app/lib/analytics/shopify-returns.stub.ts ❌
  - app/lib/analytics/sampling-guard.ts ❌
  - scripts/sampling-guard-proof.mjs ❌
  - scripts/dashboard-snapshot.mjs ❌
  - scripts/metrics-for-content-ads.mjs ❌
  ```
- **Recommendation:** Manager should verify Analytics work status before merging this PR. May indicate need for Analytics agent to re-execute work.

## Next Steps

### Critical Actions (Before Merge)
1. **DELETE** `docs/directions/URGENT_DATE_CORRECTION.md` (forbidden pattern)
2. **MOVE** date correction content to `feedback/manager/2025-10-19.md`
3. **ADD** issue linkage to PR body ("Fixes #<number>")
4. **UPDATE** allowed paths in PR body to include vitest.config.ts OR remove that change
5. **VERIFY** Analytics work status (missing files issue)

### Post-Merge Actions
1. Archive `URGENT_DATE_CORRECTION.md` if accidentally merged (immediate rollback)
2. Update Manager direction to reinforce 3-Question Test adherence
3. Consider automated CI check for forbidden filename patterns

## Metadata

- **PR Number**: #104
- **Branch**: manager/oct19-direction-updates-v2
- **Files Changed**: 20
- **Additions**: 1089
- **Deletions**: 48
- **Reviewer**: QA-PR Diff Review Agent
- **Review Date**: 2025-10-20
- **Review Duration**: ~12 minutes

## References

- **NORTH_STAR.md**: Lines 95-117 (No Ad-Hoc Files Rule)
- **RULES.md**: Lines 26-70 (No Ad-Hoc Files STRICT)
- **OPERATING_MODEL.md**: Lines 28-30 (Issue Linkage Requirement)
- **RULES.md**: Line 49 (Forbidden: `URGENT_*.md`)
