# Support Webhooks Runbook (Chatwoot)

Effective: 2025-10-17
Owner: Support Agent

## Purpose
Document the expected behavior and retry policy for the Chatwoot → HotDash webhook endpoint and how to verify locally.

## Endpoint
- Path: POST /api/webhooks/chatwoot
- Source: app/routes/api.webhooks.chatwoot.tsx
- Behavior:
  - Skips signature verification when NODE_ENV !== 'production'
  - Forwards raw payload to Agent SDK at `${AGENT_SDK_URL}/webhooks/chatwoot` (default: https://hotdash-agent-service.fly.dev)
  - Returns 200 on downstream OK; returns 500 and logs details on downstream error

## Retry Policy
- HotDash does NOT implement internal retries in this route.
- Chatwoot will automatically retry delivery on any non-2xx response (per Chatwoot webhook semantics).
- Therefore, to ensure retries, we intentionally return 5xx when downstream Agent SDK fails. Chatwoot will re-deliver.

## Idempotency Guidance
- Webhook handlers and downstream consumers must be idempotent by conversation/message id.
- Avoid double-processing by checking for existing artifacts (e.g., approval queue entries) before insert.

## Verification Steps (Contract Test)
- Test file: tests/integration/support.webhook.spec.ts
- Command:
  - `npx vitest run tests/integration/support.webhook.spec.ts`
- What it validates:
  1) Returns 500 when downstream returns 500 (ensures Chatwoot will retry)
  2) Returns 200 with `{ success: true, processed: true }` when downstream returns OK

## Operations Notes
- Required envs:
  - CHATWOOT_WEBHOOK_SECRET (production only; signature enforced)
  - AGENT_SDK_URL (optional; defaults provided)
- Logs:
  - "[Chatwoot Webhook] Received" on entry
  - "Agent SDK error" with status and error body on downstream failure
  - "Processed successfully" with duration and status on success

## Escalation
- If repeated 5xx responses persist > 5 minutes, escalate to AI-Customer/Agent-Service owner to check downstream health.
- Rollback: Temporarily disable forwarding (feature flag) or route traffic to a healthy staging Agent SDK if available; restore on confirmation.

