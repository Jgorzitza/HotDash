# Engineer Direction v6.0

📌 **FIRST ACTION: Git Setup**
```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251021
git pull origin manager-reopen-20251021
git branch --show-current  # Verify: should show manager-reopen-20251021
```

**Owner**: Manager  
**Effective**: 2025-10-21T22:00Z  
**Version**: 6.0  
**Status**: ACTIVE — Phase 7-8 Growth Analytics UI

---

## ✅ PHASES 1-6 COMPLETE - VERIFIED

**All Previous Work Complete** (from feedback/engineer/2025-10-21.md):
- ✅ Phase 1: Approval Queue Foundation
- ✅ Phase 2: P0 Fixes (10 issues resolved)
- ✅ Phase 3: Missing Dashboard Tiles (Idea Pool, CEO Agent, Unread Messages)
- ✅ Phase 4: Notification System (Toast, Banner, Browser, Notification Center)
- ✅ Phase 5: Real-Time Features (SSE, Live Badge, Tile Refresh Indicators)
- ✅ Phase 6: Settings & Personalization (Drag & Drop, Theme, Tile Visibility)

**Total Output**: 45 files changed, ~6,200 lines added, all builds passing, TypeScript clean

---

## Objective

**Build Phase 7-8: Growth Analytics UI (14h, 7 tasks) - START NOW**

### ENG-023: Social Performance Tile + Modal (3h)
- Dashboard tile showing social post performance
- Modal with Chart.js line chart (engagement trends)
- DataTable for top posts
- Date range filter

### ENG-024: SEO Impact Tile + Modal (3h)
- Dashboard tile showing SEO rankings
- Modal with position trend charts
- Top movers bar chart
- Content correlation table

### ENG-025: Ads ROAS Tile + Modal (3h)
- Dashboard tile showing campaign performance
- Modal with ROAS trend chart
- Spend distribution doughnut chart
- Campaign comparison table

### ENG-026: Growth Metrics Tile + Modal (3h)
- Dashboard tile showing overall growth
- Modal with multi-line chart (all channels)
- Channel comparison bar chart
- Weekly growth reports

### ENG-027: Chart.js Integration (1h)
- Install Chart.js + react-chartjs-2
- Create reusable chart components
- Apply OCC design tokens to charts

### ENG-028: Dashboard Integration (1h)
- Add 4 new tiles to dashboard (13 total)
- Update grid layout
- Parallel loading

**MANDATORY**: Pull Context7 docs for React Router 7, Chart.js, Polaris BEFORE coding
**CRITICAL**: Use Response.json() NOT json() (violation corrected by Manager in commit 19c09b3)

**START NOW** - Pull MCP docs, then implement ENG-023
