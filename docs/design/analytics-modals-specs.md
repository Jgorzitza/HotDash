---
epoch: 2025.10.E1
doc: docs/design/analytics-modals-specs.md
owner: designer
created: 2025-10-21
last_reviewed: 2025-10-21
doc_hash: TBD
expires: 2025-11-21
---

# Analytics Modals Design Specifications — Phase 7-8

**Status**: Ready for Implementation  
**Chart Library**: Chart.js v4+  
**Table Component**: Polaris DataTable or custom table  
**Design System**: OCC Design Tokens + Polaris  
**Target**: 4 analytics modals with detailed visualizations

---

## Overview

### Purpose

Provide deep-dive analytics views when operators click "View Details" on dashboard tiles:

1. **Traffic Sources Modal** - Full channel breakdown with trends
2. **Conversion Funnel Modal** - Multi-step funnel with drop-off analysis
3. **Top Products Modal** - Best sellers with charts and filters
4. **Customer Segments Modal** - RFM analysis with segment details

### Design Principles

1. **Progressive Disclosure**: Start with summary, reveal details on demand
2. **Actionable Insights**: Highlight what requires attention
3. **Comparison**: Show trends over time (7d, 30d, 90d comparisons)
4. **Exportable**: All data can be exported to CSV
5. **Accessible**: WCAG 2.2 AA compliant, keyboard navigable

### Modal Structure

```tsx
<Modal
  open={isOpen}
  onClose={onClose}
  title="Analytics: [Title]"
  size="large"
  primaryAction={{
    content: 'Export CSV',
    onAction: handleExport,
  }}
  secondaryActions={[
    { content: 'Close', onAction: onClose }
  ]}
>
  <Modal.Section>
    {/* Filter Controls */}
    <DateRangePicker />
    <SegmentFilter />
  </Modal.Section>
  
  <Modal.Section>
    {/* Primary Chart (large) */}
    <canvas id="main-chart" />
  </Modal.Section>
  
  <Modal.Section>
    {/* Secondary Charts (2-3 smaller) */}
    <InlineGrid columns={2}>
      <canvas id="chart-2" />
      <canvas id="chart-3" />
    </InlineGrid>
  </Modal.Section>
  
  <Modal.Section>
    {/* Data Table */}
    <DataTable />
  </Modal.Section>
</Modal>
```

---

## Modal 1: Traffic Sources

### Visual Layout

```
┌───────────────────────────────────────────────────────────────┐
│  Traffic Sources Analytics                               [×] │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  [ Last 7 days ▼ ]  [ All channels ▼ ]      [Export CSV]    │
│                                                               │
│  ─────────────────────────────────────────────────────────────│
│                                                               │
│  Traffic Trend (Line Chart)                                   │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                                            ◆ Organic     │ │
│  │                                            ◆ Paid        │ │
│  │    /\                                      ◆ Social      │ │
│  │   /  \      ◆                              ◆ Direct      │ │
│  │  /    \    / \                                          │ │
│  │ /      \  /   \                                         │ │
│  │/        \/     \___                                     │ │
│  └─────────────────────────────────────────────────────────┘ │
│  Mon   Tue   Wed   Thu   Fri   Sat   Sun                    │
│                                                               │
│  ─────────────────────────────────────────────────────────────│
│                                                               │
│  Channel Breakdown (Doughnut) | Top Pages (Bar Chart)        │
│  ┌──────────────┐              ┌──────────────┐              │
│  │   [Donut]    │              │ /product-a   │              │
│  │   38% Organic│              │ /product-b   │              │
│  │   27% Paid   │              │ /product-c   │              │
│  │   20% Social │              │ /landing     │              │
│  │   15% Direct │              │ /home        │              │
│  └──────────────┘              └──────────────┘              │
│                                                               │
│  ─────────────────────────────────────────────────────────────│
│                                                               │
│  Detailed Breakdown Table                                     │
│  ┌───────┬──────────┬─────────┬──────────────┬────────────┐  │
│  │Source │ Sessions │ % Total │ Bounce Rate  │ Avg Duration│  │
│  ├───────┼──────────┼─────────┼──────────────┼────────────┤  │
│  │Organic│   3,134  │  38%    │    45.2%     │   2m 34s   │  │
│  │Paid   │   2,227  │  27%    │    52.8%     │   1m 58s   │  │
│  │Social │   1,649  │  20%    │    61.3%     │   1m 22s   │  │
│  │Direct │   1,237  │  15%    │    38.9%     │   3m 05s   │  │
│  │Total  │   8,247  │ 100%    │    49.2%     │   2m 15s   │  │
│  └───────┴──────────┴─────────┴──────────────┴────────────┘  │
│                                                               │
│                        [Close]    [Export CSV]                │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### Section 1: Filters

**Components**:
```tsx
<InlineStack gap="300">
  <Select
    label="Date Range"
    options={[
      { label: 'Last 7 days', value: '7d' },
      { label: 'Last 30 days', value: '30d' },
      { label: 'Last 90 days', value: '90d' },
      { label: 'Custom range', value: 'custom' },
    ]}
    value={dateRange}
    onChange={setDateRange}
  />
  
  <Select
    label="Channel Filter"
    options={[
      { label: 'All channels', value: 'all' },
      { label: 'Organic only', value: 'organic' },
      { label: 'Paid only', value: 'paid' },
      { label: 'Social only', value: 'social' },
      { label: 'Direct only', value: 'direct' },
    ]}
    value={channelFilter}
    onChange={setChannelFilter}
  />
</InlineStack>
```

### Section 2: Traffic Trend Chart (Primary)

**Chart Type**: Multi-Line Chart (Chart.js)

**Dimensions**: 
- Width: 100% (modal width)
- Height: 300px

**Data Structure**:
```tsx
const trafficTrendData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], // 7 days
  datasets: [
    {
      label: 'Organic',
      data: [420, 450, 480, 520, 510, 490, 530],
      borderColor: 'var(--occ-color-success)',
      backgroundColor: 'transparent',
      tension: 0.4, // Smooth curves
      borderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    },
    {
      label: 'Paid',
      data: [310, 320, 315, 330, 340, 320, 310],
      borderColor: 'var(--occ-color-warning)',
      backgroundColor: 'transparent',
      tension: 0.4,
      borderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    },
    {
      label: 'Social',
      data: [230, 240, 235, 245, 250, 240, 235],
      borderColor: 'var(--occ-color-info)',
      backgroundColor: 'transparent',
      tension: 0.4,
      borderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    },
    {
      label: 'Direct',
      data: [170, 180, 175, 185, 190, 180, 175],
      borderColor: 'var(--occ-text-secondary)',
      backgroundColor: 'transparent',
      tension: 0.4,
      borderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    }
  ]
};
```

**Chart.js Configuration**:
```tsx
const config = {
  type: 'line',
  data: trafficTrendData,
  options: {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            family: 'var(--occ-font-family)',
            size: 12,
          },
          color: 'var(--occ-text-primary)',
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'var(--occ-border-default)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
            family: 'var(--occ-font-family)',
          },
          color: 'var(--occ-text-secondary)',
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'var(--occ-border-subdued)',
          borderDash: [2, 2],
        },
        ticks: {
          font: {
            size: 12,
            family: 'var(--occ-font-family)',
          },
          color: 'var(--occ-text-secondary)',
          callback: (value) => value.toLocaleString(),
        }
      }
    }
  }
};
```

### Section 3: Secondary Charts

**Layout**: 2-column grid (Polaris InlineGrid)

**Chart 1**: Channel Breakdown (Doughnut) — Reuse from tile
**Chart 2**: Top Pages (Horizontal Bar Chart)

**Top Pages Chart**:
```tsx
const topPagesData = {
  labels: ['/product-a', '/product-b', '/product-c', '/landing', '/home'],
  datasets: [{
    label: 'Page Views',
    data: [1250, 980, 840, 720, 650],
    backgroundColor: 'var(--occ-color-info)',
    barThickness: 20,
  }]
};

const topPagesConfig = {
  type: 'bar',
  data: topPagesData,
  options: {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `Views: ${context.parsed.x.toLocaleString()}`
        }
      }
    },
    scales: {
      x: {
        display: false,
        beginAtZero: true,
      },
      y: {
        grid: { display: false },
        ticks: {
          font: { size: 11 },
          color: 'var(--occ-text-primary)',
        }
      }
    }
  }
};
```

### Section 4: Data Table

**Table Component**: Polaris DataTable or custom styled table

**Columns**:
1. Source (Organic, Paid, Social, Direct)
2. Sessions (count)
3. % Total (percentage)
4. Bounce Rate (percentage)
5. Avg. Duration (time)

**Table Implementation**:
```tsx
<table style={{
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 'var(--occ-font-size-sm)',
}}>
  <thead style={{
    background: 'var(--occ-bg-secondary)',
    borderBottom: '2px solid var(--occ-border-default)',
  }}>
    <tr>
      <th style={{padding: 'var(--occ-space-3)', textAlign: 'left'}}>Source</th>
      <th style={{padding: 'var(--occ-space-3)', textAlign: 'right'}}>Sessions</th>
      <th style={{padding: 'var(--occ-space-3)', textAlign: 'right'}}>% Total</th>
      <th style={{padding: 'var(--occ-space-3)', textAlign: 'right'}}>Bounce Rate</th>
      <th style={{padding: 'var(--occ-space-3)', textAlign: 'right'}}>Avg. Duration</th>
    </tr>
  </thead>
  <tbody>
    {trafficData.map((row, index) => (
      <tr key={row.source} style={{
        borderBottom: '1px solid var(--occ-border-subdued)',
      }}>
        <td style={{padding: 'var(--occ-space-3)'}}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--occ-space-2)',
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: row.color,
            }} />
            {row.source}
          </span>
        </td>
        <td style={{padding: 'var(--occ-space-3)', textAlign: 'right'}}>
          {row.sessions.toLocaleString()}
        </td>
        <td style={{padding: 'var(--occ-space-3)', textAlign: 'right'}}>
          {row.percentage}%
        </td>
        <td style={{padding: 'var(--occ-space-3)', textAlign: 'right'}}>
          {row.bounceRate}%
        </td>
        <td style={{padding: 'var(--occ-space-3)', textAlign: 'right'}}>
          {row.avgDuration}
        </td>
      </tr>
    ))}
    {/* Totals Row */}
    <tr style={{
      background: 'var(--occ-bg-secondary)',
      fontWeight: 'var(--occ-font-weight-semibold)',
    }}>
      <td style={{padding: 'var(--occ-space-3)'}}>Total</td>
      <td style={{padding: 'var(--occ-space-3)', textAlign: 'right'}}>8,247</td>
      <td style={{padding: 'var(--occ-space-3)', textAlign: 'right'}}>100%</td>
      <td style={{padding: 'var(--occ-space-3)', textAlign: 'right'}}>49.2%</td>
      <td style={{padding: 'var(--occ-space-3)', textAlign: 'right'}}>2m 15s</td>
    </tr>
  </tbody>
</table>
```

### Accessibility

- ✅ **Table Accessibility**: Proper `<table>`, `<thead>`, `<tbody>` structure
- ✅ **Scope Attributes**: `<th scope="col">` for column headers
- ✅ **Screen Reader**: Announces "Table with 5 rows and 5 columns"
- ✅ **Keyboard Navigation**: Tab through table, arrow keys may navigate cells
- ✅ **ARIA**: `aria-label="Traffic sources detailed breakdown table"`

---

## Modal 2: Conversion Funnel

### Visual Layout

```
┌───────────────────────────────────────────────────────────────┐
│  Conversion Funnel Analytics                             [×] │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  [ Last 30 days ▼ ]  [ All products ▼ ]     [Export CSV]    │
│                                                               │
│  ─────────────────────────────────────────────────────────────│
│                                                               │
│  Funnel Visualization (Vertical Bars with Drop-off %)        │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                                                          │ │
│  │  ████████  ███████   ██████   ████                      │ │
│  │  ████████  ███████   ██████   ████                      │ │
│  │  ████████  ███████   ██████   ████                      │ │
│  │  ████████  ███████   ██████   ████                      │ │
│  │  100%      78%       62%      48%                        │ │
│  │  8,247     6,433     5,113    3,958                     │ │
│  │  Views     Add Cart  Checkout Complete                  │ │
│  │            ↓22%      ↓16%     ↓14%                       │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ─────────────────────────────────────────────────────────────│
│                                                               │
│  Drop-off Analysis | Stage Performance                        │
│  ┌──────────────┐   ┌──────────────┐                         │
│  │ Biggest drops│   │ Best stages  │                         │
│  │ 1. View→Cart │   │ 1. Complete  │                         │
│  │    22% lost  │   │    48% rate  │                         │
│  │ 2. Cart→Chk  │   │ 2. Add Cart  │                         │
│  │    16% lost  │   │    78% rate  │                         │
│  └──────────────┘   └──────────────┘                         │
│                                                               │
│  ─────────────────────────────────────────────────────────────│
│                                                               │
│  Stage Details Table                                          │
│  ┌───────────┬───────┬─────────┬────────────┬─────────────┐  │
│  │Stage      │ Count │ % Total │ % of Prior │ Drop-off %  │  │
│  ├───────────┼───────┼─────────┼────────────┼─────────────┤  │
│  │Views      │ 8,247 │  100%   │    —       │     —       │  │
│  │Add Cart   │ 6,433 │   78%   │   78%      │    22%      │  │
│  │Checkout   │ 5,113 │   62%   │   80%      │    16%      │  │
│  │Complete   │ 3,958 │   48%   │   77%      │    14%      │  │
│  └───────────┴───────┴─────────┴────────────┴─────────────┘  │
│                                                               │
│                        [Close]    [Export CSV]                │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### Primary Chart: Funnel Bars

**Chart Type**: Vertical Bar Chart with Annotations

**Chart.js Configuration**:
```tsx
const funnelConfig = {
  type: 'bar',
  data: {
    labels: ['Product Views', 'Add to Cart', 'Checkout', 'Order Complete'],
    datasets: [{
      label: 'Conversions',
      data: [8247, 6433, 5113, 3958],
      backgroundColor: [
        'var(--occ-color-info)',      // Stage 1
        'var(--occ-color-success)',   // Stage 2
        'var(--occ-color-warning)',   // Stage 3
        'var(--occ-color-critical)',  // Stage 4 (final conversion)
      ],
      borderWidth: 0,
      barThickness: 80,
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const count = context.parsed.y;
            const percentage = ((count / 8247) * 100).toFixed(1);
            return [
              `Count: ${count.toLocaleString()}`,
              `${percentage}% of total`,
            ];
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 12 },
          color: 'var(--occ-text-primary)',
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'var(--occ-border-subdued)',
          borderDash: [2, 2],
        },
        ticks: {
          font: { size: 12 },
          color: 'var(--occ-text-secondary)',
          callback: (value) => value.toLocaleString(),
        }
      }
    }
  }
};
```

### Drop-off Annotations

**Below each bar**: Show drop-off percentage

```tsx
// Custom plugin or text below chart
<div style={{
  display: 'flex',
  justifyContent: 'space-around',
  marginTop: 'var(--occ-space-2)',
  fontSize: 'var(--occ-font-size-xs)',
  color: 'var(--occ-text-critical)',
}}>
  <span>—</span>
  <span>↓ 22%</span>
  <span>↓ 16%</span>
  <span>↓ 14%</span>
</div>
```

### Section 4: Data Table

**Columns**:
1. Stage
2. Count
3. % of Total
4. % of Prior Stage
5. Drop-off %

**Calculations**:
- % of Total: `(stageCount / totalViews) * 100`
- % of Prior: `(stageCount / priorStageCount) * 100`
- Drop-off %: `100 - (stageCount / priorStageCount) * 100`

### Accessibility

- ✅ **Chart ARIA**: `aria-label="Conversion funnel chart showing 4 stages with drop-offs"`
- ✅ **Table Accessibility**: Full semantic table structure
- ✅ **Drop-off Indicators**: Text + icons (not color-only)
- ✅ **Screen Reader**: Announces all data clearly

---

## Modal 3: Top Products

### Visual Layout

```
┌───────────────────────────────────────────────────────────────┐
│  Top Products Analytics                                  [×] │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  [ Last 30 days ▼ ]  [ Sort by Revenue ▼ ]  [Export CSV]    │
│                                                               │
│  ─────────────────────────────────────────────────────────────│
│                                                               │
│  Revenue by Product (Horizontal Bar Chart - Top 10)          │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Product A      ████████████████████████ $45,230         │ │
│  │ Product B      ████████████████ $32,108                 │ │
│  │ Product C      ████████████ $24,567                     │ │
│  │ Product D      ████████ $15,420                         │ │
│  │ Product E      ████ $8,980                              │ │
│  │ Product F      ███ $7,550                               │ │
│  │ Product G      ██ $5,230                                │ │
│  │ Product H      ██ $4,890                                │ │
│  │ Product I      █ $3,120                                 │ │
│  │ Product J      █ $2,450                                 │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ─────────────────────────────────────────────────────────────│
│                                                               │
│  Units Sold (Line Chart) | Revenue Trend (Area Chart)        │
│  ┌──────────────┐           ┌──────────────┐                 │
│  │   [Line]     │           │   [Area]     │                 │
│  │   trending   │           │   trending   │                 │
│  │   upward     │           │   upward     │                 │
│  └──────────────┘           └──────────────┘                 │
│                                                               │
│  ─────────────────────────────────────────────────────────────│
│                                                               │
│  Product Details Table                                        │
│  ┌────────┬──────┬─────────┬──────────┬────────┬──────────┐  │
│  │Product │ SKU  │ Revenue │ Units    │ AOV    │ % of Rev│  │
│  ├────────┼──────┼─────────┼──────────┼────────┼──────────┤  │
│  │Prod A  │ A001 │ $45,230 │   523    │ $86.50 │  36.4%  │  │
│  │Prod B  │ B002 │ $32,108 │   412    │ $77.95 │  25.8%  │  │
│  │Prod C  │ C003 │ $24,567 │   305    │ $80.55 │  19.8%  │  │
│  │...     │ ...  │   ...   │   ...    │  ...   │   ...   │  │
│  └────────┴──────┴─────────┴──────────┴────────┴──────────┘  │
│                                                               │
│                        [Close]    [Export CSV]                │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### Primary Chart: Top Products Bar

**Dimensions**: 100% width × 400px height (10 products)

**Chart.js Configuration**:
```tsx
const topProductsConfig = {
  type: 'bar',
  data: {
    labels: ['Product A', 'Product B', 'Product C', 'Product D', 'Product E', 
             'Product F', 'Product G', 'Product H', 'Product I', 'Product J'],
    datasets: [{
      label: 'Revenue',
      data: [45230, 32108, 24567, 15420, 8980, 7550, 5230, 4890, 3120, 2450],
      backgroundColor: 'var(--occ-color-success)',
      borderWidth: 0,
      barThickness: 32,
    }]
  },
  options: {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const revenue = context.parsed.x;
            return `Revenue: $${revenue.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        beginAtZero: true,
        ticks: {
          callback: (value) => '$' + (value / 1000).toFixed(0) + 'K',
          font: { size: 11 },
          color: 'var(--occ-text-secondary)',
        },
        grid: {
          color: 'var(--occ-border-subdued)',
          borderDash: [2, 2],
        }
      },
      y: {
        grid: { display: false },
        ticks: {
          font: { size: 12 },
          color: 'var(--occ-text-primary)',
          callback: (value, index) => {
            const label = this.getLabelForValue(value);
            return label.length > 20 ? label.substring(0, 17) + '...' : label;
          }
        }
      }
    }
  }
};
```

### Secondary Charts

**Chart 1: Units Sold Trend** (Line Chart):
```tsx
const unitsSoldConfig = {
  type: 'line',
  data: {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{
      label: 'Units Sold',
      data: [2340, 2520, 2680, 2790],
      borderColor: 'var(--occ-color-info)',
      backgroundColor: 'transparent',
      tension: 0.4,
      borderWidth: 2,
      pointRadius: 4,
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Units Sold Trend',
        font: { size: 14, weight: 'semibold' },
        color: 'var(--occ-text-primary)',
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 }, color: 'var(--occ-text-secondary)' }
      },
      y: {
        beginAtZero: true,
        grid: { color: 'var(--occ-border-subdued)', borderDash: [2, 2] },
        ticks: { font: { size: 10 }, color: 'var(--occ-text-secondary)' }
      }
    }
  }
};
```

**Chart 2: Revenue Trend** (Area Chart):
```tsx
const revenueTrendConfig = {
  type: 'line',
  data: {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{
      label: 'Revenue',
      data: [98400, 105200, 112300, 118500],
      borderColor: 'var(--occ-color-success)',
      backgroundColor: 'rgba(0, 128, 96, 0.1)', // Transparent success color
      fill: true, // Area chart
      tension: 0.4,
      borderWidth: 2,
      pointRadius: 4,
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Revenue Trend',
        font: { size: 14, weight: 'semibold' },
        color: 'var(--occ-text-primary)',
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 }, color: 'var(--occ-text-secondary)' }
      },
      y: {
        beginAtZero: true,
        ticks: {
          font: { size: 10 },
          color: 'var(--occ-text-secondary)',
          callback: (value) => '$' + (value / 1000).toFixed(0) + 'K',
        },
        grid: { color: 'var(--occ-border-subdued)', borderDash: [2, 2] }
      }
    }
  }
};
```

### Data Table

**Columns**:
1. Product Name (truncated if long)
2. SKU
3. Revenue (formatted currency)
4. Units Sold
5. Average Order Value (AOV)
6. % of Total Revenue

**Sorting**: Click column headers to sort

**Pagination**: Show 10 rows per page, paginate if > 10 products

### Accessibility

- ✅ **Multiple Charts**: Each chart has unique aria-label
- ✅ **Table Sorting**: Announce "Sorted by Revenue, ascending" to screen readers
- ✅ **Pagination**: Keyboard accessible page navigation
- ✅ **Data Access**: All data in table, not just charts

---

## Modal 4: Customer Segments (RFM)

### Visual Layout

```
┌───────────────────────────────────────────────────────────────┐
│  Customer Segments (RFM) Analytics                       [×] │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  [ Last 30 days ▼ ]  [ All segments ▼ ]     [Export CSV]    │
│                                                               │
│  ─────────────────────────────────────────────────────────────│
│                                                               │
│  Segment Distribution (Horizontal Stacked Bar - 100%)        │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ ████████ 35% Champions                                  │ │
│  │ █████ 22% Loyal                                         │ │
│  │ ████ 18% Potential                                      │ │
│  │ ███ 15% At Risk                                         │ │
│  │ ██ 10% Hibernating                                      │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ─────────────────────────────────────────────────────────────│
│                                                               │
│  RFM Heatmap | Segment Value                                 │
│  ┌──────────────┐   ┌──────────────┐                         │
│  │ R F M matrix │   │ Revenue split│                         │
│  │ [5][5] grid  │   │ by segment   │                         │
│  │ color-coded  │   │ [Donut]      │                         │
│  └──────────────┘   └──────────────┘                         │
│                                                               │
│  ─────────────────────────────────────────────────────────────│
│                                                               │
│  Segment Details Table                                        │
│  ┌───────────┬───────┬─────────┬──────────┬────────┬───────┐ │
│  │Segment    │ Count │ % Total │ Revenue  │ AOV    │ LTV   │ │
│  ├───────────┼───────┼─────────┼──────────┼────────┼───────┤ │
│  │Champions  │  647  │  35%    │ $98,450  │ $152   │ $890  │ │
│  │Loyal      │  406  │  22%    │ $54,320  │ $134   │ $720  │ │
│  │Potential  │  332  │  18%    │ $28,560  │ $86    │ $340  │ │
│  │At Risk    │  277  │  15%    │ $18,720  │ $68    │ $210  │ │
│  │Hibernating│  185  │  10%    │  $8,950  │ $48    │ $150  │ │
│  │Total      │ 1,847 │ 100%    │$209,000  │ $113   │ $562  │ │
│  └───────────┴───────┴─────────┴──────────┴────────┴───────┘ │
│                                                               │
│                        [Close]    [Export CSV]                │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### Primary Chart: Segment Distribution

**Chart Type**: Horizontal Stacked Bar (100% width)

**Chart.js Configuration**:
```tsx
const segmentDistConfig = {
  type: 'bar',
  data: {
    labels: ['Customer Base'],
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
        backgroundColor: '#FF8C42',
      },
      {
        label: 'Hibernating',
        data: [10],
        backgroundColor: 'var(--occ-text-secondary)',
      }
    ]
  },
  options: {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          font: { size: 12 },
          color: 'var(--occ-text-primary)',
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label;
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
        max: 100,
        ticks: {
          callback: (value) => value + '%',
          font: { size: 12 },
          color: 'var(--occ-text-secondary)',
        }
      },
      y: {
        stacked: true,
        display: false,
      }
    }
  }
};
```

### Secondary Charts

**Chart 1: RFM Heatmap** (Custom implementation or matrix visualization)
**Chart 2: Segment Value** (Doughnut showing revenue distribution)

**Segment Value Chart**:
```tsx
const segmentValueConfig = {
  type: 'doughnut',
  data: {
    labels: ['Champions', 'Loyal', 'Potential', 'At Risk', 'Hibernating'],
    datasets: [{
      data: [98450, 54320, 28560, 18720, 8950], // Revenue per segment
      backgroundColor: [
        'var(--occ-color-success)',
        'var(--occ-color-info)',
        'var(--occ-color-warning)',
        '#FF8C42',
        'var(--occ-text-secondary)',
      ],
      borderWidth: 0,
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    cutout: '50%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { size: 11 },
          color: 'var(--occ-text-primary)',
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label;
            const value = context.parsed;
            const percentage = ((value / 209000) * 100).toFixed(1);
            return `${label}: $${value.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    }
  }
};
```

### Data Table

**Columns**:
1. Segment Name
2. Customer Count
3. % of Total
4. Total Revenue
5. Average Order Value (AOV)
6. Lifetime Value (LTV)

**Metrics**:
- **AOV**: Total Revenue / Orders
- **LTV**: Estimated lifetime value per customer
- **% of Total**: Customer count percentage

### Accessibility

- ✅ **Stacked Bar**: ARIA label lists all segments with percentages
- ✅ **Heatmap Alternative**: Data table provides same information
- ✅ **Table Sorting**: Keyboard accessible, announces sort order
- ✅ **Screen Reader**: Full data accessible via table

---

## Shared Modal Patterns

### Filter Controls

**Date Range Picker**:
```tsx
<Select
  label="Date Range"
  options={[
    { label: 'Last 7 days', value: '7d' },
    { label: 'Last 30 days', value: '30d' },
    { label: 'Last 90 days', value: '90d' },
    { label: 'Year to date', value: 'ytd' },
    { label: 'Custom range', value: 'custom' },
  ]}
  value={dateRange}
  onChange={handleDateRangeChange}
/>
```

**Custom Date Range** (if selected):
```tsx
{dateRange === 'custom' && (
  <InlineStack gap="200">
    <TextField
      label="Start Date"
      type="date"
      value={startDate}
      onChange={setStartDate}
    />
    <TextField
      label="End Date"
      type="date"
      value={endDate}
      onChange={setEndDate}
    />
  </InlineStack>
)}
```

### Export to CSV

**Button Implementation**:
```tsx
<Button
  variant="primary"
  onClick={handleExportCSV}
>
  Export CSV
</Button>
```

**Export Function**:
```tsx
const handleExportCSV = () => {
  const csv = convertToCSV(tableData);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `analytics-${modalType}-${dateRange}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};
```

### Loading States

**Skeleton Chart** (while loading):
```tsx
{isLoading && (
  <div style={{
    width: '100%',
    height: '300px',
    background: 'var(--occ-bg-secondary)',
    borderRadius: 'var(--occ-radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}>
    <Spinner size="large" />
    <Text variant="bodySm" tone="subdued">
      Loading analytics data...
    </Text>
  </div>
)}
```

### Error States

**Error Message**:
```tsx
{error && (
  <Banner tone="critical" title="Failed to load analytics">
    <Text variant="bodyMd">
      {error.message}
    </Text>
    <Button onClick={handleRetry}>
      Retry
    </Button>
  </Banner>
)}
```

---

## Chart.js Advanced Configurations

### Comparison Charts (Before/After)

**Dual Y-Axis Line Chart**:
```tsx
const comparisonConfig = {
  type: 'line',
  data: {
    labels: days,
    datasets: [
      {
        label: 'Current Period',
        data: currentData,
        borderColor: 'var(--occ-color-success)',
        yAxisID: 'y',
      },
      {
        label: 'Previous Period',
        data: previousData,
        borderColor: 'var(--occ-text-secondary)',
        borderDash: [5, 5], // Dashed line for comparison
        yAxisID: 'y',
      }
    ]
  },
  options: {
    scales: {
      y: {
        type: 'linear',
        position: 'left',
        title: {
          display: true,
          text: 'Sessions',
        }
      }
    }
  }
};
```

### Stacked Area Charts

**Revenue by Channel Over Time**:
```tsx
const stackedAreaConfig = {
  type: 'line',
  data: {
    labels: weeks,
    datasets: [
      {
        label: 'Organic',
        data: organicData,
        fill: true,
        backgroundColor: 'rgba(0, 128, 96, 0.5)',
        borderColor: 'var(--occ-color-success)',
        borderWidth: 1,
      },
      {
        label: 'Paid',
        data: paidData,
        fill: true,
        backgroundColor: 'rgba(255, 191, 71, 0.5)',
        borderColor: 'var(--occ-color-warning)',
        borderWidth: 1,
      },
      // ... other channels
    ]
  },
  options: {
    scales: {
      y: {
        stacked: true, // Stack areas
      }
    }
  }
};
```

### Mixed Chart Types

**Bar + Line Overlay** (Target vs Actual):
```tsx
const mixedConfig = {
  type: 'bar',
  data: {
    labels: months,
    datasets: [
      {
        type: 'bar',
        label: 'Actual Revenue',
        data: actualRevenue,
        backgroundColor: 'var(--occ-color-success)',
      },
      {
        type: 'line',
        label: 'Target Revenue',
        data: targetRevenue,
        borderColor: 'var(--occ-text-secondary)',
        borderDash: [5, 5],
        borderWidth: 2,
        fill: false,
      }
    ]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      tooltip: { mode: 'index', intersect: false }
    }
  }
};
```

---

## Table Component Specifications

### Polaris DataTable

**Basic Usage**:
```tsx
import { DataTable } from '@shopify/polaris';

<DataTable
  columnContentTypes={[
    'text',      // Product
    'text',      // SKU
    'numeric',   // Revenue
    'numeric',   // Units
    'numeric',   // AOV
    'numeric',   // % of Revenue
  ]}
  headings={[
    'Product',
    'SKU',
    'Revenue',
    'Units Sold',
    'AOV',
    '% of Revenue',
  ]}
  rows={productRows.map(row => [
    row.product,
    row.sku,
    `$${row.revenue.toLocaleString()}`,
    row.units.toLocaleString(),
    `$${row.aov.toFixed(2)}`,
    `${row.percentage.toFixed(1)}%`,
  ])}
  totals={[
    'Total',
    '—',
    `$${totalRevenue.toLocaleString()}`,
    totalUnits.toLocaleString(),
    `$${avgAOV.toFixed(2)}`,
    '100%',
  ]}
  showTotalsInFooter
  sortable={[true, true, true, true, true, true]}
  defaultSortDirection="descending"
  initialSortColumnIndex={2} // Sort by revenue by default
  onSort={handleSort}
/>
```

### Custom Styled Table (if Polaris DataTable insufficient)

**Structure**:
```tsx
<div style={{overflowX: 'auto'}}>
  <table style={{
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 'var(--occ-font-size-sm)',
  }}>
    <thead>
      <tr>
        {columns.map(col => (
          <th
            key={col.key}
            onClick={() => handleSort(col.key)}
            style={{
              padding: 'var(--occ-space-3)',
              textAlign: col.align || 'left',
              background: 'var(--occ-bg-secondary)',
              borderBottom: '2px solid var(--occ-border-default)',
              cursor: col.sortable ? 'pointer' : 'default',
              fontWeight: 'var(--occ-font-weight-semibold)',
            }}
          >
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--occ-space-1)',
            }}>
              {col.label}
              {col.sortable && sortColumn === col.key && (
                <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
              )}
            </span>
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {rows.map((row, index) => (
        <tr
          key={index}
          style={{
            borderBottom: '1px solid var(--occ-border-subdued)',
            ':hover': { background: 'var(--occ-bg-hover)' }
          }}
        >
          {columns.map(col => (
            <td
              key={col.key}
              style={{
                padding: 'var(--occ-space-3)',
                textAlign: col.align || 'left',
              }}
            >
              {row[col.key]}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
    <tfoot style={{
      background: 'var(--occ-bg-secondary)',
      fontWeight: 'var(--occ-font-weight-semibold)',
    }}>
      <tr>
        {totals.map((total, index) => (
          <td
            key={index}
            style={{
              padding: 'var(--occ-space-3)',
              textAlign: columns[index].align || 'left',
              borderTop: '2px solid var(--occ-border-default)',
            }}
          >
            {total}
          </td>
        ))}
      </tr>
    </tfoot>
  </table>
</div>
```

### Table Accessibility

- ✅ **Semantic HTML**: `<table>`, `<thead>`, `<tbody>`, `<tfoot>`
- ✅ **Scope Attributes**: `<th scope="col">` for headers
- ✅ **Caption**: `<caption>` for table description
- ✅ **Sortable Headers**: Announce sort state to screen readers
- ✅ **Keyboard Navigation**: Tab through cells, Enter to sort
- ✅ **ARIA**: `aria-sort="ascending"` on sorted columns

---

## Mobile Responsiveness

### Modal Adaptations (< 768px)

**Changes for Mobile**:
1. **Modal Size**: Full-screen on mobile (Polaris default)
2. **Charts**: Reduce height for mobile
   - Desktop: 300px
   - Mobile: 200px
3. **Tables**: Horizontal scroll if needed
4. **Filters**: Stack vertically instead of horizontal
5. **Secondary Charts**: Stack vertically (1 column instead of 2)

**Media Query Implementation**:
```tsx
const { smUp } = useBreakpoints(); // Polaris hook

// Chart height
const chartHeight = smUp ? 300 : 200;

// Secondary charts layout
const columnsConfig = smUp ? 2 : 1;

return (
  <Modal size={smUp ? 'large' : 'small'}>
    {/* Filter controls */}
    <BlockStack gap="300">
      {/* Stack on mobile, inline on desktop */}
      {smUp ? (
        <InlineStack gap="300">
          <DateRangePicker />
          <SegmentFilter />
        </InlineStack>
      ) : (
        <BlockStack gap="300">
          <DateRangePicker />
          <SegmentFilter />
        </BlockStack>
      )}
    </BlockStack>
    
    {/* Charts */}
    <div style={{height: chartHeight}}>
      <canvas id="main-chart" />
    </div>
    
    {/* Secondary charts */}
    <InlineGrid columns={columnsConfig} gap="400">
      <canvas id="chart-2" />
      <canvas id="chart-3" />
    </InlineGrid>
  </Modal>
);
```

---

## Accessibility Compliance (WCAG 2.2 AA)

### Modal Accessibility

**Focus Management**:
- ✅ Focus trapped within modal when open
- ✅ Escape key closes modal
- ✅ Focus returns to trigger button on close
- ✅ Initial focus on first interactive element (filter or close button)

**Keyboard Navigation**:
- ✅ Tab through filters, charts (if interactive), table cells
- ✅ Arrow keys navigate table rows/columns (optional enhancement)
- ✅ Enter/Space activates buttons and selects
- ✅ Escape closes modal

**ARIA Attributes**:
```tsx
<Modal
  open={isOpen}
  onClose={onClose}
  title="Traffic Sources Analytics"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">Traffic Sources Analytics</h2>
  <div id="modal-description">
    Detailed breakdown of traffic sources with trends and metrics
  </div>
  {/* Modal content */}
</Modal>
```

### Chart Accessibility

**Each Chart**:
```tsx
<div style={{position: 'relative'}}>
  <canvas
    id="traffic-trend-chart"
    aria-label="Traffic trend line chart showing organic, paid, social, and direct channels over 7 days"
    role="img"
  />
  
  {/* Accessible data table (visually hidden) */}
  <table style={{position: 'absolute', left: '-9999px'}} aria-label="Traffic trend data">
    <caption>Traffic sources by day</caption>
    <thead>
      <tr>
        <th scope="col">Day</th>
        <th scope="col">Organic</th>
        <th scope="col">Paid</th>
        <th scope="col">Social</th>
        <th scope="col">Direct</th>
      </tr>
    </thead>
    <tbody>
      {data.map((day, index) => (
        <tr key={index}>
          <th scope="row">{day.label}</th>
          <td>{day.organic}</td>
          <td>{day.paid}</td>
          <td>{day.social}</td>
          <td>{day.direct}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

### Table Accessibility

**Sortable Headers**:
```tsx
<th
  scope="col"
  onClick={() => handleSort('revenue')}
  aria-sort={sortColumn === 'revenue' ? sortDirection : 'none'}
  tabIndex={0}
  onKeyPress={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleSort('revenue');
    }
  }}
  style={{cursor: 'pointer'}}
>
  Revenue
  {sortColumn === 'revenue' && (
    <span aria-hidden="true">
      {sortDirection === 'asc' ? ' ↑' : ' ↓'}
    </span>
  )}
</th>
```

**Screen Reader Announcements**:
```tsx
// Announce sort changes
const handleSort = (column: string) => {
  const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
  setSortColumn(column);
  setSortDirection(newDirection);
  
  // Announce to screen reader
  announceToScreenReader(
    `Table sorted by ${column}, ${newDirection === 'asc' ? 'ascending' : 'descending'}`
  );
};
```

---

## Performance Optimization

### Chart Lazy Loading

**Intersection Observer** (only render visible charts):
```tsx
const chartRef = useRef<HTMLCanvasElement>(null);
const [isVisible, setIsVisible] = useState(false);

useEffect(() => {
  if (!chartRef.current) return;
  
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    },
    { threshold: 0.1 }
  );
  
  observer.observe(chartRef.current);
  
  return () => observer.disconnect();
}, []);

// Only render chart when visible
{isVisible && <Chart data={data} config={config} />}
```

### Data Pagination

**Large Tables** (> 50 rows):
```tsx
const [currentPage, setCurrentPage] = useState(1);
const rowsPerPage = 20;

const paginatedRows = useMemo(() => {
  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  return allRows.slice(start, end);
}, [currentPage, allRows]);

// Pagination controls
<div style={{
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: 'var(--occ-space-4)',
}}>
  <Text variant="bodySm" tone="subdued">
    Showing {start + 1}-{Math.min(end, total)} of {total} rows
  </Text>
  
  <ButtonGroup>
    <Button
      disabled={currentPage === 1}
      onClick={() => setCurrentPage(p => p - 1)}
    >
      Previous
    </Button>
    <Button
      disabled={currentPage === totalPages}
      onClick={() => setCurrentPage(p => p + 1)}
    >
      Next
    </Button>
  </ButtonGroup>
</div>
```

### Memoization

**Expensive Calculations**:
```tsx
const chartData = useMemo(() => {
  return processAnalyticsData(rawData, dateRange);
}, [rawData, dateRange]);

const tableRows = useMemo(() => {
  return formatTableData(data, sortColumn, sortDirection);
}, [data, sortColumn, sortDirection]);
```

---

## Success Criteria

### Visual Design

- [ ] All 4 modals follow consistent layout pattern
- [ ] Charts large enough to read details
- [ ] Tables properly formatted with alignment
- [ ] Filters intuitive and accessible
- [ ] Export CSV button prominent
- [ ] OCC design tokens used throughout
- [ ] Hot Rodan brand voice (if applicable)

### Functionality

- [ ] Date range filter updates all charts and tables
- [ ] Segment filter narrows data correctly
- [ ] Export CSV downloads complete data
- [ ] Sort tables by clicking column headers
- [ ] Pagination works if > 20 rows
- [ ] Charts responsive to modal resize

### Accessibility

- [ ] WCAG 2.2 Level AA compliant (100%)
- [ ] All charts have aria-labels and data tables
- [ ] Tables have proper semantic HTML
- [ ] Sortable headers keyboard accessible
- [ ] Focus management in modal correct
- [ ] Screen reader announces all data

### Performance

- [ ] Charts render in < 1s (even with large datasets)
- [ ] Tables paginate if > 50 rows
- [ ] Lazy loading for below-fold charts
- [ ] No memory leaks (destroy charts on modal close)
- [ ] CSV export < 3s for up to 10,000 rows

---

## Implementation Notes

### Data API Contracts

**Analytics API Response**:
```tsx
interface AnalyticsResponse {
  dateRange: {
    start: string; // ISO date
    end: string;   // ISO date
  };
  summary: {
    totalSessions: number;
    totalRevenue: number;
    conversionRate: number;
    avgOrderValue: number;
  };
  chartData: {
    labels: string[];
    datasets: ChartDataset[];
  };
  tableData: TableRow[];
}
```

### State Management

**Modal State**:
```tsx
const [isOpen, setIsOpen] = useState(false);
const [dateRange, setDateRange] = useState('7d');
const [channelFilter, setChannelFilter] = useState('all');
const [sortColumn, setSortColumn] = useState('revenue');
const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
const [currentPage, setCurrentPage] = useState(1);
```

**Fetcher for Data Loading**:
```tsx
const fetcher = useFetcher<AnalyticsResponse>();

useEffect(() => {
  if (isOpen) {
    fetcher.load(`/api/analytics/traffic?range=${dateRange}&channel=${channelFilter}`);
  }
}, [isOpen, dateRange, channelFilter]);

const data = fetcher.data;
const isLoading = fetcher.state === 'loading';
```

---

## Chart.js Global Settings

### Theme Integration

**Dark Mode Support**:
```tsx
// Detect theme
const theme = document.documentElement.dataset.theme; // 'light' | 'dark'

// Chart colors adapt
const getChartColors = (theme: string) => ({
  text: theme === 'dark' ? '#E3E3E3' : '#202223',
  grid: theme === 'dark' ? '#404040' : '#E1E3E5',
  background: theme === 'dark' ? '#1A1A1A' : '#FFFFFF',
});

// Apply to chart
const colors = getChartColors(theme);
Chart.defaults.color = colors.text;
```

### Responsive Breakpoints

**Chart Height Adjustments**:
```tsx
const getChartHeight = (breakpoint: string, chartType: string) => {
  if (chartType === 'primary') {
    return breakpoint === 'sm' ? 200 : 300; // Mobile: 200px, Desktop: 300px
  }
  return breakpoint === 'sm' ? 150 : 200; // Secondary charts smaller
};
```

---

## File Structure

```
app/
├── components/
│   └── modals/
│       ├── analytics/
│       │   ├── TrafficSourcesModal.tsx
│       │   ├── ConversionFunnelModal.tsx
│       │   ├── TopProductsModal.tsx
│       │   ├── CustomerSegmentsModal.tsx
│       │   └── shared/
│       │       ├── AnalyticsFilters.tsx
│       │       ├── ChartContainer.tsx
│       │       ├── ExportCSVButton.tsx
│       │       └── AnalyticsTable.tsx
│       └── index.ts
├── hooks/
│   ├── useChartTheme.ts
│   ├── useAnalyticsData.ts
│   └── useTableSort.ts
└── routes/
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

**EOF — Analytics Modals Design Specifications Complete**


