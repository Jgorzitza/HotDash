# Analytics Direction v5.1

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

### ANALYTICS-001: Sales Chart Data — DAY 1

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

### ANALYTICS-002: Inventory Chart Data — DAY 2

**Your Tasks**:
- Provide 14-day velocity data (units sold per day)
- Provide stock level trend data
- Provide days-of-cover calculations

---

### ANALYTICS-003: Agent Performance Data — DAY 3

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

### ANALYTICS-004: Export Services — DAY 4

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
