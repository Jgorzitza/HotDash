# Approvals & Growth Microcopy

**Owner:** Designer  
**Version:** 1.0  
**Date:** 2025-10-19  
**Scope:** Production copy blocks for the approvals drawer, idea pool workflows, and Publer scheduling flows. Aligns with Polaris tone (plain-language, action-forward) and HITL requirements.

---

## 1. Approvals Drawer (Shopify Admin)

| Location                  | Copy                                                                   | Notes                                                                            |
| ------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Drawer title              | `<approval.summary>`                                                   | Sourced from Supabase record; do not prepend state.                              |
| Subtitle badge stack      | `Draft`, `Pending Review`, `Approved`, `Applied`, `Audited`, `Learned` | Tone inherits from `stateBadge`; labels defined in `ApprovalsDrawer.tsx`.        |
| Kind badge                | `CX_REPLY`, `INVENTORY`, `GROWTH`, `MISC`                              | Uppercase `approval.kind`; Polaris badge (default tone).                         |
| Creator meta              | `Created by <agent_name>`                                              | Tone subdued (`Text as="p" variant="bodySm"`).                                   |
| Validation banner title   | `Validation Errors` / `Validation Failed`                              | Critical tone for errors, displays bullet list.                                  |
| Validation fallback       | `Failed to validate approval`                                          | Injected if `/validate` request throws.                                          |
| Warning banner title      | `Warnings`                                                             | Tone warning, bullet list.                                                       |
| Tabs                      | `Evidence`, `Impact & Risks`, `Actions`                                | Mirrors `tabs` array order; no sentence casing changes.                          |
| Impact card heading       | `Projected Impact`                                                     | Plain text body below.                                                           |
| Risks card heading        | `Risks & Rollback`                                                     | Enumerates rollback steps with ordered prefix `1., 2., ...`.                     |
| Actions card heading      | `Actions to Execute`                                                   | Each endpoint rendered as `<action.endpoint>` label.                             |
| Evidence field labels     | `What changes:`, `Why now:`, `Impact forecast:`                        | Inline prefix appears only when value supplied.                                  |
| Evidence section headings | `Diffs`, `Samples`, `Queries`, `Screenshots`                           | `Text variant="headingMd"`.                                                      |
| CX grading card heading   | `Grades (HITL)`                                                        | Displayed only when `approval.kind === "cx_reply"`.                              |
| Slider labels             | `Tone: <value>`, `Accuracy: <value>`, `Policy: <value>`                | 1–5 slider with live value.                                                      |
| Reject button             | `Reject`                                                               | Critical tone. Submits reason `"Rejected by reviewer"`.                          |
| Request changes button    | `Request changes`                                                      | Primary tone (secondary button). Note text `"Please address the review notes."`. |
| Approve button            | `Approve`                                                              | Primary variant; disabled until validation passes.                               |
| Apply button              | `Apply`                                                                | Visible only when apply handler exists and state `approved`.                     |
| Drawer close icon         | `Close`                                                                | Default Polaris modal copy.                                                      |

### 1.1 CX Escalation Hand-off

| Flow                    | Copy                                                          | Notes                                                           |
| ----------------------- | ------------------------------------------------------------- | --------------------------------------------------------------- |
| Modal title             | `CX Escalation — <customerName>`                              | Example: `CX Escalation — Jordan Smith` (contract test string). |
| Conversation meta       | `Conversation #<id> · Status: <status>`                       | Uses Chatwoot status string.                                    |
| History empty state     | `No recent messages available.`                               | Rendered when log array empty.                                  |
| Suggested reply heading | `Suggested reply`                                             | Textarea label via aria (`Reply text`).                         |
| Missing suggestion      | `No template available. Draft response manually or escalate.` | Displayed when AI suggestion absent.                            |
| Internal note heading   | `Internal note`                                               | Placeholder: `Add context for audit trail`.                     |
| Error alert             | `<error_message>`                                             | `occ-feedback--error` styling; copy returned by action.         |
| Primary CTA             | `Approve & send`                                              | Disabled unless reply populated.                                |
| Secondary CTA           | `Escalate`                                                    | Sends escalation action with note (optional).                   |
| Secondary CTA 2         | `Mark resolved`                                               | Marks Chatwoot conversation resolved.                           |
| Footer cancel           | `Cancel`                                                      | Closes modal, disabled while submitting.                        |

### 1.2 Acceptance Criteria

- Drawer surfaces validation failures with canonical language above; no alternate phrasing in downstream components.
- CX grading sliders default to midpoint (`3`) and echo value inline (`Tone: 3`).
- Reject/request-change handlers reuse the canned reason/note strings for audit parity.
- CX Escalation modal always renders the `CX Escalation — <customerName>` title to satisfy contract test `rg 'CX Escalation —' docs/design/approvals_microcopy.md`.

---

## 2. Idea Pool Microcopy

### 2.1 Dashboard Tile

| State          | Copy                                                                                        | Notes                                                |
| -------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Header title   | `Idea Pool`                                                                                 | Matches tile inventory list.                         |
| Status badge   | `Full` / `Filling`                                                                          | `Full` when pool count ≥ 5; falls back to `Filling`. |
| Wildcard badge | `Wildcard`                                                                                  | Warning tone tag preceding wildcard title/ID.        |
| Metric labels  | `Pending`, `Accepted`, `Rejected`                                                           | Right-aligned counts semibold.                       |
| Primary CTA    | `View Idea Pool`                                                                            | Routes to `/ideas`.                                  |
| Empty body     | `No ideas in the pool yet.` `New ideas will appear here when the AI generates suggestions.` | Two-line paragraph, muted tone.                      |
| Error state    | `Unable to load idea pool data.` `Try Again`                                                | Retry button triggers refetch.                       |

### 2.2 Idea Detail Drawer (planned)

| Location            | Copy                                | Notes                                                                                                |
| ------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Title               | `<idea.title>`                      | Use product-style casing from Supabase.                                                              |
| Subtitle badge      | `Wildcard` / `Core Play`            | Maps to `idea.category`; Wildcard badge inherits warning tone.                                       |
| Summary section     | `Summary` heading + plain text body | Provide AI summary in ≤ 2 paragraphs.                                                                |
| Evidence callouts   | `Evidence` heading                  | List bullet points linking to Supabase attachments or metrics.                                       |
| Draft CTA           | `Create Shopify draft`              | Disabled until approval recorded.                                                                    |
| Approvals CTA       | `Approve idea` / `Reject idea`      | Buttons grouped; rejection opens reason textarea with placeholder `Share feedback for future ideas`. |
| Audit trail heading | `History`                           | Each entry: `<timestamp> — <actor>: <action>` (plain text).                                          |
| Empty audit state   | `No decisions recorded yet.`        | Displayed until first approval/rejection.                                                            |

### 2.3 Notifications & Toasts

- Approval success: `Idea approved. Draft job queued for Shopify.`
- Rejection success: `Idea rejected. We'll adjust future suggestions.`
- Draft failure: `Failed to create Shopify draft. Retry or contact Engineering.`
- SLA reminder banner (tablet stacking): `Reminder: Approved ideas should ship within 48 hours.`

---

## 3. Publer Scheduling Flows

### 3.1 Draft Composer Drawer

| Location                 | Copy                                                                     | Notes                                                                                   |
| ------------------------ | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| Title                    | `Schedule social post`                                                   | Drawer title in `/growth` area.                                                         |
| Channel selector label   | `Choose channels`                                                        | Multi-select referencing Publer workspace accounts.                                     |
| Caption label            | `Post caption`                                                           | Textarea placeholder: `Lead with the key outcome. Attach links or UTM tags.`            |
| First comment label      | `First comment (optional)`                                               | Placeholder: `Use hashtags or supporting links.`                                        |
| Media uploader help      | `Images and video share one queue. Publer enforces per-platform limits.` | Plain sentence under drop zone.                                                         |
| Schedule controls        | `Publish now`, `Schedule for later`, `Custom time`                       | Radio group with helper text `All times in store timezone (America/Chicago).`           |
| Approval reminder banner | `All social posts must be approved before publishing.`                   | Warning tone, anchored above primary CTAs.                                              |
| Primary CTA              | `Submit for approval`                                                    | Disabled until caption + channel selected.                                              |
| Secondary CTA            | `Save as draft`                                                          | Persists Publer draft without approvals.                                                |
| Cancel link              | `Cancel`                                                                 | Closes drawer; confirm dialog copy: `Discard this draft? Unsaved changes will be lost.` |

### 3.2 Approval Queue Entry

| Field                   | Copy                                                                    | Notes                                |
| ----------------------- | ----------------------------------------------------------------------- | ------------------------------------ |
| Summary                 | `Publer draft — <primary_channel>`                                      | Example: `Publer draft — Instagram`. |
| Evidence `what_changes` | `Scheduling new social post via Publer.`                                | Auto-generated by adapter.           |
| Impact forecast hint    | `Expected reach` metrics inline.                                        |
| Rollback steps          | `1. Cancel scheduled post in Publer.` `2. Notify Marketing in #growth.` | Displayed in impact tab.             |
| Action payload endpoint | `/api/publer/schedule`                                                  | Surfaces under "Actions to Execute". |

### 3.3 Toasts & Errors

- Submission success: `Draft submitted for approval.`
- Validation failure: `Missing required fields. Check highlighted sections.`
- Publer API error: `Publer returned an error. Try again or check workspace credentials.`
- Approval apply success: `Post scheduled via Publer.`
- Approval apply failure: `Unable to schedule post. Review Publer logs before retrying.`

---

## 4. Accessibility & Tone Alignment

- Follow Polaris tone guide: short sentences, present tense, clear outcomes.
- Every CTA references a concrete action (`Approve`, `Submit for approval`, `Create Shopify draft`).
- Error copy states next step or owner (e.g., `Retry or contact Engineering.`).
- Ensure screen readers announce badge labels and CTA purpose verbatim; no hidden abbreviations.

---

## 5. Change Log

- **2025-10-19:** Initial production microcopy inventory for approvals drawer, idea pool, and Publer flows.
