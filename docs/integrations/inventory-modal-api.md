# Inventory Modal API Integration

**Owner**: Inventory Agent  
**Created**: 2025-10-21  
**Status**: READY FOR ENGINEER INTEGRATION

---

## Overview

Backend API endpoints for Inventory Modal (ENG-007) integration. Provides real-time inventory data including stock levels, reorder points, demand forecasts, vendor information, and purchase order tracking.

---

## API Endpoints

### 1. Product Inventory Data

**Endpoint**: `GET /api/inventory/product/:productId`

**Description**: Comprehensive inventory data for a specific product

**Response**:
```json
{
  "success": true,
  "data": {
    "productId": "prod_001",
    "currentStock": 42,
    "reorderPoint": 35,
    "safetyStock": 15,
    "seasonalFactor": 1.25,
    "adjustedDailySales": 4.375,
    "forecast30d": {
      "sku": "prod_001",
      "forecast_30d": 105,
      "daily_forecast": 3.5,
      "confidence": "high",
      "trend": "stable",
      "recommended_reorder_qty": 110,
      "analysis": {
        "historical_avg": 3.2,
        "recent_avg_7d": 3.5,
        "recent_avg_30d": 3.4,
        "trend_coefficient": 0.05,
        "variability_coefficient": 0.12
      }
    },
    "vendor": {
      "vendor_id": "vendor_001",
      "vendor_name": "Premium Suppliers Inc.",
      "cost_per_unit": 24.99,
      "lead_time_days": 7,
      "reliability_score": 92,
      "last_order_date": "2025-10-06T00:00:00.000Z"
    },
    "purchaseOrders": [
      {
        "po_number": "PO-2025-001",
        "status": "shipped",
        "quantity": 100,
        "expected_delivery_date": "2025-10-26T00:00:00.000Z",
        "days_until_expected": 5
      }
    ],
    "lastUpdated": "2025-10-21T04:45:00.000Z"
  }
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Failed to fetch inventory product data",
  "productId": "prod_001"
}
```

---

### 2. Chart Data (14-Day Demand Velocity)

**Endpoint**: `GET /api/inventory/chart-data/:productId`

**Description**: 14-day historical demand data formatted for chart display

**Response**:
```json
{
  "success": true,
  "data": {
    "labels": ["Oct 7", "Oct 8", "Oct 9", "Oct 10", "Oct 11", "Oct 12", "Oct 13", "Oct 14", "Oct 15", "Oct 16", "Oct 17", "Oct 18", "Oct 19", "Oct 20"],
    "datasets": [
      {
        "label": "Daily Sales",
        "data": [4, 3, 5, 6, 4, 5, 7, 5, 6, 4, 5, 6, 7, 5],
        "borderColor": "rgb(59, 130, 246)",
        "backgroundColor": "rgba(59, 130, 246, 0.1)",
        "tension": 0.3,
        "fill": true
      }
    ]
  },
  "productId": "prod_001",
  "dateRange": {
    "start": "2025-10-07T00:00:00.000Z",
    "end": "2025-10-20T00:00:00.000Z"
  },
  "lastUpdated": "2025-10-21T04:45:00.000Z"
}
```

**Chart Library**: Compatible with Chart.js and similar libraries

---

### 3. Inventory Tile Data

**Endpoint**: `GET /api/inventory/tile-data`

**Description**: Real-time inventory status summary for dashboard tile

**Response**:
```json
{
  "success": true,
  "data": {
    "statusBuckets": {
      "inStock": 3,
      "lowStock": 2,
      "outOfStock": 1,
      "urgentReorder": 1
    },
    "topRisks": [
      {
        "productId": "prod_002",
        "productName": "Deluxe Gadget Set",
        "currentStock": 0,
        "rop": 15,
        "daysUntilStockout": 0,
        "status": "out_of_stock"
      },
      {
        "productId": "prod_006",
        "productName": "Professional Bundle",
        "currentStock": 3,
        "rop": 10,
        "daysUntilStockout": 2,
        "status": "urgent_reorder"
      }
    ],
    "lastUpdated": "2025-10-21T04:45:00.000Z"
  }
}
```

---

## Integration Steps for Engineer

### Step 1: Fetch Product Data

```typescript
async function fetchProductInventory(productId: string) {
  const response = await fetch(`/api/inventory/product/${productId}`);
  const data = await response.json();
  
  if (!data.success) {
    console.error('Failed to fetch inventory:', data.error);
    return null;
  }
  
  return data.data;
}
```

### Step 2: Fetch Chart Data

```typescript
async function fetchChartData(productId: string) {
  const response = await fetch(`/api/inventory/chart-data/${productId}`);
  const data = await response.json();
  
  if (!data.success) {
    console.error('Failed to fetch chart data:', data.error);
    return null;
  }
  
  return data.data; // Ready for Chart.js
}
```

### Step 3: Display in Inventory Modal

```typescript
// Inside Inventory Modal component
const [inventoryData, setInventoryData] = useState(null);
const [chartData, setChartData] = useState(null);

useEffect(() => {
  async function loadData() {
    const [inventory, chart] = await Promise.all([
      fetchProductInventory(productId),
      fetchChartData(productId)
    ]);
    
    setInventoryData(inventory);
    setChartData(chart);
  }
  
  loadData();
}, [productId]);

// Use chartData directly with Chart.js:
<Line data={chartData} options={...} />
```

---

## Data Features

### Seasonal Adjustments (INVENTORY-001)
- `seasonalFactor`: Multiplier applied for current season (1.0 = no adjustment)
- `adjustedDailySales`: Sales rate adjusted for seasonality
- Used in reorder point calculations automatically

### Demand Forecasting (INVENTORY-002)
- `forecast30d`: 30-day demand prediction with confidence levels
- `trend`: Growing, stable, or declining demand
- `confidence`: High, medium, or low confidence in forecast

### Vendor Management (INVENTORY-003)
- `vendor`: Current supplier information
- `reliability_score`: On-time delivery percentage (0-100)
- `lead_time_days`: Expected delivery time

### Purchase Order Tracking (INVENTORY-004)
- `purchaseOrders`: Array of active POs
- `days_until_expected`: Days until expected delivery
- `status`: Current PO status (ordered, shipped, received)

### Bundle Support (INVENTORY-008)
- Bundle products handled transparently
- ROP calculated based on component availability
- Limiting component identification

---

## Error Handling

All endpoints return `success: false` with error message on failure:

```typescript
if (!response.ok || !data.success) {
  // Handle error
  showErrorToast(data.error || 'Failed to load inventory data');
  // Fallback to mock data or cached data
}
```

---

## Performance

- **Caching**: Not yet implemented (future enhancement)
- **Response Time**: < 200ms for mock data, < 500ms expected for real Shopify API
- **Rate Limits**: Follow Shopify API rate limits (future consideration)

---

## Testing

### Manual Testing

```bash
# Test product endpoint
curl http://localhost:5173/api/inventory/product/prod_001

# Test chart endpoint  
curl http://localhost:5173/api/inventory/chart-data/prod_001

# Test tile endpoint
curl http://localhost:5173/api/inventory/tile-data
```

### Integration Testing

1. Verify all 3 endpoints return valid JSON
2. Verify chart data displays correctly in Chart.js
3. Verify product data displays in modal
4. Verify tile data displays in dashboard tile

---

## Next Steps (Future Enhancements)

1. **Real Shopify Integration**: Replace mock data with live Shopify API calls
2. **Caching Layer**: Add Redis/memory caching for frequently accessed data
3. **Real-time Updates**: Add SSE/WebSocket for live inventory updates
4. **Error Recovery**: Add retry logic for failed API calls
5. **Historical Data**: Store sales history in database for accurate forecasting

---

## Contact

**Inventory Agent**: Ready to support integration issues  
**Feedback**: `feedback/inventory/2025-10-21.md`  
**Code**: `app/services/inventory/`, `app/routes/api.inventory.*`

