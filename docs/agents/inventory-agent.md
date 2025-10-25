# Inventory Agent Implementation

**Task:** ENG-061  
**Status:** Implemented  
**Last Updated:** 2025-01-24

## Overview

The Inventory Agent monitors stock levels, calculates reorder points (ROP), identifies at-risk SKUs, and generates purchase order proposals with evidence and rollback plans.

## Architecture

### Components

1. **Inventory Agent** (`app/lib/growth-engine/specialist-agents.ts`)
   - OpenAI Agent SDK implementation
   - Hourly analysis scheduling
   - Webhook event triggers
   - Action card generation

2. **Growth Engine Inventory Agent** (`app/services/inventory/growth-engine-inventory-agent.ts`)
   - ROP calculation integration
   - Emergency sourcing analysis
   - Stock alert generation
   - MCP evidence logging

3. **ROP Engine** (`app/services/inventory/rop-engine.ts`)
   - Reorder point calculation
   - Safety stock calculation
   - Seasonal demand adjustments
   - Vendor recommendations

4. **Emergency Sourcing** (`app/services/inventory/emergency-sourcing.ts`)
   - Stockout risk assessment
   - Opportunity cost calculation
   - Local vendor analysis
   - Net benefit calculation

5. **PO Automation** (`app/services/inventory/po-automation.ts`)
   - Purchase order generation
   - HITL approval flagging
   - Vendor grouping
   - Cost calculation

## Stock-Risk Thresholds

### Threshold Formula

```
Stock Risk = (Velocity × Lead Time) - (On-Hand + Incoming POs)
```

### Risk Levels

```typescript
const STOCK_RISK_THRESHOLDS = {
  critical: -7,  // Stockout in < 7 days
  high: 0,       // At or below ROP
  medium: 7,     // Within 7 days of ROP
  low: 14        // Within 14 days of ROP
};
```

### Calculation Example

```typescript
const velocity = 2.5; // units/day
const leadTime = 14; // days
const onHand = 25; // units
const incomingPOs = 10; // units

const leadTimeDemand = velocity * leadTime; // 35 units
const safetyStock = velocity * Math.sqrt(leadTime) * 1.65; // 95% service level
const rop = leadTimeDemand + safetyStock; // ~41 units

const stockRisk = rop - (onHand + incomingPOs); // 41 - 35 = 6 units short
const daysUntilStockout = (onHand + incomingPOs) / velocity; // 14 days

// Risk level: MEDIUM (within 14 days of ROP)
```

## At-Risk SKUs List

### SKU Risk Assessment

**Criteria:**
- Current stock < ROP
- Days until stockout < 14
- No incoming POs or insufficient PO quantity
- Velocity > 0 (active product)

**Example Output:**
```typescript
[
  {
    sku: 'WIDGET-PRO-001',
    productName: 'Premium Widget Bundle',
    currentStock: 5,
    rop: 41,
    velocity: 2.5,
    daysUntilStockout: 2,
    riskLevel: 'critical',
    reasoning: 'Current stock (5) is 36 units below ROP (41). At current velocity (2.5/day), stockout in 2 days. No incoming POs.',
    recommendedAction: 'Emergency sourcing required',
    recommendedQuantity: 50
  },
  {
    sku: 'GADGET-STD-002',
    productName: 'Standard Gadget Set',
    currentStock: 12,
    rop: 28,
    velocity: 1.8,
    daysUntilStockout: 7,
    riskLevel: 'high',
    reasoning: 'Current stock (12) is 16 units below ROP (28). At current velocity (1.8/day), stockout in 7 days. PO for 20 units arriving in 10 days.',
    recommendedAction: 'Expedite existing PO or emergency sourcing',
    recommendedQuantity: 30
  }
]
```

### Reasoning Format

```
Current stock ({onHand}) is {gap} units {above|below} ROP ({rop}). 
At current velocity ({velocity}/day), {stockout|surplus} in {days} days. 
{PO status: incoming/none}.
```

## Slow-Mover and Back-in-Stock Playbooks

### Slow-Mover Playbook

**Detection Criteria:**
- Velocity < 0.5 units/day
- Stock > 30 days supply
- No sales in last 7 days

**Actions:**
1. **Reduce ROP** - Lower reorder point to match actual demand
2. **Discount/Promotion** - Clear excess inventory
3. **Bundle Opportunity** - Pair with fast-movers
4. **Discontinue** - If no sales in 90 days

**Example Action Card:**
```typescript
{
  type: 'slow_mover_optimization',
  target: 'SKU-SLOW-001',
  draft: 'Slow-mover detected: SKU-SLOW-001 has 45 days supply (velocity: 0.3/day). Recommend: 1) Reduce ROP from 20 to 10, 2) Run 15% discount promotion, 3) Consider bundling with fast-movers',
  evidence: [
    {
      source: 'shopify',
      mcpRequestId: 'shopify-inventory-slow-mover-001',
      query: 'inventory.list',
      timestamp: new Date().toISOString(),
      data: { sku: 'SKU-SLOW-001', velocity: 0.3, daysSupply: 45 }
    }
  ],
  expected_impact: 200, // Free up $200 in inventory
  confidence: 0.85,
  ease: 3,
  risk_tier: 'low',
  can_execute: false, // Requires approval
  rollback_plan: 'Restore original ROP if demand increases',
  freshness_label: 'Real-time'
}
```

### Back-in-Stock Playbook

**Detection Criteria:**
- Previously out of stock (stock = 0)
- Now back in stock (stock > 0)
- Had demand while out of stock (waitlist, abandoned carts)

**Actions:**
1. **Email Waitlist** - Notify customers who requested notification
2. **Re-enable Ads** - Resume paid advertising
3. **Update SEO** - Change from "Out of Stock" to "In Stock"
4. **Social Announcement** - Post on social media

**Example Action Card:**
```typescript
{
  type: 'back_in_stock_notification',
  target: 'SKU-POPULAR-001',
  draft: 'SKU-POPULAR-001 is back in stock (25 units). 47 customers on waitlist. Recommend: 1) Send back-in-stock emails, 2) Re-enable Google Shopping ads, 3) Post on Instagram/Facebook',
  evidence: [
    {
      source: 'shopify',
      mcpRequestId: 'shopify-inventory-back-in-stock-001',
      query: 'inventory.list',
      timestamp: new Date().toISOString(),
      data: { sku: 'SKU-POPULAR-001', previousStock: 0, currentStock: 25, waitlistCount: 47 }
    }
  ],
  expected_impact: 1200, // Expected revenue from waitlist
  confidence: 0.90,
  ease: 4,
  risk_tier: 'low',
  can_execute: true,
  rollback_plan: 'N/A - notification only',
  freshness_label: 'Real-time'
}
```

## Action Drafts with Rollback Plans

### Reorder Action

**Draft:**
```
Reorder {productName}: Current stock {currentStock}, ROP {rop}, Recommended qty: {recommendedQty}. 
Vendor: {vendorName}, Lead time: {leadTime} days, Cost: ${totalCost}.
```

**Rollback Plan:**
```
Cancel PO if demand changes significantly. Monitor velocity for 48 hours before confirming order.
```

### Emergency Sourcing Action

**Draft:**
```
Emergency sourcing for {productName}: Stockout risk {risk}%, Opportunity cost ${opportunityCost}. 
Local vendor available: {vendorName}, Premium: ${premium}, Net benefit: ${netBenefit}.
```

**Rollback Plan:**
```
Use standard vendor if emergency vendor fails. Accept stockout if net benefit becomes negative.
```

### Slow-Mover Action

**Draft:**
```
Slow-mover optimization for {productName}: {daysSupply} days supply, Velocity: {velocity}/day. 
Recommend: Reduce ROP, Run promotion, Consider bundling.
```

**Rollback Plan:**
```
Restore original ROP if demand increases. End promotion if margin becomes negative.
```

## Evidence Attached to All Proposals

### Evidence Structure

```typescript
interface InventoryEvidence {
  source: 'shopify' | 'supabase';
  mcpRequestId: string;
  query: string;
  timestamp: string;
  data: {
    sku: string;
    currentStock: number;
    velocity: number;
    rop: number;
    incomingPOs?: number;
    daysUntilStockout?: number;
  };
}
```

### MCP Request ID Format

```
shopify-inventory-{operation}-{timestamp}
```

**Examples:**
- `shopify-inventory-rop-20250124-001`
- `shopify-inventory-emergency-20250124-002`
- `shopify-inventory-slow-mover-20250124-003`

### Evidence Logging

```typescript
const evidence: InventoryEvidence = {
  source: 'shopify',
  mcpRequestId: `shopify-inventory-rop-${Date.now()}`,
  query: 'inventory.list',
  timestamp: new Date().toISOString(),
  data: {
    sku: product.sku,
    currentStock: product.currentStock,
    velocity: product.velocity,
    rop: ropResult.reorderPoint,
    daysUntilStockout: product.currentStock / product.velocity
  }
};

await logDecision({
  scope: 'inventory-monitoring',
  actor: 'inventory-agent',
  action: 'rop_threshold_exceeded',
  rationale: `SKU ${product.sku} below ROP`,
  evidenceUrl: `/api/shopify/inventory/${product.id}`,
  payload: { evidence }
});
```

## Hourly + Webhook Triggers

### Hourly Analysis

**Schedule:** Every hour (0 minutes past the hour)

**Checks:**
- ROP threshold violations
- Stock-risk calculations
- Slow-mover detection
- Back-in-stock opportunities

**Implementation:**
```typescript
// Cron job or scheduled task
cron.schedule('0 * * * *', async () => {
  const inventoryAgent = new InventoryAgent();
  const actions = await inventoryAgent.runHourlyAnalysis();
  
  for (const action of actions) {
    await emitAction(action);
  }
});
```

### Webhook Triggers

**Events:**
- `inventory_levels/update` - Stock level changed
- `orders/create` - New order placed (affects velocity)
- `orders/cancelled` - Order cancelled (affects velocity)
- `products/create` - New product added
- `products/update` - Product details changed

**Implementation:**
```typescript
// Shopify webhook handler
app.post('/webhooks/inventory/update', async (req, res) => {
  const inventoryLevel = req.body;
  
  const inventoryAgent = new InventoryAgent();
  const actions = await inventoryAgent.assessInventoryChange(inventoryLevel);
  
  for (const action of actions) {
    await emitAction(action);
  }
  
  res.status(200).send('OK');
});
```

## MCP Evidence Logging

### Logging All Inventory Operations

```typescript
// Log ROP calculation
await framework.logMCPUsage(
  'shopify-dev',
  'https://shopify.dev/docs/api/admin',
  'rop-analysis',
  'Calculate ROP for products requiring reorder'
);

// Log emergency sourcing analysis
await framework.logMCPUsage(
  'shopify-dev',
  'https://shopify.dev/docs/api/admin',
  'emergency-sourcing',
  'Analyze emergency sourcing opportunities'
);

// Log stock alert generation
await framework.logMCPUsage(
  'shopify-dev',
  'https://shopify.dev/docs/api/admin',
  'stock-alerts',
  'Generate stock alerts for at-risk SKUs'
);
```

### Evidence in Action Cards

Every action card includes:
- `mcp_request_ids` - Array of MCP request IDs
- `dataset_links` - Links to data sources (e.g., `shopify://inventory-levels`)
- `telemetry_refs` - Telemetry references (e.g., `rop-{productId}`)

## Testing

### Unit Tests

**Location:** `tests/services/inventory-agent.test.ts`

**Coverage:**
- ROP calculation
- Stock-risk assessment
- Slow-mover detection
- Back-in-stock detection
- Action card generation

### Integration Tests

**Location:** `tests/integration/inventory-monitoring.test.ts`

**Coverage:**
- Shopify API integration
- Action Queue emission
- Webhook handling
- Hourly analysis

## Monitoring

### Metrics to Track

- SKUs at risk
- Reorder proposals generated
- Emergency sourcing recommendations
- Slow-movers identified
- Back-in-stock notifications sent
- Stockout prevention rate

### Alerts

- Critical stockout risk (< 3 days)
- High-value SKU at risk (> $1000)
- Emergency sourcing net benefit > $500
- Slow-mover inventory > $5000

## References

- Inventory Agent: `app/lib/growth-engine/specialist-agents.ts`
- Growth Engine Inventory Agent: `app/services/inventory/growth-engine-inventory-agent.ts`
- ROP Engine: `app/services/inventory/rop-engine.ts`
- Emergency Sourcing: `app/services/inventory/emergency-sourcing.ts`
- PO Automation: `app/services/inventory/po-automation.ts`
- Task: ENG-061 in TaskAssignment table

