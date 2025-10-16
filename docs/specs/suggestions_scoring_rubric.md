# Reorder Suggestions Scoring Rubric

**Version:** 1.0  
**Date:** 2025-10-16  
**Status:** Active  
**Owner:** Inventory Agent  

## Overview

Evidence-first scoring system for AI-powered reorder suggestions with confidence levels and priority ranking.

## Confidence Scoring

### High Confidence (Score: 8-10)

**Criteria:**
- ✅ Historical sales data available (≥ 30 days)
- ✅ Average daily sales > 0
- ✅ Days of cover calculable
- ✅ Consistent sales pattern (low variance)
- ✅ Lead time data available

**Evidence Required:**
- Sales history with dates
- Average daily sales calculation
- Standard deviation < 50% of mean
- Vendor lead time confirmed

**Example:**
```
SKU: WIDGET-001
Avg Daily Sales: 5.2 units
Sales History: 30 days, 156 units sold
Std Dev: 1.8 (35% of mean)
Lead Time: 14 days (confirmed)
→ Confidence: HIGH
```

### Medium Confidence (Score: 5-7)

**Criteria:**
- ✅ Some sales data available (7-29 days)
- ✅ Average daily sales > 0
- ⚠️ Limited history or high variance
- ⚠️ Lead time estimated (not confirmed)

**Evidence Required:**
- Limited sales history
- Average daily sales calculation
- Standard deviation 50-100% of mean
- Default lead time used

**Example:**
```
SKU: WIDGET-002
Avg Daily Sales: 3.1 units
Sales History: 14 days, 43 units sold
Std Dev: 2.4 (77% of mean)
Lead Time: 14 days (default)
→ Confidence: MEDIUM
```

### Low Confidence (Score: 1-4)

**Criteria:**
- ⚠️ Minimal or no sales data (< 7 days)
- ⚠️ Average daily sales = 0 or very low
- ⚠️ High variance or inconsistent pattern
- ⚠️ No lead time data

**Evidence Required:**
- Minimal or no sales history
- Fallback to safety stock only
- High uncertainty

**Example:**
```
SKU: WIDGET-003
Avg Daily Sales: 0.2 units
Sales History: 3 days, 1 unit sold
Std Dev: N/A (insufficient data)
Lead Time: 14 days (default)
→ Confidence: LOW
```

## Priority Ranking (1-10)

### Critical Priority (10)

**Criteria:**
- Out of stock (quantity = 0)
- High sales velocity
- High confidence

**Action:** Immediate reorder

### Urgent Priority (8-9)

**Criteria:**
- Urgent reorder bucket (quantity ≤ ROP × 0.5)
- Weeks of stock < 0.5
- Medium to high confidence

**Action:** Reorder within 24 hours

### High Priority (7)

**Criteria:**
- Low stock bucket (quantity ≤ ROP)
- Weeks of stock < 1
- Medium confidence

**Action:** Reorder within 3 days

### Medium Priority (5-6)

**Criteria:**
- Low stock bucket
- Weeks of stock 1-1.5
- Any confidence

**Action:** Plan reorder this week

### Low Priority (1-4)

**Criteria:**
- In stock (quantity > ROP)
- Weeks of stock > 1.5
- Informational only

**Action:** Monitor only

## Reasoning Generation

### Required Elements

Every suggestion must include reasoning with:
1. **Status-based reasoning** - Current stock status
2. **Sales velocity reasoning** - Average daily sales
3. **Lead time reasoning** - If > 14 days, note advance planning
4. **Quantity reasoning** - Suggested order amount

### Example Reasoning

```typescript
[
  "Product is currently out of stock",
  "Average daily sales: 5.2 units",
  "Long lead time (21 days) requires advance planning",
  "Suggested order: 150 units to reach optimal stock level"
]
```

## Evidence Requirements

### Minimum Evidence

All suggestions must include:
- Current quantity
- ROP calculation
- Average daily sales
- Lead time used
- Suggested order quantity

### Enhanced Evidence (High Confidence)

- Sales history (30+ days)
- Sales trend (increasing/stable/decreasing)
- Seasonality factor (if applicable)
- Vendor lead time statistics
- Historical stockout incidents

## Scoring Algorithm

```typescript
function calculateConfidence(
  ropResult: ROPResult,
  hasHistoricalData: boolean
): 'low' | 'medium' | 'high' {
  // High: good sales history, reasonable WOS
  if (hasHistoricalData && 
      ropResult.averageDailySales > 0 && 
      ropResult.daysOfCover !== null) {
    return 'high';
  }

  // Medium: some data but limited
  if (ropResult.averageDailySales > 0) {
    return 'medium';
  }

  // Low: no sales history
  return 'low';
}

function calculatePriority(ropResult: ROPResult): number {
  // Critical: out of stock = 10
  if (ropResult.statusBucket === 'out_of_stock') {
    return 10;
  }

  // High: urgent reorder = 8-9
  if (ropResult.statusBucket === 'urgent_reorder') {
    const wos = ropResult.weeksOfStock || 0;
    return wos < 0.5 ? 9 : 8;
  }

  // Medium: low stock = 5-7
  if (ropResult.statusBucket === 'low_stock') {
    const wos = ropResult.weeksOfStock || 0;
    if (wos < 1) return 7;
    if (wos < 1.5) return 6;
    return 5;
  }

  return 1;
}
```

## Filtering

### By Confidence

```typescript
// Only show high confidence suggestions
const filtered = suggestions.filter(s => s.confidence === 'high');
```

### By Priority

```typescript
// Only show priority ≥ 7
const highPriority = suggestions.filter(s => s.priority >= 7);
```

## Validation

### Pre-Generation Validation

- ✅ ROP calculation complete
- ✅ Current quantity available
- ✅ Product should reorder (shouldReorder = true)

### Post-Generation Validation

- ✅ Confidence level assigned
- ✅ Priority between 1-10
- ✅ At least one reasoning item
- ✅ Suggested quantity > 0

## Performance Targets

- Suggestion generation: < 100ms per product
- Bulk suggestions (100 products): < 5 seconds
- Confidence calculation: < 10ms
- Priority calculation: < 10ms

## Testing

### Test Cases

1. High confidence with good data
2. Medium confidence with limited data
3. Low confidence with no data
4. Priority 10 (out of stock)
5. Priority 8-9 (urgent)
6. Priority 5-7 (medium)
7. Filtering by confidence
8. Filtering by priority

## See Also

- `app/services/inventory/suggestions.ts` - Implementation
- `docs/specs/inventory_data_model.md` - Data structures

