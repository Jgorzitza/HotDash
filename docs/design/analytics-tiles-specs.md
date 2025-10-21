---
epoch: 2025.10.E1
doc: docs/design/analytics-tiles-specs.md
owner: designer
created: 2025-10-21
last_reviewed: 2025-10-21
doc_hash: TBD
expires: 2025-11-21
---

# Analytics Tiles Design Specifications — Phase 7-8

**Status**: Ready for Implementation  
**Chart Library**: Chart.js v3+  
**Design System**: OCC Design Tokens  
**Target**: 4 analytics tiles for dashboard

---

## Overview

### Purpose

Provide at-a-glance analytics insights with mini charts on the dashboard:

1. **Traffic Sources Tile** - Channel breakdown (Organic, Paid, Social, Direct)
2. **Conversion Funnel Tile** - Stage-by-stage drop-off visualization
3. **Top Products Tile** - Best-selling products with revenue
4. **Customer Segments Tile** - RFM segmentation visualization

### Design Principles

1. **Data Density**: Show maximum insight in minimum space
2. **Scannable**: Key metric prominent, chart provides context
3. **Consistent**: All tiles follow same layout pattern
4. **Accessible**: WCAG 2.2 AA compliant, screen reader friendly
5. **Performance**: Mini charts load fast (< 500ms render time)

### Component Structure

```tsx
<TileCard title="Tile Name" testId="tile-analytics-xxx">
  {/* Key Metric (large number) */}
  <div className="tile-primary-metric">
    <span className="metric-value">{value}</span>
    <span className="metric-label">{label}</span>
  </div>
  
  {/* Mini Chart */}
  <div className="tile-mini-chart">
    <canvas id="chart-xxx" width="100" height="60" />
  </div>
  
  {/* Supporting Data (optional) */}
  <div className="tile-supporting-data">
    {/* 2-3 secondary metrics */}
  </div>
  
  {/* View Details Button */}
  <Button onClick={() => navigate('/analytics/xxx')}>
    View Details
  </Button>
</TileCard>
```

---

## Tile 1: Traffic Sources

### Visual Layout

```
┌─────────────────────────────────┐
│ Traffic Sources              [?]│
├─────────────────────────────────┤
│                                 │
│  8,247 Total Sessions           │
│  ↑ 12.3% vs last 7 days         │
│                                 │
│  [Doughnut Chart]               │
│    38% Organic                  │
│    27% Paid                     │
│    20% Social                   │
│    15% Direct                   │
│                                 │
│  Breakdown:                     │
│  • Organic:  3,134 (38%)        │
│  • Paid:     2,227 (27%)        │
│  • Social:   1,649 (20%)        │
│  • Direct:   1,237 (15%)        │
│                                 │
│         [View Details →]         │
│                                 │
└─────────────────────────────────┘
```

### Chart Specifications

**Chart Type**: Doughnut Chart (Chart.js)

**Dimensions**: 
- Width: 200px
- Height: 200px
- Tile mini version: 150x150px

**Data Structure**:
```tsx
const trafficData = {
  labels: ['Organic', 'Paid', 'Social', 'Direct'],
  datasets: [{
    data: [3134, 2227, 1649, 1237], // Session counts
    backgroundColor: [
      'var(--occ-color-success)',    // Organic: Green #008060
      'var(--occ-color-warning)',    // Paid: Yellow #FFBF47
      'var(--occ-color-info)',       // Social: Blue #0078D4
      'var(--occ-text-secondary)',   // Direct: Gray #637381
    ],
    borderWidth: 0,
    hoverBorderWidth: 2,
    hoverBorderColor: '#fff',
  }]
};
```

**Chart.js Configuration**:
```tsx
const config = {
  type: 'doughnut',
  data: trafficData,
  options: {
    responsive: true,
    maintainAspectRatio: true,
    cutout: '60%', // Thicker ring
    plugins: {
      legend: {
        display: false, // Legend in tile body, not in chart
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const percentage = ((value / 8247) * 100).toFixed(1);
            return `${label}: ${value.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    }
  }
};
```

### Typography

**Primary Metric**:
- Value: `font-size: var(--occ-font-size-2xl)` (28px), `font-weight: var(--occ-font-weight-bold)`
- Label: `font-size: var(--occ-font-size-sm)`, `color: var(--occ-text-secondary)`

**Trend Indicator**:
- Up/Down arrow + percentage
- Color: Green (positive) or Red (negative)
- Font: `var(--occ-font-size-sm)`

**Breakdown List**:
- Font: `var(--occ-font-size-sm)`
- Labels: `font-weight: var(--occ-font-weight-semibold)`
- Values: Regular weight

### Colors (OCC Tokens)

- **Organic**: `var(--occ-color-success)` (#008060)
- **Paid**: `var(--occ-color-warning)` (#FFBF47)
- **Social**: `var(--occ-color-info)` (#0078D4)
- **Direct**: `var(--occ-text-secondary)` (#637381)

**Color Legend**:
```tsx
<div style={{display: 'flex', gap: 'var(--occ-space-2)', marginBottom: 'var(--occ-space-3)'}}>
  <span style={{width: '12px', height: '12px', borderRadius: '50%', background: 'var(--occ-color-success)'}} />
  <Text variant="bodySm">Organic</Text>
</div>
```

### Accessibility

- ✅ **Canvas Alternative**: Provide data table for screen readers
- ✅ **ARIA Label**: `aria-label="Traffic sources doughnut chart showing 38% organic, 27% paid, 20% social, 15% direct"`
- ✅ **Color Independence**: Percentages listed in text (not color-only)
- ✅ **Keyboard**: Tab to "View Details" button, chart not interactive
- ✅ **Screen Reader**: Announce data in text format, not just chart

**Implementation**:
```tsx
<canvas
  id="traffic-sources-chart"
  width={150}
  height={150}
  aria-label="Traffic sources: Organic 38%, Paid 27%, Social 20%, Direct 15%"
  role="img"
/>

{/* Accessible data table (visually hidden) */}
<table style={{position: 'absolute', left: '-9999px'}} aria-label="Traffic sources data">
  <thead>
    <tr>
      <th>Source</th>
      <th>Sessions</th>
      <th>Percentage</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Organic</td><td>3,134</td><td>38%</td></tr>
    <tr><td>Paid</td><td>2,227</td><td>27%</td></tr>
    <tr><td>Social</td><td>1,649</td><td>20%</td></tr>
    <tr><td>Direct</td><td>1,237</td><td>15%</td></tr>
  </tbody>
</table>
```

---

## Tile 2: Conversion Funnel

### Visual Layout

```
┌─────────────────────────────────┐
│ Conversion Funnel            [?]│
├─────────────────────────────────┤
│                                 │
│  3.24% Conversion Rate          │
│  ↓ -0.3% vs last 7 days         │
│                                 │
│  [Funnel Bar Chart]             │
│    █████████████ 100% Views     │
│    ███████████   78%  Add Cart  │
│    █████████     62%  Checkout  │
│    ██████        48%  Complete  │
│                                 │
│  Stages:                        │
│  1. Product Views:   8,247      │
│  2. Add to Cart:     6,433 (78%)│
│  3. Checkout:        5,113 (62%)│
│  4. Order Complete:  3,958 (48%)│
│                                 │
│         [View Details →]         │
│                                 │
└─────────────────────────────────┘
```

### Chart Specifications

**Chart Type**: Horizontal Bar Chart (Chart.js) — Stacked appearance

**Dimensions**: 
- Width: 100% (responsive to tile width)
- Height: 120px

**Data Structure**:
```tsx
const funnelData = {
  labels: ['Views', 'Add Cart', 'Checkout', 'Complete'],
  datasets: [{
    label: 'Conversion Funnel',
    data: [100, 78, 62, 48], // Percentages
    backgroundColor: [
      'var(--occ-color-info)',      // Stage 1: Blue
      'var(--occ-color-success)',   // Stage 2: Green
      'var(--occ-color-warning)',   // Stage 3: Yellow
      'var(--occ-color-critical)',  // Stage 4: Red (lowest conversion)
    ],
    borderWidth: 0,
    barThickness: 20, // Fixed height bars
  }]
};
```

**Chart.js Configuration**:
```tsx
const config = {
  type: 'bar',
  data: funnelData,
  options: {
    indexAxis: 'y', // Horizontal bars
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context) => {
            const stage = context.label;
            const percentage = context.parsed.x;
            return `${stage}: ${percentage}% of funnel`;
          }
        }
      }
    },
    scales: {
      x: {
        display: false, // Hide x-axis (percentages shown in bars)
        max: 100,
      },
      y: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
            family: 'var(--occ-font-family)',
          },
          color: 'var(--occ-text-primary)',
        }
      }
    }
  }
};
```

### Typography

Same as Traffic Sources tile (consistent pattern)

### Colors (OCC Tokens)

- **Stage 1 (Views)**: `var(--occ-color-info)` (#0078D4) - Entry point
- **Stage 2 (Add Cart)**: `var(--occ-color-success)` (#008060) - Good conversion
- **Stage 3 (Checkout)**: `var(--occ-color-warning)` (#FFBF47) - Moderate drop-off
- **Stage 4 (Complete)**: `var(--occ-color-critical)` (#D82C0D) - Attention needed

**Color Meaning**: Gradient from blue (entry) to red (conversion point)

### Accessibility

- ✅ **ARIA Label**: `aria-label="Conversion funnel showing 78% add to cart, 62% checkout, 48% order complete"`
- ✅ **Data Table**: Accessible fallback for screen readers
- ✅ **Color Independence**: Percentages and counts in text
- ✅ **Role**: `role="img"` on canvas

**Implementation**:
```tsx
<canvas
  id="conversion-funnel-chart"
  width={250}
  height={120}
  aria-label="Conversion funnel: Views 100%, Add to Cart 78%, Checkout 62%, Complete 48%"
  role="img"
/>
```

---

## Tile 3: Top Products

### Visual Layout

```
┌─────────────────────────────────┐
│ Top Products                 [?]│
├─────────────────────────────────┤
│                                 │
│  $124,305 Top 5 Revenue         │
│  ↑ 18.5% vs last 7 days         │
│                                 │
│  [Horizontal Bar Chart]         │
│    ████████████ Product A $45K  │
│    █████████    Product B $32K  │
│    ████████     Product C $24K  │
│    ██████       Product D $15K  │
│    ████         Product E $8K   │
│                                 │
│  Top 5:                         │
│  1. Product A: $45,230          │
│  2. Product B: $32,108          │
│  3. Product C: $24,567          │
│  4. Product D: $15,420          │
│  5. Product E: $8,980           │
│                                 │
│         [View Details →]         │
│                                 │
└─────────────────────────────────┘
```

### Chart Specifications

**Chart Type**: Horizontal Bar Chart (Chart.js)

**Dimensions**: 
- Width: 100% (responsive)
- Height: 150px (5 bars × 30px)

**Data Structure**:
```tsx
const topProductsData = {
  labels: ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'],
  datasets: [{
    label: 'Revenue',
    data: [45230, 32108, 24567, 15420, 8980],
    backgroundColor: 'var(--occ-color-success)',
    borderWidth: 0,
    barThickness: 24,
  }]
};
```

**Chart.js Configuration**:
```tsx
const config = {
  type: 'bar',
  data: topProductsData,
  options: {
    indexAxis: 'y', // Horizontal bars
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context) => {
            const value = context.parsed.x;
            return `Revenue: $${value.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: false, // Hide x-axis
        beginAtZero: true,
      },
      y: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
            family: 'var(--occ-font-family)',
          },
          color: 'var(--occ-text-primary)',
          callback: function(value, index) {
            // Truncate long product names
            const label = this.getLabelForValue(value);
            return label.length > 15 ? label.substring(0, 12) + '...' : label;
          }
        }
      }
    }
  }
};
```

### Typography

Same as previous tiles (consistent pattern)

### Colors (OCC Tokens)

- **All Bars**: `var(--occ-color-success)` (#008060) - Revenue is positive metric
- **Hover**: Slightly darker shade (Chart.js handles automatically)

### Accessibility

- ✅ **ARIA Label**: `aria-label="Top 5 products by revenue: Product A $45K, Product B $32K, Product C $24K, Product D $15K, Product E $8K"`
- ✅ **Data List**: Products listed in text below chart
- ✅ **Color Independence**: Revenue amounts in text
- ✅ **Screen Reader**: Full product list accessible

**Implementation**:
```tsx
<canvas
  id="top-products-chart"
  width={250}
  height={150}
  aria-label="Top 5 products: Product A $45,230, Product B $32,108, Product C $24,567, Product D $15,420, Product E $8,980"
  role="img"
/>
```

---

## Tile 4: Customer Segments (RFM)

### Visual Layout

```
┌─────────────────────────────────┐
│ Customer Segments            [?]│
├─────────────────────────────────┤
│                                 │
│  1,847 Active Customers         │
│  ↑ 5.2% vs last 30 days         │
│                                 │
│  [Stacked Bar Chart]            │
│    ██████ Champions (35%)       │
│    ████   Loyal (22%)           │
│    ███    Potential (18%)       │
│    ██     At Risk (15%)         │
│    █      Hibernating (10%)     │
│                                 │
│  Segments:                      │
│  • Champions:    647 (35%)      │
│  • Loyal:        406 (22%)      │
│  • Potential:    332 (18%)      │
│  • At Risk:      277 (15%)      │
│  • Hibernating:  185 (10%)      │
│                                 │
│         [View Details →]         │
│                                 │
└─────────────────────────────────┘
```

### Chart Specifications

**Chart Type**: Horizontal Stacked Bar Chart (Chart.js)

**Dimensions**: 
- Width: 100% (responsive)
- Height: 60px (single stacked bar)

**Data Structure**:
```tsx
const segmentsData = {
  labels: ['Customer Segments'],
  datasets: [
    {
      label: 'Champions',
      data: [35],
      backgroundColor: 'var(--occ-color-success)',
    },
    {
      label: 'Loyal',
      data: [22],
      backgroundColor: 'var(--occ-color-info)',
    },
    {
      label: 'Potential',
      data: [18],
      backgroundColor: 'var(--occ-color-warning)',
    },
    {
      label: 'At Risk',
      data: [15],
      backgroundColor: '#FF8C42', // Orange (between warning and critical)
    },
    {
      label: 'Hibernating',
      data: [10],
      backgroundColor: 'var(--occ-text-secondary)',
    }
  ]
};
```

**Chart.js Configuration**:
```tsx
const config = {
  type: 'bar',
  data: segmentsData,
  options: {
    indexAxis: 'y', // Horizontal
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const percentage = context.parsed.x;
            const count = Math.round((percentage / 100) * 1847);
            return `${label}: ${count} customers (${percentage}%)`;
          }
        }
      }
    },
    scales: {
      x: {
        stacked: true,
        display: false, // Hide x-axis
        max: 100,
      },
      y: {
        stacked: true,
        display: false, // Hide y-axis (no label needed for single bar)
      }
    }
  }
};
```

### Typography

Same as previous tiles

### Colors (OCC Tokens)

- **Champions**: `var(--occ-color-success)` (#008060) - Best customers
- **Loyal**: `var(--occ-color-info)` (#0078D4) - Regular buyers
- **Potential**: `var(--occ-color-warning)` (#FFBF47) - Can improve
- **At Risk**: `#FF8C42` (Orange) - Need attention
- **Hibernating**: `var(--occ-text-secondary)` (#637381) - Inactive

### Accessibility

- ✅ **ARIA Label**: `aria-label="Customer segments: Champions 35%, Loyal 22%, Potential 18%, At Risk 15%, Hibernating 10%"`
- ✅ **Segment List**: Listed in text below chart
- ✅ **Color Independence**: Percentages and counts in text
- ✅ **Screen Reader**: Full data accessible

**Implementation**: Similar to previous tiles with accessible table

---

## Shared Design Patterns

### Tile Container

**Structure**:
```tsx
<TileCard
  title="Tile Name"
  testId="tile-analytics-xxx"
  showRefreshIndicator
  isRefreshing={isRefreshing}
  onRefresh={handleRefresh}
  autoRefreshInterval={300} // 5 minutes
>
  {/* Tile content */}
</TileCard>
```

**Styling**:
- Background: `var(--occ-bg-surface)` (white)
- Border: `1px solid var(--occ-border-default)`
- Border Radius: `var(--occ-radius-lg)`
- Padding: `var(--occ-space-4)`
- Shadow: `var(--occ-shadow-sm)`

### Primary Metric

**Pattern** (all tiles):
```tsx
<div style={{
  marginBottom: 'var(--occ-space-4)',
}}>
  <div style={{
    fontSize: 'var(--occ-font-size-2xl)',
    fontWeight: 'var(--occ-font-weight-bold)',
    color: 'var(--occ-text-primary)',
    lineHeight: 1.2,
  }}>
    {primaryValue}
  </div>
  <div style={{
    fontSize: 'var(--occ-font-size-sm)',
    color: 'var(--occ-text-secondary)',
    marginTop: 'var(--occ-space-1)',
  }}>
    {label}
  </div>
</div>
```

### Trend Indicator

**Pattern** (all tiles):
```tsx
<div style={{
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--occ-space-1)',
  fontSize: 'var(--occ-font-size-sm)',
  color: isPositive ? 'var(--occ-text-success)' : 'var(--occ-text-critical)',
  marginBottom: 'var(--occ-space-4)',
}}>
  <span>{isPositive ? '↑' : '↓'}</span>
  <span>{Math.abs(percentage)}%</span>
  <span style={{color: 'var(--occ-text-secondary)'}}>
    vs last {period}
  </span>
</div>
```

### Mini Chart Container

**Pattern** (all tiles):
```tsx
<div style={{
  width: '100%',
  height: '150px', // Varies by chart type
  marginBottom: 'var(--occ-space-4)',
  position: 'relative',
}}>
  <canvas
    id="chart-xxx"
    aria-label="Chart description with data"
    role="img"
  />
</div>
```

### Supporting Data List

**Pattern** (all tiles):
```tsx
<div style={{
  fontSize: 'var(--occ-font-size-sm)',
  color: 'var(--occ-text-primary)',
  marginBottom: 'var(--occ-space-4)',
}}>
  <div style={{
    fontWeight: 'var(--occ-font-weight-semibold)',
    marginBottom: 'var(--occ-space-2)',
  }}>
    Breakdown:
  </div>
  <ul style={{
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--occ-space-2)',
  }}>
    {items.map(item => (
      <li key={item.id} style={{display: 'flex', justifyContent: 'space-between'}}>
        <span style={{display: 'flex', alignItems: 'center', gap: 'var(--occ-space-2)'}}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: item.color,
          }} />
          {item.label}
        </span>
        <span>{item.value}</span>
      </li>
    ))}
  </ul>
</div>
```

---

## Chart.js Global Configuration

### Responsive Behavior

**Container Setup** (all charts):
```html
<div className="chart-container" style={{
  position: 'relative',
  height: '150px', /* Fixed height for consistency */
  width: '100%'
}}>
  <canvas id="chart-xxx"></canvas>
</div>
```

**Chart.js Options**:
```tsx
options: {
  responsive: true,
  maintainAspectRatio: false, // Allow fixed height
  // ... other options
}
```

### Font Configuration

**Global Defaults** (set once for all charts):
```tsx
import { Chart } from 'chart.js';

Chart.defaults.font.family = 'var(--occ-font-family)';
Chart.defaults.font.size = 12;
Chart.defaults.color = 'var(--occ-text-primary)';
```

### Animation Settings

**Default Animation**:
```tsx
animation: {
  duration: 500, // Fast animations for tiles
  easing: 'easeOutQuart',
}
```

**Reduced Motion** (accessibility):
```tsx
// Detect prefers-reduced-motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

animation: {
  duration: prefersReducedMotion ? 0 : 500,
}
```

### Performance Optimization

**Lazy Loading**:
- Only render chart when tile is visible
- Use IntersectionObserver to detect visibility

**Debouncing**:
- Debounce resize events (300ms delay)
- Prevent excessive re-renders

**Memory Management**:
- Destroy chart instances on component unmount
- Clean up event listeners

```tsx
useEffect(() => {
  const chartInstance = new Chart(canvas, config);
  
  return () => {
    chartInstance.destroy(); // Cleanup
  };
}, []);
```

---

## Accessibility Best Practices

### WCAG 2.2 AA Compliance

**Required for all charts**:

1. **Text Alternatives** (1.1.1):
   - `aria-label` on canvas with data summary
   - `role="img"` to identify as image
   - Accessible data table (visually hidden)

2. **Color Contrast** (1.4.3):
   - Chart colors meet 3:1 contrast (UI components)
   - Text labels meet 4.5:1 contrast
   - Use OCC tokens to ensure compliance

3. **Keyboard Accessible** (2.1.1):
   - Charts are non-interactive (display only)
   - "View Details" button keyboard accessible
   - Tab order logical

4. **Status Messages** (4.1.3):
   - Announce data updates to screen readers
   - Use `aria-live="polite"` on tile content

### Screen Reader Support

**Example Announcement** (Traffic Sources):
```
"Traffic Sources tile. Total sessions: 8,247, up 12.3% versus last 7 days. 
Breakdown: Organic 3,134 sessions, 38%; Paid 2,227 sessions, 27%; 
Social 1,649 sessions, 20%; Direct 1,237 sessions, 15%. 
Button, View Details."
```

**Implementation**:
```tsx
<div
  aria-label="Traffic Sources"
  aria-live="polite"
  aria-atomic="false"
>
  {/* Tile content */}
</div>
```

---

## Mobile Responsiveness

### Chart Adaptations (< 768px)

**Changes for Mobile**:
1. **Chart Size**: Reduce height slightly
   - Desktop: 150px
   - Mobile: 120px

2. **Font Size**: Reduce chart labels
   - Desktop: 12px
   - Mobile: 10px

3. **Touch Interactions**: Charts non-interactive (no tap events needed)

4. **Orientation**: Charts adapt to portrait (stacked) and landscape

**Media Query Example**:
```css
@media (max-width: 768px) {
  .tile-mini-chart {
    height: 120px; /* Reduce from 150px */
  }
  
  .chart-axis-labels {
    font-size: 10px; /* Reduce from 12px */
  }
}
```

---

## Implementation Checklist

### For Each Tile

- [ ] Primary metric displayed prominently
- [ ] Trend indicator showing change
- [ ] Mini chart rendered with Chart.js
- [ ] Supporting data listed in text
- [ ] "View Details" button navigates to analytics modal
- [ ] OCC design tokens used throughout
- [ ] ARIA labels on charts
- [ ] Accessible data table (visually hidden)
- [ ] Color contrast meets WCAG AA
- [ ] Responsive (desktop + mobile)
- [ ] Performance optimized (< 500ms render)

### Testing

- [ ] Lighthouse accessibility audit (95+ score)
- [ ] axe DevTools (0 violations)
- [ ] Keyboard navigation (Tab to button, no chart interaction)
- [ ] Screen reader testing (NVDA announces data correctly)
- [ ] Mobile responsive (320px to 1920px)
- [ ] Chart.js tooltips work on hover
- [ ] Data updates reflect in chart
- [ ] Reduced motion respected (animation: 0 if preferred)

---

## Chart.js Dependencies

### Package Installation

```bash
npm install chart.js
```

**Version**: ^4.4.0 (latest)

### Imports

```tsx
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);
```

### TypeScript Types

```tsx
import type { ChartConfiguration, ChartData } from 'chart.js';

interface AnalyticsTileProps {
  data: ChartData;
  config: ChartConfiguration;
}
```

---

## Example Implementation (Traffic Sources Tile)

```tsx
import { useEffect, useRef } from 'react';
import { Chart } from 'chart.js';
import { TileCard } from '~/components/tiles/TileCard';

export function TrafficSourcesTile({ data }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Destroy previous chart instance
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    // Create new chart
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const chartData = {
      labels: ['Organic', 'Paid', 'Social', 'Direct'],
      datasets: [{
        data: [
          data.organic,
          data.paid,
          data.social,
          data.direct,
        ],
        backgroundColor: [
          'var(--occ-color-success)',
          'var(--occ-color-warning)',
          'var(--occ-color-info)',
          'var(--occ-text-secondary)',
        ],
        borderWidth: 0,
      }]
    };

    chartRef.current = new Chart(ctx, {
      type: 'doughnut',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '60%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed || 0;
                const percentage = ((value / data.total) * 100).toFixed(1);
                return `${label}: ${value.toLocaleString()} (${percentage}%)`;
              }
            }
          }
        }
      }
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data]);

  return (
    <TileCard
      title="Traffic Sources"
      testId="tile-traffic-sources"
      showRefreshIndicator
      isRefreshing={false}
    >
      {/* Primary Metric */}
      <div style={{marginBottom: 'var(--occ-space-4)'}}>
        <div style={{
          fontSize: 'var(--occ-font-size-2xl)',
          fontWeight: 'var(--occ-font-weight-bold)',
        }}>
          {data.total.toLocaleString()}
        </div>
        <div style={{
          fontSize: 'var(--occ-font-size-sm)',
          color: 'var(--occ-text-secondary)',
        }}>
          Total Sessions
        </div>
      </div>

      {/* Trend */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--occ-space-1)',
        fontSize: 'var(--occ-font-size-sm)',
        color: 'var(--occ-text-success)',
        marginBottom: 'var(--occ-space-4)',
      }}>
        <span>↑</span>
        <span>12.3%</span>
        <span style={{color: 'var(--occ-text-secondary)'}}>
          vs last 7 days
        </span>
      </div>

      {/* Chart */}
      <div style={{
        width: '100%',
        height: '150px',
        marginBottom: 'var(--occ-space-4)',
        position: 'relative',
      }}>
        <canvas
          ref={canvasRef}
          aria-label="Traffic sources: Organic 38%, Paid 27%, Social 20%, Direct 15%"
          role="img"
        />
      </div>

      {/* Breakdown */}
      <div style={{
        fontSize: 'var(--occ-font-size-sm)',
        marginBottom: 'var(--occ-space-4)',
      }}>
        <div style={{fontWeight: 'var(--occ-font-weight-semibold)', marginBottom: 'var(--occ-space-2)'}}>
          Breakdown:
        </div>
        <ul style={{listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--occ-space-2)'}}>
          {[
            { label: 'Organic', value: data.organic, color: 'var(--occ-color-success)' },
            { label: 'Paid', value: data.paid, color: 'var(--occ-color-warning)' },
            { label: 'Social', value: data.social, color: 'var(--occ-color-info)' },
            { label: 'Direct', value: data.direct, color: 'var(--occ-text-secondary)' },
          ].map(item => {
            const percentage = ((item.value / data.total) * 100).toFixed(0);
            return (
              <li key={item.label} style={{display: 'flex', justifyContent: 'space-between'}}>
                <span style={{display: 'flex', alignItems: 'center', gap: 'var(--occ-space-2)'}}>
                  <span style={{width: '8px', height: '8px', borderRadius: '50%', background: item.color}} />
                  {item.label}:
                </span>
                <span>{item.value.toLocaleString()} ({percentage}%)</span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Action */}
      <button
        onClick={() => navigate('/analytics/traffic')}
        style={{
          width: '100%',
          padding: 'var(--occ-space-3)',
          background: 'var(--occ-bg-interactive)',
          color: 'var(--occ-text-interactive)',
          border: '1px solid var(--occ-border-interactive)',
          borderRadius: 'var(--occ-radius-md)',
          fontSize: 'var(--occ-font-size-sm)',
          fontWeight: 'var(--occ-font-weight-medium)',
          cursor: 'pointer',
        }}
      >
        View Details →
      </button>

      {/* Accessible data table (visually hidden) */}
      <table style={{position: 'absolute', left: '-9999px'}} aria-label="Traffic sources data">
        <caption>Traffic sources breakdown</caption>
        <thead>
          <tr>
            <th>Source</th>
            <th>Sessions</th>
            <th>Percentage</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Organic</td><td>{data.organic}</td><td>38%</td></tr>
          <tr><td>Paid</td><td>{data.paid}</td><td>27%</td></tr>
          <tr><td>Social</td><td>{data.social}</td><td>20%</td></tr>
          <tr><td>Direct</td><td>{data.direct}</td><td>15%</td></tr>
        </tbody>
      </table>
    </TileCard>
  );
}
```

---

## Success Criteria

**Visual Design**:
- [ ] All 4 tiles follow consistent layout pattern
- [ ] Charts visually distinct and appropriate for data type
- [ ] Primary metrics prominent and scannable
- [ ] OCC design tokens used throughout
- [ ] Hot Rodan brand voice in microcopy

**Accessibility**:
- [ ] WCAG 2.2 Level AA compliant (100%)
- [ ] Screen reader announces all data
- [ ] Color contrast 4.5:1 minimum for text, 3:1 for UI components
- [ ] Keyboard navigation functional
- [ ] Accessible data tables provided

**Performance**:
- [ ] Charts render in < 500ms
- [ ] No jank or lag on scroll
- [ ] Responsive to viewport changes
- [ ] Memory leaks prevented (chart.destroy() on unmount)

**Integration**:
- [ ] Tiles integrate with TileCard wrapper
- [ ] "View Details" navigates to analytics modal
- [ ] Data from analytics API routes
- [ ] Real-time updates via SSE (optional)

---

## File Structure

```
app/
├── components/
│   └── tiles/
│       ├── analytics/
│       │   ├── TrafficSourcesTile.tsx
│       │   ├── ConversionFunnelTile.tsx
│       │   ├── TopProductsTile.tsx
│       │   ├── CustomerSegmentsTile.tsx
│       │   └── index.ts
│       └── TileCard.tsx (shared wrapper)
├── hooks/
│   └── useChart.ts (Chart.js initialization hook)
└── routes/
    ├── app._index.tsx (dashboard integration)
    └── api/analytics/
        ├── traffic-sources.ts
        ├── conversion-funnel.ts
        ├── top-products.ts
        └── customer-segments.ts
```

---

## Changelog

**2025-10-21**: Initial design specs created (Designer)  
**Version**: 1.0  
**Status**: Ready for Phase 7-8 implementation

---

**EOF — Analytics Tiles Design Specifications Complete**


