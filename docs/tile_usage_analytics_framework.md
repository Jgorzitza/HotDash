# Tile Usage Analytics Framework

**Version**: 1.0  
**Date**: October 12, 2025  
**Owner**: Product Agent

---

## Analytics Goal

Identify which dashboard tiles deliver most value to operators, prioritize improvements on high-usage tiles.

**Key Questions**:
1. Which tiles do operators use most? (daily actives)
2. How much time do they spend per tile? (engagement)
3. Which tiles drive the most value? (time saved, decisions made)
4. Which tiles are ignored? (candidates for removal or redesign)

---

## Tiles to Track

### Hot Rod AN Dashboard Tiles
1. **Sales Pulse** - Real-time sales overview
2. **Inventory Alerts** - Low stock notifications
3. **Ops Pulse** - Operations overview
4. **Customer Mood** - Support sentiment
5. **Approval Queue** - AI-assisted support
6. **Analytics** - Business insights (if implemented)

---

## Metrics Per Tile

### Usage Metrics
- **Views per Day**: How many times tile opened
- **Time Spent**: Average seconds per session
- **Daily Active Users**: % of operators who view tile daily
- **Engagement Rate**: % of sessions where tile is viewed

### Value Metrics
- **Actions Taken**: Exports, approvals, clicks
- **Time Saved**: Self-reported time savings attributed to tile
- **Business Impact**: Decisions made using tile data

### Quality Metrics
- **Error Rate**: % of tile loads that fail
- **Load Time**: Milliseconds to render
- **Satisfaction**: Operator rating of tile (survey)

---

## Tracking Implementation (Using MCP)

### Supabase MCP - Event Logging

**Create events table**:
```sql
CREATE TABLE tile_usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id UUID,
  tile_name VARCHAR(50),
  event_type VARCHAR(20), -- viewed, action_taken, exported
  session_id UUID,
  timestamp TIMESTAMP DEFAULT NOW(),
  duration_seconds INT,
  metadata JSONB
);
```

**Track events**:
- `tile_viewed` - When operator opens tile
- `tile_action` - When operator takes action (export, approve, etc.)
- `tile_closed` - When operator navigates away (calculate duration)

**Query for analytics**:
```sql
-- Top tiles by daily active users
SELECT 
  tile_name,
  COUNT(DISTINCT operator_id) as daily_actives,
  COUNT(*) as total_views,
  AVG(duration_seconds) as avg_time_spent
FROM tile_usage_events
WHERE DATE(timestamp) = CURRENT_DATE
  AND event_type = 'viewed'
GROUP BY tile_name
ORDER BY daily_actives DESC;
```

---

## Weekly Tile Report

### Report Format (Every Monday)

```markdown
## Tile Usage Report - Week [N]

### Top 3 Tiles (Most Used)
1. **Sales Pulse**: 98% operators use daily, 45 sec avg time
   - Actions: 23 exports to CSV
   - Value: CEO used for weekly business review
   
2. **Approval Queue**: 87% operators use daily, 12 min avg time
   - Actions: 156 approvals processed
   - Value: 4.2 hours saved per operator
   
3. **Inventory Alerts**: 65% operators check daily, 30 sec avg
   - Actions: 8 reorders triggered
   - Value: Prevented 2 stockouts

### Bottom 3 Tiles (Least Used)
1. **Analytics**: 12% operators use, 15 sec avg time
   - Issue: Too complex? Not valuable?
   - Action: Survey CEO - "Why don't you use Analytics tile?"
   
2. **Customer Mood**: 34% use, 10 sec avg
   - Issue: Not actionable?
   - Action: Add "Respond to unhappy customer" button

### Improvements Planned
- Sales Pulse: Add week-over-week comparison chart
- Approval Queue: Add keyboard shortcuts
- Analytics: Simplify or remove if no adoption by Week 4
```

---

## Tile Prioritization Matrix

| Tile | Usage | Value | Satisfaction | Priority |
|------|-------|-------|-------------|----------|
| Sales Pulse | High (98%) | High (business decisions) | 9/10 | P0 - Invest heavily |
| Approval Queue | High (87%) | High (time saved) | 8/10 | P0 - Optimize |
| Inventory Alerts | Medium (65%) | High (prevent stockouts) | 9/10 | P1 - Improve visibility |
| Ops Pulse | Medium (54%) | Medium (overview) | 7/10 | P2 - Iterate |
| Customer Mood | Low (34%) | Low (awareness only) | 6/10 | P3 - Redesign or remove |
| Analytics | Low (12%) | Unknown | 5/10 | P3 - Survey users, fix or kill |

**Priority Levels**:
- **P0**: High usage + high value = invest heavily
- **P1**: High value but lower usage = improve discoverability
- **P2**: Medium usage/value = iterate based on feedback
- **P3**: Low usage/value = fix, pivot, or sunset

---

## Action Plan Based on Usage

### For High-Usage Tiles (>70% daily active)
- **Invest**: Add more features, improve performance
- **Optimize**: Reduce load time, add shortcuts
- **Expand**: Ask operators "What else would you want here?"

### For Medium-Usage Tiles (40-70% daily active)
- **Improve Discoverability**: Onboarding focus, tooltips
- **Add Value**: New insights or actions
- **Survey**: "Why don't you use this more?"

### For Low-Usage Tiles (<40% daily active)
- **Diagnose**: Is it confusing? Not valuable? Hard to find?
- **Iterate**: Redesign based on feedback
- **Kill Decision**: If no improvement after 2 iterations, remove tile

---

## Evidence Logging

**In** `feedback/product.md`:
```markdown
### 2025-10-21 - P1 Task 4: Tile Usage Analytics (Week 1)

**Top Tiles**:
1. Sales Pulse: 98% daily usage, avg 45sec, 23 CSV exports
2. Approval Queue: 87% daily usage, 12 min avg, 156 approvals

**Low Usage**:
- Analytics: 12% (CEO says "too complex, not sure what it means")

**Actions**:
- P0: Optimize Sales Pulse (add trends)
- P3: Redesign Analytics or remove

**Evidence**: Supabase query results, CEO survey responses
**North Star**: Focus on tiles operators actually use (Sales Pulse, Approvals)
```

---

**Document Owner**: Product Agent  
**Created**: October 12, 2025  
**Status**: Track Starting Oct 15

**End of Tile Usage Analytics Framework**

