# Microcopy Guide: Analytics UI (Phase 7-8)

**File:** `docs/specs/microcopy-analytics-ui.md`  
**Owner:** Content Agent  
**Version:** 1.0  
**Date:** 2025-10-21  
**Status:** Ready for Engineer Implementation  
**Reference:** Chart.js accessibility docs, Polaris EmptyState component  
**MCP Sources:** `/chartjs/chart.js` (tooltips), `/websites/polaris-react_shopify` (EmptyState)

---

## Purpose

Comprehensive microcopy for 4 analytics tiles and their detail modals (Phase 7-8). Includes chart labels, tooltips with accessibility support, empty states, and error messages following Chart.js and Polaris best practices.

---

## Analytics Tiles Overview

**4 Analytics Tiles:**
1. **Social Performance** - Social media metrics
2. **Ad Performance** - Google/Facebook Ads metrics  
3. **SEO Performance** - Search engine traffic metrics
4. **Content Performance** - Blog/content engagement metrics

**Each Tile Includes:**
- Tile title
- Key metric (large number)
- Trend indicator (up/down/neutral)
- Mini chart preview
- Click to open detail modal

---

## 1. Social Performance Tile

### 1.1 Tile Header

**Title:**
```
Social Performance
```

**Icon:** Social media icon (accessible)
```html
<Icon source={SocialIcon} accessibilityLabel="Social media performance metrics" />
```

### 1.2 Primary Metric

**Label:**
```
Total Engagement
```

**Value Format:**
```
{number}
```

**Examples:**
- "2,847" (if < 10,000)
- "12.4K" (if >= 10,000)
- "1.2M" (if >= 1,000,000)

**Trend Indicator:**
```
▲ {percentage}% vs last week
▼ {percentage}% vs last week
— No change
```

**Examples:**
- "▲ 15.2% vs last week" (green)
- "▼ 8.1% vs last week" (red)
- "— No change" (gray)

### 1.3 Mini Chart

**Chart Type:** Line chart (7-day trend)

**Chart Canvas Accessibility:**
```html
<canvas 
  id="social-performance-mini-chart" 
  role="img"
  aria-label="7-day social media engagement trend. Current engagement: {value}, up {percent}% from last week."
>
  <p>Social engagement trending up over the past 7 days. Current: {value} engagements.</p>
</canvas>
```

**Tooltip (Hover):**
```
{Day}: {value} engagements
```

**Example:**
```
Monday: 312 engagements
```

### 1.4 Empty State

**No Data Available:**
```
No social data yet

Connect social media accounts in Settings to track performance.

[Connect Accounts]
```

**Polaris EmptyState Pattern:**
```jsx
<EmptyState
  heading="No social data yet"
  action={{content: 'Connect Accounts', url: '/settings?tab=integrations'}}
  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
>
  <p>Connect social media accounts in Settings to track performance.</p>
</EmptyState>
```

### 1.5 Click Action

**CTA (Accessible):**
```html
<button
  className="occ-tile"
  onClick={openSocialModal}
  aria-label="View detailed social performance analytics"
>
  {/* Tile content */}
</button>
```

---

## 2. Social Performance Modal (Detail View)

### 2.1 Modal Header

**Title:**
```
Social Performance — Last 30 Days
```

**Close Button:**
```html
<button aria-label="Close social performance modal">Close</button>
```

### 2.2 Summary Metrics Section

**Section Header:**
```
Overview
```

**Metrics Grid:**
```
Total Posts: {count}
Total Engagement: {number}
Avg Engagement Rate: {percentage}%
Top Platform: {platform_name}
```

**Example:**
```
Overview

Total Posts: 42
Total Engagement: 8,547
Avg Engagement Rate: 4.2%
Top Platform: Instagram
```

### 2.3 Platform Breakdown Chart

**Chart Title:**
```
Engagement by Platform
```

**Chart Type:** Horizontal bar chart

**Chart Canvas Accessibility:**
```html
<canvas 
  id="platform-breakdown-chart"
  role="img"
  aria-label="Engagement by platform. Instagram: 4,200 engagements, Facebook: 2,800, Twitter: 1,100, LinkedIn: 447."
>
  <table>
    <caption>Engagement by Platform</caption>
    <thead>
      <tr><th>Platform</th><th>Engagements</th></tr>
    </thead>
    <tbody>
      <tr><td>Instagram</td><td>4,200</td></tr>
      <tr><td>Facebook</td><td>2,800</td></tr>
      <tr><td>Twitter</td><td>1,100</td></tr>
      <tr><td>LinkedIn</td><td>447</td></tr>
    </tbody>
  </table>
</canvas>
```

**Tooltip Configuration (Chart.js):**
```javascript
options: {
  plugins: {
    tooltip: {
      enabled: true,
      callbacks: {
        label: function(context) {
          return context.dataset.label + ': ' + 
                 context.parsed.x.toLocaleString() + ' engagements';
        }
      }
    }
  }
}
```

**Example Tooltip:**
```
Instagram: 4,200 engagements
```

### 2.4 Trend Chart

**Chart Title:**
```
30-Day Engagement Trend
```

**Chart Type:** Line chart

**Y-Axis Label:**
```
Engagements
```

**X-Axis Label:**
```
Date
```

**Chart Canvas Accessibility:**
```html
<canvas 
  id="social-trend-chart"
  role="img"
  aria-label="30-day social engagement trend showing steady growth from 150 to 320 daily engagements."
>
  <p>Social engagement has grown steadily over the past 30 days, from 150 to 320 daily engagements.</p>
</canvas>
```

**Tooltip Configuration:**
```javascript
options: {
  plugins: {
    tooltip: {
      callbacks: {
        title: function(context) {
          const date = new Date(context[0].label);
          return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          });
        },
        label: function(context) {
          return 'Engagements: ' + context.parsed.y.toLocaleString();
        }
      }
    }
  }
}
```

**Example Tooltip:**
```
Oct 15
Engagements: 287
```

### 2.5 Top Performing Posts

**Section Header:**
```
Top Performing Posts
```

**Table Headers:**
```
Post | Platform | Engagement | Date
```

**Row Format:**
```
{post_preview} | {platform_icon} {platform} | {engagement_count} | {date}
```

**Empty State:**
```
No posts in this period.

Posts will appear here once published.
```

---

## 3. Ad Performance Tile

### 3.1 Tile Header

**Title:**
```
Ad Performance
```

**Icon:**
```html
<Icon source={AnalyticsIcon} accessibilityLabel="Ad campaign performance metrics" />
```

### 3.2 Primary Metric

**Label:**
```
ROAS (Return on Ad Spend)
```

**Value Format:**
```
{ratio}:1
```

**Examples:**
- "4.2:1" (good - profitable)
- "0.8:1" (bad - losing money)
- "—" (no data)

**Benchmark Indicator:**
```
Target: 3:1 minimum
```

**Status Badge:**
- Above 3:1: "✓ On target" (green)
- Below 3:1: "⚠ Below target" (yellow)
- Below 1:1: "⚠ Critical" (red)

### 3.3 Mini Chart

**Chart Type:** Line chart (30-day ROAS trend)

**Chart Canvas Accessibility:**
```html
<canvas 
  id="ad-roas-mini-chart"
  role="img"
  aria-label="30-day ROAS trend. Current: 4.2 to 1, up from 3.8 to 1 last month."
>
  <p>ROAS has improved from 3.8:1 to 4.2:1 over the past 30 days.</p>
</canvas>
```

### 3.4 Empty State

**No Data:**
```
No ad data yet

Connect Google Ads or Facebook Ads in Settings to track campaign performance.

[Connect Ads Platform]
```

---

## 4. Ad Performance Modal (Detail View)

### 4.1 Modal Header

**Title:**
```
Ad Performance — Last 30 Days
```

### 4.2 Summary Metrics

**Section Header:**
```
Campaign Summary
```

**Metrics:**
```
Ad Spend: ${amount}
Revenue: ${amount}
ROAS: {ratio}:1
Conversions: {count}
```

**Example:**
```
Campaign Summary

Ad Spend: $2,847
Revenue: $11,956
ROAS: 4.2:1
Conversions: 187
```

### 4.3 ROAS Trend Chart

**Chart Title:**
```
30-Day ROAS Trend
```

**Y-Axis Label:**
```
ROAS (Return on Ad Spend)
```

**Target Line Label:**
```
Target (3:1)
```

**Chart Canvas Accessibility:**
```html
<canvas 
  id="roas-trend-chart"
  role="img"
  aria-label="30-day ROAS trend with 3:1 target line. Current ROAS: 4.2:1, consistently above target."
>
  <table>
    <caption>30-Day ROAS Performance</caption>
    <thead>
      <tr><th>Date</th><th>ROAS</th></tr>
    </thead>
    <tbody>
      <tr><td>Oct 1</td><td>3.8:1</td></tr>
      <!-- Data rows -->
      <tr><td>Oct 30</td><td>4.2:1</td></tr>
    </tbody>
  </table>
</canvas>
```

**Tooltip Configuration:**
```javascript
options: {
  plugins: {
    tooltip: {
      callbacks: {
        label: function(context) {
          return 'ROAS: ' + context.parsed.y.toFixed(1) + ':1';
        },
        footer: function(tooltipItems) {
          const roas = tooltipItems[0].parsed.y;
          if (roas >= 3) {
            return '✓ Above target';
          } else {
            return '⚠ Below target';
          }
        }
      }
    }
  }
}
```

**Example Tooltip:**
```
Oct 15
ROAS: 4.1:1
✓ Above target
```

### 4.4 Campaign Breakdown

**Section Header:**
```
Top Campaigns
```

**Table Headers:**
```
Campaign | Spend | Revenue | ROAS | Status
```

**Status Badges:**
- "Active" (green)
- "Paused" (yellow)
- "Ended" (gray)

---

## 5. SEO Performance Tile

### 5.1 Tile Header

**Title:**
```
SEO Performance
```

**Icon:**
```html
<Icon source={SearchIcon} accessibilityLabel="Search engine performance metrics" />
```

### 5.2 Primary Metric

**Label:**
```
Organic Traffic
```

**Value Format:**
```
{number} visits
```

**Examples:**
- "1,247 visits" (this week)
- "↑ 342" (change indicator)

**Trend:**
```
▲ {percentage}% vs last week
```

### 5.3 Mini Chart

**Chart Type:** Area chart (30-day organic traffic)

**Chart Canvas Accessibility:**
```html
<canvas 
  id="seo-traffic-mini-chart"
  role="img"
  aria-label="30-day organic traffic trend. Current week: 1,247 visits, up 22% from last week."
>
  <p>Organic traffic has increased 22% over the past 30 days, from 1,022 to 1,247 weekly visits.</p>
</canvas>
```

### 5.4 Empty State

**No Data:**
```
No SEO data yet

Connect Google Analytics in Settings to monitor organic traffic and keyword rankings.

[Connect Google Analytics]
```

---

## 6. SEO Performance Modal (Detail View)

### 6.1 Modal Header

**Title:**
```
SEO Performance — Last 90 Days
```

### 6.2 Summary Metrics

**Section Header:**
```
Traffic Overview
```

**Metrics:**
```
Organic Sessions: {number}
Avg Session Duration: {time}
Bounce Rate: {percentage}%
Top Landing Page: {url}
```

**Example:**
```
Traffic Overview

Organic Sessions: 14,782
Avg Session Duration: 2m 34s
Bounce Rate: 42.3%
Top Landing Page: /products/turbocharge-pro
```

### 6.3 Traffic Trend Chart

**Chart Title:**
```
90-Day Organic Traffic
```

**Y-Axis Label:**
```
Sessions
```

**X-Axis Label:**
```
Week
```

**Chart Canvas Accessibility:**
```html
<canvas 
  id="seo-traffic-chart"
  role="img"
  aria-label="90-day organic traffic showing steady growth. Week 1: 3,200 sessions, Week 13: 4,800 sessions, 50% growth overall."
>
  <table>
    <caption>90-Day Organic Traffic Growth</caption>
    <thead>
      <tr><th>Week</th><th>Sessions</th></tr>
    </thead>
    <tbody>
      <tr><td>Week 1</td><td>3,200</td></tr>
      <!-- Data rows -->
      <tr><td>Week 13</td><td>4,800</td></tr>
    </tbody>
  </table>
</canvas>
```

**Tooltip Configuration:**
```javascript
options: {
  plugins: {
    tooltip: {
      callbacks: {
        title: function(context) {
          return 'Week of ' + context[0].label;
        },
        label: function(context) {
          return 'Sessions: ' + context.parsed.y.toLocaleString();
        },
        footer: function(tooltipItems) {
          const current = tooltipItems[0].parsed.y;
          const previous = tooltipItems[0].dataIndex > 0 
            ? tooltipItems[0].dataset.data[tooltipItems[0].dataIndex - 1]
            : current;
          const change = ((current - previous) / previous * 100).toFixed(1);
          return 'WoW: ' + (change >= 0 ? '▲' : '▼') + Math.abs(change) + '%';
        }
      }
    }
  }
}
```

**Example Tooltip:**
```
Week of Oct 15
Sessions: 4,283
WoW: ▲ 12.4%
```

### 6.4 Top Keywords Table

**Section Header:**
```
Top Performing Keywords
```

**Table Headers:**
```
Keyword | Impressions | Clicks | CTR | Position
```

**Row Format:**
```
{keyword} | {impressions} | {clicks} | {ctr}% | #{position}
```

**Example:**
```
Top Performing Keywords

performance auto parts | 28,400 | 1,240 | 4.4% | #3
hot rod suspension kits | 12,800 | 890 | 7.0% | #1
vintage car restoration | 9,200 | 520 | 5.7% | #5
```

**Empty State:**
```
No keyword data available.

Keywords will appear here once Google Search Console is connected.
```

---

## 7. Ad Performance Modal (Full Detail)

### 7.1 Cost Per Acquisition Chart

**Chart Title:**
```
CPA Trend (Last 30 Days)
```

**Y-Axis Label:**
```
Cost Per Acquisition ($)
```

**Target Line:**
```
Target CPA
```

**Chart Canvas Accessibility:**
```html
<canvas 
  id="cpa-trend-chart"
  role="img"
  aria-label="30-day cost per acquisition trend with target line at $50. Current CPA: $42, below target."
>
  <p>CPA has decreased from $58 to $42 over 30 days, now $8 below target of $50.</p>
</canvas>
```

**Tooltip Configuration:**
```javascript
options: {
  plugins: {
    tooltip: {
      callbacks: {
        label: function(context) {
          const label = context.dataset.label || '';
          const value = '$' + context.parsed.y.toFixed(2);
          return label + ': ' + value;
        },
        afterLabel: function(context) {
          const target = 50; // Example target CPA
          const diff = context.parsed.y - target;
          if (diff < 0) {
            return '✓ $' + Math.abs(diff).toFixed(2) + ' below target';
          } else if (diff > 0) {
            return '⚠ $' + diff.toFixed(2) + ' above target';
          }
          return '— At target';
        }
      }
    }
  }
}
```

**Example Tooltip:**
```
Oct 20
Actual CPA: $42.00
✓ $8.00 below target
```

### 7.2 Conversion Funnel

**Section Header:**
```
Conversion Funnel
```

**Funnel Steps:**
```
Impressions → Clicks → Landing Page → Add to Cart → Purchase
```

**Format:**
```
{step_name}: {count} ({conversion_rate}%)
```

**Example:**
```
Conversion Funnel

Impressions: 284,000 (—)
Clicks: 8,520 (3.0%)
Landing Page: 7,254 (85.1%)
Add to Cart: 1,450 (20.0%)
Purchase: 362 (25.0%)
```

**Drop-off Labels:**
```
{percentage}% drop-off
```

---

## 8. Content Performance Tile

### 8.1 Tile Header

**Title:**
```
Content Performance
```

**Icon:**
```html
<Icon source={PageIcon} accessibilityLabel="Content and blog performance metrics" />
```

### 8.2 Primary Metric

**Label:**
```
Page Views (30d)
```

**Value:**
```
{number}
```

**Trend:**
```
▲ {percentage}% vs previous period
```

### 8.3 Mini Chart

**Chart Type:** Bar chart (top 5 pages)

**Chart Canvas Accessibility:**
```html
<canvas 
  id="content-performance-mini-chart"
  role="img"
  aria-label="Top 5 pages by views. Homepage: 8,200 views, Product guide: 4,100 views."
>
  <ol>
    <li>Homepage: 8,200 views</li>
    <li>Product Guide: 4,100 views</li>
    <li>How-to Install: 2,800 views</li>
    <li>About Us: 1,900 views</li>
    <li>Contact: 1,200 views</li>
  </ol>
</canvas>
```

---

## 9. Content Performance Modal (Detail View)

### 9.1 Modal Header

**Title:**
```
Content Performance — Last 90 Days
```

### 9.2 Summary Metrics

**Section Header:**
```
Content Metrics
```

**Metrics:**
```
Total Page Views: {number}
Unique Visitors: {number}
Avg Time on Page: {time}
Top Content Type: {type}
```

### 9.3 Page Views Chart

**Chart Title:**
```
90-Day Page Views by Content Type
```

**Chart Type:** Stacked bar chart

**Legend Labels:**
```
Product Pages
Blog Posts
Landing Pages
How-To Guides
```

**Chart Canvas Accessibility:**
```html
<canvas 
  id="content-type-chart"
  role="img"
  aria-label="90-day page views by content type. Product pages: 45,000 views, Blog posts: 28,000, Landing pages: 12,000, How-to guides: 8,000."
>
  <table>
    <caption>Page Views by Content Type</caption>
    <thead>
      <tr><th>Type</th><th>Views</th></tr>
    </thead>
    <tbody>
      <tr><td>Product Pages</td><td>45,000</td></tr>
      <tr><td>Blog Posts</td><td>28,000</td></tr>
      <tr><td>Landing Pages</td><td>12,000</td></tr>
      <tr><td>How-To Guides</td><td>8,000</td></tr>
    </tbody>
  </table>
</canvas>
```

**Tooltip Configuration:**
```javascript
options: {
  plugins: {
    tooltip: {
      mode: 'index',
      intersect: false,
      callbacks: {
        label: function(context) {
          const label = context.dataset.label || '';
          const value = context.parsed.y.toLocaleString() + ' views';
          return label + ': ' + value;
        },
        footer: function(tooltipItems) {
          let sum = 0;
          tooltipItems.forEach(function(tooltipItem) {
            sum += tooltipItem.parsed.y;
          });
          return 'Total: ' + sum.toLocaleString() + ' views';
        }
      }
    }
  }
}
```

**Example Tooltip:**
```
Week of Oct 15

Product Pages: 3,200 views
Blog Posts: 1,800 views
Landing Pages: 940 views
How-To Guides: 620 views

Total: 6,560 views
```

### 9.4 Top Content Table

**Section Header:**
```
Top Content (by engagement)
```

**Table Headers:**
```
Page Title | Views | Avg Time | Bounce Rate | Actions
```

**Sort Controls:**
```
Sort by: [Views ▼]
```

**Sort Options:**
- Views (high to low)
- Avg Time (high to low)
- Bounce Rate (low to high)
- Date Published (newest first)

---

## 10. Chart Accessibility Best Practices

### 10.1 Canvas Requirements

**Every Chart Must Have:**
```html
<canvas 
  id="{unique-id}"
  role="img"
  aria-label="{comprehensive chart description}"
>
  {fallback content - table or paragraph}
</canvas>
```

**Bad Example (❌ Inaccessible):**
```html
<canvas id="chart"></canvas>
```

**Good Example (✅ Accessible):**
```html
<canvas 
  id="revenue-chart"
  role="img"
  aria-label="7-day revenue trend showing growth from $8,200 to $11,400."
>
  <p>Revenue has grown 39% over the past 7 days.</p>
</canvas>
```

### 10.2 Tooltip Accessibility

**Default Tooltip (Screen Reader Announcement):**
```javascript
// Tooltip content is announced via aria-live region
callbacks: {
  label: function(context) {
    // Keep labels concise for screen reader
    return context.dataset.label + ': ' + 
           context.parsed.y.toLocaleString();
  }
}
```

**External HTML Tooltip (Better Accessibility):**
```javascript
external: function(context) {
  const tooltipEl = getOrCreateTooltip(context.chart);
  
  // Make tooltip accessible
  tooltipEl.setAttribute('role', 'tooltip');
  tooltipEl.setAttribute('aria-live', 'polite');
  
  // Populate content...
}
```

### 10.3 Chart Color Accessibility

**Color Contrast Requirements:**
- Text on background: Minimum 4.5:1 ratio (WCAG AA)
- Chart elements: Use patterns in addition to color
- Colorblind-friendly palette

**Recommended Palette:**
```javascript
const ACCESSIBLE_COLORS = {
  blue: '#0066CC',     // Safe for most
  orange: '#FF6600',   // High contrast
  green: '#00AA44',    // Deuteranopia-friendly
  red: '#CC0000',      // High contrast
  purple: '#7700BB',   // Distinct hue
  gray: '#666666'      // Neutral
};
```

### 10.4 Legend Accessibility

**Legend Labels:**
```javascript
options: {
  plugins: {
    legend: {
      labels: {
        generateLabels: function(chart) {
          // Ensure labels are descriptive
          // Include dataset info in label
        }
      }
    }
  }
}
```

**Screen Reader Announcement:**
```
Chart legend: {dataset1}, {dataset2}, {dataset3}
```

---

## 11. Empty States (All Analytics Tiles)

### 11.1 General Pattern

**Structure:**
```
[Icon]

{Heading}

{Explanation sentence}

[Primary CTA Button]
```

**Polaris EmptyState Example:**
```jsx
<EmptyState
  heading="No analytics data yet"
  action={{
    content: 'Connect Google Analytics',
    url: '/settings?tab=integrations'
  }}
  image="analytics-placeholder.svg"
>
  <p>Connect your analytics account to monitor performance and detect trends.</p>
</EmptyState>
```

### 11.2 Social Empty State

```
No social data yet

Connect social media accounts in Settings to track engagement, reach, and post performance.

[Connect Accounts →]
```

### 11.3 Ads Empty State

```
No ad data yet

Connect Google Ads or Facebook Ads to monitor campaign performance and ROAS.

[Connect Ad Platform →]
```

### 11.4 SEO Empty State

```
No SEO data yet

Connect Google Analytics and Search Console to track organic traffic and rankings.

[Connect Analytics →]
```

### 11.5 Content Empty State

```
No content data yet

Content performance will appear here once Google Analytics is connected.

[Connect Analytics →]
```

---

## 12. Error States

### 12.1 Connection Error

**Pattern:**
```
⚠ Connection error

Unable to fetch {data_type}. Check your {service} connection in Settings.

[Retry] [Go to Settings]
```

**Examples:**

**Social:**
```
⚠ Connection error

Unable to fetch social media data. Check your Publer connection in Settings.

[Retry] [Go to Settings]
```

**Ads:**
```
⚠ Connection error

Unable to fetch ad performance data. Check your Google Ads connection in Settings.

[Retry] [Go to Settings]
```

**SEO:**
```
⚠ Connection error

Unable to fetch analytics data. Check your Google Analytics connection in Settings.

[Retry] [Go to Settings]
```

### 12.2 Data Loading Error

**Pattern:**
```
⚠ Data unavailable

{Service} data temporarily unavailable. This may be due to:
• API rate limit reached
• Service maintenance
• Network connectivity issue

Try again in a few minutes.

[Retry Now]
```

### 12.3 Quota Exceeded

```
⚠ API quota exceeded

You've reached the daily {service} API quota. Data will refresh at midnight UTC.

Next refresh: {time_remaining}

[Learn More]
```

---

## 13. Loading States

### 13.1 Tile Loading

**Pattern:**
```
{Tile Title}

Loading...

[Skeleton UI - shimmer effect]
```

**Screen Reader Announcement:**
```html
<div aria-live="polite" aria-busy="true">
  Loading social performance data...
</div>
```

### 13.2 Chart Loading

**Pattern:**
```
[Chart skeleton placeholder]

Loading chart data...
```

**Accessible Loading:**
```html
<div 
  role="status" 
  aria-live="polite"
  aria-label="Loading chart data"
>
  <span className="sr-only">Loading...</span>
  {/* Skeleton UI */}
</div>
```

### 13.3 Modal Loading

**Full Modal Load:**
```
Loading detailed analytics...

This may take a few seconds for large datasets.

[Loading spinner]
```

---

## 14. Metric Definitions (Tooltips)

### 14.1 Complex Metrics Need Help

**ROAS (Return on Ad Spend):**
```html
<span className="metric-label">
  ROAS
  <button 
    className="help-icon"
    aria-label="What is ROAS?"
    onClick={showTooltip}
  >
    ?
  </button>
</span>

<!-- Tooltip content -->
<div role="tooltip">
  ROAS (Return on Ad Spend): Revenue generated divided by ad spend. Example: $5 revenue per $1 spent = 5:1 ROAS. Target: 3:1 minimum for profitability.
</div>
```

**CTR (Click-Through Rate):**
```
CTR: Percentage of people who clicked your ad after seeing it. Formula: (Clicks ÷ Impressions) × 100.
```

**CPA (Cost Per Acquisition):**
```
CPA: Average cost to acquire one customer. Formula: Total Ad Spend ÷ Conversions. Lower is better.
```

**Bounce Rate:**
```
Bounce Rate: Percentage of visitors who leave after viewing only one page. Lower is better. Target: < 50%.
```

**ROP (Reorder Point):**
```
ROP: Inventory level that triggers reorder. Formula: (Avg Daily Sales × Lead Time) + Safety Stock.
```

**WOS (Weeks of Supply):**
```
WOS: How many weeks current stock will last. Formula: Current Stock ÷ Avg Weekly Sales.
```

---

## 15. Time Period Selectors

### 15.1 Pattern

**Dropdown Label:**
```
Time Period: [Last 30 Days ▼]
```

**Options:**
```
Last 7 Days
Last 30 Days
Last 90 Days
This Month
Last Month
This Quarter
Custom Range
```

### 15.2 Custom Range

**Labels:**
```
Start Date: [MM/DD/YYYY]
End Date: [MM/DD/YYYY]
```

**Validation:**
```
⚠ End date must be after start date
⚠ Date range cannot exceed 365 days
```

**CTA:**
```
[Apply Range]
```

---

## 16. Export & Share Features

### 16.1 Export Button

**Label:**
```
Export Data
```

**Dropdown Options:**
```
Export as CSV
Export as PDF Report
Export as Image (PNG)
```

**Success Toast:**
```
Data exported successfully. Check your downloads.
```

### 16.2 Share Feature

**Label:**
```
Share Report
```

**Options:**
```
Email This Report
Copy Link to Clipboard
Download PDF
```

**Email Subject:**
```
Hot Rodan Analytics Report — {date_range}
```

---

## 17. Comparison Features

### 17.1 Period Comparison

**Toggle:**
```
☑ Compare to previous period
```

**Chart Legend Updates:**
```
Current Period (Oct 1-30)
Previous Period (Sep 1-30)
```

**Tooltip Updates:**
```
Oct 15 (Current)
Sep 15 (Previous)
Change: ▲ 12.4%
```

### 17.2 Platform Comparison

**For Social/Ads:**
```
☑ Show all platforms
☐ Instagram only
☐ Facebook only
☐ Twitter only
```

---

## 18. Accessibility Checklist

**Every Analytics Component Must Have:**

- [ ] Canvas elements with `role="img"` and descriptive `aria-label`
- [ ] Fallback content (table or paragraph) inside canvas tags
- [ ] Tooltip callbacks that provide clear, concise labels
- [ ] Color contrast minimum 4.5:1 for text
- [ ] Keyboard navigation support (arrow keys to navigate data points)
- [ ] Screen reader announcements for dynamic updates (`aria-live="polite"`)
- [ ] Focus indicators on interactive elements
- [ ] Alt text for any images/icons
- [ ] Descriptive button labels (not generic "Click here")
- [ ] Proper heading hierarchy (H2 for sections, H3 for subsections)

---

## 19. Hot Rodan Brand Voice in Analytics

### 19.1 Where to Apply

**✅ DO Use Hot Rodan Theme:**
- Success toasts: "Data tuned and ready! 📊"
- Empty state CTAs: "Rev up your analytics"
- Completion messages: "Report exported at full throttle!"

**❌ DON'T Use Hot Rodan Theme:**
- Chart labels (clarity over creativity)
- Metric definitions (technical precision required)
- Error messages (clear problem statement needed)
- Table headers (standard terminology)

### 19.2 Examples

**Good (Strategic Use):**
```
Toast: "Analytics dashboard tuned and ready! 📊"
Empty State: "Rev up your metrics — Connect analytics now"
Success: "Report generated at full throttle!"
```

**Bad (Overuse):**
```
Chart Title: "Rev Up Your Revenue Velocity Dashboard"
Metric Label: "Throttle Score (ROAS)"
Error: "Pit stop needed - connection failed"
```

### 19.3 Tone Guidelines

**Data Should Be:**
- Professional and accurate
- Clear and specific
- Actionable with context
- Honest about limitations

**Voice Should Be:**
- Confident (not arrogant)
- Helpful (not condescending)
- Enthusiastic (strategic, not gimmicky)
- Technical when needed (not overly simplified)

---

## 20. Implementation Checklist

**Engineer Tasks (Phase 7-8):**

**Tiles:**
- [ ] Social Performance tile with mini chart
- [ ] Ad Performance tile with ROAS metric
- [ ] SEO Performance tile with traffic trend
- [ ] Content Performance tile with top pages

**Modals:**
- [ ] Social Performance modal with platform breakdown
- [ ] Ad Performance modal with ROAS trend & CPA chart
- [ ] SEO Performance modal with traffic & keywords
- [ ] Content Performance modal with page views by type

**Charts:**
- [ ] All charts have `role="img"` and `aria-label`
- [ ] All charts have fallback content (table or paragraph)
- [ ] Tooltips configured with clear labels
- [ ] Keyboard navigation implemented

**Accessibility:**
- [ ] Icon `accessibilityLabel` props added
- [ ] Button `aria-label` descriptive
- [ ] Loading states with `aria-live` announcements
- [ ] Color contrast minimum 4.5:1

**Empty States:**
- [ ] Polaris EmptyState component used
- [ ] Clear CTAs to connect services
- [ ] Helpful explanatory text

**Error States:**
- [ ] Connection errors with retry and settings links
- [ ] Data errors with context
- [ ] Quota errors with timing information

---

## Reference

**MCP Sources:**
- Chart.js accessibility: Canvas with `aria-label` and `role="img"`, fallback content required
- Chart.js tooltips: Callbacks for custom labels, footer summaries, formatting
- Polaris EmptyState: heading, action props, image, children for explanation

**Design Specs:**
- TBD: Await Engineer Phase 7-8 implementation specs
- Reference: Existing modal patterns (Phase 2)

---

## Version History

- **1.0** (2025-10-21): Initial analytics microcopy with Chart.js and Polaris accessibility patterns

---

**END OF DOCUMENT**

**Next Steps:**
1. Engineer implements analytics tiles (Phase 7)
2. Engineer implements analytics modals (Phase 8)
3. Content Agent reviews actual implementation for brand voice
4. Test all chart accessibility with screen readers
5. Validate tooltip clarity and usefulness

