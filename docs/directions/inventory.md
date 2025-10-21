# Inventory Direction v6.0

📌 **FIRST ACTION: Git Setup**
```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251021
git pull origin manager-reopen-20251021
```

**Owner**: Manager  
**Effective**: 2025-10-21T22:00Z  
**Version**: 6.0  
**Status**: ACTIVE — Advanced Inventory Features

---

## ✅ INVENTORY-006 THROUGH 008 COMPLETE
- ✅ Modal backend integration (2 API routes, documentation)
- ✅ Real-time tile data service (status buckets, risk products)
- ✅ Kits & bundles support (component-based ROP)
**Files**: 9 created (1,124 lines), commit bede314

---

## ACTIVE TASKS (12h total)

### INVENTORY-009: Automated Reorder Alerts (2h) - START NOW
Generate reorder alerts based on ROP thresholds
- Calculate days until stockout
- Urgency levels (critical/high/medium/low)
- Recommended order quantity (EOQ formula)
- Vendor and cost information
**MCP**: TypeScript EOQ calculation, Prisma inventory queries

### INVENTORY-010: Inventory Analytics Service (3h)
Calculate inventory analytics
- Turnover rate calculation
- Aging analysis (fresh/aging/stale/dead)
- ABC analysis (80/15/5 rule)
- Optimization recommendations
**MCP**: TypeScript algorithms, Prisma aggregations

### INVENTORY-011: Purchase Order Automation (3h)
Auto-generate purchase orders
- Group products by vendor
- Calculate optimal order quantities
- HITL approval for POs >$1000
**MCP**: Prisma transactions

### INVENTORY-012: Optimization Service (2h)
Inventory optimization recommendations
- Dead stock identification (0 sales in 90 days)
- Overstock detection (>180 days supply)
- ABC classification with strategies

### INVENTORY-013: Inventory Reporting (2h)
Daily/weekly/monthly inventory reports
- Stock levels, reorder alerts, turnover metrics

### INVENTORY-014: Engineer Modal Support (1h reactive)
Verify Engineer's inventory modal integration

### INVENTORY-015: Testing + Documentation (2h)
80+ integration tests, documentation

**START NOW**: Pull TypeScript + Prisma docs, implement reorder alerts
