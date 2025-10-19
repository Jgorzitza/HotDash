# Inventory System UI Patterns

**Owner:** Designer  
**Date:** 2025-10-19  
**Version:** 1.0  
**Purpose:** Design specifications for inventory control center UI (North Star scope #2)

---

## 1. Overview

**Scope (from North Star):**

- Centralized inventory view
- Status buckets: `in_stock`, `low_stock`, `out_of_stock`, `urgent_reorder`
- ROP (Reorder Point) + safety stock suggestions
- Internal PO CSV/email generation
- Kits/bundles via `BUNDLE:TRUE`
- Picker piece counts via `PACK:X`
- Picker payout brackets

---

## 2. Inventory Dashboard Tile

### 2.1 Structure

**Data Display:**

```tsx
<TileCard title="Inventory Heatmap" tile={inventoryState}>
  <Stack gap="base">
    {/* Status summary */}
    <Grid gridTemplateColumns="repeat(4, 1fr)" gap="small">
      <MetricBox label="In Stock" value={counts.in_stock} tone="success" />
      <MetricBox label="Low Stock" value={counts.low_stock} tone="warning" />
      <MetricBox
        label="Out of Stock"
        value={counts.out_of_stock}
        tone="critical"
      />
      <MetricBox
        label="Urgent Reorder"
        value={counts.urgent_reorder}
        tone="critical"
        icon="alert-circle"
      />
    </Grid>

    {/* Alert list */}
    <InventoryAlertsList alerts={urgentAlerts} />

    {/* CTA */}
    <Button url="/inventory" variant="primary">
      View Full Inventory
    </Button>
  </Stack>
</TileCard>
```

### 2.2 Status Bucket Colors

| Status           | Badge Tone | Color  | Icon                  | Trigger                       |
| ---------------- | ---------- | ------ | --------------------- | ----------------------------- |
| `in_stock`       | `success`  | Green  | `check-circle`        | Quantity > ROP + safety stock |
| `low_stock`      | `warning`  | Yellow | `alert-triangle`      | Quantity ≤ ROP                |
| `out_of_stock`   | `critical` | Red    | `x-circle`            | Quantity = 0                  |
| `urgent_reorder` | `critical` | Red    | `alert-circle-filled` | Days of cover < lead time     |

### 2.3 Microcopy

| Element     | Copy                                               | Notes                  |
| ----------- | -------------------------------------------------- | ---------------------- |
| Empty state | "All inventory levels healthy."                    | When no alerts         |
| Error state | "Unable to load inventory data. Try again"         | Network error          |
| Loading     | "Loading inventory status..."                      | With spinner           |
| Alert item  | "{Product} — {quantity} units ({days} days cover)" | Compact format         |
| CTA         | "View Full Inventory"                              | Routes to `/inventory` |

---

## 3. Inventory Detail View

### 3.1 Layout (Desktop ≥1280px)

```
┌────────────────────────────────────────────────┐
│ Inventory Control Center           [Export PO] │
├────────────────────────────────────────────────┤
│ [Filters: All Status | All Categories]         │
├────────────────────────────────────────────────┤
│ Product                | Qty | ROP | Days | ⚙️ │
│────────────────────────│─────│─────│──────│───│
│ Blue Running Shoes     │ 45  │ 60  │ 12d  │ ⚙️ │
│ ⚠️ LOW STOCK           │     │     │      │   │
│────────────────────────│─────│─────│──────│───│
│ Red T-Shirt (BUNDLE)   │ 120 │ 80  │ 30d  │ ⚙️ │
│ ✅ IN STOCK            │     │     │      │   │
└────────────────────────────────────────────────┘
```

### 3.2 Table Structure

**Columns:**

1. **Product** (sortable)
   - Product title
   - Status badge below
   - Bundle indicator if `BUNDLE:TRUE`
2. **Quantity** (sortable)
   - Available quantity
   - Picker piece count if `PACK:X` exists
3. **ROP** (Reorder Point)
   - Calculated threshold
   - Editable inline
4. **Days of Cover** (sortable)
   - Calculated: quantity / average daily sales
   - Color-coded by risk level
5. **Actions**
   - Gear icon → opens product actions menu
   - Quick actions: Adjust ROP, Generate PO, View history

**Accessibility:**

- `<table>` with `<caption>Inventory Control Center</caption>`
- `<th scope="col">` for all column headers
- `<th scope="row">` for product names
- Sortable headers: `aria-sort="ascending"` or `"descending"`
- Action menu: `aria-label="Product actions for {product}"`

---

## 4. ROP (Reorder Point) UI

### 4.1 Inline ROP Editor

**Trigger:** Click ROP value in table

**Interface:**

```tsx
<Popover>
  <Stack gap="small">
    <Text variant="headingMd">Adjust Reorder Point</Text>
    <Text variant="bodySm" tone="subdued">
      Current: {currentROP} units
    </Text>

    <NumberField
      label="New ROP"
      value={newROP}
      onChange={setNewROP}
      min={0}
      suffix="units"
    />

    <Text variant="bodySm">
      Suggested: {suggestedROP} units (Lead time demand + safety stock)
    </Text>

    <ButtonGroup>
      <Button onClick={cancel}>Cancel</Button>
      <Button variant="primary" onClick={save}>
        Update ROP
      </Button>
    </ButtonGroup>
  </Stack>
</Popover>
```

### 4.2 ROP Calculation Display

**Tooltip on suggested value:**

```
Suggested ROP: 60 units

Calculation:
• Avg daily sales: 5 units/day
• Lead time: 10 days
• Lead time demand: 50 units
• Safety stock: 10 units (20%)
• ROP = 50 + 10 = 60 units
```

**Accessibility:**

- Popover has `aria-label="Reorder point editor for {product}"`
- NumberField has visible label
- Calculation shown as plain text (not tooltip-only)

---

## 5. PO (Purchase Order) Generation UI

### 5.1 Bulk Selection

**Table Multi-Select:**

```tsx
<Checkbox
  label="Select all products below ROP"
  checked={allBelowROPSelected}
  onChange={toggleAllBelowROP}
/>

<Table>
  {products.map(p => (
    <tr key={p.id}>
      <td>
        <Checkbox
          accessibilityLabel={`Select ${p.title}`}
          checked={selected.includes(p.id)}
          onChange={() => toggleProduct(p.id)}
        />
      </td>
      <td>{p.title}</td>
      <td>{p.quantity}</td>
      <td>{p.rop}</td>
    </tr>
  ))}
</Table>
```

### 5.2 Generate PO Modal

**Trigger:** "Export PO" button (disabled if no selection)

**Modal Content:**

```tsx
<Modal heading="Generate Purchase Order">
  <Stack gap="base">
    <Text>{selectedCount} products selected for reorder</Text>

    <Banner tone="info">
      Review suggested quantities. PO will be exported as CSV.
    </Banner>

    <Table>
      <thead>
        <tr>
          <th scope="col">Product</th>
          <th scope="col">Current</th>
          <th scope="col">ROP</th>
          <th scope="col">Suggested Order</th>
        </tr>
      </thead>
      <tbody>
        {selected.map((p) => (
          <tr key={p.id}>
            <th scope="row">{p.title}</th>
            <td>{p.quantity}</td>
            <td>{p.rop}</td>
            <td>
              <NumberField
                value={p.suggestedOrder}
                onChange={(v) => updateOrder(p.id, v)}
                suffix="units"
              />
            </td>
          </tr>
        ))}
      </tbody>
    </Table>

    <ButtonGroup slot="primary-action">
      <Button onClick={closeModal}>Cancel</Button>
      <Button variant="primary" onClick={generateCSV}>
        Download CSV
      </Button>
      <Button onClick={emailPO}>Email PO</Button>
    </ButtonGroup>
  </Stack>
</Modal>
```

### 5.3 CSV Format

**File name:** `PO-{timestamp}.csv`

**Columns:**

```csv
SKU,Product,Supplier,Current Qty,ROP,Order Qty,Unit Cost,Total Cost
SKU123,Blue Running Shoes,Nike,45,60,75,50.00,3750.00
```

**Accessibility:**

- Modal heading announces to screen readers
- Table structure preserved for screen reader navigation
- All inputs have labels
- Download triggers browser download (no new window)

---

## 6. Bundle & Kit Indicators

### 6.1 Bundle Badge

**Display Pattern:**

```tsx
{
  product.isBundleParent && (
    <InlineStack gap="small-200">
      <Badge tone="info">BUNDLE</Badge>
      <Text variant="bodySm" tone="subdued">
        Contains {bundleItems.length} items
      </Text>
    </InlineStack>
  );
}
```

**Expanded View:**

```tsx
<Collapsible open={expanded}>
  <Stack gap="small">
    <Text variant="bodySm" fontWeight="semibold">
      Bundle Contents:
    </Text>
    <ul>
      {bundleItems.map((item) => (
        <li key={item.id}>
          {item.title} — Qty: {item.quantity}
        </li>
      ))}
    </ul>
  </Stack>
</Collapsible>
```

### 6.2 Picker Piece Count (PACK:X)

**Display Pattern:**

```tsx
{
  product.packCount && (
    <InlineStack gap="small-200">
      <Badge>PACK:{product.packCount}</Badge>
      <Text variant="bodySm" tone="subdued">
        {product.packCount} pieces per unit
      </Text>
    </InlineStack>
  );
}
```

**Picker Payout Calculation:**

```tsx
<Text variant="bodySm">
  Picker rate: ${pickerRate} per piece Total payout: $
  {product.packCount * pickerRate}
</Text>
```

---

## 7. Picker Payout UI

### 7.1 Payout Calculator

**Location:** Settings or Inventory config page

**Interface:**

```tsx
<Card>
  <Stack gap="base">
    <Text variant="headingLg">Picker Payout Brackets</Text>

    <Text variant="bodySm" tone="subdued">
      Set rates per piece for different product categories
    </Text>

    <Table>
      <thead>
        <tr>
          <th scope="col">Piece Count</th>
          <th scope="col">Rate per Piece</th>
          <th scope="col">Example Payout</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1-10 pieces</td>
          <td>
            <MoneyField
              label="Rate"
              labelAccessibilityVisibility="exclusive"
              value={rates.small}
              onChange={setSmallRate}
            />
          </td>
          <td>${rates.small * 10} for 10 pieces</td>
        </tr>
        <tr>
          <td>11-50 pieces</td>
          <td>
            <MoneyField
              label="Rate"
              labelAccessibilityVisibility="exclusive"
              value={rates.medium}
              onChange={setMediumRate}
            />
          </td>
          <td>${rates.medium * 50} for 50 pieces</td>
        </tr>
        <tr>
          <td>51+ pieces</td>
          <td>
            <MoneyField
              label="Rate"
              labelAccessibilityVisibility="exclusive"
              value={rates.large}
              onChange={setLargeRate}
            />
          </td>
          <td>${rates.large * 100} for 100 pieces</td>
        </tr>
      </tbody>
    </Table>

    <Button variant="primary" onClick={saveRates}>
      Save Payout Rates
    </Button>
  </Stack>
</Card>
```

### 7.2 Payout Display (Product Row)

```tsx
{
  product.packCount && (
    <Text variant="bodySm" tone="subdued">
      Picker: ${calculatePayout(product.packCount)} per unit
    </Text>
  );
}
```

**Accessibility:**

- Table has `<caption>Picker Payout Brackets</caption>`
- Money fields have exclusive labels (screen reader only)
- Example payout updates live as rates change

---

## 8. Days of Cover Visualization

### 8.1 Color Coding

| Days of Cover | Color  | Badge Tone | Risk Level |
| ------------- | ------ | ---------- | ---------- |
| ≥30 days      | Green  | `success`  | Low        |
| 15-29 days    | Yellow | `warning`  | Medium     |
| 7-14 days     | Orange | `warning`  | High       |
| <7 days       | Red    | `critical` | Urgent     |

### 8.2 Display Pattern

**Table Cell:**

```tsx
<td>
  <InlineStack gap="small-200" blockAlign="center">
    <Badge tone={coverTone}>{daysOfCover}d</Badge>
    {daysOfCover < 7 && <Icon type="alert-circle-filled" tone="critical" />}
  </InlineStack>
</td>
```

**Tooltip Detail:**

```
Days of Cover: 12 days

Calculation:
• Current quantity: 45 units
• Average daily sales: 3.75 units/day
• 45 ÷ 3.75 = 12 days
```

---

## 9. ROP Suggestion Approvals

### 9.1 Approval Card in Queue

**Summary:**

```
ROP Adjustment — Blue Running Shoes
```

**Evidence Tab:**

```
What changes:
Increase ROP from 50 to 60 units (+20%)

Why now:
Sales velocity increased 15% over 7 days. Current ROP insufficient.

Impact forecast:
Reduces stockout risk from 25% to 5% over next 30 days.
```

**Impact Tab:**

```
Projected Impact:
• Stockout risk: -80%
• Extra inventory cost: +$500
• Improved fulfillment SLA: -2 days average

Risks & Rollback:
1. If sales drop, excess inventory for 2 weeks
2. Rollback: Adjust ROP back to 50 units
3. Monitor: Daily sales velocity for 7 days post-change
```

**Actions Tab:**

```json
{
  "endpoint": "/api/inventory/update-rop",
  "method": "POST",
  "payload": {
    "variant_id": "gid://shopify/ProductVariant/123",
    "new_rop": 60,
    "reason": "Sales velocity increase"
  }
}
```

### 9.2 Microcopy for Approval Drawer

| Element        | Copy                           | Notes                   |
| -------------- | ------------------------------ | ----------------------- |
| Summary        | "ROP Adjustment — {Product}"   | Auto-generated          |
| Kind badge     | `INVENTORY`                    | Uppercase, default tone |
| Approve button | "Approve ROP Change"           | Descriptive action      |
| Apply result   | "ROP updated to {value} units" | Toast notification      |

---

## 10. PO Generation Approval

### 10.1 Approval Card

**Summary:**

```
Purchase Order — {count} products
```

**Evidence Tab:**

```
What changes:
Generate PO for 8 products below ROP

Why now:
Multiple items approaching stockout (3-7 days cover)

Impact forecast:
Replenishes inventory before stockouts occur.
Total order value: ${totalCost}
```

**Actions Tab:**

```json
{
  "endpoint": "/api/inventory/generate-po",
  "method": "POST",
  "payload": {
    "products": [{ "sku": "SKU123", "order_qty": 75, "unit_cost": 50 }],
    "delivery_mode": "csv_download"
  }
}
```

### 10.2 CSV Download Flow

**After Approval:**

1. User clicks "Apply"
2. System generates CSV
3. Browser downloads file: `PO-{timestamp}.csv`
4. Toast: "Purchase order downloaded. Check your Downloads folder."
5. Audit log entry created

**Accessibility:**

- Download announced to screen reader
- Success toast has `role="status"` or `aria-live="polite"`

---

## 11. Responsive Behavior

### 11.1 Inventory Table (Tablet)

**Desktop (≥1280px):**

- 5 columns visible (Product, Qty, ROP, Days, Actions)
- Horizontal scroll not required

**Tablet (768-1279px):**

- 3 columns visible (Product with status, Qty/ROP combined, Actions)
- Days of cover moves to expandable row
- Horizontal scroll with `role="region"` and `aria-label="Inventory table"`

**Mobile (<768px):**

- Card-based layout (not table)
- Each product as card with all data stacked
- Actions as footer buttons

### 11.2 Filters (Responsive)

**Desktop:**

```tsx
<InlineStack gap="base">
  <Select label="Status" options={statusOptions} />
  <Select label="Category" options={categoryOptions} />
  <Button>Apply Filters</Button>
</InlineStack>
```

**Mobile:**

```tsx
<Stack gap="small">
  <Select label="Status" options={statusOptions} />
  <Select label="Category" options={categoryOptions} />
  <Button variant="primary">Apply Filters</Button>
</Stack>
```

---

## 12. Empty & Error States

### 12.1 No Inventory Items

```tsx
<Box padding="large">
  <Stack gap="base" align="center">
    <Icon type="package" size="large" tone="subdued" />
    <Text variant="headingMd">No inventory items yet</Text>
    <Text tone="subdued">
      Connect your Shopify products to see inventory status.
    </Text>
    <Button variant="primary" url="/settings/integrations">
      Connect Shopify
    </Button>
  </Stack>
</Box>
```

### 12.2 All Items Healthy

```tsx
<Banner tone="success">
  All inventory levels healthy. No reorder actions needed.
</Banner>
```

### 12.3 Loading State

```tsx
<SkeletonTable rows={10} columns={5} />
<Text variant="bodySm" tone="subdued" align="center">
  Loading inventory data...
</Text>
```

---

## 13. Microcopy Reference

### 13.1 Status Labels

| Status           | Badge Text       | Full Description                              |
| ---------------- | ---------------- | --------------------------------------------- |
| `in_stock`       | "In Stock"       | "Inventory level above reorder point"         |
| `low_stock`      | "Low Stock"      | "Inventory at or below reorder point"         |
| `out_of_stock`   | "Out of Stock"   | "No units available for sale"                 |
| `urgent_reorder` | "Urgent Reorder" | "Stock depletes before next shipment arrives" |

### 13.2 Action Labels

| Action       | Button Text    | Accessibility Label                          |
| ------------ | -------------- | -------------------------------------------- |
| Adjust ROP   | "Adjust ROP"   | "Adjust reorder point for {product}"         |
| Generate PO  | "Generate PO"  | "Generate purchase order for selected items" |
| Export CSV   | "Export PO"    | "Export purchase order as CSV file"          |
| Email PO     | "Email PO"     | "Email purchase order to supplier"           |
| View History | "View History" | "View inventory history for {product}"       |

### 13.3 Notifications

| Event            | Toast Message                                        | Tone       |
| ---------------- | ---------------------------------------------------- | ---------- |
| ROP updated      | "Reorder point updated to {value} units"             | `success`  |
| PO generated     | "Purchase order downloaded. Check Downloads folder." | `success`  |
| PO emailed       | "Purchase order sent to {supplier}"                  | `success`  |
| Validation error | "Cannot generate PO. Select at least 1 product."     | `critical` |
| Network error    | "Unable to update inventory. Try again."             | `critical` |

---

## 14. Bundle & Kit Patterns

### 14.1 Bundle Parent Display

```tsx
<tr>
  <th scope="row">
    <Stack gap="small-200">
      <InlineStack gap="small-200">
        <Text>{product.title}</Text>
        <Badge tone="info">BUNDLE</Badge>
      </InlineStack>
      <Button
        variant="tertiary"
        onClick={() => toggleBundleExpansion(product.id)}
        accessibilityLabel={`${expanded ? "Collapse" : "Expand"} bundle contents`}
      >
        {expanded ? "Hide" : "Show"} {bundleItems.length} items
      </Button>
    </Stack>
  </th>
  <td>{product.quantity}</td>
  <td>{product.rop}</td>
</tr>
```

### 14.2 Bundle Items (Expanded)

```tsx
{
  expanded &&
    bundleItems.map((item) => (
      <tr key={item.id} className="bundle-item-row">
        <th scope="row" style={{ paddingLeft: "2rem" }}>
          <InlineStack gap="small-200">
            <Icon type="arrow-right" size="small" tone="subdued" />
            <Text>{item.title}</Text>
          </InlineStack>
        </th>
        <td>{item.quantity}</td>
        <td>—</td> {/* Bundle items don't have individual ROP */}
      </tr>
    ));
}
```

**Accessibility:**

- Indented visually and with padding
- Screen reader announces: "Bundle item: {title}"
- Expand/collapse button has descriptive `aria-label`

---

## 15. Accessibility Checklist

### Inventory Table

- [ ] `<table>` with `<caption>`
- [ ] `<th scope="col">` for headers
- [ ] `<th scope="row">` for product names
- [ ] Sortable columns have `aria-sort`
- [ ] Scrollable container has `role="region"` with label
- [ ] Checkbox labels include product name

### ROP Editor

- [ ] Popover has descriptive `aria-label`
- [ ] NumberField has visible label
- [ ] Suggested value visible (not tooltip-only)
- [ ] Keyboard: Enter saves, Escape cancels

### PO Generation

- [ ] Modal heading announces to screen readers
- [ ] Table structure preserved
- [ ] All inputs have labels
- [ ] Success/error announced via toast with `aria-live`

### Bundle Display

- [ ] Expand/collapse button has `aria-label`
- [ ] Expanded state communicated via `aria-expanded`
- [ ] Bundle items indented for screen reader hierarchy

---

## 16. Implementation Priority

**Phase 1 (MVP):**

- [x] Inventory dashboard tile (already in dashboard-tiles.md)
- [ ] Inventory detail table with status buckets
- [ ] ROP inline editor
- [ ] Days of cover calculation display

**Phase 2:**

- [ ] PO generation modal
- [ ] CSV export functionality
- [ ] ROP approval workflow

**Phase 3:**

- [ ] Bundle/kit expansion UI
- [ ] Picker payout calculator
- [ ] Email PO functionality

---

## 17. Cross-References

**Related Specs:**

- Dashboard tile: `docs/design/dashboard-tiles.md` section 4.4
- Approvals drawer: `docs/design/approvals_microcopy.md`
- Design system: `docs/design/design-system-guide.md`
- Accessibility: `docs/design/component-accessibility-reference.md`

**API Contracts:**

- Inventory data: `/api/inventory/status`
- ROP update: `/api/inventory/update-rop`
- PO generation: `/api/inventory/generate-po`

---

## Change Log

- **2025-10-19:** v1.0 - Initial inventory system UI patterns (North Star scope #2)
