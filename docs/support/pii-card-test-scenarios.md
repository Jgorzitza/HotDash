# PII Card Test Scenarios — Hot Rod AN

**Version**: 1.0  
**Created**: 2025-10-21  
**Owner**: Support Agent (supporting Engineer + QA)  
**Audience**: QA Agent, Engineer, Operators

---

## Table of Contents

1. [Overview](#overview)
2. [Test Scenarios](#test-scenarios)
3. [Edge Cases](#edge-cases)
4. [Security Tests](#security-tests)
5. [Integration Tests](#integration-tests)
6. [Performance Tests](#performance-tests)
7. [Operator Testing Checklist](#operator-testing-checklist)
8. [Accessibility Testing](#accessibility-testing)

---

## Overview

### What is the PII Card?

**PII Card** = Operator-only view displaying full customer details (Personally Identifiable Information) during HITL approval

**Purpose**: Provide operators with complete customer context while enforcing **privacy by default** for customer-facing communications

**Components Under Test**:

- **PII Redaction Utility**: `app/utils/pii-redaction.ts` (178 lines)
- **PII Card Component**: `app/components/PIICard.tsx` (when built)
- **Public Reply Component**: Redacted version for customers
- **Integration**: PII Card + Public Reply split in CXEscalationModal

---

### Test Objectives

1. **Functional**: Verify PII redaction works correctly for all data types
2. **Security**: Ensure NO full PII leaks into public reply
3. **Integration**: Verify PII Card and Public Reply display different content
4. **Performance**: Confirm redaction is fast (<100ms for typical input)
5. **Accessibility**: Ensure screen readers and keyboard navigation work
6. **Edge Cases**: Handle null, empty, malformed, special characters

---

## Test Scenarios

### Scenario 1: Email Redaction

**Test ID**: PII-001  
**Priority**: P0 (Critical)  
**Type**: Functional

**Objective**: Verify email addresses are properly redacted

**Test Data**:

```json
{
  "email": "john.doe@example.com"
}
```

**Expected Behavior**:

- **PII Card (Operator)**: `john.doe@example.com` (full email shown)
- **Public Reply (Customer)**: `j***@e***.com` (redacted)

**Redaction Rules**:

- Show first character of local part
- Show first character of domain
- Mask all other characters with `***`
- Preserve domain extension (.com, .org, etc.)

**Test Steps**:

1. Load PII Card with test email
2. Verify PII Card displays full email
3. Load Public Reply with same data
4. Verify Public Reply displays redacted email
5. Confirm redaction pattern matches `j***@e***.com`

**Acceptance Criteria**:

- ✅ PII Card shows full email
- ✅ Public Reply shows redacted email
- ✅ Redaction pattern correct (first char + **_ + domain initial + _**)
- ✅ No full email in Public Reply HTML source

---

### Scenario 2: Phone Number Redaction

**Test ID**: PII-002  
**Priority**: P0 (Critical)  
**Type**: Functional

**Objective**: Verify phone numbers are properly redacted

**Test Data**:

```json
{
  "phone": "(555) 123-4567"
}
```

**Expected Behavior**:

- **PII Card (Operator)**: `(555) 123-4567` (full phone shown)
- **Public Reply (Customer)**: `***-***-4567` (last 4 digits only)

**Redaction Rules**:

- Mask area code and first 3 digits
- Show last 4 digits only
- Preserve formatting (dashes, parentheses optional)

**Test Steps**:

1. Load PII Card with test phone
2. Verify PII Card displays full phone
3. Load Public Reply with same data
4. Verify Public Reply shows last 4 digits only
5. Confirm no area code or first 3 digits visible

**Acceptance Criteria**:

- ✅ PII Card shows full phone number
- ✅ Public Reply shows `***-***-4567` pattern
- ✅ Last 4 digits correct
- ✅ No full phone in Public Reply HTML source

**Variations to Test**:

```javascript
// Different formats
"(555) 123-4567"  → "***-***-4567"
"555-123-4567"    → "***-***-4567"
"5551234567"      → "***-***-4567"
"+1-555-123-4567" → "***-***-4567"
```

---

### Scenario 3: Address Redaction

**Test ID**: PII-003  
**Priority**: P0 (Critical)  
**Type**: Functional

**Objective**: Verify physical addresses are properly redacted

**Test Data**:

```json
{
  "address": {
    "address1": "123 Main St",
    "address2": "Apt 4B",
    "city": "Springfield",
    "province": "IL",
    "zip": "62701",
    "country": "United States"
  }
}
```

**Expected Behavior**:

- **PII Card (Operator)**:
  ```
  123 Main St, Apt 4B
  Springfield, IL 62701
  United States
  ```
- **Public Reply (Customer)**:
  ```
  Springfield, IL
  United States
  ```

**Redaction Rules**:

- ❌ Remove address1 (street address)
- ❌ Remove address2 (apartment/suite)
- ✅ Keep city
- ✅ Keep state/province
- ❌ Remove ZIP/postal code
- ✅ Keep country

**Test Steps**:

1. Load PII Card with test address
2. Verify PII Card displays full address (all fields)
3. Load Public Reply with same data
4. Verify Public Reply shows ONLY city, state, country
5. Confirm street address and ZIP not visible

**Acceptance Criteria**:

- ✅ PII Card shows full address (6 fields)
- ✅ Public Reply shows city + state + country ONLY
- ✅ No street address in Public Reply
- ✅ No apartment/suite in Public Reply
- ✅ No ZIP code in Public Reply

---

### Scenario 4: Credit Card Redaction

**Test ID**: PII-004  
**Priority**: P0 (Critical)  
**Type**: Functional + Security

**Objective**: Verify credit card numbers are properly redacted

**Test Data**:

```json
{
  "payment_method": "Visa ending 1234"
}
```

**Expected Behavior**:

- **PII Card (Operator)**: `Visa **** 1234` (last 4 only, masked)
- **Public Reply (Customer)**: `Payment Confirmed ✓` (NO card details)

**Redaction Rules**:

- PII Card: Show card type + last 4 digits ONLY
- Public Reply: Show generic confirmation message, NO card details

**Test Steps**:

1. Load PII Card with payment data
2. Verify PII Card shows `Visa **** 1234`
3. Load Public Reply with same data
4. Verify Public Reply shows "Payment Confirmed ✓"
5. Confirm NO card number (even last 4) in Public Reply

**Acceptance Criteria**:

- ✅ PII Card shows `[Type] **** [Last4]`
- ✅ Public Reply shows generic confirmation only
- ✅ NO card number in Public Reply (not even last 4)
- ✅ Security: Full card number NEVER stored or displayed

---

### Scenario 5: Full Name Redaction

**Test ID**: PII-005  
**Priority**: P1 (High)  
**Type**: Functional

**Objective**: Verify full names are appropriately handled

**Test Data**:

```json
{
  "name": "John Michael Doe"
}
```

**Expected Behavior**:

- **PII Card (Operator)**: `John Michael Doe` (full name)
- **Public Reply (Customer)**: `John D.` (first name + last initial)

**Redaction Rules**:

- Show first name
- Show last initial only
- Remove middle name(s)

**Test Steps**:

1. Load PII Card with test name
2. Verify PII Card displays full name
3. Load Public Reply with same data
4. Verify Public Reply shows first name + last initial
5. Confirm middle name not visible

**Acceptance Criteria**:

- ✅ PII Card shows full name (all parts)
- ✅ Public Reply shows `[First] [LastInitial].`
- ✅ Middle name(s) redacted
- ✅ Works with 2, 3, or 4-part names

**Variations to Test**:

```javascript
"John Doe"           → "John D."
"John Michael Doe"   → "John D."
"Mary Ann Smith Jr." → "Mary S."
"Li"                 → "Li" (single name, no redaction)
```

---

## Edge Cases

### Edge Case 1: Null Values

**Test ID**: PII-EDGE-001  
**Priority**: P0 (Critical)  
**Type**: Edge Case

**Objective**: Verify graceful handling of null/undefined values

**Test Data**:

```json
{
  "email": null,
  "phone": undefined,
  "address": null
}
```

**Expected Behavior**:

- **PII Card**: Display "Not provided" or placeholder
- **Public Reply**: Display "Not available" or skip field
- **NO ERRORS**: Application should not crash

**Test Steps**:

1. Load PII Card with null email
2. Verify displays "Email: Not provided"
3. Load PII Card with undefined phone
4. Verify displays "Phone: Not provided"
5. Load PII Card with null address
6. Verify displays "Address: Not provided"
7. Confirm no console errors

**Acceptance Criteria**:

- ✅ No crash on null values
- ✅ Displays placeholder text
- ✅ No console errors
- ✅ No "undefined" or "null" strings visible

---

### Edge Case 2: Empty Strings

**Test ID**: PII-EDGE-002  
**Priority**: P1 (High)  
**Type**: Edge Case

**Objective**: Verify handling of empty strings

**Test Data**:

```json
{
  "email": "",
  "phone": "",
  "address": {
    "address1": "",
    "city": "",
    "zip": ""
  }
}
```

**Expected Behavior**:

- Same as null handling
- Display "Not provided" for empty strings
- Do not show empty fields in Public Reply

**Acceptance Criteria**:

- ✅ Empty strings treated as missing data
- ✅ Displays "Not provided" placeholder
- ✅ Public Reply skips empty fields

---

### Edge Case 3: Special Characters

**Test ID**: PII-EDGE-003  
**Priority**: P1 (High)  
**Type**: Edge Case + Security

**Objective**: Verify safe handling of special characters (XSS prevention)

**Test Data**:

```json
{
  "email": "<script>alert('xss')</script>@example.com",
  "name": "'; DROP TABLE users; --",
  "address1": "<img src=x onerror=alert(1)>"
}
```

**Expected Behavior**:

- **Sanitize ALL input**: HTML entities escaped
- **NO SCRIPT EXECUTION**: XSS attempts blocked
- **Display safe version**: Special chars shown as text, not executed

**Test Steps**:

1. Load PII Card with XSS payload in email
2. Verify NO script execution
3. Verify special chars escaped (`<` becomes `&lt;`)
4. Load PII Card with SQL injection attempt in name
5. Verify displayed as plain text (no SQL execution)
6. Check browser console for errors

**Acceptance Criteria**:

- ✅ NO script execution (XSS blocked)
- ✅ Special characters HTML-escaped
- ✅ Data displayed safely as text
- ✅ No SQL injection possible (client-side only, but test sanitization)

**Security Note**: This is CRITICAL - all PII data must be sanitized before display to prevent XSS attacks.

---

### Edge Case 4: International Characters

**Test ID**: PII-EDGE-004  
**Priority**: P2 (Medium)  
**Type**: Edge Case

**Objective**: Verify handling of non-ASCII characters

**Test Data**:

```json
{
  "name": "José García-López",
  "email": "münchen@bücher.de",
  "address": {
    "city": "Montréal",
    "province": "Québec"
  }
}
```

**Expected Behavior**:

- **PII Card**: Display international characters correctly (UTF-8)
- **Public Reply**: Redact properly (preserve accents in first char)
- **NO ENCODING ERRORS**: Characters display correctly

**Test Steps**:

1. Load PII Card with international name
2. Verify accents display correctly (José, not JosÃ©)
3. Load Public Reply with same data
4. Verify redaction preserves first char with accent
5. Verify city/province display correctly

**Acceptance Criteria**:

- ✅ International characters display correctly
- ✅ UTF-8 encoding preserved
- ✅ Redaction works with accented characters
- ✅ No encoding errors (�, Ã©, etc.)

---

### Edge Case 5: Extremely Long Input

**Test ID**: PII-EDGE-005  
**Priority**: P2 (Medium)  
**Type**: Edge Case + Performance

**Objective**: Verify handling of very long strings

**Test Data**:

```json
{
  "email": "verylongemailaddressthatexceeds255characters...@example.com",
  "name": "FirstName MiddleName1 MiddleName2 ... LastName" (500 chars),
  "address1": "123 Very Long Street Name That Goes On Forever And Ever" (1000 chars)
}
```

**Expected Behavior**:

- **Truncate if needed**: Display first 100 chars + "..."
- **Performance**: Redaction still <100ms
- **NO CRASH**: Application handles gracefully

**Acceptance Criteria**:

- ✅ Long strings truncated or wrapped
- ✅ No UI overflow or layout break
- ✅ Redaction performance <100ms
- ✅ No crash or memory issues

---

## Security Tests

### Security Test 1: PII Leakage Check

**Test ID**: PII-SEC-001  
**Priority**: P0 (Critical - Security)  
**Type**: Security

**Objective**: VERIFY NO FULL PII IN PUBLIC REPLY

**Test Method**: Automated + Manual

**Test Steps**:

1. Load conversation with full customer data (email, phone, address, payment)
2. Generate Public Reply (redacted version)
3. **Inspect HTML source** of Public Reply component
4. Search for full email, full phone, full address
5. Verify NO matches found

**Automated Check**:

```javascript
// Pseudo-code
const fullEmail = "john.doe@example.com";
const publicReplyHTML = render(<PublicReply data={customerData} />);

expect(publicReplyHTML).not.toContain(fullEmail);
expect(publicReplyHTML).not.toContain("123 Main St");
expect(publicReplyHTML).not.toContain("62701"); // ZIP
```

**Acceptance Criteria**:

- ✅ NO full email in Public Reply HTML
- ✅ NO full phone in Public Reply HTML
- ✅ NO street address in Public Reply HTML
- ✅ NO ZIP code in Public Reply HTML
- ✅ ONLY redacted versions present

**Failure = P0 Bug**: If ANY full PII found in Public Reply, this is a CRITICAL security issue.

---

### Security Test 2: Browser DevTools Inspection

**Test ID**: PII-SEC-002  
**Priority**: P0 (Critical - Security)  
**Type**: Security

**Objective**: Verify PII not exposed in browser DevTools

**Test Steps**:

1. Open browser DevTools (F12)
2. Load PII Card in application
3. Inspect **Elements** tab (check HTML)
4. Inspect **Network** tab (check API responses)
5. Inspect **Application** tab (check localStorage/sessionStorage)
6. Search for full PII in all tabs

**What to Check**:

- HTML: Is full PII in hidden elements? (display:none with full data = BAD)
- Network: Are API responses exposing full PII unnecessarily?
- Storage: Is full PII cached in browser storage?
- Console: Are console.log statements printing full PII?

**Acceptance Criteria**:

- ✅ NO hidden HTML elements with full PII
- ✅ API responses ONLY include PII when needed (operator-only endpoints)
- ✅ NO full PII in localStorage/sessionStorage
- ✅ NO full PII in console logs

---

### Security Test 3: Role-Based Access

**Test ID**: PII-SEC-003  
**Priority**: P0 (Critical - Security)  
**Type**: Security + Integration

**Objective**: Verify PII Card ONLY accessible to operators (not customers)

**Test Steps**:

1. Log in as **Operator** role
2. Open CXEscalationModal
3. Verify PII Card tab visible
4. Verify can view full customer details
5. Log out
6. Attempt to access PII Card endpoint directly (if API-based)
7. Verify 403 Forbidden or 401 Unauthorized

**Acceptance Criteria**:

- ✅ Operators can access PII Card
- ✅ Non-operators CANNOT access PII Card
- ✅ Direct API access blocked without operator role
- ✅ ABAC (Attribute-Based Access Control) enforced

**Test Roles**:

- ✅ `operator` role → Can access PII Card
- ❌ `customer` role → Cannot access PII Card
- ❌ `unauthenticated` → Cannot access PII Card

---

## Integration Tests

### Integration Test 1: PII Card + Public Reply Split

**Test ID**: PII-INT-001  
**Priority**: P0 (Critical)  
**Type**: Integration

**Objective**: Verify PII Card and Public Reply display different content in same modal

**Test Scenario**: Operator reviewing AI-drafted reply

**Test Steps**:

1. Load CXEscalationModal with customer data
2. Click **PII Card tab**
3. Verify displays FULL customer details (email, phone, address)
4. Click **Public Reply tab**
5. Verify displays REDACTED customer details
6. Switch between tabs 3 times
7. Verify content updates correctly each time

**Expected UI**:

```
┌─────────────────────────────────────┐
│ [PII Card Tab]  [Public Reply Tab]  │
├─────────────────────────────────────┤
│ PII Card (when active):             │
│ Email: john.doe@example.com         │
│ Phone: (555) 123-4567               │
│ Address: 123 Main St, Springfield   │
│                                     │
│ Public Reply (when active):         │
│ Email: j***@e***.com                │
│ Phone: ***-***-4567                 │
│ Address: Springfield, IL            │
└─────────────────────────────────────┘
```

**Acceptance Criteria**:

- ✅ Both tabs render without errors
- ✅ PII Card shows full details
- ✅ Public Reply shows redacted details
- ✅ Tab switching works smoothly
- ✅ Content updates correctly on switch

---

### Integration Test 2: PII Broker Integration

**Test ID**: PII-INT-002  
**Priority**: P0 (Critical)  
**Type**: Integration

**Objective**: Verify PII Broker called before presenting to operator

**Test Flow**:

```
Customer Message → Customer-Front Agent → Sub-Agent → Compose Reply → PII Broker → Operator
```

**Test Steps**:

1. Send test customer message
2. Customer-Front Agent composes draft reply
3. **Verify PII Broker called** (check logs or network tab)
4. Verify two versions generated:
   - Full version (for PII Card)
   - Redacted version (for Public Reply)
5. Verify operator sees both versions in modal

**Acceptance Criteria**:

- ✅ PII Broker called before modal display
- ✅ Two versions generated (full + redacted)
- ✅ Both versions stored in decision_log
- ✅ No manual redaction needed (automated)

---

## Performance Tests

### Performance Test 1: Redaction Speed

**Test ID**: PII-PERF-001  
**Priority**: P1 (High)  
**Type**: Performance

**Objective**: Verify redaction function completes in <100ms

**Test Method**: Automated benchmark

**Test Data**: Typical customer record

```json
{
  "email": "john.doe@example.com",
  "phone": "(555) 123-4567",
  "name": "John Doe",
  "address": {
    "address1": "123 Main St",
    "city": "Springfield",
    "province": "IL",
    "zip": "62701"
  }
}
```

**Test Code** (pseudo-code):

```javascript
import { redactPII } from "app/utils/pii-redaction";

describe("Performance: PII Redaction", () => {
  it("should redact PII in <100ms", () => {
    const start = performance.now();
    const redacted = redactPII(customerData);
    const end = performance.now();
    const duration = end - start;

    expect(duration).toBeLessThan(100);
  });

  it("should handle 100 records in <1s", () => {
    const records = Array(100).fill(customerData);
    const start = performance.now();

    records.forEach((record) => redactPII(record));

    const end = performance.now();
    const duration = end - start;

    expect(duration).toBeLessThan(1000);
  });
});
```

**Acceptance Criteria**:

- ✅ Single redaction: <100ms
- ✅ 100 redactions: <1s (avg <10ms each)
- ✅ No memory leaks
- ✅ Consistent performance (not degrading over time)

---

### Performance Test 2: Component Render Speed

**Test ID**: PII-PERF-002  
**Priority**: P2 (Medium)  
**Type**: Performance

**Objective**: Verify PII Card and Public Reply render quickly

**Test Steps**:

1. Measure PII Card render time (React component)
2. Measure Public Reply render time
3. Measure tab switching time
4. Verify all <200ms (smooth UX)

**Acceptance Criteria**:

- ✅ PII Card initial render: <200ms
- ✅ Public Reply initial render: <200ms
- ✅ Tab switch: <100ms
- ✅ No janky animations or lag

---

## Operator Testing Checklist

### Manual Testing Guide for QA/Operators

**Before Starting**:

- [ ] Environment: Staging (not production)
- [ ] Test account: Use test customer data (not real customers)
- [ ] Browser: Test in Chrome, Firefox, Safari

---

### Checklist Section 1: Basic Functionality

**Test 1: PII Card Displays Full Data**

- [ ] Open CXEscalationModal
- [ ] Click PII Card tab
- [ ] Verify full email visible
- [ ] Verify full phone visible
- [ ] Verify full address visible (street, apt, city, state, ZIP)
- [ ] Verify all fields populated correctly

**Test 2: Public Reply Displays Redacted Data**

- [ ] Click Public Reply tab
- [ ] Verify email redacted (j**_@e_**.com format)
- [ ] Verify phone redacted (**_-_**-4567 format)
- [ ] Verify address redacted (city + state only)
- [ ] Verify NO street address visible
- [ ] Verify NO ZIP code visible

**Test 3: Tab Switching**

- [ ] Switch between PII Card and Public Reply 5 times
- [ ] Verify content updates each time
- [ ] Verify no flickering or errors
- [ ] Verify smooth transition

---

### Checklist Section 2: Edge Cases

**Test 4: Null Email**

- [ ] Load conversation with no email
- [ ] Verify PII Card shows "Email: Not provided"
- [ ] Verify Public Reply skips email field or shows placeholder
- [ ] Verify no crash or console errors

**Test 5: Empty Phone**

- [ ] Load conversation with empty phone ("")
- [ ] Verify displays "Phone: Not provided"
- [ ] Verify no "undefined" or "null" text visible

**Test 6: Special Characters**

- [ ] Load conversation with email containing special chars (e.g., name+test@example.com)
- [ ] Verify displays correctly (no HTML escape codes visible)
- [ ] Verify NO script execution (XSS test)

---

### Checklist Section 3: Security

**Test 7: View HTML Source**

- [ ] Right-click Public Reply → "Inspect Element"
- [ ] Search HTML source for full email
- [ ] Verify NOT FOUND (no full email in HTML)
- [ ] Search for full phone number
- [ ] Verify NOT FOUND
- [ ] Search for street address
- [ ] Verify NOT FOUND

**Test 8: Browser DevTools Check**

- [ ] Open DevTools (F12)
- [ ] Go to Network tab
- [ ] Load PII Card
- [ ] Check API responses
- [ ] Verify full PII ONLY in operator-role-restricted endpoints
- [ ] Check Application tab → localStorage
- [ ] Verify NO full PII cached

---

### Checklist Section 4: Accessibility

**Test 9: Keyboard Navigation**

- [ ] Tab to PII Card tab (use Tab key)
- [ ] Verify focus indicator visible
- [ ] Press Enter to activate
- [ ] Tab to Public Reply tab
- [ ] Press Enter to activate
- [ ] Verify tab switching works via keyboard

**Test 10: Screen Reader**

- [ ] Enable screen reader (NVDA on Windows, VoiceOver on Mac)
- [ ] Navigate to PII Card tab
- [ ] Verify announces "PII Card, tab"
- [ ] Activate tab
- [ ] Verify announces content (email, phone, address)
- [ ] Navigate to Public Reply tab
- [ ] Verify announces "Public Reply, tab"

---

### Expected vs Actual Results Template

**For Each Test**:

| Test                            | Expected               | Actual    | Status | Notes    |
| ------------------------------- | ---------------------- | --------- | ------ | -------- |
| PII Card displays full email    | john.doe@example.com   | [Fill in] | ✅/❌  | [Issues] |
| Public Reply redacts email      | j**_@e_**.com          | [Fill in] | ✅/❌  | [Issues] |
| Phone redaction (last 4 only)   | **_-_**-4567           | [Fill in] | ✅/❌  | [Issues] |
| Address redaction (city+state)  | Springfield, IL        | [Fill in] | ✅/❌  | [Issues] |
| HTML source check (no full PII) | Not found              | [Fill in] | ✅/❌  | [Issues] |
| Keyboard navigation works       | Tab + Enter functional | [Fill in] | ✅/❌  | [Issues] |
| Screen reader announces tabs    | "PII Card, tab"        | [Fill in] | ✅/❌  | [Issues] |

---

## Accessibility Testing

### WCAG 2.2 AA Compliance

**Test ID**: PII-A11Y-001  
**Priority**: P1 (High)  
**Type**: Accessibility

**Objective**: Verify PII Card meets WCAG 2.2 AA standards

---

### Accessibility Test 1: Keyboard Navigation

**Requirements**:

- [ ] All interactive elements accessible via Tab key
- [ ] Tab order logical (left to right, top to bottom)
- [ ] Enter/Space activates buttons
- [ ] Escape closes modal
- [ ] Focus visible (outline or highlight)

**Test Steps**:

1. Open CXEscalationModal
2. Press Tab repeatedly
3. Verify focus moves through: PII Card tab → Public Reply tab → Approve button → Cancel button
4. Press Enter on PII Card tab
5. Verify tab activates and content displays
6. Press Escape
7. Verify modal closes

**Acceptance Criteria**:

- ✅ All elements keyboard-accessible
- ✅ Focus order logical
- ✅ Enter/Space/Escape work correctly
- ✅ Focus visible at all times

---

### Accessibility Test 2: Screen Reader Support

**Requirements**:

- [ ] Tabs have proper ARIA labels
- [ ] Content announced when tab activated
- [ ] Role="tablist", role="tab", role="tabpanel" used correctly
- [ ] aria-selected state updates

**Test Steps**:

1. Enable screen reader (NVDA, JAWS, or VoiceOver)
2. Navigate to PII Card tab
3. Listen for announcement: "PII Card, tab, 1 of 2"
4. Activate tab (Enter)
5. Listen for announcement: "PII Card panel, Email: john.doe@example.com, Phone: ..."
6. Navigate to Public Reply tab
7. Listen for announcement: "Public Reply, tab, 2 of 2"

**Acceptance Criteria**:

- ✅ Tab role announced correctly
- ✅ Position announced (1 of 2, 2 of 2)
- ✅ Content announced when activated
- ✅ aria-selected state correct

---

### Accessibility Test 3: Color Contrast

**Requirements**:

- [ ] Text color vs background: 4.5:1 minimum (normal text)
- [ ] Text color vs background: 3:1 minimum (large text 18pt+)
- [ ] Focus indicators: 3:1 minimum

**Test Steps**:

1. Use browser color picker or tool (e.g., WAVE, axe DevTools)
2. Check PII Card tab text contrast
3. Check Public Reply tab text contrast
4. Check content area text contrast
5. Check focus indicator contrast

**Acceptance Criteria**:

- ✅ All text meets 4.5:1 ratio
- ✅ Large text (if any) meets 3:1 ratio
- ✅ Focus indicators meet 3:1 ratio
- ✅ No contrast warnings from tools

---

### Accessibility Test 4: Semantic HTML

**Requirements**:

- [ ] Proper heading hierarchy (h1, h2, h3)
- [ ] Tab structure uses proper ARIA roles
- [ ] Form fields have associated labels
- [ ] Buttons have descriptive text

**Test Steps**:

1. Inspect HTML with DevTools
2. Verify tab structure:
   ```html
   <div role="tablist">
     <button role="tab" aria-selected="true">PII Card</button>
     <button role="tab" aria-selected="false">Public Reply</button>
   </div>
   <div role="tabpanel">...</div>
   ```
3. Verify headings in logical order (no h1 → h3 skip)
4. Verify buttons have text (not just icons)

**Acceptance Criteria**:

- ✅ Headings in logical order
- ✅ ARIA roles correct
- ✅ No empty buttons (all have text or aria-label)
- ✅ Form fields labeled

---

## Test Summary Template

**Use this template for final test report**:

```markdown
# PII Card Test Report

**Test Date**: YYYY-MM-DD  
**Tester**: [Name]  
**Environment**: Staging  
**Build/Commit**: [hash]

## Summary

**Total Tests**: 35  
**Passed**: 34 ✅  
**Failed**: 1 ❌  
**Blocked**: 0  
**Pass Rate**: 97%

## Results by Category

### Functional Tests (5 scenarios)

- ✅ Email redaction
- ✅ Phone redaction
- ✅ Address redaction
- ✅ Credit card redaction
- ✅ Name redaction

### Edge Cases (5 tests)

- ✅ Null values
- ✅ Empty strings
- ❌ Special characters (XSS payload not fully sanitized)
- ✅ International characters
- ✅ Extremely long input

### Security Tests (3 tests)

- ✅ PII leakage check (no full PII in public reply)
- ✅ Browser DevTools inspection (no PII exposed)
- ✅ Role-based access (operators only)

### Integration Tests (2 tests)

- ✅ PII Card + Public Reply split
- ✅ PII Broker integration

### Performance Tests (2 tests)

- ✅ Redaction speed (<100ms)
- ✅ Component render speed (<200ms)

### Accessibility Tests (4 tests)

- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Color contrast
- ✅ Semantic HTML

## Bugs Found

**BUG-042**: Special characters not fully sanitized

- Priority: P0 (Security)
- Description: Email with `<script>` tag partially rendered as HTML
- Impact: Potential XSS vulnerability
- Recommendation: Add HTML sanitization to pii-redaction.ts

## Recommendations

1. Fix BUG-042 before production (P0)
2. Add automated XSS tests to CI
3. Consider adding more international character tests

## Sign-Off

**Status**: ❌ NOT READY (1 P0 bug must be fixed)  
**Next Steps**: Engineer fix BUG-042, re-test, then approve
```

---

## Document History

| Version | Date       | Author        | Changes                        |
| ------- | ---------- | ------------- | ------------------------------ |
| 1.0     | 2025-10-21 | Support Agent | Initial creation (SUPPORT-009) |

---

**END OF DOCUMENT**
