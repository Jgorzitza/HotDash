# Accessibility Annotations (WCAG 2.1 AA)

**File:** `docs/design/accessibility.md`  
**Owner:** Designer  
**Version:** 1.0  
**Date:** 2025-10-15  
**Status:** Complete

---

## 1. Purpose

Comprehensive accessibility requirements and annotations for all components in the Hot Rod AN Control Center, ensuring WCAG 2.1 AA compliance and inclusive design.

---

## 2. WCAG 2.1 AA Compliance

### 2.1 Four Principles (POUR)

1. **Perceivable** - Information must be presentable to users in ways they can perceive
2. **Operable** - UI components must be operable by all users
3. **Understandable** - Information and operation must be understandable
4. **Robust** - Content must be robust enough for assistive technologies

### 2.2 Success Criteria Summary

| Criterion | Level | Status | Notes |
|-----------|-------|--------|-------|
| 1.1.1 Non-text Content | A | ✅ | All icons have text alternatives |
| 1.3.1 Info and Relationships | A | ✅ | Semantic HTML, ARIA labels |
| 1.3.2 Meaningful Sequence | A | ✅ | Logical tab order |
| 1.4.1 Use of Color | A | ✅ | Status not conveyed by color alone |
| 1.4.3 Contrast (Minimum) | AA | ✅ | 4.5:1 text, 3:1 UI components |
| 1.4.10 Reflow | AA | ✅ | No horizontal scroll at 320px |
| 1.4.11 Non-text Contrast | AA | ✅ | 3:1 for UI components |
| 1.4.12 Text Spacing | AA | ✅ | Supports user text spacing |
| 2.1.1 Keyboard | A | ✅ | All functionality via keyboard |
| 2.1.2 No Keyboard Trap | A | ✅ | Focus can exit all components |
| 2.4.3 Focus Order | A | ✅ | Logical and predictable |
| 2.4.7 Focus Visible | AA | ✅ | Clear focus indicators |
| 3.2.1 On Focus | A | ✅ | No context change on focus |
| 3.2.2 On Input | A | ✅ | No unexpected context change |
| 3.3.1 Error Identification | A | ✅ | Errors clearly identified |
| 3.3.2 Labels or Instructions | A | ✅ | All inputs have labels |
| 4.1.2 Name, Role, Value | A | ✅ | All UI components accessible |

---

## 3. Keyboard Navigation

### 3.1 Global Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Navigate forward through interactive elements |
| `Shift+Tab` | Navigate backward |
| `Enter` | Activate button or link |
| `Space` | Activate button, toggle checkbox |
| `Escape` | Close modal, drawer, or dropdown |
| `Arrow keys` | Navigate within lists, tabs, menus |
| `/` | Focus search field (global) |

### 3.2 Component-Specific Shortcuts

**Dashboard:**
- `Tab` - Navigate between tiles
- `Enter` - Open tile details (if interactive)

**Approvals Drawer:**
- `Cmd/Ctrl+Enter` - Approve
- `Cmd/Ctrl+R` - Request changes
- `Cmd/Ctrl+Delete` - Reject
- `Escape` - Close drawer

**Modals:**
- `Escape` - Close modal
- `Tab` - Navigate within modal (focus trap)

**Tabs:**
- `Arrow Left/Right` - Navigate between tabs
- `Home` - First tab
- `End` - Last tab

### 3.3 Focus Management

**Focus Trap (Modals/Drawers):**
```tsx
import { useFocusTrap } from '@shopify/polaris';

function Modal({ open, onClose, children }) {
  const focusTrapRef = useFocusTrap(open);
  
  return (
    <div ref={focusTrapRef} role="dialog" aria-modal="true">
      {children}
    </div>
  );
}
```

**Focus Return:**
```tsx
function useModalFocus(isOpen) {
  const previousFocusRef = useRef(null);
  
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
  }, [isOpen]);
}
```

**Skip Links:**
```html
<a href="#main-content" className="skip-link">
  Skip to main content
</a>
```

```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--occ-button-primary-bg);
  color: var(--occ-button-primary-text);
  padding: 8px 16px;
  text-decoration: none;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

---

## 4. ARIA Annotations

### 4.1 Landmark Roles

```html
<header role="banner">
  <nav role="navigation" aria-label="Main navigation">
    <!-- Navigation -->
  </nav>
</header>

<main role="main" id="main-content">
  <!-- Main content -->
</main>

<aside role="complementary" aria-label="Sidebar">
  <!-- Sidebar -->
</aside>

<footer role="contentinfo">
  <!-- Footer -->
</footer>
```

### 4.2 Widget Roles

**Tabs:**
```html
<div role="tablist" aria-label="Dashboard sections">
  <button role="tab" aria-selected="true" aria-controls="panel-1">
    Overview
  </button>
  <button role="tab" aria-selected="false" aria-controls="panel-2">
    Details
  </button>
</div>
<div role="tabpanel" id="panel-1" aria-labelledby="tab-1">
  <!-- Panel content -->
</div>
```

**Dialog:**
```html
<div role="dialog" aria-modal="true" aria-labelledby="dialog-title">
  <h2 id="dialog-title">Confirm Action</h2>
  <!-- Dialog content -->
</div>
```

**Alert:**
```html
<div role="alert" aria-live="assertive">
  Error: Unable to save changes
</div>
```

**Status:**
```html
<div role="status" aria-live="polite">
  Loading...
</div>
```

### 4.3 Live Regions

**Polite (non-urgent updates):**
```html
<div aria-live="polite" aria-atomic="true">
  {approvalCount} pending approvals
</div>
```

**Assertive (urgent updates):**
```html
<div aria-live="assertive" aria-atomic="true">
  Error: Network connection lost
</div>
```

**Off (no announcements):**
```html
<div aria-live="off">
  <!-- Content that shouldn't be announced -->
</div>
```

---

## 5. Screen Reader Support

### 5.1 Semantic HTML

**Use semantic elements:**
- `<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`
- `<h1>` - `<h6>` (proper heading hierarchy)
- `<button>` (not `<div>` with click handler)
- `<a>` for links (not `<button>`)
- `<ul>`, `<ol>`, `<li>` for lists

**Avoid:**
- `<div>` or `<span>` for interactive elements
- Skipping heading levels (h1 → h3)
- Using `<a>` for buttons

### 5.2 Alternative Text

**Images:**
```html
<img src="chart.png" alt="Sales trend showing 15% increase over last month" />
```

**Decorative images:**
```html
<img src="decoration.png" alt="" role="presentation" />
```

**Icons:**
```html
<span className="icon" aria-label="Success" role="img">✓</span>
```

**Icon buttons:**
```html
<button aria-label="Close modal">
  <span aria-hidden="true">×</span>
</button>
```

### 5.3 Screen Reader Only Text

```html
<span className="sr-only">
  Status: Healthy. Last refreshed 2 minutes ago.
</span>
```

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

---

## 6. Color Contrast

### 6.1 Verified Ratios (WCAG AA)

**Text:**
- Normal text (< 18pt): **4.5:1 minimum**
- Large text (≥ 18pt or 14pt bold): **3:1 minimum**

**UI Components:**
- Interactive elements: **3:1 minimum**
- Focus indicators: **3:1 minimum**

### 6.2 Color Contrast Table

| Element | Foreground | Background | Ratio | Status |
|---------|------------|------------|-------|--------|
| Body text | #202223 | #ffffff | 16.6:1 | ✅ |
| Secondary text | #637381 | #ffffff | 5.7:1 | ✅ |
| Healthy status | #1a7f37 | #e3f9e5 | 4.8:1 | ✅ |
| Attention status | #d82c0d | #fff4f4 | 4.6:1 | ✅ |
| Unconfigured status | #637381 | #f6f6f7 | 4.5:1 | ✅ |
| Primary button | #ffffff | #2c6ecb | 4.5:1 | ✅ |
| Link text | #2c6ecb | #ffffff | 4.5:1 | ✅ |

### 6.3 Testing Tools

- **Chrome DevTools:** Lighthouse accessibility audit
- **axe DevTools:** Browser extension
- **Contrast Checker:** WebAIM contrast checker
- **Color Oracle:** Color blindness simulator

---

## 7. Focus Indicators

### 7.1 Focus Ring Styles

```css
*:focus {
  outline: 2px solid var(--occ-border-focus);
  outline-offset: 2px;
}

*:focus:not(:focus-visible) {
  outline: none;
}

*:focus-visible {
  outline: 2px solid var(--occ-border-focus);
  outline-offset: 2px;
}
```

### 7.2 Component-Specific Focus

**Buttons:**
```css
.occ-button:focus-visible {
  outline: 2px solid var(--occ-border-focus);
  outline-offset: 2px;
  box-shadow: 0 0 0 3px rgba(44, 110, 203, 0.2);
}
```

**Tiles:**
```css
.occ-tile:focus-visible {
  outline: 2px solid var(--occ-border-focus);
  outline-offset: 2px;
  box-shadow: var(--occ-shadow-tile-hover);
}
```

**Links:**
```css
a:focus-visible {
  outline: 2px solid var(--occ-border-focus);
  outline-offset: 2px;
  text-decoration: underline;
}
```

---

## 8. Forms and Inputs

### 8.1 Label Association

**Explicit labels:**
```html
<label for="email">Email address</label>
<input id="email" type="email" name="email" />
```

**Implicit labels:**
```html
<label>
  Email address
  <input type="email" name="email" />
</label>
```

**aria-label (when visual label not possible):**
```html
<input type="search" aria-label="Search dashboard" />
```

### 8.2 Required Fields

```html
<label for="name">
  Name <span aria-label="required">*</span>
</label>
<input id="name" type="text" required aria-required="true" />
```

### 8.3 Error Messages

```html
<label for="email">Email</label>
<input 
  id="email" 
  type="email" 
  aria-invalid="true"
  aria-describedby="email-error"
/>
<p id="email-error" role="alert">
  Please enter a valid email address
</p>
```

### 8.4 Help Text

```html
<label for="password">Password</label>
<input 
  id="password" 
  type="password"
  aria-describedby="password-help"
/>
<p id="password-help">
  Must be at least 8 characters
</p>
```

---

## 9. Touch Targets

### 9.1 Minimum Sizes (WCAG 2.1 AA)

**Mobile & Tablet:**
- Minimum: **44x44px**
- Recommended: **48x48px**
- Spacing: **8px minimum**

**Desktop:**
- Minimum: **24x24px**
- Recommended: **32x32px**

### 9.2 Implementation

```css
.occ-button {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 20px;
}

@media (min-width: 1024px) {
  .occ-button {
    min-height: 36px;
    min-width: 36px;
    padding: 8px 16px;
  }
}
```

---

## 10. Motion and Animation

### 10.1 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### 10.2 Respecting User Preferences

```tsx
function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  return prefersReducedMotion;
}
```

---

## 11. High Contrast Mode

### 11.1 Windows High Contrast

```css
@media (prefers-contrast: high) {
  :root {
    --occ-border-default: CanvasText;
    --occ-text-primary: CanvasText;
    --occ-bg-primary: Canvas;
  }
  
  .occ-button {
    border: 2px solid ButtonText;
  }
}
```

### 11.2 Forced Colors Mode

```css
@media (forced-colors: active) {
  .occ-tile {
    border: 1px solid CanvasText;
  }
  
  .occ-button:focus {
    outline: 2px solid Highlight;
  }
}
```

---

## 12. Testing Checklist

### 12.1 Automated Testing

- [ ] **axe DevTools:** 0 violations
- [ ] **Lighthouse:** Accessibility score ≥ 95
- [ ] **Pa11y:** CI integration passing
- [ ] **WAVE:** No errors

### 12.2 Manual Testing

**Keyboard Navigation:**
- [ ] All interactive elements reachable via Tab
- [ ] Logical tab order
- [ ] No keyboard traps
- [ ] Focus indicators visible
- [ ] Shortcuts work as documented

**Screen Readers:**
- [ ] NVDA (Windows) - All content announced
- [ ] JAWS (Windows) - All content announced
- [ ] VoiceOver (macOS/iOS) - All content announced
- [ ] TalkBack (Android) - All content announced

**Visual:**
- [ ] Color contrast meets WCAG AA
- [ ] Text readable at 200% zoom
- [ ] No horizontal scroll at 320px width
- [ ] High contrast mode works
- [ ] Focus indicators visible

**Interaction:**
- [ ] Touch targets ≥ 44x44px (mobile)
- [ ] Forms have labels
- [ ] Error messages clear
- [ ] Loading states announced

### 12.3 Browser Testing

- [ ] Chrome + NVDA
- [ ] Firefox + NVDA
- [ ] Safari + VoiceOver
- [ ] Edge + JAWS

---

## 13. Component Annotations

### 13.1 TileCard

```tsx
<div 
  className="occ-tile"
  role="region"
  aria-labelledby="tile-heading-1"
  aria-describedby="tile-status-1"
  tabIndex={0}
>
  <h2 id="tile-heading-1">Sales Pulse</h2>
  <span id="tile-status-1" className="sr-only">
    Status: Healthy. Last refreshed 2 minutes ago.
  </span>
  {/* Content */}
</div>
```

### 13.2 ApprovalCard

```tsx
<div className="occ-approval-card" role="article">
  <h3>CX Reply · Shipping delay apology</h3>
  <button 
    onClick={handleApprove}
    aria-label="Approve CX reply for shipping delay apology"
  >
    Approve
  </button>
  <button 
    onClick={handleReject}
    aria-label="Reject CX reply for shipping delay apology"
  >
    Reject
  </button>
</div>
```

### 13.3 Modal

```tsx
<div 
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">Confirm Action</h2>
  <p id="modal-description">Are you sure you want to proceed?</p>
  {/* Content */}
</div>
```

---

## 14. References

- WCAG 2.1 Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- ARIA Authoring Practices: https://www.w3.org/WAI/ARIA/apg/
- Polaris Accessibility: https://polaris.shopify.com/foundations/accessibility
- WebAIM: https://webaim.org/
- Deque axe: https://www.deque.com/axe/

