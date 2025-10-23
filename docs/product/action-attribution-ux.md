# Action Attribution UX Flow

**Owner**: Product  
**Beneficiary**: Analytics  
**Task**: PRODUCT-018  
**Status**: Complete  
**Created**: 2025-10-23  

---

## Overview

This document defines the user experience for action attribution in the HotDash Growth Engine. It describes how operators see action performance, how the system tracks ROI, and how actions are re-ranked based on realized results.

## System Architecture

### Action Attribution Flow

```
1. Action Approved → actionKey generated (e.g., "seo-fix-powder-board-2025-10-21")
2. Client Tracking → hd_action_key set in localStorage
3. GA4 Events → All events include hd_action_key parameter
4. Analytics Service → Queries GA4 for attribution data (7d/14d/28d)
5. Action Re-ranking → Queue reordered by realized ROI
```

### Key Components

- **Action Queue**: Database table with actions and their tracking keys
- **GA4 Custom Dimension**: `hd_action_key` (event scope) in Property 339826228
- **Attribution Service**: Queries GA4 and updates realized ROI
- **Re-ranking Algorithm**: Prioritizes actions with proven results

---

## Operator Experience

### 1. Action Queue Display

**Location**: Dashboard → Action Queue tile

**Action Card Information**:
```
┌─────────────────────────────────────────────────────────┐
│ 🎯 Add size chart to Powder Boards                      │
│                                                         │
│ Expected: $2,400 revenue (90% confidence, Easy)        │
│ Realized: $1,850 (28d) • $1,200 (14d) • $800 (7d)     │
│                                                         │
│ 📊 Performance: 77% of expected (28d window)            │
│ 🏆 Ranking: #3 (proven performer)                      │
│                                                         │
│ [Approve] [Reject] [View Details]                       │
└─────────────────────────────────────────────────────────┘
```

**Key UX Elements**:
- **Expected vs Realized**: Clear comparison of predicted vs actual revenue
- **Performance Percentage**: Visual indicator of success rate
- **Ranking Position**: Shows where action ranks in queue
- **Time Windows**: 7d/14d/28d attribution data visible

### 2. Action Details Modal

**Trigger**: Click "View Details" on action card

**Modal Content**:
```
┌─────────────────────────────────────────────────────────┐
│ 📊 Action Performance: Add size chart to Powder Boards  │
│                                                         │
│ Expected Revenue: $2,400                               │
│ Confidence: 90%                                        │
│ Ease: Easy                                             │
│                                                         │
│ 📈 Realized Performance:                               │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Window    │ Revenue │ Sessions │ Purchases │ ROI    │ │
│ │ 7 days    │ $800    │ 45       │ 12        │ 33%    │ │
│ │ 14 days   │ $1,200  │ 78       │ 18        │ 50%    │ │
│ │ 28 days   │ $1,850  │ 156      │ 28        │ 77%    │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ 🎯 Attribution Key: seo-fix-powder-board-2025-10-21     │
│ 📅 Last Updated: 2025-10-22T14:30:00Z                 │
│                                                         │
│ [Refresh Data] [View GA4 Report] [Close]                │
└─────────────────────────────────────────────────────────┘
```

**Key UX Elements**:
- **Detailed Metrics**: Sessions, purchases, conversion rates
- **Attribution Key**: Shows the tracking identifier
- **Last Updated**: Timestamp of latest data refresh
- **Action Buttons**: Refresh data, view GA4 report

### 3. Performance Dashboard

**Location**: Dashboard → Analytics tile

**Performance Overview**:
```
┌─────────────────────────────────────────────────────────┐
│ 📊 Action Performance Summary                           │
│                                                         │
│ 🏆 Top Performers (28d ROI):                           │
│ 1. SEO optimization → $3,200 (133% of expected)        │
│ 2. Product description → $2,100 (105% of expected)     │
│ 3. Size chart addition → $1,850 (77% of expected)     │
│                                                         │
│ 📈 Overall Performance:                                │
│ • Actions with realized ROI: 12/15 (80%)               │
│ • Average performance: 89% of expected                  │
│ • Total realized revenue: $47,200                      │
│                                                         │
│ [View All Actions] [Export Report]                      │
└─────────────────────────────────────────────────────────┘
```

---

## Data Visualization

### 1. ROI Comparison Chart

**Purpose**: Show expected vs realized revenue for top actions

**Chart Type**: Horizontal bar chart
```
Expected Revenue    ████████████████████████████████████████ $2,400
Realized Revenue   ████████████████████████████████████      $1,850 (77%)

Expected Revenue    ████████████████████████████████████████ $1,800
Realized Revenue   ████████████████████████████████████████ $2,100 (117%)
```

### 2. Attribution Timeline

**Purpose**: Show performance over time windows

**Timeline View**:
```
7d:  $800  ████████
14d: $1,200 ████████████
28d: $1,850 ████████████████████
```

### 3. Action Ranking Visualization

**Purpose**: Show how actions rank by realized ROI

**Ranking Display**:
```
🏆 #1 SEO optimization     $3,200 (133%) ████████████████████████████████████████
🥈 #2 Product description  $2,100 (105%) ████████████████████████████████████
🥉 #3 Size chart addition  $1,850 (77%)  ████████████████████████████████
   #4 Inventory update     $1,200 (60%)  ████████████████████████
   #5 Price optimization   $800 (40%)   ████████████████
```

---

## User Interactions

### 1. Action Approval Flow

**Step 1**: Operator sees action in queue with expected ROI
**Step 2**: Operator clicks "Approve" 
**Step 3**: System generates `actionKey` and sets in localStorage
**Step 4**: Client tracking begins with `hd_action_key` parameter
**Step 5**: GA4 events include attribution data
**Step 6**: Analytics service queries GA4 for performance
**Step 7**: Action re-ranked based on realized ROI

### 2. Performance Monitoring

**Real-time Updates**:
- Action cards show live performance data
- Queue re-ranks automatically based on realized ROI
- Performance indicators update every 15 minutes

**Manual Refresh**:
- "Refresh Data" button triggers fresh GA4 queries
- Shows loading state during data fetch
- Updates all performance metrics

### 3. Data Export

**Export Options**:
- CSV export of all action performance data
- PDF report with charts and metrics
- GA4 report links for detailed analysis

---

## Error States

### 1. No Attribution Data

**Display**:
```
┌─────────────────────────────────────────────────────────┐
│ ⚠️ No Performance Data Available                        │
│                                                         │
│ This action was approved recently and hasn't generated  │
│ enough data for attribution analysis yet.            │
│                                                         │
│ Check back in 24-48 hours for initial performance data.│
│                                                         │
│ [Refresh] [View Expected ROI]                           │
└─────────────────────────────────────────────────────────┘
```

### 2. GA4 Connection Issues

**Display**:
```
┌─────────────────────────────────────────────────────────┐
│ 🔌 Connection Issue                                     │
│                                                         │
│ Unable to fetch performance data from Google Analytics.│
│ This may be due to:                                     │
│ • GA4 API rate limiting                                 │
│ • Network connectivity issues                           │
│ • Authentication problems                               │
│                                                         │
│ [Retry] [Contact Support]                               │
└─────────────────────────────────────────────────────────┘
```

### 3. Low Performance Alert

**Display**:
```
┌─────────────────────────────────────────────────────────┐
│ 📉 Performance Below Expected                          │
│                                                         │
│ This action is performing at 45% of expected revenue.  │
│ Consider:                                               │
│ • Reviewing the implementation                          │
│ • Adjusting the strategy                                │
│ • Pausing similar actions                               │
│                                                         │
│ [View Details] [Adjust Strategy]                       │
└─────────────────────────────────────────────────────────┘
```

---

## Mobile Experience

### 1. Action Cards (Mobile)

**Layout**: Stacked cards with essential information
```
┌─────────────────────────────────┐
│ 🎯 Add size chart               │
│ Expected: $2,400                │
│ Realized: $1,850 (77%)         │
│ Ranking: #3                     │
│                                 │
│ [Approve] [Reject] [Details]    │
└─────────────────────────────────┘
```

### 2. Performance Modal (Mobile)

**Layout**: Full-screen modal with scrollable content
- Swipe gestures for navigation
- Touch-friendly buttons
- Optimized charts for small screens

---

## Accessibility

### 1. Screen Reader Support

- Action cards have proper ARIA labels
- Performance data announced with context
- Chart data available in table format

### 2. Keyboard Navigation

- Tab order follows logical flow
- All interactive elements accessible via keyboard
- Focus indicators clearly visible

### 3. Color Contrast

- Performance indicators use color + text
- Charts have high contrast colors
- Status indicators include icons + text

---

## Technical Implementation

### 1. Data Flow

```
Action Queue → GA4 Attribution → Performance Update → UI Refresh
```

### 2. API Endpoints

- `GET /api/actions/:id/attribution` - Get performance data
- `POST /api/actions/:id/attribution` - Refresh data
- `GET /api/action-queue` - Get ranked actions

### 3. Real-time Updates

- WebSocket connection for live updates
- Polling fallback every 30 seconds
- Optimistic UI updates for better UX

---

## Success Metrics

### 1. Operator Efficiency

- Time to review action performance: < 30 seconds
- Accuracy of performance assessment: > 90%
- Decision confidence: > 85%

### 2. System Performance

- Data refresh time: < 5 seconds
- Queue re-ranking frequency: Every 15 minutes
- Attribution accuracy: > 95%

### 3. Business Impact

- Actions with realized ROI: > 80%
- Average performance vs expected: > 85%
- Revenue attribution accuracy: > 90%

---

## Future Enhancements

### 1. Predictive Analytics

- Machine learning models for ROI prediction
- Confidence intervals for expected revenue
- Risk assessment for new actions

### 2. Advanced Visualization

- Interactive charts with drill-down capability
- Cohort analysis for action performance
- A/B testing for action variations

### 3. Automation

- Auto-approval for high-confidence actions
- Smart recommendations based on performance
- Automated strategy adjustments

---

## Conclusion

This UX flow provides operators with clear visibility into action performance, enabling data-driven decisions and continuous improvement of the Growth Engine. The system balances automation with human oversight, ensuring both efficiency and accuracy in action management.

**Key Benefits**:
- Clear performance visibility
- Data-driven decision making
- Continuous improvement through attribution
- Reduced manual analysis time
- Higher ROI through proven actions