# Dashboard Tiles — Compact Props and Examples

Status: Draft (2025-10-16)
Owner: Designer
Aligns with: docs/specs/dashboard_tiles_contracts.md

---

## Shared Types
```ts
export type TrendDir = 'up' | 'down' | 'neutral';
export interface TrendMeta { direction: TrendDir; label?: string; percentage?: number }

export interface BaseTileProps {
  title: string;
  loading?: boolean;
  error?: string;
  onClick?: () => void;
}
```

## Tile-Specific Compact Props (7)

### 1) Revenue
```ts
export interface RevenueTileProps extends BaseTileProps {
  value: string;          // formatted currency
  orderCount?: number;
  trend?: TrendMeta;
}
```

### 2) AOV
```ts
export interface AOVTileProps extends BaseTileProps {
  value: string;          // formatted currency
  percentChange?: string; // e.g., "+3.2%"
  trend?: TrendMeta;
}
```

### 3) Returns
```ts
export interface ReturnsTileProps extends BaseTileProps {
  count: number;
  pendingReview?: number;
  trend?: TrendMeta;
}
```

### 4) Stock Risk
```ts
export interface StockRiskTileProps extends BaseTileProps {
  skuCount: number;       // number of SKUs at risk
  subtitle?: string;      // e.g., "Low stock in last 7 days"
  trend?: TrendMeta;
}
```

### 5) SEO
```ts
export interface SEOTileProps extends BaseTileProps {
  alertCount: number;
  topAlert?: string;      // short description of most critical
  trend?: TrendMeta;
}
```

### 6) CX
```ts
export interface CXTileProps extends BaseTileProps {
  escalationCount: number;
  slaStatus?: string;     // e.g., "On track" / "Breach risk"
  trend?: TrendMeta;
}
```

### 7) Approvals
```ts
export interface ApprovalsTileProps extends BaseTileProps {
  pendingCount: number;
  filters?: string[];
}
```

---

## Examples
```ts
const revenue: RevenueTileProps = {
  title: 'Revenue', value: '$12,500', orderCount: 142,
  trend: { direction: 'up', percentage: 15.3, label: 'vs previous period' }
};

const aov: AOVTileProps = {
  title: 'Avg Order Value', value: '$87.40', percentChange: '+2.1%',
  trend: { direction: 'up' }
};

const approvals: ApprovalsTileProps = { title: 'Approvals', pendingCount: 7 };
```

---

## Compact Variant Rules
- Typography scale reduced ~12% vs standard
- Value truncates long currency with non-breaking thin space separators
- Secondary lines max 1 wrap; ellipsis beyond 1 line
- Iconography optional; prioritize numbers for scannability

## Error/Loading Handling
- loading=true: show skeletons (see loading-states.md)
- error: show inline Banner with retry (see error-states.md)

## Accessibility
- Ensure accessible name includes title and primary value when read
- Announce trend direction via text, not color alone

