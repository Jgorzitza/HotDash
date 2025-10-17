---
epoch: 2025.10.E1
doc: docs/marketing/privacy_toggle_rollout.md
owner: marketing
last_reviewed: 2025-10-08
doc_hash: TBD
expires: 2025-10-22
---

# Privacy Toggle & Notice Rollout Plan

## Objectives

- Ship in-app "Share usage analytics" toggle prior to GA MCP go-live.
- Publish updated privacy notice copy across marketing site, onboarding email, and in-app onboarding modal.
- Capture compliance evidence for approvals.

## Product Requirements

1. **Settings UI**
   - Location: Operator Control Center → Settings → Privacy.
   - Toggle default: `on` for existing users; prompt on first login post-release.
   - When disabled, suppress `logDashboardView`/`logDashboardRefresh` calls and emit audit entry noting opt-out.
2. **First-Run Modal**
   - Present summary of analytics + AI disclosures (copy in `docs/compliance/privacy_notice_updates.md`).
   - Provide direct link to full privacy notice and support email.
3. **Audit Logging**
   - Record opt-out/in changes in `DecisionLog` (scope `ops`, action `privacy.analytics.opt_out`).

## Copy Blocks

> We collect limited operator telemetry (email, tile interactions, request IDs) to monitor uptime. You can turn this off anytime in Settings → Privacy. When you request AI suggestions, relevant conversation context is assembled by our LlamaIndex service and sent to OpenAI after removing payment details. Review our full privacy notice to learn more.

## Timeline

| Date       | Task                                            | Owner          |
| ---------- | ----------------------------------------------- | -------------- |
| 2025-10-09 | Finalize UI designs & feature flag plan         | Product/Design |
| 2025-10-11 | Implement toggle + logging adjustments          | Engineering    |
| 2025-10-12 | QA toggle (unit/E2E) + copy review              | QA/Marketing   |
| 2025-10-13 | Publish privacy notice on web & email templates | Marketing      |
| 2025-10-14 | Compliance sign-off & evidence archive          | Compliance     |

## Dependencies

- Feature flag scaffolding (`app/config/featureFlags.ts`).
- Analytics logging service updates to honor opt-out.
- Support article update referencing new toggle.

## Evidence

- Store published notice under `docs/compliance/evidence/privacy_notice/`.
- Capture toggle release notes screenshot for audit.
