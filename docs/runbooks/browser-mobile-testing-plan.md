# Browser & Mobile Testing Plan — PILOT-016

**Created**: 2025-10-21T23:15:00Z  
**Owner**: Pilot Agent  
**Purpose**: PILOT-016 execution framework for browser/mobile compatibility testing  
**MCP Evidence**: `artifacts/pilot/2025-10-21/mcp/pilot-016-browser-testing.jsonl`

## Research Sources

**Context7 MCP Documentation Retrieved**:

1. **Playwright** (`/microsoft/playwright`) - 2103 code snippets, trust 9.9
   - Cross-browser testing patterns (Chromium, Firefox, WebKit)
   - Device emulation (mobile viewports)
   - Browser configuration best practices

2. **web.dev Learn** (`/websites/web_dev_learn`) - 13997 code snippets, trust 7.5
   - Responsive design patterns
   - Browser compatibility testing
   - Mobile viewport configuration
   - Media queries and device targeting

---

## 1. Browser Compatibility Matrix

### Desktop Browsers (Priority Order)

| Browser     | Version               | Engine   | Testing Tool                     | Priority |
| ----------- | --------------------- | -------- | -------------------------------- | -------- |
| **Chrome**  | Latest stable         | Chromium | Chrome DevTools MCP              | P0       |
| **Firefox** | Latest stable         | Gecko    | Chrome DevTools MCP (if capable) | P1       |
| **Safari**  | Latest stable (macOS) | WebKit   | Chrome DevTools MCP (if capable) | P1       |
| **Edge**    | Latest stable         | Chromium | Chrome DevTools MCP              | P2       |

**Key Learnings from Playwright Docs**:

- **Chromium**: Most reliable for automation, supports new headless mode
- **Firefox**: Full desktop support, good standards compliance
- **WebKit**: Essential for Safari compatibility testing
- **Edge**: Chromium-based, use `channel: 'msedge'` for branded testing

---

## 2. Mobile Device Testing Matrix

### Mobile Devices (Priority Order)

| Device         | OS      | Browser | Viewport | Testing Method | Priority |
| -------------- | ------- | ------- | -------- | -------------- | -------- |
| **iPhone 12**  | iOS     | Safari  | 390x844  | Emulation      | P0       |
| **Pixel 5**    | Android | Chrome  | 393x851  | Emulation      | P0       |
| **iPhone 13**  | iOS     | Safari  | 390x844  | Emulation      | P1       |
| **iPad**       | iOS     | Safari  | 768x1024 | Emulation      | P2       |
| **Galaxy S21** | Android | Chrome  | 360x800  | Emulation      | P2       |

**Key Learnings from Playwright Docs**:

- Use device presets: `devices['iPhone 12']`, `devices['Pixel 5']`
- Test both portrait and landscape orientations
- Verify touch targets (minimum 30x30px for `pointer: coarse`)
- Test virtual keyboard behavior with input types

---

## 3. Viewport Testing Breakpoints

### Responsive Breakpoints (from web.dev)

| Breakpoint         | Width       | Target Devices           | Test Scenarios             |
| ------------------ | ----------- | ------------------------ | -------------------------- |
| **Mobile Small**   | 320-375px   | iPhone SE, small Android | Minimum viable layout      |
| **Mobile Medium**  | 375-414px   | iPhone 12, Pixel 5       | Primary mobile experience  |
| **Mobile Large**   | 414-768px   | Large phones, phablets   | Transition to tablet       |
| **Tablet**         | 768-1024px  | iPad, Android tablets    | Two-column layouts         |
| **Desktop Small**  | 1024-1280px | Laptops, small monitors  | Full desktop UI            |
| **Desktop Medium** | 1280-1920px | Standard monitors        | Optimal desktop experience |
| **Desktop Large**  | 1920px+     | Large monitors, 4K       | Ultra-wide layouts         |

**Critical Meta Tag** (verified in all tests):

```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

---

## 4. Cross-Browser Test Scenarios

### P0 Critical Path Tests (All Browsers)

**Authentication & Navigation**:

1. ✅ Login page loads correctly
2. ✅ OAuth redirect to Shopify works
3. ✅ Dashboard loads after authentication
4. ✅ Navigation between routes works
5. ✅ Logout redirects properly

**Dashboard Tiles**:

1. ✅ All 9 tiles render correctly
2. ✅ Tile data displays properly
3. ✅ Refresh buttons functional
4. ✅ Loading states visible
5. ✅ Error states handled

**Modals**:

1. ✅ CX Escalation modal opens/closes
2. ✅ Sales Pulse modal opens/closes
3. ✅ Modal overlay prevents background interaction
4. ✅ Close button works
5. ✅ Escape key closes modal (accessibility)

**Notifications**:

1. ✅ Toast notifications appear/dismiss
2. ✅ Banner alerts display correctly
3. ✅ Notification center opens/closes
4. ✅ Auto-dismiss timers work

**Real-Time Features** (Phase 5):

1. ✅ SSE connection establishes
2. ✅ Live badge updates
3. ✅ Auto-refresh triggers
4. ✅ Connection status indicator

---

### P1 UI/UX Tests (Chrome + Safari minimum)

**Responsive Design**:

1. ✅ Grid layout adapts to viewport
2. ✅ Mobile: Tiles stack vertically
3. ✅ Tablet: 2-column layout
4. ✅ Desktop: Full grid layout
5. ✅ No horizontal scrolling on mobile

**Polaris Components**:

1. ✅ Card components render correctly
2. ✅ Button styles consistent
3. ✅ Badge components visible
4. ✅ OCC design tokens applied
5. ✅ Color scheme (light/dark) works

**Form Interactions**:

1. ✅ Input fields focusable
2. ✅ Textareas accept input
3. ✅ Dropdowns open/select
4. ✅ Checkboxes toggle
5. ✅ Form submission works

---

### P2 Advanced Tests (Full browser matrix)

**Performance**:

1. ✅ Page load <3s (per NORTH_STAR.md)
2. ✅ Modal open <500ms
3. ✅ Tile refresh <1s
4. ✅ No janky animations
5. ✅ Smooth scrolling

**Accessibility**:

1. ✅ Keyboard navigation works (Tab, Shift+Tab, Enter, Escape)
2. ✅ Focus indicators visible
3. ✅ ARIA labels present
4. ✅ Screen reader compatible (NVDA, VoiceOver)
5. ✅ WCAG 2.2 AA compliance

**Edge Cases**:

1. ✅ Offline/connection lost handling
2. ✅ API timeout handling
3. ✅ Error boundary displays
4. ✅ Long text truncation/wrapping
5. ✅ Empty states display correctly

---

## 5. Mobile-Specific Test Scenarios

### Touch Interactions

**Touch Targets** (from web.dev):

```css
/* Minimum touch target size for mobile */
@media (pointer: coarse) {
  button,
  input,
  select {
    min-width: 30px;
    min-height: 30px;
  }
}
```

**Test Scenarios**:

1. ✅ Buttons tappable with finger (minimum 30x30px)
2. ✅ Links tappable (adequate spacing)
3. ✅ Modal close button reachable
4. ✅ Dropdown options selectable
5. ✅ Swipe gestures work (if implemented)

### Virtual Keyboard

**Input Type Optimization** (from web.dev):

```html
<input type="email" />
<!-- Email keyboard -->
<input type="tel" />
<!-- Phone number keyboard -->
<input type="number" />
<!-- Numeric keyboard -->
<input type="url" />
<!-- URL keyboard with .com -->
```

**Test Scenarios**:

1. ✅ Email input shows email keyboard
2. ✅ Phone input shows numeric keyboard
3. ✅ Keyboard doesn't cover input field
4. ✅ Input scrolls into view when focused
5. ✅ Autocomplete suggestions work

### Orientation Changes

**Media Query Tests**:

```css
@media (orientation: landscape) {
  /* Landscape-specific styles */
}
@media (orientation: portrait) {
  /* Portrait-specific styles */
}
```

**Test Scenarios**:

1. ✅ Portrait mode: Tiles stack vertically
2. ✅ Landscape mode: Grid layout if space allows
3. ✅ Rotation doesn't break layout
4. ✅ Modals remain centered
5. ✅ No content cut off

---

## 6. Browser-Specific Issues to Watch For

### Chrome/Chromium

**Known Issues**:

- ✅ CSS Grid support: Excellent
- ✅ Flexbox support: Excellent
- ✅ Custom properties (CSS variables): Full support
- ⚠️ Proprietary prefixes: May still use `-webkit-`

**Testing Focus**:

- Latest Chromium features work
- Polaris components render correctly
- Chart.js animations smooth

---

### Firefox

**Known Issues**:

- ✅ CSS Grid support: Excellent
- ✅ Flexbox support: Excellent
- ⚠️ Scrollbar styling: Limited compared to Chrome
- ⚠️ Some CSS features may lag behind Chrome

**Testing Focus**:

- Verify all modals open/close
- Check scrollbar appearance (may differ from Chrome)
- Test form validation styling

---

### Safari (WebKit)

**Known Issues**:

- ⚠️ Flexbox bugs: Historical issues with flex-basis and min-height
- ⚠️ CSS Grid: Full support in modern versions
- ⚠️ Date/time inputs: Different UI than Chrome
- ⚠️ Position: fixed with keyboard: Known issues on iOS

**Testing Focus**:

- Verify flex layouts don't break
- Test date/time pickers if used
- Check fixed modals don't scroll with keyboard
- Test SSE connection stability

---

### Edge (Chromium-based)

**Known Issues**:

- ✅ Chromium engine: Same as Chrome (mostly)
- ⚠️ IE compatibility mode: May affect some users
- ⚠️ Branded features: May behave slightly differently

**Testing Focus**:

- Verify same as Chrome
- Check for any Edge-specific UI quirks

---

## 7. Testing Approach & Tools

### Chrome DevTools MCP

**Primary Testing Tool**: Chrome DevTools MCP (as mandated in direction)

**Capabilities**:

- ✅ Take snapshots: `mcp_Chrome_DevTools_take_snapshot()`
- ✅ Take screenshots: `mcp_Chrome_DevTools_take_screenshot()`
- ✅ Click elements: `mcp_Chrome_DevTools_click(uid)`
- ✅ Fill forms: `mcp_Chrome_DevTools_fill(uid, value)`
- ✅ Navigate pages: `mcp_Chrome_DevTools_navigate_page(url)`
- ✅ Resize page: `mcp_Chrome_DevTools_resize_page(width, height)`
- ✅ List console messages: `mcp_Chrome_DevTools_list_console_messages()`
- ✅ Evaluate scripts: `mcp_Chrome_DevTools_evaluate_script(function)`

**Testing Workflow**:

1. Navigate to https://hotdash-staging.fly.dev/app?mock=1
2. Take baseline snapshot (desktop 1280x720)
3. Test scenarios on desktop
4. Resize to mobile (375x667, 393x851, 390x844)
5. Test scenarios on mobile viewports
6. Take screenshots for evidence
7. Document findings in feedback

---

### Playwright Configuration Example (Reference)

**From research** (not implementing Playwright, using Chrome DevTools MCP):

```typescript
// Example Playwright config for reference
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },
  ],
});
```

**Note**: We use Chrome DevTools MCP instead, with manual viewport resizing for device emulation.

---

## 8. Test Execution Plan

### Phase 1: Desktop Browsers (3 hours)

**Chrome** (Primary, 1 hour):

- Execute all P0 critical path tests
- Execute all P1 UI/UX tests
- Document baseline behavior
- Take screenshots for evidence

**Firefox** (Secondary, 1 hour):

- Execute all P0 critical path tests
- Compare to Chrome baseline
- Document differences
- Take screenshots for discrepancies

**Safari** (if available, 1 hour):

- Execute all P0 critical path tests
- Document WebKit-specific issues
- Compare to Chrome/Firefox

---

### Phase 2: Mobile Devices (2 hours)

**iPhone 12 (iOS Safari) - 1 hour**:

- Resize viewport: 390x844
- Execute mobile-specific scenarios
- Test portrait and landscape
- Test touch targets
- Test virtual keyboard
- Document iOS-specific issues

**Pixel 5 (Chrome Android) - 1 hour**:

- Resize viewport: 393x851
- Execute mobile-specific scenarios
- Test portrait and landscape
- Compare to iPhone behavior
- Document Android-specific issues

---

### Phase 3: Reporting (30 minutes)

**Deliverables**:

1. Browser compatibility matrix (tested browsers + results)
2. Mobile device test results
3. Screenshot evidence (10+ screenshots minimum)
4. Issue list (P0/P1/P2 prioritized)
5. Recommendations for fixes

**Report Format**:

```markdown
## Browser Compatibility Report — PILOT-016

### Executive Summary

- Browsers Tested: [list]
- Pass Rate: [%]
- Critical Issues: [count]
- Recommendations: [summary]

### Test Results by Browser

#### Chrome (Desktop)

- P0 Tests: [X/Y passed]
- P1 Tests: [X/Y passed]
- Issues: [list]

#### Firefox (Desktop)

- P0 Tests: [X/Y passed]
- P1 Tests: [X/Y passed]
- Issues: [list]

[etc...]

### Mobile Test Results

#### iOS Safari (iPhone 12)

- Tests: [X/Y passed]
- Touch targets: [status]
- Virtual keyboard: [status]
- Issues: [list]

[etc...]

### Evidence

- Screenshots: [count] captured
- MCP snapshots: [count] captured
- Console logs: [summary]

### Recommendations

1. [Priority issue + recommended fix]
2. [Priority issue + recommended fix]
   [etc...]
```

---

## 9. Success Criteria (PILOT-016 Acceptance)

**Per direction v7.0**: ✅ Compatibility report complete

**Specific Criteria**:

1. ✅ Tested on minimum 3 desktop browsers (Chrome, Firefox, Safari/Edge)
2. ✅ Tested on minimum 2 mobile viewports (iOS, Android)
3. ✅ All P0 critical path tests executed
4. ✅ Screenshot evidence captured (minimum 10 screenshots)
5. ✅ Issues documented with P0/P1/P2 priority
6. ✅ Recommendations provided for each issue
7. ✅ Report written in feedback file
8. ✅ MCP evidence JSONL complete

---

## 10. Known Application Features to Test

### Phase 1-8 Features (COMPLETE per Engineer)

**Dashboard Tiles** (9 total):

1. Ops Pulse
2. Sales Pulse
3. Fulfillment Health
4. Inventory Heatmap
5. CX Escalations
6. SEO & Content Watch
7. Idea Pool (Phase 3)
8. CEO Agent (Phase 3)
9. Unread Messages (Phase 3)

**Modals**:

- CX Escalation Modal
- Sales Pulse Modal
- Social Analytics Modal (Phase 7-8)
- SEO Modal (Phase 7-8)
- Ads Modal (Phase 7-8)
- Growth Modal (Phase 7-8)

**Notifications** (Phase 4):

- Toast notifications (success/error/info/warning)
- Banner alerts (queue backlog, performance, health, connection)
- Browser notifications (desktop)
- Notification center (slide-out panel)

**Real-Time Features** (Phase 5):

- SSE connection
- Live badge updates
- Auto-refresh tiles
- Connection status indicator

**Settings Page** (Phase 6):

- Dashboard tab (drag & drop reorder)
- Appearance tab (theme selector)
- Notifications tab (preferences)
- Integrations tab

**Growth Analytics** (Phase 7-8):

- Social analytics tile + modal (Chart.js)
- SEO tile + modal (Chart.js)
- Ads tile + modal (Chart.js)
- Growth tile + modal (Chart.js)

---

### Phase 9-12 Features (NOT YET IMPLEMENTED)

**Phase 9: PII Card** (PILOT-012 blocked):

- PII Card component
- CX modal split UI
- Redaction working

**Phase 10: Vendor/ALC** (PILOT-013 blocked):

- Vendor dropdown
- Receiving workflow
- ALC calculation

**Phase 11: Attribution** (PILOT-014 blocked):

- Action links
- GA4 tracking
- Attribution working

**Phase 12: CX Loop** (PILOT-015 blocked):

- Themes detected
- Actions generated

**Note**: Browser testing for Phase 9-12 features will be executed AFTER Engineer completes implementation.

---

## 11. Environment Configuration

**Testing Environment**: https://hotdash-staging.fly.dev/app?mock=1

**Test User**: OAuth authentication required (or mock mode with `?mock=1`)

**Branch**: `manager-reopen-20251021`

**Expected State**:

- ✅ Phases 1-8 deployed and functional
- ⚠️ Phase 9-12 features not yet implemented

---

## 12. Compliance & Evidence

**MCP Evidence JSONL**: `artifacts/pilot/2025-10-21/mcp/pilot-016-browser-testing.jsonl`

**Evidence Requirements** (per Growth Engine rules):

- ✅ MCP tool calls logged
- ✅ Documentation references captured
- ✅ Timestamps recorded
- ✅ Purpose documented

**Reporting Requirements** (per agent workflow):

- ✅ Progress reported every 2 hours in feedback/pilot/2025-10-21.md
- ✅ Evidence logged as summaries (not verbose)
- ✅ Blockers escalated immediately
- ✅ Screenshots and snapshots captured

---

**Status**: ✅ READY FOR EXECUTION  
**Next**: Begin Phase 1 (Desktop Chrome testing) using Chrome DevTools MCP  
**Estimated Time**: 5 hours total (3h desktop + 2h mobile)
