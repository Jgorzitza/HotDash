# GA4 Custom Dimension: hd_action_key

**Created**: 2025-10-21  
**Property**: 339826228  
**Dimension Name**: Action Key  
**Scope**: Event  
**Event Parameter**: `hd_action_key`  
**Status**: ⏳ Pending manual setup in GA4 console

---

## Overview

The `hd_action_key` custom dimension enables action attribution tracking in the HotDash Growth Engine. It tracks which approved action led to revenue over 7-day, 14-day, and 28-day windows.

### Purpose

- Track action attribution (which approved action led to conversions/revenue)
- Enable Growth Engine feedback loop (Action Queue re-ranking based on realized ROI)
- Support 7d/14d/28d attribution windows for long sales cycles

---

## Configuration

### Custom Dimension Details

| Setting             | Value                                                                 |
| ------------------- | --------------------------------------------------------------------- |
| **Dimension Name**  | Action Key                                                            |
| **Scope**           | Event                                                                 |
| **Event Parameter** | `hd_action_key`                                                       |
| **Description**     | HotDash Action Queue attribution key (format: type-target-YYYY-MM-DD) |

### Format Specification

The `hd_action_key` value follows this format:

```
{action_type}-{target_slug}-{YYYY-MM-DD}
```

**Examples**:

- `seo-fix-powder-board-2025-10-21`
- `inventory-reorder-thermal-gloves-2025-10-22`
- `content-update-home-page-2025-10-23`
- `pricing-adjustment-winter-jacket-2025-10-24`

**Components**:

1. **action_type**: Type of action (seo, inventory, content, pricing, etc.)
2. **target_slug**: Slugified target identifier (product SKU, page name, etc.)
3. **date**: Date action was approved (YYYY-MM-DD format)

---

## Manual Setup Instructions

### Step 1: Login to GA4

1. Navigate to https://analytics.google.com/
2. Select Property **339826228** (HotDash)
3. Ensure you have Edit permissions

### Step 2: Create Custom Dimension

1. In left sidebar, click **Admin** (gear icon)
2. Under **Data display** section, click **Custom definitions**
3. Click **Create custom dimensions** button
4. Fill in the form:
   - **Dimension name**: `Action Key`
   - **Scope**: Select **Event**
   - **Description**: `HotDash Action Queue attribution key (format: type-target-YYYY-MM-DD)`
   - **Event parameter**: `hd_action_key`
5. Click **Save**

### Step 3: Verify Dimension Created

1. Check that "Action Key" appears in the custom dimensions list
2. Note the dimension ID (format: `customEvent:hd_action_key`)
3. Verify scope is "Event" and event parameter is `hd_action_key`

### Step 4: Test with DebugView

1. In GA4, open **DebugView** (left sidebar under Reports)
2. From dev environment, trigger a test event:
   ```javascript
   gtag("event", "page_view", {
     hd_action_key: "test-product-2025-10-21",
   });
   ```
3. In DebugView, select the event
4. Verify custom dimension `hd_action_key` appears with value `test-product-2025-10-21`

### Step 5: Verify in Real-Time Reports

1. After test event, check **Reports** → **Realtime**
2. Look for events with custom dimension `hd_action_key`
3. Confirm dimension is collecting data

---

## Implementation Flow

### 1. Action Approval (Growth Engine Customer-Front)

When an action is approved:

```typescript
const actionKey = `${actionType}-${targetSlug}-${date}`;
// Example: "seo-fix-powder-board-2025-10-21"

// Store action_key in action record
await prisma.action.update({
  where: { id: actionId },
  data: { action_key: actionKey },
});
```

### 2. Client-Side Tracking (Engineer)

When user interacts with content affected by action:

```typescript
// ENG-032: Client tracking integration
import { track } from "~/lib/analytics";

// User views product affected by SEO action
track("page_view", {
  hd_action_key: "seo-fix-powder-board-2025-10-21",
  page_path: "/products/powder-board",
  // ... other event data
});
```

### 3. Attribution Analysis (Analytics Agent)

Query GA4 Data API for action performance:

```typescript
// ANALYTICS-017: Action attribution query
import { BetaAnalyticsDataClient } from "@google-analytics/data";

const analyticsData = new BetaAnalyticsDataClient();

// Query revenue attributed to action over 7-day window
const [response] = await analyticsData.runReport({
  property: `properties/339826228`,
  dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
  dimensions: [{ name: "customEvent:hd_action_key" }],
  metrics: [
    { name: "totalRevenue" },
    { name: "transactions" },
    { name: "engagementRate" },
  ],
  dimensionFilter: {
    filter: {
      fieldName: "customEvent:hd_action_key",
      stringFilter: {
        matchType: "EXACT",
        value: "seo-fix-powder-board-2025-10-21",
      },
    },
  },
});

// Extract realized ROI
const totalRevenue = response.rows[0]?.metricValues[0]?.value || 0;
const transactions = response.rows[0]?.metricValues[1]?.value || 0;
```

### 4. Action Queue Re-Ranking (Growth Engine)

Update action scores based on realized ROI:

```typescript
// Re-rank Action Queue based on attribution data
const actionPerformance = await fetchGA4Attribution(actionKey);

await prisma.action.update({
  where: { action_key: actionKey },
  data: {
    realized_roi: actionPerformance.totalRevenue,
    realized_conversions: actionPerformance.transactions,
    attribution_window: "7d",
    last_attribution_check: new Date(),
  },
});

// Re-rank queue using realized ROI + predicted ROI
await reRankActionQueue();
```

---

## Environment Variables

### Local Development

Add to `.env`:

```bash
GA4_PROPERTY_ID=339826228
GA4_CUSTOM_DIMENSION_ACTION_KEY=customEvent:hd_action_key
```

### Fly.io Production

Set secrets:

```bash
fly secrets set \
  GA4_PROPERTY_ID=339826228 \
  GA4_CUSTOM_DIMENSION_ACTION_KEY=customEvent:hd_action_key \
  --app hotdash-staging
```

---

## Attribution Windows

The Growth Engine tracks action performance over multiple windows:

| Window      | Use Case                                                            |
| ----------- | ------------------------------------------------------------------- |
| **7 days**  | Fast-moving products, immediate impact actions (inventory, pricing) |
| **14 days** | Standard purchase cycle, content updates, SEO fixes                 |
| **28 days** | Long sales cycles, high-consideration products, brand awareness     |

Each window provides different insights:

- **7d**: Immediate impact validation
- **14d**: Standard attribution for most actions
- **28d**: Full customer journey, especially for B2B or high-ticket items

---

## Testing Strategy

### Development Environment

1. **DebugView Testing** (Real-time):

   ```javascript
   // Enable debug mode
   gtag("config", "GA4_MEASUREMENT_ID", { debug_mode: true });

   // Emit test event
   gtag("event", "page_view", {
     hd_action_key: "test-product-2025-10-21",
   });
   ```

2. **Verify in DebugView**:
   - Open GA4 DebugView
   - Look for event with `hd_action_key` parameter
   - Confirm value appears correctly

### Staging Environment

1. **Real-Time Reports** (5-minute delay):

   ```javascript
   // Normal tracking (debug mode off)
   track("page_view", {
     hd_action_key: "staging-test-product-2025-10-21",
   });
   ```

2. **Check Realtime Reports**:
   - GA4 → Reports → Realtime
   - Look for events with custom dimension
   - Verify data collection within 5 minutes

### Production Environment

1. **Standard Reports** (24-48 hour delay):
   - GA4 → Reports → Custom report
   - Add dimension: "Action Key" (`customEvent:hd_action_key`)
   - Add metrics: Revenue, Transactions, Engagement Rate
   - Date range: Last 7/14/28 days

2. **Data API Validation**:
   ```bash
   # Test GA4 Data API query
   node scripts/test-ga4-attribution.js --action-key="seo-fix-powder-board-2025-10-21"
   ```

---

## Troubleshooting

### Dimension Not Appearing in Reports

**Issue**: Custom dimension doesn't show in GA4 reports

**Solutions**:

1. Wait 24-48 hours for dimension to populate in standard reports
2. Check DebugView for immediate validation
3. Verify dimension was created with correct event parameter name
4. Ensure events are emitting the `hd_action_key` parameter

### Dimension Shows No Data

**Issue**: Dimension exists but shows no data

**Solutions**:

1. Verify client-side tracking is emitting `hd_action_key`
2. Check browser console for gtag errors
3. Use DebugView to confirm events are being sent
4. Verify event parameter name matches exactly: `hd_action_key`

### Attribution Data Incomplete

**Issue**: Some actions show attribution data, others don't

**Solutions**:

1. Verify action_key format is consistent (type-target-YYYY-MM-DD)
2. Check that client tracking is implemented for all affected pages
3. Ensure attribution window is appropriate (7d may miss long sales cycles)
4. Verify GA4 Data API query filters are correct

---

## Related Documentation

- **Engineer**: `docs/directions/engineer.md` (ENG-032, ENG-033 - Client tracking implementation)
- **Analytics**: `docs/directions/analytics.md` (ANALYTICS-017 - Attribution query implementation)
- **Growth Engine**: `docs/GROWTH_ENGINE.md` (Action Queue re-ranking logic)
- **GA4 Data API**: https://developers.google.com/analytics/devguides/reporting/data/v1

---

## Completion Checklist

### DevOps (DEVOPS-015)

- [ ] Create this documentation file
- [ ] Add GA4 environment variables to `.env`
- [ ] Set Fly.io secrets for staging/production
- [ ] Notify Manager that manual GA4 setup is required

### Manager/CEO (Manual GA4 Setup)

- [ ] Login to GA4 Property 339826228
- [ ] Create custom dimension "Action Key" (event scope)
- [ ] Verify dimension created successfully
- [ ] Test dimension with DebugView
- [ ] Confirm dimension appears in GA4 console
- [ ] Notify Engineer that dimension is ready

### Engineer (ENG-032, ENG-033)

- [ ] Implement client-side tracking with `hd_action_key`
- [ ] Test tracking in DebugView
- [ ] Verify events appear in Realtime reports
- [ ] Deploy tracking to production

### Analytics (ANALYTICS-017)

- [ ] Implement GA4 Data API attribution query
- [ ] Test query with sample action_key
- [ ] Verify revenue/transaction data retrieval
- [ ] Integrate with Action Queue re-ranking

---

## Status

**Current Status**: ⏳ **Pending manual GA4 setup**

**Next Steps**:

1. Manager/CEO performs manual GA4 setup (Steps 1-5 above)
2. Manager notifies DevOps when dimension is created
3. DevOps verifies dimension in GA4 console
4. Engineer proceeds with client-side tracking implementation

**ETA**: 1 hour manual setup + testing

---

## Notes

- Custom dimension limit: 50 event-scoped dimensions per property (GA4 limit)
- Current usage: Verify in GA4 Admin → Custom definitions
- Data retention: 14 months (GA4 standard retention)
- Attribution data available in standard reports after 24-48 hours
