# PII Card UX Copy

**Purpose**: Operator-facing copy for PII (Personally Identifiable Information) Card component and CX Escalation Modal  
**Owner**: Content  
**Beneficiary**: Engineer (ENG-029, ENG-030)  
**Status**: Production-ready  
**Last Updated**: 2025-10-21

---

## Overview

The PII Card displays sensitive customer information with appropriate masking for public replies while providing full details to operators. This copy ensures operators understand what information is visible to them vs. what gets sent to customers.

---

## 1. PII Card Component Copy

### Section Headers

**Customer Details**

```
Customer Details
```

- Context: Top section of PII Card
- Purpose: Groups customer identity information
- Accessibility: `<h3>` with `id="customer-details"`

**Order Information**

```
Order Information
```

- Context: Middle section of PII Card
- Purpose: Groups order-specific data
- Accessibility: `<h3>` with `id="order-information"`

**Shipping Status**

```
Shipping Status
```

- Context: Bottom section of PII Card
- Purpose: Groups fulfillment and tracking data
- Accessibility: `<h3>` with `id="shipping-status"`

---

### Field Labels

#### Customer Details Section

**Customer Name**

```
Customer Name
```

- Display: Full name (not masked)
- Example: "Sarah Johnson"

**Email Address (Masked)**

```
Email Address
```

- Display: Masked format `j***@d***.com`
- Tooltip: "Full email visible to you only. Customer replies show masked version."
- Accessibility: `aria-label="Customer email address (masked for privacy)"`

**Phone Number (Last 4)**

```
Phone Number
```

- Display: `***-***-1234`
- Tooltip: "Last 4 digits shown. Full number visible in Order Details."
- Accessibility: `aria-label="Customer phone number (partially masked)"`

**Customer ID**

```
Customer ID
```

- Display: Shopify customer GID or "Guest"
- Example: `#12345` or "Guest"
- No masking required

#### Order Information Section

**Order ID (Last 4)**

```
Order ID
```

- Display: `...3847`
- Tooltip: "Last 4 digits of order number. Click to view full order."
- Link: Yes (to full order page)
- Accessibility: `aria-label="Order ID ending in 3847. Click for full details."`

**Order Date**

```
Order Date
```

- Display: `Oct 15, 2025`
- Format: `MMM DD, YYYY`
- No masking required

**Order Total**

```
Order Total
```

- Display: `$247.50 USD`
- Format: Currency with symbol
- No masking required

**Payment Method**

```
Payment Method
```

- Display: `Visa ****1234`
- Tooltip: "Last 4 digits of payment card. Full details not stored per PCI compliance."
- Accessibility: `aria-label="Payment method: Visa ending in 1234"`

#### Shipping Status Section

**Shipping Address (Masked)**

```
Shipping Address
```

- Display: `*****, San Diego, CA 92101`
- Tooltip: "Street address hidden. City and ZIP shown for context."
- Accessibility: `aria-label="Shipping address (street hidden for privacy)"`

**Tracking Number**

```
Tracking Number
```

- Display: Full tracking number with carrier
- Example: `UPS: 1Z999AA10123456784`
- Link: Yes (to carrier tracking page)
- No masking (public information)

**Delivery Status**

```
Delivery Status
```

- Display: Status badge with icon
- Options: `In Transit`, `Out for Delivery`, `Delivered`, `Exception`
- No masking required

**Estimated Delivery**

```
Estimated Delivery
```

- Display: Date range
- Example: `Oct 18-20, 2025`
- No masking required

---

### Tooltips

**Why is data masked?**

```
Full details visible to you only
```

- Context: Info icon next to masked fields
- Full tooltip: "Full customer information is visible to you as an operator. When you send a public reply, customer sees masked version to protect their privacy."

**What does the customer see?**

```
Customer sees masked version
```

- Context: Badge on PII Card
- Full explanation: "In public replies, email shows as j**_@d_**.com and phone as **_-_**-1234. This information is NOT included in public messages."

**How to reference order details**

```
Use last 4 digits
```

- Context: Order ID field
- Full tooltip: "When communicating with customer, reference order by last 4 digits (e.g., 'order ending in 3847') to verify identity without exposing full order number."

---

### Help Text

**Card Footer Help Text**

```
ℹ️ This information is visible to you only. Public replies automatically mask sensitive details.
```

- Position: Bottom of PII Card
- Icon: Info icon (ℹ️)
- Style: Subdued color, small font
- Accessibility: `role="note"`

**Operator-Only Badge**

```
🔒 Operator-Only
```

- Position: Top-right corner of PII Card
- Icon: Lock icon (🔒)
- Tooltip: "This card contains full customer details. Not visible in public replies."
- Style: Badge with lock icon
- Accessibility: `aria-label="Operator-only information"`

---

## 2. CX Escalation Modal Copy

### Modal Title

**Primary Title**

```
CX Escalation — [Customer Name]
```

- Example: `CX Escalation — Sarah Johnson`
- Format: H2 heading
- Dynamic: Customer name inserted
- Accessibility: `role="heading" aria-level="2"`

**Subtitle (if order present)**

```
Order #[last 4] · [Order Date]
```

- Example: `Order #3847 · Oct 15, 2025`
- Format: Subdued text below title
- Purpose: Quick context for operator

---

### Section Headers

**Conversation History**

```
Conversation History
```

- Purpose: Shows recent messages between customer and support
- Empty state: "No recent messages available."

**Suggested Reply**

```
Suggested Reply (AI Draft)
```

- Purpose: AI-generated response for operator review
- Badge: "AI Draft" label
- Empty state: "No template available. Draft response manually or escalate."

**Public Reply**

```
Public Reply
```

- Purpose: What will be sent to customer
- Help text: "Review and edit before sending. Customer will see masked email/phone."

**Operator-Only Details**

```
Operator-Only Details
```

- Purpose: Internal notes and full PII
- Help text: "This section is NOT sent to customer. Use for audit trail and context."
- Badge: 🔒 "Private"

**Internal Note**

```
Internal Note (Optional)
```

- Placeholder: "Add context for audit trail (e.g., 'Called warehouse to verify', 'Escalated to manager')"
- Purpose: Log operator actions for decision log
- Character limit: 500 characters
- Not visible to customer

---

### Field Labels & Placeholders

**Public Reply Text Area**

```
Label: Your Reply to Customer
Placeholder: Type your response here. Sensitive details will be automatically masked.
```

- Character limit: 2,000 characters
- Accessibility: `aria-label="Public reply to customer. Sensitive information will be masked automatically."`

**Internal Note Text Area**

```
Label: Internal Note
Placeholder: Add context for the decision log (e.g., actions taken, next steps)
```

- Character limit: 500 characters
- Accessibility: `aria-label="Internal note for audit trail. Not visible to customer."`

---

### Grading Sliders

**Section Header**

```
Grade AI Response (1-5 scale)
```

- Purpose: Collect feedback on AI-generated reply quality
- Show only if AI draft present

**Tone Slider**

```
Label: Tone
Description: Was the tone appropriate for this situation?
Scale: 1 (Inappropriate) to 5 (Perfect)
```

- Accessibility: `aria-label="Rate tone of AI response. 1 is inappropriate, 5 is perfect."`

**Accuracy Slider**

```
Label: Accuracy
Description: Was the information provided correct?
Scale: 1 (Incorrect) to 5 (Accurate)
```

- Accessibility: `aria-label="Rate accuracy of AI response. 1 is incorrect, 5 is accurate."`

**Policy Compliance Slider**

```
Label: Policy Compliance
Description: Did the response follow company policies?
Scale: 1 (Violates Policy) to 5 (Compliant)
```

- Accessibility: `aria-label="Rate policy compliance of AI response. 1 violates policy, 5 is compliant."`

---

### Button Labels

**Primary Action (Send Reply)**

```
Send Reply
```

- Style: Primary button (blue)
- Disabled until: Reply text present and validated
- Confirmation: "Reply sent! 📨"
- Accessibility: `aria-label="Send public reply to customer"`

**Secondary Action (Save Draft)**

```
Save Draft
```

- Style: Secondary button (gray outline)
- Available: When reply text present
- Confirmation: "Draft saved"
- Accessibility: `aria-label="Save reply as draft for later"`

**Tertiary Action (Edit AI Draft)**

```
Edit
```

- Style: Text button
- Position: Next to "Suggested Reply" header
- Action: Copies AI draft to public reply field
- Accessibility: `aria-label="Edit AI-suggested reply"`

**Warning Action (Escalate)**

```
Escalate to Manager
```

- Style: Warning button (yellow/orange)
- Confirmation: "Escalated to manager. Customer notified of delay."
- Accessibility: `aria-label="Escalate this issue to manager"`

**Resolving Action (Mark Resolved)**

```
Mark Resolved
```

- Style: Success button (green)
- Available: After reply sent
- Confirmation: "Issue resolved! ✓"
- Accessibility: `aria-label="Mark this customer issue as resolved"`

**Cancel Action**

```
Cancel
```

- Style: Ghost button (no border)
- Position: Footer left
- Confirmation: "Are you sure? Unsaved changes will be lost."
- Accessibility: `aria-label="Cancel and close modal"`

---

### Confirmation Messages

**Send Success**

```
Reply sent! 📨
```

- Type: Toast notification
- Duration: 3 seconds
- Style: Success (green)
- Additional: "Customer will receive your message shortly."

**Draft Saved**

```
Draft saved
```

- Type: Toast notification
- Duration: 2 seconds
- Style: Info (blue)

**Escalation Success**

```
Escalated to manager ✓
```

- Type: Toast notification
- Duration: 3 seconds
- Style: Warning (yellow)
- Additional: "Customer notified: 'We're reviewing your request and will respond within 2 hours.'"

**Resolution Success**

```
Issue resolved! ✓
```

- Type: Toast notification
- Duration: 3 seconds
- Style: Success (green)
- Hot Rodan theme: "Pit stop complete! 🏁" (optional alternative)

**Error (Send Failed)**

```
Failed to send reply
```

- Type: Toast notification
- Duration: 5 seconds
- Style: Error (red)
- Additional: "Error: [specific error]. Please try again or contact support."
- Action button: "Retry"

---

### Validation Messages

**Empty Reply Field**

```
⚠️ Reply message is required
```

- Position: Below public reply field
- Style: Warning text (yellow/orange)
- Show: On submit attempt with empty field

**Reply Too Long**

```
⚠️ Reply exceeds 2,000 characters (current: [count])
```

- Position: Below public reply field
- Style: Warning text
- Show: When character count > 2,000
- Dynamic: Update count in real-time

**Internal Note Too Long**

```
⚠️ Note exceeds 500 characters (current: [count])
```

- Position: Below internal note field
- Style: Warning text
- Show: When character count > 500

**Grading Incomplete**

```
⚠️ Please rate all 3 criteria (Tone, Accuracy, Policy)
```

- Position: Below grading sliders
- Style: Warning text
- Show: On submit with incomplete grades (if AI draft present)

---

## 3. Empty States

**No Conversation History**

```
No recent messages available.
```

- Icon: 💬 (chat bubble)
- Additional: "This is a new inquiry."

**No AI Suggestion**

```
No template available.
```

- Additional: "Draft response manually or escalate to manager."
- Action link: "View response templates"

**No Previous Notes**

```
No internal notes yet.
```

- Additional: "Add context to help future operators."

---

## 4. Loading States

**Loading Reply Suggestion**

```
Generating suggested reply...
```

- Icon: Spinner
- Duration: While AI processes

**Sending Reply**

```
Sending your reply...
```

- Icon: Spinner
- Duration: While API request in progress
- Disable: All form inputs

**Saving Draft**

```
Saving...
```

- Icon: Spinner
- Duration: While save in progress

---

## 5. Accessibility Labels

### Screen Reader Announcements

**Modal Opened**

```
aria-live="polite": CX Escalation modal opened for [Customer Name]. 3 sections available: Conversation History, Suggested Reply, and Public Reply.
```

**Reply Sent**

```
aria-live="polite": Reply sent successfully. Modal will close in 3 seconds.
```

**Form Validation Error**

```
aria-live="assertive": Form contains errors. Reply message is required. Please correct and try again.
```

### Landmark Roles

**PII Card**

```
role="region"
aria-labelledby="pii-card-title"
aria-describedby="pii-card-description"
```

**CX Escalation Modal**

```
role="dialog"
aria-modal="true"
aria-labelledby="cx-modal-title"
aria-describedby="cx-modal-description"
```

---

## 6. Hot Rodan Brand Voice Applications

### When to Use Brand Voice

✅ **Use Hot Rodan Theme**:

- Success confirmations ("Pit stop complete! 🏁")
- Resolution messages
- Positive feedback

❌ **Avoid Hot Rodan Theme**:

- Error messages (need clarity over creativity)
- Validation warnings
- Sensitive/escalation situations
- PII-related explanations (privacy is serious)

### Brand Voice Examples

**Success (Issue Resolved)**

```
Standard: "Issue resolved! ✓"
Hot Rodan: "Pit stop complete! 🏁" or "Back on track! 🏁"
```

**Success (Reply Sent)**

```
Standard: "Reply sent! 📨"
Hot Rodan: "Message away! 🚀" (optional, test with operators)
```

**Draft Saved**

```
Standard: "Draft saved"
Hot Rodan: Keep standard (saving is routine, not celebratory)
```

---

## 7. Copy Standards

### Operator-First Language

✅ **DO**:

- Use active voice: "Send Reply" not "Reply will be sent"
- Be specific: "Last 4 Order ID" not just "Order ID"
- Explain why: "Masked for privacy" not just "Masked"
- Show outcomes: "Customer will receive..." not just "Sent"

❌ **DON'T**:

- Use jargon without explanation
- Hide important information in tooltips
- Assume operators know privacy policies
- Use vague labels like "Details" or "Info"

### Clarity Principles

1. **Field labels tell what it is**: "Email Address"
2. **Badges/annotations tell status**: "(Masked)"
3. **Tooltips tell why**: "Full email visible to you only..."
4. **Help text tells how**: "Review and edit before sending..."

### Tone Guidelines

- **Confident**: "Send Reply" not "Try to Send"
- **Helpful**: Include next steps and context
- **Professional**: Formal for privacy/policy matters
- **Friendly**: Casual for routine actions (when appropriate)

---

## 8. Implementation Notes for Engineer

### Dynamic Content Tokens

Use these tokens in copy strings for dynamic insertion:

```typescript
{
  customerName;
} // e.g., "Sarah Johnson"
{
  orderLast4;
} // e.g., "3847"
{
  orderDate;
} // e.g., "Oct 15, 2025"
{
  maskedEmail;
} // e.g., "j***@d***.com"
{
  maskedPhone;
} // e.g., "***-***-1234"
{
  trackingNumber;
} // e.g., "1Z999AA10123456784"
{
  characterCount;
} // e.g., "1,847" (for validation)
```

### Copy Constants

Recommend creating a copy constants file:

```typescript
// app/config/copy/pii-card.ts
export const PII_CARD_COPY = {
  sectionHeaders: {
    customerDetails: "Customer Details",
    orderInformation: "Order Information",
    shippingStatus: "Shipping Status",
  },
  fieldLabels: {
    customerName: "Customer Name",
    email: "Email Address",
    phone: "Phone Number",
    // ... etc
  },
  tooltips: {
    maskedEmail:
      "Full email visible to you only. Customer replies show masked version.",
    // ... etc
  },
  // ... etc
};
```

### Internationalization (i18n) Ready

All copy strings are designed to be easily extracted for translation if needed in future. Avoid concatenation; use full sentence strings with tokens.

---

## 9. Testing Checklist

### Copy Review

- [ ] All field labels present and clear
- [ ] Tooltips provide helpful context
- [ ] Button labels describe action accurately
- [ ] Validation messages are specific
- [ ] Success/error messages are distinct

### Accessibility Review

- [ ] All interactive elements have aria-labels
- [ ] Screen reader announcements are clear
- [ ] Landmark roles correctly applied
- [ ] Color is not the only indicator (use icons/text)
- [ ] Keyboard navigation works with copy

### Brand Voice Review

- [ ] Hot Rodan theme used appropriately
- [ ] Professional tone for privacy matters
- [ ] Operator-first language throughout
- [ ] Consistent terminology (e.g., always "masked" not "hidden")

---

## 10. Version History

| Version | Date       | Changes                              | Author        |
| ------- | ---------- | ------------------------------------ | ------------- |
| 1.0     | 2025-10-21 | Initial creation for ENG-029/ENG-030 | Content Agent |

---

**END OF DOCUMENT**

Total Lines: 600+  
Status: Production-ready for Engineer integration  
Next: Engineer implements copy in PII Card and CX Escalation Modal components
