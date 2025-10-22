# Vendor Management UX Copy

**Purpose**: Operator-facing copy for Vendor Management UI  
**Owner**: Content  
**Beneficiary**: Product (PRODUCT-016) + Engineer  
**Status**: Production-ready  
**Last Updated**: 2025-10-21

---

## Overview

Vendor Management allows operators to track supplier information, reliability metrics, and lead times for inventory ordering. This copy ensures operators understand vendor performance and can make informed purchasing decisions.

---

## 1. Page Title & Description

**Page Title**

```
Vendor Management
```

- Format: H1 heading
- Position: Top of page
- Accessibility: `<h1>` with `id="page-title"`

**Page Description**

```
Manage your suppliers, track reliability, and optimize lead times for inventory ordering.
```

- Position: Below title
- Style: Subdued text
- Purpose: Quick context for operators

---

## 2. Vendor List Table

### Column Headers

**Vendor Name**

```
Vendor Name
```

- Sortable: Yes (alphabetical)
- Width: 25%

**Contact**

```
Contact
```

- Display: Email or phone
- Width: 20%

**Reliability Score**

```
Reliability Score
```

- Sortable: Yes (numeric, high to low default)
- Tooltip: "Calculated as: On-time deliveries ÷ Total deliveries × 100%"
- Display format: `92%` with color badge
- Width: 15%

**Avg Lead Time**

```
Avg Lead Time
```

- Sortable: Yes (numeric, low to high)
- Tooltip: "Average days from PO submission to delivery"
- Display format: `7 days`
- Width: 15%

**Active Products**

```
Active Products
```

- Sortable: Yes (numeric)
- Tooltip: "Number of products sourced from this vendor"
- Display format: `24 products`
- Width: 15%

**Status**

```
Status
```

- Display: Badge (Active, Inactive, On Hold)
- Width: 10%

---

## 3. Field Labels & Placeholders

### Add/Edit Vendor Form

**Vendor Name Field**

```
Label: Vendor Name *
Placeholder: Enter vendor or supplier name
```

- Required: Yes
- Validation: 2-100 characters
- Example: "Acme Boards Inc."

**Contact Email Field**

```
Label: Contact Email *
Placeholder: vendor@example.com
```

- Required: Yes
- Validation: Valid email format
- Tooltip: "Primary contact for purchase orders and inquiries"

**Contact Phone Field**

```
Label: Contact Phone
Placeholder: (555) 123-4567
```

- Required: No
- Validation: Valid phone format
- Tooltip: "Optional backup contact method"

**Lead Time Field**

```
Label: Lead Time (Days) *
Placeholder: 7
```

- Required: Yes
- Validation: 1-365 days
- Tooltip: "Average days from order placement to delivery. Used for ROP calculations."
- Help text: "Enter the typical lead time. You can adjust this based on actual performance."

**Minimum Order Quantity Field**

```
Label: Minimum Order Quantity (MOQ)
Placeholder: 50
```

- Required: No
- Validation: Positive integer
- Tooltip: "Smallest order quantity this vendor accepts"
- Help text: "Leave blank if no minimum"

**Payment Terms Field**

```
Label: Payment Terms
Placeholder: Net 30
```

- Required: No
- Validation: Free text, 1-50 characters
- Examples: "Net 30", "Net 60", "COD", "Prepaid"
- Tooltip: "Standard payment terms for this vendor"

**Notes Field**

```
Label: Internal Notes
Placeholder: Add notes about this vendor (quality, communication, special terms)
```

- Required: No
- Validation: 0-1,000 characters
- Multiline: Yes (textarea)
- Purpose: Operator context for vendor selection

**Status Toggle**

```
Label: Vendor Status
Options:
  - Active (default)
  - Inactive
  - On Hold
```

- Help text: "Inactive vendors won't appear in PO creation dropdowns"

---

## 4. Tooltips

**Reliability Score Calculation**

```
On-time deliveries ÷ Total deliveries × 100%
```

- Full explanation: "Calculated from your PO history. Updates automatically when deliveries are confirmed. Score ≥90% is excellent, 70-89% is good, <70% needs attention."

**Lead Time Impact**

```
Used for ROP calculations
```

- Full explanation: "Lead time determines when to reorder. Longer lead times = higher safety stock needed. System uses this for automatic reorder point suggestions."

**Active Products Count**

```
Products sourced from this vendor
```

- Full explanation: "Number of products in your catalog that list this vendor as primary supplier. Click to view product list."

**MOQ (Minimum Order Quantity)**

```
Smallest order quantity accepted
```

- Full explanation: "Some vendors require minimum order quantities. System will warn if your PO is below this threshold."

**Payment Terms**

```
Standard payment terms
```

- Full explanation: "Your agreed payment terms with this vendor (e.g., Net 30 means payment due 30 days after invoice). Used for cash flow planning."

---

## 5. Empty States

**No Vendors Yet**

```
No vendors yet. Add your first supplier to get started.
```

- Icon: 📦 (package)
- Action button: "Add Vendor"
- Additional: "Vendors help you track supplier performance and optimize ordering."

**No Search Results**

```
No vendors match "[search term]"
```

- Icon: 🔍 (magnifying glass)
- Action button: "Clear search"
- Additional: "Try a different search term or browse all vendors."

**No Active Vendors**

```
All vendors are inactive.
```

- Icon: ⚠️ (warning)
- Action button: "Activate Vendors"
- Additional: "You need at least one active vendor to create purchase orders."

---

## 6. Validation Error Messages

**Vendor Name Required**

```
❌ Vendor name is required
```

**Vendor Name Too Long**

```
❌ Vendor name must be 100 characters or less (current: [count])
```

**Invalid Email Format**

```
❌ Please enter a valid email address (e.g., vendor@example.com)
```

**Lead Time Out of Range**

```
❌ Lead time must be between 1-365 days
```

**Lead Time Not a Number**

```
❌ Lead time must be a number
```

**MOQ Negative**

```
❌ Minimum order quantity must be 0 or greater
```

**Duplicate Vendor**

```
❌ A vendor with this name already exists. Use a unique name or update the existing vendor.
```

**Contact Email or Phone Required**

```
❌ Provide at least one contact method (email or phone)
```

---

## 7. Success/Confirmation Messages

**Vendor Created**

```
Vendor added successfully! ✓
```

- Type: Toast notification
- Duration: 3 seconds
- Style: Success (green)
- Additional: "[Vendor Name] is now active and available for purchase orders."

**Vendor Updated**

```
Vendor updated ✓
```

- Type: Toast notification
- Duration: 2 seconds
- Style: Success (green)

**Vendor Deleted (Confirmation Dialog)**

```
Delete [Vendor Name]?

This will remove the vendor from your system. Active purchase orders will not be affected, but you won't be able to create new POs for this vendor.

This action cannot be undone.
```

- Buttons: "Delete Vendor" (danger, red) | "Cancel"

**Vendor Deleted (Success)**

```
Vendor deleted
```

- Type: Toast notification
- Duration: 2 seconds
- Style: Info (neutral)

**Vendor Activated**

```
[Vendor Name] activated ✓
```

- Type: Toast notification
- Duration: 2 seconds
- Style: Success (green)
- Additional: "Now available for purchase orders"

**Vendor Deactivated**

```
[Vendor Name] deactivated
```

- Type: Toast notification
- Duration: 2 seconds
- Style: Info
- Additional: "Hidden from PO creation. Reactivate anytime."

---

## 8. Help Text & Descriptions

**Reliability Score Badge**

Color coding:

- **Green (≥90%)**: `"Excellent"`
- **Yellow (70-89%)**: `"Good"`
- **Red (<70%)**: `"Needs Attention"`

Help text below badge:

```
Based on [X] deliveries in last 90 days
```

**Lead Time Help**

```
💡 Tip: Update lead time if vendor performance changes. This affects reorder point calculations.
```

- Position: Below lead time field
- Style: Info box (light blue background)

**MOQ Help**

```
💡 Tip: System will warn if your PO is below vendor's minimum. Some vendors waive MOQ for established customers.
```

- Position: Below MOQ field
- Style: Info box

**Payment Terms Help**

```
💡 Common terms: Net 30 (pay within 30 days), Net 60, COD (cash on delivery), Prepaid (pay before shipment)
```

- Position: Below payment terms field
- Style: Info box

---

## 9. Search & Filter Copy

**Search Placeholder**

```
Search vendors by name, email, or products...
```

**Filter Dropdown Label**

```
Filter by Status
```

- Options: "All", "Active", "Inactive", "On Hold"

**Sort Dropdown Label**

```
Sort by
```

- Options:
  - "Reliability (High to Low)"
  - "Reliability (Low to High)"
  - "Lead Time (Shortest First)"
  - "Lead Time (Longest First)"
  - "Name (A-Z)"
  - "Name (Z-A)"
  - "Products (Most to Least)"

---

## 10. Bulk Actions Copy

**Select All Checkbox**

```
aria-label="Select all vendors on this page"
```

**Bulk Actions Dropdown**

```
Bulk Actions
```

- Options:
  - "Activate Selected"
  - "Deactivate Selected"
  - "Export to CSV"
  - "Delete Selected"

**Bulk Action Confirmation**

```
Activate [X] vendors?

This will make [X] vendors available for purchase orders.
```

- Buttons: "Activate [X] Vendors" | "Cancel"

**Bulk Action Success**

```
[X] vendors activated ✓
```

- Type: Toast notification
- Duration: 3 seconds

---

## 11. Integration with Engineer

### Copy Constants Location

Recommended file structure:

```
app/
  config/
    copy/
      pii-card.ts       (from CONTENT-020)
      vendor-mgmt.ts    (this document)
```

### Usage Example

```typescript
import { VENDOR_MGMT_COPY } from "~/config/copy/vendor-mgmt";

// In component
<Label>{VENDOR_MGMT_COPY.fieldLabels.leadTime}</Label>
<Tooltip content={VENDOR_MGMT_COPY.tooltips.leadTime} />
```

### Accessibility Integration

All `aria-label` strings should use copy constants for consistency and easier updates.

---

**END OF DOCUMENT**

Total Lines: 450+  
Status: Production-ready for Product/Engineer integration  
Dependencies: Product completes PRODUCT-016 UI spec  
Next: Engineer implements copy in Vendor Management UI
