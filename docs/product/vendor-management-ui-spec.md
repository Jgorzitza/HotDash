# Vendor Management UI Specification

**Owner**: Product Agent  
**Beneficiary**: Inventory + Engineer  
**Created**: 2025-10-22  
**Version**: 1.0  
**Status**: Final  
**Backend Service**: INVENTORY-016 (vendor-service.ts)

---

## Overview

This document defines the complete UI/UX for **Vendor Management** - allowing operators to manage vendors, track reliability, and select vendors for purchase orders.

**Goal**: Enable operators to manage vendor relationships and make data-driven vendor selection decisions based on cost, speed, and reliability.

---

## User Persona

**Inventory Manager/Operator**:

- Manages 10-20 vendor relationships
- Creates 2-5 purchase orders per week
- Wants to see: "Which vendor is most reliable for this product?"
- Needs quick answers: "Should I use Vendor A or Vendor B?"
- Key concerns: Cost, lead time, on-time delivery rate

---

## 1. Vendor List View

**Location**: `/dashboard/vendors` or Vendors tile on main dashboard

**Purpose**: Overview of all vendors with key metrics

### Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Vendors                                                    [+ Add Vendor]    │
│                                                                              │
│ Search: [________________]  Filter: [All ▾] [Active ▾]  Sort: [Name ▾]     │
│                                                                              │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ Summary                                                                  │ │
│ │ Total Vendors: 12 (10 active, 2 inactive)                               │ │
│ │ Reliability: 🏆 Excellent: 4 | ✓ Good: 5 | ⚠️ Fair: 2 | ❌ Poor: 1    │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ Name                    Reliability  Lead Time  Last Order    Actions   │ │
│ ├──────────────────────────────────────────────────────────────────────────┤ │
│ │ 🏆 Premium Suppliers    95% (19/20)    7 days   Oct 15, 2025  [Edit]   │ │
│ │    Contact: John Smith (john@premium.com)                     [Details] │ │
│ │    12 Products | Payment: Net 30                              [PO]      │ │
│ ├──────────────────────────────────────────────────────────────────────────┤ │
│ │ ✓ Fast Logistics        88% (22/25)    3 days   Oct 20, 2025  [Edit]   │ │
│ │    Contact: Sarah Lee (sarah@fast.com)                        [Details] │ │
│ │    8 Products | Payment: Net 15                               [PO]      │ │
│ ├──────────────────────────────────────────────────────────────────────────┤ │
│ │ ⚠️ Budget Wholesalers   72% (18/25)   14 days   Oct 10, 2025  [Edit]   │ │
│ │    Contact: Mike Chen (mike@budget.com)                       [Details] │ │
│ │    15 Products | Payment: Net 45                              [PO]      │ │
│ ├──────────────────────────────────────────────────────────────────────────┤ │
│ │ ❌ Slow Vendor          45% (9/20)    21 days   Sep 28, 2025  [Edit]   │ │
│ │    Contact: N/A                                               [Details] │ │
│ │    3 Products | Payment: COD | ⚠️ Consider replacing         [PO]      │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ Showing 4 of 12 vendors                                    [1] 2 3 [Next]  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Table Columns

**Required Columns**:

1. **Name** - Vendor name with reliability tier icon
2. **Reliability** - Score % with on-time/total ratio (e.g., "95% (19/20)")
3. **Lead Time** - Average lead time in days
4. **Last Order** - Date of most recent PO
5. **Actions** - Edit, Details, Create PO buttons

**Expandable Row Details** (click name or Details):

- Contact name, email, phone
- Product count (number of mapped products)
- Payment terms
- Special notes/warnings

### Reliability Tier Icons

- 🏆 **Excellent**: >= 95% (dark green)
- ✓ **Good**: 85-94% (green)
- ⚠️ **Fair**: 70-84% (yellow/amber)
- ❌ **Poor**: < 70% (red) + warning message

### Filters

- **Status**: All | Active | Inactive
- **Reliability**: All | Excellent | Good | Fair | Poor
- **Has Products**: All | With Mappings | No Mappings

### Sort Options

- Name (A-Z) - default
- Reliability (highest first)
- Lead Time (shortest first)
- Last Order (most recent first)
- Product Count (highest first)

---

## 2. Add/Edit Vendor Modal

**Trigger**: Click "+ Add Vendor" or "Edit" button

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ Add New Vendor                                         [X Close] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Basic Information                                               │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Vendor Name *                                               │ │
│ │ [_____________________________________________________]     │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Contact Details                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Contact Name                                                │ │
│ │ [_____________________________________________________]     │ │
│ │                                                             │ │
│ │ Email                                                       │ │
│ │ [_____________________________________________________]     │ │
│ │                                                             │ │
│ │ Phone                                                       │ │
│ │ [_____________________________________________________]     │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Logistics                                                       │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Lead Time (days) *     Ship Method                          │ │
│ │ [____14____] days     [_Ground Freight___________]          │ │
│ │                                                             │ │
│ │ Drop Ship?            Currency                              │ │
│ │ [☐] Yes               [USD ▾]                               │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Payment Terms                                                   │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [Net 30 ▾]  or  Custom: [_________________________]         │ │
│ │                                                             │ │
│ │ Common options: Net 15, Net 30, Net 45, COD, Prepaid        │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Additional Information                                          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Notes (internal only)                                       │ │
│ │ [_____________________________________________________]     │ │
│ │ [_____________________________________________________]     │ │
│ │ [_____________________________________________________]     │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│                                    [Cancel] [Save Vendor]       │
└─────────────────────────────────────────────────────────────────┘
```

### Field Validation

**Required Fields** (\*):

- Vendor Name (min 2 chars)
- Lead Time (positive integer)

**Optional Fields**:

- Contact details (all optional but recommended)
- Ship method (text field)
- Drop ship flag (boolean)
- Currency (default: USD)
- Payment terms (default: Net 30)
- Notes (unlimited text)

### Save Behavior

**New Vendor**:

- Creates vendor record with isActive: true
- Initial reliability metrics: totalOrders=0, reliabilityScore=0
- Success message: "✅ Vendor 'Premium Suppliers' added successfully"
- Action: Close modal, refresh vendor list

**Edit Vendor**:

- Updates vendor record (preserves reliability metrics)
- Success message: "✅ Vendor 'Premium Suppliers' updated"
- Action: Close modal, refresh vendor list

---

## 3. Vendor Detail View

**Trigger**: Click vendor name or "Details" button

**Purpose**: Deep dive into vendor performance and product mappings

### Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Premium Suppliers                                                  [X Close]│
│ Contact: John Smith · john@premium.com · (555) 123-4567                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Performance Metrics                                                     │ │
│ │                                                                         │ │
│ │ 🏆 Reliability Score: 95% (19 on-time / 20 total orders)               │ │
│ │ ⏱️ Avg Lead Time: 6.8 days (from last 10 orders)                       │ │
│ │ 📦 Total Orders: 20 (since Jan 2025)                                   │ │
│ │ ✅ On-Time Deliveries: 19                                               │ │
│ │ ⚠️ Late Deliveries: 1 (avg 2 days late)                                 │ │
│ │ 📅 Last Order: Oct 15, 2025 (PO-2025-042)                              │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Logistics & Terms                                                       │ │
│ │                                                                         │ │
│ │ Lead Time: 7 days | Ship Method: Ground Freight                        │ │
│ │ Payment Terms: Net 30 | Currency: USD                                  │ │
│ │ Drop Ship: No                                                           │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Product Mappings (12 products)                            [+ Add SKU]   │ │
│ │                                                                         │ │
│ │ Product               SKU        Cost/Unit  Min Qty  Preferred  Actions│ │
│ │ ───────────────────────────────────────────────────────────────────────│ │
│ │ Powder Snowboard 162  PS-162     $245.00      1      ⭐ Yes    [Edit]  │ │
│ │ Carbon Bindings XL    CB-XL      $189.00      2      ⭐ Yes    [Edit]  │ │
│ │ Ski Wax Kit           WAX-01     $24.99       6         No     [Edit]  │ │
│ │ Roof Box Large        RB-L       $425.00      1      ⭐ Yes    [Edit]  │ │
│ │ ...                                                                     │ │
│ │                                                                         │ │
│ │ [Show All 12 Products]                                                  │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Recent Purchase Orders (Last 10)                                        │ │
│ │                                                                         │ │
│ │ PO Number    Order Date  Expected    Actual      On Time  Status       │ │
│ │ ───────────────────────────────────────────────────────────────────────│ │
│ │ PO-2025-042  Oct 15      Oct 22     Oct 21      ✅ Yes   Received      │ │
│ │ PO-2025-038  Oct 08      Oct 15     Oct 14      ✅ Yes   Received      │ │
│ │ PO-2025-031  Sep 25      Oct 02     Oct 05      ❌ No    Received      │ │
│ │ PO-2025-025  Sep 15      Sep 22     Sep 21      ✅ Yes   Received      │ │
│ │ ...                                                                     │ │
│ │                                                                         │ │
│ │ [Show All Orders]                                                       │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Notes                                                                   │ │
│ │                                                                         │ │
│ │ "Reliable vendor for premium snowboard products. Contact John for      │ │
│ │  rush orders - can reduce lead time to 4-5 days for additional fee."   │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│                                      [Edit Vendor] [Deactivate] [Close]    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Visual Indicators

**Reliability Badges**:

- 🏆 **Excellent** (>=95%): Dark green badge
- ✓ **Good** (85-94%): Green badge
- ⚠️ **Fair** (70-84%): Yellow badge
- ❌ **Poor** (<70%): Red badge + "Consider replacing" warning

**On-Time Indicators**:

- ✅ **On Time**: Green checkmark
- ❌ **Late**: Red X with days late in tooltip

**Preferred Vendor**:

- ⭐ Star icon for preferred vendors (in product mappings)

---

## 4. Multi-SKU Management UI

**Location**: Vendor Detail View → Product Mappings section

**Purpose**: Manage multiple vendors for the same product variant

### Add SKU to Vendor Modal

```
┌─────────────────────────────────────────────────────────────────┐
│ Add Product to Premium Suppliers                       [X Close]│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Product Selection                                               │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Search Products: [_powder snowboard___________] 🔍         │ │
│ │                                                             │ │
│ │ Results:                                                    │ │
│ │ • Powder Snowboard 162 (gid://...Product/123)              │ │
│ │   → Variant: 162cm (gid://...Variant/456)                  │ │
│ │   → Current vendors: Fast Logistics ($255)                 │ │
│ │   [Select This Variant]                                    │ │
│ │                                                             │ │
│ │ • Powder Snowboard 170 (gid://...Product/123)              │ │
│ │   → Variant: 170cm (gid://...Variant/457)                  │ │
│ │   → Current vendors: None                                  │ │
│ │   [Select This Variant]                                    │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Vendor SKU Mapping                                              │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Vendor SKU *                                                │ │
│ │ [_PS-162__________________________________________]         │ │
│ │                                                             │ │
│ │ Vendor Product Name (optional)                              │ │
│ │ [_Powder Board 162cm Premium Edition______________]         │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Pricing & Ordering                                              │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Cost Per Unit *          Minimum Order Quantity             │ │
│ │ $ [_245.00__]           [__1__] units                       │ │
│ │                                                             │ │
│ │ ⭐ Set as Preferred Vendor for this product                 │ │
│ │ [☐] Make this the default vendor for this variant          │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Notes                                                           │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [_Premium quality, ships in original packaging_____]        │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│                                         [Cancel] [Add Mapping]  │
└─────────────────────────────────────────────────────────────────┘
```

### Multi-Vendor Indicator

When viewing a product with multiple vendors, show comparison:

```
┌─────────────────────────────────────────────────────────────────┐
│ Powder Snowboard 162cm - Vendor Options                         │
│                                                                 │
│ Vendor              Cost    Lead Time  Reliability  Actions    │
│ ─────────────────────────────────────────────────────────────  │
│ ⭐ Premium Suppliers $245    7 days    95% 🏆       [Select]   │
│ Fast Logistics      $255    3 days    88% ✓        [Select]   │
│ Budget Wholesalers  $210   14 days    72% ⚠️       [Select]   │
│                                                                 │
│ 💡 Recommendation: Premium Suppliers (best reliability)         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. PO Creation Flow with Vendor Selection

**Location**: Create PO workflow (triggered from Inventory tile or Vendors page)

**Purpose**: Select vendor when creating purchase order

### Step 1: Vendor Selection

```
┌─────────────────────────────────────────────────────────────────┐
│ Create Purchase Order - Step 1: Select Vendor                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Select Vendor for this PO:                                      │
│                                                                 │
│ ○ Premium Suppliers                                             │
│   95% reliable · 7d lead · Last order: Oct 15                  │
│   [View Details]                                                │
│                                                                 │
│ ○ Fast Logistics                                                │
│   88% reliable · 3d lead · Last order: Oct 20                  │
│   [View Details]                                                │
│                                                                 │
│ ○ Budget Wholesalers                                            │
│   72% reliable · 14d lead · Last order: Oct 10                 │
│   [View Details]                                                │
│                                                                 │
│ [+ Add New Vendor]                                              │
│                                                                 │
│                                           [Cancel] [Next Step]  │
└─────────────────────────────────────────────────────────────────┘
```

### Step 2: Add Products (With Vendor Context)

```
┌─────────────────────────────────────────────────────────────────┐
│ Create PO - Step 2: Add Products (Premium Suppliers)           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Search Products: [_powder_____________________] 🔍             │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Available from Premium Suppliers (12 products):             │ │
│ │                                                             │ │
│ │ ⭐ Powder Snowboard 162 · SKU: PS-162 · $245.00/unit        │ │
│ │    Min Order: 1 · Last ordered: Sep 15 (20 units)          │ │
│ │    Qty: [__5__] units  [Add to PO]                         │ │
│ │                                                             │ │
│ │ ⭐ Carbon Bindings XL · SKU: CB-XL · $189.00/unit           │ │
│ │    Min Order: 2 · Last ordered: Oct 01 (10 units)          │ │
│ │    Qty: [__4__] units  [Add to PO]                         │ │
│ │                                                             │ │
│ │ Ski Wax Kit · SKU: WAX-01 · $24.99/unit                    │ │
│ │    Min Order: 6 · Never ordered before                     │ │
│ │    Qty: [_12__] units  [Add to PO]                         │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ PO Summary:                                                     │
│ - 0 products added                                              │
│ - Estimated Total: $0.00                                        │
│                                                                 │
│                                  [Back] [Cancel] [Next: Review] │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Filtering & Sorting Features

### Quick Filters (Chips)

```
Active Filters: [All Vendors ▾] [🏆 Excellent] [✓ Good] [⚠️ Fair] [❌ Poor]

Selected: 🏆 Excellent (4 vendors)    [Clear Filter]
```

### Advanced Filter Panel

```
┌─────────────────────────────────────────────────────────────────┐
│ Advanced Filters                                                │
│                                                                 │
│ Reliability Score:                                              │
│ [Min: 85__] to [Max: 100__] %                                  │
│                                                                 │
│ Lead Time:                                                      │
│ [Min: 0__] to [Max: 14__] days                                 │
│                                                                 │
│ Last Order:                                                     │
│ From: [2025-01-01] To: [2025-10-21]                            │
│                                                                 │
│ Has Product Mappings:                                           │
│ [✓] With mappings  [☐] Without mappings                        │
│                                                                 │
│                                    [Clear All] [Apply Filters]  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Mobile Experience

### Vendor List (Mobile)

```
┌─────────────────────────────────┐
│ Vendors             [+ Add]     │
│                                 │
│ Search: [____________] 🔍       │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🏆 Premium Suppliers        │ │
│ │ 95% reliable · 7d lead      │ │
│ │ 12 products · Oct 15        │ │
│ │ [Details ▾]                 │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ ✓ Fast Logistics            │ │
│ │ 88% reliable · 3d lead      │ │
│ │ 8 products · Oct 20         │ │
│ │ [Details ▾]                 │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### Vendor Detail (Mobile)

```
┌─────────────────────────────────┐
│ Premium Suppliers      [X]      │
│                                 │
│ 🏆 95% Reliable                 │
│ ⏱️ 7 days lead time             │
│ 📦 20 orders (19 on-time)       │
│                                 │
│ [Contact ▾]                     │
│ [12 Products ▾]                 │
│ [Recent POs ▾]                  │
│                                 │
│ [Edit] [Create PO]              │
└─────────────────────────────────┘
```

---

## 8. Data Requirements (for Engineer)

**API Endpoints** (from vendor-service.ts):

1. `GET /api/vendors` - List all vendors
   - Query params: status, reliability tier, has mappings
   - Response: Array of vendors with metrics

2. `GET /api/vendors/:id` - Vendor detail with metrics
   - Uses: `getVendorWithMetrics(vendorId)`
   - Response: Vendor + reliability score + avg lead time + recent POs

3. `POST /api/vendors` - Create new vendor
   - Body: name, contact details, logistics, payment terms
   - Response: Created vendor object

4. `PUT /api/vendors/:id` - Update vendor
   - Body: Same as create (partial updates allowed)
   - Response: Updated vendor object

5. `GET /api/vendors/options` - Vendor dropdown options
   - Query params: variantId (optional)
   - Uses: `getVendorOptions(variantId?)`
   - Response: Formatted vendor options for UI dropdown

6. `GET /api/vendors/best/:variantId` - Best vendor recommendation
   - Query params: criteria (cost/speed/reliability)
   - Uses: `getBestVendorForProduct(variantId, criteria)`
   - Response: Best vendor mapping

7. `GET /api/vendors/reliability-tiers` - Vendor count by tier
   - Uses: `getVendorReliabilityTiers()`
   - Response: {excellent, good, fair, poor} counts

**UI Components Needed**:

1. VendorTable component (sortable, filterable)
2. VendorDetailModal component
3. AddEditVendorModal component
4. VendorSelectorCard component (for PO creation)
5. ProductMappingTable component
6. VendorReliabilityBadge component (reusable)

---

## 9. User Workflows

### Workflow 1: Add New Vendor

1. Click "+ Add Vendor" button
2. Fill required fields (name, lead time)
3. Fill optional contact/logistics fields
4. Click "Save Vendor"
5. Success message appears
6. Modal closes, vendor list refreshes
7. New vendor appears in list with 0% reliability (no orders yet)

### Workflow 2: Add Product Mapping to Vendor

1. Open vendor detail view
2. Click "+ Add SKU" in Product Mappings section
3. Search for product variant
4. Select variant from results
5. Enter vendor SKU, cost per unit, min quantity
6. Optionally mark as preferred vendor
7. Click "Add Mapping"
8. Product mapping appears in vendor's product list

### Workflow 3: Create PO with Vendor

1. Click "Create PO" from vendors page
2. Select vendor from list (shows reliability + lead time)
3. View vendor's products with costs
4. Add products to PO with quantities
5. Review PO summary with expected delivery date
6. Submit PO
7. PO appears in vendor's recent orders

### Workflow 4: Compare Vendors for Product

1. Search for product in inventory
2. View product detail
3. See "Available from 3 vendors" section
4. Compare side-by-side: cost, lead time, reliability
5. See recommendation based on selected criteria
6. Click "Select" to add to PO or change preferred vendor

---

## 10. Edge Cases & Error States

### No Vendors Yet

```
┌─────────────────────────────────────────┐
│ No Vendors Found                        │
│                                         │
│ You haven't added any vendors yet.      │
│ Add your first vendor to start          │
│ managing purchase orders.               │
│                                         │
│ [+ Add Your First Vendor]               │
└─────────────────────────────────────────┘
```

### Vendor with No Products

```
┌─────────────────────────────────────────┐
│ ⚠️ No Product Mappings                  │
│                                         │
│ This vendor has no products mapped.     │
│ Add products to create purchase orders. │
│                                         │
│ [+ Add Product Mapping]                 │
└─────────────────────────────────────────┘
```

### Low Reliability Warning

```
┌─────────────────────────────────────────┐
│ ⚠️ Low Reliability Vendor                │
│                                         │
│ Slow Vendor has 45% on-time delivery.  │
│                                         │
│ Consider:                               │
│ • Finding alternative vendors           │
│ • Adding buffer time to lead times      │
│ • Discussing performance with vendor    │
│                                         │
│ [Find Alternatives] [Continue Anyway]   │
└─────────────────────────────────────────┘
```

---

## 11. Success Metrics

**UX Quality Metrics**:

- Operator can find best vendor for product in <10 seconds
- Vendor selection confidence increases (survey)
- PO creation time decreases by 30%

**Business Metrics**:

- Operator uses reliability data for vendor decisions (measured by clicks on "Best Vendor")
- Preferred vendors have >90% reliability on average
- Late deliveries decrease by 20% through better vendor selection

---

## 12. Implementation Priority

**Phase 1 (MVP)** - Week 1:

1. Vendor list view (basic table)
2. Add/edit vendor modal
3. Reliability badge display

**Phase 2** - Week 2: 4. Vendor detail view with metrics 5. Product mapping management 6. Filtering and sorting

**Phase 3** - Week 3: 7. PO creation with vendor selection 8. Multi-vendor comparison 9. Mobile optimization

---

## Engineer Implementation Notes

**Data Sources**:

- Backend service: `app/services/inventory/vendor-service.ts`
- API wrapper needed for UI state management
- Real-time reliability updates via websocket (optional Phase 3)

**Component Structure**:

```
app/routes/dashboard/vendors/
  index.tsx           # Vendor list view
  $vendorId.tsx       # Vendor detail view
  new.tsx             # Add vendor (modal or page)

app/components/vendors/
  VendorTable.tsx
  VendorDetailModal.tsx
  AddEditVendorModal.tsx
  VendorReliabilityBadge.tsx
  ProductMappingTable.tsx
  VendorSelectorCard.tsx
```

**State Management**:

- Vendor list state (for filtering/sorting)
- Active vendor detail (for modal)
- PO creation state (selected vendor, products)

---

## Change Log

**v1.0 - 2025-10-22**:

- Initial UI specification
- Defined all major views (List, Detail, Add/Edit, Multi-SKU)
- Specified vendor selection for PO creation
- Defined filtering, sorting, and mobile experience

---

**Status**: Ready for Engineer implementation  
**Dependencies**: INVENTORY-016 complete ✅  
**Next Step**: Engineer implements UI components and routes
