---
epoch: 2025.10.E1
doc: docs/design/modal-refresh-handoff.md
owner: designer
last_reviewed: 2025-10-11
doc_hash: TBD
expires: 2025-10-18
---

# Modal Refresh Engineering Handoff

## Handoff Summary

**Created**: 2025-10-11T03:43:13Z  
**Design Lead**: Designer Agent  
**Engineering Coordination**: Pending 45-minute handoff session  
**Implementation Priority**: High (accessibility compliance requirements)

## Implementation Specifications Reference

### Primary Documentation

- **Modal Refresh Specification**: `docs/design/modal-refresh.md` (464 lines, comprehensive)
- **Accessibility Walkthrough Plan**: `docs/a11y/walkthrough-plan.md` (346 lines, WCAG 2.2 AA)
- **Shopify Admin Overlay Spec**: `docs/specs/shopify-admin-overlay.md` (696 lines, App Bridge)
- **Export Presets & Accessibility**: `artifacts/collateral/modal-refresh-exports/export-presets-accessibility.md`

## Implementation Tickets & Acceptance Criteria

### Ticket 1: CX Escalation Modal Refresh

**Priority**: High  
**Epic**: Modal Accessibility Compliance  
**Story Points**: 8

#### Implementation Requirements

- **React Router 7 Integration**: Convert from legacy patterns to RR7 Form component with fetcher
- **Focus Management**: Implement focus trap with proper keyboard navigation
- **Accessibility**: WCAG 2.2 AA compliance with screen reader support
- **Supabase Integration**: Form submission to `cx_escalations_decisions` table

#### Acceptance Criteria

- [ ] **Keyboard Navigation**: Tab order follows Close → Header → Conversation → Reply → Notes → Actions → Cancel
- [ ] **Focus Trap**: Focus cannot escape modal boundaries, wraps correctly at first/last element
- [ ] **Screen Reader**: Modal title announced, form labels properly associated, error states announced via aria-live="assertive"
- [ ] **Visual Design**: Polaris token integration, 4.5:1 color contrast minimum, focus indicators visible
- [ ] **Form Submission**: React Router 7 fetcher pattern, Supabase mutation, proper error handling
- [ ] **Toast Feedback**: Success/error toasts with role="status" or role="alert"
- [ ] **Responsive**: Container query-based layout adaptation (desktop 1280px+, tablet 768px+)
- [ ] **Motion**: Enter/exit animations with prefers-reduced-motion support

#### Technical Implementation Notes

```typescript
// Focus trap implementation example
const useModalFocusTrap = (isOpen: boolean) => {
  useEffect(() => {
    if (!isOpen) return;

    const modal = document.querySelector('[role="dialog"]');
    const focusableElements = modal?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );

    const firstElement = focusableElements?.[0] as HTMLElement;
    const lastElement = focusableElements?.[
      focusableElements.length - 1
    ] as HTMLElement;

    firstElement?.focus(); // Initial focus to close button

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleTabKey);
    return () => document.removeEventListener("keydown", handleTabKey);
  }, [isOpen]);
};
```

### Ticket 2: Sales Pulse Modal Refresh

**Priority**: High  
**Epic**: Modal Accessibility Compliance  
**Story Points**: 6

#### Implementation Requirements

- **Dynamic Button Labels**: Action selection affects primary button text
- **Revenue Data Display**: Supabase-backed real-time revenue metrics
- **Action Logging**: Form submission to `sales_pulse_actions` table
- **Responsive Lists**: Top SKUs and fulfillment issues adapt to container size

#### Acceptance Criteria

- [ ] **Action Selection**: Select dropdown changes primary button label dynamically
- [ ] **Aria Live Updates**: Button label changes announced to screen readers
- [ ] **Data Loading**: Skeleton states during revenue data fetch
- [ ] **List Semantics**: Proper ul/li markup for SKUs and fulfillment issues
- [ ] **Error Handling**: Network error states with retry functionality
- [ ] **Form Validation**: Required field validation with clear error messaging

### Ticket 3: Polaris Token Integration

**Priority**: Medium  
**Epic**: Design System Alignment  
**Story Points**: 5

#### Implementation Requirements

- **CSS Custom Properties**: Replace hardcoded values with Polaris tokens
- **Responsive Breakpoints**: Container query implementation
- **Animation Tokens**: Motion duration and easing from design system
- **Color System**: Status colors, focus indicators, text contrast

#### Acceptance Criteria

- [ ] **Token Usage**: All spacing uses var(--p-space-\*) tokens
- [ ] **Color Compliance**: All colors reference var(--p-color-\*) with fallbacks
- [ ] **Typography**: Font families, sizes, weights from Polaris system
- [ ] **Border Radius**: Consistent with var(--p-border-radius-\*) scale
- [ ] **Shadows**: Modal elevation using var(--p-shadow-\*) tokens

### Ticket 4: Shopify Admin Integration (Pending Token)

**Priority**: Low (blocked)  
**Epic**: Admin Embed Support  
**Story Points**: 8

#### Dependencies

- **Shopify Admin Team Token**: Required for embed access
- **App Bridge Modal API**: Integration with Admin modal system
- **Container Queries**: Responsive behavior within Admin iframe

#### Acceptance Criteria (Post-Token Delivery)

- [ ] **App Bridge Integration**: Modal renders via shopify.modal.show() API
- [ ] **Admin Context**: Modal centered in full Admin viewport
- [ ] **Focus Return**: Focus restoration to Admin trigger element
- [ ] **Backdrop Dimming**: Admin background appropriately obscured
- [ ] **Container Adaptation**: Modal adapts to Admin app frame size

## Implementation Timeline & Milestones

### Week 1: Foundation

- **Day 1-2**: React Router 7 conversion for both modals
- **Day 3**: Focus management implementation and testing
- **Day 4-5**: Supabase integration and form handling

### Week 2: Accessibility & Polish

- **Day 1-2**: WCAG 2.2 AA compliance validation
- **Day 3**: Polaris token integration
- **Day 4-5**: Responsive behavior and animation implementation

### Week 3: Testing & Documentation

- **Day 1-2**: Automated test coverage (Playwright)
- **Day 3**: Accessibility walkthrough execution
- **Day 4-5**: Documentation updates and handoff

## Testing Requirements

### Automated Testing (Playwright)

```typescript
// Example test structure
test("CX Escalation modal accessibility", async ({ page }) => {
  await page.getByTestId("cx-escalations-open").click();

  // Focus management
  await expect(
    page.getByRole("button", { name: /close escalation modal/i }),
  ).toBeFocused();

  // Tab order
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("heading", { name: /CX Escalation/i }),
  ).toBeFocused();

  // Escape key
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("cx-escalation-dialog")).not.toBeVisible();
  await expect(page.getByTestId("cx-escalations-open")).toBeFocused();
});
```

### Manual Testing Checklist

- [ ] Keyboard-only navigation (no mouse)
- [ ] Screen reader testing (NVDA/VoiceOver)
- [ ] Color contrast validation (4.5:1 minimum)
- [ ] Responsive behavior across breakpoints
- [ ] Form validation and error states
- [ ] Network error simulation and recovery

### Accessibility Validation Tools

- **axe-core**: Automated WCAG compliance scanning
- **Lighthouse**: Performance and accessibility audit
- **Color Contrast Analyzer**: Manual contrast verification
- **Browser zoom**: 200% zoom functionality test

## Definition of Done

### Technical Requirements

- [ ] All modal states render correctly in React Router 7
- [ ] Focus trap implemented and tested across browsers
- [ ] Screen reader announcements verified
- [ ] Form submission integrates with Supabase
- [ ] Error handling provides clear recovery paths
- [ ] Toast notifications follow accessibility patterns
- [ ] Polaris tokens integrated throughout
- [ ] Responsive behavior works on all target devices

### Quality Assurance

- [ ] Automated tests pass (focus management, form validation)
- [ ] Manual accessibility audit completed
- [ ] Cross-browser compatibility verified (Chrome, Firefox, Safari, Edge)
- [ ] Performance benchmarks met (modal open/close <200ms)
- [ ] Documentation updated with implementation notes

### Stakeholder Approvals

- [ ] **Designer**: Visual design and interaction patterns approved
- [ ] **Engineering**: Technical implementation reviewed and approved
- [ ] **QA**: Accessibility compliance verified
- [ ] **PM**: Feature functionality and user experience approved

## Risk Mitigation

### Accessibility Regressions

- **Risk**: Focus management implementation breaks existing navigation
- **Mitigation**: Incremental implementation with fallback patterns
- **Testing**: Automated focus trap tests and manual validation

### Performance Impact

- **Risk**: Modal animations cause performance degradation
- **Mitigation**: CSS-based animations with hardware acceleration
- **Monitoring**: Performance metrics tracking for modal interactions

### Supabase Integration Issues

- **Risk**: Database mutations fail or cause data corruption
- **Mitigation**: Transaction-based updates with rollback capability
- **Testing**: Integration tests with staging database

### Shopify Admin Token Delays

- **Risk**: Admin integration blocked by token delivery timeline
- **Mitigation**: Complete dashboard implementation first, Admin integration as Phase 2
- **Communication**: Regular status updates with Shopify Admin team

## Communication Plan

### Engineering Handoff Session

- **Duration**: 45 minutes
- **Participants**: Designer, Engineering Lead, Frontend Developer, QA Lead
- **Agenda**:
  1. Walkthrough of modal refresh specification (15 min)
  2. Accessibility requirements deep dive (15 min)
  3. Implementation tickets and acceptance criteria review (10 min)
  4. Timeline, dependencies, and next steps (5 min)

### Ongoing Coordination

- **Daily standups**: Progress updates and blocker resolution
- **Weekly design reviews**: Visual design and interaction validation
- **Accessibility check-ins**: WCAG compliance progress tracking
- **Stakeholder updates**: PM and stakeholder communication

## Handoff Artifacts

### Design Assets (Pending Figma Access)

- **Component Library**: Modal variants and states
- **Interaction Flows**: User journey documentation
- **Redline Specifications**: Detailed measurements and spacing
- **Animation Examples**: Motion behavior reference

### Code Examples

- **Focus Management**: TypeScript implementation patterns
- **Form Integration**: React Router 7 + Supabase patterns
- **Error Handling**: User-friendly error states and recovery
- **Accessibility**: ARIA implementation and screen reader support

### Documentation References

- **Polaris Guidelines**: Design system usage patterns
- **WCAG 2.2 AA**: Specific compliance requirements
- **React Router 7**: Navigation and form handling patterns
- **Supabase**: Database integration and mutation patterns

---

**Handoff Status**: Ready for engineering coordination  
**Session Scheduling**: Pending engineering team availability  
**Implementation Priority**: High (accessibility compliance requirements)  
**Support Contact**: customer.support@hotrodan.com
