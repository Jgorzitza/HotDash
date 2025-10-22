# GA4 Action Attribution Setup Guide — Two Approaches

**Purpose**: Track HotDash action attribution using GA4  
**Property ID**: 339826228  
**Implementation**: `hd_action_key` (Event OR Custom Dimension)  
**Owner**: SEO + Analytics + DevOps  
**Effective**: 2025-10-21  
**Status**: CEO created `hd_action_key` as Event (2025-10-21)

---

## Overview

This guide documents TWO approaches to track which approved actions from the HotDash Action Queue drive revenue:

1. **Approach A: Event-Based** (✅ Currently Implemented by CEO)
2. **Approach B: Custom Dimension** (Alternative/Upgrade)

**Current Status**: CEO created `hd_action_key` as an Event in GA4. This guide now covers both approaches.

### What is Action Attribution?

When the operator approves an action (SEO fix, inventory adjustment, content change), we assign it a unique action identifier like:
- `seo-fix-powder-board-2025-10-21`
- `inventory-reorder-wheels-2025-10-21`
- `content-update-homepage-2025-10-21`

This identifier is tracked in GA4 for 7-28 days to measure which actions drive revenue.

---

## APPROACH A: Event-Based (✅ Current Setup)

**Status**: CEO created `hd_action_key` as Event in GA4 (2025-10-21)  
**Works**: Yes, with proper implementation  
**Complexity**: Medium (requires user correlation)

### How It Works

1. **Action Applied** → Send `hd_action_key` event with user identifier
2. **User Browses** → Track their session
3. **User Purchases** → Correlate purchase with users who received action
4. **Query** → Find purchases from users who triggered `hd_action_key` event

### Implementation Code

**When Action is Approved**:
```javascript
// Set in localStorage for tracking
const actionKey = 'seo-fix-powder-board-2025-10-21';
const expiryDate = new Date();
expiryDate.setDate(expiryDate.getDate() + 28);

localStorage.setItem('hd_action_key', actionKey);
localStorage.setItem('hd_action_expiry', expiryDate.toISOString());

// Send hd_action_key event (triggers your GA4 event)
if (window.gtag) {
  gtag('event', 'hd_action_key', {
    action_id: actionKey,
    action_type: 'seo',
    action_target: 'powder-board',
    expected_revenue: 500
  });
}
```

**Querying Attribution** (GA4 Data API):
```typescript
// Step 1: Get users who received the action
const actionUsers = await analyticsDataClient.runReport({
  property: 'properties/339826228',
  dateRanges: [{ startDate: '2025-10-21', endDate: '2025-11-18' }],
  dimensions: [{ name: 'userId' }],
  metrics: [{ name: 'eventCount' }],
  dimensionFilter: {
    andGroup: {
      expressions: [
        {
          filter: {
            fieldName: 'eventName',
            stringFilter: { value: 'hd_action_key' }
          }
        },
        {
          filter: {
            fieldName: 'customEvent:action_id',
            stringFilter: { value: 'seo-fix-powder-board-2025-10-21' }
          }
        }
      ]
    }
  }
});

// Step 2: Get purchases from those users
const userIds = actionUsers.rows.map(row => row.dimensionValues[0].value);

const purchases = await analyticsDataClient.runReport({
  property: 'properties/339826228',
  dateRanges: [{ startDate: '2025-10-21', endDate: '2025-11-18' }],
  dimensions: [{ name: 'userId' }],
  metrics: [{ name: 'totalRevenue' }],
  dimensionFilter: {
    andGroup: {
      expressions: [
        {
          filter: {
            fieldName: 'eventName',
            stringFilter: { value: 'purchase' }
          }
        },
        {
          inListFilter: {
            fieldName: 'userId',
            values: userIds
          }
        }
      ]
    }
  }
});
```

### Pros & Cons

**Pros**:
- ✅ Already configured (no additional setup)
- ✅ Visible in Events list
- ✅ Can track when action was applied

**Cons**:
- ❌ Two-step query (find users, then find purchases)
- ❌ Requires User-ID tracking (may need to enable)
- ❌ Counts toward event quota
- ❌ More complex attribution logic

---

## APPROACH B: Custom Dimension (Recommended Upgrade)

**Status**: Not yet created (GUI unavailable as of Oct 2025)  
**Works**: Yes, via Admin API  
**Complexity**: Medium (API required, but automated)

### Create Custom Dimension via GA4 Admin API

**Note**: As of October 2025, GA4 GUI no longer allows creating custom dimensions. Must use Admin API.

### Prerequisites

1. **Service Account** with GA4 edit permissions
2. **OAuth Scope**: `https://www.googleapis.com/auth/analytics.edit`
3. **Property ID**: 339826228

### Node.js Implementation

**Install SDK**:
```bash
npm install @google-analytics/admin
```

**Create Custom Dimension**:
```typescript
import { AnalyticsAdminServiceClient } from '@google-analytics/admin';

async function createCustomDimension() {
  const analyticsAdmin = new AnalyticsAdminServiceClient({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  });

  const [customDimension] = await analyticsAdmin.createCustomDimension({
    parent: 'properties/339826228',
    customDimension: {
      parameterName: 'hd_action_key',
      displayName: 'Action Key',
      description: 'HotDash action attribution key for ROI tracking',
      scope: 'EVENT', // Event-scoped dimension
    },
  });

  console.log('Custom dimension created:', customDimension.name);
  console.log('Parameter:', customDimension.parameterName);
  console.log('Scope:', customDimension.scope);
  
  return customDimension;
}
```

**API Endpoint** (REST):
```bash
POST https://analyticsadmin.googleapis.com/v1alpha/properties/339826228/customDimensions

# Request Body:
{
  "parameterName": "hd_action_key",
  "displayName": "Action Key",
  "description": "HotDash action attribution key for ROI tracking",
  "scope": "EVENT"
}

# Headers:
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

### Verify Creation

**List Custom Dimensions**:
```typescript
const [customDimensions] = await analyticsAdmin.listCustomDimensions({
  parent: 'properties/339826228',
});

customDimensions.forEach(dimension => {
  console.log(`${dimension.displayName}: ${dimension.parameterName} (${dimension.scope})`);
});
```

**Expected Output**:
```
Action Key: hd_action_key (EVENT)
```

---

### When to Use Custom Dimension

**Upgrade to Custom Dimension when**:
- ✅ You want simpler queries (single query instead of two-step)
- ✅ You have GA4 service account credentials
- ✅ You want action key attached to every purchase event
- ✅ You need better reporting in GA4 Explore

**Script**: `scripts/analytics/create-ga4-custom-dimension.ts` (create when ready to upgrade)

---

## Recommendation for Your Current Setup

**For now, use the Event approach (Approach A)**:
1. You already created the `hd_action_key` event ✅
2. It will work for attribution (with proper code)
3. Upgrade to Custom Dimension later when needed

**Implementation priority**:
1. ✅ Event created (done by CEO)
2. → Add code to trigger event when action is applied
3. → Add User-ID tracking to correlate users → purchases
4. → Query GA4 for attribution
5. → (Later) Upgrade to Custom Dimension via API

---

## Part 2: Event Scope vs User Scope (For Custom Dimensions)

### Why Event Scope?

**Event scope** is correct for action attribution because:

✅ **Multiple actions can be tested simultaneously**  
- Customer A sees action `seo-fix-1` results
- Customer B sees action `content-update-2` results
- Both tracked independently in same session

✅ **Time-bound attribution windows**  
- Action ROI measured for 7d, 14d, 28d windows
- Event scope allows precise date filtering

✅ **Shopify native GA4 already sends events**  
- `page_view`, `add_to_cart`, `begin_checkout`, `purchase`
- We piggyback on existing events with custom parameter

❌ **User scope would overwrite previous action**  
- Only one action key per user at a time
- Can't test multiple actions in parallel

### Custom Dimension Limits

GA4 has limits per property:
- **Event-scoped**: 50 custom dimensions (we use 1)
- **User-scoped**: 25 custom dimensions
- **Item-scoped**: 10 custom dimensions

We're well within limits.

---

## Part 3: Implementation Code (Both Approaches)

### How Shopify Native GA4 Works

Shopify has **built-in GA4 integration** that automatically sends:

1. **page_view** - Every page load
2. **view_item** - Product page views
3. **add_to_cart** - Add to cart button
4. **begin_checkout** - Checkout initiation
5. **purchase** - Order completion

These events are sent via **Shopify Web Pixels** (customer privacy compliant).

### Implementation for Current Event Approach

**Location**: Shopify Admin → Settings → Customer events → Custom pixels

**Code for Event Approach** (works with your current setup):
```javascript
// HotDash Action Attribution Web Pixel (Event Approach)
(function() {
  // Get action key from localStorage (set by Action Queue UI)
  const actionKey = localStorage.getItem('hd_action_key');
  const actionExpiry = localStorage.getItem('hd_action_expiry');
  
  // Check if action key is valid and not expired
  if (!actionKey || !actionExpiry) return;
  if (new Date() > new Date(actionExpiry)) {
    localStorage.removeItem('hd_action_key');
    localStorage.removeItem('hd_action_expiry');
    return;
  }

  // Send hd_action_key event on page load (triggers your GA4 event)
  if (window.gtag) {
    gtag('event', 'hd_action_key', {
      action_id: actionKey,
      action_timestamp: new Date().toISOString()
    });
  }

  // Also track with purchase events for easier correlation
  analytics.subscribe('checkout_completed', (event) => {
    if (window.gtag) {
      gtag('event', 'action_attributed_purchase', {
        action_id: actionKey,
        transaction_id: event.data.checkout.order.id,
        value: event.data.checkout.totalPrice.amount
      });
    }
  });
})();
```

### Implementation for Custom Dimension Approach (Future)

**Location**: Shopify Admin → Settings → Customer events → Custom pixels

**Code**:
```javascript
// HotDash Action Attribution Web Pixel
// Adds hd_action_key to all GA4 events

(function() {
  // Get action key from localStorage (set by Action Queue UI)
  const actionKey = localStorage.getItem('hd_action_key');
  const actionExpiry = localStorage.getItem('hd_action_expiry');
  
  // Check if action key is valid and not expired
  if (!actionKey || !actionExpiry) return;
  if (new Date() > new Date(actionExpiry)) {
    localStorage.removeItem('hd_action_key');
    localStorage.removeItem('hd_action_expiry');
    return;
  }

  // Subscribe to all analytics events
  analytics.subscribe('all_events', (event) => {
    // Only enhance GA4 events
    if (event.name && event.data) {
      // Add custom parameter to event data
      event.customData = event.customData || {};
      event.customData.hd_action_key = actionKey;
    }
  });

  // Alternative: Directly enhance GA4 events
  if (window.gtag) {
    const originalGtag = window.gtag;
    window.gtag = function() {
      const args = Array.from(arguments);
      
      // Add hd_action_key to event parameters
      if (args[0] === 'event' && args.length >= 3) {
        args[2] = args[2] || {};
        args[2].hd_action_key = actionKey;
      }
      
      return originalGtag.apply(this, args);
    };
  }
})();
```

### Method 2: Google Tag Manager (Alternative)

If using GTM instead of native Shopify GA4:

1. Create **Data Layer Variable**:
   - Name: `HotDash Action Key`
   - Variable Type: Data Layer Variable
   - Data Layer Variable Name: `hdActionKey`

2. Create **JavaScript Variable**:
   - Name: `HotDash Action Key from Storage`
   - Variable Type: Custom JavaScript
   - Code:
   ```javascript
   function() {
     return localStorage.getItem('hd_action_key') || 'none';
   }
   ```

3. **Modify GA4 Event Tag**:
   - In **Event Parameters**, add:
     - Parameter Name: `hd_action_key`
     - Value: `{{HotDash Action Key from Storage}}`

---

## Part 4: Setting Action Key from Action Queue UI

### When Operator Approves Action

**Location**: `app/components/ActionQueueDrawer.tsx` (or equivalent)

**Code**:
```typescript
// When action is approved and applied
function onActionApplied(action: Action) {
  // Generate action key
  const actionKey = `${action.type}-${action.targetSlug}-${action.date}`;
  
  // Set in localStorage with 28-day expiry
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 28);
  
  localStorage.setItem('hd_action_key', actionKey);
  localStorage.setItem('hd_action_expiry', expiryDate.toISOString());
  
  // Also send to GA4 immediately as custom event
  if (window.gtag) {
    window.gtag('event', 'action_applied', {
      hd_action_key: actionKey,
      action_type: action.type,
      action_target: action.targetSlug,
      expected_revenue: action.expectedRevenue,
    });
  }
}
```

### Action Key Format

**Pattern**: `{type}-{target}-{date}`

**Examples**:
- `seo-fix-powder-board-2025-10-21`
- `inventory-reorder-wheels-2025-10-21`
- `content-update-homepage-2025-10-21`
- `ads-campaign-fall-sale-2025-10-21`

**Rules**:
- Lowercase
- Hyphen-separated
- Max 50 characters (GA4 limit)
- Unique per action

---

## Part 5: Querying Custom Dimension in GA4

### Using GA4 Exploration Reports

1. Go to **Explore** → **Create new exploration**
2. **Dimensions**: Add `Action Key` (your custom dimension)
3. **Metrics**: Add:
   - Conversions
   - Purchase revenue
   - Add to carts
   - Sessions
4. **Filters**: 
   - Date range: Last 28 days
   - Action Key: contains `seo-` (or specific action)

### Using GA4 Data API

**Endpoint**: `https://analyticsdata.googleapis.com/v1beta/properties/339826228:runReport`

**Example Request**:
```json
{
  "dateRanges": [
    {
      "startDate": "2025-10-21",
      "endDate": "2025-11-18"
    }
  ],
  "dimensions": [
    {
      "name": "customEvent:hd_action_key"
    }
  ],
  "metrics": [
    {
      "name": "conversions"
    },
    {
      "name": "totalRevenue"
    },
    {
      "name": "addToCarts"
    }
  ],
  "dimensionFilter": {
    "filter": {
      "fieldName": "customEvent:hd_action_key",
      "stringFilter": {
        "matchType": "BEGINS_WITH",
        "value": "seo-fix-"
      }
    }
  }
}
```

**Node.js Example**:
```typescript
import { BetaAnalyticsDataClient } from '@google-analytics/data';

const analyticsDataClient = new BetaAnalyticsDataClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

async function getActionAttribution(actionKey: string) {
  const [response] = await analyticsDataClient.runReport({
    property: `properties/339826228`,
    dateRanges: [
      {
        startDate: '28daysAgo',
        endDate: 'today',
      },
    ],
    dimensions: [
      {
        name: 'customEvent:hd_action_key',
      },
    ],
    metrics: [
      {
        name: 'conversions',
      },
      {
        name: 'totalRevenue',
      },
    ],
    dimensionFilter: {
      filter: {
        fieldName: 'customEvent:hd_action_key',
        stringFilter: {
          value: actionKey,
        },
      },
    },
  });

  return response.rows;
}
```

---

## Part 6: Testing and Validation

### Step 1: Test Action Key Storage

**Browser Console**:
```javascript
// Set test action
localStorage.setItem('hd_action_key', 'test-action-2025-10-21');
localStorage.setItem('hd_action_expiry', new Date(Date.now() + 28*24*60*60*1000).toISOString());

// Verify
console.log(localStorage.getItem('hd_action_key'));
// Expected: "test-action-2025-10-21"
```

### Step 2: Test GA4 Event Sending

**Browser Console** (with GA4 Debug Mode):
```javascript
// Enable debug mode
localStorage.setItem('ga_debug', '1');

// Trigger test event
if (window.gtag) {
  gtag('event', 'test_event', {
    hd_action_key: 'test-action-2025-10-21',
  });
}

// Check browser network tab for:
// - Request to google-analytics.com/g/collect
// - Parameter: ep.hd_action_key=test-action-2025-10-21
```

### Step 3: Verify in GA4 DebugView

1. Go to GA4 → **Admin** → **DebugView**
2. With debug mode enabled, perform actions:
   - View a product
   - Add to cart
   - Initiate checkout
3. In DebugView, expand each event
4. Look for **hd_action_key** parameter in event details

### Step 4: Wait for Data Processing

- **DebugView**: Real-time (immediate)
- **Realtime Report**: 1-5 minutes
- **Standard Reports**: 24-48 hours
- **Custom Dimensions**: Up to 48 hours for first appearance

---

## Part 7: ROI Attribution Windows

### Attribution Logic

**7-Day Window**:
- Revenue from purchases where `hd_action_key` was set within 7 days of action approval
- Good for immediate impact actions (homepage content, urgent SEO fixes)

**14-Day Window**:
- Revenue from purchases within 14 days
- Good for marketing campaigns, product page updates

**28-Day Window**:
- Revenue from purchases within 28 days
- Good for structural SEO changes, long-tail content

### Implementation

**Database**: Store in `action_queue` table:
```sql
ALTER TABLE action_queue ADD COLUMN action_key VARCHAR(50);
ALTER TABLE action_queue ADD COLUMN approved_at TIMESTAMP;
ALTER TABLE action_queue ADD COLUMN revenue_7d DECIMAL(10,2);
ALTER TABLE action_queue ADD COLUMN revenue_14d DECIMAL(10,2);
ALTER TABLE action_queue ADD COLUMN revenue_28d DECIMAL(10,2);
```

**Cron Job**: Daily at 3am, update revenue attribution:
```typescript
// scripts/cron/update-action-attribution.ts
import { getActionAttribution } from '../lib/analytics/ga4-data-api';

async function updateActionAttribution() {
  const actions = await db.query(`
    SELECT action_key, approved_at
    FROM action_queue
    WHERE approved_at >= NOW() - INTERVAL '28 days'
    AND status = 'applied'
  `);

  for (const action of actions) {
    const revenue = await getActionAttribution(action.action_key);
    
    await db.query(`
      UPDATE action_queue
      SET 
        revenue_7d = $1,
        revenue_14d = $2,
        revenue_28d = $3,
        updated_at = NOW()
      WHERE action_key = $4
    `, [
      revenue.revenue_7d,
      revenue.revenue_14d,
      revenue.revenue_28d,
      action.action_key,
    ]);
  }
}
```

---

## Part 8: Action Queue Re-Ranking

### Re-Rank Based on Proven ROI

**Algorithm**:
```typescript
// Calculate ROI score for ranking
function calculateROIScore(action: Action, historicalData: ActionHistory[]) {
  // Base score from prediction
  let score = action.expected_revenue * action.confidence * action.ease;
  
  // Boost from historical similar actions
  const similarActions = historicalData.filter(h => 
    h.type === action.type && h.revenue_14d > 0
  );
  
  if (similarActions.length > 0) {
    const avgROI = similarActions.reduce((sum, a) => 
      sum + (a.revenue_14d / a.expected_revenue), 0
    ) / similarActions.length;
    
    // Boost score by proven ROI multiplier
    score *= Math.max(avgROI, 0.5); // Floor at 50% to avoid over-penalizing
  }
  
  return score;
}
```

**Example**:
- Action: `seo-fix-powder-board-2025-10-21`
- Expected revenue: $500
- Actual revenue (14d): $750
- ROI multiplier: 1.5x
- Future similar SEO fixes get 1.5x score boost

---

## Summary Checklist

### Setup (One-time):
- [ ] Create `hd_action_key` custom dimension in GA4 (event-scoped)
- [ ] Deploy Custom Web Pixel to Shopify
- [ ] Add action key setter to Action Queue UI
- [ ] Create GA4 Data API service for querying
- [ ] Set up daily cron job for attribution updates

### Per Action (Automated):
- [ ] Generate unique action key on approval
- [ ] Store in localStorage with 28-day expiry
- [ ] Send to GA4 with all events
- [ ] Query GA4 after 7d, 14d, 28d
- [ ] Update action_queue table with revenue
- [ ] Re-rank future actions based on proven ROI

### Validation:
- [ ] Test in DebugView (real-time)
- [ ] Verify in Realtime Report (1-5 min)
- [ ] Confirm in Exploration Report (24-48h)
- [ ] Check attribution accuracy (weekly)

---

**Document Version**: 1.0  
**Last Updated**: 2025-10-21  
**Maintained By**: SEO Agent  
**Questions**: See Analytics agent or DevOps for implementation

