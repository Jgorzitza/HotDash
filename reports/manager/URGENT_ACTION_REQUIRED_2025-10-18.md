# URGENT: Manager Action Required - 2025-10-18

**From:** QA + SEO Agents  
**Branch:** batch-20251019/manager-plan-seed  
**Status:** 🔴 2 P1 Blockers Preventing Staging Deploy

---

## ⚠️ CRITICAL ISSUES FOUND

### QA Agent: Build Fixed, But 2 P1 Blockers Prevent Staging

**Previous P0 (Missing schemas):** ✅ **RESOLVED** by Engineer

**NEW P1 Blockers:**
1. **Approvals route completely broken** - Returns 500 error
2. **Unit test failing** - CI will block PR merge

### SEO Agent: All Specs Ready, Waiting on Infrastructure

**All 3 lanes validated:** ✅ **COMPLETE**
- Programmatic SEO Factory spec ready for Product review
- SEO Telemetry spec ready, needs GA4/GSC adapters
- A/B Harness spec ready for Product + Analytics

---

## 🔧 TOP 3 FIXES NEEDED (Prioritized)

### FIX #1: /approvals Route Returns 500 (URGENT - P1)

**Problem:**
```bash
curl http://localhost:4173/approvals
# Returns: 500 Internal Server Error
# Error: MissingAppProviderError: No i18n was provided
```

**Root Cause:** Polaris components require AppProvider context during SSR, but it's missing in approvals route

**Fix Options (Pick One):**

```tsx
// OPTION A (Recommended): Wrap route in AppProvider
// File: app/routes/approvals/route.tsx

import { AppProvider } from '@shopify/polaris';
import enTranslations from '@shopify/polaris/locales/en.json';

export default function ApprovalsRoute() {
  return (
    <AppProvider i18n={enTranslations}>
      {/* existing route JSX */}
    </AppProvider>
  );
}

// OPTION B: Check if root layout already has AppProvider but SSR context is missing
// File: app/root.tsx - verify AppProvider wraps routes during SSR
```

**Verification:**
```bash
npm run build
npm run start
curl http://localhost:4173/approvals  # Should return 200
```

**Assign To:** Engineer  
**Allowed Paths:** `app/routes/approvals/**`, `app/root.tsx`, `app/entry.server.tsx`  
**Blocks:** Staging deployment (approvals feature is core HITL requirement)

---

### FIX #2: Unit Test Failure - approvals-drawer (URGENT - P1)

**Problem:**
```
Test: tests/unit/components/approvals/approvals-drawer.spec.tsx:76
Error: expect(element).toBeDisabled() failed
Button has aria-disabled="true" but test expects disabled attribute
```

**Root Cause:** Polaris Button uses `aria-disabled` for accessibility, not native `disabled` attribute

**Fix (Recommended):**

```tsx
// File: tests/unit/components/approvals/approvals-drawer.spec.tsx
// Line 76:

// CHANGE FROM:
const approveButton = screen.getByRole("button", { name: /approve/i });
expect(approveButton).toBeDisabled();

// CHANGE TO:
const approveButton = screen.getByRole("button", { name: /approve/i });
expect(approveButton).toHaveAttribute("aria-disabled", "true");
```

**Verification:**
```bash
npm run test:unit
# Should show: Tests: 183 passed (was 182 passed, 1 failed)
```

**Assign To:** Engineer  
**Allowed Paths:** `tests/unit/components/approvals/**`  
**Blocks:** CI/PR merge (test suite must be green)

---

### FIX #3: Create GA4/GSC Adapters (Non-Blocking, Enables SEO + Analytics Work)

**Problem:** SEO Telemetry and A/B Harness specs are complete but can't validate proof calls because adapters don't exist

**Required Files:**
```bash
integrations/ga4-cli.js
integrations/gsc-cli.js
```

**Required Commands (from lane specs):**
```bash
# GA4 Adapter
node integrations/ga4-cli.js --ping                      # Health check
node integrations/ga4-cli.js --list-custom-dim ab_variant  # For A/B harness

# GSC Adapter  
node integrations/gsc-cli.js --ping                      # Health check
node integrations/gsc-cli.js --export --dry-run          # For telemetry pipeline
```

**Assign To:** Analytics Agent  
**Allowed Paths:** `integrations/**`, `feedback/analytics/**`, `artifacts/analytics/**`  
**Blocks:** SEO telemetry validation + A/B harness GA4 dimension testing (but SEO can continue with fallback queue)

**Create Issue:** "Build GA4/GSC Adapter CLIs for Telemetry + A/B Harness (#79, #80)"

**DoD:**
- [ ] All 4 commands above execute successfully
- [ ] Evidence logs saved to `artifacts/analytics/2025-10-18/`
- [ ] SEO and Analytics agents can run proof calls from their lanes

---

## 📋 WHAT AGENTS NEED TO RUN UNBLOCKED NEXT TIME

### QA Agent Requirements

**To run full CI suite without stopping:**

✅ **Already Working:**
- Build succeeds
- Root route (/) returns 200
- 182 unit tests passing
- Format check passing

❌ **Need Fixed (P1 - URGENT):**
1. Fix #1: GET /approvals returns 200 (currently 500)
2. Fix #2: Unit tests 100% passing (currently 182/183)

⚠️ **Nice to Have (P2 - Can Work Around):**
3. Lint errors reduced (currently 65+, can document and continue)
4. JSON syntax fixed (2 files, 2-minute fix)

**Once P1s fixed, QA will execute:**
```bash
npm run test:ci    # Full CI suite (unit + e2e + a11y + lighthouse)
npm run scan       # Security scan
# Publish green QA scope packet
```

**ETA to Green:** 30 minutes after P1 fixes land

---

### SEO Agent Requirements

**To validate implementations without stopping:**

✅ **Already Complete:**
- All 3 specs validated (Programmatic SEO, Telemetry, A/B Harness)
- Contract tests passing (vitals unit + lint)
- Evidence bundles created

⚠️ **Need to Continue (Non-Blocking):**
1. GA4/GSC adapters (Fix #3 above) - enables proof calls
2. MCP Shopify Admin access - enables metaobject introspection

**If blocked > 15 min, SEO will auto-continue with fallback queue:**
- Media Pipeline Tier-0 planning
- Schema markup expansions (FAQ, Breadcrumb, Product)
- Internal-link policy and thresholds
- Alt-text heuristics for media pipeline
- Meta description policy

**No blockers for next run** - SEO operates in autonomy mode

---

## 🎯 RECOMMENDED MANAGER ACTIONS (Next 2 Hours)

### Action 1: Assign Engineer to P1 Fixes (30 min)

**Create/Update Issues:**
- [ ] Issue for Fix #1 (approvals SSR error)
- [ ] Issue for Fix #2 (unit test assertion)

**Assign:** Engineer agent  
**Timeline:** Request completion within 4 hours (today)  
**Allowed Paths:**
- Fix #1: `app/routes/approvals/**`, `app/root.tsx`
- Fix #2: `tests/unit/components/approvals/**`

**DoD:**
```bash
# Both must pass:
curl http://localhost:4173/approvals  # Returns 200
npm run test:unit                      # All tests pass
```

---

### Action 2: Assign Analytics Agent to Adapter Creation (Can Start Now)

**Create Issue:** "Build GA4/GSC Adapter CLIs (#79, #80)"

**Assign:** Analytics agent  
**Timeline:** Can run in parallel with P1 fixes (non-blocking)  
**Allowed Paths:** `integrations/**`, `feedback/analytics/**`

**DoD:** 4 proof calls work (listed in Fix #3)

---

### Action 3: Route SEO Specs to Reviewers (5 min)

**Tag reviewers in existing Issues:**
- [ ] Issue #77 (Programmatic SEO) → Product agent
- [ ] Issue #79 (SEO Telemetry) → Analytics agent (lane owner)
- [ ] Issue #80 (A/B Harness) → Product agent + QA agent

**Timeline:** Non-blocking, can proceed async

---

## 📊 TIMELINE TO GREEN

```
Now: 2 P1 blockers + 2 P2 issues + 3 specs ready for review

↓ [2-4 hours] Engineer fixes P1-A + P1-B

✅ Approvals route working + Unit tests passing

↓ [30 min] QA re-runs full CI suite

✅ All CI checks green + Security scan pass

↓ [Ready for staging deploy]
```

**Critical Path:** Engineer P1 fixes (2-4h) → QA validation (30m) = **~3-5 hours to green**

**Parallel Path:** Analytics builds adapters (enables future SEO/Analytics work)

---

## 📁 EVIDENCE & ARTIFACTS

All evidence bundles ready for review:

**QA Evidence:**
- `artifacts/qa/2025-10-18/app_usability/BLOCKERS_SUMMARY.md`
- `artifacts/qa/2025-10-18/app_usability/server.log` (SSR error details)
- `artifacts/qa/2025-10-18/app_usability/unit_tests.log` (test results)

**SEO Evidence:**
- `artifacts/seo/2025-10-18/spec-review-checklist.md` (Programmatic SEO)
- `artifacts/seo/2025-10-18/telemetry-gap-analysis.md` (Telemetry + adapters)
- `artifacts/seo/2025-10-18/ab-harness-review.md` (A/B harness)

**Feedback Logs:**
- `feedback/qa/2025-10-18.md` (complete QA session)
- `feedback/seo/2025-10-18.md` (complete SEO session)

**Manager Reports:**
- `reports/manager/AGENT_FEEDBACK_2025-10-18.md` (comprehensive details)
- `reports/manager/URGENT_ACTION_REQUIRED_2025-10-18.md` (this document)

---

## 🔴 RISK ASSESSMENT

**HIGH RISK (Immediate):**
- Approvals feature completely broken (500 error)
- Blocks staging UX validation of core HITL requirement

**MEDIUM RISK (24-48h):**
- CI will fail on PR merge (test + lint failures)
- Blocks production deployment

**LOW RISK (Mitigated):**
- All SEO specs in planning phase (no runtime impact)
- All feature flags OFF by default
- HITL approvals required before any operations

---

## ✅ SUMMARY

**QA:** Build fixed ✅ → Found 2 P1 blockers → Need Engineer fixes → Can run full CI in 30 min after

**SEO:** All specs ready ✅ → Need adapters for validation → Will continue with fallback queue if blocked

**Action:** Assign Engineer to Fix #1 + Fix #2 (urgent), assign Analytics to Fix #3 (parallel)

**ETA to Green:** 3-5 hours (P1 fixes + QA validation)

---

**Next Checkpoint:** After Engineer completes P1 fixes, QA will re-run and report green status

**Prepared:** 2025-10-18 by QA + SEO Agents  
**Review Required:** Manager immediate action on Fix #1 + Fix #2
