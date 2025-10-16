# Inventory Heatmap UI Component Specification

**Version:** 1.0  
**Date:** 2025-10-16  
**Status:** Ready for Implementation  
**Owner:** Inventory Agent (Spec) → Engineer Agent (Implementation)  
**Assigned To:** Engineer Agent  

## Overview

Visual heatmap component for displaying inventory status across all products with color-coded status indicators and interactive drill-down capabilities.

## Component Location

**Path:** `app/components/inventory/Heatmap.tsx`

## Data Source

**Service:** `app/services/inventory/tile-hooks.ts`  
**Function:** `generateHeatmapData(ropResults, productTitles)`

### Input Data Structure

```typescript
interface HeatmapData {
  sku: string;
  productTitle: string;
  currentQuantity: number;
  rop: number;
  statusBucket: 'in_stock' | 'low_stock' | 'urgent_reorder' | 'out_of_stock';
  weeksOfStock: number | null;
  color: string; // Hex color
  priority: number; // 1-10 for sorting
}
```

## Visual Design

### Layout

- **Grid Display:** Responsive grid of product cards
- **Sorting:** By priority (descending) by default
- **Filtering:** By status bucket
- **Search:** By SKU or product title

### Color Scheme

```typescript
const STATUS_COLORS = {
  in_stock: '#10b981',      // Green
  low_stock: '#f59e0b',     // Yellow/Amber
  urgent_reorder: '#f97316', // Orange
  out_of_stock: '#ef4444',  // Red
};
```

### Card Design

Each product card displays:
- **Background Color:** Status-based color (from STATUS_COLORS)
- **SKU:** Bold, top-left
- **Product Title:** Truncated if > 30 chars
- **Current Quantity:** Large number, center
- **Weeks of Stock:** Small text, bottom
- **Status Badge:** Text label (e.g., "LOW STOCK")

### Card States

1. **Default:** Solid background color
2. **Hover:** Slightly darker shade, cursor pointer
3. **Selected:** Border highlight
4. **Loading:** Skeleton placeholder

## Component Props

```typescript
interface InventoryHeatmapProps {
  data: HeatmapData[];
  loading?: boolean;
  onProductClick?: (sku: string) => void;
  filterStatus?: 'all' | 'in_stock' | 'low_stock' | 'urgent_reorder' | 'out_of_stock';
  sortBy?: 'priority' | 'sku' | 'quantity' | 'wos';
  searchQuery?: string;
}
```

## Features

### 1. Status Filter

**Location:** Top toolbar  
**Options:**
- All (default)
- In Stock
- Low Stock
- Urgent Reorder
- Out of Stock

**Behavior:** Filter cards to show only selected status

### 2. Sort Options

**Location:** Top toolbar  
**Options:**
- Priority (default, descending)
- SKU (ascending)
- Quantity (descending)
- Weeks of Stock (ascending)

### 3. Search

**Location:** Top toolbar  
**Behavior:**
- Real-time filtering
- Search by SKU or product title
- Case-insensitive
- Clear button

### 4. Product Click

**Behavior:** Navigate to product detail page or open modal with:
- Full product information
- ROP calculation details
- Reorder suggestion
- Historical trends

### 5. Legend

**Location:** Top-right corner  
**Content:**
- Color key for each status
- Count of products in each status

### 6. Summary Stats

**Location:** Above heatmap  
**Display:**
- Total Products
- In Stock (count + %)
- Low Stock (count + %)
- Urgent Reorder (count + %)
- Out of Stock (count + %)

## Responsive Behavior

### Desktop (≥ 1024px)
- 6 columns grid
- Full card details
- Sidebar filters

### Tablet (768px - 1023px)
- 4 columns grid
- Abbreviated card details
- Collapsible filters

### Mobile (< 768px)
- 2 columns grid
- Minimal card details (SKU + quantity)
- Bottom sheet filters

## Accessibility

- **ARIA Labels:** All interactive elements
- **Keyboard Navigation:** Tab through cards, Enter to select
- **Screen Reader:** Announce status changes
- **Color Contrast:** WCAG AA compliant
- **Focus Indicators:** Visible focus rings

## Performance

### Optimization
- **Virtualization:** Use react-window for > 100 products
- **Memoization:** Memo expensive calculations
- **Debounce:** Search input (300ms)
- **Lazy Load:** Images if product photos included

### Targets
- Initial render: < 500ms
- Filter/sort: < 100ms
- Search: < 200ms

## Integration

### Data Fetching

```typescript
import { generateHeatmapData } from '~/services/inventory/tile-hooks';

// In loader or useEffect
const ropResults = await fetchROPResults();
const productTitles = await fetchProductTitles();
const heatmapData = generateHeatmapData(ropResults, productTitles);
```

### Usage Example

```typescript
import { InventoryHeatmap } from '~/components/inventory/Heatmap';

export default function InventoryDashboard() {
  const { heatmapData, loading } = useInventoryData();

  return (
    <InventoryHeatmap
      data={heatmapData}
      loading={loading}
      onProductClick={(sku) => navigate(`/inventory/product/${sku}`)}
      filterStatus="all"
      sortBy="priority"
    />
  );
}
```

## Polaris Components

Use Shopify Polaris components:
- **Layout:** `Page`, `Layout`, `Card`
- **Filters:** `Filters`, `ChoiceList`
- **Search:** `TextField` with search icon
- **Grid:** Custom CSS Grid
- **Badge:** `Badge` for status labels
- **Spinner:** `Spinner` for loading state

## Testing Requirements

### Unit Tests
- Renders with data
- Filters by status
- Sorts by different fields
- Search functionality
- Click handlers

### Integration Tests
- Data fetching
- Navigation on click
- Filter persistence
- Sort persistence

### Visual Tests
- All status colors
- Responsive layouts
- Loading states
- Empty states

## Edge Cases

1. **No Data:** Show empty state with message
2. **All In Stock:** Show success message
3. **All Out of Stock:** Show critical alert
4. **Large Dataset (> 1000):** Enable virtualization
5. **Missing WOS:** Display "N/A"
6. **Long Product Titles:** Truncate with tooltip

## Future Enhancements

- Export to CSV
- Print view
- Bulk actions (select multiple products)
- Historical comparison view
- Customizable color thresholds
- Drag-and-drop reordering

## Dependencies

```json
{
  "@shopify/polaris": "^12.0.0",
  "react": "^18.0.0",
  "react-window": "^1.8.10"
}
```

## Acceptance Criteria

- [ ] Component renders heatmap grid
- [ ] Status colors match specification
- [ ] Filter by status works
- [ ] Sort by priority/SKU/quantity/WOS works
- [ ] Search by SKU/title works
- [ ] Click handler fires with correct SKU
- [ ] Responsive on mobile/tablet/desktop
- [ ] Loading state displays correctly
- [ ] Empty state displays correctly
- [ ] Accessibility requirements met
- [ ] Performance targets met
- [ ] Unit tests pass
- [ ] Integration tests pass

## Implementation Notes

**For Engineer Agent:**
1. Use `generateHeatmapData()` from tile-hooks service
2. Follow Polaris design patterns
3. Implement virtualization for large datasets
4. Add comprehensive tests
5. Document props and usage
6. Create Storybook stories (if available)

## See Also

- `app/services/inventory/tile-hooks.ts` - Data generation
- `docs/specs/inventory_data_model.md` - Data structures
- Shopify Polaris: https://polaris.shopify.com/

