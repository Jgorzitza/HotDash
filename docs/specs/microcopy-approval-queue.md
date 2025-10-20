# Microcopy Guide: Approval Queue (Phase 1 - P0)

**File:** `docs/specs/microcopy-approval-queue.md`  
**Owner:** Content Agent  
**Version:** 1.0  
**Date:** 2025-10-20  
**Status:** Ready for Engineer Implementation  
**Reference:** `docs/design/approvals_microcopy.md`

---

## Purpose

Microcopy guidance for the Approval Queue route (`/approvals`) and ApprovalCard component (Phase 1, Priority P0). Ensures all text matches CEO tone, Hot Rodan brand voice, and operator-first language.

---

## 1. Approvals Queue Tile (Dashboard)

**Location:** Dashboard tile linking to `/approvals`

**Tile Header:**
```
Approvals Queue
```

**Status Badge:**
- Healthy (0-2 pending): "Tuned" (green)
- Attention (3-10 pending): "Attention needed" (yellow)
- Critical (>10 pending): "Queue backlog" (red)

**Pending Count Display:**
```
[X] pending approvals
```

**Examples:**
- "0 pending approvals" → Badge: "Tuned"
- "3 pending approvals" → Badge: "Attention needed"
- "12 pending approvals" → Badge: "Queue backlog"

**Oldest Pending Time:**
```
Oldest: [relative time]
```

**Examples:**
- "Oldest: 5 min ago"
- "Oldest: 2 hours ago"
- "Oldest: 1 day ago"

**CTA Button:**
```
Review queue
```

**Empty State:**
```
All clear! No pending approvals.
Operations are running smoothly.
```

---

## 2. Approvals Queue Route (`/approvals`)

**Page Title:**
```
Approval Queue
```

**Pending Count Badge:**
```
[X] Pending
```

**Auto-refresh Indicator:**
```
Auto-refreshing every 5 seconds
```

**Manual Refresh Button:**
```
Refresh now
```

**Empty State (No Pending Approvals):**

**Heading:**
```
All clear!
```

**Body:**
```
No pending approvals at the moment.
All agent actions have been reviewed.
```

**Illustration:** Use empty state checkmark or "thumbs up" icon

---

## 3. ApprovalCard Component

### 3.1 Card Header

**Pattern:**
```
[Tool Name] — [Agent Name]
```

**Examples:**
- "Send Email — ai-customer"
- "Create Refund — ai-customer"
- "Update Inventory — inventory-agent"

### 3.2 Risk Badge

**HIGH Risk:**
```
HIGH RISK
```

**Color:** Red (#D82C0D)  
**Tools:** send_email, create_refund, cancel_order, charge_customer

**MEDIUM Risk:**
```
MEDIUM RISK
```

**Color:** Yellow (#FFA500)  
**Tools:** create_private_note, update_conversation, add_tag

**LOW Risk:**
```
LOW RISK
```

**Color:** Gray (#637381)  
**Tools:** All other tools

### 3.3 Metadata Line

**Pattern:**
```
Requested [relative time] • Conversation #[id]
```

**Examples:**
- "Requested 5 min ago • Conversation #123"
- "Requested 2 hours ago • Conversation #456"
- "Requested 1 day ago • Conversation #789"

### 3.4 Tool Arguments Display

**Section Header:**
```
Action Details:
```

**Pattern:** Display as key-value pairs

**Example:**
```
Action Details:

To: customer@example.com
Subject: Re: Order #7001 Status
Body: "Hi Jamie, your order is on its way! Tracking: ABC123..."
```

### 3.5 Evidence Section (if available)

**Section Header:**
```
Evidence:
```

**Pattern:** Display relevant data supporting the action

**Example:**
```
Evidence:

• Customer waiting 2h 15m (SLA breached)
• Order #7001 shipped yesterday
• Tracking number: ABC123XYZ456
```

### 3.6 Action Buttons

**Primary (Approve):**
```
Approve
```

**State - Loading:**
```
Approving...
```

**State - Success:**
```
Approved ✓
```

**Secondary (Reject):**
```
Reject
```

**State - Loading:**
```
Rejecting...
```

**State - Success:**
```
Rejected
```

### 3.7 Confirmation Messages (Toast)

**Approve Success:**
```
Pit stop complete! Action approved and executed.
```

**Approve Error:**
```
Approval failed. Please try again or contact support.
[Retry] [Dismiss]
```

**Reject Success:**
```
Action rejected. Agent will not proceed.
```

**Reject Error:**
```
Rejection failed. Please try again.
[Retry] [Dismiss]
```

---

## 4. Approval History Link

**Nav Link Text:**
```
View history
```

**Location:** Bottom of approval queue page

**Pattern:**
```
→ View history
```

---

## 5. Keyboard Shortcuts (Accessibility)

**Approve:** `Ctrl/Cmd + Enter`  
**Reject:** `Ctrl/Cmd + Backspace`  
**Next Card:** `↓` or `J`  
**Previous Card:** `↑` or `K`

**Tooltip Text:**
```
Keyboard shortcuts: Enter (approve), Backspace (reject), ↑/↓ (navigate)
```

---

## 6. Error States

**Network Error:**
```
Connection lost. Check your internet and try again.
[Retry]
```

**Server Error:**
```
Something went wrong on our end. Our team has been notified.
[Retry] [Contact Support]
```

**Timeout:**
```
This action is taking longer than expected.
[Keep Waiting] [Cancel]
```

---

## 7. Loading States

**Initial Load:**
```
Loading approval queue...
```

**Refreshing:**
```
Checking for new approvals...
```

**Spinner + Text:** Use Polaris Spinner component

---

## 8. Accessibility Labels (ARIA)

**ApprovalCard:**
```
aria-label="Approval request: [tool] from [agent], requested [time] ago"
```

**Approve Button:**
```
aria-label="Approve [tool] action from [agent]"
```

**Reject Button:**
```
aria-label="Reject [tool] action from [agent]"
```

**Risk Badge:**
```
aria-label="Risk level: [HIGH/MEDIUM/LOW]"
```

---

## 9. CEO Tone Alignment

✅ **Voice Attributes:**
- Authentic and conversational (not corporate)
- Clear and action-oriented
- Speed theme: "Pit stop complete" (success message)
- Operator-first: "All clear!" (positive reinforcement)

✅ **Language Style:**
- Uses contractions: "you're", "it's"
- Active voice: "Approve" not "Approval requested"
- Short, punchy: "All clear!" not "There are no pending approvals"
- Technical terms natural: "Conversation #123" clear and direct

❌ **Avoid:**
- Corporate speak: "Please be advised..."
- Passive voice: "The action was approved..."
- Overly formal: "Your approval is required for..."
- Jargon without context: "Action requires validation..."

---

## 10. Hot Rodan Brand Theme

🏎️ **Speed Metaphors (Use sparingly):**
- Success: "Pit stop complete!"
- Empty state: "All clear!" (racing flag)
- Status: "Tuned" (well-maintained engine)

**Primary Color:** Hot Rodan Red (#E74C3C)
- Use for approve button (primary action)
- Use for high-risk badges (draws attention)

---

## 11. Implementation Checklist

**Engineer Tasks (ENG-001 to ENG-004):**

- [ ] Approval Queue route (`/approvals`)
  - [ ] Page title: "Approval Queue"
  - [ ] Pending count badge
  - [ ] Auto-refresh indicator
  - [ ] Empty state with heading and body
  
- [ ] ApprovalCard component
  - [ ] Card header: tool name + agent name
  - [ ] Risk badge (HIGH/MEDIUM/LOW)
  - [ ] Metadata line with relative time
  - [ ] Tool arguments display
  - [ ] Evidence section (if available)
  - [ ] Action buttons (Approve/Reject)
  - [ ] Loading states
  - [ ] Error states
  
- [ ] Toast notifications
  - [ ] Success messages (brand theme)
  - [ ] Error messages with retry
  
- [ ] Accessibility
  - [ ] ARIA labels for all interactive elements
  - [ ] Keyboard shortcuts
  - [ ] Screen reader announcements

**Designer Validation (DES-002):**

- [ ] Visual QA on all microcopy placement
- [ ] Verify CEO tone matches guidelines
- [ ] Check Hot Rodan brand alignment
- [ ] Confirm accessibility contrast ratios

---

## 12. Examples in Context

### Example 1: High-Risk Email Approval

```
┌────────────────────────────────────────────────┐
│ Send Email — ai-customer          [HIGH RISK] │
├────────────────────────────────────────────────┤
│ Requested 5 min ago • Conversation #123        │
│                                                │
│ Action Details:                                │
│ To: jamie@example.com                          │
│ Subject: Re: Where is my order?                │
│ Body: "Hi Jamie, your order #7001 shipped     │
│ yesterday! Tracking: ABC123..."                │
│                                                │
│ Evidence:                                      │
│ • Customer waiting 2h 15m (SLA breached)      │
│ • Order #7001 shipped Oct 19                  │
│                                                │
│ [Approve]  [Reject]                           │
└────────────────────────────────────────────────┘
```

### Example 2: Medium-Risk Note Creation

```
┌────────────────────────────────────────────────┐
│ Create Private Note — ai-customer [MEDIUM RISK]│
├────────────────────────────────────────────────┤
│ Requested 12 min ago • Conversation #456       │
│                                                │
│ Action Details:                                │
│ Note: "Customer requesting refund. Product     │
│ damaged during shipping. Photos provided."     │
│                                                │
│ [Approve]  [Reject]                           │
└────────────────────────────────────────────────┘
```

### Example 3: Empty State

```
┌────────────────────────────────────────────────┐
│              Approval Queue                    │
│                 [0 Pending]                    │
├────────────────────────────────────────────────┤
│                                                │
│                   ✓                           │
│                                                │
│              All clear!                        │
│                                                │
│    No pending approvals at the moment.        │
│    All agent actions have been reviewed.      │
│                                                │
│           → View history                       │
└────────────────────────────────────────────────┘
```

---

## Reference

**Source:** `docs/design/approvals_microcopy.md` (lines 1-350)  
**Design Spec:** `docs/design/HANDOFF-approval-queue-ui.md`  
**Component Spec:** `docs/design/approvalcard-component-spec.md`

---

## Version History

- **1.0** (2025-10-20): Initial microcopy guidance for Phase 1 approval queue

