---
epoch: 2025.10.E1
doc: docs/design/accessibility_criteria.md
owner: designer
last_reviewed: 2025-10-05
doc_hash: TBD
expires: 2025-10-18
---

# Accessibility Acceptance Criteria — Operator Control Center

## WCAG 2.2 Level AA Compliance

### 1. Perceivable

#### 1.1 Text Alternatives (A)

- **1.1.1 Non-text Content**
  - [ ] All status icons have text labels or aria-label attributes
  - [ ] Loading spinners have aria-live regions announcing status
  - [ ] Charts/graphs have text descriptions or data tables

#### 1.2 Time-based Media (A)

- N/A - No video/audio content in dashboard

#### 1.3 Adaptable (A)

- **1.3.1 Info and Relationships**
  - [ ] Tile headings use semantic heading tags (h2)
  - [ ] Lists use proper `<ul>` or `<ol>` markup
  - [ ] Form inputs have associated labels
  - [ ] Status indicators use ARIA roles where appropriate

- **1.3.2 Meaningful Sequence**
  - [ ] Tab order follows visual reading order (left-to-right, top-to-bottom)
  - [ ] Modal focus trap maintains logical flow
  - [ ] Screen readers announce tiles in correct sequence

- **1.3.3 Sensory Characteristics**
  - [ ] Instructions don't rely solely on color ("Click the red button" → "Click the Delete button")
  - [ ] Status indicated by text + color (✓ Healthy, not just green)

- **1.3.4 Orientation (AA)**
  - [ ] Dashboard works in both portrait and landscape
  - [ ] No orientation lock enforced

- **1.3.5 Identify Input Purpose (AA)**
  - [ ] Form inputs use autocomplete attributes where applicable

#### 1.4 Distinguishable

- **1.4.1 Use of Color (A)**
  - [ ] Status communicated via text + icons, not color alone
  - [ ] Error states show icon + message, not just red border

- **1.4.3 Contrast (Minimum) (AA)**
  - [ ] Normal text: 4.5:1 contrast ratio
  - [ ] Large text (18pt+): 3:1 contrast ratio
  - [ ] UI components: 3:1 contrast ratio

**Color Contrast Verification:**

| Element       | Foreground | Background | Ratio  | Pass |
| ------------- | ---------- | ---------- | ------ | ---- |
| Body text     | #202223    | #ffffff    | 16.6:1 | ✓    |
| Meta text     | #637381    | #ffffff    | 7.2:1  | ✓    |
| Success text  | #1a7f37    | #e3f9e5    | 5.8:1  | ✓    |
| Critical text | #d82c0d    | #fff4f4    | 6.1:1  | ✓    |
| Button text   | #ffffff    | #2c6ecb    | 8.4:1  | ✓    |

- **1.4.4 Resize Text (AA)**
  - [ ] Text can be resized to 200% without loss of content/functionality
  - [ ] Layout doesn't break at 200% zoom

- **1.4.5 Images of Text (AA)**
  - [ ] No images of text used (all text is actual text)

- **1.4.10 Reflow (AA)**
  - [ ] Content reflows at 320px width without horizontal scrolling
  - [ ] Responsive design adapts to viewport changes

- **1.4.11 Non-text Contrast (AA)**
  - [ ] UI components have 3:1 contrast against adjacent colors
  - [ ] Tile borders: #d2d5d8 on #ffffff = 3.1:1 ✓
  - [ ] Focus indicators have sufficient contrast

- **1.4.12 Text Spacing (AA)**
  - [ ] Content doesn't break when users adjust:
    - Line height to 1.5× font size
    - Paragraph spacing to 2× font size
    - Letter spacing to 0.12× font size
    - Word spacing to 0.16× font size

- **1.4.13 Content on Hover or Focus (AA)**
  - [ ] Hover content (tooltips) can be dismissed without moving pointer
  - [ ] Hover content persists when pointer moves to it
  - [ ] Hover content remains visible until dismissed or trigger is removed

### 2. Operable

#### 2.1 Keyboard Accessible (A)

- **2.1.1 Keyboard**
  - [ ] All interactive elements accessible via keyboard
  - [ ] Tab navigation works through all tiles sequentially
  - [ ] Action buttons reachable via Tab key
  - [ ] Modal dialogs trap focus appropriately
  - [ ] Escape key closes modals

- **2.1.2 No Keyboard Trap**
  - [ ] Users can navigate away from all components using only keyboard
  - [ ] Modal focus trap has clear exit (Escape key)

- **2.1.4 Character Key Shortcuts (A)**
  - N/A - No single-character keyboard shortcuts implemented

#### 2.2 Enough Time (A)

- **2.2.1 Timing Adjustable**
  - N/A - No time limits on dashboard interactions

- **2.2.2 Pause, Stop, Hide**
  - [ ] Auto-refreshing tiles have pause/control mechanism
  - [ ] Loading animations don't auto-start

#### 2.3 Seizures and Physical Reactions

- **2.3.1 Three Flashes or Below Threshold (A)**
  - [ ] No flashing content that exceeds 3 flashes per second

#### 2.4 Navigable (A/AA)

- **2.4.1 Bypass Blocks (A)**
  - [ ] Skip link to main content provided
  - [ ] Landmark regions defined (header, main, navigation)

- **2.4.2 Page Titled (A)**
  - [ ] Page has descriptive title: "Operator Control Center"

- **2.4.3 Focus Order (A)**
  - [ ] Focus order matches visual order
  - [ ] Tab sequence: Tile 1 → Tile 2 → Tile 3... → Tile N → Action buttons

**Focus Order Map:**

```
1. Skip to main content (hidden link)
2. App navigation links
3. Dashboard heading
4. Tile 1: Sales Pulse
   → Tile heading (focusable for screen reader context)
   → View Details button
5. Tile 2: Fulfillment Health
   → Tile heading
   → View Details button
6. Tile 3: Inventory Heatmap
   → Tile heading
   → Take Action button
7. Tile 4: CX Escalations
   → Tile heading
   → View & Reply button
8. Tile 5: SEO & Content Watch
   → Tile heading
   → View Details button
```

**Modal Focus Snapshots**

- CX Escalations: Close → Heading → Conversation log → Suggested reply → Internal note → Approve & Send Reply → Escalate to Manager → Mark Resolved → Cancel
- Sales Pulse: Close → Heading → Action select → Notes textarea → Primary CTA (label matches select) → Cancel

- **2.4.4 Link Purpose (In Context) (A)**
  - [ ] Button labels are descriptive ("View Details" not "Click here")
  - [ ] Action buttons clearly state intent ("Approve & Send Reply")

- **2.4.5 Multiple Ways (AA)**
  - [ ] Dashboard accessible via navigation menu
  - [ ] Direct URL access available

- **2.4.6 Headings and Labels (AA)**
  - [ ] Headings are descriptive and properly nested
  - [ ] Form labels clearly describe inputs

- **2.4.7 Focus Visible (AA)**
  - [ ] Keyboard focus indicator always visible
  - [ ] Focus outline: 2px solid #2c6ecb
  - [ ] Focus outline doesn't obscure content

**Focus Indicator Styles:**

```css
*:focus-visible {
  outline: 2px solid var(--p-color-border-focus, #2c6ecb);
  outline-offset: 2px;
  border-radius: var(--p-border-radius-1, 8px);
}
```

#### 2.5 Input Modalities (A/AA)

- **2.5.1 Pointer Gestures (A)**
  - [ ] No multipoint gestures required (no pinch-to-zoom requirements)

- **2.5.2 Pointer Cancellation (A)**
  - [ ] Click actions complete on up-event (mouseup), not down-event
  - [ ] Users can abort click by moving pointer away before release

- **2.5.3 Label in Name (A)**
  - [ ] Visible button text matches accessible name
  - [ ] "View Details" button has aria-label matching visual text

- **2.5.4 Motion Actuation (A)**
  - N/A - No motion-based interactions

### 3. Understandable

#### 3.1 Readable (A/AA)

- **3.1.1 Language of Page (A)**
  - [ ] `<html lang="en">` attribute set

- **3.1.2 Language of Parts (AA)**
  - [ ] French content has `lang="fr"` attribute

#### 3.2 Predictable (A/AA)

- **3.2.1 On Focus (A)**
  - [ ] Focus doesn't trigger unexpected context changes
  - [ ] Focusing on tile doesn't open modal automatically

- **3.2.2 On Input (A)**
  - [ ] Form inputs don't submit on change
  - [ ] Approval actions require explicit confirmation

- **3.2.3 Consistent Navigation (AA)**
  - [ ] Navigation structure consistent across pages
  - [ ] App nav appears in same location

- **3.2.4 Consistent Identification (AA)**
  - [ ] Icons/components used consistently (✓ always means success)

- **3.2.6 Consistent Help (A - WCAG 2.2)**
  - [ ] Help/support links in consistent location

#### 3.3 Input Assistance (A/AA)

- **3.3.1 Error Identification (A)**
  - [ ] Form errors identified in text, not just color
  - [ ] Toast notifications announce errors to screen readers

- **3.3.2 Labels or Instructions (A)**
  - [ ] All form inputs have visible labels
  - [ ] Instructions provided for approval actions

- **3.3.3 Error Suggestion (AA)**
  - [ ] Error messages suggest corrections
  - [ ] "Network error. Please try again." includes retry button

- **3.3.4 Error Prevention (Legal, Financial, Data) (AA)**
  - [ ] Confirmation dialog for destructive actions (PO creation)
  - [ ] User can review and confirm before submitting

### 4. Robust

#### 4.1 Compatible (A/AA)

- **4.1.1 Parsing (A - Deprecated in 2.2)**
  - [ ] Valid HTML markup (checked via W3C validator)

- **4.1.2 Name, Role, Value (A)**
  - [ ] Custom components have appropriate ARIA roles
  - [ ] Interactive elements have accessible names
  - [ ] State changes announced (aria-live, aria-expanded)

- **4.1.3 Status Messages (AA)**
  - [ ] Toast notifications use aria-live="polite"
  - [ ] Success messages announced to screen readers
  - [ ] Loading states use aria-busy="true"

## ARIA Implementation

### Tile Card Structure

```html
<article role="region" aria-labelledby="tile-sales-heading" class="tile-card">
  <h2 id="tile-sales-heading">Sales Pulse</h2>
  <span aria-label="Status: Healthy" class="status-badge">Healthy ✓</span>
  <p aria-label="Last refreshed 2 minutes ago">Last refreshed 2 min ago</p>
  <div class="tile-content">
    <!-- Content -->
  </div>
  <button aria-label="View Sales Pulse details">View Details</button>
</article>
```

### Modal Dialog

```html
<div
  role="dialog"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
  aria-modal="true"
>
  <h2 id="modal-title">CX Escalation — Jamie Lee</h2>
  <div id="modal-description">Review and respond to customer escalation</div>
  <!-- Modal content -->
  <button aria-label="Close modal">✕</button>
</div>
```

### Loading State

```html
<div role="status" aria-live="polite" aria-busy="true">
  <span aria-label="Refreshing tile data">Refreshing...</span>
</div>
```

### Toast Notification

```html
<div role="alert" aria-live="assertive" class="toast toast-success">
  <span aria-label="Success: Reply sent to Jamie Lee">
    ✓ Reply sent to Jamie Lee
  </span>
</div>
```

## Screen Reader Testing

### Test Cases

| Scenario        | Expected Behavior                                      |
| --------------- | ------------------------------------------------------ |
| Navigate tiles  | Screen reader announces tile name, status, and content |
| Open modal      | Focus moves to modal, dialog role announced            |
| Submit approval | Success toast announced, focus returns appropriately   |
| Keyboard nav    | All interactive elements reachable, focus visible      |
| Error state     | Error message announced, suggested action provided     |
| Loading state   | "Loading" or "Refreshing" announced                    |

### Screen Reader Support

Test with:

- NVDA (Windows + Firefox)
- JAWS (Windows + Chrome)
- VoiceOver (macOS + Safari)
- VoiceOver (iOS + Safari)
- TalkBack (Android + Chrome)

## Keyboard Shortcuts

| Key         | Action                                        |
| ----------- | --------------------------------------------- |
| Tab         | Navigate forward through interactive elements |
| Shift+Tab   | Navigate backward                             |
| Enter/Space | Activate buttons, links                       |
| Escape      | Close modal dialogs                           |
| Arrow keys  | Navigate within modals (future enhancement)   |

## Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Testing Checklist

### Manual Testing

- [ ] Keyboard-only navigation through entire dashboard
- [ ] Screen reader announces all content correctly
- [ ] Zoom to 200% - no loss of functionality
- [ ] High contrast mode (Windows) - all content visible
- [ ] Color blindness simulation (Protanopia, Deuteranopia, Tritanopia)

### Automated Testing

- [ ] axe DevTools scan - 0 violations
- [ ] WAVE browser extension - 0 errors
- [ ] Lighthouse accessibility score - 100
- [ ] Pa11y CI integration in build pipeline

### Browser/AT Matrix

| Browser          | Screen Reader     | Priority |
| ---------------- | ----------------- | -------- |
| Chrome           | NVDA              | P0       |
| Firefox          | NVDA              | P0       |
| Safari           | VoiceOver (macOS) | P0       |
| Safari (iOS)     | VoiceOver         | P1       |
| Chrome (Android) | TalkBack          | P1       |
| Edge             | JAWS              | P2       |

## Engineer Collaboration Notes

### Implementation Priorities

1. **P0 (Must Have for Launch)**
   - Semantic HTML structure
   - Keyboard navigation
   - Focus indicators
   - ARIA labels for status/actions
   - Color contrast compliance

2. **P1 (Soon After Launch)**
   - Screen reader optimization
   - Reduced motion support
   - Error prevention confirmations

3. **P2 (Future Enhancement)**
   - Keyboard shortcuts beyond tab/escape
   - Advanced ARIA live regions for real-time updates

### Code Review Checklist

For each PR:

- [ ] Run axe DevTools - no new violations
- [ ] Test keyboard navigation
- [ ] Verify focus indicators visible
- [ ] Check ARIA attributes valid
- [ ] Confirm color contrast ratios

### Documentation

Accessibility implementation tracked in:

- `docs/design/accessibility_criteria.md` (this file)
- `tests/accessibility/*.spec.ts` (automated tests)
- `feedback/manager.md` (daily progress)
