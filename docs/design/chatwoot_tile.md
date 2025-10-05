---
epoch: 2025.10.E1
doc: docs/design/chatwoot_tile.md
owner: manager
last_reviewed: 2025-10-04
doc_hash: TBD
expires: 2025-10-18
---
# Technical Design — Chatwoot CX Escalations Tile

## Objective
Expose a CX Escalations tile on the Operator Control Center dashboard that surfaces at-risk conversations from Chatwoot, recommends next actions, and allows operators to approve templated replies or escalations.

## User Story
As a CX lead, I need to see conversations breaching SLA thresholds and respond with context-aware templates, so I can restore customer trust without leaving the control center.

## Data Flow
1. Loader requests `getEscalations(shopDomain)` from `app/services/chatwoot/escalations.ts`.
2. Service calls `packages/integrations/chatwoot.ts` client using env-configured base URL/token/account ID.
3. Service filters conversations with status `open` or `pending`, age > SLA (configurable), or tagged `escalation`.
4. For each conversation, fetch most recent messages to surface sentiment/last reply time.
5. Service returns `EscalationTileData` (list + metadata) and writes summary fact to `DashboardFact` table.
6. UI tile renders list, SLA countdown, and CTA buttons (`Send templated reply`, `Escalate to Ops`).
7. Approvals go through Remix action `app/routes/actions/chatwoot.escalate.ts` writing to Supabase memory + Chatwoot reply API when approved.

## Configuration
- Environment variables: `CHATWOOT_BASE_URL`, `CHATWOOT_TOKEN`, `CHATWOOT_ACCOUNT_ID`, `CHATWOOT_SLA_MINUTES`.
- Provide `config/chatwoot.ts` helper that validates env and exposes typed config.

## Data Structures
- `EscalationConversation`: `{ id, inboxId, status, customerName, lastMessageAt, slaBreached, tags, suggestedReply, evidenceFactId }`.
- Suggested reply generated via heuristics (initial template library stored in JSON under `app/config/chatwoot_templates.json`).

## Approvals Workflow
- Action receives `conversationId`, `templateId`, `note`.
- Validate template allowed; write decision via `packages/memory/supabase` with scope `ops`.
- Post reply to Chatwoot via `sendReply` only after approval success.
- Persist event to Prisma `DecisionLog` including payload + Chatwoot message ID.

## UI Considerations
- Tile summary shows count of escalations, oldest breach, and trend vs previous day (requires storing daily counts in facts table).
- Detail view: stack of conversation cards with preview of last message, time-to-SLA, dropdown for templates.
- Provide fallback state when Chatwoot unreachable; show `Retry` button.

## Testing & Evidence
- Vitest: mock Chatwoot client to simulate pagination, errors, SLA filtering, template selection.
- Playwright: orchestrate fixture returning 2 escalations and verify CTA triggers approval dialog.
- Lighthouse: ensure tile renders accessible labels + keyboard navigation.

## Risks
- Rate limits: Chatwoot API default 60 requests/min; batching message fetch and caching conversation metadata mitigates.
- Token scope: ensure token can read/write conversations; verify before launch.
- Template drift: store templates versioned to enable change management.

## Deliverables
1. `app/services/chatwoot/` directory with `escalations.ts`, `templates.ts`, `types.ts`.
2. `app/components/tiles/CxEscalationsTile.tsx` with actions + tests.
3. Approval Remix action + integration tests.
4. Evidence artifacts (Vitest, Playwright, Lighthouse reports) attached to PR.
