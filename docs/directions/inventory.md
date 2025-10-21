# Inventory Direction v5.1

📌 **FIRST ACTION: Git Setup**
```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251020
git pull origin manager-reopen-20251020
git branch --show-current  # Verify: should show manager-reopen-20251020
```


**Owner**: Manager  
**Effective**: 2025-10-20T20:00Z  
**Version**: 5.0  
**Status**: ACTIVE — Inventory Enhancements (PARALLEL DAY 2-3)

---

## Objective

**Enhance inventory ROP calculation and forecasting**

**Primary Reference**: `docs/manager/PROJECT_PLAN.md` (Option A Execution Plan — LOCKED)

**Timeline**: Day 2-3 — START DAY 2 (Parallel with other agents)

**Current Status**: Service code cherry-picked (commit 9d0baa4) - ROP, payout, CSV export ready

---

## Day 2-3 Tasks (START DAY 2 - 4h)

### INVENTORY-001: Seasonal Demand Adjustments

**Enhance ROP calculation** in `app/lib/inventory/safety-stock.ts`:

**Add Seasonality**:
- Detect seasonal patterns (winter sports vs summer gear)
- Adjust reorder point based on season
- Historical sales by month
- Peak season buffer (increase ROP 20-30%)

**Algorithm**:
```typescript
// Current: ROP = (avg_daily_sales * lead_time) + safety_stock
// Enhanced: ROP = (seasonal_adjusted_sales * lead_time) + dynamic_safety_stock

function calculateSeasonalROP(sku: string): number {
  const baseROP = calculateROP(sku);
  const seasonalityFactor = getSeasonalityFactor(sku, currentMonth);
  const adjustedROP = baseROP * seasonalityFactor;
  return Math.ceil(adjustedROP);
}
```

**Data Needed**:
- 12 months sales history per SKU
- Category seasonality patterns (e.g., "Snowboards" peak Nov-Feb)

---

### INVENTORY-002: Demand Forecasting (ML-Based)

**Build forecasting service**:

**File**: `app/services/inventory/demand-forecast.ts`

**Features**:
- 30-day demand forecast per SKU
- Confidence intervals (low/medium/high)
- Trend detection (growing, stable, declining)
- Anomaly detection (sudden spikes/drops)

**Simple ML Approach** (or statistical):
- Moving average with trend
- Exponential smoothing
- Seasonal decomposition

**Alternative** (if complex ML not feasible):
- 7-day rolling average
- 30-day rolling average
- Simple linear trend

**Output**:
```typescript
{
  sku: string,
  forecast_30d: number,
  confidence: 'high' | 'medium' | 'low',
  trend: 'growing' | 'stable' | 'declining',
  recommended_reorder_qty: number
}
```

**Integration**: Use in Inventory Modal (Engineer displays forecast)

---

## Optional Enhancements (If Time)

### INVENTORY-003: Vendor Management

**Track vendor performance**:
- Lead time tracking (order to delivery)
- Reliability score (on-time delivery %)
- Cost comparison
- Preferred vendor per SKU

**File**: `app/services/inventory/vendor-management.ts`

---

### INVENTORY-004: PO Tracking System

**Track purchase orders**:
- PO status (ordered, shipped, received)
- Expected delivery dates
- Actual delivery dates (calculate lead time accuracy)

**Integration**: Display in Inventory Modal or future PO dashboard

---

## Work Protocol

**1. MCP Tools**:
```bash
# TypeScript for algorithms:
mcp_context7_get-library-docs("/microsoft/TypeScript", "type-guards")

# Math/stats libraries (if using):
mcp_context7_get-library-docs("/simple-statistics/simple-statistics", "forecasting")
```

**2. Coordinate**:
- **Engineer**: Will display forecast in Inventory Modal
- **Analytics**: May share forecasting patterns
- **Data**: Provide sales history data

**3. Reporting (Every 2 hours)**:
```md
## YYYY-MM-DDTHH:MM:SSZ — Inventory: Seasonal ROP Enhancement

**Working On**: INVENTORY-001 (seasonal adjustments)
**Progress**: Algorithm implemented, testing with real data

**Evidence**:
- Files: app/lib/inventory/safety-stock.ts (+85 lines)
- Tests: 18/18 passing (+4 new tests for seasonality)
- Context7: Not needed (statistical methods, no new libraries)
- Test results: Snowboard ROP adjusted 1.25x for winter months ✅

**Blockers**: None
**Next**: Build demand forecasting service
```

---

## Definition of Done

**Seasonal ROP**:
- [ ] Algorithm implemented
- [ ] Tests passing (4+ new tests)
- [ ] Verified with real SKU data
- [ ] Documentation updated

**Demand Forecasting**:
- [ ] Forecast service functional
- [ ] 30-day predictions accurate (within 20% on test data)
- [ ] Confidence levels calculated
- [ ] Integration ready for Engineer

**Optional** (if time):
- [ ] Vendor management functional
- [ ] PO tracking implemented

---

## Critical Reminders

**DO**:
- ✅ Test algorithms with real SKU data
- ✅ Validate forecast accuracy
- ✅ Coordinate with Engineer for UI integration
- ✅ Keep existing ROP service working (don't break)

**DO NOT**:
- ❌ Break existing `app/lib/inventory/safety-stock.ts`
- ❌ Deploy without testing calculations
- ❌ Use overly complex ML (simple forecasting OK)

---

## Phase Schedule

**Day 2**: INVENTORY-001 (seasonal ROP - 2h) — START DAY 2
**Day 3**: INVENTORY-002 (forecasting - 2h)
**Day 3-4**: INVENTORY-003, 004 (optional enhancements - 4h if time)

**Total**: 4-8 hours across Days 2-4 (parallel with Engineer)

---

## Quick Reference

**Plan**: `docs/manager/PROJECT_PLAN.md`
**Current Code**: app/lib/inventory/safety-stock.ts, app/services/inventory/
**Feedback**: `feedback/inventory/2025-10-20.md`

---

**START WITH**: INVENTORY-001 (seasonal ROP - DAY 2) — Enhance existing service

---

## Credential & Blocker Protocol

### If You Need Credentials:

**Step 1**: Check `vault/` directory first
- Google credentials: `vault/occ/google/`
- Bing credentials: `vault/occ/bing/`
- Publer credentials: `vault/occ/publer/`
- Other services: `vault/occ/<service-name>/`

**Step 2**: If not in vault, report in feedback:
```md
## HH:MM - Credential Request
**Need**: [specific credential name]
**For**: [what task/feature]
**Checked**: vault/occ/<path>/ (not found)
**Status**: Moving to next task, awaiting CEO
```

**Step 3**: Move to next task immediately (don't wait idle)

### If You Hit a True Blocker:

**Before reporting blocker, verify you**:
1. ✅ Checked vault for credentials
2. ✅ Inspected codebase for existing patterns
3. ✅ Pulled Context7 docs for the library
4. ✅ Reviewed RULES.md and relevant direction sections

**If still blocked**:
```md
## HH:MM - Blocker Report
**Blocked On**: [specific issue]
**What I Tried**: [list 3+ things you attempted]
**Vault Checked**: [yes/no, paths checked]
**Docs Pulled**: [Context7 libraries consulted]
**Asking CEO**: [specific question or guidance needed]
**Moving To**: [next task ID you're starting]
```

**Then immediately move to next task** - CEO will respond when available

**Key Principle**: NEVER sit idle. If one task blocked → start next task right away.

---

## ✅ MANAGER UPDATE (2025-10-21T00:00Z)

---

## INVENTORY-005: Coordinate 14-Day Chart Integration with Engineer (30 min)

**Context**: Inventory Modal needs 14-day demand velocity chart. Engineer implementing ENG-007.

**Your Service**: ✅ READY
- File: `app/services/demand-forecast/velocity.ts`
- Function: `getDemandVelocity(productId, days=14)` - returns daily sales data

**Engineer Need**: Chart-ready data format

**Your Task**: Create chart adapter for Engineer

### Implementation

**File**: `app/services/demand-forecast/chart-adapter.ts`

```typescript
export async function get14DayChartData(productId: string): Promise<{
  labels: string[]; // Date labels ["Oct 7", "Oct 8", ...]
  datasets: [{
    label: string;
    data: number[]; // Sales values [12, 15, 10, ...]
    borderColor: string;
    backgroundColor: string;
  }];
}> {
  // 1. Call getDemandVelocity(productId, 14)
  // 2. Format for chart library (Chart.js or similar)
  // 3. Return structured chart data
}
```

**Engineer Integration Doc**: Create `docs/integrations/inventory-chart-integration.md`
- Usage example
- Data format
- API endpoint recommendation (or direct service call)

**API Route (Optional)**: `app/routes/api.inventory.chart-data.ts`
- Accepts: `productId` query param
- Returns: Chart-ready JSON
- Easier for Engineer to integrate

**Deliverables**:
1. ✅ Chart adapter created
2. ✅ Integration doc written
3. ✅ API route created (if going that route)
4. ✅ Notify Engineer in feedback

**Time**: 30 minutes

**Coordination**: Message Engineer when ready with integration instructions

---

## After INVENTORY-005

**Status**: ✅ ALL 5 TASKS COMPLETE
- INVENTORY-001: Seasonal ROP ✅
- INVENTORY-002: Demand forecasting ✅
- INVENTORY-003: Vendor management ✅
- INVENTORY-004: PO tracking ✅
- INVENTORY-005: Chart integration ✅

**Next**: STANDBY for Option A support or new assignments

**Status**: ALL TASKS COMPLETE ✅

**Evidence**: See feedback/inventory/2025-10-20.md

**Your Work**:
Work verified complete by Manager

**Next Assignment**: STANDBY - Await Phase 3-13 coordination requests

**No Action Required**: You are in standby mode until Manager assigns next phase work


---

## 🔄 MANAGER UPDATE (2025-10-21T02:35Z)

**Feedback Consolidated**: All 10/20 + 10/21 work reviewed

**Status**: Standby - Monitor for coordination requests

**Time Budget**: See above
**Priority**: Execute until complete or blocked, then move to next task
**Report**: Every 2 hours in feedback/inventory/2025-10-21.md

