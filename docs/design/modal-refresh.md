---
epoch: 2025.10.E1
doc: docs/design/modal-refresh.md
owner: designer
last_reviewed: 2025-10-11
doc_hash: TBD
expires: 2025-10-18
---

# Modal Refresh Specification — Operator Control Center

## Overview

This specification consolidates the current modal implementations (CX Escalations and Sales Pulse) into a refreshed design system that aligns with React Router 7 patterns, Supabase-backed state management, and Shopify Polaris guidelines.

## Goals and Non-Goals

### Goals
- ✅ Unify modal patterns across CX Escalations and Sales Pulse components
- ✅ Align with Polaris accessibility standards (WCAG 2.2 AA)
- ✅ Standardize focus management and keyboard navigation
- ✅ Integrate with React Router 7 navigation patterns
- ✅ Support responsive breakpoints (desktop 1280px+, tablet 768px+, mobile <768px)
- ✅ Provide consistent toast feedback patterns
- ✅ Enable comprehensive Playwright test coverage

### Non-Goals
- ❌ Multi-step or wizard modals (future iteration)
- ❌ Inline editing modals (out of scope)
- ❌ Full-screen modal experiences (mobile-only consideration for future)

## Current State Analysis

### Existing Modal Components

#### CX Escalation Modal (`CXEscalationModal.tsx`)
```typescript
interface CXEscalationModalProps {
  conversation: EscalationConversation;
  open: boolean;
  onClose: () => void;
}
```

**Current Structure:**
- Header: Title + customer name, close button
- Body: Conversation history, suggested reply textarea, internal note textarea, error feedback
- Footer: Primary actions (Approve & send, Escalate, Mark resolved) + Cancel

**Current Interactions:**
- React Router fetcher for form submission to `/actions/chatwoot/escalate`
- State management for reply content and internal notes
- Error handling with role="alert" feedback

#### Sales Pulse Modal (`SalesPulseModal.tsx`)
```typescript
interface SalesPulseModalProps {
  summary: OrderSummary;
  open: boolean;
  onClose: () => void;
}
```

**Current Structure:**
- Header: Title, revenue summary, close button
- Body: Top SKUs list, pending fulfillment issues, action selection + notes
- Footer: Dynamic primary action button + Cancel

**Current Interactions:**
- React Router fetcher for form submission to `/actions/sales-pulse/decide`
- Action selection with dynamic button labeling
- JSON context serialization for audit trail

### Existing CSS Classes
- `.occ-modal-backdrop` - Modal overlay
- `.occ-modal` - Main modal container  
- `.occ-modal__header` - Header section
- `.occ-modal__body` - Body section
- `.occ-modal__footer` - Footer section
- `.occ-modal__section` - Content sections within body
- `.occ-modal__messages` - Conversation history container
- `.occ-modal__message` - Individual message styling
- `.occ-modal__list` - Lists (SKUs, fulfillment issues)
- `.occ-modal__footer-actions` - Button group container

## Refreshed Component Anatomy

### Modal Container Structure
```html
<div class="occ-modal-backdrop" role="presentation">
  <dialog class="occ-modal" role="dialog" aria-modal="true" aria-labelledby="{modal-id}-title">
    <div class="occ-modal__header">
      <div class="occ-modal__header-content">
        <h2 id="{modal-id}-title">{Modal Title}</h2>
        <p class="occ-text-meta">{Context Information}</p>
      </div>
      <button class="occ-button occ-button--plain occ-modal__close" aria-label="Close {modal type} modal">
        <CloseIcon />
      </button>
    </div>
    
    <div class="occ-modal__body">
      <section class="occ-modal__section">
        {Content sections}
      </section>
    </div>
    
    <div class="occ-modal__footer">
      <div class="occ-modal__footer-actions">
        {Primary and secondary actions}
      </div>
      <button class="occ-button occ-button--plain" type="button">Cancel</button>
    </div>
  </dialog>
</div>
```

### Token Integration

#### Spacing
```css
.occ-modal {
  width: var(--occ-modal-width, 600px);
  max-width: var(--occ-modal-max-width, 90vw);
  padding: 0; /* Padding applied to sections */
  border-radius: var(--occ-radius-modal, var(--p-border-radius-3, 16px));
  box-shadow: var(--occ-shadow-modal, var(--p-shadow-400, 0 8px 16px rgba(15, 23, 42, 0.12)));
}

.occ-modal__header,
.occ-modal__body,
.occ-modal__footer {
  padding: var(--occ-modal-padding, var(--p-space-6, 24px));
}

.occ-modal__section + .occ-modal__section {
  margin-top: var(--occ-modal-gap, var(--p-space-4, 16px));
}
```

#### Colors
```css
.occ-modal {
  background-color: var(--p-color-bg-surface, #ffffff);
  color: var(--p-color-text, #202223);
}

.occ-modal-backdrop {
  background-color: rgba(0, 0, 0, 0.6);
}

.occ-modal__header {
  border-bottom: 1px solid var(--p-color-border-subdued, #d2d5d8);
}

.occ-modal__footer {
  border-top: 1px solid var(--p-color-border-subdued, #d2d5d8);
}
```

## Responsive Behavior

### Desktop (1280px+)
- Modal width: 600px
- Modal positioned center screen
- Full feature set available
- Horizontal button layout

### Tablet (768px - 1279px)
- Modal width: 90vw (max 600px)
- Modal positioned center screen
- Full feature set available
- Horizontal button layout maintained

### Mobile (<768px)
- Modal width: 100vw
- Modal positioned full screen with minimal margin
- Compressed spacing tokens
- Stack footer buttons vertically if space constrained

```css
@media (max-width: 767px) {
  .occ-modal {
    width: 100vw;
    max-width: none;
    height: 100vh;
    max-height: none;
    border-radius: 0;
    margin: 0;
  }
  
  .occ-modal__footer-actions {
    flex-direction: column;
    gap: var(--p-space-2, 8px);
  }
  
  .occ-modal__header,
  .occ-modal__body,
  .occ-modal__footer {
    padding: var(--p-space-4, 16px);
  }
}
```

## Focus Management and Keyboard Navigation

### Focus Order
1. **Modal open**: Focus moves to close button, then programmatically to modal heading for screen reader context
2. **Tab sequence**: Close button → modal heading → body content (forms, links, buttons) → footer actions → cancel button
3. **Modal close**: Focus returns to triggering element (tile CTA button)

### Keyboard Shortcuts
- **Escape**: Close modal (same as Cancel button)
- **Tab/Shift+Tab**: Navigate through focusable elements
- **Enter**: Activate focused button or form element
- **Space**: Toggle focused checkbox/button elements

### Implementation Pattern
```tsx
useEffect(() => {
  if (open && dialogRef.current) {
    // Focus close button initially
    const closeButton = dialogRef.current.querySelector('.occ-modal__close');
    closeButton?.focus();
    
    // Announce modal heading for screen readers
    setTimeout(() => {
      const heading = dialogRef.current?.querySelector('h2');
      if (heading) {
        heading.focus();
        heading.blur(); // Return to natural focus flow
      }
    }, 100);
  }
}, [open]);

const handleClose = () => {
  onClose();
  // React Router handles focus restoration via navigation
};
```

### Screen Reader Support
- **Modal heading**: `aria-labelledby` references modal title
- **Modal container**: `aria-modal="true"` and `role="dialog"`
- **Conversation logs**: `role="log"` with `aria-live="polite"`
- **Error messages**: `role="alert"` for immediate announcement
- **Loading states**: `aria-busy="true"` on form submission

## Content Guidelines

### Modal Titles
- **CX Escalations**: "CX Escalation — {Customer Name}"
- **Sales Pulse**: "Sales Pulse — Variance Review"
- **Pattern**: "{Function} — {Context}"

### Action Button Labels
- **Primary destructive**: "Approve & Send Reply"
- **Secondary actions**: "Escalate to Manager", "Log follow-up"
- **Resolution actions**: "Mark Resolved"
- **Cancel**: Always "Cancel" (not "Close")

### Helper Text
- **Reference support email**: "Variance escalations notify customer.support@hotrodan.com"
- **Audit context**: "Helper: Visible to operators only" (internal notes)
- **Error recovery**: "Network error. Please try again." (with Retry button)

### Placeholder Text
- **Text areas**: "Add context for audit trail"
- **Reply suggestions**: "Hi {customer name}, thanks for your patience..."

## Toast and Feedback Patterns

### Success States
```json
{
  "toast.success.decision_logged": "Decision logged successfully",
  "toast.success.action_confirmed": "Action confirmed — ticket #{ticketId} created"
}
```

### Error States
```json
{
  "toast.error.network": "Network error. Please try again.",
  "toast.error.validation": "Please complete required fields before submitting"
}
```

### Toast Behavior
- **Duration**: 6 seconds auto-dismiss
- **Manual dismiss**: Available with "×" button
- **Focus handling**: Maintain focus on originating element when toast appears
- **Screen reader**: `role="status"` for success, `role="alert"` for errors
- **Reduced motion**: Fade only (no slide animations)

## Accessibility Requirements

### WCAG 2.2 AA Compliance Checklist
- [ ] **Keyboard accessible**: All interactive elements reachable via keyboard
- [ ] **Focus management**: Logical tab order, visible focus indicators
- [ ] **Color contrast**: 4.5:1 minimum for normal text, 3:1 for large text
- [ ] **Screen reader support**: Proper ARIA labeling and live regions
- [ ] **Error identification**: Clear error messaging with recovery guidance
- [ ] **Timeout handling**: No automatic timeouts that lose user data

### Focus Trap Implementation
```tsx
const useFocusTrap = (isActive: boolean) => {
  useEffect(() => {
    if (!isActive) return;
    
    const modal = document.querySelector('.occ-modal');
    const focusableElements = modal?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (!focusableElements || focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    const handleTabKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };
    
    document.addEventListener('keydown', handleTabKeyDown);
    return () => document.removeEventListener('keydown', handleTabKeyDown);
  }, [isActive]);
};
```

## Motion and Animation

### Modal Entry/Exit
```css
@media (prefers-reduced-motion: no-preference) {
  .occ-modal {
    animation: modal-enter 250ms cubic-bezier(0.4, 0.0, 0.2, 1);
  }
  
  .occ-modal-backdrop {
    animation: backdrop-enter 250ms ease-out;
  }
}

@keyframes modal-enter {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes backdrop-enter {
  from { opacity: 0; }
  to { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .occ-modal,
  .occ-modal-backdrop {
    animation: none;
  }
}
```

## Testing Requirements

### Playwright Test Coverage
```typescript
// Focus management
test('modal focuses close button on open', async ({ page }) => {
  await page.getByTestId('cx-escalations-open').click();
  await expect(page.getByRole('button', { name: /close escalation modal/i })).toBeFocused();
});

// Keyboard navigation
test('Escape key closes modal', async ({ page }) => {
  await page.getByTestId('sales-pulse-open').click();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('sales-pulse-dialog')).not.toBeVisible();
});

// Form submission and error handling
test('displays error message on network failure', async ({ page }) => {
  // Mock network error
  await page.route('/actions/chatwoot/escalate', route => route.abort());
  await page.getByTestId('cx-escalations-open').click();
  await page.getByRole('button', { name: /approve & send/i }).click();
  await expect(page.getByRole('alert')).toHaveText(/network error/i);
});
```

### Manual Testing Checklist
- [ ] Screen reader announces modal title and context
- [ ] Tab order follows logical sequence
- [ ] Focus returns to triggering element on close
- [ ] Error messages are announced immediately
- [ ] Toast notifications respect reduced motion preferences
- [ ] Touch targets meet 44px minimum on mobile devices
- [ ] Modal content remains scrollable on small screens

## Migration and Rollout Plan

### Phase 1: Token Integration (Week 1)
- Update CSS custom properties to use design tokens
- Implement responsive spacing and typography scales
- Test across desktop, tablet, mobile breakpoints

### Phase 2: Accessibility Enhancements (Week 2)
- Implement focus trap and keyboard navigation
- Add proper ARIA labeling and live regions
- Conduct screen reader testing

### Phase 3: Animation and Polish (Week 3)
- Add enter/exit animations with reduced motion support
- Implement toast notification patterns
- Finalize visual refinements

### Phase 4: Testing and Documentation (Week 4)
- Complete Playwright test suite expansion
- Conduct accessibility audit and remediation
- Update component documentation and usage examples

## Evidence and Artifacts

### Figma Resources
- **Component Library**: [To be added - pending workspace access]
- **Prototype Flows**: [To be added - pending workspace access]
- **Redline Annotations**: artifacts/modals/modal-redlines-{date}.pdf

### Code References
- **Current Implementation**: app/components/modals/
- **Test Specifications**: tests/playwright/modals.spec.ts
- **CSS Tokens**: docs/design/tokens/design_tokens.md

### Supporting Documentation
- **ASCII Wireframes**: docs/design/modal_refresh_2025-10-13.md
- **Accessibility Checklist**: artifacts/design/offline-cx-sales-package-2025-10-11/focus-checklist.md
- **Responsive Breakpoints**: docs/design/tokens/responsive_breakpoints.md

---

**Next Steps:**
1. Review and approve this specification with PM and Engineering
2. Schedule engineering handoff session
3. Create implementation tickets with acceptance criteria
4. Begin Figma component library updates (pending workspace access)