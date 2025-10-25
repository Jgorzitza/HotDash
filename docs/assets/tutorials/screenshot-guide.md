# HotDash Tutorial Screenshots Guide

**Purpose**: Guide for capturing production-quality screenshots for tutorials and documentation  
**Owner**: Designer  
**Date**: 2025-10-23

---

## Screenshot Requirements

### Technical Specifications

- **Format**: PNG (lossless)
- **Resolution**: 1920x1080 (Full HD) minimum
- **DPI**: 144 (Retina/HiDPI)
- **Color Space**: sRGB
- **Compression**: Optimized for web (< 500KB per image)

### Browser Setup

- **Browser**: Chrome (latest stable)
- **Window Size**: 1440x900 (standard laptop)
- **Zoom**: 100% (no browser zoom)
- **Extensions**: Disable all (clean UI)
- **DevTools**: Closed (unless showing DevTools)

### Capture Tools

- **macOS**: Cmd+Shift+4 (native), or CleanShot X
- **Windows**: Snipping Tool, or ShareX
- **Linux**: Flameshot, or GNOME Screenshot
- **Browser Extension**: Awesome Screenshot (for full-page captures)

---

## Screenshot List

### 01. Dashboard Overview
**File**: `01-dashboard-overview.png`  
**Purpose**: Show complete dashboard with all tiles  
**Requirements**:
- All 8 tiles visible
- Mix of status indicators (healthy, attention, warning)
- Realistic data (not all zeros)
- Header with logo and approval badge
- Footer with timestamp

**Annotations**:
- Arrow pointing to approval badge: "3 pending approvals"
- Highlight tile grid layout
- Show status color coding

---

### 02. Tile Layout
**File**: `02-tile-layout.png`  
**Purpose**: Demonstrate tile organization and responsive grid  
**Requirements**:
- 4-column grid clearly visible
- Tiles aligned properly
- Spacing consistent
- Status icons prominent

**Annotations**:
- Label each tile type
- Show grid structure
- Indicate clickable areas

---

### 03. Tile Interaction
**File**: `03-tile-interaction.png`  
**Purpose**: Show hover state and click-to-modal flow  
**Requirements**:
- One tile in hover state (subtle highlight)
- Cursor visible over tile
- "View Details" affordance clear

**Annotations**:
- "Hover to highlight"
- "Click to open modal"
- Show cursor position

---

### 04. CX Escalation Modal
**File**: `04-cx-escalation-modal.png`  
**Purpose**: Demonstrate customer support approval workflow  
**Requirements**:
- Modal open over dashboard (with backdrop)
- Conversation history visible
- AI-suggested reply shown
- Grading sliders (tone, accuracy, policy)
- Action buttons (Approve, Edit, Escalate)

**Annotations**:
- "1. Review conversation"
- "2. Edit AI reply if needed"
- "3. Grade response quality"
- "4. Approve or escalate"

---

### 05. Inventory Heatmap
**File**: `05-inventory-heatmap.png`  
**Purpose**: Show inventory visualization and PO generation  
**Requirements**:
- Heatmap with color-coded stock levels
- Red/orange items (low stock) visible
- Green items (healthy stock) visible
- "Generate PO" button prominent

**Annotations**:
- Color legend (red = critical, orange = low, green = healthy)
- Point to low-stock items
- Show PO generation flow

---

### 06. Growth Analytics
**File**: `06-growth-analytics.png`  
**Purpose**: Demonstrate Chart.js visualizations and data tables  
**Requirements**:
- One of: Social Performance, SEO Impact, or Ads ROAS modal
- Chart.js chart visible (line, bar, or doughnut)
- Data table below chart
- Date range filter shown
- Export button visible

**Annotations**:
- "Interactive charts"
- "Filterable data tables"
- "Export to CSV"

---

### 07. Approval Queue
**File**: `07-approval-queue.png`  
**Purpose**: Show approval queue tile and pending items  
**Requirements**:
- Approval Queue tile highlighted
- Badge showing count (e.g., "3")
- List of pending approvals visible
- Action types labeled (CX, Inventory, Growth)

**Annotations**:
- "Pending approvals"
- "Click to review"
- "Action types"

---

### 08. Approval Detail
**File**: `08-approval-detail.png`  
**Purpose**: Show detailed approval view with evidence  
**Requirements**:
- Full approval card/modal
- Evidence section visible
- Projected impact shown
- Rollback plan documented
- Approve/Reject buttons

**Annotations**:
- "Evidence: Why this action?"
- "Impact: What will change?"
- "Rollback: How to undo?"
- "Approve or reject"

---

### 09. Settings Page
**File**: `09-settings-page.png`  
**Purpose**: Demonstrate customization options  
**Requirements**:
- Settings page with tabs visible
- Tile visibility toggles shown
- Layout customization options
- Theme switcher (if implemented)

**Annotations**:
- "Customize dashboard"
- "Show/hide tiles"
- "Reorder layout"

---

### 10. Notifications
**File**: `10-notifications.png`  
**Purpose**: Show notification system (toast, banner, browser)  
**Requirements**:
- Toast notification visible
- Banner alert shown (if applicable)
- Notification center icon highlighted

**Annotations**:
- "Toast notifications"
- "Banner alerts"
- "Notification center"

---

### 11. Accessibility
**File**: `11-accessibility.png`  
**Purpose**: Demonstrate accessibility features  
**Requirements**:
- Keyboard focus visible (blue outline)
- High contrast mode (if implemented)
- Screen reader overlay (optional)

**Annotations**:
- "Keyboard navigation"
- "Focus indicators"
- "WCAG 2.2 AA compliant"

---

### 12. Troubleshooting
**File**: `12-troubleshooting.png`  
**Purpose**: Show error states and debugging tools  
**Requirements**:
- Error state visible (e.g., failed tile load)
- Connection status indicator
- Error message clear and actionable

**Annotations**:
- "Error state"
- "Connection status"
- "Troubleshooting steps"

---

## Annotation Guidelines

### Tools for Annotations

- **Figma**: Import screenshot, add annotations
- **Sketch**: Import screenshot, add annotations
- **Photoshop**: Use text and arrow tools
- **Online**: Annotate.io, Markup.io

### Annotation Style

**Arrows**:
- Color: Hot Rodan Red (#D72C0D)
- Width: 3px
- Style: Solid line with arrowhead

**Text Boxes**:
- Background: White with 80% opacity
- Border: 2px Hot Rodan Red
- Font: Inter, 14px, semibold
- Padding: 8px

**Numbers**:
- Circle background: Hot Rodan Red
- Text: White, Inter, 16px, bold
- Use for step-by-step flows

---

## Screenshot Workflow

### 1. Prepare Environment

```bash
# Start local dev server
npm run dev

# Seed database with realistic data
npx tsx scripts/seed/seed-demo-data.ts

# Open browser
open http://localhost:5173
```

### 2. Capture Screenshots

For each screenshot in the list:
1. Navigate to the relevant view
2. Ensure data is realistic and varied
3. Set up the desired state (hover, modal open, etc.)
4. Capture at 1920x1080 minimum
5. Save as PNG with descriptive filename

### 3. Annotate

1. Import screenshot into annotation tool
2. Add arrows, text boxes, and numbers per guidelines
3. Export as PNG (optimized for web)
4. Save to `docs/assets/tutorials/`

### 4. Optimize

```bash
# Install ImageOptim (macOS) or similar
# Drag screenshots to optimize
# Target: < 500KB per image

# Or use CLI tool
pngquant --quality=80-95 *.png
```

### 5. Verify

- [ ] All screenshots captured
- [ ] All annotations clear and readable
- [ ] File sizes optimized (< 500KB)
- [ ] Filenames match guide
- [ ] Saved to correct directory

---

## Data Requirements

### Realistic Demo Data

**Sales Pulse**:
- Revenue: $12,450 (today)
- Orders: 47 (today)
- Trend: +12% vs yesterday

**Fulfillment**:
- Delayed: 3 orders
- On-time: 95%
- Avg ship time: 1.2 days

**Inventory**:
- Low stock: 12 items
- Out of stock: 2 items
- Total SKUs: 156

**CX Escalations**:
- Pending: 5 conversations
- Avg response time: 2.3 hours
- Resolution rate: 94%

**Social Performance**:
- Posts: 24 (last 30 days)
- Engagement: 4.2%
- Top post: 1,245 impressions

**SEO Impact**:
- Keywords: 87 tracked
- Avg position: 12.3
- Top mover: "hot sauce gift set" (#45 → #12)

**Ads ROAS**:
- Spend: $2,450 (last 30 days)
- Revenue: $9,310
- ROAS: 3.8x

**Growth Metrics**:
- Total growth: +18%
- Social: +22%
- SEO: +15%
- Ads: +12%

---

## Quality Checklist

Before finalizing screenshots:

- [ ] Resolution: 1920x1080 minimum
- [ ] Format: PNG (lossless)
- [ ] File size: < 500KB (optimized)
- [ ] Data: Realistic and varied
- [ ] UI: Clean (no browser extensions visible)
- [ ] Annotations: Clear and readable
- [ ] Branding: Hot Rodan colors used
- [ ] Accessibility: High contrast, readable text
- [ ] Consistency: Same browser, same window size
- [ ] Filenames: Match guide exactly

---

## Next Steps

1. **Capture**: Use this guide to capture all 12 screenshots
2. **Annotate**: Add arrows and labels per guidelines
3. **Optimize**: Compress to < 500KB per image
4. **Review**: Verify against quality checklist
5. **Deploy**: Save to `docs/assets/tutorials/`
6. **Update**: Link screenshots in production launch guide

---

**Status**: Screenshot guide complete, ready for capture  
**Owner**: Designer  
**Next**: Capture screenshots using Chrome DevTools MCP

