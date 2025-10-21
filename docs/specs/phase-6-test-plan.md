# Phase 6 Test Plan — Settings & Personalization

**Document**: `docs/specs/phase-6-test-plan.md`
**Created**: 2025-10-21
**Owner**: QA Agent
**Purpose**: Comprehensive test scenarios for Phase 6 (Settings & Personalization) features

---

## Overview

This test plan covers all Phase 6 features with detailed test scenarios, edge cases, and acceptance criteria aligned with NORTH_STAR.md performance targets and WCAG 2.2 AA accessibility requirements.

**Phase 6 Features**:
1. Settings page with 4 tabs (Dashboard, Appearance, Notifications, Integrations)
2. Drag/drop tile reordering
3. Theme switching (Light/Dark/Auto)
4. Tile visibility toggles
5. User preferences persistence (Supabase RLS)
6. Integration health checks

**Testing Goals**:
- 30+ test scenarios covering happy path, error states, and edge cases
- Accessibility compliance (keyboard nav, screen reader, color contrast)
- Performance validation (load time, interaction responsiveness)
- Data persistence and security (RLS enforcement)

---

## Test Scenarios (35 total)

### Category 1: Dashboard Tab Settings (8 scenarios)

#### TS-001: Toggle Tile Visibility
**Feature**: Tile visibility toggles
**Priority**: P0
**User Story**: As a user, I want to hide tiles I don't use so my dashboard is focused on what matters to me

**Preconditions**:
- User logged into dashboard
- All 8+ tiles visible by default

**Steps**:
1. Navigate to Settings → Dashboard tab
2. Locate tile visibility section
3. Toggle 3 tiles OFF (e.g., SEO Status, Idea Pool, CEO Agent)
4. Click "Save Preferences"
5. Navigate back to dashboard

**Expected Results**:
- ✅ Toggled tiles immediately hidden from dashboard
- ✅ Save button shows success toast "Preferences saved"
- ✅ Dashboard reflects changes without full page reload
- ✅ Hidden tiles persist after browser refresh
- ✅ Minimum 2 tiles always remain visible (enforcement)

**Acceptance Criteria**:
- Changes persist in Supabase user_preferences table
- RLS enforces user can only modify own preferences
- Performance: Save operation < 500ms

---

#### TS-002: Drag and Drop Tile Reordering
**Feature**: Drag/drop tile reorder
**Priority**: P0
**User Story**: As a user, I want to reorder tiles so the most important ones appear first

**Preconditions**:
- User on Settings → Dashboard tab
- At least 6 tiles visible

**Steps**:
1. Drag "Revenue & Sales" tile to position 5
2. Drag "CX Queue" tile to position 1
3. Drag "Inventory Alerts" tile to position 2
4. Click "Save Preferences"
5. Return to dashboard

**Expected Results**:
- ✅ Tiles reorder in real-time during drag
- ✅ Drop zones highlight on drag-over
- ✅ Invalid drop positions rejected (visual feedback)
- ✅ New order persists after save
- ✅ Dashboard renders tiles in new order

**Acceptance Criteria**:
- Drag operation responsive (< 200ms feedback)
- Order saved as array in user_preferences.tile_order
- Keyboard alternative provided (up/down buttons - accessibility)

---

#### TS-003: Minimum Tile Enforcement
**Feature**: Tile visibility validation
**Priority**: P0
**User Story**: As a user, I should be prevented from hiding all tiles to avoid empty dashboard

**Preconditions**:
- User on Settings → Dashboard tab
- Exactly 2 tiles visible

**Steps**:
1. Attempt to toggle OFF one of the 2 visible tiles
2. Observe UI response

**Expected Results**:
- ✅ Toggle disabled with tooltip: "Minimum 2 tiles required"
- ✅ Error toast if toggle attempted: "Cannot hide tile - minimum 2 tiles must be visible"
- ✅ Save button remains active (no change to save)

**Acceptance Criteria**:
- Client-side validation prevents < 2 tiles
- Server-side validation rejects save with < 2 tiles
- User-friendly error messaging

---

#### TS-004: Default View Selection (Grid vs List)
**Feature**: Dashboard view preference
**Priority**: P1
**User Story**: As a user, I want to choose between grid and list views for my dashboard layout

**Preconditions**:
- User on Settings → Dashboard tab
- Current view is "Grid"

**Steps**:
1. Select "List" from view dropdown
2. Preview changes (if available)
3. Save preferences
4. Navigate to dashboard

**Expected Results**:
- ✅ Dashboard renders in list view
- ✅ Tile order preserved in new view
- ✅ Preference persists across sessions
- ✅ View toggle accessible via keyboard (Tab + Enter)

**Acceptance Criteria**:
- View preference saved in user_preferences.dashboard_view
- Both views accessible and functional

---

#### TS-005: Auto-Refresh Toggle
**Feature**: Tile auto-refresh setting
**Priority**: P1
**User Story**: As a user, I want to control whether tiles auto-refresh so I can reduce distractions

**Preconditions**:
- User on Settings → Dashboard tab
- Auto-refresh currently enabled (default)

**Steps**:
1. Toggle auto-refresh OFF
2. Save preferences
3. Return to dashboard
4. Wait 5 minutes (normal refresh interval)

**Expected Results**:
- ✅ Tiles do not auto-refresh
- ✅ Manual refresh button still functional
- ✅ Preference persists
- ✅ Re-enabling auto-refresh resumes interval

**Acceptance Criteria**:
- Auto-refresh interval respects user preference
- Manual refresh always available regardless of setting

---

#### TS-006: Reset to Defaults
**Feature**: Reset dashboard settings
**Priority**: P1
**User Story**: As a user, I want to reset my dashboard to defaults if my customizations become confusing

**Preconditions**:
- User has customized: tile order, visibility, view

**Steps**:
1. Click "Reset to Defaults" button
2. Confirm in modal: "Are you sure? This will reset all dashboard settings."
3. Click "Reset"

**Expected Results**:
- ✅ Confirmation modal appears (prevent accidental reset)
- ✅ All tiles visible in default order
- ✅ View returns to Grid
- ✅ Auto-refresh enabled
- ✅ Success toast: "Dashboard settings reset to defaults"

**Acceptance Criteria**:
- Reset clears user_preferences.dashboard_* fields
- User can cancel reset (modal has Cancel button)

---

#### TS-007: Concurrent Edit Conflict
**Feature**: Multi-tab preference editing
**Priority**: P2
**User Story**: As a user editing preferences in multiple tabs, I should be notified of conflicts

**Preconditions**:
- User has settings open in Tab A and Tab B

**Steps**:
1. In Tab A: Toggle tile visibility, DO NOT save yet
2. In Tab B: Change tile order, click Save
3. In Tab A: Click Save

**Expected Results**:
- ✅ Tab A shows warning: "Settings were updated in another tab. Refresh to see latest changes."
- ✅ Option to "Overwrite" or "Reload" settings
- ✅ Last-write-wins if user chooses Overwrite
- ✅ No data loss

**Acceptance Criteria**:
- Optimistic locking or version check on save
- User informed of conflict before overwriting

---

#### TS-008: Tile Order Performance Benchmark
**Feature**: Drag/drop performance
**Priority**: P1
**User Story**: As a user, drag/drop should feel instant and responsive

**Preconditions**:
- User on Settings → Dashboard tab
- 8+ tiles available

**Steps**:
1. Use Performance API to measure drag response time
2. Drag tile from position 1 to position 8
3. Measure time from mousedown to visual feedback

**Expected Results**:
- ✅ Drag start feedback < 100ms
- ✅ Drop animation < 200ms
- ✅ Save operation < 500ms
- ✅ No layout jank (CLS < 0.1)

**Acceptance Criteria**:
- Meets NORTH_STAR performance target (Tile reorder < 200ms)
- Smooth animations (no dropped frames)

---

### Category 2: Appearance Tab Settings (6 scenarios)

#### TS-009: Light Theme Selection
**Feature**: Theme switching
**Priority**: P0
**User Story**: As a user, I want to use light theme for better visibility in bright environments

**Preconditions**:
- Current theme is Dark
- User on Settings → Appearance tab

**Steps**:
1. Select "Light" theme radio button
2. Observe immediate preview
3. Click "Save Preferences"

**Expected Results**:
- ✅ Theme applies immediately (no page reload)
- ✅ All components use light palette
- ✅ No flash of unstyled content (FOUC)
- ✅ Preference persists across sessions
- ✅ Theme switch < 100ms (NORTH_STAR target)

**Acceptance Criteria**:
- Theme stored in user_preferences.theme
- All Polaris components respect theme
- Color contrast meets WCAG AA (4.5:1)

---

#### TS-010: Dark Theme Selection
**Feature**: Theme switching
**Priority**: P0
**User Story**: As a user, I want dark theme to reduce eye strain in low-light conditions

**Preconditions**:
- Current theme is Light
- User on Settings → Appearance tab

**Steps**:
1. Select "Dark" theme
2. Observe immediate preview
3. Save preferences
4. Navigate through all pages (Dashboard, Settings, Modals)

**Expected Results**:
- ✅ Dark theme applies to all pages
- ✅ Modals use dark palette
- ✅ Icons and text remain readable (contrast checked)
- ✅ No white flashes during navigation

**Acceptance Criteria**:
- Dark mode color contrast meets WCAG AA
- All UI elements properly themed (no missed components)

---

#### TS-011: Auto Theme (System Preference)
**Feature**: Auto theme based on system
**Priority**: P0
**User Story**: As a user, I want the app theme to match my operating system preference automatically

**Preconditions**:
- User system theme is Light
- App theme set to Auto

**Steps**:
1. Select "Auto" theme in settings
2. Save preferences
3. Change system theme to Dark (OS settings)
4. Return to app

**Expected Results**:
- ✅ App detects system theme change
- ✅ Theme switches automatically to Dark
- ✅ No manual refresh required
- ✅ Auto preference persists

**Acceptance Criteria**:
- Uses `prefers-color-scheme` media query
- Listener updates theme on system change
- Works on macOS, Windows, Linux

---

#### TS-012: Theme Persistence After Logout
**Feature**: Theme persistence
**Priority**: P1
**User Story**: As a user, my theme preference should be remembered when I log back in

**Preconditions**:
- User selects Dark theme
- User saves preferences

**Steps**:
1. Log out
2. Log back in
3. Observe initial theme

**Expected Results**:
- ✅ Dark theme loads immediately (no flash of Light theme)
- ✅ Theme applied before first render (critical for UX)
- ✅ Preference loaded from Supabase

**Acceptance Criteria**:
- Theme loaded in app shell (before React hydration)
- SSR respects user preference if available

---

#### TS-013: Rapid Theme Switching Stress Test
**Feature**: Theme switching performance
**Priority**: P2
**User Story**: As a user, the app should handle rapid theme changes without errors

**Preconditions**:
- User on Settings → Appearance tab

**Steps**:
1. Click Light → Dark → Auto → Light (rapid succession, 10x)
2. Observe performance and errors
3. Save final theme

**Expected Results**:
- ✅ No console errors
- ✅ No visual flicker or broken styles
- ✅ Final theme state correct
- ✅ Performance remains smooth (no lag)

**Acceptance Criteria**:
- Theme state management debounced/optimized
- No memory leaks from rapid changes

---

#### TS-014: Theme Accessibility Verification
**Feature**: Theme color contrast
**Priority**: P0
**User Story**: As a user with vision impairment, all text should be readable in both themes

**Preconditions**:
- Accessibility testing tools available (axe DevTools)

**Steps**:
1. Apply Light theme
2. Run axe DevTools accessibility audit
3. Apply Dark theme
4. Run axe DevTools accessibility audit

**Expected Results**:
- ✅ Light theme: 0 color contrast violations (4.5:1 minimum)
- ✅ Dark theme: 0 color contrast violations
- ✅ Interactive elements meet 3:1 contrast (buttons, borders)
- ✅ Lighthouse Accessibility score ≥ 95

**Acceptance Criteria**:
- All text meets WCAG 2.2 Level AA contrast requirements
- Non-text UI elements meet 3:1 contrast

---

### Category 3: Notifications Tab Settings (5 scenarios)

#### TS-015: Desktop Notifications Toggle
**Feature**: Browser notification permissions
**Priority**: P1
**User Story**: As a user, I want to enable desktop notifications for important alerts

**Preconditions**:
- Browser supports Notification API
- Permission not yet granted

**Steps**:
1. Toggle "Desktop Notifications" ON
2. Grant permission in browser prompt
3. Trigger test notification (button)
4. Save preferences

**Expected Results**:
- ✅ Browser permission prompt appears
- ✅ Test notification displays with app icon and message
- ✅ Preference saved even if permission denied
- ✅ Notification settings gray out if permission denied

**Acceptance Criteria**:
- Graceful handling of denied permissions
- Test notification uses proper format

---

#### TS-016: Notification Sound Toggle
**Feature**: Notification sound preference
**Priority**: P2
**User Story**: As a user, I want to disable notification sounds in quiet environments

**Preconditions**:
- Desktop notifications enabled
- Sound currently ON

**Steps**:
1. Toggle "Sound" OFF
2. Save preferences
3. Trigger notification (test button or real event)

**Expected Results**:
- ✅ Notification displays silently (no audio)
- ✅ Preference persists
- ✅ Re-enabling sound works immediately

**Acceptance Criteria**:
- Audio muted when preference is OFF
- Sound preference independent of notification toggle

---

#### TS-017: Threshold Configuration (Queue Backlog)
**Feature**: Alert thresholds
**Priority**: P1
**User Story**: As a user, I want to set when I get alerted about CX queue backlog

**Preconditions**:
- User on Settings → Notifications tab

**Steps**:
1. Set "CX Queue Backlog Threshold" to 15 items
2. Save preferences
3. Simulate queue with 14 items (no alert)
4. Add 1 item (15 total)

**Expected Results**:
- ✅ No alert at 14 items
- ✅ Alert triggered at 15 items: "CX Queue backlog is at 15 items"
- ✅ Threshold stored in user_preferences.notification_thresholds
- ✅ Alert includes action: "View Queue"

**Acceptance Criteria**:
- Threshold applied to real-time monitoring
- Alert triggered exactly at threshold (not below or above)

---

#### TS-018: Threshold Configuration (Performance)
**Feature**: Performance alert thresholds
**Priority**: P1
**User Story**: As a user, I want to be alerted when dashboard load time exceeds my acceptable limit

**Preconditions**:
- User on Settings → Notifications tab

**Steps**:
1. Set "Performance Threshold" to 3 seconds
2. Save preferences
3. Simulate slow dashboard load (4 seconds)

**Expected Results**:
- ✅ Alert displayed: "Dashboard load time exceeded 3s (actual: 4.1s)"
- ✅ Threshold configurable (1s - 10s range)
- ✅ Alert includes suggestion: "Consider hiding tiles or clearing cache"

**Acceptance Criteria**:
- Performance monitoring respects user threshold
- Alert actionable (suggests improvement)

---

#### TS-019: Notification Frequency Setting
**Feature**: Notification batching
**Priority**: P2
**User Story**: As a user, I want to batch notifications to avoid constant interruptions

**Preconditions**:
- Desktop notifications enabled
- Frequency set to "Realtime"

**Steps**:
1. Change frequency to "Every 5 minutes"
2. Save preferences
3. Trigger 5 events within 5 minutes
4. Observe notification behavior

**Expected Results**:
- ✅ Notifications batched and delivered every 5 minutes
- ✅ Batch summary: "5 new notifications"
- ✅ Expanding shows individual notifications
- ✅ "Realtime" delivers immediately (no batching)

**Acceptance Criteria**:
- Batching logic respects frequency setting
- Options: Realtime, 5min, 15min, Hourly, Daily digest

---

### Category 4: Integrations Tab Settings (4 scenarios)

#### TS-020: Integration Status Display
**Feature**: Integration health status
**Priority**: P1
**User Story**: As a user, I want to see the health status of all integrations at a glance

**Preconditions**:
- User on Settings → Integrations tab
- Integrations: Shopify, Chatwoot, Google Analytics, Publer

**Steps**:
1. Observe integration cards
2. Check status indicators

**Expected Results**:
- ✅ Each integration shows status: Healthy ✓ | Unhealthy ✗ | Unknown ?
- ✅ Last sync time displayed: "Last synced 2 minutes ago"
- ✅ Status icon color-coded (green/red/gray)
- ✅ Status text provided (not color-only - accessibility)

**Acceptance Criteria**:
- Status loaded from health check endpoint
- Timestamp shows relative time (human-readable)

---

#### TS-021: Manual Health Check Trigger
**Feature**: Integration health check
**Priority**: P1
**User Story**: As a user, I want to manually verify integration health when troubleshooting

**Preconditions**:
- Chatwoot integration showing "Unknown" status

**Steps**:
1. Click "Check Health" button on Chatwoot card
2. Observe status update

**Expected Results**:
- ✅ Button shows loading state: "Checking..."
- ✅ Status updates to "Healthy" or "Unhealthy"
- ✅ If unhealthy, error details shown: "API returned 503"
- ✅ Health check completes in < 5 seconds

**Acceptance Criteria**:
- Health check calls actual integration endpoint
- Error messages helpful for troubleshooting
- Timeout after 10 seconds with error message

---

#### TS-022: Masked API Keys Display
**Feature**: API key security
**Priority**: P0
**User Story**: As a user, my API keys should be masked for security

**Preconditions**:
- User on Settings → Integrations tab
- Shopify API key configured

**Steps**:
1. Observe Shopify integration card
2. Check API key display

**Expected Results**:
- ✅ API key shown as: `****************************1234` (last 4 digits)
- ✅ Full key never exposed in UI
- ✅ Copy button (if present) disabled or shows warning

**Acceptance Criteria**:
- API keys masked in all views (settings, logs)
- Full key only visible in secure environment (server-side)

---

#### TS-023: Integration Reconnection Flow
**Feature**: Integration reconnection
**Priority**: P2
**User Story**: As a user, I want to reconnect an integration if it becomes disconnected

**Preconditions**:
- Publer integration status: "Unhealthy - Authentication expired"

**Steps**:
1. Click "Reconnect" button on Publer card
2. Complete OAuth flow (new tab/popup)
3. Return to settings

**Expected Results**:
- ✅ OAuth flow opens in popup window
- ✅ After auth, status updates to "Healthy"
- ✅ Last sync time resets to "Just now"
- ✅ Success toast: "Publer reconnected successfully"

**Acceptance Criteria**:
- OAuth flow follows security best practices
- Token refresh handled automatically

---

### Category 5: Accessibility Testing (6 scenarios)

#### TS-024: Keyboard Navigation (Tab Order)
**Feature**: Keyboard accessibility
**Priority**: P0
**User Story**: As a keyboard user, I want to navigate settings using only keyboard

**Preconditions**:
- User on Settings page
- Mouse/trackpad disabled

**Steps**:
1. Press Tab repeatedly to cycle through all interactive elements
2. Navigate through all 4 tabs (Dashboard, Appearance, Notifications, Integrations)
3. Activate toggles with Space, buttons with Enter

**Expected Results**:
- ✅ Tab order logical (top-to-bottom, left-to-right)
- ✅ All interactive elements focusable
- ✅ Focus indicators visible (4.5:1 contrast)
- ✅ Shift+Tab moves backward
- ✅ No keyboard traps (can exit all components)

**Acceptance Criteria**:
- Meets WCAG 2.1.1 (Keyboard - Level A)
- Focus indicators meet WCAG 2.4.7 (Focus Visible - Level AA)

---

#### TS-025: Screen Reader Compatibility (NVDA)
**Feature**: Screen reader support
**Priority**: P0
**User Story**: As a blind user, I want to use settings with a screen reader

**Preconditions**:
- NVDA screen reader active (Windows)
- User on Settings page

**Steps**:
1. Press H to cycle through headings
2. Tab through form controls
3. Toggle a switch and listen to announcement
4. Save preferences

**Expected Results**:
- ✅ All headings announced: "Dashboard settings", "Theme", etc.
- ✅ Form labels read aloud: "Dark theme radio button, not selected"
- ✅ Toggles announce state: "Tile visibility toggle, on"
- ✅ Buttons have accessible labels: "Save preferences button"
- ✅ Success toast announced: "Preferences saved successfully"

**Acceptance Criteria**:
- All interactive elements have accessible names
- State changes announced (aria-live regions)
- Meets WCAG 4.1.2 (Name, Role, Value - Level A)

---

#### TS-026: Drag/Drop Keyboard Alternative
**Feature**: Accessible tile reordering
**Priority**: P0
**User Story**: As a keyboard-only user, I want to reorder tiles without drag/drop

**Preconditions**:
- User cannot use mouse
- At least 6 tiles available

**Steps**:
1. Click "Edit Tile Order" button (keyboard: Tab + Enter)
2. Modal opens with tile list
3. Tab to "Revenue & Sales" tile
4. Press Down Arrow button to move tile down
5. Press Up Arrow button to move tile up
6. Save new order

**Expected Results**:
- ✅ "Edit Tile Order" button accessible via keyboard
- ✅ Modal has focus trap (Tab cycles within)
- ✅ Up/Down arrow buttons have clear labels: "Move Revenue & Sales up"
- ✅ Current position announced: "Revenue & Sales, position 3 of 8"
- ✅ Save button saves new order

**Acceptance Criteria**:
- Meets WCAG 2.5.7 (Dragging Movements - Level AA)
- Keyboard alternative provides same functionality as drag/drop

---

#### TS-027: Color Contrast Verification (Light Theme)
**Feature**: Visual accessibility
**Priority**: P0
**User Story**: As a user with low vision, all text should meet minimum contrast ratios

**Preconditions**:
- Light theme active
- Contrast checker tool available (e.g., WebAIM)

**Steps**:
1. Measure contrast ratios for all text elements:
   - Primary text
   - Secondary text (labels, help text)
   - Interactive text (links, buttons)
   - Error/warning/success text
   - Placeholder text

**Expected Results**:
- ✅ Primary text (black on white): ≥ 4.5:1 (16.3:1 actual)
- ✅ Secondary text (gray on white): ≥ 4.5:1 (7.2:1 actual)
- ✅ Interactive text (blue on white): ≥ 4.5:1 (4.6:1 actual)
- ✅ Error text: ≥ 4.5:1 (6.4:1 actual)
- ✅ UI components (borders): ≥ 3:1

**Acceptance Criteria**:
- Meets WCAG 1.4.3 (Contrast Minimum - Level AA)
- Large text (18pt+) meets 3:1 contrast

---

#### TS-028: Focus Management in Modals
**Feature**: Modal focus trap
**Priority**: P0
**User Story**: As a keyboard user, focus should stay within modals and return properly

**Preconditions**:
- User on Settings page

**Steps**:
1. Click "Reset to Defaults" button (modal opens)
2. Press Tab to cycle through modal elements
3. Verify focus stays within modal
4. Press Escape to close modal
5. Verify focus returns to "Reset to Defaults" button

**Expected Results**:
- ✅ Focus moves to first interactive element in modal (Cancel or Confirm button)
- ✅ Tab cycles only within modal (focus trapped)
- ✅ Shift+Tab cycles backward within modal
- ✅ Escape key closes modal
- ✅ Focus returns to trigger button after close

**Acceptance Criteria**:
- Meets WCAG 2.1.2 (No Keyboard Trap - Level A)
- Focus management follows WAI-ARIA authoring practices

---

#### TS-029: ARIA Labels and Roles Audit
**Feature**: ARIA accessibility
**Priority**: P1
**User Story**: As an assistive technology user, all UI elements should have proper ARIA attributes

**Preconditions**:
- axe DevTools installed
- User on Settings page

**Steps**:
1. Run axe DevTools accessibility audit
2. Check for ARIA violations
3. Manually verify key elements:
   - Tabs have role="tab", aria-selected
   - Toggles have role="switch", aria-checked
   - Buttons have aria-label or visible text

**Expected Results**:
- ✅ 0 critical ARIA violations
- ✅ All custom components have proper roles
- ✅ All form controls have associated labels
- ✅ Tabs properly implemented with tablist/tab/tabpanel

**Acceptance Criteria**:
- Lighthouse Accessibility score ≥ 95
- axe DevTools: 0 critical violations
- Meets WCAG 4.1.2 (Name, Role, Value - Level A)

---

### Category 6: Error Handling & Edge Cases (6 scenarios)

#### TS-030: Network Failure During Save
**Feature**: Error recovery
**Priority**: P0
**User Story**: As a user with unstable internet, I want clear feedback when saves fail

**Preconditions**:
- User has modified settings
- Network disconnected (Chrome DevTools → Network → Offline)

**Steps**:
1. Make changes to settings
2. Click "Save Preferences"
3. Observe error handling

**Expected Results**:
- ✅ Loading state shown: "Saving preferences..."
- ✅ After timeout (10s), error toast appears: "Could not save preferences. Check your connection and try again."
- ✅ Retry button provided in toast
- ✅ Changes remain in form (not lost)
- ✅ Clicking Retry attempts save again

**Acceptance Criteria**:
- Timeout set to 10 seconds
- User-friendly error messaging
- Retry mechanism functional

---

#### TS-031: API Validation Error
**Feature**: Server-side validation
**Priority**: P1
**User Story**: As a user, I want helpful feedback if my settings are invalid

**Preconditions**:
- User on Settings page

**Steps**:
1. Attempt to save invalid state (e.g., negative threshold value via dev tools)
2. Submit form

**Expected Results**:
- ✅ Server returns 400 Bad Request
- ✅ Inline error shown: "Threshold must be between 1 and 100"
- ✅ Field highlighted with error state (red border)
- ✅ Save button remains enabled (user can correct and retry)

**Acceptance Criteria**:
- Server-side validation catches all invalid inputs
- Error messages specific and actionable
- No silent failures

---

#### TS-032: Session Timeout During Edit
**Feature**: Session management
**Priority**: P2
**User Story**: As a user, I should be notified if my session expires while editing settings

**Preconditions**:
- User logged in
- Session timeout: 30 minutes

**Steps**:
1. Open Settings page
2. Wait 31 minutes (or expire session manually)
3. Make changes
4. Attempt to save

**Expected Results**:
- ✅ API returns 401 Unauthorized
- ✅ Modal appears: "Your session has expired. Please log in again."
- ✅ Redirect to login page (preserving intent to save settings)
- ✅ After login, return to Settings with changes preserved (if possible)

**Acceptance Criteria**:
- Session expiration handled gracefully
- No data loss on re-login

---

#### TS-033: Concurrent Save Conflict
**Feature**: Optimistic locking
**Priority**: P2
**User Story**: As a user editing in multiple tabs, I should be warned of conflicts

**Preconditions**:
- Settings open in Tab A and Tab B

**Steps**:
1. In Tab A: Change theme to Dark (don't save)
2. In Tab B: Change theme to Light, click Save
3. In Tab A: Click Save

**Expected Results**:
- ✅ Tab A shows conflict warning: "Settings were updated in another tab. Your changes may overwrite newer settings."
- ✅ Options: "Reload Settings" or "Overwrite Anyway"
- ✅ If "Reload", Tab A refreshes with Light theme (from Tab B)
- ✅ If "Overwrite", Dark theme saved (Tab A wins)

**Acceptance Criteria**:
- Last-write-wins with user confirmation
- Version check on save (compare timestamps)

---

#### TS-034: Drag Tile to Invalid Position
**Feature**: Drag/drop validation
**Priority**: P2
**User Story**: As a user, dragging tiles to invalid positions should be prevented

**Preconditions**:
- User on Settings → Dashboard tab
- Drag/drop enabled

**Steps**:
1. Drag "Revenue & Sales" tile
2. Attempt to drop outside grid area (e.g., on tab header)
3. Release mouse

**Expected Results**:
- ✅ Tile snaps back to original position
- ✅ Visual feedback: Invalid drop zone has red border or X icon
- ✅ No error toast (expected behavior, not an error)

**Acceptance Criteria**:
- Drop validation prevents invalid positions
- User receives immediate visual feedback

---

#### TS-035: Long Preference Value Handling
**Feature**: Data truncation/validation
**Priority**: P3
**User Story**: As a user, extremely long input values should be handled gracefully

**Preconditions**:
- User on Settings → Notifications tab (if there's a notes field)

**Steps**:
1. Enter 5000 characters in notes field (if available)
2. Attempt to save

**Expected Results**:
- ✅ Client-side validation shows character count: "4000/1000 characters"
- ✅ Save button disabled with message: "Note too long (max 1000 characters)"
- ✅ Alternatively, field truncates to 1000 chars with warning

**Acceptance Criteria**:
- Character limits enforced client-side and server-side
- User informed of limits before submission

---

## Performance Benchmarks

### Target Metrics (from NORTH_STAR.md)

| Metric | Target | Measurement Method | Test Scenario |
|--------|--------|-------------------|---------------|
| **Settings Page Load** | < 2s | Navigation Timing API | TS-004, TS-009 |
| **Tile Reorder Response** | < 200ms | User Timing API | TS-002, TS-008 |
| **Theme Switch Time** | < 100ms | Performance.now() | TS-009, TS-010, TS-013 |
| **Preference Save Time** | < 500ms | API response time | TS-001, TS-005, TS-015 |
| **Dashboard Load** (P95) | < 3s | Performance Observer | General |

### Performance Test Commands

```javascript
// Measure Settings page load
performance.mark('settings-start');
// ... navigate to /settings ...
performance.mark('settings-end');
performance.measure('settings-load', 'settings-start', 'settings-end');
const measure = performance.getEntriesByName('settings-load')[0];
console.log('Settings load time:', measure.duration, 'ms'); // Must be < 2000ms

// Measure theme switch
performance.mark('theme-switch-start');
// ... click theme toggle ...
requestAnimationFrame(() => {
  performance.mark('theme-switch-end');
  performance.measure('theme-switch', 'theme-switch-start', 'theme-switch-end');
  const measure = performance.getEntriesByName('theme-switch')[0];
  console.log('Theme switch time:', measure.duration, 'ms'); // Must be < 100ms
});
```

---

## Accessibility Acceptance Criteria

### WCAG 2.2 Level AA Compliance

**Required for Launch (P0)**:
- [ ] All text meets 4.5:1 contrast ratio (1.4.3)
- [ ] All interactive elements keyboard accessible (2.1.1)
- [ ] Focus indicators visible on all elements (2.4.7)
- [ ] No keyboard traps (2.1.2)
- [ ] Drag/drop has keyboard alternative (2.5.7)
- [ ] Screen reader compatible (4.1.2)
- [ ] Color not sole indicator of state (1.4.1)

**Automated Test Commands**:
```bash
# Lighthouse accessibility audit
lighthouse https://your-app.com/settings --only-categories=accessibility --chrome-flags="--headless"
# Target score: ≥ 95

# axe DevTools (run in browser console)
# Install: chrome.google.com/webstore → axe DevTools
# Target: 0 critical violations, < 5 moderate violations
```

---

## Data Integrity & Security

### Database Schema Validation

**user_preferences table** (Supabase):
```sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT CHECK (theme IN ('light', 'dark', 'auto')) DEFAULT 'auto',
  dashboard_view TEXT CHECK (dashboard_view IN ('grid', 'list')) DEFAULT 'grid',
  auto_refresh BOOLEAN DEFAULT true,
  tile_order JSONB DEFAULT '[]'::JSONB,
  tile_visibility JSONB DEFAULT '{}'::JSONB,
  notification_settings JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Row Level Security (RLS)
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

**Test Queries**:
```sql
-- Verify RLS enforcement (should only return current user's row)
SELECT * FROM user_preferences;

-- Check tile order persistence
SELECT tile_order FROM user_preferences WHERE user_id = auth.uid();

-- Validate theme constraint
INSERT INTO user_preferences (user_id, theme) VALUES (auth.uid(), 'invalid'); -- Should fail
```

---

## Test Execution Plan

### Phase 1: Unit/Integration Tests (Vitest)
**Duration**: 4 hours
**Scenarios**: TS-001, TS-003, TS-030, TS-031, TS-035
**Deliverable**: Passing unit tests for settings components

### Phase 2: E2E Tests (Playwright)
**Duration**: 6 hours
**Scenarios**: TS-001 through TS-023 (functional tests)
**Deliverable**: Automated E2E test suite

### Phase 3: Accessibility Tests (Playwright + axe)
**Duration**: 3 hours
**Scenarios**: TS-024 through TS-029
**Deliverable**: Accessibility compliance report

### Phase 4: Performance Tests (Playwright)
**Duration**: 2 hours
**Scenarios**: TS-008, TS-013 (performance benchmarks)
**Deliverable**: Performance regression baseline

### Phase 5: Manual Testing (QA Agent)
**Duration**: 4 hours
**Scenarios**: All edge cases (TS-030 through TS-035)
**Deliverable**: Manual test results documented in feedback

**Total Estimated Time**: 19 hours

---

## Success Criteria

### Launch Readiness (All must pass)

**Functional (P0)**:
- [ ] All 4 settings tabs functional
- [ ] Drag/drop tile reorder works (with keyboard alternative)
- [ ] Theme switching (Light/Dark/Auto) works
- [ ] Tile visibility toggles work (min 2 tiles enforced)
- [ ] Preferences persist across sessions

**Performance (P0)**:
- [ ] Settings page load < 2s
- [ ] Tile reorder < 200ms
- [ ] Theme switch < 100ms
- [ ] Save operation < 500ms

**Accessibility (P0)**:
- [ ] Lighthouse Accessibility score ≥ 95
- [ ] axe DevTools: 0 critical violations
- [ ] Keyboard navigation fully functional
- [ ] Screen reader compatible (tested with NVDA)

**Security (P0)**:
- [ ] RLS enforced (users can only modify own preferences)
- [ ] API keys masked in UI
- [ ] No secrets in client-side code
- [ ] Gitleaks scan clean

**Data Integrity (P0)**:
- [ ] Preferences persist correctly
- [ ] No data loss on network failure (retry mechanism)
- [ ] Concurrent edits handled (conflict warning)

---

## Test Environment Setup

### Prerequisites
```bash
# Install dependencies
npm install

# Install Playwright
npx playwright install

# Install accessibility tools
# - axe DevTools browser extension
# - NVDA screen reader (Windows)
# - Lighthouse CLI

# Start local development server
npm run dev

# Run unit tests
npm run test:unit

# Run E2E tests
npm run test:e2e

# Run accessibility tests
npm run test:a11y
```

### Test Data Requirements
- Test User 1: Default preferences (no customizations)
- Test User 2: Fully customized (theme: dark, tiles reordered, 3 tiles hidden)
- Test User 3: Accessibility user (keyboard-only)

---

## Sign-Off

**Test Plan Status**: ✅ READY FOR EXECUTION
**Created**: 2025-10-21
**Owner**: QA Agent
**Total Scenarios**: 35 (8 Dashboard + 6 Appearance + 5 Notifications + 4 Integrations + 6 Accessibility + 6 Edge Cases)
**Estimated Execution Time**: 19 hours

**Next Steps**:
1. Review test plan with Engineer and Designer
2. Begin Phase 1 (Unit tests) - QA-003
3. Implement E2E tests - QA-005
4. Execute accessibility tests - QA-003
5. Performance regression baseline - QA-004

---

**EOF — Phase 6 Test Plan Complete**
