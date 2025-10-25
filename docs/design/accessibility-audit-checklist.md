# Accessibility Audit Checklist - WCAG 2.2 AA Compliance

**File:** `docs/design/accessibility-audit-checklist.md`  
**Owner:** Designer Agent  
**Version:** 1.0  
**Date:** 2025-10-20  
**For:** Designer, QA, Engineer agents

---

## Purpose

Comprehensive accessibility audit checklist for HotDash Operator Control Center to ensure WCAG 2.2 AA compliance. Based on `accessibility-approval-flow.md` specification.

---

## 🎯 AUDIT SCOPE

### Components to Audit

- [ ] Dashboard tiles (all 8 tiles)
- [ ] Approval queue interface
- [ ] Enhanced modals (CX, Sales, Inventory)
- [ ] Navigation system
- [ ] Notification system
- [ ] Settings page
- [ ] Responsive design (desktop, tablet, mobile)

### WCAG 2.2 AA Requirements

- [ ] **Perceivable**: Information and UI components must be presentable in ways users can perceive
- [ ] **Operable**: UI components and navigation must be operable
- [ ] **Understandable**: Information and UI operation must be understandable
- [ ] **Robust**: Content must be robust enough for various assistive technologies

---

## 1. KEYBOARD NAVIGATION

### 1.1 Tab Order (Logical Sequence)

**Dashboard Navigation**:

- [ ] Skip to main content link (hidden until focused)
- [ ] Main navigation (Dashboard, Approvals, Metrics, etc.)
- [ ] Page title
- [ ] Manual refresh button
- [ ] Tile 1 (Ops Pulse)
  - [ ] Card container (focusable for keyboard scrolling)
  - [ ] Interactive buttons within tile
- [ ] Tile 2 (Sales Pulse)
  - [ ] Card container
  - [ ] "View breakdown" button
- [ ] Continue for all 8 tiles

**Approval Queue Navigation**:

- [ ] Skip to main content link
- [ ] Main navigation
- [ ] Page title
- [ ] Manual refresh button
- [ ] First approval card
  - [ ] Card container (focusable for keyboard scrolling)
  - [ ] Approve button
  - [ ] Reject button
  - [ ] Expand details button (if collapsed)
- [ ] Second approval card
  - [ ] Card container
  - [ ] Approve button
  - [ ] Reject button
  - [ ] Expand details button
- [ ] Continue for all approval cards

### 1.2 Keyboard Shortcuts

**Required Shortcuts**:

- [ ] `/` - Focus search (if search exists)
- [ ] `j` - Next approval (move focus down)
- [ ] `k` - Previous approval (move focus up)
- [ ] `a` - Approve focused approval
- [ ] `r` - Reject focused approval
- [ ] `Enter` - Activate focused button
- [ ] `Space` - Activate focused button
- [ ] `Escape` - Close modal/cancel action
- [ ] `?` - Show keyboard shortcuts help

**Implementation Check**:

- [ ] Shortcuts work when not typing in input fields
- [ ] Shortcuts prevent default browser behavior
- [ ] Help modal shows all available shortcuts
- [ ] Shortcuts are documented for users

### 1.3 Focus Management

**Focus Indicators**:

- [ ] All interactive elements have visible focus indicators
- [ ] Focus indicators have minimum 3:1 contrast ratio
- [ ] Focus indicators are visible in both light and dark mode
- [ ] Focus indicators have 2px offset from element
- [ ] Focus indicators are not hidden by overflow

**Focus Order**:

- [ ] Focus moves logically through page elements
- [ ] Focus moves to next/previous element when current element is removed
- [ ] Focus is trapped within modals
- [ ] Focus returns to trigger element when modal closes

**Skip Links**:

- [ ] Skip to main content link present
- [ ] Skip link hidden until focused
- [ ] Skip link appears at top when focused
- [ ] Skip link has proper styling and contrast

---

## 2. SCREEN READER SUPPORT

### 2.1 Page Structure

**Semantic HTML**:

- [ ] `<main>` element contains main content
- [ ] `<nav>` element contains navigation
- [ ] `<header>` element contains page header
- [ ] `<section>` elements group related content
- [ ] `<article>` elements for approval cards
- [ ] `<aside>` elements for secondary content

**ARIA Landmarks**:

- [ ] `role="main"` on main content area
- [ ] `role="navigation"` on navigation
- [ ] `role="banner"` on page header
- [ ] `role="contentinfo"` on footer
- [ ] `role="complementary"` on sidebar

### 2.2 Screen Reader Announcements

**Page Title**:

- [ ] Page title announced when page loads
- [ ] Page title includes context (e.g., "Approval Queue - 3 pending")

**Live Regions**:

- [ ] `aria-live="polite"` for status updates
- [ ] `aria-live="assertive"` for error messages
- [ ] `aria-atomic="true"` for complete message reading
- [ ] Live regions announce:
  - [ ] New approvals received
  - [ ] Approval actions completed
  - [ ] Error messages
  - [ ] Loading states

**Content Announcements**:

- [ ] Approval cards announce all relevant information
- [ ] Risk levels announced (HIGH RISK, MEDIUM, LOW)
- [ ] Button actions include context
- [ ] Status changes announced

### 2.3 ARIA Labels and Descriptions

**Buttons**:

- [ ] All buttons have descriptive `aria-label` or visible text
- [ ] Button labels include context (e.g., "Approve conversation 101")
- [ ] Loading buttons have `aria-busy="true"`
- [ ] Disabled buttons have `aria-disabled="true"`

**Badges**:

- [ ] Risk badges have `aria-label` with risk level
- [ ] Status badges have `aria-label` with status
- [ ] Color is not the only indicator of information

**Icons**:

- [x] Decorative icons have `aria-hidden="true"` _(2025-10-24: Toast + notification icons migrated to Polaris components)_
- [ ] Informative icons have `aria-label`
- [ ] Icons with adjacent text are decorative

**Links**:

- [ ] External links have "(opens in new tab)" in `aria-label`
- [ ] Link text is descriptive and unique
- [ ] Links have proper focus indicators

---

## 3. COLOR AND CONTRAST

### 3.1 Contrast Ratios

**Text Contrast**:

- [ ] Normal text (≤ 18pt): ≥ 4.5:1 contrast ratio
- [ ] Large text (≥ 18pt or bold ≥ 14pt): ≥ 3:1 contrast ratio
- [ ] UI components: ≥ 3:1 contrast ratio
- [ ] Focus indicators: ≥ 3:1 contrast ratio

**Color Audit Table**:
| Element | Foreground | Background | Ratio | Pass |
| ----------------- | ---------- | ---------- | ------ | ---- |
| Body text | #202223 | #FFFFFF | 16.5:1 | [ ] |
| Badge "HIGH RISK" | #FFFFFF | #D72C0D | 5.5:1 | [ ] |
| Badge "MEDIUM" | #1A1A1A | #FFC453 | 10.4:1 | [ ] |
| Badge "LOW" | #FFFFFF | #008060 | 4.8:1 | [ ] |
| Button "Approve" | #FFFFFF | #008060 | 4.8:1 | [ ] |
| Button "Reject" | #FFFFFF | #D72C0D | 5.5:1 | [ ] |
| Subdued text | #6D7175 | #FFFFFF | 4.6:1 | [ ] |
| Focus indicator | #2C6ECB | #FFFFFF | 4.7:1 | [ ] |

### 3.2 Color Independence

**Information Conveyance**:

- [ ] Risk levels conveyed by text AND color
- [ ] Status conveyed by text AND color
- [ ] Error states conveyed by text AND color
- [ ] Success states conveyed by text AND color
- [ ] No information conveyed by color alone

**Color Blindness Support**:

- [ ] All information accessible without color
- [ ] Patterns or shapes used as additional indicators
- [ ] Text labels provide context

---

## 4. INTERACTIVE ELEMENTS

### 4.1 Button Accessibility

**Button States**:

- [ ] Default state clearly visible
- [ ] Hover state provides feedback
- [ ] Focus state clearly visible
- [ ] Active/pressed state provides feedback
- [ ] Disabled state clearly indicated
- [ ] Loading state clearly indicated

**Button Labels**:

- [ ] Button text is descriptive
- [ ] Button text is unique on page
- [ ] Button text matches action performed
- [ ] Loading buttons show loading state

### 4.2 Form Accessibility

**Form Labels**:

- [ ] All form inputs have labels
- [ ] Labels are associated with inputs (`for` attribute)
- [ ] Required fields are marked
- [ ] Error messages are associated with inputs
- [ ] Help text is associated with inputs

**Form Validation**:

- [ ] Validation errors are announced
- [ ] Error messages are clear and actionable
- [ ] Success messages are announced
- [ ] Form submission status is announced

### 4.3 Modal Accessibility

**Modal Structure**:

- [ ] Modal has proper `role="dialog"`
- [ ] Modal has `aria-labelledby` pointing to title
- [ ] Modal has `aria-describedby` pointing to description
- [ ] Modal has `aria-modal="true"`

**Modal Behavior**:

- [ ] Focus trapped within modal
- [ ] Focus returns to trigger when closed
- [ ] Escape key closes modal
- [ ] Background is not focusable
- [ ] Modal is announced when opened

---

## 5. RESPONSIVE DESIGN

### 5.1 Mobile Accessibility

**Touch Targets**:

- [ ] All interactive elements ≥ 44x44px
- [ ] Touch targets have adequate spacing
- [ ] Touch targets are not overlapping
- [ ] Touch targets are easily reachable

**Mobile Navigation**:

- [ ] Navigation is accessible on mobile
- [ ] Mobile menu is keyboard accessible
- [ ] Mobile menu has proper focus management
- [ ] Mobile menu is announced to screen readers

### 5.2 Responsive Layout

**Breakpoint Testing**:

- [ ] Desktop (1280px+): All features accessible
- [ ] Tablet (768px-1279px): All features accessible
- [ ] Mobile (<768px): All features accessible
- [ ] Layout adapts without breaking accessibility

**Content Scaling**:

- [ ] Content scales up to 200% without horizontal scrolling
- [ ] Text remains readable at all zoom levels
- [ ] Interactive elements remain accessible
- [ ] Layout remains functional

---

## 6. ERROR HANDLING

### 6.1 Error Announcements

**Error Types**:

- [ ] Network errors announced
- [ ] Validation errors announced
- [ ] Permission errors announced
- [ ] System errors announced

**Error Presentation**:

- [ ] Errors are visually distinct
- [ ] Errors are announced to screen readers
- [ ] Errors provide actionable information
- [ ] Errors are dismissible

### 6.2 Success Feedback

**Success Types**:

- [ ] Approval actions announced
- [ ] Form submissions announced
- [ ] Settings changes announced
- [ ] Data updates announced

**Success Presentation**:

- [ ] Success messages are visually distinct
- [ ] Success messages are announced to screen readers
- [ ] Success messages are dismissible
- [ ] Success messages provide context

---

## 7. LOADING STATES

### 7.1 Loading Indicators

**Loading Types**:

- [ ] Page loading announced
- [ ] Button loading announced
- [ ] Data loading announced
- [ ] Form submission loading announced

**Loading Presentation**:

- [ ] Loading states are visually distinct
- [ ] Loading states are announced to screen readers
- [ ] Loading states have `aria-busy="true"`
- [ ] Loading states provide context

### 7.2 Skeleton Loading

**Skeleton Structure**:

- [ ] Skeleton matches final content structure
- [ ] Skeleton is announced as loading
- [ ] Skeleton has `aria-busy="true"`
- [ ] Skeleton is replaced smoothly

---

## 8. TESTING TOOLS

### 8.1 Automated Testing

**Tools to Use**:

- [ ] axe-core browser extension
- [ ] WAVE browser extension
- [ ] Lighthouse accessibility audit
- [ ] Pa11y command line tool

**Automated Checks**:

- [ ] Color contrast violations
- [ ] Missing alt text
- [ ] Missing form labels
- [ ] Missing ARIA labels
- [ ] Keyboard navigation issues

### 8.2 Manual Testing

**Screen Reader Testing**:

- [ ] NVDA (Windows)
- [ ] JAWS (Windows)
- [ ] VoiceOver (macOS)
- [ ] TalkBack (Android)

**Keyboard Testing**:

- [ ] Tab navigation
- [ ] Arrow key navigation
- [ ] Keyboard shortcuts
- [ ] Focus management

**Visual Testing**:

- [ ] High contrast mode
- [ ] Color blindness simulation
- [ ] Zoom testing (up to 200%)
- [ ] Mobile device testing

---

## 9. COMPLIANCE CHECKLIST

### 9.1 WCAG 2.2 AA Success Criteria

**Perceivable**:

- [ ] 1.1.1 Non-text Content: All images have alt text
- [ ] 1.3.1 Info and Relationships: Semantic structure
- [ ] 1.3.2 Meaningful Sequence: Logical reading order
- [ ] 1.3.3 Sensory Characteristics: Not color-dependent
- [ ] 1.4.1 Use of Color: Color not only means of conveying info
- [ ] 1.4.3 Contrast (Minimum): 4.5:1 for normal text
- [ ] 1.4.4 Resize Text: Text scales to 200%
- [ ] 1.4.5 Images of Text: Text not in images

**Operable**:

- [ ] 2.1.1 Keyboard: All functionality keyboard accessible
- [ ] 2.1.2 No Keyboard Trap: Focus can move away
- [ ] 2.1.4 Character Key Shortcuts: Can be turned off
- [ ] 2.4.1 Bypass Blocks: Skip links provided
- [ ] 2.4.2 Page Titled: Pages have descriptive titles
- [ ] 2.4.3 Focus Order: Logical focus sequence
- [ ] 2.4.4 Link Purpose: Link purpose clear
- [ ] 2.4.6 Headings and Labels: Descriptive headings
- [ ] 2.4.7 Focus Visible: Focus indicator visible

**Understandable**:

- [ ] 3.1.1 Language of Page: Language identified
- [ ] 3.2.1 On Focus: Focus doesn't trigger changes
- [ ] 3.2.2 On Input: Input doesn't trigger changes
- [ ] 3.3.1 Error Identification: Errors identified
- [ ] 3.3.2 Labels or Instructions: Labels provided
- [ ] 3.3.3 Error Suggestion: Error correction suggested

**Robust**:

- [ ] 4.1.1 Parsing: Valid markup
- [ ] 4.1.2 Name, Role, Value: ARIA implemented correctly
- [ ] 4.1.3 Status Messages: Status messages announced

### 9.2 HotDash-Specific Requirements

**Approval Queue**:

- [ ] Approval cards accessible
- [ ] Risk badges announced
- [ ] Action buttons accessible
- [ ] Status updates announced

**Dashboard Tiles**:

- [ ] All 8 tiles accessible
- [ ] Tile content announced
- [ ] Interactive elements accessible
- [ ] Status indicators announced

**Enhanced Modals**:

- [ ] Modal structure accessible
- [ ] Focus management correct
- [ ] Form elements accessible
- [ ] Action buttons accessible

---

## 10. AUDIT EXECUTION

### 10.1 Pre-Audit Setup

**Environment**:

- [ ] Chrome DevTools MCP available
- [ ] Screen reader software installed
- [ ] Accessibility testing tools installed
- [ ] Test data prepared

**Test Scenarios**:

- [ ] Dashboard with all 8 tiles
- [ ] Approval queue with pending items
- [ ] Enhanced modals with forms
- [ ] Error and success states
- [ ] Loading states

### 10.2 Audit Execution

**Step 1: Automated Testing**:

- [ ] Run axe-core scan
- [ ] Run WAVE scan
- [ ] Run Lighthouse audit
- [ ] Document all violations

**Step 2: Manual Testing**:

- [ ] Keyboard navigation test
- [ ] Screen reader test
- [ ] Color contrast test
- [ ] Responsive design test

**Step 3: Documentation**:

- [ ] Document all findings
- [ ] Prioritize issues (P0, P1, P2)
- [ ] Provide remediation steps
- [ ] Create accessibility report

### 10.3 Post-Audit

**Reporting**:

- [ ] Create accessibility audit report
- [ ] Share findings with Engineer
- [ ] Track remediation progress
- [ ] Re-audit after fixes

**Compliance**:

- [ ] Verify WCAG 2.2 AA compliance
- [ ] Document compliance status
- [ ] Provide sign-off if compliant
- [ ] Identify remaining issues

---

## 11. REMEDIATION PRIORITIES

### 11.1 P0 Critical Issues

**Must Fix Before Launch**:

- [ ] AppProvider initialization (blocks all interactivity)
- [ ] Missing ARIA labels on interactive elements
- [ ] Keyboard navigation not working
- [ ] Screen reader announcements missing
- [ ] Color contrast violations

### 11.2 P1 High Priority

**Should Fix Before Launch**:

- [ ] Focus management issues
- [ ] Modal accessibility
- [ ] Form accessibility
- [ ] Error handling accessibility
- [ ] Mobile accessibility

### 11.3 P2 Medium Priority

**Can Fix After Launch**:

- [ ] Advanced keyboard shortcuts
- [ ] Enhanced screen reader support
- [ ] Advanced ARIA patterns
- [ ] Performance optimizations

---

## 12. SUCCESS CRITERIA

### 12.1 Compliance Goals

**WCAG 2.2 AA Compliance**:

- [ ] All success criteria met
- [ ] No critical violations
- [ ] All interactive elements accessible
- [ ] All content perceivable

**HotDash-Specific Goals**:

- [ ] All 8 dashboard tiles accessible
- [ ] Approval queue fully accessible
- [ ] Enhanced modals accessible
- [ ] Notification system accessible
- [ ] Settings page accessible

### 12.2 Testing Goals

**Coverage**:

- [ ] All components tested
- [ ] All user flows tested
- [ ] All error states tested
- [ ] All responsive breakpoints tested

**Quality**:

- [ ] No accessibility regressions
- [ ] Consistent accessibility patterns
- [ ] User-friendly error messages
- [ ] Smooth user experience

---

## Change Log

- 2025-10-20: Version 1.0 – Initial accessibility audit checklist
- Based on `accessibility-approval-flow.md` specification
- Covers WCAG 2.2 AA compliance requirements
- Includes HotDash-specific accessibility needs

---

## References

- **Accessibility Specification**: `docs/design/accessibility-approval-flow.md`
- **Design System Guide**: `docs/design/design-system-guide.md`
- **WCAG 2.2 Guidelines**: https://www.w3.org/WAI/WCAG22/quickref/
- **Polaris Accessibility**: https://polaris.shopify.com/design/accessibility
- **Implementation Checklist**: `docs/design/implementation-checklist.md`
