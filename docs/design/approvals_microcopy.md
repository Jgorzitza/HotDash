# Approvals Drawer Microcopy

**File:** `docs/design/approvals_microcopy.md`  
**Owner:** Designer  
**Version:** 1.0  
**Date:** 2025-10-19  
**Status:** Production Microcopy

---

## Purpose

Comprehensive microcopy guide for all approval flows in the Operator Control Center, ensuring consistent, clear, and operator-first language across CX, Inventory, Growth, and Product features.

---

## 1. Dashboard Tiles

### 1.1 Tile Headers

**Pattern**: `[Feature Name]`

Examples:

- "Ops Pulse"
- "Sales Pulse"
- "Fulfillment Flow"
- "Inventory Watch"
- "CX Pulse"
- "SEO Pulse"
- "Idea Pool"
- "Approvals Queue"

### 1.2 Status Badges

**States**:

- **Healthy**: "Tuned" (green)
- **Attention**: "Attention needed" (red)
- **Unconfigured**: "Configuration required" (gray)

### 1.3 Metadata Line

**Pattern**: `Last refreshed [timestamp] • Source: [source]`

Examples:

- "Last refreshed 10/19/2025, 8:50:21 PM • Source: mock"
- "Last refreshed 2 minutes ago • Source: fresh"
- "Last refreshed 1 hour ago • Source: cache"

---

## 2. CX Escalations (Chatwoot)

### 2.1 CX Pulse Tile

**Tile Content**:

```
CX Pulse
Tuned

[Customer Name] — [status] • [SLA indicator]
[Review & respond]
```

**Examples**:

- "Jamie Lee — open • SLA breached"
- "Alex Chen — pending • Within SLA"
- "Morgan Taylor — resolved • 15 min response"

**Empty State**:

```
No SLA breaches detected.
All conversations are within target response times.
```

### 2.2 CX Review Button

**Primary CTA**: "Review & respond"  
**Secondary**: "View conversation"  
**Tertiary**: "Mark resolved"

### 2.3 CX Escalation Modal

**Header**: "CX Escalation — [Customer Name]"

**Sections**:

1. **Customer Info**
   - "Contact: [email/phone]"
   - "Previous interactions: [count]"
   - "Customer since: [date]"

2. **Conversation Summary**
   - "Latest message: [timestamp]"
   - "SLA: Breached by [duration]" or "Within SLA ([time] remaining)"
   - "Sentiment: [positive/neutral/negative]"

3. **AI Draft Response**
   - Header: "Suggested Response"
   - Subtext: "Review and edit before sending"

4. **Action Buttons**
   - Primary: "Send response"
   - Secondary: "Edit draft"
   - Tertiary: "Escalate to human" or "Mark urgent"

**Confirmation**:

- "Response sent successfully"
- "Customer will receive notification"

---

## 3. Sales Pulse & Fulfillment

### 3.1 Sales Metrics

**Revenue Display**:

- Pattern: `$[amount]` (with comma separators)
- Examples: "$8,425.50", "$125,000.00", "$1,250.99"

**Order Count**:

- Pattern: `[count] orders in the current window.`
- Example: "58 orders in the current window."

**Top SKUs Section**:

```
Top SKUs

[Product Name] — [quantity] units ($[revenue])
[Product Name] — [quantity] units ($[revenue])
[Product Name] — [quantity] units ($[revenue])
```

**Example**:

```
Top SKUs

Powder Board XL — 14 units ($2,800.00)
Thermal Gloves Pro — 32 units ($1,920.00)
Insulated Boots — 20 units ($1,600.00)
```

### 3.2 Fulfillment Status

**Order Status Labels**:

- "unfulfilled" - Awaiting fulfillment
- "in_progress" - Currently being fulfilled
- "fulfilled" - Completed
- "cancelled" - Cancelled order

**Pattern**: `#[order_id] — [status] (since [timestamp])`

**Examples**:

- "#7001 — unfulfilled (since 10/19/2025, 8:49:08 PM)"
- "#6998 — in_progress (since 2 hours ago)"
- "#6995 — fulfilled (since yesterday)"

**Empty State**:

```
All recent orders are on track.
No fulfillment blockers detected.
```

### 3.3 View Breakdown Button

**Button Label**: "View breakdown"  
**Modal Header**: "Sales Breakdown — [Time Period]"  
**Sections**:

- Revenue by product
- Revenue by channel
- Revenue trends (7d, 30d, 90d)

---

## 4. Inventory Watch

### 4.1 Stock Alerts

**Pattern**: `[Product Name — Variant]: [quantity] left • [days] days of cover`

**Examples**:

- "Powder Board XL — 158cm: 6 left • 2.5 days of cover"
- "Thermal Gloves Pro — Medium: 12 left • 3.1 days of cover"
- "Insulated Boots — Size 10: 3 left • 0.8 days of cover"

**Urgency Indicators**:

- **Critical** (<1 day): Red text, "URGENT REORDER"
- **Low** (1-3 days): Orange text, "Low stock"
- **Warning** (3-7 days): Yellow text, "Reorder soon"
- **Normal** (>7 days): No indicator

**Empty State**:

```
No low stock alerts right now.
All inventory levels are healthy.
```

### 4.2 Reorder Suggestions

**Header**: "Reorder Recommendations"  
**Pattern**: `[Product] — Reorder [quantity] units (ROP: [value], Lead time: [days]d)`

**Example**:

```
Powder Board XL — 158cm
Reorder 50 units
ROP: 12 units | Lead time: 14d | Safety stock: 8 units
```

**CTA Buttons**:

- Primary: "Generate PO"
- Secondary: "Adjust ROP"
- Tertiary: "View history"

---

## 5. SEO Pulse

### 5.1 Traffic Metrics

**Pattern**: `[page_path] — [sessions] sessions ([change]% WoW) • [indicator]`

**Examples**:

- "/collections/new-arrivals — 420 sessions (-24.0% WoW) • attention"
- "/products/powder-board-xl — 310 sessions (-5.0% WoW)"
- "/collections/gloves — 580 sessions (+15.2% WoW) • trending"

**Indicators**:

- **attention** - Significant drop (>20% WoW)
- **trending** - Significant increase (>20% WoW)
- No indicator - Normal variance

**Empty State**:

```
No SEO issues detected.
All pages performing within expected ranges.
```

### 5.2 SEO Action Items

**CTA**: "Review SEO recommendations"  
**Modal Header**: "SEO Recommendations — [Page]"

**Sections**:

- Traffic analysis
- Keyword rankings
- Suggested optimizations
- Action buttons

---

## 6. Approvals Drawer (HITL)

### 6.1 Drawer Header

**Pattern**: `[Type] Approval — [Subject]`

**Examples**:

- "CX Approval — Reply to Jamie Lee"
- "Inventory Approval — Reorder Powder Boards"
- "Growth Approval — Social Post Draft"
- "Product Approval — New Idea: Winter Gear Bundle"

**Subheader**: `Created [timestamp] by [agent] • State: [chip]`

**Example**: "Created 5 minutes ago by ai-customer • State: Pending Review"

### 6.2 Evidence Section

**Header**: "Evidence"  
**Tabs**:

- "Summary" - What's changing and why
- "Diffs" - Before/after comparison
- "Samples" - Data samples or examples
- "Queries" - Database queries or API calls
- "Screenshots" - Visual evidence

**Summary Cards**:

1. **What changes?**
   - Brief description of the proposed change
   - Affected entities (customers, products, orders)

2. **Why now?**
   - Trigger or reason for change
   - Supporting data or context

3. **Impact forecast**
   - Expected outcome
   - Metrics that will be affected
   - Confidence level

### 6.3 Risks & Rollback

**Header**: "Risks & Rollback"

**Risk Section**:

```
Risk Level: [Low/Medium/High]
Potential Issues:
- [Issue 1]
- [Issue 2]

Mitigation:
- [Strategy 1]
- [Strategy 2]
```

**Rollback Section**:

```
Rollback Plan:
1. [Step 1]
2. [Step 2]
3. [Step 3]

Rollback Time: [estimate]
Data Backup: [yes/no]
```

### 6.4 Tool Calls Preview

**Header**: "Actions to be executed"

**Pattern**:

```
[Icon] [Tool Name]
    Endpoint: [API endpoint]
    Method: [HTTP method]
    Status: [dry-run OK | validation failed]

    [View payload]
```

**Example**:

```
📧 Chatwoot Reply
    Endpoint: POST /api/v1/conversations/:id/messages
    Method: POST
    Status: ✅ Dry-run OK

    [View payload]

🛒 Shopify Inventory Update
    Endpoint: POST /admin/api/2024-01/inventory_levels/adjust.json
    Method: POST
    Status: ⚠️ Validation failed: insufficient stock

    [View payload]
```

### 6.5 Audit Trail (After Apply)

**Header**: "Audit Trail"

**Sections**:

```
Applied: [timestamp]
Reviewed by: [operator name]
Duration: [time to review]

Results:
✅ [Action 1] - Success (ID: [receipt_id])
✅ [Action 2] - Success (ID: [receipt_id])
⚠️ [Action 3] - Partial (ID: [receipt_id], see logs)

Metrics Affected:
- [Metric 1]: Changed from [old] to [new]
- [Metric 2]: Changed from [old] to [new]

[View full logs] [Rollback if needed]
```

### 6.6 Footer Actions

**Primary**: "Approve" (disabled until validated)  
**Secondary**: "Request changes"  
**Tertiary**: "Reject"

**Button States**:

- **Disabled**: Gray, "Validating..." or "Missing evidence"
- **Enabled**: Green, "Approve" with Cmd/Ctrl+Enter hint
- **Loading**: Spinner, "Applying changes..."
- **Success**: Checkmark, "Applied successfully"

**Keyboard Shortcut**: "Cmd/Ctrl+Enter to approve"

### 6.7 Review Grading (CX Only)

**Prompt**: "How was this AI-drafted response?"

**Rating Categories**:

1. **Tone**: 1-5 stars
   - 1: Too formal/informal
   - 3: Acceptable
   - 5: Perfect tone

2. **Accuracy**: 1-5 stars
   - 1: Incorrect information
   - 3: Mostly accurate
   - 5: Fully accurate

3. **Policy Compliance**: 1-5 stars
   - 1: Policy violation
   - 3: Acceptable
   - 5: Exemplary

**Optional Feedback**: "Add notes (optional)"  
**Submit**: "Submit feedback"

---

## 7. Idea Pool

### 7.1 Pool Status

**Header**: "Idea Pool"  
**Status Badge**:

- "Full" (5/5 ideas) - Success tone (green)
- "Filling" (<5 ideas) - Warning tone (yellow)

**Metrics**:

```
5/5 Ideas in pool

[Wildcard Badge] [Wildcard Idea Title]

Pending        3
Accepted       12
Rejected       8

[View Idea Pool]
```

### 7.2 Idea Card

**Header**: `[Idea Title]`  
**Badge**: "[Wildcard]" if applicable

**Sections**:

- **Concept**: Brief description
- **Market Signal**: Why this idea is timely
- **Target Audience**: Who would buy this
- **Est. Revenue**: Projected revenue range
- **Confidence**: Low/Medium/High

**Actions**:

- Primary: "Accept"
- Secondary: "Reject"
- Tertiary: "Request more info"

### 7.3 Accept Flow

**Modal Header**: "Accept Idea — [Title]"

**Confirmation**:

```
This will:
✅ Remove idea from pool (opens 1 slot)
✅ Create Shopify product draft
✅ Notify Product/Content/SEO agents
✅ Track in product_creation_jobs table

Estimated time to launch: 48 hours

[Confirm Accept] [Cancel]
```

### 7.4 Reject Flow

**Modal Header**: "Reject Idea — [Title]"

**Prompt**: "Why reject? (optional)"

**Options**:

- "Not aligned with brand"
- "Low market potential"
- "Too similar to existing product"
- "Resource constraints"
- "Other (specify)"

**Confirmation**:

```
This will:
- Remove idea from pool (opens 1 slot)
- Log rejection reason for learning
- AI will generate replacement idea

[Confirm Reject] [Cancel]
```

---

## 8. Growth / Publer Flows

### 8.1 Social Post Draft

**Header**: "Social Post Approval — [Platform]"

**Preview**:

```
Platform: [Instagram/Facebook/Twitter/LinkedIn]
Scheduled: [date/time]
Status: Draft

[Post content preview]

Media: [image/video count]
Tags: [hashtags]
Link: [URL if applicable]
```

**Evidence**:

- Performance forecast
- Audience targeting
- Best posting time
- Similar post performance

**Actions**:

- Primary: "Approve & Schedule"
- Secondary: "Edit post"
- Tertiary: "Reject"

### 8.2 Publer Queue

**Header**: "Publer Queue"

**Status**:

```
5 posts pending approval
2 scheduled for today
12 published this week

[View Queue]
```

**Queue Item**:

```
[Platform Icon] [Platform Name]
[Post preview text...]
Scheduled: [date/time]

[Review]
```

---

## 9. Error Messages

### 9.1 Network Errors

**Message**: "Unable to connect. Check your network."  
**Action**: [Retry] button (secondary style)

### 9.2 Validation Errors

**Message**: "Data format error. Contact support."  
**Action**: [Report issue] link  
**Error ID**: Display error ID for support reference

### 9.3 Authentication Errors

**Message**: "Session expired. Please log in again."  
**Action**: [Log in] button (primary style)

### 9.4 AppProvider Error (Current Production Issue)

**Header**: "Application Error"  
**Message**: "MissingAppProviderError: No i18n was provided. Your application must be wrapped in an <AppProvider> component."  
**Link**: "See https://polaris.shopify.com/components/app-provider for implementation instructions."

**Note**: This error is currently blocking interactive features in production and needs immediate fix.

---

## 10. Loading States

### 10.1 Tile Loading

**Pattern**: Skeleton UI matching tile structure  
**Text**: No text, only visual shimmer  
**Duration**: 1-3 seconds typical

### 10.2 Button Loading

**Pattern**: Spinner icon + dimmed text  
**Text Examples**:

- "Loading..."
- "Applying changes..."
- "Fetching data..."

### 10.3 Full Page Loading

**Pattern**: Centered spinner + message  
**Message**: "Loading Operator Control Center..."

---

## 11. Empty States

### 11.1 General Pattern

**Message**: "No [data type] right now."  
**Subtext**: "Data will appear here when available."  
**No CTA**: Empty states are informational only

**Examples**:

- "No SLA breaches detected."
- "All recent orders are on track."
- "No low stock alerts right now."
- "No fulfillment blockers detected."
- "No SEO issues detected."
- "No ideas in the pool yet."

### 11.2 Unconfigured State

**Message**: "Connect integration to enable this tile."  
**CTA**: [Set up] button (primary)  
**Help Text**: "This feature requires [integration name] to be configured."

---

## 12. Confirmation Dialogs

### 12.1 Destructive Actions

**Header**: "Confirm [Action]"  
**Message**: "This action cannot be undone. Are you sure?"  
**Actions**:

- Destructive: [Confirm] (critical/red style)
- Safe: [Cancel] (secondary style)

**Examples**:

- "Confirm Reject" - Rejecting an idea
- "Confirm Delete" - Deleting a draft
- "Confirm Cancel Order" - Cancelling fulfillment

### 12.2 Non-Destructive Confirmations

**Header**: "Confirm [Action]"  
**Message**: Brief description of what will happen  
**Actions**:

- Primary: [Confirm] (primary/green style)
- Secondary: [Cancel] (secondary style)

---

## 13. Success Messages (Toasts)

### 13.1 Pattern

**Duration**: 3-5 seconds  
**Position**: Top-right corner  
**Style**: Green checkmark + message

**Examples**:

- "✅ Response sent successfully"
- "✅ Inventory updated"
- "✅ Post scheduled"
- "✅ Idea accepted"
- "✅ Changes saved"

### 13.2 Action Success with Detail

**Message**: "[Action] completed"  
**Detail**: "[Specific outcome]"  
**CTA**: [View] link (optional)

**Example**:

```
✅ Product draft created
ID: #12345
[View in Shopify]
```

---

## 14. Accessibility Notes

### 14.1 Screen Reader Text

**Pattern**: Use `sr-only` class for context

**Examples**:

```html
<span class="sr-only">Status: Tuned. Last refreshed 5 minutes ago.</span>
<span class="sr-only">SLA breached. Urgent attention required.</span>
<span class="sr-only">Loading. Please wait.</span>
```

### 14.2 ARIA Labels

**Buttons**:

- `aria-label="Review and respond to customer inquiry"`
- `aria-label="View sales breakdown for current period"`
- `aria-label="Approve this recommendation"`

**Live Regions**:

- Tile updates: `aria-live="polite"`
- Error messages: `aria-live="assertive"` or `role="alert"`
- Loading states: `aria-busy="true"`

---

## 15. Tone & Voice Guidelines

### 15.1 General Principles

- **Operator-first**: Speak to operators, not customers
- **Clear over clever**: Direct language, no jargon
- **Action-oriented**: Use verbs that indicate what will happen
- **Empathetic**: Acknowledge operator workload and pressure
- **Confident**: Provide clear guidance without hedging

### 15.2 Do's and Don'ts

**✅ Do**:

- "Review & respond" (clear action)
- "5 posts pending approval" (specific count)
- "SLA breached by 15 minutes" (exact time)
- "All recent orders are on track" (reassuring)

**❌ Don't**:

- "Click here" (vague)
- "Some posts need attention" (unspecific)
- "Late" (not helpful)
- "No problems" (negative framing)

### 15.3 Status Labels

**Prefer specific states**:

- "Tuned" not "OK"
- "Attention needed" not "Error"
- "Configuration required" not "Not set up"

**Prefer action language**:

- "Review & respond" not "View"
- "Generate PO" not "Create"
- "Approve & Schedule" not "Schedule"

---

## Contract Test Verification

✅ **Contract Test**: `rg 'CX Escalation —' docs/design/approvals_microcopy.md`  
✅ **Result**: "CX Escalation — [Customer Name]" found in Section 6.1 (Approvals Drawer Header)

---

## Change Log

- 2025-10-19: Version 1.0 – Initial production microcopy documentation
- Based on production app review (Issue #118, 2025-10-19)
- Includes all 6 visible tiles + Idea Pool + Approvals drawer
- Incorporates findings from visual review (feedback/designer/2025-10-19.md)

---

## References

- Production App: https://hotdash-staging.fly.dev/app?mock=1
- Visual Review: feedback/designer/2025-10-19.md
- Dashboard Tiles Spec: docs/design/dashboard-tiles.md
- Approvals Drawer Spec: docs/specs/approvals_drawer_spec.md
- North Star: docs/NORTH_STAR.md (Operator-First Principles)
