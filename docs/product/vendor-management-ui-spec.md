# Vendor Management UI Specification

**Owner**: Product  
**Beneficiary**: Inventory + Engineer  
**Task**: PRODUCT-016  
**Status**: Complete  
**Created**: 2025-10-23  
**Estimated**: 2h  

---

## Overview

This document provides comprehensive UI specifications for the Vendor Management system, enabling operators to manage vendor relationships, track performance metrics, and optimize supplier selection for inventory management.

## System Architecture

### Data Flow
```
Vendor Management Service → UI Components → Operator Actions → Database Updates
```

### Key Components
- **Vendor List View**: Table with performance metrics and actions
- **Vendor Modal**: Add/edit vendor information
- **Multi-SKU Management**: Handle same product from multiple vendors
- **PO Creation Flow**: Vendor selection for purchase orders
- **Performance Dashboard**: Reliability and cost analysis

---

## 1. Vendor List View

### Route: `/dashboard/vendors`
### Component: `<VendorList />`

#### Table Structure

| Column | Data Type | Description | Sortable |
|--------|-----------|-------------|----------|
| Vendor Name | String | Primary identifier | ✅ |
| Contact | String | Email/phone | ❌ |
| Reliability Score | Number | 0-100% on-time delivery | ✅ |
| Lead Time | Number | Average days | ✅ |
| Cost Rating | String | Low/Medium/High | ✅ |
| Last Order | Date | Most recent order | ✅ |
| Status | Badge | Active/Inactive | ✅ |
| Actions | Buttons | Edit/Details/PO | ❌ |

#### Table Layout

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 🏢 Vendor Management                                    [+ Add Vendor] [Filter] │
├─────────────────────────────────────────────────────────────────────────────────┤
│ Vendor Name    │ Contact        │ Reliability │ Lead Time │ Cost │ Last Order │ Actions │
├─────────────────────────────────────────────────────────────────────────────────┤
│ Acme Supply    │ acme@email.com  │ 95% 🟢      │ 7 days    │ Low  │ 2025-10-20 │ [Edit]  │
│ Best Parts     │ parts@best.com │ 78% 🟡      │ 12 days   │ Med  │ 2025-10-18 │ [Edit]  │
│ Quick Ship     │ ship@quick.com │ 45% 🔴      │ 5 days    │ High │ 2025-10-15 │ [Edit]  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### Filtering & Sorting

**Filter Options**:
- Reliability Score: Excellent (90%+), Good (70-89%), Fair (50-69%), Poor (<50%)
- Lead Time: Fast (≤7 days), Medium (8-14 days), Slow (15+ days)
- Cost Rating: Low, Medium, High
- Status: Active, Inactive
- Last Order: Last 30 days, Last 90 days, Last year

**Sort Options**:
- Default: Reliability Score (descending)
- Lead Time (ascending)
- Cost Rating (ascending)
- Last Order (descending)
- Vendor Name (ascending)

#### Search Functionality

**Search Fields**:
- Vendor name (partial match)
- Contact email/phone
- Notes/description

**Search UI**:
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 🔍 Search vendors...                    [Reliability: All ▼] [Lead Time: All ▼] │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Add/Edit Vendor Modal

### Component: `<VendorModal />`
### Trigger: [+ Add Vendor] button or [Edit] action

#### Modal Structure

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ ✏️ Add Vendor                                                    [×] Close     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│ Basic Information                                                               │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ Vendor Name*        [Acme Supply Co.                    ]                   │ │
│ │ Contact Email       [acme@supply.com                    ]                   │ │
│ │ Contact Phone       [(555) 123-4567                     ]                   │ │
│ │ Website             [https://acme-supply.com            ]                   │ │
│ │ Notes               [Primary supplier for automotive parts]                 │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│ Performance Settings                                                           │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ Expected Lead Time* [14] days                                             │ │
│ │ Reliability Target  [90] %                                                │ │
│ │ Cost Category       [Low ▼]                                                │ │
│ │ Preferred Vendor    [☐] Yes (prioritize in recommendations)               │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│ [Cancel]                                    [Save Vendor]                       │
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### Form Validation

**Required Fields**:
- Vendor Name (min 2 characters)
- Contact Email (valid email format)
- Expected Lead Time (1-365 days)
- Reliability Target (0-100%)

**Optional Fields**:
- Contact Phone (valid phone format)
- Website (valid URL format)
- Notes (max 500 characters)

#### Error States

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ ❌ Invalid Email Address                                                        │
│ Please enter a valid email address (e.g., vendor@company.com)                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Multi-SKU Management UI

### Component: `<MultiSKUVendorManager />`
### Purpose: Manage same product from multiple vendors

#### Interface Layout

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 📦 Product: "Steel Bolts M8x20" - Multi-Vendor Management                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│ Current Vendors                                                                │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ Vendor        │ Cost/Unit │ Lead Time │ Reliability │ Status │ Actions      │ │
│ ├─────────────────────────────────────────────────────────────────────────────┤ │
│ │ Acme Supply   │ $0.45     │ 7 days    │ 95% 🟢      │ Active │ [Edit] [Del] │ │
│ │ Best Parts    │ $0.52     │ 12 days   │ 78% 🟡      │ Active │ [Edit] [Del] │ │
│ │ Quick Ship    │ $0.38     │ 5 days    │ 45% 🔴      │ Active │ [Edit] [Del] │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│ [+ Add Vendor for this Product]                                                │
│                                                                                 │
│ Recommended Vendor: Acme Supply (Best balance of cost, speed, and reliability) │
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### Add Vendor to Product Flow

1. **Select Product**: Choose from inventory list
2. **Add Vendor**: Click [+ Add Vendor for this Product]
3. **Vendor Selection**: Choose from existing vendors or add new
4. **Cost Configuration**: Set cost per unit for this product
5. **Priority Setting**: Set vendor priority (Primary, Secondary, Backup)
6. **Save**: Add vendor-product relationship

#### Vendor Priority System

**Priority Levels**:
- **Primary**: First choice for new orders
- **Secondary**: Used when primary is unavailable
- **Backup**: Emergency fallback option

**Visual Indicators**:
- Primary: 🥇 Gold badge
- Secondary: 🥈 Silver badge  
- Backup: 🥉 Bronze badge

---

## 4. PO Creation Flow with Vendor Selection

### Component: `<POCreationFlow />`
### Purpose: Create purchase orders with optimal vendor selection

#### Step 1: Product Selection

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 📋 Create Purchase Order - Step 1: Select Products                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│ Add Products to Order                                                          │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ Product Search: [Steel Bolts M8x20                    ] [Search]            │ │
│ │                                                                             │ │
│ │ Found Products:                                                             │ │
│ │ ☐ Steel Bolts M8x20 - SKU: BOLT-M8-20 - Stock: 45 units                   │ │
│ │ ☐ Steel Bolts M8x25 - SKU: BOLT-M8-25 - Stock: 23 units                   │ │
│ │ ☐ Steel Bolts M8x30 - SKU: BOLT-M8-30 - Stock: 67 units                   │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│ [Cancel]                                    [Next: Vendor Selection]           │
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### Step 2: Vendor Selection

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 📋 Create Purchase Order - Step 2: Select Vendors                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│ Product: Steel Bolts M8x20 - Quantity: 100 units                              │
│                                                                                 │
│ Available Vendors                                                              │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ ☑ Acme Supply    │ $0.45/unit │ 7 days    │ 95% 🟢 │ $45.00 total │ Primary │ │
│ │ ☐ Best Parts     │ $0.52/unit │ 12 days   │ 78% 🟡 │ $52.00 total │         │ │
│ │ ☐ Quick Ship     │ $0.38/unit │ 5 days    │ 45% 🔴 │ $38.00 total │         │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│ Recommended: Acme Supply (Best balance of cost, speed, and reliability)        │
│                                                                                 │
│ [Back]                                    [Next: Review Order]                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### Step 3: Order Review

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 📋 Create Purchase Order - Step 3: Review Order                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│ Order Summary                                                                   │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ Product        │ Quantity │ Vendor      │ Unit Cost │ Total Cost │ Lead Time │ │
│ ├─────────────────────────────────────────────────────────────────────────────┤ │
│ │ Steel Bolts    │ 100      │ Acme Supply │ $0.45     │ $45.00     │ 7 days    │ │
│ │ M8x20          │          │             │           │            │           │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│ Total Order Value: $45.00                                                      │
│ Expected Delivery: 7 days                                                      │
│                                                                                 │
│ [Back]                                    [Create Purchase Order]              │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Performance Dashboard

### Component: `<VendorPerformanceDashboard />`
### Purpose: Analyze vendor performance and make data-driven decisions

#### Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 📊 Vendor Performance Dashboard                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│ Key Metrics                                                                     │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ Total Vendors: 12 │ Active Orders: 8 │ Avg Lead Time: 9.2 days │ Avg Cost: $0.47 │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│ Top Performers                                                                  │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ 🥇 Acme Supply    │ 95% reliability │ 7 days avg │ $0.45 avg cost │ 45 orders │ │
│ │ 🥈 Best Parts     │ 78% reliability │ 12 days avg│ $0.52 avg cost │ 23 orders │ │
│ │ 🥉 Quick Ship     │ 45% reliability │ 5 days avg │ $0.38 avg cost │ 12 orders │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│ Performance Trends (Last 30 Days)                                             │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ [Chart: Reliability scores over time]                                       │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### Performance Metrics

**Reliability Score Calculation**:
```
Reliability = (On-time Deliveries / Total Deliveries) × 100
```

**Lead Time Analysis**:
- Average lead time per vendor
- Lead time variance (consistency)
- Trend analysis (improving/declining)

**Cost Analysis**:
- Average cost per unit
- Cost trends over time
- Price comparison across vendors

#### Performance Alerts

**Alert Types**:
- 🔴 **Poor Performance**: Reliability < 50%
- 🟡 **Declining Performance**: Reliability dropped > 10% in 30 days
- 🟢 **Excellent Performance**: Reliability > 90% for 3+ months
- ⚠️ **Cost Increase**: Price increased > 15% in 30 days

---

## 6. Mobile Experience

### Responsive Design

#### Mobile Layout (≤768px)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 🏢 Vendors                                    [☰] Menu                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│ [Search vendors...]                                                             │
│                                                                                 │
│ Vendor Cards (Stacked)                                                         │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ Acme Supply Co.                    │ 95% 🟢 │ 7 days │ Low │ [Edit] [PO] │ │
│ │ acme@supply.com                    │        │        │     │              │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ Best Parts Inc.                    │ 78% 🟡 │ 12 days│ Med │ [Edit] [PO] │ │
│ │ parts@best.com                     │        │        │     │              │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│ [+ Add Vendor]                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### Mobile Navigation

**Bottom Navigation**:
- 🏠 Dashboard
- 🏢 Vendors (current)
- 📦 Inventory
- 📊 Analytics

**Swipe Actions**:
- Swipe right: Edit vendor
- Swipe left: Create PO
- Long press: Show vendor details

---

## 7. Accessibility Requirements

### WCAG 2.2 AA Compliance

#### Keyboard Navigation
- Tab order follows logical flow
- All interactive elements accessible via keyboard
- Focus indicators clearly visible
- Skip links for main content

#### Screen Reader Support
- Proper ARIA labels for all elements
- Table headers properly associated
- Status indicators announced with context
- Form validation messages announced

#### Color Contrast
- Minimum 4.5:1 contrast ratio for text
- Color not the only indicator of status
- High contrast mode support

#### Motor Accessibility
- Touch targets minimum 44px
- Adequate spacing between interactive elements
- No time-based interactions without alternatives

---

## 8. Error States

### No Vendors State

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 📭 No Vendors Found                                                             │
│                                                                                 │
│ You haven't added any vendors yet. Add your first vendor to start              │
│ managing your supplier relationships.                                          │
│                                                                                 │
│ [+ Add Your First Vendor]                                                       │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Loading States

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 🔄 Loading Vendors...                                                            │
│                                                                                 │
│ Fetching vendor data and performance metrics...                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Error States

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ ❌ Failed to Load Vendors                                                        │
│                                                                                 │
│ There was an error loading vendor data. Please try again.                      │
│                                                                                 │
│ [Retry] [Contact Support]                                                       │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Technical Implementation

### Component Structure

```
app/components/vendor-management/
├── VendorList.tsx              # Main vendor list component
├── VendorModal.tsx            # Add/edit vendor modal
├── MultiSKUVendorManager.tsx  # Multi-SKU management
├── POCreationFlow.tsx         # PO creation with vendor selection
├── VendorPerformanceDashboard.tsx # Performance analytics
├── VendorCard.tsx             # Individual vendor card
├── VendorTable.tsx            # Vendor data table
├── VendorFilters.tsx          # Filter and search controls
└── VendorActions.tsx          # Action buttons and menus
```

### API Integration

**Required Endpoints**:
- `GET /api/vendors` - List all vendors
- `POST /api/vendors` - Create new vendor
- `PUT /api/vendors/:id` - Update vendor
- `DELETE /api/vendors/:id` - Delete vendor
- `GET /api/vendors/:id/performance` - Get performance metrics
- `POST /api/vendors/:id/products` - Add product to vendor
- `GET /api/vendors/performance` - Get performance dashboard data

### State Management

**Required State**:
- Vendor list data
- Filter and search state
- Modal open/close state
- Loading states
- Error states
- Performance metrics cache

### Data Validation

**Client-side Validation**:
- Email format validation
- Phone number format validation
- Required field validation
- Numeric range validation (lead time, reliability)

**Server-side Validation**:
- Duplicate vendor name prevention
- Data integrity checks
- Permission validation

---

## 10. Success Metrics

### User Experience Metrics
- Time to add new vendor: < 2 minutes
- Time to create PO with vendor selection: < 5 minutes
- Vendor search success rate: > 95%
- Form completion rate: > 90%

### Performance Metrics
- Page load time: < 3 seconds
- Vendor list render time: < 1 second
- Modal open time: < 500ms
- Search response time: < 200ms

### Business Impact
- Vendor onboarding time reduction: 50%
- PO creation time reduction: 40%
- Vendor performance visibility: 100%
- Cost optimization through vendor comparison: 15%

---

## 11. Future Enhancements

### Phase 2 Features
- Vendor performance predictions using ML
- Automated vendor recommendations
- Integration with external vendor databases
- Advanced analytics and reporting

### Phase 3 Features
- Vendor communication portal
- Automated contract management
- Supply chain risk assessment
- Vendor sustainability scoring

---

## Conclusion

This comprehensive UI specification provides Engineer with all necessary details to implement a robust Vendor Management system. The design prioritizes usability, performance, and accessibility while enabling operators to make data-driven decisions about supplier relationships.

**Key Benefits**:
- Streamlined vendor onboarding
- Data-driven vendor selection
- Performance tracking and optimization
- Mobile-first responsive design
- Accessibility compliance
- Scalable architecture for future enhancements