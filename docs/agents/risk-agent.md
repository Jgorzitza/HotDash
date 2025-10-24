# Risk Agent Implementation

**Task:** ENG-063  
**Status:** Implemented  
**Last Updated:** 2025-01-24

## Overview

The Risk Agent monitors for fraud, compliance issues, and operational risks through continuous monitoring and event-driven triggers. It generates action cards for immediate operator attention.

## Architecture

### Components

1. **Risk Agent** (`app/lib/growth-engine/specialist-agents.ts`)
   - OpenAI Agent SDK implementation
   - Continuous monitoring
   - Event-driven triggers
   - Action card generation

2. **Anomaly Detection** (`app/services/analytics/anomaly-detection.ts`)
   - Z-score analysis
   - Statistical significance detection
   - Threshold-based alerts

3. **Order Monitoring** (Shopify Admin API)
   - Order aging detection
   - Carrier delay tracking
   - Refund pattern analysis

## Order Aging Thresholds

### Threshold Configuration

```typescript
const ORDER_AGING_THRESHOLDS = {
  warning: 3,    // 3 days - yellow alert
  critical: 5,   // 5 days - red alert
  urgent: 7      // 7 days - immediate action
};
```

### Detection Logic

**Criteria:**
- Order status: `unfulfilled`
- Days since order created > threshold
- No fulfillment scheduled

**Example:**
```typescript
const agingOrders = orders.filter(order => {
  const daysSinceCreated = (Date.now() - new Date(order.created_at).getTime()) / (1000 * 60 * 60 * 24);
  return order.fulfillment_status === 'unfulfilled' && daysSinceCreated > 3;
});
```

### Action Card

```typescript
{
  type: 'order-aging-alert',
  target: `Order #${order.order_number}`,
  draft: `Order #${order.order_number} has been unfulfilled for ${daysAging} days. Customer: ${order.customer.name}. Total: $${order.total_price}`,
  evidence: [
    {
      source: 'shopify',
      mcpRequestId: 'shopify-order-query-001',
      query: 'orders.list',
      timestamp: new Date().toISOString(),
      data: { orderId: order.id, status: order.fulfillment_status }
    }
  ],
  expected_impact: order.total_price, // Revenue at risk
  confidence: 0.95,
  ease: 4, // Easy to resolve
  risk_tier: daysAging > 7 ? 'policy' : daysAging > 5 ? 'safety' : 'low',
  can_execute: true,
  rollback_plan: 'Contact customer with explanation and estimated fulfillment date',
  freshness_label: 'Real-time'
}
```

## Carrier Delays Detection

### Threshold Configuration

```typescript
const CARRIER_DELAY_THRESHOLDS = {
  standard: 5,   // 5 days for standard shipping
  express: 3,    // 3 days for express shipping
  overnight: 1   // 1 day for overnight shipping
};
```

### Detection Logic

**Criteria:**
- Order status: `fulfilled`
- Tracking status: `in_transit`
- Days since fulfillment > threshold for shipping method
- No delivery confirmation

**Example:**
```typescript
const delayedShipments = fulfillments.filter(fulfillment => {
  const daysSinceFulfillment = (Date.now() - new Date(fulfillment.created_at).getTime()) / (1000 * 60 * 60 * 24);
  const threshold = CARRIER_DELAY_THRESHOLDS[fulfillment.shipping_method] || 5;
  return fulfillment.tracking_status === 'in_transit' && daysSinceFulfillment > threshold;
});
```

### Action Card

```typescript
{
  type: 'carrier-delay-alert',
  target: `Tracking #${fulfillment.tracking_number}`,
  draft: `Shipment for Order #${order.order_number} is delayed. Expected delivery: ${expectedDate}, Current status: In transit for ${daysInTransit} days. Carrier: ${carrier}`,
  evidence: [
    {
      source: 'shopify',
      mcpRequestId: 'shopify-fulfillment-query-001',
      query: 'fulfillments.list',
      timestamp: new Date().toISOString(),
      data: { trackingNumber: fulfillment.tracking_number, status: fulfillment.tracking_status }
    }
  ],
  expected_impact: 0, // No direct revenue impact, but customer satisfaction risk
  confidence: 0.85,
  ease: 3, // Moderate - requires carrier contact
  risk_tier: 'safety',
  can_execute: true,
  rollback_plan: 'Proactively contact customer with tracking update and apology',
  freshness_label: 'Real-time'
}
```

## Refund Anomaly Thresholds

### Threshold Configuration

```typescript
const REFUND_ANOMALY_THRESHOLDS = {
  dailyRate: 0.05,      // 5% of daily orders
  weeklyRate: 0.03,     // 3% of weekly orders
  singleCustomer: 3,    // 3 refunds from same customer
  singleProduct: 5,     // 5 refunds for same product
  highValue: 500        // Refunds > $500
};
```

### Detection Logic

**Daily Refund Rate:**
```typescript
const dailyRefundRate = refundsToday / ordersToday;
if (dailyRefundRate > REFUND_ANOMALY_THRESHOLDS.dailyRate) {
  // Trigger anomaly alert
}
```

**Customer Pattern:**
```typescript
const customerRefunds = refunds.filter(r => r.customer_id === customerId);
if (customerRefunds.length >= REFUND_ANOMALY_THRESHOLDS.singleCustomer) {
  // Potential fraud pattern
}
```

**Product Pattern:**
```typescript
const productRefunds = refunds.filter(r => r.line_items.some(item => item.product_id === productId));
if (productRefunds.length >= REFUND_ANOMALY_THRESHOLDS.singleProduct) {
  // Product quality issue
}
```

### Action Card

```typescript
{
  type: 'refund-anomaly-alert',
  target: `Refund Pattern: ${anomalyType}`,
  draft: `Refund anomaly detected: ${description}. ${count} refunds in ${timeframe}. Pattern: ${pattern}`,
  evidence: [
    {
      source: 'shopify',
      mcpRequestId: 'shopify-refund-query-001',
      query: 'refunds.list',
      timestamp: new Date().toISOString(),
      data: { refundCount: count, pattern: pattern, affectedOrders: orderIds }
    }
  ],
  expected_impact: totalRefundAmount,
  confidence: 0.90,
  ease: 2, // Complex - requires investigation
  risk_tier: 'policy',
  can_execute: false, // Requires manual review
  rollback_plan: 'Review refund policy and customer communication. Investigate root cause.',
  freshness_label: 'Real-time'
}
```

## Action Cards with Rationale

### Standard Action Card Structure

```typescript
interface RiskActionCard {
  type: 'order-aging-alert' | 'carrier-delay-alert' | 'refund-anomaly-alert' | 'fraud-pattern-alert';
  target: string;
  draft: string;
  evidence: Evidence[];
  expected_impact: number;
  confidence: number;
  ease: number;
  risk_tier: 'low' | 'safety' | 'policy';
  can_execute: boolean;
  rollback_plan: string;
  freshness_label: string;
  rationale: string; // Why this is a risk
  mitigation: string; // How to mitigate
  escalation: string; // When to escalate
}
```

### Rationale Examples

**Order Aging:**
```
Rationale: Order has been unfulfilled for 5 days, exceeding our 3-day fulfillment SLA. Customer may request cancellation or refund, impacting revenue and satisfaction.
```

**Carrier Delay:**
```
Rationale: Shipment has been in transit for 7 days, exceeding the 5-day standard shipping window. Customer may file a claim or request refund.
```

**Refund Anomaly:**
```
Rationale: 8% of today's orders have been refunded, significantly above the 5% threshold. This may indicate product quality issues, fraud, or policy abuse.
```

## Operator Click-Through Interface

### Action Queue Display

**Columns:**
- Risk Type (icon + label)
- Target (order #, tracking #, customer)
- Description (brief summary)
- Impact ($)
- Confidence (%)
- Risk Tier (badge)
- Actions (View Details, Dismiss, Escalate)

**Example Row:**
```
🚨 Order Aging | Order #1234 | Unfulfilled for 5 days | $150 | 95% | SAFETY | [View] [Dismiss] [Escalate]
```

### Detail Modal

**Sections:**
1. **Risk Summary** - Type, target, description
2. **Evidence** - MCP request IDs, data sources, timestamps
3. **Impact Analysis** - Expected impact, confidence, risk tier
4. **Mitigation Plan** - Recommended actions, rollback plan
5. **Escalation Procedure** - When and how to escalate
6. **Actions** - Approve mitigation, Dismiss, Escalate, Add note

**Example:**
```typescript
<Modal title="Order Aging Alert: Order #1234">
  <Section title="Risk Summary">
    <Text>Order #1234 has been unfulfilled for 5 days</Text>
    <Badge tone="warning">SAFETY</Badge>
  </Section>
  
  <Section title="Evidence">
    <List>
      <Item>MCP Request: shopify-order-query-001</Item>
      <Item>Order Status: unfulfilled</Item>
      <Item>Created: 2025-01-19</Item>
      <Item>Customer: John Doe</Item>
    </List>
  </Section>
  
  <Section title="Mitigation Plan">
    <Text>Contact customer with explanation and estimated fulfillment date</Text>
  </Section>
  
  <Actions>
    <Button primary onClick={handleApprove}>Approve Mitigation</Button>
    <Button onClick={handleDismiss}>Dismiss</Button>
    <Button onClick={handleEscalate}>Escalate</Button>
  </Actions>
</Modal>
```

## Continuous + Event Triggers

### Continuous Monitoring

**Schedule:** Every 15 minutes

**Checks:**
- Order aging (all unfulfilled orders)
- Carrier delays (all in-transit shipments)
- Refund patterns (last 24 hours)
- Fraud indicators (ongoing)

**Implementation:**
```typescript
// Cron job or scheduled task
setInterval(async () => {
  const riskAgent = new RiskAgent();
  const actions = await riskAgent.runContinuousMonitoring();
  
  // Emit actions to Action Queue
  for (const action of actions) {
    await emitAction(action);
  }
}, 15 * 60 * 1000); // 15 minutes
```

### Event Triggers

**Events:**
- `order.created` - Check for fraud indicators
- `order.cancelled` - Analyze cancellation pattern
- `refund.created` - Check refund thresholds
- `fulfillment.updated` - Monitor carrier delays
- `customer.created` - Fraud risk assessment

**Implementation:**
```typescript
// Shopify webhook handler
app.post('/webhooks/orders/created', async (req, res) => {
  const order = req.body;
  
  const riskAgent = new RiskAgent();
  const actions = await riskAgent.assessOrderRisk(order);
  
  for (const action of actions) {
    await emitAction(action);
  }
  
  res.status(200).send('OK');
});
```

## MCP Evidence Logging

### Evidence Structure

```typescript
interface Evidence {
  source: 'shopify' | 'supabase' | 'chatwoot';
  mcpRequestId: string;
  query: string;
  timestamp: string;
  data: any;
}
```

### MCP Request ID Format

```
{source}-{operation}-{timestamp}
```

**Examples:**
- `shopify-order-query-20250124-001`
- `shopify-refund-list-20250124-002`
- `shopify-fulfillment-query-20250124-003`

### Logging Implementation

```typescript
const evidence: Evidence = {
  source: 'shopify',
  mcpRequestId: `shopify-order-query-${Date.now()}`,
  query: 'orders.list',
  timestamp: new Date().toISOString(),
  data: {
    orderId: order.id,
    status: order.fulfillment_status,
    createdAt: order.created_at,
    total: order.total_price
  }
};

// Log to decision_log
await logDecision({
  scope: 'risk-monitoring',
  actor: 'risk-agent',
  action: 'order_aging_detected',
  rationale: `Order #${order.order_number} aging detected`,
  evidenceUrl: `/api/shopify/orders/${order.id}`,
  payload: { evidence }
});
```

## Testing

### Unit Tests

**Location:** `tests/services/risk-agent.test.ts`

**Coverage:**
- Order aging detection
- Carrier delay detection
- Refund anomaly detection
- Threshold validation
- Action card generation

### Integration Tests

**Location:** `tests/integration/risk-monitoring.test.ts`

**Coverage:**
- Shopify API integration
- Action Queue emission
- Event trigger handling
- Continuous monitoring

## Monitoring

### Metrics to Track

- Alerts generated per day
- False positive rate
- Response time (alert to resolution)
- Escalation rate
- Revenue protected

### Alerts

- High refund rate (critical)
- Multiple fraud patterns detected (critical)
- Monitoring service down (critical)
- High false positive rate (warning)

## References

- Risk Agent: `app/lib/growth-engine/specialist-agents.ts`
- Anomaly Detection: `app/services/analytics/anomaly-detection.ts`
- Action Queue: `app/lib/growth-engine/action-queue.ts`
- Task: ENG-063 in TaskAssignment table

