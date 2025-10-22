# Telemetry Implementation Guide

## GA4 Event Tracking for HotDash

**Version**: 1.0  
**Date**: 2025-10-21  
**Audience**: Integrations Team + DevOps  
**GA4 Property**: 339826228

---

## Table of Contents

1. [Overview](#overview)
2. [GA4 Property Setup](#ga4-property-setup)
3. [Custom Dimensions](#custom-dimensions)
4. [Event Tracking Best Practices](#event-tracking-best-practices)
5. [Implementation Examples](#implementation-examples)
6. [Testing & Validation](#testing--validation)
7. [Troubleshooting](#troubleshooting)

---

## Overview

This guide documents the telemetry implementation for HotDash's Growth Engine, focusing on:

- **Action Attribution**: Track actions → revenue (ANALYTICS-017)
- **User Journey**: Understand user behavior patterns
- **Performance Monitoring**: Measure feature adoption and engagement

**Key Components**:

- GA4 Property: 339826228
- Custom Dimension: `hd_action_key` (event scope)
- Event tracking via gtag.js
- Server-side validation via GA4 Data API

---

## GA4 Property Setup

### Property Configuration

**Property ID**: `339826228`  
**Data Stream**: Web (HotDash Production)  
**Measurement ID**: `G-XXXXXXXXXX` (retrieve from GA4 admin)

### Access Configuration

1. **Service Account**: Required for Data API access
   - Email: `hotdash-analytics@PROJECT_ID.iam.gserviceaccount.com`
   - Roles: Viewer (minimum), Analyst (recommended)
   - Key File: `GOOGLE_APPLICATION_CREDENTIALS` environment variable

2. **Property Permissions**:
   - Service Account: Editor (for custom dimension creation)
   - Development Team: Editor
   - Analytics Team: Analyst

### Data Retention

- **Event Data**: 14 months (GA4 maximum)
- **User Data**: 14 months
- **Reset on New Activity**: Enabled

---

## Custom Dimensions

### hd_action_key (Event Scope)

**Purpose**: Track Growth Engine actions to measure ROI

**Configuration**:

```
Dimension Name: hd_action_key
Scope: Event
Description: Growth Engine action key for attribution tracking
Event Parameter: hd_action_key
```

**DevOps Setup** (via GA4 Admin):

1. Navigate to Admin → Data Display → Custom Definitions
2. Click "Create custom dimension"
3. Fill form:
   - Dimension name: `hd_action_key`
   - Scope: `Event`
   - Description: `Growth Engine action key for attribution tracking`
   - Event parameter: `hd_action_key`
4. Save

**Verification**:

```bash
# Query GA4 Metadata API to verify dimension exists
curl -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  "https://analyticsdata.googleapis.com/v1beta/properties/339826228/metadata"

# Look for: "apiName": "customEvent:hd_action_key"
```

### Planned Custom Dimensions (Future)

| Dimension          | Scope | Purpose                                 |
| ------------------ | ----- | --------------------------------------- |
| `hd_user_segment`  | User  | User segmentation (free/pro/enterprise) |
| `hd_feature_flag`  | Event | A/B test variant tracking               |
| `hd_shop_domain`   | User  | Multi-tenant identification             |
| `hd_experiment_id` | Event | Experiment tracking                     |

---

## Event Tracking Best Practices

### General Guidelines

1. **Event Naming**:
   - Use lowercase with underscores: `action_approved`, `feature_viewed`
   - Max length: 40 characters
   - Avoid generic names: ❌ `click`, ✅ `cta_dashboard_clicked`

2. **Parameter Naming**:
   - Use lowercase with underscores
   - Max length: 40 characters
   - Max 25 parameters per event
   - Avoid reserved names: `page_location`, `page_referrer`, `page_title`

3. **Value Constraints**:
   - String values: Max 100 characters
   - Numeric values: Use appropriate types (integer/float)
   - Currency: Use `value` and `currency` parameters (ISO 4217 codes)

### Event Categories

#### 1. **Conversion Events** (High Priority)

Track revenue-generating actions:

```javascript
gtag("event", "purchase", {
  transaction_id: "T_12345",
  value: 99.99,
  currency: "USD",
  items: [
    {
      item_id: "SKU_001",
      item_name: "HotDash Pro",
      price: 99.99,
      quantity: 1,
    },
  ],
  hd_action_key: "campaign_seo_optimization_123", // Attribution key
});
```

#### 2. **Action Attribution Events** (Critical)

Track Growth Engine actions:

```javascript
gtag("event", "action_approved", {
  hd_action_key: "action_seo_audit_456",
  action_type: "seo_audit",
  expected_revenue: 5000,
  priority: "P1",
});

gtag("event", "action_completed", {
  hd_action_key: "action_seo_audit_456",
  completion_time_minutes: 45,
});
```

#### 3. **Feature Engagement** (Medium Priority)

Track feature usage:

```javascript
gtag("event", "feature_viewed", {
  feature_name: "analytics_dashboard",
  section: "seo_metrics",
  view_duration_seconds: 120,
});

gtag("event", "feature_interaction", {
  feature_name: "action_queue",
  interaction_type: "filter_applied",
  filter_value: "high_priority",
});
```

#### 4. **User Journey** (Low Priority)

Track navigation patterns:

```javascript
gtag("event", "page_view", {
  page_title: "Dashboard",
  page_path: "/dashboard",
  user_segment: "pro",
});
```

### Event Architecture

```
Event: action_approved
├── Required Parameters:
│   ├── hd_action_key (string): Unique action identifier
│   ├── action_type (string): Type of action (seo_audit, ad_campaign, etc.)
│   └── expected_revenue (number): Estimated revenue impact
├── Optional Parameters:
│   ├── priority (string): P0/P1/P2/P3
│   ├── category (string): Action category
│   └── tags (array): Action tags
└── Automatic Parameters (GA4):
    ├── user_id: Authenticated user ID
    ├── session_id: Session identifier
    └── timestamp: Event timestamp
```

---

## Implementation Examples

### Client-Side Tracking (React Router 7)

#### Installation

```bash
npm install @types/gtag.js
```

#### Global Setup (`app/root.tsx`)

```typescript
import { Scripts } from "react-router";

export default function App() {
  return (
    <html>
      <head>
        {/* GA4 gtag.js */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX', {
              send_page_view: false // Manual page view tracking
            });
          `
        }} />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}
```

#### Helper Function (`app/utils/analytics.ts`)

```typescript
/**
 * Track GA4 event with type safety
 */
export function trackEvent(
  eventName: string,
  parameters: Record<string, any> = {},
) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, parameters);

    // Development logging
    if (process.env.NODE_ENV === "development") {
      console.log("[Analytics]", eventName, parameters);
    }
  }
}

/**
 * Track action attribution event
 */
export function trackActionEvent(
  actionKey: string,
  eventType: "approved" | "started" | "completed" | "failed",
  additionalParams: Record<string, any> = {},
) {
  trackEvent(`action_${eventType}`, {
    hd_action_key: actionKey,
    ...additionalParams,
  });
}

/**
 * Track purchase with action attribution
 */
export function trackPurchase(
  transactionId: string,
  value: number,
  items: any[],
  actionKey?: string,
) {
  trackEvent("purchase", {
    transaction_id: transactionId,
    value,
    currency: "USD",
    items,
    ...(actionKey ? { hd_action_key: actionKey } : {}),
  });
}
```

#### Component Usage

```typescript
import { trackActionEvent, trackEvent } from '~/utils/analytics';

export function ActionApprovalButton({ action }: { action: Action }) {
  const handleApprove = async () => {
    // Track action approval
    trackActionEvent(action.actionKey, 'approved', {
      action_type: action.type,
      expected_revenue: action.expectedRevenue,
      priority: action.priority
    });

    // API call to approve action
    await approveAction(action.id);
  };

  return <button onClick={handleApprove}>Approve</button>;
}
```

#### Page View Tracking (Route Layout)

```typescript
import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { trackEvent } from '~/utils/analytics';

export default function DashboardLayout() {
  const location = useLocation();

  useEffect(() => {
    trackEvent('page_view', {
      page_path: location.pathname,
      page_title: document.title
    });
  }, [location]);

  return <Outlet />;
}
```

### Server-Side Tracking (Node.js)

#### Measurement Protocol v2 (GA4)

```typescript
import fetch from "node-fetch";

const GA4_MEASUREMENT_ID = "G-XXXXXXXXXX";
const GA4_API_SECRET = process.env.GA4_API_SECRET; // From GA4 Admin

/**
 * Send server-side event to GA4
 */
export async function trackServerEvent(
  clientId: string,
  eventName: string,
  params: Record<string, any>,
) {
  const url = `https://www.google-analytics.com/mp/collect?measurement_id=${GA4_MEASUREMENT_ID}&api_secret=${GA4_API_SECRET}`;

  const payload = {
    client_id: clientId,
    events: [
      {
        name: eventName,
        params,
      },
    ],
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    console.error("[GA4] Server event failed:", await response.text());
  }

  return response.ok;
}

// Usage: Track cron job completion
await trackServerEvent("server_cron", "cron_job_completed", {
  job_name: "action_attribution_update",
  duration_ms: 45000,
  actions_updated: 25,
  success: true,
});
```

---

## Testing & Validation

### Development Testing

#### 1. Debug Mode (Browser Console)

```javascript
// Enable GA4 debug mode
gtag("config", "G-XXXXXXXXXX", { debug_mode: true });

// Verify events in browser console
// Events will show detailed logs with validation errors
```

#### 2. GA4 DebugView

1. Navigate to GA4 Admin → DebugView
2. Enable debug mode in browser (Chrome extension: "GA Debugger")
3. Trigger events in your app
4. View real-time events in DebugView with parameter validation

#### 3. Local Validation Script

```typescript
// scripts/validate-ga4-events.ts
import { BetaAnalyticsDataClient } from "@google-analytics/data";

const client = new BetaAnalyticsDataClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

async function validateCustomDimension() {
  try {
    const [metadata] = await client.getMetadata({
      name: "properties/339826228/metadata",
    });

    const hdActionKey = metadata.dimensions?.find(
      (d) => d.apiName === "customEvent:hd_action_key",
    );

    if (hdActionKey) {
      console.log("✅ Custom dimension hd_action_key exists");
      console.log("   API Name:", hdActionKey.apiName);
      console.log("   UI Name:", hdActionKey.uiName);
    } else {
      console.error("❌ Custom dimension hd_action_key NOT FOUND");
      console.error("   DevOps: Create dimension in GA4 Admin");
    }
  } catch (error) {
    console.error("❌ Validation failed:", error.message);
  }
}

validateCustomDimension();
```

### Production Validation

#### 1. Real-time Reports (GA4)

Navigate to Reports → Realtime to see live events:

- Active users
- Events per minute
- Top events by count

#### 2. Query Recent Events (GA4 Data API)

```typescript
import { BetaAnalyticsDataClient } from '@google-analytics/data';

const client = new BetaAnalyticsDataClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

async function queryRecentActionEvents() {
  const [response] = await client.runReport({
    property: 'properties/339826228',
    dateRanges: [{ startDate: 'today', endDate: 'today' }],
    dimensions: [
      { name: 'eventName' },
      { name: 'customEvent:hd_action_key' }
    ],
    metrics: [{ name: 'eventCount' }],
    dimensionFilter: {
      filter: {
        fieldName: 'eventName',
        stringFilter: {
          value: 'action_',
          matchType: 'BEGINS_WITH'
        }
      }
    }
  });

  console.log('Today's action events:');
  response.rows?.forEach(row => {
    console.log(
      `  ${row.dimensionValues[0].value} (${row.dimensionValues[1].value}): ${row.metricValues[0].value} events`
    );
  });
}

queryRecentActionEvents();
```

#### 3. Attribution Verification

Run ANALYTICS-017 attribution service to verify GA4 query:

```bash
# Test single action attribution
curl http://localhost:3000/api/actions/ACTION_ID/attribution

# Expected response:
{
  "success": true,
  "attribution": {
    "roi7d": { "revenue": 1250.00, "sessions": 300, ... },
    "roi14d": { "revenue": 2800.50, "sessions": 650, ... },
    "roi28d": { "revenue": 5200.75, "sessions": 1200, ... }
  }
}
```

---

## Troubleshooting

### Common Issues

#### 1. Events Not Appearing in GA4

**Symptoms**: Events sent but not visible in GA4 reports

**Causes**:

- GA4 data processing delay (up to 24 hours for standard reports)
- Debug mode not enabled (events sent but not visible in DebugView)
- Property ID mismatch

**Solutions**:

```javascript
// Verify property ID is correct
gtag("config", "G-XXXXXXXXXX"); // Must match GA4 Property

// Check browser console for errors
// Enable debug mode for real-time validation
gtag("config", "G-XXXXXXXXXX", { debug_mode: true });

// Use GA4 DebugView (Admin → DebugView) for real-time events
```

#### 2. Custom Dimension Shows "(not set)"

**Symptoms**: `hd_action_key` appears as "(not set)" in GA4 reports

**Causes**:

- Custom dimension not created in GA4 Admin
- Event parameter name mismatch (`hd_action_key` vs `hdActionKey`)
- Dimension not yet populated (24-48 hour delay)

**Solutions**:

```bash
# 1. Verify dimension exists
curl -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  "https://analyticsdata.googleapis.com/v1beta/properties/339826228/metadata" \
  | grep "hd_action_key"

# 2. Verify event parameter matches dimension event parameter
# Event: gtag('event', 'action_approved', { hd_action_key: 'X' })
# Dimension: Event parameter = "hd_action_key" (must match exactly)

# 3. Wait 24-48 hours for dimension to populate
```

#### 3. Attribution Query Returns No Data

**Symptoms**: `getActionAttribution()` returns zero metrics

**Causes**:

- No events with `hd_action_key` sent yet
- Action key mismatch (query key ≠ event key)
- Date range too narrow

**Solutions**:

```typescript
// Debug query with broader date range
const result = await getActionAttribution("action_key", 28);

// Check if events exist in GA4
const [response] = await analyticsDataClient.runReport({
  property: "properties/339826228",
  dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
  dimensions: [{ name: "customEvent:hd_action_key" }],
  metrics: [{ name: "eventCount" }],
});

// Verify action keys in database match GA4 events
console.log(
  "Expected action keys:",
  response.rows?.map((r) => r.dimensionValues[0].value),
);
```

#### 4. Service Account Permission Errors

**Symptoms**: `403 Forbidden` or `Permission denied` from GA4 Data API

**Causes**:

- Service account not added to GA4 property
- Insufficient permissions (need Viewer minimum)

**Solutions**:

```bash
# 1. Add service account to GA4 property
# GA4 Admin → Property Access Management → Add Users
# Email: hotdash-analytics@PROJECT_ID.iam.gserviceaccount.com
# Role: Viewer (minimum), Analyst (recommended)

# 2. Verify service account credentials
gcloud auth activate-service-account --key-file=$GOOGLE_APPLICATION_CREDENTIALS
gcloud projects get-iam-policy PROJECT_ID

# 3. Test API access
curl -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  "https://analyticsdata.googleapis.com/v1beta/properties/339826228/metadata"
```

---

## Best Practices Summary

### ✅ DO

1. **Use consistent naming**: `snake_case` for events and parameters
2. **Track revenue events**: Always include `value` and `currency`
3. **Include action keys**: Add `hd_action_key` to all attribution events
4. **Test in DebugView**: Validate events before production deployment
5. **Handle errors gracefully**: Don't block UX if tracking fails
6. **Log to console (dev)**: Enable debug logging in development

### ❌ DON'T

1. **Block user experience**: Tracking should never delay UI interactions
2. **Send PII**: Avoid sending email, phone, address to GA4
3. **Use reserved names**: Avoid GA4 reserved parameter names
4. **Exceed limits**: Max 25 parameters per event, 100 chars per string
5. **Hardcode secrets**: Use environment variables for API keys
6. **Forget error handling**: Always wrap GA4 calls in try-catch

---

## Additional Resources

- [GA4 Measurement Protocol Documentation](https://developers.google.com/analytics/devguides/collection/protocol/ga4)
- [GA4 Data API Documentation](https://developers.google.com/analytics/devguides/reporting/data/v1)
- [Custom Dimensions Guide](https://support.google.com/analytics/answer/10075209)
- [DebugView Documentation](https://support.google.com/analytics/answer/7201382)

---

## Support

**Questions?** Contact:

- Analytics Team: analytics@hotdash.io
- DevOps Team: devops@hotdash.io

**Code Issues**: See `app/services/analytics/action-attribution.ts` for implementation reference

---

**Last Updated**: 2025-10-21  
**Version**: 1.0  
**Status**: Production-Ready ✅
