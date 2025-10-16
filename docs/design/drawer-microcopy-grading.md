# Approvals Drawer Microcopy & Grading Rubric

**File:** `docs/design/drawer-microcopy-grading.md`  
**Owner:** Designer  
**Version:** 1.0  
**Date:** 2025-10-15  
**Status:** Complete  
**Purpose:** Microcopy and grading rubric hints for Approvals Drawer

---

## 1. Drawer Section Headings

### 1.1 Header
- **Title Format:** `[Type] · [Summary]`
- **Example:** "CX Reply · Shipping delay apology"
- **Meta:** "Created [time] ago by [agent]"

### 1.2 Evidence Section
- **Heading:** "Evidence"
- **Subheading:** "Review the data that informed this suggestion"
- **Tab Labels:** "Diffs", "Samples", "Queries", "Screenshots"

### 1.3 Risks & Rollback Section
- **Heading:** "Risks & Rollback"
- **Subheading:** "Understand potential issues and recovery plan"
- **Risk Label:** "Identified risks"
- **Rollback Label:** "Rollback steps"

### 1.4 Tool Calls Preview Section
- **Heading:** "Actions"
- **Subheading:** "These actions will be executed if approved"
- **Status Labels:** "Validated", "Pending validation", "Failed validation"

### 1.5 Audit Section (After Apply)
- **Heading:** "Audit Trail"
- **Subheading:** "Record of actions taken"
- **Receipt Label:** "Action receipts"
- **Metrics Label:** "Impact metrics"

---

## 2. Button Labels

### 2.1 Primary Actions
- **Approve:** "Approve" (not "Accept", "Confirm", "OK")
- **Reject:** "Reject" (not "Decline", "Deny", "Cancel")
- **Request Changes:** "Request changes" (not "Send back", "Revise")

### 2.2 Secondary Actions
- **Close:** "Close" (not "Cancel", "Dismiss")
- **View Details:** "View details" (not "More info", "Expand")
- **Edit Risk:** "Edit" (not "Modify", "Change")

### 2.3 Loading States
- **Approving:** "Approving..." (not "Processing", "Please wait")
- **Rejecting:** "Rejecting..." (not "Processing", "Please wait")
- **Validating:** "Validating..." (not "Checking", "Verifying")

---

## 3. Status Messages

### 3.1 Success Messages
- **Approved:** "Action approved successfully"
- **Rejected:** "Action rejected"
- **Changes Requested:** "Changes requested. Agent will revise."

### 3.2 Error Messages
- **Network Error:** "Unable to connect. Check your network and try again."
- **Validation Error:** "Validation failed. Review the errors below."
- **Permission Error:** "You don't have permission to approve this action."

### 3.3 Warning Messages
- **High Risk:** "This action has high risk. Review carefully before approving."
- **No Rollback:** "No rollback plan provided. Proceed with caution."
- **Stale Data:** "This approval is based on data from [time] ago. Refresh before approving."

---

## 4. Grading Rubric (HITL)

### 4.1 When to Show Grading
- **Trigger:** After clicking "Approve", before applying
- **Applies to:** CX replies, social posts (customer-facing content)
- **Does not apply to:** Inventory, internal actions

### 4.2 Grading Modal

**Title:** "Grade this suggestion"

**Subtitle:** "Your feedback helps the AI improve"

**Fields:**
1. **Tone** (1-5 scale)
2. **Accuracy** (1-5 scale)
3. **Policy Compliance** (1-5 scale)
4. **Notes** (optional text field)

**Buttons:**
- Primary: "Submit & Apply"
- Secondary: "Skip grading"

### 4.3 Tone Grading Scale

**Label:** "How appropriate is the tone?"

**Scale:**
- **5 - Excellent:** Perfect tone, empathetic, professional
- **4 - Good:** Good tone, minor adjustments needed
- **3 - Acceptable:** Acceptable, needs improvement
- **2 - Poor:** Poor tone, significant issues
- **1 - Unacceptable:** Completely inappropriate, rewrite needed

**Hint:** "Consider empathy, professionalism, and brand voice"

### 4.4 Accuracy Grading Scale

**Label:** "How accurate is the information?"

**Scale:**
- **5 - Excellent:** Completely accurate, all facts correct
- **4 - Good:** Mostly accurate, minor corrections needed
- **3 - Acceptable:** Acceptable, some errors present
- **2 - Poor:** Significant inaccuracies
- **1 - Unacceptable:** Mostly incorrect, major errors

**Hint:** "Check facts, dates, order details, and policies"

### 4.5 Policy Compliance Grading Scale

**Label:** "Does this comply with company policies?"

**Scale:**
- **5 - Excellent:** Fully compliant with all policies
- **4 - Good:** Compliant, minor policy notes
- **3 - Acceptable:** Acceptable, some policy concerns
- **2 - Poor:** Policy violations present
- **1 - Unacceptable:** Major policy violations

**Hint:** "Review refund policy, shipping policy, and brand guidelines"

### 4.6 Notes Field

**Label:** "Additional notes (optional)"

**Placeholder:** "What could be improved? What was done well?"

**Character limit:** 500 characters

**Hint:** "Your notes help the AI learn and improve"

---

## 5. Empty States

### 5.1 No Evidence
**Message:** "No evidence provided for this suggestion."  
**Action:** None (warning only)

### 5.2 No Risks Identified
**Message:** "No risks identified. Proceed with standard caution."  
**Tone:** Neutral (not success, not warning)

### 5.3 No Rollback Plan
**Message:** "No rollback plan provided. Document recovery steps before approving."  
**Action:** "Add rollback plan" button (editable field)

### 5.4 No Tool Calls
**Message:** "No actions defined. This approval has no effect."  
**Tone:** Warning

---

## 6. Validation Messages

### 6.1 Evidence Validation
- **Missing Diffs:** "No diffs provided. Add before/after comparison."
- **Missing Samples:** "No samples provided. Add example data."
- **Missing Queries:** "No queries provided. Add supporting queries."

### 6.2 Risk Validation
- **High Risk, No Rollback:** "High risk action requires rollback plan."
- **Customer Impact, No Review:** "Customer-facing action requires human review."

### 6.3 Tool Call Validation
- **Invalid Arguments:** "Tool call arguments are invalid. Review and correct."
- **Missing Required Field:** "Required field '[field]' is missing."
- **Dry Run Failed:** "Dry run failed. Review errors before approving."

---

## 7. Confirmation Dialogs

### 7.1 High Risk Approval

**Title:** "Confirm high risk action"

**Message:** "This action has high risk. Are you sure you want to approve?"

**Details:**
- Risk level: High
- Affected: [customers/orders/inventory]
- Rollback: [available/not available]

**Buttons:**
- Primary: "Yes, approve" (critical tone)
- Secondary: "Cancel"

### 7.2 No Rollback Approval

**Title:** "No rollback plan"

**Message:** "This action has no rollback plan. Proceed with caution."

**Buttons:**
- Primary: "Approve anyway" (critical tone)
- Secondary: "Add rollback plan"
- Tertiary: "Cancel"

### 7.3 Reject Confirmation

**Title:** "Reject this action?"

**Message:** "The agent will be notified and can revise the suggestion."

**Field:** "Reason for rejection (optional)"

**Buttons:**
- Primary: "Reject"
- Secondary: "Cancel"

---

## 8. Keyboard Shortcuts Hints

### 8.1 Shortcut Display

**Location:** Bottom of drawer (footer)

**Format:** `Cmd+Enter to approve · Cmd+R to request changes · Esc to close`

**Mobile:** Hide shortcuts (not applicable)

**Tablet:** Show shortcuts

**Desktop:** Show shortcuts with hover hints

### 8.2 Shortcut Tooltips

**Approve:** "Cmd+Enter" (Mac) / "Ctrl+Enter" (Windows)  
**Request Changes:** "Cmd+R" / "Ctrl+R"  
**Reject:** "Cmd+Delete" / "Ctrl+Delete"  
**Close:** "Esc"

---

## 9. Time Formatting

### 9.1 Relative Time
- **< 1 minute:** "Just now"
- **< 60 minutes:** "[X] minutes ago"
- **< 24 hours:** "[X] hours ago"
- **< 7 days:** "[X] days ago"
- **≥ 7 days:** "on [date]" (e.g., "on Oct 15")

### 9.2 Absolute Time
**Format:** "Oct 15, 2025 at 2:30 PM"  
**Tooltip:** Show absolute time on hover over relative time

---

## 10. Agent Attribution

### 10.1 Created By
**Format:** "Created [time] ago by [agent]"  
**Example:** "Created 2 minutes ago by ai-customer"

### 10.2 Agent Names
- **ai-customer:** "AI Customer Agent"
- **ai-inventory:** "AI Inventory Agent"
- **ai-growth:** "AI Growth Agent"
- **human:** "[User Name]"

---

## 11. Risk Level Indicators

### 11.1 Risk Badges
- **High:** Red badge, "High risk"
- **Medium:** Yellow badge, "Medium risk"
- **Low:** Green badge, "Low risk"

### 11.2 Risk Descriptions
- **High:** "Affects customers or revenue. Review carefully."
- **Medium:** "Affects operations. Standard review required."
- **Low:** "Minimal impact. Quick review sufficient."

---

## 12. Accessibility Labels

### 12.1 Screen Reader Announcements
- **Drawer Open:** "Approval drawer opened. [Type] · [Summary]"
- **Drawer Close:** "Approval drawer closed"
- **Approve Success:** "Action approved successfully"
- **Reject Success:** "Action rejected"
- **Validation Error:** "Validation failed. [Error count] errors found"

### 12.2 ARIA Labels
- **Approve Button:** `aria-label="Approve [type] action"`
- **Reject Button:** `aria-label="Reject [type] action"`
- **Close Button:** `aria-label="Close approval drawer"`
- **Evidence Tab:** `aria-label="Evidence tab, [count] items"`

---

## 13. Copy Guidelines

### 13.1 Tone
- **Professional:** Use clear, professional language
- **Empathetic:** Acknowledge user concerns
- **Actionable:** Provide clear next steps
- **Concise:** Keep messages brief and scannable

### 13.2 Voice
- **Active voice:** "Review the evidence" (not "The evidence should be reviewed")
- **Direct:** "Approve this action" (not "You may approve this action")
- **Positive:** "All checks passed" (not "No errors found")

### 13.3 Avoid
- ❌ Technical jargon ("RPC failed", "JSONB invalid")
- ❌ Blame ("You made an error", "This is wrong")
- ❌ Vague messages ("Something went wrong", "Error occurred")
- ❌ ALL CAPS (except acronyms like "API", "CX")

---

## 14. Implementation Checklist

### 14.1 Microcopy
- [ ] All section headings match spec
- [ ] Button labels consistent
- [ ] Status messages clear and actionable
- [ ] Error messages helpful
- [ ] Time formatting relative with absolute tooltip

### 14.2 Grading
- [ ] Grading modal appears after approve (CX only)
- [ ] All 3 scales present (tone, accuracy, policy)
- [ ] Hints visible for each scale
- [ ] Notes field optional
- [ ] Skip grading option available

### 14.3 Validation
- [ ] Evidence validation messages
- [ ] Risk validation messages
- [ ] Tool call validation messages
- [ ] Confirmation dialogs for high risk

### 14.4 Accessibility
- [ ] Screen reader announcements
- [ ] ARIA labels on all interactive elements
- [ ] Keyboard shortcuts documented
- [ ] Focus management correct

---

## 15. References

- **Approvals Drawer Spec:** `docs/specs/approvals_drawer_spec.md`
- **UX Spec:** `docs/specs/approvals_drawer_ux_spec.md`
- **Data Binding:** `docs/design/approvals-drawer-data-binding.md`
- **Polaris Voice & Tone:** https://polaris.shopify.com/content/voice-and-tone

