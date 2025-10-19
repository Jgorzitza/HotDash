# QA Accessibility Audit Checklist — WCAG 2.1 AA

**Owner:** Designer  
**For:** QA Team  
**Issue:** #107  
**Date:** 2025-10-19  
**Purpose:** Support QA accessibility testing with recommended fixes for common violations

---

## 1. Keyboard Navigation (WCAG 2.1.1)

### 1.1 Focus Management

| Check ID | Requirement                        | Test Method                      | Common Violations                         | Designer Recommendation                      |
| -------- | ---------------------------------- | -------------------------------- | ----------------------------------------- | -------------------------------------------- |
| KB-01    | All interactive elements focusable | Tab through entire page          | `<div onClick>` without `tabIndex`        | Add `tabIndex="0"` + `role="button"`         |
| KB-02    | Focus order follows DOM order      | Tab and verify sequence          | Floating elements disrupt order           | Use CSS positioning, not DOM reordering      |
| KB-03    | No keyboard traps                  | Tab to every element, can escape | Modal traps focus                         | Implement focus trap with Escape key exit    |
| KB-04    | Focus visible at all times         | Navigate with keyboard only      | `:focus` style missing or `outline: none` | Add visible focus indicator (2px solid blue) |

**Code Example (Good):**

```jsx
// Clickable div with keyboard support
<div
  role="button"
  tabIndex="0"
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      handleClick(e);
    }
  }}
>
  Click me
</div>
```

**Code Example (Bad):**

```jsx
// Missing keyboard support
<div onClick={handleClick}>Click me</div>
```

### 1.2 Interactive Element Patterns

| Element Type                  | Required Attributes                                  | Example Fix                                 |
| ----------------------------- | ---------------------------------------------------- | ------------------------------------------- |
| Clickable `<span>` or `<div>` | `role="button"`, `tabIndex="0"`, `onKeyDown` handler | See KB-01 example above                     |
| Anchor without `href`         | Replace with `<button>` or add valid `href`          | Use `<button type="button">` for actions    |
| Custom checkbox               | `role="checkbox"`, `aria-checked`, `tabIndex="0"`    | Use native `<input type="checkbox">`        |
| Custom select                 | `role="combobox"`, ARIA attributes                   | Use native `<select>` or Polaris `<Select>` |

---

## 2. Screen Reader Support (WCAG 1.3.1, 4.1.2)

### 2.1 ARIA Labels

| Check ID | Requirement                                    | Test Method                   | Common Violations                | Designer Recommendation                               |
| -------- | ---------------------------------------------- | ----------------------------- | -------------------------------- | ----------------------------------------------------- |
| SR-01    | All interactive elements have accessible names | Inspect ARIA tree in DevTools | Button with icon only, no label  | Add `aria-label="Action name"`                        |
| SR-02    | Form inputs have labels                        | Check label association       | Input without `<label>`          | Wrap in `<label>` or add `aria-labelledby`            |
| SR-03    | Images have alt text                           | Check `alt` attribute         | `<img>` without `alt`            | Add descriptive `alt` text or `alt=""` for decorative |
| SR-04    | Live regions announce updates                  | Test with NVDA/JAWS           | Dynamic content changes silently | Add `aria-live="polite"` or `role="alert"`            |

**Code Example (Good):**

```jsx
// Button with icon and accessible name
<button aria-label="Close drawer">
  <Icon type="x" />
</button>

// Form input with label
<label htmlFor="email">Email Address</label>
<input id="email" type="email" />

// Live region for updates
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>
```

**Code Example (Bad):**

```jsx
// Icon-only button, no label
<button><Icon type="x" /></button>

// Input without label
<input type="email" placeholder="Email" />

// Dynamic content with no announcement
<div>{statusMessage}</div>
```

### 2.2 Semantic HTML

| Element                | Semantic Alternative | Why                                                 |
| ---------------------- | -------------------- | --------------------------------------------------- |
| `<div role="button">`  | `<button>`           | Native keyboard support, screen reader expectations |
| `<div role="heading">` | `<h1>` to `<h6>`     | Proper document outline, navigation landmarks       |
| `<span role="link">`   | `<a href="...">`     | Native focus, keyboard activation                   |
| `<div role="list">`    | `<ul>` or `<ol>`     | Screen reader list navigation shortcuts             |

---

## 3. Color Contrast (WCAG 1.4.3, 1.4.11)

### 3.1 Text Contrast

| Check ID | Requirement                      | Minimum Ratio | Test Method                      | Designer Recommendation                 |
| -------- | -------------------------------- | ------------- | -------------------------------- | --------------------------------------- |
| CC-01    | Normal text (< 18px)             | 4.5:1         | Use WebAIM Contrast Checker      | Darken text color or lighten background |
| CC-02    | Large text (≥ 18px or 14px bold) | 3:1           | Use WebAIM Contrast Checker      | Same as CC-01                           |
| CC-03    | UI components (buttons, inputs)  | 3:1           | Check border/background contrast | Add visible border or increase contrast |
| CC-04    | Graphical objects                | 3:1           | Check icon/chart contrast        | Use Polaris design tokens               |

**Verified Ratios (from design-system-guide.md):**

- Healthy status: 4.8:1 ✅
- Attention status: 4.6:1 ✅
- Unconfigured status: 4.5:1 ✅
- Body text: 16.6:1 ✅

### 3.2 Non-Color Indicators

| Check ID | Requirement                        | Common Violations             | Designer Recommendation                     |
| -------- | ---------------------------------- | ----------------------------- | ------------------------------------------- |
| CC-05    | Status not conveyed by color alone | Red/green status with no icon | Add icon or text label ("Error", "Success") |
| CC-06    | Form validation not color-only     | Red border on invalid input   | Add error message text + icon               |
| CC-07    | Links distinguishable from text    | Blue links with no underline  | Add underline or bold weight                |

---

## 4. Form Accessibility (WCAG 3.3.1, 3.3.2, 3.3.3)

### 4.1 Input Labels & Instructions

| Check ID | Requirement                | Test Method                                   | Common Violations               | Designer Recommendation                        |
| -------- | -------------------------- | --------------------------------------------- | ------------------------------- | ---------------------------------------------- |
| FA-01    | Every input has a label    | Check `<label>` or `aria-labelledby`          | Placeholder as label            | Add visible `<label>` element                  |
| FA-02    | Required fields indicated  | Check `required` attribute + visual indicator | Asterisk without text           | Add `aria-required="true"` + "(required)" text |
| FA-03    | Input purpose identified   | Check `autocomplete` attribute                | Missing `autocomplete`          | Add `autocomplete="email"`, etc.               |
| FA-04    | Error messages descriptive | Trigger validation error                      | "Invalid input" generic message | "Email must include @ symbol"                  |

**Code Example (Good):**

```jsx
// Accessible form field
<div>
  <label htmlFor="email">
    Email Address <span aria-label="required">(required)</span>
  </label>
  <input
    id="email"
    type="email"
    required
    aria-required="true"
    aria-describedby="email-error"
    autocomplete="email"
  />
  <div id="email-error" role="alert">
    {error && "Please enter a valid email address with @ symbol"}
  </div>
</div>
```

### 4.2 Error Handling

| Pattern            | Implementation                                           | Designer Notes                                |
| ------------------ | -------------------------------------------------------- | --------------------------------------------- |
| Inline errors      | `aria-describedby` linking to error text, `role="alert"` | Polaris `TextField` component handles this    |
| Error summary      | List of errors at top of form, focusable                 | Use `role="alert"` or `aria-live="assertive"` |
| Field highlighting | Red border + icon + text                                 | Don't rely on color alone                     |

---

## 5. Responsive & Zoom (WCAG 1.4.4, 1.4.10)

### 5.1 Text Resize

| Check ID | Requirement                          | Test Method           | Common Violations          | Designer Recommendation      |
| -------- | ------------------------------------ | --------------------- | -------------------------- | ---------------------------- |
| RZ-01    | Text resizable to 200%               | Zoom browser to 200%  | Fixed pixel font sizes     | Use `rem` or `em` units      |
| RZ-02    | No horizontal scrolling at 200% zoom | Zoom and check scroll | Fixed-width containers     | Use `max-width` + `%` widths |
| RZ-03    | Content reflows at 320px width       | Set viewport to 320px | Horizontal scroll required | Stack columns, wrap text     |

### 5.2 Responsive Annotations (from dashboard-tiles.md)

| Tile              | Desktop (≥1280px)         | Tablet (768-1279px)   | Accessibility Notes                               |
| ----------------- | ------------------------- | --------------------- | ------------------------------------------------- |
| Ops Pulse         | Two-column grid           | Single column stack   | Preserve heading order (Activation before SLA)    |
| Sales Pulse       | Revenue left, lists right | All stack vertically  | List headers use `<h3>` for landmarks             |
| Inventory Heatmap | Table full width          | Legend below table    | Scroll container needs `role="region"` with label |
| CX Escalations    | Inline CTA                | CTA below description | Queue list as ordered list for priority           |

---

## 6. Heading Structure (WCAG 1.3.1)

### 6.1 Heading Hierarchy

| Check ID | Requirement               | Test Method             | Common Violations       | Designer Recommendation                                    |
| -------- | ------------------------- | ----------------------- | ----------------------- | ---------------------------------------------------------- |
| HS-01    | Single `<h1>` per page    | Inspect heading outline | Multiple `<h1>` or none | Page title uses `<h1>`, tiles use `<h2>`                   |
| HS-02    | No skipped heading levels | Check h1→h2→h3 order    | h2→h4 skip              | Don't skip levels, use CSS for visual size                 |
| HS-03    | Headings describe content | Read headings only      | Generic "Section 1"     | Use descriptive headings ("Sales Pulse", "CX Escalations") |

**Heading Structure for Dashboard:**

```
<h1>Hot Rod AN Control Center</h1>
  <h2>Ops Pulse</h2>
  <h2>Sales Pulse</h2>
    <h3>Top SKUs</h3>
    <h3>Pending Fulfillment</h3>
  <h2>Inventory Heatmap</h2>
  <h2>CX Escalations</h2>
  <h2>Idea Pool</h2>
```

---

## 7. Microcopy Accessibility Patterns

### 7.1 Approvals Drawer (from approvals_microcopy.md)

| Element      | Accessibility Requirement                 | Implementation                            |
| ------------ | ----------------------------------------- | ----------------------------------------- |
| Drawer title | Use `<h2>` for title                      | Screen readers announce as heading        |
| Status badge | Include `aria-label` if icon-only         | "Status: Draft" readable by screen reader |
| Tabs         | `role="tablist"`, `aria-selected`         | Polaris Tab component handles this        |
| Buttons      | Descriptive labels, no "Click here"       | "Approve", "Reject", "Request changes"    |
| Error banner | `role="alert"` or `aria-live="assertive"` | Screen reader announces immediately       |

### 7.2 CX Escalation Modal

| Element              | Accessibility Requirement         | Implementation                                |
| -------------------- | --------------------------------- | --------------------------------------------- |
| Modal title          | "CX Escalation — [Customer Name]" | Use `<h2>`, announced by screen reader        |
| Conversation history | Ordered list or `role="log"`      | Maintains chronological order                 |
| Suggested reply      | `<label>` for textarea            | "Reply text" label                            |
| CTAs                 | Descriptive labels                | "Approve & send", "Escalate", "Mark resolved" |

---

## 8. Testing Tools & Workflow

### 8.1 Automated Tools

| Tool            | Purpose                     | Command           | Pass Criteria           |
| --------------- | --------------------------- | ----------------- | ----------------------- |
| axe DevTools    | WCAG violations             | Browser extension | 0 violations            |
| Lighthouse      | Accessibility score         | Chrome DevTools   | Score ≥ 95              |
| WAVE            | Visual accessibility errors | Browser extension | 0 errors, review alerts |
| ESLint jsx-a11y | Code-level checks           | `npm run lint`    | 0 jsx-a11y errors       |

### 8.2 Manual Testing

| Test                | Method                              | Tools                 | Pass Criteria                               |
| ------------------- | ----------------------------------- | --------------------- | ------------------------------------------- |
| Keyboard navigation | Tab through entire UI               | Keyboard only         | All functions accessible, focus visible     |
| Screen reader       | Navigate with assistive tech        | NVDA, JAWS, VoiceOver | All content announced, landmarks navigable  |
| Zoom & reflow       | Resize browser to 200%, 320px width | Browser zoom          | No content loss, no horizontal scroll       |
| High contrast       | Enable OS high contrast mode        | Windows High Contrast | All UI elements visible and distinguishable |

### 8.3 Checklist for QA

Before signing off on accessibility:

- [ ] Run `npm run lint` — 0 jsx-a11y errors
- [ ] Run axe DevTools — 0 violations
- [ ] Keyboard-only navigation — all functions accessible
- [ ] Screen reader test (NVDA or VoiceOver) — all content announced
- [ ] Color contrast check — all ratios ≥ 4.5:1 (text) or 3:1 (UI components)
- [ ] Zoom to 200% — no content loss
- [ ] Responsive to 320px width — no horizontal scroll
- [ ] Heading outline logical — no skipped levels
- [ ] Form labels present — every input has accessible name
- [ ] Focus indicators visible — 2px solid outline

---

## 9. Common Fixes Reference

### 9.1 Quick Fix Patterns (from jsx-a11y patterns)

| Violation                                | Quick Fix                                        | Code Example                                               |
| ---------------------------------------- | ------------------------------------------------ | ---------------------------------------------------------- |
| `<div onClick>` without keyboard support | Add `role="button"`, `tabIndex="0"`, `onKeyDown` | See KB-01 example                                          |
| Icon-only button                         | Add `aria-label`                                 | `<button aria-label="Close"><Icon type="x" /></button>`    |
| Input without label                      | Wrap in `<label>`                                | `<label>Email <input type="email" /></label>`              |
| Anchor without `href`                    | Replace with `<button>`                          | `<button onClick={action}>Click</button>`                  |
| Missing alt text                         | Add descriptive `alt`                            | `<img src="..." alt="Product thumbnail" />`                |
| Color-only status                        | Add icon + text                                  | `<Badge tone="critical" icon="alert-circle">Error</Badge>` |

### 9.2 Mouse Events Need Keyboard Events

| Mouse Event   | Required Keyboard Event   | Example                                                   |
| ------------- | ------------------------- | --------------------------------------------------------- |
| `onMouseOver` | `onFocus`                 | `<div onMouseOver={handleHover} onFocus={handleFocus} />` |
| `onMouseOut`  | `onBlur`                  | `<div onMouseOut={handleLeave} onBlur={handleBlur} />`    |
| `onClick`     | `onKeyDown` (Enter/Space) | See KB-01 example                                         |

---

## 10. Sign-off Process

### 10.1 Designer Review After QA Testing

When QA provides accessibility audit report:

1. **Review violations:** Categorize by severity (A, AA, AAA)
2. **Recommend fixes:** Reference this checklist for solutions
3. **Update design specs:** Document approved patterns
4. **Re-test:** Verify fixes with QA

### 10.2 Acceptance Criteria

For accessibility sign-off on Issue #107:

- [ ] All WCAG 2.1 AA violations resolved (A + AA levels)
- [ ] Automated tools show 0 critical errors (axe, WAVE, Lighthouse ≥95)
- [ ] Manual keyboard navigation 100% functional
- [ ] Screen reader testing completed (at least 1 screen reader)
- [ ] Designer reviewed and signed off on fixes
- [ ] Documentation updated with patterns used

---

## Change Log

- **2025-10-19:** Initial QA accessibility audit checklist created by Designer for Issue #107, referencing jsx-a11y patterns and WCAG 2.1 guidelines
