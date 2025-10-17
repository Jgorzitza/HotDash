---
epoch: 2025.10.E1
doc: docs/design/tile-specific-ui-refinement.md
owner: designer
created: 2025-10-12
task: 1J
---

# Task 1J: Tile-Specific UI Refinement

## Purpose

Design detailed states and data visualizations for each of the 5 dashboard tiles with Hot Rod-themed iconography.

## Overview of 5 Tiles

1. **CX Escalations** - Customer support issues needing attention
2. **Sales Pulse** - Real-time sales performance
3. **Inventory Alerts** - Stock levels and reorder points
4. **SEO Performance** - Search rankings and traffic
5. **Fulfillment Status** - Orders and shipping

## 1. CX Escalations Tile

### States

**Healthy State** (0 escalations):

```typescript
<TileCard
  title="CX Escalations"
  status="healthy"
  metadata="All clear"
  icon={CheckCircleIcon}
>
  <BlockStack gap="200">
    <Text variant="heading2xl" as="p">0</Text>
    <Text variant="bodyMd" tone="subdued">No issues requiring attention</Text>
    <Text variant="bodySm" tone="success">✓ 24h average: 2.3 min response time</Text>
  </BlockStack>
</TileCard>
```

**Alert State** (3+ escalations):

```typescript
<TileCard
  title="CX Escalations"
  status="error"
  metadata="3 urgent"
  icon={AlertTriangleIcon}
>
  <BlockStack gap="200">
    <Text variant="heading2xl" as="p" tone="critical">3</Text>
    <Text variant="bodyMd">Issues need your attention</Text>

    {/* Mini list */}
    <Box paddingBlockStart="200">
      <List type="bullet">
        <List.Item>2 payment disputes</List.Item>
        <List.Item>1 shipping complaint</List.Item>
      </List>
    </Box>

    <Button onClick={viewDetails}>View all</Button>
  </BlockStack>
</TileCard>
```

**Data Visualization**: Simple count + mini list of categories

**Hot Rod Icon**: 🔥 Fire icon for "hot" issues

---

## 2. Sales Pulse Tile

### States

**Healthy State** (on track):

```typescript
<TileCard
  title="Sales Pulse"
  status="healthy"
  metadata="On track"
  icon={TrendingUpIcon}
>
  <BlockStack gap="200">
    <InlineStack align="space-between" blockAlign="center">
      <Text variant="heading2xl" as="p">$12,450</Text>
      <Badge tone="success">+12%</Badge>
    </InlineStack>

    <Text variant="bodyMd" tone="subdued">Today's revenue</Text>

    {/* Sparkline chart */}
    <div style={{ height: '40px' }}>
      <Sparkline
        data={[10000, 10500, 11200, 11800, 12450]}
        color="success"
      />
    </div>

    <Text variant="bodySm" tone="success">
      ↗ Trending up vs yesterday
    </Text>
  </BlockStack>
</TileCard>
```

**Alert State** (below target):

```typescript
<TileCard
  title="Sales Pulse"
  status="warning"
  metadata="Below target"
  icon={TrendingDownIcon}
>
  <BlockStack gap="200">
    <InlineStack align="space-between" blockAlign="center">
      <Text variant="heading2xl" as="p" tone="warning">$8,200</Text>
      <Badge tone="critical">-15%</Badge>
    </InlineStack>

    <Text variant="bodyMd">30% behind daily target</Text>

    <ProgressBar progress={70} tone="warning" />

    <Text variant="bodySm" tone="subdued">
      Target: $11,700 • 3h 15m remaining
    </Text>
  </BlockStack>
</TileCard>
```

**Data Visualization**:

- Revenue number + percentage change
- Sparkline (7-day trend)
- Progress bar (toward daily goal)

**Hot Rod Icon**: ⚡ Lightning bolt for "pulse" / speed

---

## 3. Inventory Alerts Tile

### States

**Healthy State** (all stocked):

```typescript
<TileCard
  title="Inventory"
  status="healthy"
  metadata="All stocked"
  icon={CheckCircleIcon}
>
  <BlockStack gap="200">
    <Text variant="heading2xl" as="p">0</Text>
    <Text variant="bodyMd" tone="subdued">Items need reordering</Text>

    <InlineStack gap="400">
      <div>
        <Text variant="headingMd" as="p">127</Text>
        <Text variant="bodySm" tone="subdued">In stock</Text>
      </div>
      <div>
        <Text variant="headingMd" as="p">12</Text>
        <Text variant="bodySm" tone="subdued">Low stock</Text>
      </div>
    </InlineStack>
  </BlockStack>
</TileCard>
```

**Alert State** (low stock):

```typescript
<TileCard
  title="Inventory"
  status="warning"
  metadata="5 items low"
  icon={AlertTriangleIcon}
>
  <BlockStack gap="200">
    <Text variant="heading2xl" as="p" tone="warning">5</Text>
    <Text variant="bodyMd">Items need reordering</Text>

    {/* Top low-stock items */}
    <Box paddingBlockStart="200">
      <List type="bullet">
        <List.Item>Widget A - 2 left</List.Item>
        <List.Item>Gadget B - 3 left</List.Item>
        <List.Item>Part C - 1 left</List.Item>
      </List>
    </Box>

    <Button onClick={viewInventory}>View inventory</Button>
  </BlockStack>
</TileCard>
```

**Data Visualization**:

- Count of low-stock items
- Mini breakdown (in stock vs low stock)
- List of top 3 items needing reorder

**Hot Rod Icon**: ⚙️ Gear for "parts" / inventory

---

## 4. SEO Performance Tile

### States

**Healthy State** (rankings improving):

```typescript
<TileCard
  title="SEO Performance"
  status="healthy"
  metadata="Rankings up"
  icon={TrendingUpIcon}
>
  <BlockStack gap="200">
    <InlineStack align="space-between" blockAlign="center">
      <Text variant="heading2xl" as="p">2,450</Text>
      <Badge tone="success">+8%</Badge>
    </InlineStack>

    <Text variant="bodyMd" tone="subdued">Organic visits today</Text>

    {/* Sparkline */}
    <div style={{ height: '40px' }}>
      <Sparkline
        data={[2000, 2100, 2200, 2350, 2450]}
        color="success"
      />
    </div>

    <InlineStack gap="400">
      <div>
        <Text variant="headingMd" as="p" tone="success">12</Text>
        <Text variant="bodySm" tone="subdued">Top 10 keywords</Text>
      </div>
      <div>
        <Text variant="headingMd" as="p">4.2</Text>
        <Text variant="bodySm" tone="subdued">Avg position</Text>
      </div>
    </InlineStack>
  </BlockStack>
</TileCard>
```

**Alert State** (rankings dropping):

```typescript
<TileCard
  title="SEO Performance"
  status="warning"
  metadata="Rankings down"
  icon={TrendingDownIcon}
>
  <BlockStack gap="200">
    <InlineStack align="space-between" blockAlign="center">
      <Text variant="heading2xl" as="p" tone="warning">1,850</Text>
      <Badge tone="critical">-12%</Badge>
    </InlineStack>

    <Text variant="bodyMd">Traffic dropped this week</Text>

    {/* Sparkline (downward) */}
    <div style={{ height: '40px' }}>
      <Sparkline
        data={[2100, 2050, 1950, 1900, 1850]}
        color="critical"
      />
    </div>

    <Text variant="bodySm" tone="subdued">
      5 keywords dropped out of top 10
    </Text>
  </BlockStack>
</TileCard>
```

**Data Visualization**:

- Organic visit count + percentage change
- Sparkline (7-day traffic trend)
- Top 10 keywords count + average position

**Hot Rod Icon**: 🔍 Magnifying glass for "search"

---

## 5. Fulfillment Status Tile

### States

**Healthy State** (on schedule):

```typescript
<TileCard
  title="Fulfillment"
  status="healthy"
  metadata="On schedule"
  icon={CheckCircleIcon}
>
  <BlockStack gap="200">
    <Text variant="heading2xl" as="p">24</Text>
    <Text variant="bodyMd" tone="subdued">Orders shipping today</Text>

    {/* Status breakdown */}
    <BlockStack gap="100">
      <InlineStack align="space-between">
        <Text variant="bodySm" tone="subdued">Packed</Text>
        <Text variant="bodySm">18</Text>
      </InlineStack>
      <InlineStack align="space-between">
        <Text variant="bodySm" tone="subdued">In transit</Text>
        <Text variant="bodySm">6</Text>
      </InlineStack>
      <InlineStack align="space-between">
        <Text variant="bodySm" tone="subdued">Delayed</Text>
        <Text variant="bodySm" tone="success">0</Text>
      </InlineStack>
    </BlockStack>
  </BlockStack>
</TileCard>
```

**Alert State** (delays):

```typescript
<TileCard
  title="Fulfillment"
  status="warning"
  metadata="3 delayed"
  icon={AlertTriangleIcon}
>
  <BlockStack gap="200">
    <Text variant="heading2xl" as="p" tone="warning">3</Text>
    <Text variant="bodyMd">Orders delayed</Text>

    {/* Delayed orders */}
    <Box paddingBlockStart="200">
      <List type="bullet">
        <List.Item>#1234 - Warehouse delay</List.Item>
        <List.Item>#1245 - Weather delay</List.Item>
        <List.Item>#1267 - Carrier issue</List.Item>
      </List>
    </Box>

    <Button onClick={viewOrders}>View all orders</Button>
  </BlockStack>
</TileCard>
```

**Data Visualization**:

- Count of orders shipping today
- Status breakdown (packed, in transit, delayed)
- List of delayed orders with reasons

**Hot Rod Icon**: 📦 Package for "fulfillment"

---

## Shared Data Visualization Components

### Sparkline Chart

```typescript
interface SparklineProps {
  data: number[];
  color?: "success" | "warning" | "critical";
  height?: number;
}

function Sparkline({ data, color = "success", height = 40 }: SparklineProps) {
  // Simple line chart showing trend
  // Use canvas or SVG
  // No axes, just line
}
```

**Use**: 7-day trends for Sales, SEO

### Progress Bar (Enhanced)

```typescript
<ProgressBar
  progress={70}
  tone="warning"
  size="small"
/>
<Text variant="bodySm" tone="subdued">
  $8,200 of $11,700 target
</Text>
```

**Use**: Goal progress (Sales)

### Mini List (Top 3)

```typescript
<List type="bullet">
  <List.Item>Item 1 - Detail</List.Item>
  <List.Item>Item 2 - Detail</List.Item>
  <List.Item>Item 3 - Detail</List.Item>
</List>
```

**Use**: CX issues, inventory items, delayed orders

---

## Hot Rod-Themed Iconography

**Tile Icons** (Conceptual):

- CX Escalations: 🔥 Fire (hot issues)
- Sales Pulse: ⚡ Lightning (speed/energy)
- Inventory: ⚙️ Gear (parts/mechanical)
- SEO: 🔍 Magnifying glass (search/discovery)
- Fulfillment: 📦 Package (delivery)

**Implementation**: Use Polaris icons (no custom assets needed)

```typescript
import {
  AlertTriangleIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  CheckCircleIcon,
  PackageIcon,
} from "@shopify/polaris-icons";
```

---

## Tile Interaction Patterns

### Click to Expand

```typescript
<TileCard onClick={() => openModal('cx-escalations')}>
  {/* Tile content */}
</TileCard>
```

**Behavior**: Click tile → Opens modal with full details

### Hover State

```css
.tile-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  transition: all 0.2s ease;
}
```

### Loading State

```typescript
<TileCard
  title="Sales Pulse"
  status="loading"
>
  <SkeletonBodyText lines={3} />
</TileCard>
```

---

## Responsive Behavior

**Desktop** (3-4 columns):

```css
.dashboard-grid {
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
```

**Tablet** (2 columns):

```css
@media (max-width: 1039px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

**Mobile** (1 column):

```css
@media (max-width: 767px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
```

---

## Implementation Checklist

- [ ] CX Escalations tile (healthy + alert states)
- [ ] Sales Pulse tile (on track + below target states)
- [ ] Inventory tile (stocked + low stock states)
- [ ] SEO Performance tile (rankings up + down states)
- [ ] Fulfillment tile (on schedule + delayed states)
- [ ] Sparkline chart component
- [ ] Enhanced progress bar
- [ ] Mini list component
- [ ] Polaris icons for all tiles
- [ ] Hover/click interactions
- [ ] Loading states
- [ ] Responsive grid layout

---

**Status**: All 5 tiles designed with detailed states, data visualizations, and Hot Rod iconography using Polaris
