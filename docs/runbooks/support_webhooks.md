# Support Webhooks – Chatwoot Intake

Last updated: 2025-10-18

## Purpose

Document the evidence steps to verify Chatwoot → Agent SDK ingestion, retry policy, and observability before allowing customer-facing traffic.

## Preconditions

- `CHATWOOT_BASE_URL`, `CHATWOOT_API_TOKEN[_STAGING]`, `CHATWOOT_ACCOUNT_ID[_STAGING]`, and `CHATWOOT_WEBHOOK_SECRET` populated via `vault/occ/chatwoot/*.env` or environment.
- Agent SDK reachable (`AGENT_SDK_URL`, default `https://hotdash-agent-service.fly.dev`).
- Supabase + packages/memory connectivity confirmed (see `docs/runbooks/support_db_health.md`).

## Health Check Procedure

1. Export Chatwoot secrets (or ensure env files exist).
2. Run the script:

   ```bash
   npm run ops:check-chatwoot-health
   ```

   - Output file: `artifacts/integrations/<DATE>/chatwoot_health.jsonl`
   - Mirror to support evidence: `artifacts/support/<DATE>/ops/chatwoot-health.jsonl`
   - Success requires:
     - `/rails/health` (HTTP 2xx) **or** `/api` fallback 2xx
     - Authenticated probe `/api/v1/accounts/<ID>` returns 2xx/3xx

3. Record the run in `feedback/support/<DATE>.md` with command + paths.

## Retry Policy Verification

Hotdash webhook handler forwards payloads to Agent SDK using exponential backoff:

- Attempts: 3 (configurable via `CHATWOOT_WEBHOOK_MAX_RETRIES`).
- Base delay: 500 ms (`CHATWOOT_WEBHOOK_RETRY_BASE_MS`).
- Applies full jitter and honors upstream `Retry-After` header when present.
- Non-OK responses after final attempt return HTTP 502 with `attempts` in payload.
- Structured logs emitted via `chatwootLogger` `service=hotdash-app:chatwoot`.

To run regression tests:

```bash
npx vitest run tests/integration/support.webhook.spec.ts
```

Assertions cover success path, retry path, `Retry-After` respect, and failure exhaust.

## Learning Signal Capture

- Agent SDK stores draft outputs and approvals via `saveFeedbackSample` (packages/memory) when webhook succeeds.
- On Hotdash side, ensure `artifacts/support/<DATE>/ops/chatwoot-health*.jsonl` archived and linked in daily feedback.
- For CX grading loops, confirm Supabase `agent_sdk_approval_queue` entries (see `tests/integration/agent-sdk-webhook.spec.ts` once implemented) and AI logging via `logReplyGeneration` when downstream actions run.
- Use `collectSupportHealthArtifacts(date)` from `app/services/support/health-artifacts.server.ts` to gather the day’s ops artifacts programmatically for reports or dashboards; mocked tests cover missing-directory and happy-path cases.

## Escalation

- If retries exhaust (HTTP 502), open `reports/manager/ESCALATION.md` entry with timestamp, payload hash (redacted PII), and Agent SDK status.
- Coordinate with AI-Customer and AI-Knowledge agents to confirm grading pipeline is operational before resuming intake.
