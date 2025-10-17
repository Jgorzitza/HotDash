---
epoch: 2025.10.E1
doc: docs/runbooks/agent_metrics_ingestion.md
owner: manager
last_reviewed: 2025-10-11
doc_hash: TBD
expires: 2025-10-18
---

# Agent Metrics Ingestion Runbook

Purpose: Implement and operate the `agent_run`/`agent_qc` logging pipeline across customer-facing AI interactions.

References:

- Metrics spec: /home/justin/HotDash/hot-dash/agentfeedbackprocess.md
- Design: docs/specs/agent_interaction_metrics_design.md
- Policy: docs/policies/agentfeedbackprocess.md

## API endpoint (server)

- Path: POST /api/agent-runs
- Auth: server-side only; uses Supabase service key to insert
- Body: JSON conforming to metrics spec (`agent_run`), optional `agent_qc` events
- Response: 202 Accepted (async insert ok) or 200 OK (sync insert ok)

Example handler (pseudo):

```ts path=null start=null
import { z } from "zod";

const Run = z.object({
  run_id: z.string().uuid(),
  agent_name: z.string(),
  input_kind: z.string().optional(),
  started_at: z.string().datetime().optional(),
  ended_at: z.string().datetime().optional(),
  resolution: z.enum(["resolved", "escalated", "failed"]),
  self_corrected: z.boolean().optional(),
  tokens_input: z.number().int().nonnegative().optional(),
  tokens_output: z.number().int().nonnegative().optional(),
  cost_usd: z.number().nonnegative().optional(),
  sla_target_seconds: z.number().int().positive().optional(),
  metadata: z.record(z.any()).optional(),
});

export async function action({ request }) {
  const json = await request.json();
  const payload = Run.parse(json);
  // insert into Supabase using service role env
  // return 202
}
```

## Client wrappers (TS)

- logAgentRunStart(run): emits started_at
- logAgentRunEnd(run): sets ended_at, resolution
- logAgentQc(run_id, score, notes)

## Testing

- QA: add Playwright checks for key flows to assert a new `agent_run` is created.
- Engineer: unit tests for validation and happy-path insert.

## Operations

- Reliability: monitor ingestion errors; alert if daily SLA Hit Rate < 90% or error rate spikes.
- Data: maintain view and indexes; schedule weekly KPI exports.
- Compliance: review retention and PII regularly.
