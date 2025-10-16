# Typography Scale, Chart Styles, Forms Validation, UX Copy Guide

**File:** `docs/design/typography-charts-forms-copy.md`  
**Owner:** Designer  
**Version:** 1.0  
**Date:** 2025-10-15  
**Status:** Complete  
**Purpose:** Typography scale & rhythm, chart styles, forms validation, UX copy style guide

---

## 1. Typography Scale & Rhythm

### 1.1 Type Scale

| Level | Size | Weight | Line Height | Use Case |
|-------|------|--------|-------------|----------|
| **Display** | 2rem (32px) | 700 | 1.25 | Page titles |
| **Heading 1** | 1.5rem (24px) | 600 | 1.25 | Section headings |
| **Heading 2** | 1.15rem (18.4px) | 600 | 1.25 | Tile headings, card titles |
| **Heading 3** | 1rem (16px) | 600 | 1.5 | Subsection headings |
| **Body Large** | 1.15rem (18.4px) | 400 | 1.5 | Emphasis, lead paragraphs |
| **Body** | 1rem (16px) | 400 | 1.5 | Body text, descriptions |
| **Body Small** | 0.85rem (13.6px) | 400 | 1.5 | Meta text, timestamps |
| **Caption** | 0.75rem (12px) | 400 | 1.5 | Fine print, labels |

### 1.2 Vertical Rhythm

**Base unit:** 4px (0.25rem)

**Spacing scale:**
- 1 unit = 4px
- 2 units = 8px
- 3 units = 12px
- 4 units = 16px
- 5 units = 20px
- 6 units = 24px
- 8 units = 32px

**Heading margins:**
```css
h1 { margin-bottom: 24px; } /* 6 units */
h2 { margin-bottom: 16px; } /* 4 units */
h3 { margin-bottom: 12px; } /* 3 units */
p { margin-bottom: 16px; } /* 4 units */
```

### 1.3 Polaris Text Variants

```tsx
<Text variant="headingXl">Display</Text>
<Text variant="headingLg">Heading 1</Text>
<Text variant="headingMd">Heading 2</Text>
<Text variant="headingSm">Heading 3</Text>
<Text variant="bodyLg">Body Large</Text>
<Text variant="bodyMd">Body</Text>
<Text variant="bodySm">Body Small</Text>
```

### 1.4 Text Tones

```tsx
<Text tone="subdued">Secondary text</Text>
<Text tone="success">Success message</Text>
<Text tone="critical">Error message</Text>
<Text tone="warning">Warning message</Text>
```

---

## 2. Chart Styles

### 2.1 Sparkline Charts

**Purpose:** Inline trend indicators

**Dimensions:**
- Width: 60-100px
- Height: 20-30px
- Stroke width: 2px

**Colors:**
- Positive trend: Green (`var(--occ-text-success)`)
- Negative trend: Red (`var(--occ-text-critical)`)
- Neutral trend: Gray (`var(--occ-text-secondary)`)

**Implementation:**
```tsx
<svg width="80" height="24" viewBox="0 0 80 24">
  <polyline
    points="0,20 20,15 40,18 60,10 80,12"
    fill="none"
    stroke="var(--occ-text-success)"
    strokeWidth="2"
  />
</svg>
```

### 2.2 Line Charts

**Purpose:** Time series data

**Dimensions:**
- Min width: 300px
- Min height: 200px
- Responsive: 100% width

**Colors:**
- Primary line: Blue (`var(--occ-button-primary-bg)`)
- Secondary line: Gray (`var(--occ-text-secondary)`)
- Grid lines: Light gray (`var(--occ-border-default)`)

**Axes:**
- X-axis: Time (dates, hours)
- Y-axis: Values (currency, count)
- Labels: 12px, gray

**Tooltip:**
```tsx
<div className="chart-tooltip">
  <Text variant="bodySm" tone="subdued">Oct 15, 2025</Text>
  <Text variant="bodyMd">$1,250.50</Text>
</div>
```

### 2.3 Bar Charts

**Purpose:** Comparison data

**Dimensions:**
- Bar width: 20-40px
- Bar spacing: 8-16px
- Min height: 200px

**Colors:**
- Positive: Green
- Negative: Red
- Neutral: Blue

**Horizontal bars:**
```tsx
<div className="bar-chart">
  {data.map(item => (
    <div key={item.id} className="bar-row">
      <Text variant="bodySm">{item.label}</Text>
      <div 
        className="bar" 
        style={{ width: `${item.value}%` }}
      />
      <Text variant="bodySm">{item.value}</Text>
    </div>
  ))}
</div>
```

### 2.4 Accessibility

**Alt text:**
```tsx
<svg aria-label="Sales trend showing 15% increase over last month">
  {/* Chart content */}
</svg>
```

**Data table fallback:**
```tsx
<details>
  <summary>View data table</summary>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Revenue</th>
      </tr>
    </thead>
    <tbody>
      {data.map(row => (
        <tr key={row.date}>
          <td>{row.date}</td>
          <td>{row.revenue}</td>
        </tr>
      ))}
    </tbody>
  </table>
</details>
```

---

## 3. Forms Validation Styles

### 3.1 Field States

**Default:**
```tsx
<TextField
  label="Email"
  type="email"
  value={email}
  onChange={setEmail}
/>
```

**Error:**
```tsx
<TextField
  label="Email"
  type="email"
  value={email}
  onChange={setEmail}
  error="Please enter a valid email address"
/>
```

**Success (optional):**
```tsx
<TextField
  label="Email"
  type="email"
  value={email}
  onChange={setEmail}
  helpText="Email verified ✓"
/>
```

### 3.2 Validation Patterns

**Required field:**
```tsx
<TextField
  label="Name"
  value={name}
  onChange={setName}
  required
  error={!name && 'Name is required'}
/>
```

**Email validation:**
```tsx
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const emailError = email && !emailRegex.test(email) 
  ? 'Please enter a valid email address' 
  : undefined;

<TextField
  label="Email"
  type="email"
  value={email}
  onChange={setEmail}
  error={emailError}
/>
```

**Min/Max length:**
```tsx
const passwordError = password && password.length < 8
  ? 'Password must be at least 8 characters'
  : undefined;

<TextField
  label="Password"
  type="password"
  value={password}
  onChange={setPassword}
  error={passwordError}
  helpText="Must be at least 8 characters"
/>
```

### 3.3 Inline Validation

**Validate on blur:**
```tsx
<TextField
  label="Email"
  value={email}
  onChange={setEmail}
  onBlur={() => validateEmail(email)}
  error={emailError}
/>
```

**Validate on submit:**
```tsx
function handleSubmit(e) {
  e.preventDefault();
  
  const errors = {};
  if (!name) errors.name = 'Name is required';
  if (!email) errors.email = 'Email is required';
  
  if (Object.keys(errors).length > 0) {
    setErrors(errors);
    return;
  }
  
  // Submit form
}
```

### 3.4 Error Summary

**Top of form:**
```tsx
{Object.keys(errors).length > 0 && (
  <Banner tone="critical">
    <p>Please fix the following errors:</p>
    <ul>
      {Object.entries(errors).map(([field, error]) => (
        <li key={field}>{error}</li>
      ))}
    </ul>
  </Banner>
)}
```

---

## 4. UX Copy Style Guide

### 4.1 Voice & Tone

**Voice (Consistent):**
- Professional
- Helpful
- Clear
- Empathetic

**Tone (Varies by context):**
- **Success:** Positive, encouraging
- **Error:** Empathetic, solution-focused
- **Warning:** Cautious, informative
- **Info:** Neutral, educational

### 4.2 Writing Principles

**1. Be Clear**
- Use simple language
- Avoid jargon
- Be specific

**Good:** "Unable to connect. Check your network connection."  
**Bad:** "Error 500. Network timeout exception."

**2. Be Concise**
- Remove unnecessary words
- Get to the point
- Use active voice

**Good:** "Approve this action"  
**Bad:** "You may proceed to approve this action if you wish"

**3. Be Helpful**
- Explain what happened
- Provide next steps
- Offer solutions

**Good:** "Unable to save. Check your connection and try again."  
**Bad:** "Save failed."

**4. Be Empathetic**
- Acknowledge user frustration
- Don't blame the user
- Offer support

**Good:** "We're sorry, something went wrong. Please try again."  
**Bad:** "You caused an error."

### 4.3 Button Labels

**Action buttons:**
- Use verbs: "Save", "Delete", "Approve", "Reject"
- Be specific: "Save changes" (not just "Save")
- Avoid "OK", "Yes", "No" (use specific actions)

**Good:**
- "Approve action"
- "Reject and notify agent"
- "Save and continue"

**Bad:**
- "OK"
- "Submit"
- "Confirm"

### 4.4 Error Messages

**Format:** `[What happened] [Why it happened] [What to do]`

**Examples:**
- "Unable to connect. Check your network connection and try again."
- "Session expired. Please log in again to continue."
- "Invalid email address. Please check and try again."

### 4.5 Success Messages

**Format:** `[What succeeded] [Optional: Next step]`

**Examples:**
- "Action approved successfully"
- "Changes saved"
- "Email sent. Check your inbox."

### 4.6 Empty States

**Format:** `[Friendly heading] [Explanation] [Optional: Action]`

**Examples:**
- "No orders yet. Orders will appear here when customers make purchases."
- "All clear! No pending approvals right now."
- "No low stock alerts. Your inventory levels are healthy."

### 4.7 Capitalization

**Sentence case (preferred):**
- "Approve this action"
- "View details"
- "Request changes"

**Title case (avoid):**
- "Approve This Action"
- "View Details"

**ALL CAPS (avoid):**
- "APPROVE"
- "ERROR"

**Exception:** Acronyms (API, CX, SEO, SLA)

### 4.8 Punctuation

**Periods:**
- Use in full sentences
- Omit in button labels
- Omit in headings

**Exclamation points:**
- Use sparingly
- Only for success/celebration
- Never for errors

**Question marks:**
- Use in confirmation dialogs
- "Delete this item?"
- "Are you sure?"

---

## 5. Implementation Checklist

### 5.1 Typography
- [ ] Type scale implemented
- [ ] Vertical rhythm consistent
- [ ] Polaris Text variants used
- [ ] Line heights correct
- [ ] Heading hierarchy logical

### 5.2 Charts
- [ ] Sparklines implemented
- [ ] Line charts implemented
- [ ] Bar charts implemented
- [ ] Colors accessible (WCAG AA)
- [ ] Alt text provided
- [ ] Data table fallback

### 5.3 Forms
- [ ] All fields have labels
- [ ] Required fields marked
- [ ] Validation on blur/submit
- [ ] Error messages clear
- [ ] Error summary at top
- [ ] Success feedback provided

### 5.4 Copy
- [ ] Voice consistent
- [ ] Tone appropriate
- [ ] Button labels specific
- [ ] Error messages helpful
- [ ] Success messages positive
- [ ] Empty states friendly
- [ ] Sentence case used
- [ ] Punctuation correct

---

## 6. Testing Checklist

### 6.1 Typography
- [ ] All text readable
- [ ] Hierarchy clear
- [ ] Line heights comfortable
- [ ] No orphans/widows
- [ ] Responsive scaling

### 6.2 Charts
- [ ] Data accurate
- [ ] Colors distinguishable
- [ ] Labels readable
- [ ] Tooltips functional
- [ ] Accessible to screen readers

### 6.3 Forms
- [ ] Validation works
- [ ] Error messages display
- [ ] Success feedback shows
- [ ] Keyboard navigation works
- [ ] Screen reader announces errors

### 6.4 Copy
- [ ] No typos
- [ ] Grammar correct
- [ ] Tone appropriate
- [ ] Messages clear
- [ ] Actions specific

---

## 7. References

- **Polaris Typography:** https://polaris.shopify.com/design/typography
- **Polaris Voice & Tone:** https://polaris.shopify.com/content/voice-and-tone
- **Polaris Form Validation:** https://polaris.shopify.com/patterns/error-messages
- **Design Tokens:** `docs/design/design-tokens.md`
- **Accessibility:** `docs/design/accessibility.md`
- **WCAG 2.1 AA:** https://www.w3.org/WAI/WCAG21/quickref/

