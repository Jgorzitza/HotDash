# Alert Severity Thresholds

**Version:** 1.0  
**Date:** 2025-10-16  
**Status:** Active  
**Owner:** Inventory Agent  

## Overview

This document defines the severity thresholds and SLA requirements for inventory alerts.

## Severity Levels

### Critical

**Criteria:**
- Product is out of stock (`currentQuantity = 0`)
- OR days until stockout ≤ 3 days

**Response Time:** Immediate (< 15 minutes)

**Actions:**
- Send immediate notification
- Escalate to manager
- Trigger emergency reorder workflow
- Consider expedited shipping

**Example Message:**
> "SKU-001 is OUT OF STOCK. Reorder immediately."

### High

**Criteria:**
- Days until stockout ≤ 7 days
- OR current quantity ≤ ROP × 0.5 (urgent reorder bucket)

**Response Time:** Same day (< 4 hours)

**Actions:**
- Send priority notification
- Place reorder within 24 hours
- Review lead time and expedite if needed

**Example Message:**
> "SKU-002 is critically low (5 units, 0.7 weeks). Urgent reorder needed."

### Medium

**Criteria:**
- Days until stockout ≤ 14 days
- OR current quantity ≤ ROP (low stock bucket)

**Response Time:** Within 2 business days

**Actions:**
- Send standard notification
- Plan reorder within next few days
- Review forecast and adjust if needed

**Example Message:**
> "SKU-003 is below reorder point (15 units, ROP: 25). Plan reorder soon."

### Low

**Criteria:**
- Current quantity > ROP
- No immediate action needed

**Response Time:** Informational only

**Actions:**
- Log for monitoring
- No immediate action required

## Threshold Configuration

### Default Thresholds

```typescript
const DEFAULT_THRESHOLDS = {
  stockout: {
    criticalDays: 3,
    highDays: 7,
    mediumDays: 14,
  },
  overstock: {
    highWeeks: 26,  // 6 months
    mediumWeeks: 13, // 3 months
  },
};
```

### Customizable Per Category

Thresholds can be adjusted per product category:

```typescript
const CATEGORY_THRESHOLDS = {
  'fast-moving': {
    stockout: {
      criticalDays: 2,
      highDays: 5,
      mediumDays: 10,
    },
  },
  'seasonal': {
    stockout: {
      criticalDays: 5,
      highDays: 10,
      mediumDays: 21,
    },
  },
};
```

## SLA Requirements

### Alert Generation

- **Latency:** < 200ms per product
- **Bulk Processing:** < 5 seconds for 100 products
- **Frequency:** Every 4 hours (or on-demand)

### Notification Delivery

- **Critical:** < 1 minute
- **High:** < 5 minutes
- **Medium:** < 15 minutes
- **Low:** Batch delivery (hourly)

### Alert Resolution

- **Critical:** Must be acknowledged within 15 minutes
- **High:** Must be acknowledged within 4 hours
- **Medium:** Must be acknowledged within 2 business days
- **Low:** No acknowledgment required

## Notification Channels

### Critical Alerts
- Email (immediate)
- SMS (if configured)
- Slack (if configured)
- Dashboard banner

### High Alerts
- Email (immediate)
- Dashboard notification
- Slack (if configured)

### Medium Alerts
- Email (batched hourly)
- Dashboard notification

### Low Alerts
- Dashboard only
- Daily digest email

## Alert Filtering

### WOS-Based Filtering

Filter alerts by weeks of stock threshold:

```typescript
filterAlertsByWOS(alerts, maxWeeks: 2)
// Returns only alerts with WOS ≤ 2 weeks
```

### Severity-Based Filtering

Filter alerts by minimum severity:

```typescript
filterAlertsBySeverity(alerts, minSeverity: 'high')
// Returns only high and critical alerts
```

## Alert Priority Sorting

Alerts are sorted by:
1. **Severity** (critical > high > medium > low)
2. **Weeks of Stock** (ascending, nulls first)

```typescript
const sortedAlerts = sortAlertsByPriority(alerts);
```

## Alert Deduplication

- **Window:** 4 hours
- **Logic:** Same SKU + same severity = deduplicate
- **Action:** Update existing alert timestamp

## Alert Auto-Resolution

Alerts are automatically resolved when:
- Product quantity increases above ROP
- Product is restocked
- Manual override applied

**Resolution Time:** Next alert generation cycle (4 hours)

## Monitoring & Metrics

### Alert Metrics

- Total alerts generated
- Alerts by severity
- Average time to acknowledgment
- Average time to resolution
- False positive rate

### Performance Metrics

- Alert generation latency
- Notification delivery time
- Alert accuracy (% correct)

### SLA Compliance

- % alerts acknowledged within SLA
- % alerts resolved within SLA
- SLA breach incidents

## Escalation Policy

### Critical Alert Escalation

1. **0 minutes:** Send to primary contact
2. **15 minutes:** Escalate to manager (if not acknowledged)
3. **30 minutes:** Escalate to director
4. **60 minutes:** Page on-call

### High Alert Escalation

1. **0 minutes:** Send to primary contact
2. **4 hours:** Escalate to manager (if not acknowledged)
3. **8 hours:** Escalate to director

## Testing

### Test Scenarios

1. **Critical alert generation** - Out of stock product
2. **High alert generation** - 5 days until stockout
3. **Medium alert generation** - Below ROP
4. **Alert filtering** - By severity and WOS
5. **Alert sorting** - Priority order
6. **Alert deduplication** - Same SKU within window
7. **Alert auto-resolution** - After restock

### Performance Tests

1. **Bulk alert generation** - 100 products < 5 seconds
2. **Alert latency** - < 200ms per product
3. **Notification delivery** - Critical < 1 minute

## Configuration

### Environment Variables

```bash
ALERT_CRITICAL_DAYS=3
ALERT_HIGH_DAYS=7
ALERT_MEDIUM_DAYS=14
ALERT_GENERATION_INTERVAL=4h
ALERT_NOTIFICATION_ENABLED=true
```

### Feature Flags

```typescript
{
  "inventory.alerts.enabled": true,
  "inventory.alerts.sms": false,
  "inventory.alerts.slack": true,
  "inventory.alerts.auto_resolve": true,
}
```

## Implementation

**Service:** `app/services/inventory/alerts.ts`

**Key Functions:**
- `generateStockAlert()` - Generate single alert
- `generateBulkAlerts()` - Generate multiple alerts
- `filterAlertsBySeverity()` - Filter by severity
- `filterAlertsByWOS()` - Filter by WOS
- `sortAlertsByPriority()` - Sort alerts
- `shouldNotify()` - Check if notification needed

## See Also

- `docs/specs/inventory_data_model.md` - Data structures
- `app/services/inventory/alerts.ts` - Implementation
- `app/services/inventory/risk-detection.ts` - Risk detection

