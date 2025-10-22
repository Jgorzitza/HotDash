# Microcopy Guide: Enhanced Modals (Phase 2 - P1)

**File:** `docs/specs/microcopy-enhanced-modals.md`  
**Owner:** Content Agent  
**Version:** 1.0  
**Date:** 2025-10-20  
**Status:** Ready for Engineer Implementation  
**Reference:** `docs/design/approvals_microcopy.md`, `docs/design/modal-refresh-handoff.md`

---

## Purpose

Microcopy guidance for enhanced CX, Sales, and Inventory modals (Phase 2, Priority P1). Includes grading sliders, conversation previews, and action dropdowns.

---

## 1. Enhanced CX Escalation Modal

### 1.1 Modal Header

**Pattern:**

```
CX Escalation — [Customer Name]
```

**Examples:**

- "CX Escalation — Jamie Lee"
- "CX Escalation — Alex Chen"

**Close Button:**

```
aria-label="Close CX escalation"
```

### 1.2 Customer Info Section

**Section Header:**

```
Customer
```

**Info Pattern:**

```
[Customer Name]
[email/phone]
Customer since [date]
Previous interactions: [count]
```

**Example:**

```
Customer

Jamie Lee
jamie@example.com
Customer since Oct 2024
Previous interactions: 3
```

### 1.3 Conversation Summary

**Section Header:**

```
Conversation
```

**Pattern:**

```
Status: [Open/Pending/Resolved]
Priority: [Normal/High/Urgent]
SLA: [status]
Latest message: [timestamp]
```

**SLA States:**

- Within SLA: "Within SLA (45 min remaining)"
- Breached: "SLA breached by 2h 15m"

**Example:**

```
Conversation

Status: Open
Priority: High
SLA: Breached by 2h 15m
Latest message: 2 hours ago
```

### 1.4 Conversation Preview (Scrollable)

**Section Header:**

```
Conversation History
```

**Message Pattern:**

```
[Sender] • [timestamp]
[Message content]
```

**Example:**

```
Conversation History
─────────────────────────────
Jamie • 2 hours ago
Where is my order? I ordered 3 days ago.

You (AI Draft) • Just now
Hi Jamie, I can see your order #7001 shipped yesterday...
```

### 1.5 AI Suggested Reply

**Section Header:**

```
Suggested Response
```

**Subtext:**

```
Review and edit before sending
```

**Textarea Label:**

```
Reply (editable)
```

**Character Count:**

```
[X] / 500 characters
```

### 1.6 Internal Notes

**Section Header:**

```
Internal Notes
```

**Subtext:**

```
For team eyes only — not visible to customer
```

**Textarea Placeholder:**

```
Add context, next steps, or escalation notes...
```

### 1.7 Grading Sliders

**Section Header:**

```
Grade This Response
```

**Subtext:**

```
Helps AI improve future replies
```

**Slider 1: Tone**

```
Tone
Friendly • Professional • Empathetic
```

**Scale:** 1-5

- 1 = "Too casual"
- 3 = "Just right"
- 5 = "Perfect tone"

**Slider 2: Accuracy**

```
Accuracy
Correct • Complete • Helpful
```

**Scale:** 1-5

- 1 = "Inaccurate"
- 3 = "Mostly accurate"
- 5 = "Perfectly accurate"

**Slider 3: Policy**

```
Policy Compliance
Follows brand guidelines
```

**Scale:** 1-5

- 1 = "Violates policy"
- 3 = "Mostly compliant"
- 5 = "Fully compliant"

**Note:** Grading is **required** before sending

### 1.8 Action Buttons

**Primary Action:**

```
Send Response
```

**Loading State:**

```
Sending...
```

**Success State (Toast):**

```
Response sent! Customer will be notified.
```

**Secondary Actions:**

- "Edit Draft" - Inline editing enabled
- "Escalate to Manager" - Flags conversation
- "Mark Resolved" - Closes without sending
- "Cancel" - Closes modal

### 1.9 Multiple Action Example

**Action Dropdown:**

```
What would you like to do?
[Send Response ▼]
```

**Options:**

- Send Response
- Send & Escalate
- Send & Close
- Save Draft
- Discard

**Dynamic CTA:** Button text matches selected action

---

## 2. Enhanced Sales Pulse Modal

### 2.1 Modal Header

**Pattern:**

```
Sales Pulse — [Time Period]
```

**Examples:**

- "Sales Pulse — Last 24 Hours"
- "Sales Pulse — This Week"

### 2.2 Snapshot Section

**Section Header:**

```
Snapshot
```

**Metrics Pattern:**

```
Revenue: $[amount] ([WoW change])
Orders: [count]
Avg order value: $[amount]
```

**Example:**

```
Snapshot (Last 24h)

Revenue: $8,425.50 (▲ 12% WoW)
Orders: 58
Avg order value: $145.27
```

**Change Indicators:**

- Positive: "▲ 12% WoW" (green)
- Negative: "▼ 8% WoW" (red)
- No change: "— 0% WoW" (gray)

### 2.3 Top SKUs

**Section Header:**

```
Top SKUs
```

**Pattern:**

```
[Product Name] — [qty] units ($[revenue])
```

**Example:**

```
Top SKUs

Powder Board XL — 14 units ($2,800.00)
Thermal Gloves Pro — 32 units ($1,920.00)
Insulated Boots — 20 units ($1,600.00)
```

### 2.4 Action Dropdown

**Section Header:**

```
Action
```

**Dropdown Label:**

```
What do you want to do?
```

**Options:**

- "Log follow-up"
- "Escalate to ops"
- "Flag for review"
- "Mark as reviewed"

**Example:**

```
Action

What do you want to do?  [Log follow-up ▼]
```

### 2.5 Notes Section

**Section Header:**

```
Notes
```

**Subtext:**

```
Audit trail — visible to team
```

**Textarea Placeholder:**

```
Document decisions, next steps, or observations...
```

**Example:**

```
Notes

Followed up with ops team about high demand for Powder Board XL.
Recommending reorder of 50 units.
```

### 2.6 Action Button

**Dynamic Label:** Matches dropdown selection

**Examples:**

- "Log Follow-up"
- "Escalate to Ops"
- "Flag for Review"

**Success Toast:**

```
Action logged. Ops team has been notified.
```

---

## 3. Enhanced Inventory Modal

### 3.1 Modal Header

**Pattern:**

```
Inventory Alert — [Product Name]
```

**Examples:**

- "Inventory Alert — Powder Board XL"
- "Inventory Alert — Thermal Gloves Pro"

### 3.2 Current Status

**Pattern:**

```
SKU: [sku]
Current Stock: [qty] units
Threshold: [qty] units
Days of Cover: [days] days
```

**Example:**

```
SKU: BOARD-XL-158
Current Stock: 6 units
Threshold: 10 units
Days of Cover: 2.5 days
```

**Status Indicator:**

- Critical (<1 day): Red badge "Urgent reorder"
- Low (1-3 days): Yellow badge "Low stock"
- OK (>3 days): Green badge "Adequate stock"

### 3.3 Velocity Analysis

**Section Header:**

```
14-Day Velocity Analysis
```

**Metrics:**

```
Avg daily sales: [qty] units
Peak day: [qty] units (on [date])
Slowest day: [qty] units (on [date])
Trend: [rising/stable/declining]
```

**Example:**

```
14-Day Velocity Analysis

Avg daily sales: 2.4 units
Peak day: 5 units (Oct 15)
Slowest day: 0 units (Oct 12 - Sunday)
Trend: Rising (+15% last 7 days)
```

**Mini Chart:** Include sparkline if possible

### 3.4 Reorder Recommendation

**Section Header:**

```
Recommended Reorder
```

**Pattern:**

```
Quantity: [qty] units ([days]-day supply)
Vendor: [vendor name]
Est. cost: $[amount]
Lead time: [days] days
```

**Example:**

```
Recommended Reorder

Quantity: 24 units (10-day supply)
Vendor: Snowboard Supply Co.
Est. cost: $1,440.00
Lead time: 3-5 days
```

### 3.5 Quantity Adjustment

**Section Header:**

```
Adjust Quantity
```

**Input Field:**

```
Quantity: [24] units
```

**Helper Text:**

```
Based on current velocity + safety stock
```

**Validation:**

- Min: 1 unit
- Max: 999 units
- Suggested: Pre-filled based on velocity

### 3.6 Action Buttons

**Primary:**

```
Approve Reorder
```

**Secondary:**

- "Skip for Now"
- "Remind Me Later"
- "Cancel"

**Success Toast:**

```
Reorder approved! PO created and sent to [vendor].
```

**Confirmation:**

```
PO #[number] sent to [vendor]
Expected delivery: [date]
[View PO] [Dismiss]
```

---

## 4. Error States (All Modals)

**Failed to Load:**

```
Unable to load details.
[Retry] [Dismiss]
```

**Failed to Save:**

```
Action failed. Changes were not saved.
[Retry] [Discard Changes]
```

**Network Error:**

```
Connection lost. Check your internet.
[Retry]
```

---

## 5. Loading States (All Modals)

**Initial Load:**

```
Loading details...
```

**Saving:**

```
Saving...
```

**Sending:**

```
Sending response...
```

---

## 6. CEO Tone Alignment

✅ **Voice Attributes:**

- Conversational: "What would you like to do?"
- Action-oriented: "Approve Reorder" not "Submit reorder request"
- Clear and direct: "6 units" not "Six (6) units currently available"
- Helpful: "Review and edit before sending" (guidance)

✅ **Language Style:**

- Short headings: "Snapshot" not "Sales Performance Snapshot"
- Natural flow: "Avg daily sales: 2.4 units"
- Positive framing: "Adequate stock" not "Not low"

❌ **Avoid:**

- Corporate jargon: "Per company policy..."
- Passive voice: "The response will be sent..."
- Redundancy: "Please review and edit the response before sending it to the customer"

---

## 7. Hot Rodan Brand Theme

**Success Messages:**

- "Response sent!" (enthusiastic)
- "Reorder approved!" (action completed)
- "Action logged." (professional confirmation)

**Avoid Overuse:** Don't force speed metaphors in every modal

---

## 8. Accessibility

**Modal:**

```
role="dialog"
aria-labelledby="modal-title"
aria-modal="true"
```

**Focus Trap:** First focusable element on open

**Close Button:**

```
aria-label="Close [modal name]"
```

**Sliders:**

```
aria-label="Rate [aspect] from 1 to 5"
aria-valuenow="[current]"
aria-valuemin="1"
aria-valuemax="5"
```

---

## Reference

**Source:** `docs/design/approvals_microcopy.md` (lines 54-400)  
**Design Spec:** `docs/design/modal-refresh-handoff.md`  
**Wireframes:** `docs/design/dashboard_wireframes.md` (lines 126-240)

---

## Version History

- **1.0** (2025-10-20): Initial microcopy guidance for Phase 2 enhanced modals
