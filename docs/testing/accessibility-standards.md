# Accessibility Standards & Testing Guide

**Version**: 1.0  
**Date**: 2025-10-11  
**Owner**: QA Team  
**Compliance Target**: WCAG 2.1 Level AA

---

## Executive Summary

HotDash is committed to meeting WCAG 2.1 Level AA accessibility standards to ensure the operator control center is usable by all team members, including those using assistive technologies.

**Automated Testing**: axe-core integration via Playwright  
**Manual Testing**: Quarterly accessibility audits  
**Target**: Zero Level AA violations

---

## WCAG 2.1 Level AA Requirements

### 1. Perceivable
- **1.1 Text Alternatives**: All non-text content has text alternatives
- **1.2 Time-based Media**: Captions and alternatives for audio/video
- **1.3 Adaptable**: Content can be presented in different ways
- **1.4 Distinguishable**: Easy to see and hear (color contrast, text sizing)

### 2. Operable  
- **2.1 Keyboard Accessible**: All functionality available via keyboard
- **2.2 Enough Time**: Users have enough time to read and use content
- **2.3 Seizures**: No content that causes seizures
- **2.4 Navigable**: Ways to help users navigate and find content
- **2.5 Input Modalities**: Easier to operate functionality through various inputs

### 3. Understandable
- **3.1 Readable**: Text content is readable and understandable
- **3.2 Predictable**: Web pages appear and operate in predictable ways
- **3.3 Input Assistance**: Help users avoid and correct mistakes

### 4. Robust
- **4.1 Compatible**: Maximize compatibility with current and future tools

---

## Implementation Checklist

### Color & Contrast
- [ ] Text has 4.5:1 contrast ratio (normal text)
- [ ] Large text has 3:1 contrast ratio (18pt+ or 14pt+ bold)
- [ ] UI components have 3:1 contrast ratio
- [ ] Do not use color alone to convey information
- [ ] Focus indicators have sufficient contrast

### Keyboard Navigation
- [ ] All interactive elements are keyboard accessible
- [ ] Tab order is logical and predictable
- [ ] Focus indicators are visible on all focusable elements
- [ ] Skip to main content link present
- [ ] No keyboard traps
- [ ] Keyboard shortcuts documented

### Screen Reader Support
- [ ] All images have alt text
- [ ] Form inputs have associated labels
- [ ] Buttons have descriptive labels
- [ ] Links have descriptive text (no "click here")
- [ ] ARIA labels for icon-only buttons
- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] Landmark regions defined (header, nav, main, footer)
- [ ] Dynamic content changes announced (aria-live)

### Forms
- [ ] All inputs have labels (visible or aria-label)
- [ ] Required fields indicated
- [ ] Error messages associated with fields (aria-describedby)
- [ ] Error messages are clear and actionable
- [ ] Success confirmations announced

### Modals & Overlays
- [ ] Focus trapped within modal
- [ ] Focus returns to trigger element on close
- [ ] Modal has role="dialog"
- [ ] Modal has aria-modal="true"
- [ ] Modal has aria-labelledby and aria-describedby
- [ ] ESC key closes modal
- [ ] Background content inert (aria-hidden or disabled)

### Notifications
- [ ] Status messages use aria-live="polite"
- [ ] Urgent alerts use aria-live="assertive"
- [ ] Notifications dismissible
- [ ] Timeout notifications have sufficient time

---

## axe-core Configuration

### File: `.axerc.json`
```json
{
  "rules": {
    "color-contrast": {
      "enabled": true
    },
    "html-has-lang": {
      "enabled": true
    },
    "landmark-one-main": {
      "enabled": true
    },
    "page-has-heading-one": {
      "enabled": true
    },
    "region": {
      "enabled": true
    }
  },
  "tags": ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
  "reporter": "v2",
  "checks": {
    "color-contrast": {
      "options": {
        "noScroll": true
      }
    }
  }
}
```

---

## NPM Scripts

```json
{
  "test:a11y": "playwright test tests/e2e/accessibility.spec.ts",
  "test:a11y:report": "playwright test tests/e2e/accessibility.spec.ts --reporter=html",
  "test:ci": "npm run test:unit && npm run test:e2e && npm run test:a11y && npm run test:lighthouse"
}
```

---

## Testing Workflow

### Automated Testing (CI)
1. Run on every PR
2. Test all application routes
3. Generate accessibility report
4. Fail build if violations found
5. Comment on PR with violation details

### Manual Testing (Quarterly)
1. Screen reader testing (NVDA, JAWS, VoiceOver)
2. Keyboard-only navigation testing
3. High contrast mode testing
4. Browser zoom testing (200%, 400%)
5. Mobile screen reader testing

### Issue Prioritization

| Impact | Example | Fix Timeline |
|--------|---------|--------------|
| Critical | Cannot use with keyboard/screen reader | Immediate (24h) |
| Serious | Difficult to use with assistive tech | 1 week |
| Moderate | Some accessibility issues | 2 weeks |
| Minor | Enhancement opportunities | Next sprint |

---

## Accessibility Resources

### Tools
- **axe DevTools**: Browser extension for manual testing
- **WAVE**: Web accessibility evaluation tool
- **Lighthouse**: Automated accessibility audits
- **Pa11y**: Command-line accessibility testing

### Screen Readers
- **NVDA** (Windows): Free, open-source
- **JAWS** (Windows): Industry standard
- **VoiceOver** (macOS/iOS): Built-in
- **TalkBack** (Android): Built-in

### Testing Guides
- [WebAIM WCAG 2 Checklist](https://webaim.org/standards/wcag/checklist)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
- [axe-core Rule Descriptions](https://dequeuniversity.com/rules/axe/)

---

## Common Violations & Fixes

### Missing Alternative Text
**Violation**: `<img src="logo.png">`  
**Fix**: `<img src="logo.png" alt="HotDash Logo">`

### Poor Color Contrast
**Violation**: Gray text (#888) on white background (2.9:1)  
**Fix**: Darker gray (#595959) for 4.5:1 contrast

### Missing Form Labels
**Violation**: `<input type="text" />`  
**Fix**: `<label for="name">Name</label><input id="name" type="text" />`

### Non-Descriptive Link Text
**Violation**: `<a href="/help">Click here</a>`  
**Fix**: `<a href="/help">View help documentation</a>`

### Missing ARIA Labels on Icon Buttons
**Violation**: `<button><IconTrash /></button>`  
**Fix**: `<button aria-label="Delete item"><IconTrash /></button>`

### Improper Heading Hierarchy
**Violation**: h1 → h3 (skipping h2)  
**Fix**: h1 → h2 → h3 (logical order)

---

## Accessibility Statement

HotDash aims to conform to WCAG 2.1 Level AA. We are committed to ensuring our operator control center is accessible to all users, including those using:

- Screen readers (NVDA, JAWS, VoiceOver)
- Keyboard-only navigation
- Voice control software
- High contrast modes
- Browser zoom up to 200%

If you encounter any accessibility barriers, please contact: qa@hotdash.com

**Last Reviewed**: 2025-10-11  
**Next Review**: 2026-01-11

---

**End of Accessibility Standards Guide**

**Implementation**: Task F Complete
**CI Integration**: GitHub Actions workflow configured
**Target**: Zero WCAG 2.1 AA violations on all routes

