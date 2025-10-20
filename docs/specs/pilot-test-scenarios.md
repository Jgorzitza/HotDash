# Pilot Test Scenarios — HotDash Option A

**File**: `docs/specs/pilot-test-scenarios.md`  
**Created**: 2025-10-20  
**Owner**: Pilot Agent  
**Purpose**: Comprehensive test plan for Option A (13 phases, 60+ scenarios)

---

## Test Strategy

**Approach**: Continuous testing - validate each phase as Engineer completes it

**Test Categories**:
1. Approval Queue Workflows (10 scenarios)
2. Enhanced Modal Testing (15 scenarios)
3. Dashboard Testing (8 scenarios)
4. Notification Testing (8 scenarios)
5. Settings Testing (12 scenarios)
6. Real-Time Testing (5 scenarios)
7. Performance Testing (5 scenarios)
8. Accessibility Testing (8 scenarios)

**Total**: 71 test scenarios

---

## CATEGORY 1: Approval Queue Workflows (10 scenarios)

### AQ-001: Approve Customer Reply (P0)
**Phase**: 1 (Current)  
**Steps**:
1. Navigate to `/approvals`
2. Select first pending approval (CX type)
3. Review conversation preview
4. Click "Approve" button
5. Verify success toast
6. Verify approval removed from queue

**Expected**:
- Approval disappears from queue
- Toast: "Approval processed successfully"
- Badge count decrements
- Decision logged to database

**Data Required**: Customer reply approval fixture

---

### AQ-002: Reject with Reason (P0)
**Phase**: 1 (Current)  
**Steps**:
1. Navigate to `/approvals`
2. Select pending approval
3. Click "Reject" button
4. Enter rejection reason in modal
5. Submit rejection
6. Verify reason stored

**Expected**:
- Rejection modal appears
- Reason field required
- Approval marked rejected
- Decision log includes reason

---

### AQ-003: Edit Before Approving (P1)
**Phase**: 2 (Enhanced Modals)  
**Steps**:
1. Navigate to `/approvals`
2. Select CX approval
3. Click "Edit" action
4. Modify draft reply text
5. Save edits
6. Approve modified version

**Expected**:
- Edit mode enables textarea
- Changes persist
- Final approved version includes edits
- Edit stored in decision_log

---

### AQ-004: Escalate to Manager (P1)
**Phase**: 2 (Enhanced Modals)  
**Steps**:
1. Select complex approval (e.g., high-value refund)
2. Click "Escalate" action
3. Add escalation notes
4. Assign to manager
5. Verify escalation notification

**Expected**:
- Escalation creates new approval
- Original approval marked "escalated"
- Manager receives notification
- Notes included in escalation

---

### AQ-005: Multiple Approvals in Queue (P0)
**Phase**: 1 (Current)  
**Steps**:
1. Load queue with 10+ pending approvals
2. Verify all display correctly
3. Approve 3 sequentially
4. Verify queue updates after each

**Expected**:
- Queue displays all pending
- Each approval independent
- Real-time count updates
- No race conditions

**Data Required**: Multiple approval fixtures

---

### AQ-006: Empty Queue State (P0)
**Phase**: 1 (Current)  
**Steps**:
1. Approve all pending items
2. Navigate to `/approvals` when empty
3. Verify empty state message

**Expected**:
- Empty state: "No pending approvals"
- Helpful message: "You're all caught up!"
- No loading spinners
- Badge shows 0

---

### AQ-007: API Failure Error Handling (P1)
**Phase**: 4 (Notifications)  
**Steps**:
1. Simulate API failure (network disconnect)
2. Attempt to approve item
3. Verify error handling

**Expected**:
- Error toast: "Failed to process approval. Please try again."
- Retry button appears
- Approval remains in queue
- No data loss

---

### AQ-008: Keyboard Navigation (P2)
**Phase**: 11 (Accessibility Polish)  
**Steps**:
1. Navigate to `/approvals` with keyboard only
2. Tab through approval cards
3. Enter to open modal
4. Tab through modal actions
5. Escape to close

**Expected**:
- All controls reachable via Tab
- Focus visible (outline)
- Enter activates buttons
- Escape closes modals
- Focus returns to card after close

---

### AQ-009: Screen Reader Compatibility (P2)
**Phase**: 11 (Accessibility Polish)  
**Steps**:
1. Enable screen reader (NVDA or VoiceOver)
2. Navigate approval queue
3. Verify announcements

**Expected**:
- Queue count announced
- Each card readable
- Action buttons labeled
- Modal content accessible
- Success/error announced

---

### AQ-010: Mobile View (P2)
**Phase**: 13 (Polish & Mobile)  
**Steps**:
1. Open `/approvals` on mobile viewport (375px)
2. Verify card layout
3. Test tap targets (44x44px minimum)
4. Verify modal scrolling

**Expected**:
- Cards stack vertically
- Touch targets adequate
- Modal fits viewport
- Scrolling smooth
- Bottom navigation accessible

---

## CATEGORY 2: Enhanced Modal Testing (15 scenarios)

### EM-001: CX Modal - Grading Sliders All Combinations (P0)
**Phase**: 2 (Enhanced Modals)  
**Steps**:
1. Open CX escalation modal
2. Test all 3 sliders (tone/accuracy/policy)
3. Set to 1, 3, 5 for each
4. Verify stored correctly

**Expected**:
- Sliders range 1-5
- Labels clear (Poor/Fair/Good/Great/Excellent)
- Values store in decision_log.payload.grades
- Average grade calculated

**Combinations to Test**:
- All 5s (perfect)
- All 1s (poor)
- Mixed (3, 4, 5)
- Edge cases (1, 1, 5)

---

### EM-002: CX Modal - Conversation Preview Scroll (P1)
**Phase**: 2 (Enhanced Modals)  
**Steps**:
1. Open CX modal with long conversation (10+ messages)
2. Verify preview scrollable
3. Test scroll to top/bottom

**Expected**:
- Conversation history visible
- Scrollbar appears if >5 messages
- Most recent message visible first
- Timestamps formatted correctly

---

### EM-003: CX Modal - AI Suggested Reply Display (P1)
**Phase**: 2 (Enhanced Modals)  
**Steps**:
1. Open CX modal with AI suggestion
2. Verify suggested reply highlighted
3. Compare to internal notes

**Expected**:
- AI reply in distinct section
- "AI Suggested:" label
- Editable before approval
- Diff view if edited

---

### EM-004: CX Modal - Internal Notes Textarea (P1)
**Phase**: 2 (Enhanced Modals)  
**Steps**:
1. Open CX modal
2. Add internal notes (not visible to customer)
3. Submit with notes
4. Verify notes stored separately

**Expected**:
- Notes textarea 200 char max
- Placeholder: "Internal notes (not visible to customer)"
- Stored in decision_log.payload.notes
- Not sent to customer

---

### EM-005: Sales Modal - Variance Review UI (P1)
**Phase**: 2 (Enhanced Modals)  
**Steps**:
1. Open Sales Pulse modal with variance alert
2. Verify WoW comparison display
3. Check variance percentage

**Expected**:
- Current vs. previous week shown
- Variance % calculated correctly
- Visual indicator (green up / red down)
- Historical trend chart (if Phase 7 complete)

---

### EM-006: Sales Modal - Action Dropdown (P1)
**Phase**: 2 (Enhanced Modals)  
**Steps**:
1. Open Sales modal
2. Click action dropdown
3. Select each action: Log follow-up, Escalate to ops
4. Verify action stored

**Expected**:
- Dropdown has 2 options
- "Log follow-up" adds note
- "Escalate to ops" creates ops ticket
- Action stored in sales_pulse_actions table

---

### EM-007: Sales Modal - Notes with Audit Trail (P1)
**Phase**: 2 (Enhanced Modals)  
**Steps**:
1. Open Sales modal
2. Add note: "Investigating price discrepancy"
3. Submit
4. Reopen modal
5. Verify note history displayed

**Expected**:
- Notes textarea 500 char max
- Timestamp on each note
- Author shown (CEO)
- Audit trail chronological

---

### EM-008: Inventory Modal - 14-Day Velocity Display (P1)
**Phase**: 2 (Enhanced Modals)  
**Steps**:
1. Open Inventory modal for SKU
2. Verify 14-day velocity chart
3. Check ROP calculation display

**Expected**:
- Line chart shows 14 days of sales
- Velocity = average daily sales
- ROP = (Lead time × velocity) + safety stock
- Formula displayed with values

---

### EM-009: Inventory Modal - Reorder Approval Workflow (P0)
**Phase**: 2 (Enhanced Modals)  
**Steps**:
1. Open Inventory modal with low stock
2. Review reorder recommendation
3. Adjust quantity if needed
4. Select vendor
5. Approve reorder
6. Verify PO generated

**Expected**:
- Recommended quantity shown
- Quantity editable
- Vendor dropdown populated
- "Generate PO" button
- PO CSV created
- inventory_actions row created

---

### EM-010: Inventory Modal - Vendor Selection (P1)
**Phase**: 2 (Enhanced Modals)  
**Steps**:
1. Open Inventory modal
2. Click vendor dropdown
3. Verify vendor list populated
4. Select vendor
5. Verify vendor name in PO

**Expected**:
- Dropdown shows 3+ vendors
- Default vendor pre-selected
- Vendor contact info displayed
- Vendor stored in inventory_actions

---

### EM-011: All Modals - Focus Trap (P0)
**Phase**: 2 (Enhanced Modals)  
**Steps**:
1. Open any modal
2. Tab through all controls
3. Verify focus stays inside modal
4. Shift+Tab to go backwards

**Expected**:
- Tab cycles within modal
- Focus doesn't escape to background
- Last element → first element on Tab
- Shift+Tab reverses direction

---

### EM-012: All Modals - Keyboard Navigation (P0)
**Phase**: 2 (Enhanced Modals)  
**Steps**:
1. Open modal with keyboard (Enter)
2. Navigate with Tab
3. Activate buttons with Enter
4. Close with Escape

**Expected**:
- Enter opens modal
- Tab reaches all controls
- Enter activates focused button
- Escape closes modal
- Focus returns to trigger

---

### EM-013: All Modals - ARIA Labels (P1)
**Phase**: 11 (Accessibility Polish)  
**Steps**:
1. Inspect modal HTML
2. Verify ARIA attributes
3. Test with screen reader

**Expected**:
- role="dialog"
- aria-labelledby points to modal title
- aria-describedby points to description
- All buttons have aria-label
- Close button: "Close modal"

---

### EM-014: All Modals - Error States (P1)
**Phase**: 4 (Notifications) + 13 (Polish)  
**Steps**:
1. Trigger validation error (empty required field)
2. Trigger API error (network failure)
3. Verify error display

**Expected**:
- Validation errors inline (red text below field)
- API errors in banner at top
- Error icon (exclamation)
- Retry button for API errors
- Form stays populated after error

---

### EM-015: All Modals - Loading States (P1)
**Phase**: 13 (Polish)  
**Steps**:
1. Submit modal action
2. Verify loading state during API call
3. Verify button disabled during load

**Expected**:
- Submit button shows spinner
- Button text: "Processing..."
- Button disabled
- Modal not closable during load
- Timeout after 30s

---

## CATEGORY 3: Dashboard Testing (8 scenarios)

### DB-001: All 8 Tiles Loading (P0)
**Phase**: 3 (Missing Tiles)  
**Steps**:
1. Navigate to `/`
2. Verify all 8 tiles appear
3. Check tile titles match spec

**Expected**:
- 8 tiles visible:
  1. Revenue & Sales
  2. SEO & Content Watch
  3. CX Pulse
  4. Inventory Status
  5. Approval Queue (NEW Phase 3)
  6. Idea Pool (NEW Phase 3)
  7. Growth Metrics
  8. Agent Performance

**Tile Dimensions**: 2x2 grid on desktop, 1-column on mobile

---

### DB-002: Tile Refresh Individual (P1)
**Phase**: 5 (Real-Time)  
**Steps**:
1. Click refresh icon on Revenue tile
2. Verify tile re-fetches data
3. Verify loading state during refresh

**Expected**:
- Refresh icon visible on hover
- Tile shows skeleton loader during refresh
- Data updates after fetch
- Timestamp: "Updated X seconds ago"

---

### DB-003: Tile Error States (P1)
**Phase**: 13 (Polish)  
**Steps**:
1. Simulate API failure for one tile
2. Verify error display
3. Click retry button

**Expected**:
- Tile shows error message
- Icon: exclamation triangle
- "Retry" button visible
- Other tiles unaffected
- Retry re-fetches data

---

### DB-004: Tile Empty States (P1)
**Phase**: 3 (Missing Tiles)  
**Steps**:
1. Load dashboard with no data for a tile
2. Verify empty state message

**Expected**:
- Message: "No data available"
- Helpful text: "Check back later"
- No broken layouts
- Icon: inbox

---

### DB-005: Drag-Drop Tile Reordering (P2)
**Phase**: 6 (Settings & Personalization)  
**Steps**:
1. Enable edit mode
2. Drag Revenue tile to position 3
3. Verify new order persists
4. Reload page, verify order saved

**Expected**:
- Drag handle visible in edit mode
- Tile moves smoothly
- Other tiles reflow
- Order saved to user_preferences.tile_order
- Order persists across sessions

---

### DB-006: Tile Visibility Toggle (P2)
**Phase**: 6 (Settings & Personalization)  
**Steps**:
1. Go to Settings → Dashboard tab
2. Uncheck "Show Agent Performance"
3. Return to dashboard
4. Verify tile hidden

**Expected**:
- 8 checkboxes in settings
- Unchecked tiles hidden
- Grid reflows for remaining tiles
- Minimum 2 tiles always visible
- Setting saved to user_preferences.visible_tiles

---

### DB-007: Dashboard Loading Performance (P0)
**Phase**: 13 (Polish)  
**Steps**:
1. Clear cache
2. Load dashboard
3. Measure time to interactive

**Expected**:
- P95 < 3s (NORTH_STAR target)
- Skeleton loaders while fetching
- Tiles load progressively (don't block each other)
- No layout shift after load

---

### DB-008: Dashboard Responsive Layout (P2)
**Phase**: 13 (Polish & Mobile)  
**Steps**:
1. Test dashboard at 3 breakpoints:
   - Desktop: 1280px
   - Tablet: 768px
   - Mobile: 375px
2. Verify tile layout

**Expected**:
- Desktop: 2x4 grid (2 columns, 4 rows)
- Tablet: 2x4 grid
- Mobile: 1x8 stack (1 column, 8 rows)
- Touch targets ≥44x44px on mobile

---

## CATEGORY 4: Notification Testing (8 scenarios)

### NT-001: Toast Success (P0)
**Phase**: 4 (Notifications)  
**Steps**:
1. Approve an item
2. Verify success toast

**Expected**:
- Toast appears top-right
- Green background
- Message: "Approval processed successfully"
- Auto-dismiss after 5 seconds
- Dismiss button (X) works

---

### NT-002: Toast Error with Retry (P1)
**Phase**: 4 (Notifications)  
**Steps**:
1. Simulate API failure
2. Verify error toast
3. Click retry button

**Expected**:
- Toast appears top-right
- Red background
- Message: "Failed to process. Retry?"
- Retry button in toast
- Toast persists until dismissed
- Retry calls API again

---

### NT-003: Toast Info (P1)
**Phase**: 4 (Notifications)  
**Steps**:
1. Trigger info toast (e.g., "3 new approvals arrived")
2. Verify appearance

**Expected**:
- Blue background
- Info icon
- Auto-dismiss after 5 seconds
- Clickable to navigate

---

### NT-004: Banner - Queue Backlog Alert (P1)
**Phase**: 4 (Notifications)  
**Steps**:
1. Create 11+ pending approvals
2. Verify banner appears

**Expected**:
- Banner at top of dashboard
- Yellow background
- Message: "Queue backlog: 11 pending approvals"
- "Review Now" button
- Dismissable but persists on reload

---

### NT-005: Banner - Performance Warning (P1)
**Phase**: 4 (Notifications)  
**Steps**:
1. Simulate tile load time >5s
2. Verify performance warning

**Expected**:
- Banner at top
- Orange background
- Message: "Performance degraded. Some tiles loading slowly."
- "Check Status" button

---

### NT-006: Browser Notifications Permission (P1)
**Phase**: 4 (Notifications)  
**Steps**:
1. Navigate to Settings → Notifications
2. Enable browser notifications
3. Grant permission
4. Trigger notification

**Expected**:
- Permission request appears
- Explanation text before request
- "Allow" grants permission
- Test notification sent after grant
- Desktop notification appears with sound

---

### NT-007: Notification Center Slide-Out (P1)
**Phase**: 4 (Notifications)  
**Steps**:
1. Click notification bell icon
2. Verify slide-out panel
3. Test mark as read

**Expected**:
- Panel slides from right
- Badge count on icon
- Notifications grouped by date (Today, Yesterday, Older)
- Each notification clickable
- "Mark all as read" button
- Unread count updates

---

### NT-008: Browser Notifications While Tab Hidden (P1)
**Phase**: 4 (Notifications)  
**Steps**:
1. Enable browser notifications
2. Switch to different tab
3. Create new approval in background
4. Verify desktop notification appears

**Expected**:
- Notification appears even when tab hidden
- Title: "HotDash - New Approval"
- Body: "3 new approvals need review"
- Click notification focuses tab
- Sound plays (if enabled)

---

## CATEGORY 5: Settings Testing (12 scenarios)

### ST-001: Settings Page - Dashboard Tab (P1)
**Phase**: 6 (Settings)  
**Steps**:
1. Navigate to Settings
2. Click Dashboard tab
3. Test all controls

**Expected**:
- 8 tile visibility checkboxes
- Default view selector (Grid/List)
- Auto-refresh toggle
- Reset to defaults button

---

### ST-002: Settings Page - Appearance Tab (P1)
**Phase**: 6 (Settings)  
**Steps**:
1. Navigate to Settings → Appearance
2. Test theme selector
3. Switch Light → Dark → Auto

**Expected**:
- 3 theme options (Light/Dark/Auto)
- Theme applies immediately
- Auto detects system preference
- Theme saved to user_preferences.theme

---

### ST-003: Settings Page - Notifications Tab (P1)
**Phase**: 6 (Settings)  
**Steps**:
1. Navigate to Settings → Notifications
2. Test all toggles
3. Adjust thresholds

**Expected**:
- Desktop notifications toggle
- Sound toggle
- Queue backlog threshold (default 10)
- Performance alert threshold (default 5s)
- Frequency selector (realtime/5min/hourly)

---

### ST-004: Settings Page - Integrations Tab (P1)
**Phase**: 6 (Settings)  
**Steps**:
1. Navigate to Settings → Integrations
2. Verify all integration statuses

**Expected**:
- Shopify: Connected (green)
- Chatwoot: Health check button
- Google Analytics: Connected (property ID masked)
- Publer: Connected or Not Connected
- Each shows last sync time

---

### ST-005: Theme Switcher - Light Mode (P1)
**Phase**: 6 (Settings)  
**Steps**:
1. Set theme to Light
2. Verify all components use light palette
3. Check contrast ratios (WCAG AA)

**Expected**:
- White backgrounds
- Dark text
- Blue accents
- All contrast ratios ≥4.5:1
- Polaris light tokens applied

---

### ST-006: Theme Switcher - Dark Mode (P1)
**Phase**: 13 (Polish)  
**Steps**:
1. Set theme to Dark
2. Verify all components use dark palette
3. Check contrast ratios

**Expected**:
- Dark backgrounds (#1f1f1f)
- Light text
- Blue accents preserved
- All contrast ratios ≥4.5:1
- Polaris dark tokens applied

---

### ST-007: Theme Switcher - Auto Mode (P1)
**Phase**: 6 (Settings)  
**Steps**:
1. Set theme to Auto
2. Change system preference
3. Verify app theme follows

**Expected**:
- Detects system preference via `prefers-color-scheme`
- Updates immediately on system change
- No flicker on load
- Preference saved

---

### ST-008: Preference Persistence (P0)
**Phase**: 6 (Settings)  
**Steps**:
1. Change 3+ settings
2. Logout
3. Login again
4. Verify all settings restored

**Expected**:
- All settings persist in user_preferences table
- Settings load on auth
- No reset to defaults
- Settings sync across devices (if multi-device)

---

### ST-009: Reset to Defaults (P1)
**Phase**: 6 (Settings)  
**Steps**:
1. Modify all settings
2. Click "Reset to Defaults"
3. Confirm reset
4. Verify all settings restored

**Expected**:
- Confirmation modal appears
- "Are you sure?" warning
- Reset button in modal
- All settings reset to defaults:
  - Theme: Auto
  - All tiles visible
  - Default view: Grid
  - Notifications enabled

---

### ST-010: Chatwoot Health Check (P1)
**Phase**: 6 (Settings)  
**Steps**:
1. Navigate to Settings → Integrations
2. Click "Check Health" on Chatwoot
3. Verify health status

**Expected**:
- Button triggers health check
- Loading state during check
- Result: "Healthy" (green) or "Unhealthy" (red)
- Last check timestamp
- Error details if unhealthy

---

### ST-011: Integration API Key Management (P2)
**Phase**: 6 (Settings)  
**Steps**:
1. Navigate to Settings → Integrations
2. View API keys (masked)
3. Test "Regenerate" button

**Expected**:
- API keys shown as ****1234
- "Regenerate" button for each
- Confirmation modal before regen
- New key shown once (copy to clipboard)
- Old key invalidated immediately

---

### ST-012: Notification Frequency Selector (P1)
**Phase**: 6 (Settings)  
**Steps**:
1. Navigate to Settings → Notifications
2. Change frequency from Realtime to 5min
3. Verify notification behavior changes

**Expected**:
- 3 options: Realtime, Every 5 min, Hourly
- Realtime: Instant notifications
- 5min: Batch notifications every 5 min
- Hourly: Digest once per hour
- Setting applies immediately

---

## CATEGORY 6: Real-Time Testing (5 scenarios)

### RT-001: SSE Connection Established (P1)
**Phase**: 5 (Real-Time)  
**Steps**:
1. Open dashboard
2. Check DevTools Network tab
3. Verify SSE connection

**Expected**:
- EventSource connection to `/api/sse`
- Status: 200 OK
- Connection stays open
- No reconnect loops

---

### RT-002: Live Tile Updates (P1)
**Phase**: 5 (Real-Time)  
**Steps**:
1. Open dashboard
2. Create approval in background (different tab)
3. Verify Approval Queue tile updates

**Expected**:
- Tile count increments within 1 second
- Pulse animation on update
- "Updated now" timestamp
- No full page reload

---

### RT-003: Live Badge Updates (P1)
**Phase**: 5 (Real-Time)  
**Steps**:
1. Navigate away from approvals page
2. Create new approval
3. Verify navigation badge updates

**Expected**:
- Badge count increments in real-time
- Notification toast: "New approval needs review"
- Badge visible even on other pages

---

### RT-004: Connection Loss Handling (P1)
**Phase**: 5 (Real-Time)  
**Steps**:
1. Establish SSE connection
2. Disconnect network
3. Verify offline banner
4. Reconnect network
5. Verify reconnection

**Expected**:
- Offline banner appears within 5s
- Message: "Connection lost. Retrying..."
- Auto-reconnect attempts every 5s
- Success banner when reconnected
- Data syncs after reconnection

---

### RT-005: Multiple Tabs Sync (P1)
**Phase**: 5 (Real-Time)  
**Steps**:
1. Open dashboard in 2 tabs
2. Approve item in Tab 1
3. Verify Tab 2 updates

**Expected**:
- Both tabs receive SSE updates
- Both tabs show same data
- No duplicate approvals
- Queue stays in sync

---

## CATEGORY 7: Performance Testing (5 scenarios)

### PT-001: Page Load Time (P0)
**Phase**: 13 (Polish)  
**Steps**:
1. Clear cache
2. Measure dashboard first load
3. Repeat 5 times
4. Calculate P95

**Expected**:
- P95 < 3 seconds (NORTH_STAR target)
- First contentful paint < 1s
- Time to interactive < 3s
- Lighthouse Performance score ≥90

**Tools**: Chrome DevTools Performance tab, Lighthouse

---

### PT-002: Tile Load Time (P0)
**Phase**: 13 (Polish)  
**Steps**:
1. Measure each tile's load time
2. Test with network throttling (Fast 3G)
3. Verify all tiles < 2s

**Expected**:
- Each tile loads independently
- No tile blocks others
- P95 tile load < 2 seconds
- Skeleton loaders during fetch

---

### PT-003: Modal Open Time (P1)
**Phase**: 13 (Polish)  
**Steps**:
1. Measure modal open to interactive
2. Test all 3 modal types
3. Verify < 500ms

**Expected**:
- Click to visible < 200ms
- Fully interactive < 500ms
- No janky animations
- 60fps animation

---

### PT-004: API Response Time (P0)
**Phase**: 13 (Polish)  
**Steps**:
1. Measure all API endpoints
2. Test approval submit
3. Test tile data fetch

**Expected**:
- P95 response time < 1 second
- No timeouts
- Error rate < 0.5%
- Database queries optimized (indexes)

---

### PT-005: Large Dataset Handling (P1)
**Phase**: 10 (History)  
**Steps**:
1. Create 100+ approval history records
2. Load history page
3. Test filtering and pagination

**Expected**:
- Initial load < 3s
- Pagination: 20 records per page
- Filters apply within 500ms
- No UI freezing
- Smooth scrolling

---

## CATEGORY 8: Accessibility Testing (8 scenarios)

### A11Y-001: Keyboard-Only Navigation - Dashboard (P0)
**Phase**: 11 (Accessibility Polish)  
**Steps**:
1. Unplug mouse (physical constraint)
2. Navigate entire dashboard with keyboard
3. Access all tiles and buttons
4. Open modals
5. Submit forms

**Expected**:
- All interactive elements reachable via Tab
- Tab order logical (left-to-right, top-to-bottom)
- Focus visible (2px blue outline)
- Enter activates buttons/links
- Escape closes modals
- No keyboard traps

---

### A11Y-002: Screen Reader - NVDA Testing (P1)
**Phase**: 11 (Accessibility Polish)  
**Steps**:
1. Install NVDA screen reader
2. Navigate dashboard
3. Verify all content announced
4. Test form controls

**Expected**:
- Page title announced
- Tile headings announced (H2)
- Button labels clear ("Approve customer reply")
- Form labels associated with inputs
- Error messages announced
- Success feedback announced

---

### A11Y-003: Screen Reader - VoiceOver Testing (P1)
**Phase**: 11 (Accessibility Polish)  
**Steps**:
1. Enable VoiceOver (macOS)
2. Navigate dashboard
3. Test rotor navigation

**Expected**:
- Same expectations as A11Y-002
- VoiceOver rotor lists headings, buttons, forms
- Landmarks identified (navigation, main, complementary)

---

### A11Y-004: Color Contrast Verification (P0)
**Phase**: 11 (Accessibility Polish)  
**Steps**:
1. Use axe DevTools to scan dashboard
2. Verify all text meets WCAG AA
3. Test both light and dark modes

**Expected**:
- All text ≥4.5:1 contrast ratio (AA)
- Large text (18pt+) ≥3:1
- 0 color contrast violations in axe
- Dark mode meets same standards

**Tool**: axe DevTools Chrome extension

---

### A11Y-005: Focus Management in Modals (P0)
**Phase**: 11 (Accessibility Polish)  
**Steps**:
1. Open modal with keyboard
2. Verify focus moves to modal
3. Tab through modal
4. Close modal
5. Verify focus returns to trigger

**Expected**:
- Focus moves to first interactive element in modal
- Focus trapped within modal
- Tab cycles within modal only
- Close modal returns focus to button that opened it
- Focus never lost

---

### A11Y-006: ARIA Labels Comprehensive (P1)
**Phase**: 11 (Accessibility Polish)  
**Steps**:
1. Inspect all interactive elements
2. Verify ARIA attributes present
3. Test with screen reader

**Expected**:
- All buttons have aria-label or visible text
- Icon-only buttons: aria-label="Close modal"
- Form inputs: associated labels via `for` attribute
- Live regions: aria-live="polite" for notifications
- Modals: role="dialog", aria-labelledby, aria-describedby

---

### A11Y-007: WCAG 2.2 AA Compliance Audit (P0)
**Phase**: 11 (Accessibility Polish)  
**Steps**:
1. Run automated accessibility tests
2. Manual audit with axe DevTools
3. Test all WCAG criteria

**Expected**:
- 0 critical violations
- 0 serious violations
- <5 moderate violations (documented)
- Level AA compliance achieved
- Lighthouse Accessibility score ≥95

**Tools**: axe DevTools, WAVE, Lighthouse

---

### A11Y-008: Touch Target Sizes - Mobile (P1)
**Phase**: 13 (Polish & Mobile)  
**Steps**:
1. Test all interactive elements on mobile
2. Measure button dimensions
3. Verify touch targets

**Expected**:
- All buttons ≥44x44px (WCAG 2.2 Target Size)
- Spacing between targets ≥8px
- No accidental taps
- Swipe gestures work smoothly

**Tool**: Chrome DevTools device emulation + physical touch

---

## Test Execution Schedule

### Phase 1 Testing (Current - 2h)
- **Scenarios**: AQ-001 to AQ-010, DB-001, DB-004, PT-001
- **Focus**: Approval queue basic workflow, dashboard loading
- **Blockers**: Awaiting Designer retest after i18n fix

### Phase 2 Testing (Day 2 - 3h)
- **Scenarios**: EM-001 to EM-015 (all enhanced modals)
- **Focus**: Grading sliders, modal accessibility, workflows
- **Dependencies**: Engineer completes ENG-005, ENG-006, ENG-007

### Phase 3 Testing (Day 2 - 1h)
- **Scenarios**: DB-001 (8/8 tiles), DB-004, DB-008
- **Focus**: Missing tiles (Idea Pool, Approvals Queue)
- **Dependencies**: Engineer completes ENG-008, ENG-009, ENG-010

### Phase 4 Testing (Day 3 - 2h)
- **Scenarios**: NT-001 to NT-008 (all notifications)
- **Focus**: Toast, banner, browser notifications, notification center
- **Dependencies**: Engineer completes ENG-011, ENG-012, ENG-013

### Phase 5 Testing (Day 3 - 2h)
- **Scenarios**: RT-001 to RT-005 (real-time)
- **Focus**: SSE connection, live updates, connection loss
- **Dependencies**: Engineer completes ENG-023, ENG-024, ENG-025

### Phase 6 Testing (Day 4 - 3h)
- **Scenarios**: ST-001 to ST-012 (settings), DB-005, DB-006
- **Focus**: Settings page (4 tabs), drag-drop, theme switcher
- **Dependencies**: Engineer completes ENG-014 to ENG-022

### Phases 7-8 Testing (Day 4 - 2h)
- **Scenarios**: Charts in tiles and modals (data viz)
- **Focus**: Sparklines, trend charts, interactivity
- **Dependencies**: Engineer completes ENG-026, ENG-027, ENG-028

### Phase 10 Testing (Day 5 - 1h)
- **Scenarios**: PT-005, approval history page testing
- **Focus**: History table, filters, CSV export, pagination
- **Dependencies**: Engineer completes ENG-032, ENG-033, ENG-034

### Phases 11-13 Testing (Day 5-6 - 4h)
- **Scenarios**: A11Y-001 to A11Y-008, PT-001 to PT-004, polish
- **Focus**: WCAG 2.2 AA compliance, performance benchmarks, final UAT
- **Dependencies**: Engineer completes ENG-035 to ENG-038

---

## Test Environment

**URL**: https://hotdash-staging.fly.dev  
**Branch**: manager-reopen-20251020  
**Database**: Supabase staging  
**Credentials**: From vault (if available) or .env.staging

**Tools Required**:
- Chrome DevTools (Performance, Network, Lighthouse)
- axe DevTools extension
- WAVE accessibility extension
- NVDA screen reader (Windows) or VoiceOver (macOS)
- Device emulation for mobile testing (375px, 768px, 1280px)

---

## Test Report Template

After each phase, create report in feedback/pilot/2025-10-20.md:

```md
## Phase N Testing Complete

**Tests Run**: X/X scenarios  
**Results**: X PASS, X FAIL

**Failures**:
1. [Scenario ID]: [Issue description]
   - Severity: P0/P1/P2
   - Assigned to: Engineer
   - Evidence: [screenshot, logs, video]

**Pass Highlights**:
- [Key functionality working]
- [Performance benchmarks met]
- [Accessibility verified]

**Verdict**: Phase N [PASS / BLOCKED] until [issues fixed]
```

---

## Success Criteria (Option A Complete)

**All 71 scenarios PASS** across 8 categories:
- ✅ Approval queue workflows (10/10)
- ✅ Enhanced modals (15/15)
- ✅ Dashboard (8/8)
- ✅ Notifications (8/8)
- ✅ Settings (12/12)
- ✅ Real-time (5/5)
- ✅ Performance (5/5)
- ✅ Accessibility (8/8)

**Performance Benchmarks**:
- P95 page load < 3s ✅
- Tile load < 2s ✅
- Modal open < 500ms ✅
- API response < 1s ✅

**Accessibility**:
- WCAG 2.2 AA compliant ✅
- 0 critical violations ✅
- Lighthouse score ≥95 ✅

**Designer Sign-Off**: All 57 design specs implemented ✅

**CEO Approval**: Option A COMPLETE → Production deploy ✅

---

**Status**: TEST PLAN COMPLETE (71 scenarios documented)  
**Created**: 2025-10-20T16:50:00Z  
**Next**: Begin Phase 1 testing (awaiting Designer retest approval)

