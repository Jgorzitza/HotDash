---
epoch: 2025.10.E1
doc: docs/a11y/walkthrough-plan.md
owner: designer
last_reviewed: 2025-10-11
doc_hash: TBD
expires: 2025-10-18
---

# Accessibility Walkthrough Plan — Modal Refresh & Overlay Patterns

## Overview

This document outlines the accessibility testing plan for the HotDash OCC modal refresh and Shopify Admin overlay integration. The walkthrough validates WCAG 2.2 AA compliance, focus management patterns, and screen reader compatibility across both embedded and overlay contexts.

## Session Details

### Participants

- **Designer**: Accessibility testing and compliance validation
- **Engineering**: Implementation review and technical remediation
- **QA**: Testing methodology and coverage verification
- **Optional**: Accessibility specialist (if available)

### Duration & Format

- **Time**: 60 minutes
- **Format**: Live collaborative testing session
- **Tools**: Screen sharing for demonstration, individual testing on local machines

### Prerequisites

- Modal refresh specification reviewed (`docs/design/modal-refresh.md`)
- Overlay specification reviewed (`docs/specs/shopify-admin-overlay.md`)
- Current modal implementations accessible for testing
- Testing tools installed (screen reader, browser extensions)

## Scope and Test Coverage

### In-Scope Components

1. **CX Escalation Modal**
   - Modal container and header
   - Conversation history section
   - Suggested reply textarea
   - Internal note textarea
   - Action buttons and footer
   - Error states and feedback

2. **Sales Pulse Modal**
   - Modal container and header
   - Revenue summary section
   - Top SKUs list
   - Action selection dropdown
   - Notes textarea
   - Dynamic action buttons

3. **Shopify Admin Overlay Context** (Simulated)
   - App Bridge modal integration
   - Focus management in iframe context
   - Backdrop and stacking behavior
   - Responsive overlay adaptation

### Out-of-Scope (Future Testing)

- Multi-step modal workflows
- Admin UI Extension implementations
- Real Shopify Admin embedded testing (pending token access)
- Mobile device physical testing (browser simulation only)

## Testing Tools and Methods

### Keyboard Navigation Testing

- **Browser**: Chrome, Firefox, Safari
- **Method**: Keyboard-only navigation using Tab, Shift+Tab, Enter, Escape, Arrow keys
- **Focus indicators**: Visual focus rings, high contrast mode verification

### Screen Reader Testing

- **Primary**: NVDA (Windows) or VoiceOver (macOS)
- **Secondary**: Browser built-in screen reader (if available)
- **Testing areas**: Modal announcements, form labels, error messages, live regions

### Automated Testing

- **Axe DevTools**: Browser extension for automated WCAG compliance scanning
- **Lighthouse Accessibility**: Automated audit via Chrome DevTools
- **Color Contrast Analyzer**: Manual verification of text/background contrast ratios

### Manual Validation

- **Color dependency**: Verify information isn't conveyed by color alone
- **Motion preferences**: Test with `prefers-reduced-motion` enabled
- **Zoom testing**: 200% zoom level functionality verification
- **Touch targets**: Mobile simulation for minimum 44px touch areas

## Test Scenarios and Acceptance Criteria

### Scenario 1: Modal Opening and Initial Focus

**Test Steps:**

1. Navigate to CX Escalations tile using keyboard
2. Activate "Review" button using Enter key
3. Verify modal opens with proper focus placement

**Acceptance Criteria:**

- [ ] Modal opens without losing focus context
- [ ] Initial focus moves to close button (as per spec)
- [ ] Screen reader announces modal title and context
- [ ] Background content becomes inert (cannot be focused)

**Potential Issues:**

- Focus not trapped within modal
- Background remains accessible to keyboard navigation
- Screen reader does not announce modal opening

### Scenario 2: Tab Order and Focus Management

**Test Steps:**

1. Open CX Escalation modal
2. Navigate through all focusable elements using Tab key
3. Use Shift+Tab to navigate backwards
4. Attempt to navigate beyond modal boundaries

**Acceptance Criteria:**

- [ ] Tab order follows logical sequence: Close → Header → Conversation → Reply → Notes → Actions → Cancel
- [ ] Focus wraps correctly at modal boundaries
- [ ] No elements outside modal receive focus
- [ ] All interactive elements are reachable

**Potential Issues:**

- Tab order skips important elements
- Focus escapes modal container
- Hidden elements receive focus inappropriately

### Scenario 3: Form Interaction and Validation

**Test Steps:**

1. Navigate to reply textarea in CX Escalation modal
2. Clear existing content and leave empty
3. Attempt to submit using "Approve & Send" button
4. Verify error handling and messaging

**Acceptance Criteria:**

- [ ] Form validation triggers appropriately
- [ ] Error messages are announced immediately by screen reader
- [ ] Focus moves to first invalid field
- [ ] Error styling is not color-dependent
- [ ] Recovery instructions are provided

**Potential Issues:**

- Validation errors not announced
- Error messages lack sufficient detail
- Focus not managed during error states

### Scenario 4: Screen Reader Content and Labels

**Test Steps:**

1. Open Sales Pulse modal using screen reader
2. Navigate through all content using screen reader shortcuts
3. Verify form labels and help text associations
4. Test live region announcements (if applicable)

**Acceptance Criteria:**

- [ ] Modal title announced correctly
- [ ] All form controls have associated labels
- [ ] Helper text linked to form controls via aria-describedby
- [ ] List content (SKUs) announced with proper semantics
- [ ] Dynamic content changes announced via aria-live

**Potential Issues:**

- Form controls lack proper labeling
- Helper text not associated with controls
- Screen reader cannot parse complex content structure

### Scenario 5: Keyboard Shortcuts and Modal Dismissal

**Test Steps:**

1. Open modal and navigate to middle of content
2. Press Escape key
3. Verify modal closes and focus returns appropriately
4. Test click-outside-to-close behavior (if applicable)

**Acceptance Criteria:**

- [ ] Escape key closes modal from any focus position
- [ ] Focus returns to originating trigger element
- [ ] Modal content removed from DOM or made properly inert
- [ ] No focus loss or trap in closed state

**Potential Issues:**

- Escape key does not function consistently
- Focus not restored to logical element
- Modal remains accessible after closing

### Scenario 6: Responsive and Zoom Behavior

**Test Steps:**

1. Set browser zoom to 200%
2. Open modal and verify layout and functionality
3. Test at different viewport sizes (desktop, tablet, mobile simulation)
4. Verify touch target sizes in mobile view

**Acceptance Criteria:**

- [ ] Modal content remains readable at 200% zoom
- [ ] All functionality preserved at high zoom levels
- [ ] Touch targets meet 44px minimum requirement
- [ ] No horizontal scrolling required for core functionality
- [ ] Modal adapts appropriately to container constraints

**Potential Issues:**

- Content cuts off at high zoom levels
- Interactive elements become too small
- Layout breaks in constrained viewports

### Scenario 7: Color Contrast and Visual Indicators

**Test Steps:**

1. Use color contrast analyzer on all text/background combinations
2. Enable high contrast mode and verify modal visibility
3. Test with simulated color vision deficiencies
4. Verify focus indicators are visible and sufficient

**Acceptance Criteria:**

- [ ] Text meets WCAG AA contrast requirements (4.5:1 minimum)
- [ ] Focus indicators meet 3:1 contrast against adjacent colors
- [ ] Interactive states (hover, active) maintain contrast
- [ ] Status information not conveyed by color alone
- [ ] High contrast mode compatibility preserved

**Potential Issues:**

- Insufficient contrast for small or critical text
- Focus indicators not visible against backgrounds
- Color-dependent status indicators

### Scenario 8: Error States and Recovery

**Test Steps:**

1. Simulate network error during form submission
2. Verify error presentation and announcement
3. Test retry mechanism and recovery flow
4. Validate error message persistence and dismissal

**Acceptance Criteria:**

- [ ] Error states announced immediately via aria-live="assertive"
- [ ] Error messages provide actionable recovery guidance
- [ ] Focus management appropriate during error handling
- [ ] Error state visually distinct but not color-dependent
- [ ] Retry actions accessible via keyboard

**Potential Issues:**

- Errors not announced to screen readers
- Insufficient guidance for error recovery
- Focus lost during error state transitions

## Issue Classification and Prioritization

### Critical (Blocking) Issues

- **Focus Traps**: Modal focus cannot be escaped or properly contained
- **Keyboard Inaccessibility**: Core functionality not accessible via keyboard
- **Screen Reader Blocking**: Essential content not announced or accessible
- **WCAG AA Violations**: Color contrast, touch targets, or other compliance failures

### High Priority Issues

- **Navigation Problems**: Tab order illogical or focus indicators insufficient
- **Form Accessibility**: Labels missing, validation errors not announced
- **Content Structure**: Heading hierarchy broken, landmarks missing
- **Responsive Issues**: Functionality broken at required zoom levels

### Medium Priority Issues

- **Enhancement Opportunities**: Better screen reader experience, improved announcements
- **Edge Cases**: Uncommon interaction patterns or browser-specific issues
- **Performance**: Accessibility tools causing performance degradation
- **Documentation**: Missing or unclear accessibility implementation notes

### Low Priority Issues

- **Polish Items**: Minor contrast improvements, enhanced help text
- **Future Considerations**: Improvements for next iteration
- **Browser Compatibility**: Issues in unsupported browsers

## Documentation and Reporting Requirements

### During Session

- **Screen Recording**: Capture complete walkthrough for reference
- **Issue Log**: Real-time documentation of findings with timestamps
- **Participant Notes**: Each attendee documents observations and suggestions
- **Screenshots**: Visual documentation of accessibility violations

### Post-Session Deliverables

- **Findings Report**: `docs/a11y/walkthrough-report.md` with prioritized issues
- **Remediation Tickets**: Engineering tickets with specific acceptance criteria
- **Test Evidence**: Screenshots, recordings, and tool output saved to `artifacts/a11y/`
- **Remediation Timeline**: Target dates for issue resolution and retesting

### Report Template Structure

```markdown
# Accessibility Walkthrough Report — [Date]

## Executive Summary

- Total issues found: [count]
- Critical: [count], High: [count], Medium: [count], Low: [count]
- Overall WCAG 2.2 AA compliance status: [Pass/Fail/Conditional]

## Test Environment

- Browser versions tested
- Screen reader versions used
- Tools and extensions employed
- Testing participants

## Findings by Priority

### Critical Issues

[Issue descriptions with remediation guidance]

### High Priority Issues

[Issue descriptions with remediation guidance]

## Remediation Plan

- [Ticket links and assignees]
- [Target completion dates]
- [Retest schedule]

## Evidence Attachments

- [Links to recordings, screenshots, tool reports]
```

### Success Criteria for Session

- [ ] All test scenarios executed completely
- [ ] Issues categorized and prioritized
- [ ] Remediation tickets created with engineering acknowledgment
- [ ] Evidence captured and stored appropriately
- [ ] Retest window scheduled within 1 week of remediation
- [ ] Documentation updated in feedback/designer.md

## Preparation Checklist

### Pre-Session (24-48 hours before)

- [ ] Send calendar invitation with specification links
- [ ] Verify all tools installed on participant machines
- [ ] Prepare test environment with modal implementations accessible
- [ ] Review current accessibility baseline and known issues
- [ ] Create shared document for collaborative note-taking

### Day of Session

- [ ] Test screen sharing and recording capabilities
- [ ] Verify all participants can access test environment
- [ ] Open all required tools and browser windows
- [ ] Start session recording
- [ ] Review agenda and time allocation

### Post-Session (Within 24 hours)

- [ ] Process session recording and extract key findings
- [ ] Create engineering tickets with detailed acceptance criteria
- [ ] Update accessibility findings report
- [ ] Schedule remediation check-ins with engineering
- [ ] Log completion in feedback/designer.md with evidence links

---

**Next Steps After Walkthrough:**

1. Execute accessibility walkthrough session with full team participation
2. Document findings and create remediation tickets with engineering buy-in
3. Establish retest window for accessibility compliance verification
4. Update modal refresh implementation based on accessibility findings
