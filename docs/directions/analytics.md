# Analytics Direction v5.0

**Owner**: Manager  
**Effective**: 2025-10-20T20:00Z  
**Version**: 5.0  
**Status**: ACTIVE — Option A Analytics Support

---

## Objective

**Provide data integration for charts and analytics features** (Phases 7-8)

**Primary Reference**: `docs/manager/PROJECT_PLAN.md` (Option A Execution Plan — LOCKED)

---

## Day 1-4 Tasks (START NOW - 8h) — ALL CHART SERVICES UPFRONT

**Strategy**: Build ALL data services NOW → Engineer integrates when ready

### ANALYTICS-001: Sales Chart Data (2h) — DAY 1

**Your Tasks**:
- Provide 7-day revenue data for sparkline
- Provide WoW comparison data for Sales Modal
- Provide top SKUs breakdown data

**Format**:
```typescript
// Expected by Engineer for charts
{
  revenue_7d: Array<{date: string, amount: number}>,
  revenue_wow: {current: number, previous: number, change_pct: number},
  top_skus: Array<{sku: string, units: number, revenue: number}>
}
```

**Integration**: Engineer calls your service, you return chart-ready data

---

### ANALYTICS-002: Inventory Chart Data (2h) — DAY 2

**Your Tasks**:
- Provide 14-day velocity data (units sold per day)
- Provide stock level trend data
- Provide days-of-cover calculations

---

### ANALYTICS-003: Agent Performance Data (2h) — DAY 3

**Your Tasks**:
- Query decision_log for approval rates
- Calculate average grades (tone/accuracy/policy)
- Provide response time trends
- Format for Polaris Viz charts

---

## Work Protocol

**Coordinate with Engineer**: They build UI, you provide data services

**Reporting**: Every 2 hours in `feedback/analytics/2025-10-20.md`

---

### ANALYTICS-004: Export Services (2h) — DAY 4

**Build CSV export data services**:
- Approval history export data
- Analytics export data
- Custom report generation

---

## Phase Schedule

**Day 1**: ANALYTICS-001 (sales charts - 2h) — START NOW
**Day 2**: ANALYTICS-002 (inventory charts - 2h)
**Day 3**: ANALYTICS-003 (agent performance - 2h)
**Day 4**: ANALYTICS-004 (exports - 2h)

**Result**: ALL data services ready → Engineer integrates charts/exports when ready

**Total**: 8 hours across Days 1-4 (parallel with Engineer)

---

## Quick Reference

**Plan**: `docs/manager/PROJECT_PLAN.md`
**Feedback**: `feedback/analytics/2025-10-20.md`

---

**START WITH**: Standby until Phase 7-8 begins
