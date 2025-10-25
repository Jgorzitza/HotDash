# Chart Library Integration

**Task:** ENG-077  
**Status:** Implemented  
**Last Updated:** 2025-01-24

## Overview

HotDash uses `@shopify/polaris-viz` for data visualization components. This provides consistent, accessible charts that match the Polaris design system.

## Installation

```bash
npm install @shopify/polaris-viz
```

**Version:** Latest (installed)

## Available Components

### Sparkline Charts

**Component:** `SparkLineChart`

**Use Case:** Trend indicators in tiles, compact visualizations

**Example:**
```tsx
import { SparkLineChart } from '@shopify/polaris-viz';

<SparkLineChart
  data={[
    { value: 100, key: 'Jan' },
    { value: 150, key: 'Feb' },
    { value: 120, key: 'Mar' },
    { value: 180, key: 'Apr' },
  ]}
  accessibilityLabel="Sales trend over 4 months"
/>
```

**Features:**
- Minimal design for small spaces
- No axes or labels (just the line)
- Perfect for dashboard tiles
- Accessible with aria-label

### Bar Charts

**Component:** `BarChart`

**Use Case:** Comparisons between categories

**Example:**
```tsx
import { BarChart } from '@shopify/polaris-viz';

<BarChart
  data={[
    {
      name: 'Sales',
      data: [
        { key: 'Product A', value: 1000 },
        { key: 'Product B', value: 1500 },
        { key: 'Product C', value: 800 },
      ],
    },
  ]}
  xAxisOptions={{ labelFormatter: (value) => value }}
  yAxisOptions={{ labelFormatter: (value) => `$${value}` }}
/>
```

**Features:**
- Vertical or horizontal orientation
- Multiple data series support
- Custom formatters for axes
- Interactive tooltips

### Line Charts

**Component:** `LineChart`

**Use Case:** Time series data, trends over time

**Example:**
```tsx
import { LineChart } from '@shopify/polaris-viz';

<LineChart
  data={[
    {
      name: 'Revenue',
      data: [
        { key: '2024-01', value: 5000 },
        { key: '2024-02', value: 6200 },
        { key: '2024-03', value: 5800 },
        { key: '2024-04', value: 7100 },
      ],
    },
  ]}
  xAxisOptions={{ labelFormatter: (value) => new Date(value).toLocaleDateString() }}
  yAxisOptions={{ labelFormatter: (value) => `$${value}` }}
/>
```

**Features:**
- Multiple lines support
- Area fill option
- Predictive line variant available
- Zoom and pan capabilities

### Donut Charts

**Component:** `DonutChart`

**Use Case:** Part-to-whole relationships, breakdowns

**Example:**
```tsx
import { DonutChart } from '@shopify/polaris-viz';

<DonutChart
  data={[
    { name: 'Direct', value: 4000 },
    { name: 'Organic', value: 3000 },
    { name: 'Paid', value: 2000 },
    { name: 'Social', value: 1000 },
  ]}
  labelFormatter={(value) => `$${value}`}
/>
```

**Features:**
- Center label support
- Custom colors
- Interactive segments
- Percentage or value display

## Additional Components

### Horizontal Bar Chart

**Component:** `HorizontalBarChart`

**Use Case:** Rankings, comparisons with long labels

```tsx
import { HorizontalBarChart } from '@shopify/polaris-viz';

<HorizontalBarChart
  data={[
    {
      name: 'Products',
      data: [
        { key: 'Premium Widget Pro', value: 1500 },
        { key: 'Standard Widget', value: 1200 },
        { key: 'Basic Widget', value: 800 },
      ],
    },
  ]}
/>
```

### Stacked Area Chart

**Component:** `StackedAreaChart`

**Use Case:** Cumulative trends, composition over time

```tsx
import { StackedAreaChart } from '@shopify/polaris-viz';

<StackedAreaChart
  data={[
    {
      name: 'Product A',
      data: [
        { key: 'Jan', value: 100 },
        { key: 'Feb', value: 150 },
      ],
    },
    {
      name: 'Product B',
      data: [
        { key: 'Jan', value: 80 },
        { key: 'Feb', value: 120 },
      ],
    },
  ]}
/>
```

### Combo Chart

**Component:** `ComboChart`

**Use Case:** Multiple metrics with different scales

```tsx
import { ComboChart } from '@shopify/polaris-viz';

<ComboChart
  data={[
    {
      name: 'Revenue',
      data: [{ key: 'Jan', value: 5000 }],
      type: 'bar',
    },
    {
      name: 'Conversion Rate',
      data: [{ key: 'Jan', value: 3.5 }],
      type: 'line',
    },
  ]}
/>
```

### Funnel Chart

**Component:** `FunnelChart`

**Use Case:** Conversion funnels, process steps

```tsx
import { FunnelChart } from '@shopify/polaris-viz';

<FunnelChart
  data={[
    { key: 'Visitors', value: 10000 },
    { key: 'Add to Cart', value: 2000 },
    { key: 'Checkout', value: 1000 },
    { key: 'Purchase', value: 500 },
  ]}
/>
```

## Provider Setup

Wrap your app with `PolarisVizProvider` for theme support:

```tsx
import { PolarisVizProvider } from '@shopify/polaris-viz';

function App() {
  return (
    <PolarisVizProvider>
      {/* Your app */}
    </PolarisVizProvider>
  );
}
```

## Styling

Import the Polaris Viz styles:

```tsx
import '@shopify/polaris-viz/build/esm/styles.css';
```

**Note:** Polaris Viz automatically inherits Polaris design tokens when used within a Polaris app.

## Accessibility

All Polaris Viz charts are accessible by default:

- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ ARIA labels
- ✅ High contrast mode
- ✅ Reduced motion support

**Best Practices:**
- Always provide `accessibilityLabel` prop
- Use descriptive labels for data points
- Provide alternative text for complex visualizations
- Test with screen readers

## Interactive Features

### Tooltips

All charts include interactive tooltips by default:

```tsx
<LineChart
  data={data}
  tooltipOptions={{
    renderTooltipContent: (data) => (
      <div>
        <strong>{data.key}</strong>
        <p>${data.value}</p>
      </div>
    ),
  }}
/>
```

### Hover States

Charts automatically highlight on hover:
- Bar segments highlight
- Line points enlarge
- Donut segments expand

### Click Events

Handle click events on chart elements:

```tsx
<BarChart
  data={data}
  onBarClick={(data) => {
    console.log('Clicked:', data);
  }}
/>
```

## Performance

### Optimization Tips

1. **Lazy Load Charts** - Only render visible charts
2. **Limit Data Points** - Keep datasets reasonable (< 1000 points)
3. **Use Sparklines** - For compact visualizations
4. **Memoize Data** - Prevent unnecessary re-renders

**Example:**
```tsx
import { useMemo } from 'react';

const chartData = useMemo(() => {
  return processData(rawData);
}, [rawData]);

<LineChart data={chartData} />
```

## Migration from Chart.js

If migrating from existing Chart.js components:

| Chart.js | Polaris Viz | Notes |
|----------|-------------|-------|
| `Line` | `LineChart` | Similar API |
| `Bar` | `BarChart` or `HorizontalBarChart` | Choose orientation |
| `Doughnut` | `DonutChart` | Same concept |
| Custom | `SparkLineChart` | New component |

**Benefits of Polaris Viz:**
- Better Polaris integration
- Built-in accessibility
- Consistent design tokens
- Smaller bundle size
- Better TypeScript support

## Common Patterns

### Tile with Sparkline

```tsx
<TileCard
  title="Sales Trend"
  tile={salesData}
  render={(data) => (
    <SparkLineChart
      data={data.trend}
      accessibilityLabel="Sales trend over last 7 days"
    />
  )}
/>
```

### Dashboard with Multiple Charts

```tsx
<Grid>
  <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
    <Card>
      <BarChart data={salesByProduct} />
    </Card>
  </Grid.Cell>
  
  <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
    <Card>
      <DonutChart data={trafficSources} />
    </Card>
  </Grid.Cell>
</Grid>
```

### Responsive Charts

Charts automatically resize to container:

```tsx
<div style={{ width: '100%', height: '300px' }}>
  <LineChart data={data} />
</div>
```

## Troubleshooting

### Chart Not Rendering

**Check:**
- PolarisVizProvider wraps app
- Styles imported
- Data format correct
- Container has dimensions

### TypeScript Errors

**Solution:**
```tsx
import type { DataSeries } from '@shopify/polaris-viz';

const data: DataSeries[] = [
  {
    name: 'Sales',
    data: [{ key: 'Jan', value: 100 }],
  },
];
```

### Performance Issues

**Solutions:**
- Reduce data points
- Use virtualization for large datasets
- Lazy load charts
- Memoize data transformations

## References

- Package: `@shopify/polaris-viz`
- Components: `node_modules/@shopify/polaris-viz/build/esm/components/`
- Styles: `@shopify/polaris-viz/build/esm/styles.css`
- Task: ENG-077 in TaskAssignment table

