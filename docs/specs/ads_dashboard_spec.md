# Ads Dashboard Specification

> **Owner:** ads agent  
> **Date:** 2025-10-16  
> **Version:** 1.0

## Overview

Visual dashboard for monitoring advertising campaign performance.

## Route

`/ads/dashboard`

## Components

### Summary Cards

Four key metric cards at the top:

1. **Total Ad Spend**
   - Display: Currency format
   - Subtitle: "Across X campaigns"

2. **Total Revenue**
   - Display: Currency format
   - Subtitle: "X conversions"

3. **Average ROAS**
   - Display: Decimal (2 places) + "x"
   - Badge: Green (≥3.0) or Yellow (<3.0)

4. **Average CPA**
   - Display: Currency format
   - Subtitle: "Cost per acquisition"

### Platform Performance Table

Columns:
- Platform (Meta, Google, TikTok)
- Campaigns (count)
- Ad Spend ($)
- Revenue ($)
- ROAS (x)
- CPA ($)

### Campaign Details Table

Columns:
- Campaign Name
- Platform
- Status
- Ad Spend ($)
- Revenue ($)
- ROAS (x)
- CPC ($)
- CPM ($)
- CPA ($)

### Additional Metrics Cards

Four more cards at bottom:

1. **Total Impressions**
   - Display: Number with commas
   - Subtitle: "CTR: X%"

2. **Total Clicks**
   - Display: Number with commas
   - Subtitle: "Avg CPC: $X"

3. **Conversion Rate**
   - Display: Percentage (2 decimals)
   - Subtitle: "X total conversions"

4. **Average CPM**
   - Display: Currency format
   - Subtitle: "Cost per 1000 impressions"

## Data Loading

- Loader fetches from adapters
- Mock data in development
- Real API calls in production
- 5-minute cache TTL

## Styling

- Shopify Polaris components
- Responsive layout
- InlineStack for cards
- DataTable for tabular data

## Future Enhancements

- Real-time updates (SSE)
- Date range picker
- Platform filter
- Export button
- Drill-down to campaign details

