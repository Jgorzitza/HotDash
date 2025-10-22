# GA4 Custom Dimensions Setup

**Task**: ANALYTICS-100  
**Status**: Complete  
**Created**: 2025-10-22  

## Overview

This document describes the setup and usage of GA4 custom dimensions for Growth Engine action attribution tracking.

## Custom Dimension: hd_action_key

### Configuration

- **Parameter Name**: `hd_action_key`
- **Display Name**: Action Attribution Key
- **Description**: Growth Engine action attribution tracking for ROI measurement
- **Scope**: Event
- **Property ID**: 339826228

### Purpose

The `hd_action_key` custom dimension tracks which Growth Engine actions led to conversions, enabling ROI measurement and action optimization.

### Format

Action keys follow the format: `{type}-{target_slug}-{YYYY-MM-DD}`

Examples:
- `seo-fix-powder-board-2025-10-22`
- `ads-campaign-summer-sale-2025-10-21`
- `content-blog-post-launch-2025-10-20`

## Setup Instructions

### 1. Create Custom Dimension

#### Option A: Automated Setup (Requires Admin API Access)

Run the setup script:

```bash
npx tsx scripts/analytics/setup-ga4-custom-dimensions.ts
```

#### Option B: Manual Setup (Recommended)

1. Go to [GA4 Admin](https://analytics.google.com/analytics/web/#/p339826228/admin)
2. Navigate to **Data Display** > **Custom Definitions** > **Custom Dimensions**
3. Click **Create custom dimensions**
4. Configure:
   - **Dimension name**: `Action Attribution Key`
   - **Scope**: `Event`
   - **Description**: `Growth Engine action attribution tracking for ROI measurement`
   - **Event parameter**: `hd_action_key`
5. Click **Save**

### 2. Verify in GA4 Admin

1. Go to GA4 Admin > Data Display > Custom Definitions
2. Verify `hd_action_key` appears with Event scope
3. Check that it's active and configured correctly

### 3. Test Tracking

1. Enable GA4 DebugView
2. Navigate to a page with action attribution
3. Verify events include `hd_action_key` parameter

## Usage

### Client-Side Tracking

The custom dimension is automatically included in GA4 events when an action key is present:

```typescript
import { trackEvent, setActionKey } from '~/utils/analytics';

// Set action key when user clicks attributed link
setActionKey('seo-fix-powder-board-2025-10-22');

// Events automatically include hd_action_key
trackEvent('page_view', { page_path: '/products/powder-board' });
trackEvent('add_to_cart', { item_id: 'powder-board', value: 299.99 });
trackEvent('purchase', { transaction_id: 'ORDER_123', value: 299.99 });
```

### Server-Side Attribution

Action keys are generated server-side and included in action links:

```typescript
// Generate action key
const actionKey = `${actionType}-${targetSlug}-${date}`;

// Include in action link
const actionUrl = `https://example.com/products/powder-board?hd_action=${actionKey}`;
```

## Querying Attribution Data

### GA4 Data API

Query events with custom dimension:

```typescript
const [response] = await gaClient.runReport({
  property: `properties/339826228`,
  dateRanges: [{ startDate: '2025-10-01', endDate: '2025-10-22' }],
  dimensions: [
    { name: 'customEvent:hd_action_key' },
    { name: 'eventName' }
  ],
  metrics: [
    { name: 'eventCount' },
    { name: 'totalRevenue' }
  ]
});
```

### Attribution Analysis

Track action performance over time:

```typescript
// Get attribution data for specific action
const attributionData = await getActionAttribution({
  actionKey: 'seo-fix-powder-board-2025-10-22',
  startDate: '2025-10-22',
  endDate: '2025-11-05',
  windows: [7, 14, 28] // 7, 14, 28-day attribution windows
});
```

## ROI Measurement

### Attribution Windows

- **7-day**: Immediate impact
- **14-day**: Short-term attribution
- **28-day**: Full attribution window

### Metrics Tracked

- **Revenue**: Total attributed revenue
- **Conversions**: Number of attributed conversions
- **ROI**: Return on investment calculation
- **CTR**: Click-through rate from action
- **Conversion Rate**: Attributed conversion rate

## Troubleshooting

### Common Issues

1. **Dimension not appearing**: Check GA4 Admin > Custom Definitions
2. **Events not tracked**: Verify gtag is loaded and action key is set
3. **Data not queryable**: Allow 24-48 hours for data to be available

### Debug Mode

Enable debug logging:

```typescript
// Client-side debug
if (process.env.NODE_ENV === 'development') {
  console.log('[GA4] Action key set:', actionKey);
  console.log('[GA4] Event tracked:', eventName, params);
}
```

### Validation

Use the validation script:

```bash
npx tsx scripts/analytics/validate-ga4-setup.ts
```

## Related Documentation

- [GA4 Custom Dimensions API](https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema#custom-dimensions)
- [Growth Engine Architecture](../operating-model.md)
- [Action Attribution Dashboard](../analytics/action-attribution-dashboard.md)

## Files

- `app/services/ga/customDimensions.ts` - Custom dimension management
- `app/utils/analytics.ts` - Client-side tracking
- `scripts/analytics/setup-ga4-custom-dimensions.ts` - Setup script
- `scripts/analytics/validate-ga4-setup.ts` - Validation script
