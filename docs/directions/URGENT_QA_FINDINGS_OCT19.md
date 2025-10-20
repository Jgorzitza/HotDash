# 🚨 URGENT: QA Findings & Agent Task Updates — 2025-10-19T23:50:00Z

**FROM**: Manager  
**TO**: Engineer, Data, QA, Ads agents  
**RE**: QA P0 blockers and task assignments

---

## QA Recommendation: CONDITIONAL GO ✅

**QA Grade**: B+ (85/100) - Excellent comprehensive testing  
**Test Coverage**: 97.24% unit, 100% integration, 0 secrets  
**Decision**: ACCEPTED - Proceed with P0 fixes

---

## 🔥 P0 URGENT TASKS (Critical Path to Launch)

### 1. Engineer: /health Route (15 min) — P0

**Task**: Create missing health endpoint  
**File**: `app/routes/health.tsx`  
**Blocker**: Infrastructure monitoring cannot verify app health

**Implementation**:

```typescript
export async function loader() {
  const checks = {
    db: await checkDatabase(), // Supabase ping
    shopify: await checkShopify(), // Test API call
  };
  const allHealthy = Object.values(checks).every((c) => c === "ok");
  return Response.json(
    { status: allHealthy ? "ok" : "degraded", checks },
    { status: allHealthy ? 200 : 503 },
  );
}
```

**Requirements**:

- Response time: <500ms
- Test locally: `curl http://localhost:3000/health`
- Deploy: `fly deploy`
- Notify QA for retest

**Priority**: DO THIS FIRST before other tasks

---

### 2. Data: RLS Verification (30 min) — P0

**Task**: Verify RLS enabled on critical tables  
**Script**: `supabase/rls_tests.sql` (ready to execute)  
**Blocker**: Security compliance unknown

**Tables to Verify**:

1. `ads_metrics_daily`
2. `agent_run`
3. `agent_qc`
4. `creds_meta`

**Steps**:

1. Connect to production Supabase database
2. Run `supabase/rls_tests.sql` script
3. Document pass/fail for each table in feedback
4. If any FAIL: Escalate to Manager immediately (P0 security issue)
5. If all PASS: Notify QA for sign-off

**Evidence Required**: SQL query outputs, test results

**Priority**: DO THIS FIRST before other tasks

---

## ✅ QA: Chrome DevTools MCP IS AVAILABLE

**Your Concern**: "Chrome DevTools MCP not available"  
**Manager Verification**: ✅ **IT IS CONFIGURED AND WORKING**

**Evidence**:

- Manager used Chrome DevTools MCP today
- Tool calls successful: take_snapshot, list_console_messages, list_network_requests, take_screenshot
- Inspected production app: https://admin.shopify.com/store/hotroddash/apps/hotdash

**Note**: `mcp/ALL_SYSTEMS_GO.md` may be outdated. Chrome DevTools MCP is actively configured in Cursor settings.

**Your Tasks**:

1. **NOW**: Execute QA-003 through QA-014 (7 UI/UX molecules with Chrome DevTools MCP)
2. **When Engineer completes**: Retest QA-002 (/health endpoint)
3. **When Data completes**: Review RLS verification results
4. **Then**: Issue final GO/NO-GO decision (QA-017)

**Timeline**: 60-90 minutes total

---

## ⚠️ P2 NON-BLOCKING TASK

### 3. Ads: Metrics Formatting (20 min) — P2

**Task**: Fix 8 test failures (cosmetic, non-blocking for launch)  
**File**: `app/lib/ads/metrics.ts`  
**Tests**: `tests/unit/ads/metrics.spec.ts`

**Fixes Needed**:

1. `formatCentsToDollars()`:
   - Add thousands separator: `$2,500.00` not `$2500.00`
   - Fix negative sign: `-$500.00` not `$-500.00`

2. `formatROAS()`:
   - Remove trailing zeros: `3.5x` not `3.50x`
   - Handle zero case: `0.0x` not `0.00x`

**When**: Complete after ADS-020 (current work)  
**Evidence**: Test output showing 8 tests passing

---

## Build Fix ✅

**QA Agent Fixed**: Missing `app/services/approvals.ts`  
**Action**: Restored from git + added exports  
**Impact**: Build succeeds, accessibility tests can run  
**Excellent Work!**

---

## Timeline to Production GO

```
NOW: Engineer + Data start P0 tasks (parallel)
     QA starts UI/UX testing (QA-003 to QA-014)
     ↓
+15 min: Engineer deploys /health route
         QA retests health endpoint
         ↓
+30 min: Data completes RLS verification
         Provides results to QA
         ↓
+60-90 min: QA final GO/NO-GO decision
            Ads fixes formatting (parallel, P2)
            ↓
LAUNCH: If both P0s pass → GO
        If either fails → NO-GO, reschedule
```

---

## GO Criteria

✅ /health route returns 200 OK with DB/Shopify checks  
✅ RLS verified on 4 critical tables  
✅ Unit tests remain ≥95% passing (currently 97.24%)  
✅ QA final sign-off

---

**Manager**: All tasks assigned ✅  
**Status**: Agents can proceed immediately  
**Next Check**: 60-90 minutes for P0 completion

**Feedback**: Write all updates to `feedback/{agent}/2025-10-19.md`
