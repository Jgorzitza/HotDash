# Approvals & Growth Microcopy (v1.2 — 2025-10-18)

**Owner:** Designer  
**Issue:** #107  
**Scope:** Approvals drawer, dashboard entry points, idea pool health, Publer scheduling flows  
**Related Specs:** `docs/specs/approvals_drawer_spec.md`, `docs/design/dashboard-tiles.md`

---

## Stakeholder Sign-Off

| Stakeholder     | Role                             | Status  | Notes                                                                                                  |
| --------------- | -------------------------------- | ------- | ------------------------------------------------------------------------------------------------------ |
| CEO             | Voice, risk review               | Pending | Sent 2025-10-18 for final tone approval. Follow-up scheduled 2025-10-19 15:00Z.                        |
| QA Lead         | Visual regression, HITL evidence | Pending | Awaiting confirmation after VR capture updates (see `docs/design/visual_regression_checklist.md`).     |
| Ads & Analytics | Severity thresholds & receipts   | Pending | Need confirmation on Publer severity copy + sample payloads for anomaly alerts (requested 2025-10-18). |

---

## Voice & Principles

- **HITL-first:** Copy keeps the human reviewer in control; every action references evidence or rollback.
- **Audit ready:** Call out receipts, decision IDs, and validation requirements so every action can be traced later.
- **Calm & direct:** Use present tense, avoid jargon, keep sentences ≤ 18 words, and acknowledge when the system blocks action.
- **Consistency:** Match Shopify Polaris tone. Title-case buttons, sentence-case helper text, chips stay short (“Pending review”, “High risk”).

---

## 1. Approvals Drawer

### 1.1 Header & Status Chips

- **Title pattern:** `<Kind label> · <human summary>` (e.g., `CX Escalation — Jamie Lee`, `Growth · Publish Publer draft launch-linkedin-2025-10-21`).
- **Subheader:** `Created {relativeTime} by {agentHandle} • State: {chipLabel}`
- **Secondary badge:** Kind label is uppercase (e.g., `CX_REPLY`, `GROWTH`, `INVENTORY`).

| State key        | Badge label               | Helper copy / usage                                              |
| ---------------- | ------------------------- | ---------------------------------------------------------------- |
| `draft`          | Draft — needs evidence    | Displayed until evidence + rollback populated.                   |
| `pending_review` | Pending review            | Highlight for reviewers; enables Approve once validation passes. |
| `approved`       | Approved — ready to apply | Signals Apply button is available.                               |
| `applied`        | Applied — verify receipts | Remind reviewer to confirm downstream receipts.                  |
| `audited`        | Audited — evidence logged | Shows after QA audit trail captured.                             |
| `learned`        | Learned — edits captured  | Indicates learning loop complete.                                |

### 1.2 Tabs & Section Labels

| Tab   | Label          | Description                                             |
| ----- | -------------- | ------------------------------------------------------- |
| Tab 0 | Evidence       | Evidence & context cards.                               |
| Tab 1 | Impact & Risks | “Projected Impact” card followed by “Risks & Rollback”. |
| Tab 2 | Actions        | “Actions to Execute” list with payload JSON.            |

- **Card headings:** “Evidence & context”, “What changes?”, “Why now?”, “Impact forecast”, “Projected Impact”, “Risks & Rollback”, “Actions to Execute”.
- **Empty evidence helper:** “Attach query results, diffs, or screenshots so reviewers can validate before approving.”

### 1.3 Validation & System Messages

| Trigger                                                  | Component                 | Copy                                                       |
| -------------------------------------------------------- | ------------------------- | ---------------------------------------------------------- |
| Backend validation errors (`approval.validation_errors`) | Critical `Banner` (title) | `Validation Errors`                                        |
| Client validation failure                                | Critical `Banner`         | `Validation Failed` body lines: bullet list of API errors. |
| Warnings (`warnings`)                                    | Warning `Banner`          | `Warnings`                                                 |
| Validation in progress                                   | Button spinner            | `Approve` button shows loading state.                      |

**Fallback error:** If `/validate` fails, display `Failed to validate approval`.

### 1.4 Grading Section (CX replies only)

- Section title: `Grades (HITL)`
- Slider labels: `Tone`, `Accuracy`, `Policy` (each appended with numeric value, e.g., `Tone: 4`).
- Helper text (inline tooltip request to engineering): “Grades post to audit log; use 1 (poor) – 5 (excellent).”

### 1.5 Footer Actions & Dialogs

| Control   | Copy            | Notes                                                                                              |
| --------- | --------------- | -------------------------------------------------------------------------------------------------- |
| Primary   | Approve         | Enabled only after validation passes.                                                              |
| Secondary | Request changes | Opens note modal with placeholder “Tell the agent what to fix.”                                    |
| Tertiary  | Reject          | Confirmation prompt: “Are you sure you want to reject this approval?”                              |
| Optional  | Apply           | Enabled when approval state is `approved`. Tooltip when disabled: “Approve first to unlock Apply.” |

**Validation reminder toast (pre-approve attempt):** “Run validation to enable Approve.”  
**Apply success toast:** “Apply started — track receipts below.”  
**Apply failure toast:** “Apply failed — the change did not run. Check receipts and try again.”

### 1.6 Receipts & Audit Reminders

- Receipts list heading: `Receipts & metrics`.
- Receipt row format: `{timestamp} — Logged to {destination} (tap to open)`.
- Empty receipts helper: “No receipts yet. Run Apply or attach manual audit evidence.”

---

## 2. Approvals Queue Tile (Dashboard Entry)

| Element                    | Copy                                                                                                                      |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Tile title                 | Approvals Queue                                                                                                           |
| Metric label               | Items waiting on you                                                                                                      |
| Healthy state (0 items)    | “All caught up — keep new automations flowing.”                                                                           |
| Attention state (>0 items) | “Review pending items in under 15 minutes.”                                                                               |
| CTA button                 | Open approvals drawer                                                                                                     |
| Risk badge (card)          | `HIGH RISK`, `MEDIUM RISK`, `LOW RISK` (uppercase)                                                                        |
| Empty queue body           | “There are no pending approvals at this time. Agent actions are either approved or completed without requiring approval.” |

---

## 3. Idea Pool Microcopy

### 3.1 Tile States

| Element              | Copy           |
| -------------------- | -------------- |
| Tile title           | Idea Pool      |
| Status badge (full)  | Full           |
| Status badge (< max) | Filling        |
| Metric label         | Ideas in pool  |
| Wildcard badge       | Wildcard       |
| CTA button           | View Idea Pool |

**Empty state:** “No ideas in the pool yet. New ideas will appear here when the AI generates suggestions.”  
**Error state:** “Unable to load idea pool data. Try again.”

### 3.2 Queue Drawer (Upcoming)

| Column   | Copy                                        |
| -------- | ------------------------------------------- |
| Idea     | Idea title (truncate after 48 chars).       |
| Priority | `Wildcard`, `High`, `Normal`.               |
| Status   | `Pending decision`, `Accepted`, `Rejected`. |
| Actions  | `Open in approvals drawer`, `Archive`.      |

Helper text for wildcard tooltip: “Wildcard ideas have strong signals but need fast review.”

---

## 4. Publer Scheduling & Growth CTA Microcopy

### 4.1 Queue Table (Growth → Social)

| Column        | Copy                                                      | Notes |
| ------------- | --------------------------------------------------------- | ----- |
| Draft         | “Draft {shortId}” (link to approvals drawer).             |
| Channel       | e.g., “LinkedIn · Company Page”, “Instagram · @hotrodan”. |
| Scheduled for | ISO-like timestamp (e.g., “Oct 21, 2025 • 14:30 UTC”).    |
| Status        | Badge values below.                                       |
| Owner         | “Queued by {agentHandle}”.                                |

**Row helper (hover tooltip):** “Publer job {jobId} — receipts stored in Supabase `growth_publer_receipts`.”

### 4.2 Status Badges

| Status              | Copy              | Usage                                                                          |
| ------------------- | ----------------- | ------------------------------------------------------------------------------ |
| `draft`             | Draft             | Not sent to Publer yet.                                                        |
| `awaiting_approval` | Approval required | Pending reviewer action.                                                       |
| `scheduled`         | Scheduled         | Publer accepted schedule; include `Publishes in {relativeTime}` inline helper. |
| `failed`            | Schedule failed   | Display CTA `Retry with Publer` when API returns error.                        |
| `published`         | Published         | Append “Receipts saved” note.                                                  |

### 4.3 Row Actions & Toasts

- **Primary CTA:** `Open in approvals drawer` (always visible).
- **Secondary CTA (scheduled):** `Copy Publer link`.
- **Retry CTA (failed):** `Retry schedule via Publer`.
- **Success toast (schedule):** “Schedule confirmed — Publer job #{jobId}.”
- **Failure toast:** “Schedule failed — check Publer status and retry.”
- **Offline banner:** “Publer is unavailable. We saved your draft; retry once the health check passes.”

---

## 5. Outstanding Dependencies

1. **CEO sign-off:** Review new Publer queue copy + apply toasts (owner: Designer → CEO).
2. **QA evidence:** Capture VR snapshots covering new Publer failure toast and Idea Pool wildcard states.
3. **Ads/Analytics inputs:** Provide final severity thresholds and example Publer receipt payload for documentation (ties to anomaly alert spec).

---

## 6. HITL + Safety Toggles (Explicit)

- Approvals: Human-in-the-loop is required for launch. Do not imply auto-actions.
- Autopublish: OFF. Do not suggest that posts or changes will publish without review.

Examples

- Banner: "Approvals are HITL-first. Autopublish remains off in this environment."
- Tooltip (evidence): "Link to the artifact or metric that supports this decision."

---

## 7. Variant Notes (A/B Harness Awareness)

- If experiment copy is referenced (A/B harness), use neutral language:
  - "You might see a different layout as we evaluate options."
  - Avoid naming variants or implying activation without analytics sign-off.

---

## 8. References

- `app/components/approvals/ApprovalsDrawer.tsx`
- `app/components/ApprovalCard.tsx`
- `docs/design/dashboard-tiles.md`
- `docs/integrations/social_adapter.md`
- `docs/runbooks/docs/design/approvals_microcopy.md` (archived draft for historical context)
