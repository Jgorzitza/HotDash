---
epoch: 2025.10.E1
doc: docs/qa/uat-test-data-guide.md
owner: qa
last_reviewed: 2025-10-13
expires: 2025-10-20
---

# UAT Test Data Preparation Guide

## Overview

This guide outlines the test data scenarios and preparation needed for effective User Acceptance Testing (UAT) of the HotDash Operator Control Center.

## Test Data Philosophy

For UAT, we use realistic mock data that represents:
- **Typical Business Scenarios**: Normal operational conditions
- **Edge Cases**: Unusual but possible situations
- **Stress Conditions**: High-volume or exceptional scenarios
- **Error Conditions**: Scenarios that might trigger error states

## Mock Data Structure

The application uses mock data when `DASHBOARD_USE_MOCK=1` or `?mock=1` query parameter is used. This ensures consistent, predictable data for testing.

### Current Mock Data Implementation

Based on the dashboard loader (`app/routes/app._index.tsx`), the mock data includes:

#### Sales Pulse Data
```typescript
{
  shopDomain: "mock-shop",
  totalRevenue: 8425.5,
  currency: "USD",
  orderCount: 58,
  topSkus: [
    { sku: "BOARD-XL", title: "Powder Board XL", quantity: 14, revenue: 2800 },
    { sku: "GLOVE-PRO", title: "Thermal Gloves Pro", quantity: 32, revenue: 1920 },
    { sku: "BOOT-INS", title: "Insulated Boots", quantity: 20, revenue: 1600 }
  ],
  pendingFulfillment: [...],
  generatedAt: now
}
```

#### Inventory Alerts
```typescript
[
  {
    sku: "BOARD-XL",
    productId: "gid://shopify/Product/1",
    variantId: "gid://shopify/ProductVariant/1",
    title: "Powder Board XL — 158cm",
    quantityAvailable: 6,
    threshold: 10,
    daysOfCover: 2.5,
    generatedAt: now
  }
]
```

#### CX Escalations
```typescript
[
  {
    id: 101,
    inboxId: 1,
    status: "open",
    customerName: "Jamie Lee",
    createdAt: threeHoursAgo,
    breachedAt: breachThirtyMinutesAfter,
    slaBreached: true,
    suggestedReplyId: "ack_delay",
    suggestedReply: "Hi Jamie, thanks for your patience..."
  }
]
```

## Test Data Scenarios

### Scenario 1: Normal Operations (Primary)
**Purpose**: Test typical daily usage patterns
**Data Characteristics**:
- Moderate sales volume (50-100 orders/day)
- Balanced inventory levels (not too low, not overstocked)
- Mix of fulfillment statuses (some pending, some complete)
- Some CX escalations but not overwhelming
- Realistic SEO metrics

### Scenario 2: High-Volume Period (Secondary)
**Purpose**: Test system under increased load
**Data Characteristics**:
- High sales volume (200+ orders/day)
- Low inventory warnings on multiple products
- Multiple pending fulfillments
- Several CX escalations requiring attention
- Anomalous SEO patterns

### Scenario 3: Edge Cases (Secondary)
**Purpose**: Test boundary conditions
**Data Characteristics**:
- Zero inventory on some products
- Maximum inventory levels
- Orders with unusual patterns
- CX conversations with extreme edge cases
- SEO data with outliers

## Data Validation Checklist

### For Each Test Session:

#### Sales Pulse Validation
- [ ] Total revenue is realistic and positive
- [ ] Order count matches expected range
- [ ] Top SKUs show variety in products
- [ ] Pending fulfillments exist but are manageable
- [ ] Currency is correctly formatted

#### Inventory Watch Validation
- [ ] Alert thresholds are reasonable
- [ ] Days of cover calculations are logical
- [ ] Mix of products with different alert levels
- [ ] Product titles are descriptive and accurate
- [ ] Inventory levels trigger appropriate alerts

#### CX Pulse Validation
- [ ] Escalation reasons are realistic
- [ ] SLA breach timing is appropriate
- [ ] Customer names are diverse
- [ ] Suggested replies are helpful
- [ ] Conversation status reflects business logic

#### SEO Pulse Validation
- [ ] Landing page paths are realistic
- [ ] Session counts are believable
- [ ] Week-over-week changes are within expected ranges
- [ ] Anomaly detection flags make sense

## Data Preparation Steps

### Before Each UAT Session:

1. **Environment Setup**
   ```bash
   # Ensure mock mode is enabled
   export DASHBOARD_USE_MOCK=1

   # Start the application
   npm run build
   npm start
   ```

2. **Data Verification**
   - Navigate to `http://127.0.0.1:4173/app?mock=1`
   - Verify "Displaying sample data" indicator appears
   - Confirm all 6 tiles load without errors
   - Check browser console for any JavaScript errors

3. **Screenshot Baseline**
   - Capture screenshots of each tile
   - Document current data values
   - Note any visual inconsistencies

### During Test Session:

1. **Real-time Validation**
   - Testers should note if data seems unrealistic
   - Document any data inconsistencies
   - Report if mock data doesn't represent real scenarios

2. **Data Refresh Testing**
   - Test page refresh behavior
   - Verify data consistency across refreshes
   - Check for data loading indicators

## Troubleshooting Data Issues

### Common Issues and Solutions:

#### Issue: Mock data not loading
**Symptoms**: Tiles show error states or no data
**Solution**:
- Verify `DASHBOARD_USE_MOCK=1` environment variable
- Check `?mock=1` query parameter in URL
- Restart application server

#### Issue: Unrealistic data values
**Symptoms**: Revenue numbers seem impossible, inventory levels don't make sense
**Solution**:
- Review mock data generation in `app/routes/app._index.tsx`
- Adjust values in `buildMockDashboard()` function
- Rebuild and restart application

#### Issue: Inconsistent data across tiles
**Symptoms**: Sales data doesn't match inventory alerts
**Solution**:
- Ensure mock data relationships are logical
- Update mock data to maintain consistency
- Verify data generation timestamps

## Data Enhancement Opportunities

### Post-UAT Improvements:

1. **Dynamic Mock Data**
   - Add time-based variations
   - Include seasonal patterns
   - Implement realistic trends

2. **Scenario-Specific Data Sets**
   - Holiday shopping season data
   - Product launch scenarios
   - Crisis situation data

3. **Internationalization Data**
   - Multiple currency scenarios
   - Different regional preferences
   - Localized content

## Documentation

All test data preparation and validation activities should be documented in:
- UAT session notes
- Test execution logs
- Defect reports (if data issues found)
- Feedback forms

## Maintenance

This test data guide should be reviewed and updated:
- Before each major UAT cycle
- When application functionality changes significantly
- When new tile types are added
- After feedback from previous UAT sessions

## Contact

For questions about test data preparation or issues encountered:
- **QA Lead**: qa@hotrodan.com
- **Product Manager**: product@hotrodan.com
- **Engineering**: engineer@hotrodan.com
