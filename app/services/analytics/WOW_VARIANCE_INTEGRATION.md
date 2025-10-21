# WoW Variance Service - Integration Guide

**Service**: Week-over-Week Variance Calculation  
**Task**: ANALYTICS-005  
**Created**: 2025-10-21  
**Owner**: Analytics Agent

## Overview

This service calculates Week-over-Week (WoW) variance for sales metrics to power the Sales Pulse Modal's trend indicators.

## Files Created

1. **Service**: `app/services/analytics/wow-variance.ts`
2. **API Route**: `app/routes/api.analytics.wow-variance.ts`
3. **Tests**: `tests/unit/services/analytics/wow-variance.spec.ts`
4. **Documentation**: This file

## API Endpoint

### GET /api/analytics/wow-variance

**Query Parameters**:
- `project` (required): Shop domain (e.g., "shop.myshopify.com")
- `metric` (required): One of: `revenue`, `orders`, `conversion`

**Response Format**:
```json
{
  "success": true,
  "data": {
    "current": 1000,
    "previous": 800,
    "variance": 25,
    "trend": "up"
  },
  "timestamp": "2025-10-21T19:42:00.000Z"
}
```

**Trend Values**:
- `"up"`: Variance > +5%
- `"down"`: Variance < -5%
- `"flat"`: Variance between -5% and +5%

## Usage Example (Sales Modal)

```typescript
import { useFetcher } from "react-router";

export function SalesModal() {
  const fetcher = useFetcher();
  
  useEffect(() => {
    fetcher.load(`/api/analytics/wow-variance?project=${shop}&metric=revenue`);
  }, [shop]);
  
  const variance = fetcher.data?.data;
  
  return (
    <div>
      <h2>Revenue Trend</h2>
      <p>Current Week: ${variance?.current}</p>
      <p>Previous Week: ${variance?.previous}</p>
      <p>Change: {variance?.variance}%</p>
      <Badge tone={variance?.trend === 'up' ? 'success' : variance?.trend === 'down' ? 'critical' : 'neutral'}>
        {variance?.trend}
      </Badge>
    </div>
  );
}
```

## Data Source

The service queries the `dashboard_fact` table in Supabase:

```typescript
// Table: dashboard_fact
// Columns: shop_domain, fact_type, value, created_at

// Fact types mapped:
// - revenue → 'sales_revenue'
// - orders → 'sales_orders'
// - conversion → 'sales_conversion'
```

## Date Ranges

- **Current Week**: Last 7 days (0-6 days ago)
- **Previous Week**: 8-14 days ago

## Variance Calculation

```
variance = ((current - previous) / previous) * 100
```

**Edge Cases**:
- If `previous = 0` and `current > 0`: Returns `100` (100% increase)
- If both are `0`: Returns `0` with trend `'flat'`
- If data unavailable: Returns fallback `{current: 0, previous: 0, variance: 0, trend: 'flat'}`

## Value Formats Supported

The service handles multiple JSON value formats from `dashboard_fact.value`:

```typescript
// Direct number
{ value: 1000 }

// Amount object
{ value: { amount: 1000 } }

// Nested value
{ value: { value: 1000 } }
```

## Tests

11 comprehensive tests covering:
- ✅ Positive variance calculation
- ✅ Negative variance calculation
- ✅ Flat trend detection
- ✅ Zero value handling
- ✅ Error handling with fallback
- ✅ Multiple value formats
- ✅ Aggregation logic (sum for revenue/orders, average for conversion)

**Run tests**:
```bash
npx vitest run tests/unit/services/analytics/wow-variance.spec.ts
```

## Environment Variables Required

```env
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
```

## Error Handling

- **400**: Missing or invalid parameters
- **500**: Database error or service failure
- Graceful fallback on errors (returns zeros with flat trend)

## Next Steps for Engineer

1. ✅ Service and API route are ready to use
2. ✅ Tests are passing (11/11)
3. ✅ No linting errors
4. 🔲 Integrate into Sales Modal UI
5. 🔲 Display variance badge with appropriate color coding
6. 🔲 Consider adding loading states while fetching
7. 🔲 Add error boundaries for failed requests

## Questions?

Contact: Analytics Agent  
Reference: `docs/directions/analytics.md` ANALYTICS-005

