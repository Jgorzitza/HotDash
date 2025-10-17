---
epoch: 2025.10.E1
doc: docs/specs/shopify-admin-overlay.md
owner: designer
last_reviewed: 2025-10-11
doc_hash: TBD
expires: 2025-10-18
---

# Shopify Admin Overlay Specification — HotDash OCC

## Overview

This specification defines the overlay behavior and implementation patterns for the HotDash Operator Control Center when embedded within the Shopify Admin environment. The overlay system provides contextual OCC modals and tooltips that integrate seamlessly with existing Shopify Admin surfaces.

## Goals and Constraints

### Goals

- ✅ Seamless integration with Shopify Admin UI patterns
- ✅ Polaris-aligned visual design and accessibility compliance
- ✅ Consistent focus management across Admin and OCC contexts
- ✅ Responsive behavior within Admin container constraints
- ✅ Robust z-index and stacking context management
- ✅ Support for Shopify Admin native modal behavior

### Constraints

- 🚫 Cannot override Shopify Admin global styles
- 🚫 Must respect Admin iframe security boundaries
- 🚫 Cannot modify Admin navigation or global layout
- 🚫 Limited to container queries within app frame boundaries
- 🚫 Must use Polaris tokens for visual consistency

## Admin Integration Context

### Embedded App Environment

The HotDash OCC operates as an embedded app within the Shopify Admin iframe context:

```
┌─────────────────────────────────────────────────────────────┐
│ Shopify Admin (Host)                                        │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Admin Navigation & Top Bar                              │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ HotDash OCC App Frame (iframe)                      │ │ │
│ │ │                                                     │ │ │
│ │ │ [Overlay Context - Our Control]                     │ │ │
│ │ │ ┌─────────────────────────────────┐                 │ │ │
│ │ │ │ OCC Modal Overlay               │                 │ │ │
│ │ │ │ - Uses App Bridge Modal API     │                 │ │ │
│ │ │ │ - Centered in Admin viewport    │                 │ │ │
│ │ │ │ - Dims entire Admin background  │                 │ │ │
│ │ │ └─────────────────────────────────┘                 │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┐ │
└─────────────────────────────────────────────────────────────┘
```

### App Bridge Integration

HotDash leverages Shopify App Bridge for modal overlays that transcend the app iframe:

```typescript
// App Bridge Modal API Usage Pattern
await shopify.modal.show({
  variant: "large", // 'small' | 'base' | 'large' | 'max'
  content: `<OCC Modal HTML Content>`,
  title: "CX Escalation — Customer Name",
});
```

## Overlay Component Architecture

### Modal Overlay Types

#### 1. App Bridge Native Modal (Primary)

**Use Case**: CX Escalations, Sales Pulse detail modals
**Characteristics**:

- Rendered by Shopify Admin outside app iframe
- Centered in full Admin viewport
- Automatic focus trap and Escape key handling
- Polaris styling applied by Admin

**Implementation**:

```typescript
// Modal content prepared in app context
const modalContent = renderModalContentToString({
  type: "cx-escalation",
  data: conversation,
  onAction: handleModalAction,
});

// Modal shown via App Bridge
await shopify.modal.show({
  variant: "large",
  content: modalContent,
  title: `CX Escalation — ${conversation.customerName}`,
});
```

#### 2. In-Frame Tooltip Overlays (Secondary)

**Use Case**: Quick status indicators, help text, metric explanations
**Characteristics**:

- Rendered within app iframe using Polaris components
- Positioned relative to trigger elements
- Limited to app frame boundaries

**Implementation**:

```tsx
// Using Polaris Web Component Pattern
<s-tooltip id="metric-explanation">
  Revenue calculation includes taxes and shipping but excludes refunds processed in the last 24 hours.
</s-tooltip>

<s-clickable interestFor="metric-explanation">
  <s-icon type="info-filled" />
</s-clickable>
```

#### 3. Admin Action Extension Modal (Future)

**Use Case**: Deep integration with Shopify Admin pages (Orders, Products, Customers)
**Characteristics**:

- Admin UI Extension modal triggered from Admin pages
- Full Admin modal behavior with custom content
- Access to Admin page context and data

### Token Mapping System

#### OCC to Polaris Token Mapping

Create placeholder token file for overlay-specific styling:

```json
{
  "overlay": {
    "modal": {
      "width": {
        "small": "400px",
        "base": "600px",
        "large": "800px",
        "max": "calc(100vw - var(--p-space-8, 32px))"
      },
      "zIndex": {
        "modal": "var(--p-z-index-12, 1200)",
        "backdrop": "var(--p-z-index-11, 1100)"
      },
      "spacing": {
        "padding": "var(--p-space-6, 24px)",
        "gap": "var(--p-space-4, 16px)"
      },
      "border": {
        "radius": "var(--p-border-radius-3, 16px)"
      },
      "shadow": {
        "modal": "var(--p-shadow-400, 0 8px 16px rgba(15, 23, 42, 0.12))"
      }
    },
    "tooltip": {
      "background": "var(--p-color-bg-surface-dark, #202223)",
      "text": "var(--p-color-text-on-dark, #ffffff)",
      "border": "var(--p-color-border-dark, #454748)",
      "zIndex": "var(--p-z-index-10, 1000)"
    }
  },
  "animation": {
    "duration": {
      "modal": "var(--p-motion-duration-150, 150ms)",
      "tooltip": "var(--p-motion-duration-100, 100ms)"
    },
    "easing": {
      "entrance": "var(--p-motion-ease-out, cubic-bezier(0.0, 0.0, 0.2, 1))",
      "exit": "var(--p-motion-ease-in, cubic-bezier(0.4, 0.0, 1, 1))"
    }
  }
}
```

#### Placeholder Token File Structure

Store at `tokens/shopify-overlay.json`:

```json
{
  "_meta": {
    "description": "Placeholder tokens for Shopify Admin overlay integration",
    "replaceOnTokenDelivery": true,
    "lastUpdated": "2025-10-11T01:00:00Z"
  },
  "color": {
    "overlay": {
      "backdrop": "rgba(0, 0, 0, 0.6)",
      "surface": "var(--p-color-bg-surface, #ffffff)",
      "border": "var(--p-color-border-subdued, #d2d5d8)"
    },
    "focus": {
      "ring": "var(--p-color-border-focus, #2c6ecb)",
      "outline": "var(--p-color-bg-interactive, #2c6ecb)"
    }
  },
  "spacing": {
    "container": {
      "margin": "var(--p-space-4, 16px)",
      "padding": "var(--p-space-6, 24px)"
    }
  },
  "motion": {
    "modal": {
      "enter": "transform 250ms var(--p-motion-ease-out, cubic-bezier(0.0, 0.0, 0.2, 1))",
      "exit": "transform 200ms var(--p-motion-ease-in, cubic-bezier(0.4, 0.0, 1, 1))"
    }
  }
}
```

## Focus Management and Accessibility

### Focus Trap Strategy for Admin Context

When App Bridge modal is active:

1. **Initial Focus**: App Bridge handles initial focus to modal
2. **Focus Containment**: Automatic focus trap within modal boundaries
3. **Escape Behavior**: App Bridge provides Escape key handling
4. **Return Focus**: Returns to originating Admin element on close

### Custom Focus Management (In-Frame)

For tooltips and in-frame overlays:

```typescript
// Focus management for tooltip overlays
class TooltipFocusManager {
  private originalFocus: HTMLElement | null = null;

  show(trigger: HTMLElement, tooltip: HTMLElement) {
    this.originalFocus = trigger;

    // Make tooltip focusable for screen readers
    tooltip.setAttribute("tabindex", "-1");
    tooltip.focus();

    // Announce tooltip content
    tooltip.setAttribute("role", "tooltip");
    tooltip.setAttribute("aria-live", "polite");
  }

  hide(tooltip: HTMLElement) {
    // Return focus to original trigger
    if (this.originalFocus) {
      this.originalFocus.focus();
      this.originalFocus = null;
    }

    tooltip.removeAttribute("tabindex");
  }
}
```

### Screen Reader Support

- **Modal Content**: Proper heading structure with `aria-labelledby`
- **Live Regions**: Status updates announced via `aria-live="polite"`
- **Context Preservation**: Clear indication of Admin context vs OCC content

## Z-Index and Stacking Context Strategy

### Z-Index Hierarchy

Based on Shopify Admin z-index conventions:

```css
/* OCC Overlay Z-Index Scale */
:root {
  --occ-z-admin-overlay: 1000; /* Above Admin content, below Admin modals */
  --occ-z-tooltip: 1010; /* Tooltips above overlay content */
  --occ-z-app-bridge-modal: 1200; /* App Bridge controls this automatically */
  --occ-z-app-bridge-backdrop: 1100; /* App Bridge controls this automatically */
}

/* In-Frame Overlay Styles */
.occ-tooltip-overlay {
  z-index: var(--occ-z-tooltip);
  position: fixed; /* Relative to app iframe viewport */
}

.occ-status-overlay {
  z-index: var(--occ-z-admin-overlay);
  position: absolute; /* Relative to positioned parent */
}
```

### Stacking Context Isolation

Ensure overlays don't interfere with Admin UI:

```css
/* Create new stacking context for OCC overlays */
.occ-overlay-container {
  position: relative;
  z-index: 0; /* Establish stacking context */
}

.occ-overlay-content {
  position: absolute;
  z-index: var(--occ-z-admin-overlay);
  /* Additional positioning styles */
}
```

## Responsive Behavior in Admin Context

### Container Query Strategy

Since we're in an iframe, use container queries instead of viewport queries:

```css
/* Container-based responsive overlay behavior */
.occ-modal-content {
  container-type: inline-size;
}

/* Desktop Admin layout */
@container (min-width: 1200px) {
  .occ-modal-content {
    padding: var(--p-space-6, 24px);
    grid-template-columns: 2fr 1fr;
  }
}

/* Tablet/smaller Admin layout */
@container (max-width: 1199px) {
  .occ-modal-content {
    padding: var(--p-space-4, 16px);
    grid-template-columns: 1fr;
  }
}
```

### Adaptive Content Layout

Overlay content adapts to Admin container size:

```css
/* Responsive modal content */
.occ-escalation-modal {
  container: occ-modal / inline-size;
}

@container occ-modal (min-width: 600px) {
  .occ-escalation-fields {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--p-space-4, 16px);
  }
}

@container occ-modal (max-width: 599px) {
  .occ-escalation-fields {
    display: flex;
    flex-direction: column;
    gap: var(--p-space-3, 12px);
  }
}
```

## Interaction Patterns

### Modal Trigger Patterns

```typescript
// From tile action button
const handleEscalationClick = async (conversationId: string) => {
  // Prepare modal content with current data
  const modalHTML = await renderEscalationModal({
    conversationId,
    onApprove: handleApproveAction,
    onEscalate: handleEscalateAction,
    onResolve: handleResolveAction,
  });

  // Show via App Bridge
  await shopify.modal.show({
    variant: "large",
    title: `CX Escalation — ${conversation.customerName}`,
    content: modalHTML,
  });
};

// Modal action handlers
const handleApproveAction = async (formData: FormData) => {
  try {
    await submitEscalationDecision(formData);
    await shopify.modal.hide();
    await shopify.toast.show({
      message: "Decision logged successfully",
      duration: 5000,
    });
  } catch (error) {
    await shopify.toast.show({
      message: "Network error. Please try again.",
      isError: true,
    });
  }
};
```

### Tooltip Interaction Patterns

```typescript
// Hover/focus-based tooltip display
const setupTooltipInteractions = () => {
  document.querySelectorAll("[data-occ-tooltip]").forEach((trigger) => {
    const tooltipId = trigger.getAttribute("data-occ-tooltip");
    const tooltip = document.getElementById(tooltipId);

    if (!tooltip) return;

    let hideTimeout: number;

    const showTooltip = () => {
      clearTimeout(hideTimeout);
      tooltip.setAttribute("aria-hidden", "false");
      tooltip.classList.add("occ-tooltip--visible");
    };

    const hideTooltip = () => {
      hideTimeout = window.setTimeout(() => {
        tooltip.setAttribute("aria-hidden", "true");
        tooltip.classList.remove("occ-tooltip--visible");
      }, 100);
    };

    trigger.addEventListener("mouseenter", showTooltip);
    trigger.addEventListener("mouseleave", hideTooltip);
    trigger.addEventListener("focus", showTooltip);
    trigger.addEventListener("blur", hideTooltip);
  });
};
```

## Content and Copy Guidelines

### Modal Content Alignment

- **Titles**: Follow Admin convention: "Function — Context" (e.g., "CX Escalation — Jamie Lee")
- **Helper Text**: Reference `customer.support@hotrodan.com` consistently
- **Button Labels**: Use Polaris-aligned action language ("Approve & Send", "Log follow-up")
- **Error Messages**: Standard Admin error patterns with recovery guidance

### Accessibility Copy Patterns

```typescript
// Screen reader announcements
const announceModalOpen = (modalType: string, context: string) => {
  const announcement = document.createElement("div");
  announcement.setAttribute("aria-live", "assertive");
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only";
  announcement.textContent = `${modalType} modal opened for ${context}`;

  document.body.appendChild(announcement);
  setTimeout(() => document.body.removeChild(announcement), 1000);
};

// Contextual help text
const contextualHelp = {
  escalation:
    "Escalation decisions are logged to customer.support@hotrodan.com and added to the customer record.",
  salesPulse:
    "Revenue calculations include taxes and shipping. Variance alerts are sent to operations team.",
  supportNote:
    "Internal notes are visible to operators only and included in audit trail.",
};
```

## Technical Implementation Patterns

### App Bridge Modal Integration

```typescript
// Modal state management with App Bridge
interface AppBridgeModalManager {
  show(config: ModalConfig): Promise<void>;
  hide(): Promise<void>;
  updateContent(content: string): Promise<void>;
}

class OCCModalManager implements AppBridgeModalManager {
  private activeModal: string | null = null;

  async show(config: ModalConfig): Promise<void> {
    // Prepare content with proper Polaris styling
    const styledContent = this.applyPolarisStyles(config.content);

    // Show via App Bridge with size constraints
    await shopify.modal.show({
      variant: config.size || "base",
      content: styledContent,
      title: config.title,
    });

    this.activeModal = config.id;
    this.bindModalEventHandlers(config);
  }

  private applyPolarisStyles(content: string): string {
    // Inject Polaris tokens and OCC overlay styles
    return `
      <style>
        ${this.getOverlayStyles()}
      </style>
      <div class="occ-modal-wrapper">
        ${content}
      </div>
    `;
  }

  private getOverlayStyles(): string {
    return `
      .occ-modal-wrapper {
        font-family: var(--p-font-family-sans, -apple-system, BlinkMacSystemFont, 'San Francisco', 'Segoe UI', Roboto, sans-serif);
        color: var(--p-color-text, #202223);
        background: var(--p-color-bg-surface, #ffffff);
      }
      
      .occ-modal-section {
        padding: var(--p-space-4, 16px) 0;
      }
      
      .occ-modal-section + .occ-modal-section {
        border-top: 1px solid var(--p-color-border-subdued, #d2d5d8);
      }
      
      .occ-button {
        background: var(--p-color-bg-interactive, #2c6ecb);
        color: var(--p-color-text-on-interactive, #ffffff);
        border: none;
        border-radius: var(--p-border-radius-1, 8px);
        padding: var(--p-space-3, 12px) var(--p-space-4, 16px);
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 150ms ease;
      }
      
      .occ-button:hover {
        background: var(--p-color-bg-interactive-hover, #1f5199);
      }
      
      .occ-button--secondary {
        background: transparent;
        color: var(--p-color-text-interactive, #2c6ecb);
        border: 1px solid var(--p-color-border-interactive, #2c6ecb);
      }
      
      @media (prefers-reduced-motion: reduce) {
        .occ-button {
          transition: none;
        }
      }
    `;
  }
}
```

### Focus Management Implementation

```typescript
// Custom focus management for complex overlays
class OverlayFocusManager {
  private focusableSelectors = [
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "a[href]",
    '[tabindex]:not([tabindex="-1"])',
  ];

  trapFocus(container: HTMLElement): () => void {
    const focusableElements = container.querySelectorAll(
      this.focusableSelectors.join(", "),
    ) as NodeListOf<HTMLElement>;

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    };

    container.addEventListener("keydown", handleTabKey);
    firstFocusable?.focus();

    return () => {
      container.removeEventListener("keydown", handleTabKey);
    };
  }
}
```

## Error Handling and Resilience

### App Bridge Connection Issues

```typescript
// Graceful degradation when App Bridge is unavailable
const showModalWithFallback = async (config: ModalConfig) => {
  try {
    if (typeof shopify !== "undefined" && shopify.modal) {
      await shopify.modal.show(config);
    } else {
      // Fallback to in-frame modal
      showInFrameModal(config);
    }
  } catch (error) {
    console.warn("App Bridge modal failed, using fallback:", error);
    showInFrameModal(config);
  }
};

const showInFrameModal = (config: ModalConfig) => {
  // Create in-frame modal with proper styling and focus management
  const modal = document.createElement("div");
  modal.className = "occ-fallback-modal";
  modal.innerHTML = config.content;

  const backdrop = document.createElement("div");
  backdrop.className = "occ-fallback-backdrop";
  backdrop.appendChild(modal);

  document.body.appendChild(backdrop);

  // Apply focus trap
  const releaseFocusTrap = this.focusManager.trapFocus(modal);

  // Handle close
  const handleClose = () => {
    releaseFocusTrap();
    document.body.removeChild(backdrop);
  };

  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) handleClose();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") handleClose();
  });
};
```

## Testing and Validation Strategy

### Cross-Browser Testing Matrix

- **Chrome 110+**: Primary development and testing target
- **Firefox 110+**: Focus management and keyboard navigation verification
- **Safari 16+**: Container query support and iOS WebView testing
- **Edge 110+**: Windows accessibility tools compatibility

### Accessibility Testing Checklist

- [ ] **Keyboard Navigation**: Tab order, focus trap, Escape handling
- [ ] **Screen Reader**: NVDA/VoiceOver modal announcements
- [ ] **Color Contrast**: 4.5:1 minimum for all text elements
- [ ] **Reduced Motion**: Respect `prefers-reduced-motion` settings
- [ ] **Touch Targets**: 44px minimum for all interactive elements

### Admin Integration Testing

- [ ] **Modal Centering**: Proper position in various Admin layouts
- [ ] **Z-Index Behavior**: No interference with Admin UI elements
- [ ] **Responsive Layout**: Container-based responsive behavior
- [ ] **Focus Return**: Proper focus restoration on modal close
- [ ] **Error States**: Graceful handling of App Bridge failures

## Dependencies and Environment Requirements

### Required Environment Setup

```bash
# Shopify App Bridge script (automatically updated)
<script src="https://cdn.shopify.com/shopifycloud/app-bridge.js"></script>

# API Key configuration
<meta name="shopify-api-key" content="%SHOPIFY_API_KEY%" />
```

### Token Delivery Dependencies

- **Shopify Admin Team Token**: Required for production Polaris token access
- **Figma Workspace Access**: Required for component library updates
- **Design Review Cycle**: PM and Engineering sign-off required

### Implementation Timeline

- **Phase 1** (Week 1): Placeholder tokens and basic App Bridge integration
- **Phase 2** (Week 2): Focus management and accessibility compliance
- **Phase 3** (Week 3): Production token integration (pending delivery)
- **Phase 4** (Week 4): Cross-browser testing and Admin integration validation

---

**Next Steps:**

1. Create placeholder token file at `tokens/shopify-overlay.json`
2. Implement App Bridge modal integration for CX Escalations
3. Set up container query-based responsive behavior
4. Schedule accessibility walkthrough with engineering team
5. Await Shopify Admin token delivery for production styling
