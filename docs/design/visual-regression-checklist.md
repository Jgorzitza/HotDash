# Visual Regression Checklist

**File:** `docs/design/visual-regression-checklist.md`  
**Owner:** Designer  
**Version:** 1.0  
**Date:** 2025-10-19  
**For**: QA Agent visual regression testing

---

## Purpose

Comprehensive checklist for QA agent to verify visual quality, design system compliance, and UI/UX consistency across the Operator Control Center. Based on Designer visual review (Issue #118, 2025-10-19).

---

## 1. Dashboard Tiles

### 1.1 Tile Structure

- [ ] **Header**: Tile name visible (h2, 18.4px, 600 weight)
- [ ] **Status Badge**: One of "Tuned" (green), "Attention needed" (red), "Configuration required" (gray)
- [ ] **Metadata**: "Last refreshed [time] • Source: [source]" visible
- [ ] **Content Area**: Data displayed clearly
- [ ] **Spacing**: 20px padding, 16px internal gap

**Expected Tiles** (6 visible, 2 missing):

1. ✅ Ops Pulse
2. ✅ Sales Pulse
3. ✅ Fulfillment Flow
4. ✅ Inventory Watch
5. ✅ CX Pulse
6. ✅ SEO Pulse
7. ⚠️ Idea Pool (not visible - expected but missing)
8. ⚠️ Approvals Queue (not visible - expected but missing)

### 1.2 Tile-Specific Content

**Ops Pulse**:

- [ ] Activation percentage (e.g., "75.0%")
- [ ] Shop count (e.g., "9 / 12 shops activated")
- [ ] Window dates (e.g., "10/12/2025 — 10/19/2025")
- [ ] SLA median time (e.g., "32.5 min")
- [ ] P90 time (e.g., "58.2 min")
- [ ] Sample size (e.g., "Sample size: 6")

**Sales Pulse**:

- [ ] Revenue amount with proper formatting (e.g., "$8,425.50")
- [ ] Order count (e.g., "58 orders in the current window.")
- [ ] "View breakdown" button visible and styled
- [ ] Top SKUs section with 3 products
- [ ] Product names, quantities, and revenue per SKU
- [ ] "Open fulfillment" section with order IDs

**Fulfillment Flow**:

- [ ] Order IDs visible (e.g., "#7001", "#6998")
- [ ] Status labels (e.g., "unfulfilled", "in_progress")
- [ ] Timestamps (e.g., "since 10/19/2025, 8:49:08 PM")

**Inventory Watch**:

- [ ] Product variant names (e.g., "Powder Board XL — 158cm")
- [ ] Quantity left (e.g., "6 left")
- [ ] Days of cover (e.g., "2.5 days of cover")

**CX Pulse**:

- [ ] Customer name visible (e.g., "Jamie Lee")
- [ ] Status (e.g., "open")
- [ ] SLA indicator (e.g., "SLA breached")
- [ ] "Review & respond" button visible and styled

**SEO Pulse**:

- [ ] Page paths (e.g., "/collections/new-arrivals")
- [ ] Session counts (e.g., "420 sessions")
- [ ] Week-over-week percentage (e.g., "-24.0% WoW")
- [ ] Attention indicators where applicable

---

## 2. Typography

### 2.1 Font Family

- [ ] **Primary Font**: Inter (Polaris standard)
- [ ] **Fallback**: -apple-system, BlinkMacSystemFont, "San Francisco", "Segoe UI", Roboto, "Helvetica Neue", sans-serif
- [ ] **No Times New Roman** in body content (only acceptable in fallback chain)

### 2.2 Heading Hierarchy

- [ ] **h1** (Page title): "Operator Control Center" - visible
- [ ] **h2** (Tile headers): 18.4px, 600 weight, 20px line-height
- [ ] **h3** (Section headers): 15.21px, 700 weight, 20px line-height
- [ ] **Color**: rgb(32, 34, 35) - Polaris text primary

### 2.3 Body Text

- [ ] Font size: 1rem (16px standard)
- [ ] Color: rgb(32, 34, 35) or rgb(99, 115, 129) for subdued
- [ ] Line height: appropriate for readability (1.5x minimum)

---

## 3. Color Contrast (WCAG AA)

### 3.1 Text Contrast

- [ ] **Body text on white**: ≥4.5:1 contrast ratio
- [ ] **Heading text on white**: ≥4.5:1 contrast ratio
- [ ] **Status badge text**: ≥4.5:1 contrast ratio
- [ ] **Button text**: ≥4.5:1 contrast ratio

**Verified Ratios** (from Designer review):

- Body text (rgb(32, 34, 35) on white): 16.6:1 ✅
- Status "Tuned" (rgb(26, 127, 55)): Needs background verification

### 3.2 Interactive Elements

- [ ] Button text readable in all states (default, hover, focus, disabled)
- [ ] Link text distinguishable from body text
- [ ] Focus indicators visible (not relying on color alone)

---

## 4. Responsive Design

### 4.1 Breakpoint: Mobile (375px)

- [ ] **Layout**: Single column
- [ ] **Navigation**: Accessible and usable
- [ ] **Tiles**: Stack vertically
- [ ] **Touch targets**: Minimum 44x44px
- [ ] **Text**: No horizontal scrolling
- [ ] **Images/Icons**: Scale appropriately

**Screenshot Reference**: `artifacts/designer/production-screenshots/07-mobile-375px.png`

### 4.2 Breakpoint: Tablet (768px)

- [ ] **Layout**: 2-column grid
- [ ] **Navigation**: Horizontal menu visible
- [ ] **Tiles**: Side-by-side layout
- [ ] **Spacing**: Adequate margins and padding
- [ ] **Text**: Readable without zooming

**Screenshot Reference**: `artifacts/designer/production-screenshots/08-tablet-768px.png`

### 4.3 Breakpoint: Desktop (1024px)

- [ ] **Layout**: Multi-column grid (3-4 columns)
- [ ] **Navigation**: Full horizontal menu
- [ ] **Tiles**: Grid layout with auto-fit
- [ ] **Hover states**: Visible on interactive elements
- [ ] **Spacing**: Generous whitespace

**Screenshot Reference**: `artifacts/designer/production-screenshots/09-desktop-1024px.png`

### 4.4 Breakpoint: Large Desktop (1440px)

- [ ] **Layout**: Full-width grid
- [ ] **Tiles**: Maximum of 4 columns
- [ ] **Content**: Centered or full-width (appropriate to design)
- [ ] **No excessive whitespace**: Content utilizes available space

**Screenshot Reference**: `artifacts/designer/production-screenshots/10-desktop-1440px.png`

---

## 5. Navigation

### 5.1 Top Navigation Menu

- [ ] **Links visible**: "Dashboard", "Approvals", "Picker Payments", "Additional page", "Session token tool"
- [ ] **Active state**: Current page indicated visually
- [ ] **Hover state**: Interactive feedback on hover
- [ ] **Focus state**: Keyboard navigation visible
- [ ] **Skip link**: "Skip to main content" present for accessibility

### 5.2 Navigation Behavior

- [ ] **Links clickable**: All navigation links functional
- [ ] **No broken links**: All routes resolve correctly
- [ ] **Breadcrumbs** (if applicable): Show current location in hierarchy

---

## 6. Interactive Elements

### 6.1 Buttons

- [ ] **Primary buttons**: Clear visual hierarchy (e.g., "View breakdown", "Review & respond")
- [ ] **Button labels**: Clear and action-oriented (not generic "Click here")
- [ ] **Hover state**: Visual feedback on hover
- [ ] **Focus state**: Keyboard focus indicator visible
- [ ] **Disabled state**: Clearly distinguished from active state
- [ ] **Loading state**: Spinner or loading indicator when processing

### 6.2 Links

- [ ] **Text links**: Underlined or otherwise distinguished from body text
- [ ] **Color**: Consistent link color throughout app
- [ ] **Hover**: Underline or color change on hover
- [ ] **Visited**: Optional visited state styling

### 6.3 Form Inputs (Login Page)

- [ ] **Input fields**: Clear border and label
- [ ] **Placeholder text**: Helpful example (e.g., "e.g: my-shop-domain.myshopify.com")
- [ ] **Focus state**: Border highlight or glow on focus
- [ ] **Error state**: Red border and error message for invalid input
- [ ] **Label association**: Labels properly associated with inputs

---

## 7. Loading States

### 7.1 Skeleton UI

- [ ] **Skeleton structure**: Matches final content layout
- [ ] **Animation**: Subtle shimmer or pulse effect
- [ ] **Duration**: Appropriate (1-3 seconds typical)
- [ ] **No layout shift**: Skeleton same dimensions as loaded content
- [ ] **Accessible**: `aria-busy="true"` on container

**Note**: Not visible in mock mode. Test with live data or slow network.

### 7.2 Spinner Indicators

- [ ] **Button loading**: Spinner in button with dimmed text
- [ ] **Page loading**: Centered spinner with message
- [ ] **Tile refresh**: Small spinner in top-right corner of tile
- [ ] **Opacity reduction**: Existing data remains visible (0.7 opacity)

---

## 8. Error States

### 8.1 Error Messages

- [ ] **Clear messaging**: Error text explains what went wrong
- [ ] **Actionable**: Provides next steps or retry option
- [ ] **Visual indicator**: Icon or color indicating error
- [ ] **Accessible**: `aria-live="assertive"` or `role="alert"`

**Captured Errors** (from Designer review):

1. **404 Page**: "404 Not Found" when accessing /dashboard directly ✅
2. **AppProvider Error**: "MissingAppProviderError: No i18n was provided" ⚠️ **P0 BLOCKER**

### 8.2 Empty States

- [ ] **Friendly message**: "No [data type] right now."
- [ ] **Subtext**: "Data will appear here when available."
- [ ] **No CTA**: Empty states are informational only
- [ ] **Icon or illustration**: Optional visual element

**Examples**:

- "No SLA breaches detected."
- "All recent orders are on track."
- "No low stock alerts right now."

### 8.3 Unconfigured States

- [ ] **Clear message**: "Connect integration to enable this tile."
- [ ] **CTA button**: "Set up" button (primary style)
- [ ] **Help text**: Explains which integration is needed
- [ ] **Icon**: Setup or configuration icon

---

## 9. Accessibility (WCAG 2.1 AA)

### 9.1 Keyboard Navigation

- [ ] **Tab order**: Logical tab order through interactive elements
- [ ] **Focus indicators**: Visible focus rings on all interactive elements
- [ ] **Keyboard shortcuts**: Documented and functional (e.g., Cmd/Ctrl+Enter to approve)
- [ ] **Escape key**: Closes modals/drawers
- [ ] **Enter/Space**: Activates buttons and links

### 9.2 Screen Reader Support

- [ ] **ARIA labels**: Descriptive labels on interactive elements
- [ ] **ARIA live regions**: Dynamic content announces changes
- [ ] **ARIA busy**: Loading states indicate `aria-busy="true"`
- [ ] **Semantic HTML**: Proper use of headings, lists, buttons, links
- [ ] **Alt text**: Images have descriptive alt text (if applicable)

### 9.3 Screen Reader Announcements

**Tile Example**:

```html
<div role="region" aria-label="Ops Pulse" aria-describedby="ops-pulse-status">
  <h2 id="ops-pulse-heading">Ops Pulse</h2>
  <span id="ops-pulse-status" class="sr-only">
    Status: Tuned. Last refreshed 5 minutes ago. Source: mock.
  </span>
</div>
```

- [ ] **Tile updates**: Announced politely (`aria-live="polite"`)
- [ ] **Error messages**: Announced assertively (`aria-live="assertive"`)
- [ ] **Loading states**: Announced with `aria-busy="true"`

---

## 10. Polaris Design System Compliance

### 10.1 Polaris Components

**⚠️ FINDING**: App does NOT use Polaris React components

- [ ] **Polaris AppProvider**: ❌ **MISSING** - P0 BLOCKER
- [ ] **Polaris Button**: ❌ Not detected (custom implementation)
- [ ] **Polaris Card**: ❌ Not detected (custom tiles)
- [ ] **Polaris Badge**: ❌ Not detected (custom status badges)
- [ ] **Polaris Layout**: ❌ Not detected (custom grid)

**Status**: App uses Polaris fonts and design tokens but custom component implementation.

### 10.2 Polaris Design Tokens

- [ ] **Typography**: Inter font family ✅
- [ ] **Spacing**: 20px tile padding, 16px gap ✅
- [ ] **Colors**: Polaris color palette (rgb(32, 34, 35) text primary) ✅
- [ ] **Border radius**: Appropriate rounding (12px tiles)
- [ ] **Shadows**: Card shadows for elevation

### 10.3 Polaris Icons

**⚠️ FINDING**: No icons detected in production app

- [ ] **Icon library**: Polaris icon set (NOT PRESENT)
- [ ] **Icon sizing**: 16px or 20px standard (NOT APPLICABLE)
- [ ] **Icon color**: Consistent with text color (NOT APPLICABLE)

**Recommendation**: Add Polaris icons for visual hierarchy (P2 priority).

---

## 11. Microcopy Quality

### 11.1 Button Labels

- [ ] **Clear and actionable**: "Review & respond" not "Click here" ✅
- [ ] **Consistent**: Same labels for same actions across app ✅
- [ ] **Brief**: 1-3 words typical ✅

**Examples**:

- "Log in" ✅
- "View breakdown" ✅
- "Review & respond" ✅

### 11.2 Status Labels

- [ ] **Specific**: "Tuned" not "OK" ✅
- [ ] **Consistent**: Same labels throughout app ✅
- [ ] **Clear**: No jargon or technical terms ✅

**Examples**:

- "Tuned" (healthy) ✅
- "open" (status) ✅
- "unfulfilled" (order status) ✅

### 11.3 Help Text

- [ ] **Informative**: Provides context ✅
- [ ] **Concise**: Brief but helpful ✅
- [ ] **Examples**: Shows format (e.g., "e.g: my-shop-domain.myshopify.com") ✅

### 11.4 Error Messages

- [ ] **Clear**: Explains what went wrong ✅
- [ ] **Actionable**: Suggests next steps ✅
- [ ] **Polite**: Professional tone ✅

**Example**: "MissingAppProviderError: No i18n was provided. Your application must be wrapped in an <AppProvider> component." ✅

---

## 12. Animation & Transitions

### 12.1 Page Transitions

- [ ] **Smooth**: No jarring jumps or flashes
- [ ] **Fast**: <300ms typical
- [ ] **Appropriate**: Matches user action

### 12.2 Drawer/Modal Animations

- [ ] **Slide-in**: Drawer slides from right (200-300ms)
- [ ] **Fade-in**: Modal fades in with backdrop (200-300ms)
- [ ] **Ease-out**: Smooth deceleration curve
- [ ] **Escape key**: Smooth close animation

**⚠️ NOTE**: Static screenshots cannot verify animations. Requires manual testing.

### 12.3 Loading Animations

- [ ] **Skeleton shimmer**: Subtle pulse or shimmer (1-2s cycle)
- [ ] **Spinner rotation**: Smooth 360° rotation
- [ ] **Button loading**: Spinner rotates in button

---

## 13. Visual Consistency

### 13.1 Spacing

- [ ] **Consistent padding**: 20px on tiles ✅
- [ ] **Consistent gaps**: 16px internal, 20px tile gap ✅
- [ ] **Margin alignment**: Elements align to grid
- [ ] **No cramped content**: Adequate whitespace

### 13.2 Alignment

- [ ] **Text alignment**: Left-aligned body text, centered headings (if applicable)
- [ ] **Element alignment**: Buttons, inputs aligned consistently
- [ ] **Grid alignment**: Tiles align to grid columns

### 13.3 Visual Hierarchy

- [ ] **Clear hierarchy**: Headers larger than body text ✅
- [ ] **Bold for emphasis**: Important text uses 600-700 weight ✅
- [ ] **Color for status**: Green/red/gray for states ✅
- [ ] **Size for importance**: Larger elements draw attention ✅

---

## 14. Known Issues (From Designer Review)

### 14.1 P0 Critical (Blocks Production)

1. **Polaris AppProvider Missing** 🔴
   - **Symptom**: Clicking interactive buttons crashes app
   - **Error**: "MissingAppProviderError: No i18n was provided"
   - **Impact**: Blocks approvals drawer, modals, all Polaris interactive components
   - **Screenshot**: `11-cx-error-polaris-provider.png`
   - **Test**: Click "Review & respond" or "View breakdown" button
   - **Expected**: Modal/drawer opens
   - **Actual**: Application error page
   - **Status**: ❌ FAILING

2. **Missing Tiles** 🔴
   - **Symptom**: Only 6 of 8 tiles visible
   - **Missing**: Idea Pool, Approvals Queue
   - **Impact**: Features not accessible
   - **Screenshot**: `06-dashboard-mock-mode-full.png`
   - **Test**: Count visible tiles on dashboard
   - **Expected**: 8 tiles
   - **Actual**: 6 tiles
   - **Status**: ❌ FAILING

3. **No Icons** ⚠️
   - **Symptom**: Text-only interface
   - **Missing**: Polaris icons in navigation and tiles
   - **Impact**: Reduced visual hierarchy
   - **Screenshot**: All screenshots show no icons
   - **Test**: Check for SVG icons in navigation or tiles
   - **Expected**: Icons present
   - **Actual**: No icons detected
   - **Status**: ❌ FAILING (P2 priority)

### 14.2 P2 Recommended (Before Launch)

4. **Loading States Not Visible** ⚠️
   - **Symptom**: No skeleton loaders or loading spinners visible
   - **Context**: Mock mode shows instant loaded state
   - **Test**: View with live data or slow network
   - **Status**: ⏸️ UNTESTED

5. **Routing Issue** ⚠️
   - **Symptom**: /approvals route shows dashboard tiles
   - **Expected**: Separate approvals page or redirect
   - **Actual**: Same dashboard view
   - **Screenshot**: `12-approvals-page.png`
   - **Test**: Navigate to /approvals
   - **Status**: ⚠️ NEEDS INVESTIGATION

---

## 15. Test Execution Checklist

### 15.1 Pre-Test Setup

- [ ] **Chrome DevTools MCP**: Verified operational
- [ ] **Production app**: Accessible at https://hotdash-staging.fly.dev/app?mock=1
- [ ] **Screenshot directory**: `artifacts/designer/production-screenshots/` available
- [ ] **Reference screenshots**: 12 screenshots from Designer review

### 15.2 Test Execution

- [ ] **Visual inspection**: All tiles, navigation, buttons
- [ ] **Responsive testing**: All 4 breakpoints (375px, 768px, 1024px, 1440px)
- [ ] **Interaction testing**: Click all buttons, links
- [ ] **Keyboard navigation**: Tab through all elements
- [ ] **Screen reader**: Test with NVDA/JAWS/VoiceOver (if applicable)
- [ ] **Error scenarios**: Test error states and empty states
- [ ] **Cross-browser** (if applicable): Chrome, Firefox, Safari, Edge

### 15.3 Post-Test Documentation

- [ ] **Pass/Fail status**: Document for each checklist item
- [ ] **Screenshots**: Capture any visual regressions
- [ ] **Issues logged**: Create tickets for P0/P1/P2 issues
- [ ] **Feedback entry**: Write to `feedback/qa/2025-10-19.md`
- [ ] **Sign-off**: Provide GO/NO-GO recommendation

---

## 16. GO/NO-GO Criteria

### 16.1 MUST PASS (GO Criteria)

- [ ] **Typography**: Polaris fonts, clear hierarchy ✅
- [ ] **Responsive**: All 4 breakpoints working ✅
- [ ] **Contrast**: WCAG AA compliance ✅
- [ ] **Navigation**: All links functional ✅
- [ ] **Accessibility**: Keyboard nav, focus indicators ✅
- [ ] **P0 Issues**: Zero critical blockers ❌ **FAILING**

### 16.2 CAN LAUNCH WITH (Acceptable)

- [ ] **Missing icons**: P2 priority, can add post-launch
- [ ] **Loading states**: If not testable in mock mode
- [ ] **Minor microcopy**: Can refine post-launch

### 16.3 NO-GO (Blockers)

- [ ] **Polaris AppProvider missing**: ❌ **BLOCKING**
- [ ] **Missing critical tiles**: ❌ **BLOCKING**
- [ ] **Broken interactive elements**: ❌ **BLOCKING**
- [ ] **WCAG violations**: Major accessibility issues
- [ ] **Broken responsive**: Major layout breakage

---

## Current Status: ⚠️ NO-GO

**Reason**: 2 P0 critical issues blocking production launch

**P0 Blockers**:

1. Polaris AppProvider missing (breaks all interactive features)
2. Missing 2 tiles (Idea Pool, Approvals Queue)

**Recommendation**: Hold launch until P0 issues resolved by Engineer agent.

---

## References

- **Designer Visual Review**: `feedback/designer/2025-10-19.md`
- **Production Screenshots**: `artifacts/designer/production-screenshots/` (12 files, 3.4MB)
- **Dashboard Tiles Spec**: `docs/design/dashboard-tiles.md`
- **Approvals Microcopy**: `docs/design/approvals_microcopy.md`
- **Approvals Drawer Spec**: `docs/specs/approvals_drawer_spec.md`
- **North Star**: `docs/NORTH_STAR.md`

---

## Change Log

- 2025-10-19: Version 1.0 – Initial visual regression checklist
- Based on Designer visual review (Issue #118)
- Includes findings, known issues, and GO/NO-GO criteria
