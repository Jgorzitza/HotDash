# Hot Rod AN Dashboard API Contracts

**Version**: 1.0  
**Created**: 2025-10-12  
**Owner**: DATA Agent  
**Base URL**: `/api/v1/dashboard`

---

## 🎯 Tile 1: Sales Pulse

### GET /api/v1/dashboard/sales-pulse

**Description**: Real-time sales metrics for current day/week

**Response**:
```json
{
  "date": "2025-10-12",
  "total_revenue": 5234.50,
  "total_orders": 23,
  "avg_order_value": 227.59,
  "revenue_vs_last_week_pct": 12.5,
  "orders_vs_last_week_pct": 8.3,
  "fulfillment_rate_pct": 95.7,
  "top_5_skus": [
    {
      "sku": "CARB-HOLLEY-4150",
      "revenue_30d": 12450.00,
      "units_sold_30d": 15
    }
  ]
}
```

**Cache**: 5 minutes  
**Source**: `v_sales_pulse_current`

---

## 🎯 Tile 2: Inventory Heatmap

### GET /api/v1/dashboard/inventory-alerts

**Description**: Current inventory alerts (low stock, out of stock, overstock)

**Query Params**:
- `severity`: critical | high | medium | low (optional)
- `limit`: number (default: 50)

**Response**:
```json
{
  "alerts": [
    {
      "sku": "ENGINE-SBC-350",
      "product_name": "Small Block Chevy 350 Engine",
      "alert_type": "low_stock",
      "alert_severity": "high",
      "quantity_available": 3,
      "days_of_cover": 5,
      "reorder_point": 10,
      "units_sold_30d": 18
    }
  ],
  "summary": {
    "critical_alerts": 5,
    "high_alerts": 12,
    "total_alerts": 23
  }
}
```

**Cache**: 15 minutes  
**Source**: `v_inventory_alerts`

---

## 🎯 Tile 3: Fulfillment Health

### GET /api/v1/dashboard/fulfillment-issues

**Description**: Current fulfillment problems requiring attention

**Query Params**:
- `severity`: critical | high | medium | low (optional)
- `status`: unfulfilled | partial (optional)

**Response**:
```json
{
  "issues": [
    {
      "order_number": "HR-1234",
      "shopify_order_id": 567890123,
      "issue_type": "delayed_shipping",
      "issue_severity": "high",
      "days_to_fulfill": 5,
      "sla_threshold_days": 2,
      "customer_segment": "professional_shop",
      "is_priority_customer": true
    }
  ],
  "summary": {
    "total_issues": 8,
    "critical_issues": 2,
    "sla_breaches": 5,
    "avg_days_to_fulfill": 1.8
  }
}
```

**Cache**: 5 minutes  
**Source**: `v_fulfillment_issues`, `v_fulfillment_health_summary`

---

## 🎯 Tile 4: CX Escalations

### GET /api/v1/dashboard/cx-escalations

**Description**: Current customer support escalations with severity

**Query Params**:
- `priority`: urgent | high | medium | low (optional)
- `status`: open | pending (optional)

**Response**:
```json
{
  "escalations": [
    {
      "chatwoot_conversation_id": 12345,
      "shopify_order_id": 567890123,
      "priority": "urgent",
      "sentiment": "very_negative",
      "escalation_reason": "Product defect - safety concern",
      "first_response_time_minutes": 45,
      "is_sla_breach": true,
      "customer_segment": "enthusiast_collector",
      "escalated_at": "2025-10-12T10:30:00Z"
    }
  ],
  "summary": {
    "total_escalations": 6,
    "urgent_escalations": 2,
    "sla_breaches": 4,
    "avg_first_response_time": 38
  }
}
```

**Cache**: 5 minutes  
**Source**: `v_cx_escalations`, `v_cx_health_summary`

---

## 🎯 Tile 5: Ops Metrics

### GET /api/v1/dashboard/ops-metrics

**Description**: Combined operational metrics (activation rate, operator SLA)

**Response**:
```json
{
  "activation": {
    "activation_rate_7d_avg": 82.5,
    "shops_activated_7d": 165,
    "total_shops_7d": 200
  },
  "operator_sla": {
    "median_response_time": 42,
    "p90_response_time": 78,
    "p95_response_time": 95,
    "resolution_rate_pct": 88.5
  },
  "operators": {
    "total_operators": 5,
    "top_performers": 2,
    "avg_efficiency_score": 72.3
  }
}
```

**Cache**: 15 minutes  
**Source**: `v_ops_aggregate_metrics`, `v_activation_rate_7d`, `v_sla_resolution_7d`

---

## 📊 Analytics APIs

### GET /api/v1/analytics/growth-metrics

**Description**: Growth tracking toward $10MM goal

**Response**:
```json
{
  "current_mrr": 125000,
  "ytd_revenue": 980000,
  "progress_to_10mm_pct": 9.8,
  "trailing_3mo_avg": 110000,
  "next_milestone": "1MM",
  "milestone_progress_pct": 98.0
}
```

**Cache**: 1 hour  
**Source**: `v_growth_milestones`, `v_kpi_summary`

### GET /api/v1/analytics/operator-rankings

**Description**: Operator performance rankings

**Response**:
```json
{
  "rankings": [
    {
      "rank": 1,
      "operator_id": 42,
      "efficiency_score": 89.5,
      "resolution_rate_pct": 94.2,
      "avg_response_minutes": 28,
      "performance_tier": "TOP_PERFORMER"
    }
  ]
}
```

**Cache**: 15 minutes  
**Source**: `v_operator_rankings`

### GET /api/v1/analytics/data-quality

**Description**: Data quality health dashboard

**Response**:
```json
{
  "critical_issues": 0,
  "high_issues": 2,
  "medium_issues": 5,
  "low_issues": 8,
  "avg_completeness_pct": 97.5,
  "stale_tables": 0,
  "health_status": "PASSING"
}
```

**Cache**: 5 minutes  
**Source**: `v_data_quality_dashboard`

---

## 📤 Export APIs

### GET /api/v1/export/daily-performance

**Description**: Export 90 days of sales data

**Query Params**:
- `format`: json | csv (default: json)
- `days`: number (default: 90, max: 365)

**Response**: Array of daily sales records

**Cache**: None (always fresh)  
**Source**: `v_export_daily_performance`

### GET /api/v1/export/customer-segments

**Description**: Export full customer segment data

**Query Params**:
- `format`: json | csv (default: json)
- `segment`: Filter by segment (optional)

**Response**: Array of customer segment records

**Cache**: None  
**Source**: `v_export_customer_segments`

---

## 🔍 Audit APIs

### GET /api/v1/audit/decisions

**Description**: Recent decision audit trail

**Query Params**:
- `days`: number (default: 30, max: 180)
- `actor`: Filter by operator (optional)
- `scope`: Filter by scope (optional)

**Response**:
```json
{
  "decisions": [
    {
      "id": 123,
      "scope": "sales",
      "actor": "operator@hotrodan.com",
      "action": "approved",
      "rationale": "High-value customer, approve discount",
      "created_at": "2025-10-12T10:30:00Z"
    }
  ]
}
```

**Cache**: None (audit data must be real-time)  
**Source**: `v_recent_decisions`

---

## 🔒 Authentication & Authorization

**All endpoints require**:
- Bearer token authentication
- RLS policies enforced at database level
- Operators have read-only access via RLS
- Service role for admin operations

**Rate Limits**:
- Dashboard APIs: 60 requests/minute per user
- Export APIs: 10 requests/minute per user
- Audit APIs: 30 requests/minute per user

---

## ⚡ Performance SLAs

**Response Times**:
- Dashboard tiles: <200ms (with cache)
- Analytics: <500ms
- Export: <2 seconds (for 90 days)
- Audit: <300ms

**Availability**: 99.9% uptime

---

**End of API Contracts**
