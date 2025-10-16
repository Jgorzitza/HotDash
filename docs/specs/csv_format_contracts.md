# CSV Format Contracts

**Version:** 1.0  
**Date:** 2025-10-16  
**Status:** Active  
**Owner:** Inventory Agent  

## Overview

Standard CSV formats for inventory import/export operations.

## Purchase Order Export

### Format

```csv
SKU,Product Title,Current Quantity,ROP,Order Quantity,Unit Cost,Total Cost,Vendor SKU,Lead Time (Days),Expected Delivery
"TEST-001","Widget A",10,47,37,12.50,462.50,"ACME-001",14,2025-10-30
"TEST-002","Widget B",0,52,52,8.75,455.00,"ACME-002",21,2025-11-06
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| SKU | string | Yes | Product SKU |
| Product Title | string | Yes | Product name |
| Current Quantity | integer | Yes | Current stock level |
| ROP | integer | Yes | Reorder point |
| Order Quantity | integer | Yes | Recommended order quantity |
| Unit Cost | decimal | No | Cost per unit |
| Total Cost | decimal | No | Order Quantity × Unit Cost |
| Vendor SKU | string | No | Vendor's SKU |
| Lead Time (Days) | integer | Yes | Lead time in days |
| Expected Delivery | date | Yes | YYYY-MM-DD format |

### Example Usage

```typescript
import { poToCSV } from '~/services/inventory/po-generator';

const po = generatePO(ropResults);
const csv = poToCSV(po);
// Download or email CSV
```

## Backorder Import

### Format

```csv
SKU,Quantity,Customer Name,Order Number,Expected Date,Notes
"TEST-001",5,"John Doe","#1234",2025-10-25,"Rush order"
"TEST-002",10,"Jane Smith","#1235",2025-10-30,""
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| SKU | string | Yes | Product SKU |
| Quantity | integer | Yes | Backorder quantity (> 0) |
| Customer Name | string | No | Customer name |
| Order Number | string | No | Order reference |
| Expected Date | date | No | YYYY-MM-DD format |
| Notes | string | No | Additional notes |

### Validation Rules

- SKU must exist in inventory
- Quantity must be positive integer
- Expected Date must be valid YYYY-MM-DD or empty
- Duplicate SKUs are allowed (multiple backorders)

### Example Usage

```typescript
import { parseBackorderCSV } from '~/services/inventory/csv-handlers';

const csvContent = await file.text();
const result = parseBackorderCSV(csvContent);

console.log(`Parsed ${result.data.length} backorders`);
console.log(`Errors: ${result.errors.length}`);
```

### Error Handling

```typescript
{
  data: BackorderImport[],
  errors: [
    { row: 3, field: 'sku', message: 'SKU is required' },
    { row: 5, field: 'quantity', message: 'Quantity must be positive' }
  ],
  warnings: [
    { row: 4, field: 'expectedDate', message: 'Date format should be YYYY-MM-DD' }
  ]
}
```

## Inventory Export

### Format

```csv
SKU,Product Title,Current Quantity,ROP,Status Bucket,Days of Cover,Weeks of Stock,Avg Daily Sales,Lead Time (Days),Safety Stock
"TEST-001","Widget A",100,47,"in_stock",33.3,4.76,3.00,14,5
"TEST-002","Widget B",10,52,"urgent_reorder",5.0,0.71,2.00,21,10
"TEST-003","Widget C",0,19,"out_of_stock",N/A,N/A,1.00,14,5
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| SKU | string | Yes | Product SKU |
| Product Title | string | Yes | Product name |
| Current Quantity | integer | Yes | Current stock level |
| ROP | integer | Yes | Reorder point |
| Status Bucket | string | Yes | in_stock, low_stock, urgent_reorder, out_of_stock |
| Days of Cover | decimal | No | Days until stockout (N/A if no sales) |
| Weeks of Stock | decimal | No | Weeks until stockout (N/A if no sales) |
| Avg Daily Sales | decimal | Yes | Average daily sales |
| Lead Time (Days) | integer | Yes | Lead time in days |
| Safety Stock | integer | Yes | Safety stock units |

### Example Usage

```typescript
import { exportInventoryToCSV } from '~/services/inventory/csv-handlers';

const csv = exportInventoryToCSV(ropResults, productTitles);
// Download CSV
```

## Alerts Export

### Format

```csv
SKU,Alert Type,Severity,Current Quantity,ROP,Days of Cover,Weeks of Stock,Message,Generated At
"TEST-001","urgent_reorder","high",10,47,3.3,0.48,"TEST-001 is critically low",2025-10-16T12:00:00Z
"TEST-002","out_of_stock","critical",0,52,N/A,N/A,"TEST-002 is OUT OF STOCK",2025-10-16T12:00:00Z
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| SKU | string | Yes | Product SKU |
| Alert Type | string | Yes | low_stock, urgent_reorder, out_of_stock |
| Severity | string | Yes | low, medium, high, critical |
| Current Quantity | integer | Yes | Current stock level |
| ROP | integer | Yes | Reorder point |
| Days of Cover | decimal | No | Days until stockout |
| Weeks of Stock | decimal | No | Weeks until stockout |
| Message | string | Yes | Alert message |
| Generated At | datetime | Yes | ISO 8601 format |

### Example Usage

```typescript
import { exportAlertsToCSV } from '~/services/inventory/csv-handlers';

const csv = exportAlertsToCSV(alerts);
// Download CSV
```

## CSV Parsing Rules

### General Rules

1. **Headers:** First row contains column names
2. **Quoting:** All values quoted with double quotes
3. **Escaping:** Double quotes escaped as `""`
4. **Encoding:** UTF-8
5. **Line Endings:** `\n` (LF) or `\r\n` (CRLF)
6. **Empty Values:** Empty string `""` for optional fields

### Data Types

- **string:** Any text, quoted
- **integer:** Whole number, no decimals
- **decimal:** Number with up to 2 decimal places
- **date:** YYYY-MM-DD format
- **datetime:** ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)
- **boolean:** "true" or "false" (lowercase)

### Special Values

- **N/A:** Used when value cannot be calculated
- **Empty:** `""` for optional missing values
- **Null:** Not used, use empty string instead

## Download Headers

### HTTP Response Headers

```typescript
{
  'Content-Type': 'text/csv',
  'Content-Disposition': 'attachment; filename="purchase-order-PO-20251016-120000.csv"',
  'Cache-Control': 'no-cache',
}
```

### Filename Conventions

- **Purchase Orders:** `purchase-order-{PO_NUMBER}.csv`
- **Inventory Export:** `inventory-export-{YYYYMMDD}.csv`
- **Alerts Export:** `alerts-export-{YYYYMMDD}.csv`
- **Backorders:** `backorders-{YYYYMMDD}.csv`

## Import Validation

### Pre-Import Checks

1. File is valid CSV format
2. Headers match expected format
3. File size < 10MB
4. Row count < 10,000

### Row Validation

1. Required fields present
2. Data types correct
3. Values within valid ranges
4. SKUs exist in system (for imports)

### Error Reporting

```typescript
{
  totalRows: 100,
  successfulRows: 95,
  errorRows: 5,
  warningRows: 10,
  successRate: 95.0,
  errors: [
    { row: 3, field: 'sku', message: 'SKU not found' },
    { row: 7, field: 'quantity', message: 'Must be positive' }
  ],
  warnings: [
    { row: 5, field: 'date', message: 'Date format should be YYYY-MM-DD' }
  ]
}
```

## Performance Targets

- **Export (100 rows):** < 500ms
- **Export (1000 rows):** < 2 seconds
- **Import (100 rows):** < 1 second
- **Import (1000 rows):** < 5 seconds

## Testing

### Test Files

Located in: `tests/fixtures/csv/`

- `purchase-order-valid.csv`
- `purchase-order-invalid.csv`
- `backorder-valid.csv`
- `backorder-invalid.csv`
- `inventory-export-sample.csv`
- `alerts-export-sample.csv`

### Test Cases

1. Valid CSV with all fields
2. Valid CSV with optional fields empty
3. Invalid CSV (missing required fields)
4. Invalid CSV (wrong data types)
5. Invalid CSV (malformed)
6. Large CSV (1000+ rows)
7. CSV with special characters
8. CSV with quotes in values

## See Also

- `app/services/inventory/csv-handlers.ts` - Implementation
- `app/services/inventory/po-generator.ts` - PO CSV generation
- `docs/specs/inventory_data_model.md` - Data structures

