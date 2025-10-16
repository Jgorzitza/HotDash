# Dashboard Tiles Specification

**Version:** 1.0
**Last Updated:** 2025-10-16
**Owner:** Analytics Agent

---

## Overview

Dashboard tiles display key analytics metrics in a standardized, reusable format.

---

## Tile Data Contract

```typescript
interface TileData {
  title: string;              // Tile heading
  value: string | number;     // Primary metric value
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    percentage: number;       // Absolute percentage change
    label: string;            // Description (e.g., "vs previous period")
  };
  metadata?: Record<string, any>;  // Additional context
}
```

---

## Standard Tiles

### 1. Revenue Tile

**Title:** "Total Revenue"
**Value:** `$12,500` (formatted currency)
**Trend:** `↑ 15.3% vs previous period`
**Metadata:**
- `transactions`: Number of transactions
- `aov`: Average order value
- `period`: Date range

**API:** `GET /api/dashboard/tiles` → `tiles[0]`

---

### 2. Traffic Tile

**Title:** "Total Sessions"
**Value:** `5,200` (formatted number)
**Trend:** `↑ 12.5% vs previous period`
**Metadata:**
- `organicSessions`: Organic session count
- `organicPercentage`: Percentage of organic traffic
- `period`: Date range

**API:** `GET /api/dashboard/tiles` → `tiles[1]`

---

### 3. Conversion Rate Tile

**Title:** "Conversion Rate"
**Value:** `1.29%` (formatted percentage)
**Trend:** `↑ 8.4% vs previous period`
**Metadata:**
- `transactions`: Number of conversions
- `revenue`: Total revenue
- `period`: Date range

**API:** `GET /api/dashboard/tiles` → `tiles[2]`

---

### 4. SEO Tile

**Title:** "Organic Traffic"
**Value:** `70.0%` (organic percentage)
**Trend:** `↑ 15.8% organic sessions`
**Metadata:**
- `organicSessions`: Organic session count
- `organicRevenue`: Revenue from organic traffic
- `organicConversions`: Conversions from organic

**API:** `GET /api/dashboard/tiles` → `tiles[3]`

---

### 5. Funnel Tile

**Title:** "Funnel Completion"
**Value:** `1.29%` (completion rate)
**Trend:** `67 completed` (neutral trend)
**Metadata:**
- `totalUsers`: Users entering funnel
- `steps`: Number of funnel steps
- `name`: Funnel name

**API:** `GET /api/dashboard/tiles` → `tiles[4]`

---

## Tile Props (React Component)

```typescript
interface TileProps {
  title: string;
  value: string | number;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    percentage: number;
    label: string;
  };
  onClick?: () => void;      // Optional drill-down
  loading?: boolean;         // Loading state
  error?: string;            // Error message
}
```

---

## Usage Example

```typescript
import { useLoaderData } from 'react-router';

export async function loader() {
  const response = await fetch('/api/dashboard/tiles');
  const { data } = await response.json();
  return data;
}

export default function Dashboard() {
  const { tiles } = useLoaderData();

  return (
    <div className="grid grid-cols-3 gap-4">
      {tiles.map((tile, index) => (
        <Tile key={index} {...tile} />
      ))}
    </div>
  );
}
```

---

## Styling Guidelines

### Colors
- **Up trend:** Green (#10B981)
- **Down trend:** Red (#EF4444)
- **Neutral:** Gray (#6B7280)

### Typography
- **Title:** 14px, medium weight, gray-500
- **Value:** 30px, bold, gray-900
- **Trend:** 14px, medium weight, colored

### Layout
- **Padding:** 24px
- **Border radius:** 8px
- **Shadow:** sm (0 1px 2px rgba(0,0,0,0.05))
- **Background:** White

---

## Accessibility

- **ARIA labels:** Include descriptive labels
- **Keyboard navigation:** Support tab navigation
- **Screen readers:** Announce trend direction
- **Color contrast:** WCAG AA compliant

---

## Performance

- **Cache:** 5-minute TTL on tile data
- **Loading state:** Show skeleton while loading
- **Error handling:** Display error message in tile
- **Lazy loading:** Load tiles on viewport entry

---

## Testing

```typescript
describe('Dashboard Tiles', () => {
  it('should display revenue tile', () => {
    const tile = { title: 'Revenue', value: '$12,500', trend: { direction: 'up', percentage: 15.3, label: 'vs previous' } };
    render(<Tile {...tile} />);
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('$12,500')).toBeInTheDocument();
  });
});
```

---

## Future Enhancements

1. **Custom tiles:** Allow users to create custom tiles
2. **Tile reordering:** Drag-and-drop tile arrangement
3. **Tile sizing:** Support different tile sizes
4. **Sparklines:** Add mini charts to tiles
5. **Drill-down:** Click tile to view detailed report

---

**Specification complete!** ✅

