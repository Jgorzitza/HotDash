# Production Launch Metrics Dashboard Specification

**Owner**: Product Agent  
**Task**: PRODUCT-022 (Subtask 6)  
**Status**: In Progress  
**Created**: 2025-10-23  

---

## Overview

This document specifies the UI/UX design for the Production Launch Metrics Dashboard, providing real-time visibility into adoption, satisfaction, feature usage, and business impact metrics.

---

## 1. Dashboard Layout

### Route
`/launch/metrics`

### Page Structure

```typescript
interface DashboardLayout {
  header: HeaderSection;
  kpiCards: KPICard[];
  adoptionSection: AdoptionMetricsSection;
  satisfactionSection: SatisfactionMetricsSection;
  usageSection: UsageMetricsSection;
  businessImpactSection: BusinessImpactSection;
  footer: FooterSection;
}
```

---

## 2. KPI Cards (Top Row)

### 2.1 DAU/MAU Ratio Card

**Component**: `<MetricCard />`

**Props**:
```typescript
{
  title: "DAU/MAU Ratio",
  value: "42%",
  target: "40%",
  trend: "up",
  trendValue: "+5%",
  status: "success", // success | warning | critical
  icon: "users"
}
```

**Visual Design**:
- Large number (42%) in center
- Small target indicator (Target: 40%)
- Trend arrow and percentage
- Color coding: Green (≥40%), Yellow (30-39%), Red (<30%)

---

### 2.2 New Signups Card

**Props**:
```typescript
{
  title: "New Signups (This Week)",
  value: "15",
  target: "10",
  trend: "up",
  trendValue: "+3 vs last week",
  status: "success"
}
```

---

### 2.3 NPS Score Card

**Props**:
```typescript
{
  title: "Net Promoter Score",
  value: "52",
  target: "50",
  trend: "stable",
  trendValue: "0",
  status: "success",
  breakdown: {
    promoters: 60,
    passives: 32,
    detractors: 8
  }
}
```

**Visual Design**:
- NPS score prominently displayed
- Small bar chart showing promoters/passives/detractors distribution
- Tooltip on hover with detailed breakdown

---

### 2.4 ROI Card

**Props**:
```typescript
{
  title: "Return on Investment",
  value: "250%",
  target: "100%",
  trend: "up",
  trendValue: "+50%",
  status: "success",
  subtitle: "Month 3"
}
```

---

## 3. Adoption Metrics Section

### 3.1 Feature Adoption Curve

**Component**: `<LineChart />`

**Data Structure**:
```typescript
interface AdoptionCurveData {
  weeks: number[];
  features: {
    name: string;
    data: number[]; // adoption percentage by week
    target: number;
  }[];
}
```

**Chart Configuration**:
- X-axis: Weeks since launch (1-12)
- Y-axis: Adoption percentage (0-100%)
- Multiple lines for each feature
- Target lines (dashed) for each feature
- Legend with color coding
- Tooltips showing exact values

**Features Tracked**:
1. Dashboard (baseline - 100%)
2. Approval Queue
3. Action Queue
4. CX Agent
5. Inventory Management
6. Growth Engine

---

### 3.2 Activation Funnel

**Component**: `<FunnelChart />`

**Data Structure**:
```typescript
interface ActivationFunnelData {
  steps: {
    name: string;
    users: number;
    percentage: number;
  }[];
}
```

**Funnel Steps**:
1. Signup (100%)
2. Profile Setup (85%)
3. First Integration (70%)
4. View Dashboard (65%)
5. First Approval (60%)
6. First Workflow (55%)

**Visual Design**:
- Horizontal funnel chart
- Drop-off percentages between steps
- Click to drill down into cohort details

---

## 4. Satisfaction Metrics Section

### 4.1 NPS Trend Chart

**Component**: `<LineChart />`

**Data Structure**:
```typescript
interface NPSTrendData {
  periods: string[]; // weeks or months
  npsScores: number[];
  promoters: number[];
  passives: number[];
  detractors: number[];
}
```

**Chart Configuration**:
- Primary line: NPS score over time
- Secondary area chart: Promoters/Passives/Detractors distribution
- Target line at 50
- Tooltips with detailed breakdown

---

### 4.2 CSAT by Interaction Type

**Component**: `<BarChart />`

**Data Structure**:
```typescript
interface CSATByTypeData {
  interactionTypes: string[];
  averageRatings: number[];
  satisfactionRates: number[];
  totalRatings: number[];
}
```

**Interaction Types**:
- Approval Workflow
- CX Agent Interaction
- Support Ticket
- Feature Usage

**Visual Design**:
- Grouped bar chart
- Average rating (1-5) and satisfaction rate (% with 4-5)
- Color coding by satisfaction level
- Click to see detailed distribution

---

### 4.3 Sentiment Analysis

**Component**: `<PieChart />`

**Data Structure**:
```typescript
interface SentimentData {
  positive: number;
  neutral: number;
  negative: number;
  totalAnalyzed: number;
}
```

**Visual Design**:
- Pie chart with three segments
- Percentages and counts
- Trend indicator (improving/stable/declining)
- Click to see sample feedback

---

## 5. Usage Metrics Section

### 5.1 Feature Engagement Heatmap

**Component**: `<HeatmapChart />`

**Data Structure**:
```typescript
interface EngagementHeatmapData {
  features: string[];
  days: string[];
  engagementRates: number[][]; // 2D array
}
```

**Visual Design**:
- Rows: Features
- Columns: Days of week
- Color intensity: Engagement rate
- Tooltips with exact percentages

---

### 5.2 Power User Metrics

**Component**: `<MetricCard />` + `<ProgressBar />`

**Data Structure**:
```typescript
interface PowerUserMetrics {
  totalActiveUsers: number;
  powerUsers: number;
  powerUserRate: number;
  target: number;
  averageFeaturesUsed: number;
  averageWorkflowsPerWeek: number;
}
```

**Visual Design**:
- Power user percentage with progress bar
- Target indicator
- Breakdown of power user characteristics
- Trend over time (mini sparkline)

---

## 6. Business Impact Section

### 6.1 Revenue Impact Card

**Component**: `<MetricCard />` + `<StackedBarChart />`

**Data Structure**:
```typescript
interface RevenueImpactData {
  periods: string[];
  directRevenue: number[];
  attributedRevenueLift: number[];
  totalImpact: number[];
}
```

**Visual Design**:
- Total impact prominently displayed
- Stacked bar chart showing direct vs attributed revenue
- Trend line
- ROI calculation

---

### 6.2 Cost Savings Breakdown

**Component**: `<DonutChart />`

**Data Structure**:
```typescript
interface CostSavingsData {
  categories: {
    name: string;
    amount: number;
    percentage: number;
  }[];
  total: number;
}
```

**Categories**:
- Support Time Saved
- Manual Task Reduction
- Inventory Optimization
- Marketing Efficiency

**Visual Design**:
- Donut chart with category breakdown
- Total savings in center
- Tooltips with details

---

### 6.3 Time Savings Summary

**Component**: `<MetricCard />` + `<ComparisonChart />`

**Data Structure**:
```typescript
interface TimeSavingsData {
  tasks: {
    name: string;
    before: number; // hours
    after: number; // hours
    saved: number; // hours
    percentage: number; // reduction percentage
  }[];
  totalHoursSaved: number;
}
```

**Visual Design**:
- Total hours saved prominently displayed
- Before/after comparison bars for each task
- Percentage reduction labels

---

## 7. Real-Time Update Requirements

### 7.1 Update Frequency

**Metric Type** | **Update Frequency** | **Method**
---|---|---
KPI Cards | Every 5 minutes | Server-Sent Events (SSE)
Charts | Every 15 minutes | Polling
User Actions | Real-time | WebSocket
Alerts | Immediate | WebSocket

### 7.2 Data Refresh Strategy

```typescript
interface RefreshStrategy {
  kpiCards: {
    method: 'sse';
    interval: 300000; // 5 minutes
  };
  charts: {
    method: 'polling';
    interval: 900000; // 15 minutes
  };
  alerts: {
    method: 'websocket';
    immediate: true;
  };
}
```

---

## 8. Drill-Down Capabilities

### 8.1 KPI Card Drill-Down

**Click Action**: Navigate to detailed view

**Example**: DAU/MAU Card → `/launch/metrics/dau-mau`

**Detailed View Includes**:
- Historical trend (last 90 days)
- Cohort analysis
- User segmentation
- Export to CSV

---

### 8.2 Chart Drill-Down

**Click Action**: Show detailed modal or navigate to detail page

**Example**: Feature Adoption Curve → Click on "CX Agent" line

**Modal Shows**:
- Detailed adoption timeline
- User cohorts
- Adoption barriers (from feedback)
- Recommendations

---

### 8.3 Metric Filters

**Global Filters**:
- Date range selector
- User segment filter
- Feature filter
- Comparison mode (vs previous period)

**Filter Persistence**: Saved in URL query params

---

## 9. Alert System

### 9.1 Alert Types

**Alert** | **Trigger** | **Severity**
---|---|---
DAU/MAU drops below 30% | Real-time | Critical
NPS drops below 40 | Daily check | Warning
Activation rate < 50% | Weekly check | Warning
Feature abandonment > 30% | Weekly check | Warning
ROI < 100% (Month 3+) | Monthly check | Critical

### 9.2 Alert Display

**Component**: `<AlertBanner />`

**Props**:
```typescript
{
  severity: 'critical' | 'warning' | 'info';
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible: boolean;
}
```

**Visual Design**:
- Banner at top of dashboard
- Color coded by severity
- Action button (e.g., "View Details")
- Dismissible (persists dismissal in localStorage)

---

## 10. Export & Reporting

### 10.1 Export Options

**Formats**:
- CSV (raw data)
- PDF (formatted report)
- PNG (charts as images)

**Export Button**: Top-right corner of each section

**Export Includes**:
- Current data snapshot
- Date range
- Applied filters
- Metadata (export date, user)

---

### 10.2 Scheduled Reports

**Configuration**:
```typescript
interface ScheduledReport {
  frequency: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  sections: string[]; // which sections to include
  format: 'pdf' | 'csv';
  deliveryTime: string; // HH:MM
}
```

**Delivery Method**: Email with attachment

---

## 11. Mobile Responsiveness

### 11.1 Breakpoints

- Desktop: ≥ 1024px (full layout)
- Tablet: 768px - 1023px (2-column layout)
- Mobile: < 768px (single column, stacked)

### 11.2 Mobile Optimizations

- KPI cards: 2x2 grid on mobile
- Charts: Simplified versions with horizontal scroll
- Tables: Horizontal scroll with sticky first column
- Filters: Collapsible drawer

---

## 12. Accessibility

### 12.1 WCAG 2.2 AA Compliance

- Color contrast ratio ≥ 4.5:1
- Keyboard navigation support
- Screen reader labels
- Focus indicators
- Alt text for charts

### 12.2 Chart Accessibility

- Data tables as alternative to charts
- Keyboard navigation through data points
- Aria labels for all interactive elements
- High contrast mode support

---

## 13. Performance Requirements

### 13.1 Load Time Targets

- Initial page load: < 2 seconds
- Chart render: < 500ms
- Data refresh: < 1 second
- Export generation: < 5 seconds

### 13.2 Optimization Strategies

- Lazy load charts below fold
- Virtualize long lists
- Cache API responses (5 min TTL)
- Compress chart data
- Use CDN for static assets

---

## 14. Implementation Notes

### 14.1 Component Library

**Use Shopify Polaris components**:
- `<Card />` for metric cards
- `<DataTable />` for tabular data
- `<Badge />` for status indicators
- `<Banner />` for alerts
- `<Spinner />` for loading states

### 14.2 Charting Library

**Recommended**: Recharts (React-based, responsive)

**Alternative**: Chart.js (if Recharts doesn't meet needs)

### 14.3 State Management

**Use React Router 7 loaders** for data fetching:
```typescript
export async function loader() {
  const metrics = await getLaunchMetrics();
  return json({ metrics });
}
```

**Real-time updates**: Use `useRevalidator()` hook

---

## 15. Testing Requirements

### 15.1 Unit Tests

- Metric calculation functions
- Data transformation utilities
- Component rendering

### 15.2 Integration Tests

- API endpoint responses
- Data refresh mechanisms
- Export functionality

### 15.3 E2E Tests

- Dashboard load and render
- Filter interactions
- Drill-down navigation
- Export downloads

---

## Conclusion

This dashboard provides comprehensive visibility into production launch success, enabling data-driven decisions and continuous improvement. All metrics are actionable, with clear targets and drill-down capabilities for deeper analysis.


