# Agent Feedback Summary - 2025-10-18

**Date:** 2025-10-18
**Agents Reporting:** QA, SEO
**Branch:** batch-20251019/manager-plan-seed

---

## Executive Summary

**QA Status:** ⚠️ READY WITH ISSUES - 2 P1 blockers, 2 P2 issues  
**SEO Status:** ✅ ALL LANES COMPLETE - 3 specs validated, ready for review

**Critical Path:** P1 blockers (approvals SSR + unit test) must be fixed before staging deployment.

---

## QA Findings (Issue #114)

### ✅ Previous P0 Blocker RESOLVED
- Missing `app/lib/analytics/schemas.ts` module **FIXED** by Engineer
- Build now succeeds in 9.14s

### ❌ NEW P1 BLOCKERS (Block Staging)

#### P1-A: /approvals Route Returns 500 (SSR Error)
**Impact:** Entire approvals feature broken  
**Error:**
```
MissingAppProviderError: No i18n was provided. 
Your application must be wrapped in an <AppProvider> component.
```

**Test:**
```bash
curl http://localhost:4173/approvals
# Returns: 500 Internal Server Error
```

**Root Cause:** Polaris Page component in approvals route requires AppProvider context during SSR

**Suspected File:** `app/routes/approvals/route.tsx`

**Suggested Fix:**
```tsx
// Option A: Add AppProvider wrapper in route loader/component
import { AppProvider } from '@shopify/polaris';

export default function ApprovalsRoute() {
  return (
    <AppProvider i18n={translations}>
      {/* existing route content */}
    </AppProvider>
  );
}

// Option B: Check if root layout provides AppProvider during SSR
// May need to add SSR context in entry.server.tsx
```

**Evidence:** `artifacts/qa/2025-10-18/app_usability/server.log:21-28`

---

#### P1-B: Unit Test Failure (approvals-drawer)
**Impact:** CI test suite will fail, blocks PR merge  
**Test:** `tests/unit/components/approvals/approvals-drawer.spec.tsx:76`

**Error:**
```
expect(element).toBeDisabled()

Received element is not disabled:
  <button aria-disabled="true" class="...Polaris-Button--disabled" tabindex="-1">
```

**Root Cause:** Test expects `disabled` HTML attribute, but Polaris Button uses `aria-disabled="true"`

**Suggested Fix (Choose One):**
```tsx
// Option A (PREFERRED): Fix test assertion
// File: tests/unit/components/approvals/approvals-drawer.spec.tsx:76
- expect(approveButton).toBeDisabled();
+ expect(approveButton).toHaveAttribute("aria-disabled", "true");

// Option B: Update button to use disabled attribute
// File: app/components/approvals/ApprovalsDrawer.tsx
- <Button disabled={!isValid}>  // Currently uses aria-disabled
+ <Button disabled={!isValid} native>  // Force native disabled
```

**Evidence:** `artifacts/qa/2025-10-18/app_usability/unit_tests.log`

---

### ⚠️ P2 ISSUES (Block Production)

#### P2-A: Lint Errors (65+ errors across 13 files)
**Impact:** CI lint check will fail

**Breakdown:**
- `no-explicit-any`: ~50 errors
- `no-unused-vars`: ~15 errors

**Most Affected Files:**
1. `app/utils/logger.server.ts` (17 errors)
2. `app/utils/api-client.server.ts` (10 errors)
3. `app/services/content/engagement-analyzer.ts` (8 errors)
4. `app/utils/health-check.server.ts` (5 errors)
5. `app/lib/analytics/ga4.ts` (2 errors)

**Suggested Fix:**
```bash
# Prioritize top 3 files first (will fix ~35 errors)
# 1. Replace `any` with proper types:
- function log(data: any) {
+ function log(data: Record<string, unknown>) {

# 2. Remove or prefix unused vars:
- const dateRange = '7d';  // unused
+ const _dateRange = '7d';  // or remove entirely

# Quick wins: Run eslint --fix for auto-fixable items
npx eslint --fix app/utils/logger.server.ts app/utils/api-client.server.ts
```

---

#### P2-B: JSON Syntax Errors (2 files)
**Impact:** Prettier cannot parse spec files

**Files:**
1. `docs/specs/hitl/ads-analytics.config.json:95` - missing comma
2. `docs/specs/hitl/social-publishing.config.json:95` - missing comma

**Suggested Fix:**
```json
// Both files, line 94:
    }
  },  // ← Add comma here
  "optionalIntegrations": {
```

---

## SEO Findings (Issues #77, #79, #80)

### ✅ ALL 3 LANES COMPLETE & VALIDATED

#### Lane 1: Programmatic SEO Factory (#77)
**Status:** ✅ Spec complete, contract tests PASS  
**Reviewer:** Product (per lane assignment)

**Deliverables:**
- Metaobject schemas (4 types: landing_page, comparison, location_page, swap_recipe)
- Content assembly pipeline (5 stages: ingestion → preview → approval → publish → link sweeps)
- Template outline (/l/:slug with SEO/performance requirements)
- Feature flags: `feature.programmaticSeoFactory` (OFF), `feature.programmaticSeoFactoryPublisher` (OFF)
- 4-step rollback procedure

**Evidence:**
- `artifacts/seo/2025-10-18/spec-review-checklist.md` - Comprehensive validation
- `artifacts/seo/2025-10-18/vitals-unit.log` - Unit test PASS
- `artifacts/seo/2025-10-18/vitals-lint.log` - Lint PASS

**Next Steps:**
1. Product to review spec for business requirements
2. Engineer to assess technical feasibility
3. Create placeholder `scripts/ops/unbind-programmatic-lander.mjs` rollback script

---

#### Lane 2: SEO Telemetry / CWV→$$ (#79)
**Status:** ✅ Spec complete, waiting on adapters (Analytics-owned)  
**Reviewer:** Analytics (lane owner)

**Deliverables:**
- CWV→Revenue formula validated: `revenue_lift = sessions_delta × CR × AOV`
- Pipeline design (GSC→BQ→GA4 join → Action Dock feed)
- Validation plan (backtest 50 URLs, MAE tracking, parity checks)
- Feature flag: `feature.seoTelemetry` (OFF)

**Blocker (Expected):** GA4/GSC adapters not present
- Missing: `integrations/ga4-cli.js`
- Missing: `integrations/gsc-cli.js`

**Evidence:**
- `artifacts/seo/2025-10-18/telemetry-gap-analysis.md` - Gap analysis with Analytics action items

**Next Steps:**
1. **Analytics Agent:** Create GA4/GSC adapter CLIs (proof calls defined in lane)
2. SEO to validate Action Dock feed integration once adapters exist

---

#### Lane 3: A/B Harness (#80)
**Status:** ✅ Spec complete, ready for Product + Analytics  
**Reviewer:** QA (per lane)

**Deliverables:**
- Cookie + GA4 dimension design (`__ab_variant`, 30-day TTL)
- Experiment registry schema (7 fields: key, hypothesis, metric, etc.)
- Promotion thresholds (500 sessions, 5% lift, 90% confidence)
- Feature flag: `feature.abHarness` (OFF)
- One-click promote/rollback

**Evidence:**
- `artifacts/seo/2025-10-18/ab-harness-review.md` - Spec review with minor enhancement suggestions

**Next Steps:**
1. **Product Agent:** Build experiment registry schema + approval UI
2. **Analytics Agent:** Add `--list-custom-dim` command to GA4 adapter
3. QA to validate feature flag behavior once implemented

---

## Priority Matrix

| Priority | Issue | Owner | ETA | Blocks |
|----------|-------|-------|-----|--------|
| **P1-A** | /approvals SSR error | Engineer | Unknown | Staging deploy |
| **P1-B** | Unit test failure | Engineer | Unknown | CI/PR merge |
| **P2-A** | Lint errors (65+) | Engineer | Unknown | Production |
| **P2-B** | JSON syntax (2 files) | Engineer | 5 min | Prettier |
| **INFO** | GA4/GSC adapters | Analytics | Unknown | Telemetry + A/B validation |

---

## Suggested Manager Actions (Top 3)

### 1. **URGENT: Assign Engineer to Fix P1 Blockers**

**Issue Assignment:**
- Create or update Issue for P1-A (/approvals SSR error)
- Create or update Issue for P1-B (unit test failure)

**Allowed Paths:**
- P1-A: `app/routes/approvals/**`, `app/root.tsx`, `app/entry.server.tsx`
- P1-B: `tests/unit/components/approvals/**`

**DoD:**
- P1-A: `curl http://localhost:4173/approvals` returns 200
- P1-B: `npm run test:unit` passes (all tests green)

**Timeline:** Request completion within 24h (blocks staging)

---

### 2. **Assign Analytics Agent to Create Adapters**

**Create Issue:** "Build GA4/GSC Adapter CLIs for Telemetry + A/B Harness"

**Allowed Paths:** `integrations/**`, `feedback/analytics/**`, `artifacts/analytics/**`

**DoD:**
```bash
# Proof calls from lanes must work:
node integrations/ga4-cli.js --ping  # health check
node integrations/ga4-cli.js --list-custom-dim ab_variant  # for A/B harness
node integrations/gsc-cli.js --ping  # health check
node integrations/gsc-cli.js --export --dry-run  # for telemetry
```

**Timeline:** Can run in parallel with P1 fixes

---

### 3. **Route SEO Specs to Reviewers**

**Action:** Tag reviewers in Issues or create review tasks

**Assignments (per lane definitions):**
- **Issue #77 (Programmatic SEO Factory):** Assign Product for spec review
- **Issue #79 (SEO Telemetry):** Assign Analytics (lane owner) for implementation
- **Issue #80 (A/B Harness):** Assign Product for registry/UI design + QA for flag validation

**Timeline:** Non-blocking, can proceed while P1s are fixed

---

## Expectations for Next QA Run

**Prerequisites to unblock QA:**

1. ✅ **Build must succeed** (currently passing)
2. ❌ **P1-A fixed:** GET /approvals returns 200 (currently 500)
3. ❌ **P1-B fixed:** Unit tests pass (currently 1 failure)
4. ⚠️ **P2-A addressed:** Lint errors reduced to < 10 (currently 65+)
5. ⚠️ **P2-B addressed:** JSON syntax fixed (currently 2 errors)

**Once P1s are fixed, QA can run:**
```bash
# Full CI test suite
npm run test:ci  # includes unit, e2e, a11y, lighthouse

# Security scan
npm run scan

# Publish QA scope packet with green status
```

**Estimated Time to Green:** 2-4 hours (depends on Engineer bandwidth for P1 fixes)

---

## Expectations for Next SEO Run

**Prerequisites to continue SEO work:**

1. ✅ **Specs validated** (complete - no blockers)
2. ⚠️ **GA4/GSC adapters created** (for telemetry proof calls)
3. ⚠️ **MCP Shopify Admin access** (for programmatic SEO metaobject introspection)

**If adapters exist, SEO can:**
- Validate telemetry pipeline connectivity
- Test A/B harness GA4 dimension tracking
- Run programmatic SEO MCP proof call: `codex exec --json -- "mcp shopify-admin {'action':'introspect','object':'MetaobjectDefinition'}"`

**If blocked > 15 min, SEO will continue with fallback queue:**
- Media Pipeline Tier-0 planning
- Schema markup expansions
- Internal-link policy documentation
- Meta description policy

---

## Evidence Bundles

### QA Artifacts
- `artifacts/qa/2025-10-18/app_usability/server.log` - /approvals SSR error
- `artifacts/qa/2025-10-18/app_usability/unit_tests.log` - Test results (182 pass, 1 fail)
- `artifacts/qa/2025-10-18/app_usability/BLOCKERS_SUMMARY.md` - Complete blocker analysis

### SEO Artifacts
- `artifacts/seo/2025-10-18/spec-review-checklist.md` - Programmatic SEO validation
- `artifacts/seo/2025-10-18/telemetry-gap-analysis.md` - Telemetry + adapter requirements
- `artifacts/seo/2025-10-18/ab-harness-review.md` - A/B harness review
- `artifacts/seo/2025-10-18/vitals-unit.log` - Contract test results (PASS)
- `artifacts/seo/2025-10-18/vitals-lint.log` - Lint results (PASS)

### Feedback Logs
- `feedback/qa/2025-10-18.md` - Complete QA session (2 sessions documented)
- `feedback/seo/2025-10-18.md` - Complete SEO session (3 lanes validated)

---

## Risk Assessment

### High Risk (Immediate)
- ❌ **Approvals feature completely broken** (500 error) - blocks staging UX validation

### Medium Risk (24-48h)
- ⚠️ **CI will fail** on PR merge (unit test + lint failures)
- ⚠️ **Spec files unparseable** by prettier (JSON syntax)

### Low Risk (Planning Phase)
- ✅ All SEO specs in planning only (no runtime impact)
- ✅ All feature flags OFF
- ✅ HITL approvals required before any publish operations

---

## Summary

**QA:** Build fixed (P0 resolved ✅), but found 2 P1 blockers + 2 P2 issues. Engineer action required for staging readiness.

**SEO:** All 3 planning specs validated and ready for cross-functional review. Blocked on Analytics adapter creation (expected, non-urgent).

**Critical Path:** Fix P1-A + P1-B (Engineer) → QA re-runs full CI → Staging deploy green

**Timeline to Green:** 2-4 hours (P1 fixes) + 30 min (QA re-validation) = ~3-5 hours total

---

**Prepared by:** QA + SEO Agents  
**Manager Review Required:** Yes  
**Next Checkpoint:** After P1 fixes complete
