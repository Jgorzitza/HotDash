# SEO Pulse Anomaly Display Specification

**Version**: 1.0  
**Date**: October 13, 2025  
**Owner**: Product Agent  
**Purpose**: Define display criteria for SEO traffic anomaly monitoring  
**Status**: APPROVED - Ready for Data + Designer implementation  

---

## 1. Executive Summary

### Purpose of SEO Pulse Tile

**Primary Goal**: Help Hot Rod AN CEO detect and respond to SEO traffic problems quickly

**Use Case**: Daily monitoring (2-minute morning routine)
- CEO checks dashboard every morning
- SEO Pulse shows pages with unusual traffic changes
- CEO can spot problems early (rankings dropped, content issues, technical problems)
- CEO can take action or delegate to marketing team

### Success Criteria

**Actionable Insights**: CEO sees only meaningful changes requiring attention  
**No Overwhelm**: CEO can scan and understand in < 30 seconds  
**Early Detection**: CEO identifies SEO issues within 24 hours (vs 1-2 weeks manually)  
**High Signal**: >80% of alerts are valid issues worth investigating  

---

## 2. Display Criteria Decisions

### Decision 1: Anomaly Threshold Percentage

**DECISION**: **Option A - Keep -20%** (≥20% drop triggers anomaly flag)

**Rationale**:
1. **Early Warning Priority**: Hot Rod AN relies heavily on organic traffic for growth ($1MM → $10MM goal). A 20% drop on high-traffic pages could mean thousands in lost revenue. Early detection is critical.

2. **Automotive SEO Volatility**: Automotive parts SEO is competitive. Rankings can drop quickly due to:
   - Competitor content updates
   - Google algorithm changes
   - Technical issues (broken pages, slow speed)
   - Seasonal demand shifts

3. **CEO Time Investment**: CEO spends 2 minutes on morning routine. Reviewing 3-5 anomalies is manageable. Better to show potential issues than miss real problems.

4. **False Positive Management**: If -20% creates too many false positives, we can:
   - Adjust threshold based on Week 1 feedback
   - Add minimum traffic filter (only pages with >100 visits/week)
   - CEO can learn to quickly identify noise vs real issues

**Threshold Values**:
- **Drop Alert**: ≤ -20% (page traffic decreased ≥20% week-over-week)
- **Minor Drop**: -10% to -19% (show in "Watch List" section, lower priority)
- **Stable**: -9% to +9% (no alert)

**Additional Filter**: Only show pages with ≥50 visits/week (avoids noise from low-traffic pages)

---

### Decision 2: Display Count Limit

**DECISION**: **Option C - Top 10 with threshold**

**Rationale**:
1. **Balance Coverage + Focus**: 
   - Top 5 may miss important issues (if 8 pages drop ≥20%, CEO should see all)
   - All anomalies could be 30+ pages (overwhelming, defeats purpose)
   - Top 10 is scannable in 30 seconds, covers 90% of issues

2. **Desktop vs Mobile Consideration**:
   - Desktop: Show top 10 (plenty of screen space)
   - Mobile: Show top 5, "View 5 more" button
   - Responsive design adapts without changing data

3. **Hot Rod AN Scale**: ~200-300 landing pages total
   - If 10% have issues = 20-30 pages
   - Top 10 captures highest-impact issues
   - Remaining issues accessible in drill-down view

4. **CEO Workflow**: CEO can:
   - Quick scan: Top 3-5 most critical
   - Full review: All 10 if time permits
   - Deep dive: Click "View All Anomalies" for full list

**Display Rules**:
- **Desktop**: Top 10 anomalies (sorted by traffic impact)
- **Mobile**: Top 5 with "View 5 More" button
- **Tablet**: Top 10 (similar to desktop)
- **Sorting**: By traffic impact (visits/week × drop percentage)

**Traffic Impact Formula**: `impact_score = weekly_visits × abs(drop_percentage) / 100`

**Example**:
- Page A: 1000 visits/week, -25% drop → Impact: 250
- Page B: 200 visits/week, -40% drop → Impact: 80
- Show Page A first (higher impact despite smaller % drop)

---

### Decision 3: Traffic Increases Display

**DECISION**: **Option A - Only show decreases (≥20% drops)**

**Rationale**:
1. **Problem-Focused Design**: CEO's morning routine is about catching issues, not celebrating wins. SEO Pulse is a "check engine light" tile - it lights up when something needs attention.

2. **Action Orientation**: 
   - Traffic decrease → Actionable (investigate and fix)
   - Traffic increase → Nice but not actionable (what would CEO do? Nothing urgent)
   - CEO's 2-minute routine shouldn't include "nice to know" information

3. **Cognitive Load**: Mixing increases + decreases requires CEO to:
   - Read each item
   - Determine if it's good news (green) or bad news (red)
   - Decide which to act on
   - Result: Slower scan, more mental effort

4. **Alternative for Wins**: Traffic increases can be celebrated elsewhere:
   - Sales Pulse tile (shows revenue impact of traffic)
   - Weekly executive summary email (highlights wins)
   - Separate "SEO Wins" tile (if demand emerges)

5. **Hot Rod AN Context**: CEO is time-constrained (10-12 hours/week on ops). Focus on problems requiring immediate action.

**Display Rule**: Only show pages with ≥20% traffic decreases

**Future Iteration**: If CEO feedback indicates "I want to see wins too", we can:
- Add toggle: "Show increases" (off by default)
- Add "SEO Opportunities" section below anomalies
- Create separate "SEO Wins" tile in Phase 2

---

### Decision 4: Refresh Frequency

**DECISION**: **Option B - 1-hour cache** (SEO changes slowly)

**Rationale**:
1. **SEO Data Velocity**: 
   - SEO rankings and traffic change slowly (hourly, not minutely)
   - Google Search Console data has 24-48 hour delay
   - Refreshing every 5 minutes provides no new information

2. **Performance Optimization**:
   - SEO queries are expensive (join multiple tables, calculate week-over-week)
   - 1-hour cache reduces database load 12X vs 5-minute cache
   - Faster tile load times = better CEO experience

3. **CEO Usage Pattern**:
   - CEO checks dashboard 2-3X/day (morning, midday, evening)
   - 1-hour cache means fresh data at each check-in
   - CEO doesn't need second-by-second SEO updates (not like sales or inventory)

4. **API Rate Limits**:
   - Google Search Console API: 1,200 requests/minute/project
   - With 1-hour cache: 24 requests/day per customer
   - With 5-minute cache: 288 requests/day per customer
   - 1-hour cache scales to 50+ customers without rate limit issues

5. **Data Freshness Trade-off**:
   - Real-time not needed: SEO is strategic (fix over days), not tactical (fix in minutes)
   - 1-hour is fresh enough for daily monitoring
   - If CEO reports "data seems stale", we can reduce to 30 minutes

**Refresh Rules**:
- **Cache TTL**: 1 hour (3600 seconds)
- **Manual Refresh**: CEO can click "Refresh" button to bypass cache
- **Background Job**: Update cache every hour at :00 (e.g., 10:00, 11:00, 12:00)

**Implementation Note**: Use Redis or application-level cache with 1-hour TTL

---

## 3. Example Scenarios

### Scenario A: 3 Pages Drop >20%, 2 Pages Increase >20%

**Input Data**:
- Page 1: "Chrome Headers" - 1000 visits/week, -25% drop → Impact: 250
- Page 2: "Fuel Line Fittings" - 800 visits/week, -22% drop → Impact: 176
- Page 3: "AN Adapters" - 400 visits/week, -30% drop → Impact: 120
- Page 4: "Brake Lines" - 600 visits/week, +35% increase → Impact: N/A (not shown)
- Page 5: "Engine Parts" - 500 visits/week, +40% increase → Impact: N/A (not shown)

**What Displays** (Based on Decisions):
```
SEO Pulse - Traffic Anomalies
─────────────────────────────────
🔴 3 pages with traffic drops

1. Chrome Headers
   1,000 visits/week → 750 (-25%) ⚠️
   
2. Fuel Line Fittings  
   800 visits/week → 624 (-22%) ⚠️
   
3. AN Adapters
   400 visits/week → 280 (-30%) ⚠️

Last updated: 11:15 AM (1h ago)
[Refresh] [View All]
```

**CEO Action**: Review top 3 drops, investigate causes, delegate to marketing team

---

### Scenario B: No Pages Meet Threshold

**Input Data**:
- All pages have < 20% traffic change (stable week)
- No anomalies detected

**What Displays**:
```
SEO Pulse - Traffic Anomalies
─────────────────────────────────
✅ No traffic anomalies detected

All landing pages stable this week.
Great job maintaining SEO performance!

Last updated: 11:15 AM (1h ago)
[Refresh] [View All]
```

**CEO Action**: Quick scan, move on to next tile (< 5 seconds)

---

### Scenario C: 15 Pages Drop >20%

**Input Data**:
- 15 pages have ≥20% traffic drops (major SEO issue, algorithm update, or technical problem)
- Sorted by traffic impact

**What Displays (Desktop)**:
```
SEO Pulse - Traffic Anomalies
─────────────────────────────────
🔴 15 pages with traffic drops (showing top 10)

1. Chrome Headers (1000 → 750, -25%)
2. Fuel Line Fittings (800 → 624, -22%)
3. AN Adapters (400 → 280, -30%)
4. Brake Lines (900 → 675, -25%)
5. Engine Mounts (700 → 525, -25%)
6. Oil Coolers (600 → 450, -25%)
7. Turbo Kits (500 → 375, -25%)
8. Exhaust Systems (450 → 337, -25%)
9. Intercoolers (400 → 300, -25%)
10. Suspension Kits (350 → 262, -25%)

[View 5 More Anomalies] (5 additional pages)

Last updated: 11:15 AM (1h ago)
[Refresh] [View All]
```

**What Displays (Mobile)**:
```
SEO Pulse
─────────────────────────
🔴 15 pages with traffic drops

1. Chrome Headers
   1000 → 750 (-25%) ⚠️

2. Fuel Line Fittings
   800 → 624 (-22%) ⚠️

3. AN Adapters  
   400 → 280 (-30%) ⚠️

4. Brake Lines
   900 → 675 (-25%) ⚠️

5. Engine Mounts
   700 → 525 (-25%) ⚠️

[View 10 More] 

Updated: 11:15 AM
[Refresh]
```

**CEO Action**: 
- Recognize major issue (15 pages = site-wide problem)
- Check for technical issues (site speed, mobile usability)
- Contact marketing team immediately
- Possible algorithm update or competitor action

---

## 4. Success Metrics

### How We'll Know It Works

**Metric 1: Daily Review Rate**
- **Target**: CEO reviews SEO Pulse ≥5 days/week
- **Measurement**: Track tile views in `dashboard_usage_analytics`
- **Success Criteria**: ≥80% of weeks hit target

**Metric 2: Action Rate**
- **Target**: CEO takes action on ≥50% of displayed anomalies
- **Measurement**: Ask during weekly check-ins "Which SEO issues did you investigate?"
- **Success Criteria**: ≥50% of anomalies result in CEO action or delegation

**Metric 3: False Positive Rate**
- **Target**: <20% false positives (anomalies that don't require action)
- **Measurement**: CEO feedback "This alert wasn't useful" or "This was noise"
- **Success Criteria**: ≤2 false positives per week on average

**Metric 4: Time to Identify SEO Issues**
- **Target**: Identify SEO problems within 24 hours (vs 1-2 weeks manually)
- **Measurement**: Ask CEO "When did you first notice [SEO issue]?"
- **Success Criteria**: 80% of issues detected via dashboard (not discovered elsewhere first)

**Metric 5: CEO Satisfaction with SEO Pulse**
- **Target**: CEO rates SEO Pulse ≥7/10 for usefulness
- **Measurement**: Weekly check-in rating
- **Success Criteria**: Average rating ≥7/10 across 4 weeks

### Success Threshold

**Pass**: 4/5 metrics meet targets → SEO Pulse is successful  
**Iterate**: 2-3/5 metrics meet targets → Adjust thresholds based on feedback  
**Fail**: 0-1/5 metrics meet targets → Rethink SEO Pulse design

---

## 5. Handoff Instructions

### For Data Team

**Implement These Exact Values**:

```sql
-- Anomaly detection query
SELECT 
  landing_page_url,
  page_title,
  current_week_visits,
  previous_week_visits,
  ROUND(((current_week_visits - previous_week_visits) * 100.0 / previous_week_visits), 1) as change_percentage,
  (current_week_visits * ABS((current_week_visits - previous_week_visits) * 100.0 / previous_week_visits) / 100) as traffic_impact_score
FROM seo_landing_page_weekly_stats
WHERE 
  -- Only show decreases (Decision 3)
  ((current_week_visits - previous_week_visits) * 100.0 / previous_week_visits) <= -20
  -- Minimum traffic filter (avoid noise)
  AND previous_week_visits >= 50
  -- Current week data
  AND week_start_date = DATE_TRUNC('week', CURRENT_DATE)
ORDER BY traffic_impact_score DESC
LIMIT 10; -- Decision 2: Top 10
```

**Cache Configuration**:
```typescript
// Set 1-hour cache TTL (Decision 4)
const CACHE_TTL = 3600; // seconds

// Cache key
const cacheKey = `seo_anomalies:${storeId}:${weekStartDate}`;

// Redis cache
await redis.set(cacheKey, JSON.stringify(anomalies), 'EX', CACHE_TTL);
```

**Threshold Constants** (for easy tuning):
```typescript
export const SEO_PULSE_CONFIG = {
  ANOMALY_THRESHOLD: -20, // Decision 1: -20% drop
  MIN_TRAFFIC: 50, // Minimum visits/week to consider
  DISPLAY_LIMIT_DESKTOP: 10, // Decision 2: Top 10
  DISPLAY_LIMIT_MOBILE: 5, // Decision 2: Top 5 on mobile
  CACHE_TTL_SECONDS: 3600, // Decision 4: 1 hour
  SHOW_INCREASES: false, // Decision 3: Only decreases
};
```

**Data Quality Requirements**:
- Week-over-week calculation: Compare current week (Mon-Sun) vs previous week (Mon-Sun)
- Handle edge cases: New pages (no previous week data) = don't show
- Handle missing data: If GSC data unavailable, show "Data syncing..." state

---

### For Designer Team

**Design These Specific UI States**:

**State 1: Normal (3-10 Anomalies)**

Desktop Layout:
```
┌────────────────────────────────────────────────────┐
│ SEO Pulse - Traffic Anomalies                      │
├────────────────────────────────────────────────────┤
│ 🔴 5 pages with significant traffic drops          │
│                                                    │
│ 1. Chrome Headers                            [...]│
│    1,000 visits/week → 750 (-25%) ⚠️               │
│    Impact: High-traffic page                       │
│                                                    │
│ 2. Fuel Line Fittings                        [...]│
│    800 visits/week → 624 (-22%) ⚠️                 │
│    Impact: High-traffic page                       │
│                                                    │
│ 3. AN Adapters                               [...]│
│    400 visits/week → 280 (-30%) ⚠️                 │
│    Impact: Medium-traffic page                     │
│                                                    │
│ [Show 2 more anomalies] (collapsed by default)    │
│                                                    │
│ Last updated: 11:15 AM (54 min ago)               │
│ [↻ Refresh] [View All Anomalies →]                │
└────────────────────────────────────────────────────┘
```

Mobile Layout:
```
┌────────────────────────────┐
│ SEO Pulse                  │
├────────────────────────────┤
│ 🔴 5 traffic drops         │
│                            │
│ 1. Chrome Headers          │
│    750 (-25%) ⚠️            │
│                            │
│ 2. Fuel Line Fittings      │
│    624 (-22%) ⚠️            │
│                            │
│ 3. AN Adapters             │
│    280 (-30%) ⚠️            │
│                            │
│ [View 2 More ↓]            │
│                            │
│ Updated: 11:15 AM          │
│ [↻] [View All →]           │
└────────────────────────────┘
```

**State 2: Empty (No Anomalies)**
```
┌────────────────────────────────────────────────────┐
│ SEO Pulse - Traffic Anomalies                      │
├────────────────────────────────────────────────────┤
│                                                    │
│           ✅ All systems green                      │
│                                                    │
│    No significant traffic drops detected.          │
│    Your SEO is performing well this week!          │
│                                                    │
│ Last updated: 11:15 AM (54 min ago)               │
│ [↻ Refresh] [View All Pages →]                     │
└────────────────────────────────────────────────────┘
```

**State 3: Major Issue (15+ Anomalies)**
```
┌────────────────────────────────────────────────────┐
│ SEO Pulse - Traffic Anomalies                      │
├────────────────────────────────────────────────────┤
│ 🚨 15 pages with traffic drops (site-wide issue?)  │
│                                                    │
│ Top 10 most impactful:                             │
│ 1. Chrome Headers (750, -25%)                      │
│ 2. Fuel Line Fittings (624, -22%)                  │
│ [... 8 more items ...]                             │
│                                                    │
│ ⚠️ This looks like a site-wide issue.              │
│ Check for: Algorithm update, technical problems,   │
│ or major ranking changes.                          │
│                                                    │
│ [View All 15 Anomalies →] [Contact Marketing]     │
└────────────────────────────────────────────────────┘
```

**Visual Hierarchy**:
- Alert icon: 🔴 for drops, ✅ for all-clear
- Drop percentage: Bold, red color (#DC2626)
- Page title: Regular weight, clickable
- Traffic numbers: Light gray, secondary
- Action buttons: Primary (blue) for "View All", Secondary (gray) for "Refresh"

**Interaction**:
- Click page title → Drill down to page details (traffic chart, keywords, rankings)
- Click "Refresh" → Bypass cache, show fresh data
- Click "View All" → Full anomaly list page
- Click "[...]" menu → Actions (Investigate, Mark as False Positive, Dismiss)

---

### For Engineer Team

**Technical Constraints**:

1. **Database Query Performance**:
   - Target: < 100ms query time for anomaly detection
   - Use materialized view if needed: `seo_anomalies_current`
   - Index on: `(week_start_date, change_percentage, traffic_impact_score)`

2. **Cache Implementation**:
   - Use Redis for distributed cache (Fly.io multi-region)
   - Cache key format: `seo_anomalies:{store_id}:{week_start}`
   - Implement manual refresh endpoint: `POST /api/tiles/seo-pulse/refresh`

3. **Mobile Responsive Behavior**:
   - Use CSS media query: `@media (max-width: 768px)` → Show top 5
   - Use React conditional: `isMobile ? 5 : 10` for display limit
   - Ensure "View More" button works on touch devices

4. **Error Handling**:
   - If GSC API fails: Show cached data with "Using cached data" notice
   - If no cache: Show "Data unavailable, will retry in 5 minutes"
   - If query timeout: Log error, show last known good data

5. **Configuration Management**:
   - Store `SEO_PULSE_CONFIG` in database (not hardcoded)
   - Allow per-customer override (Hot Rod AN may need different threshold than other customers)
   - UI for Product team to adjust thresholds without code deploy

---

### For QA Team

**Test Scenarios**:

**Test 1: Normal Operation**
- Given: 5 pages with -20% to -30% drops
- When: CEO loads SEO Pulse tile
- Then: All 5 anomalies display correctly, sorted by impact

**Test 2: No Anomalies**
- Given: All pages have < 20% change
- When: CEO loads SEO Pulse tile
- Then: "All systems green" empty state displays

**Test 3: Major Issue (15+ Anomalies)**
- Given: 15 pages with ≥20% drops
- When: CEO loads SEO Pulse tile (desktop)
- Then: Top 10 display, "View 5 More" button shows

**Test 4: Mobile Responsiveness**
- Given: 10 anomalies
- When: CEO loads on mobile device
- Then: Only top 5 display, "View 5 More" button available

**Test 5: Cache Behavior**
- Given: Data cached 30 minutes ago
- When: CEO loads tile
- Then: Cached data displays, "Updated: 30 min ago" shows
- When: CEO clicks "Refresh"
- Then: Fresh data fetches, cache updates

**Test 6: Traffic Increases Not Shown**
- Given: 3 pages with +30% increases, 2 pages with -25% decreases
- When: CEO loads tile
- Then: Only 2 decreases display (increases not shown per Decision 3)

**Test 7: Low-Traffic Filter**
- Given: 5 pages with -30% drops, but only 10 visits/week (below 50 minimum)
- When: CEO loads tile
- Then: Pages not displayed (filtered out for low traffic)

**Test 8: Traffic Impact Sorting**
- Given: Page A (100 visits, -50% drop), Page B (1000 visits, -21% drop)
- When: CEO loads tile
- Then: Page B shows first (higher impact: 210 vs 50)

---

## 6. Future Iterations (Nice-to-Haves)

**Phase 2 Enhancements** (After Week 4 validation):

**Sparkline Charts** (Visual trend):
```
Chrome Headers: ↘️ ▃▅▆▃▂ (7-day trend)
```
- Shows trajectory (gradual vs sudden drop)
- Helps identify temporary blips vs lasting issues

**Drill-Down to Page Details**:
- Click page → Full page analytics
- Traffic chart (30 days)
- Keyword rankings
- Backlink status
- Technical issues detected

**Anomaly Notifications**:
- Slack/email alert when major anomaly detected (>10 pages or >30% drop)
- Daily digest: "SEO Anomalies Today: 3 new issues"
- Push notification on mobile app

**Historical Trend View**:
- Show anomalies over last 4 weeks
- Identify recurring patterns
- Track resolution effectiveness

**Positive Anomalies Option** (If CEO requests):
- Toggle: "Show traffic increases" (off by default)
- Separate section: "SEO Wins" below anomalies
- Green indicators for positive changes

**Anomaly Insights** (AI-powered):
- "Why is this happening?" button
- AI analyzes: Ranking changes, algorithm updates, seasonal patterns
- Suggests: Actions to take (update content, fix technical issues)

---

## 7. Implementation Timeline

**Phase 1: Core Functionality** (This Week)
- Day 1: Data team implements query with thresholds
- Day 2: Designer creates UI mockups
- Day 3: Engineer implements tile with cache
- Day 4: QA tests all scenarios
- Day 5: Deploy to production, CEO sees it

**Phase 2: Refinement** (Week 2-3)
- Adjust thresholds based on CEO feedback
- Fix any UX issues reported
- Optimize performance if needed

**Phase 3: Advanced Features** (Month 2+)
- Add sparklines and drill-downs
- Implement anomaly notifications
- Build AI-powered insights

---

## 8. Decision Summary (Quick Reference)

| Decision | Choice | Value | Rationale |
|----------|--------|-------|-----------|
| **Threshold** | Option A | -20% | Early warning, automotive SEO volatility |
| **Display Count** | Option C | Top 10 (desktop), Top 5 (mobile) | Balance coverage + focus |
| **Show Increases** | Option A | No (decreases only) | Problem-focused, action-oriented |
| **Refresh Frequency** | Option B | 1-hour cache | Performance + SEO data velocity |

**Additional Rules**:
- Minimum traffic filter: ≥50 visits/week
- Sorting: By traffic impact score (visits × drop %)
- Mobile responsive: 5 items on small screens

---

## 9. Risk Mitigation

**Risk 1: Too Many False Positives**
- **Mitigation**: Week 1 feedback will show if -20% threshold is too sensitive
- **Action Plan**: Can increase to -25% or -30% if needed
- **Timeline**: Adjust in Week 2 if >20% false positive rate

**Risk 2: CEO Ignores Tile (Alert Fatigue)**
- **Mitigation**: Top 10 limit prevents overwhelm
- **Action Plan**: If CEO stops checking, reduce to Top 5 or increase threshold
- **Timeline**: Monitor daily review rate, intervene if <3 days/week

**Risk 3: Missing Critical Issues**
- **Mitigation**: -20% threshold is sensitive enough for early detection
- **Action Plan**: If CEO reports "I missed an issue", add notifications or lower threshold
- **Timeline**: Review in Week 4 retrospective

**Risk 4: Performance Degradation**
- **Mitigation**: 1-hour cache reduces database load 12X
- **Action Plan**: If queries slow down, add materialized view or pre-compute anomalies
- **Timeline**: Monitor query time, optimize if >100ms

---

## 10. Validation Plan

**Week 1 Validation**:
- Day 1: CEO sees SEO Pulse with real anomalies (if any)
- Day 3: Ask CEO "Is SEO Pulse useful? Too many/few alerts?"
- Day 7: Review metrics (daily review rate, action rate)

**Week 2-4 Validation**:
- Track all 5 success metrics
- Collect CEO feedback on threshold appropriateness
- Adjust if needed based on data

**Decision Review** (Week 4):
- Review actual false positive rate
- Review CEO action rate on anomalies
- Review daily review rate
- Adjust thresholds if <4/5 metrics met

---

**Document Status**: ✅ APPROVED - Ready for implementation  
**Blocks Cleared**: Data Team + Designer Team can proceed  
**Timeline**: Ready for immediate implementation  
**Owner**: Product Agent  
**Created**: 2025-10-13T21:00:00Z

---

**Next Steps**:
1. Data Team: Implement SQL query and cache (2-3 hours)
2. Designer Team: Create UI mockups (3 hours)
3. Engineer Team: Integrate tile (2-3 hours)
4. QA Team: Test all scenarios (1 hour)
5. Deploy: Week 1 (target: Oct 15-16)

