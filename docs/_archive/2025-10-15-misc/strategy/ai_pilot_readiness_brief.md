---
epoch: 2025.10.E1
doc: docs/strategy/ai_pilot_readiness_brief.md
owner: ai
last_reviewed: 2025-10-10
doc_hash: TBD
expires: 2025-10-16
---

# AI Pilot Readiness Brief — CX Escalations Kit (Draft)

## Purpose

- Summarize the technical and operational requirements to ship AI-assisted CX Escalations suggestions into the Shopify Admin staging environment ahead of the 2025-10-16 dry run.
- Capture guardrails, feature flag posture, telemetry expectations, and evidence needed for the M1/M2 checkpoint review with product, compliance, and reliability.
- Provide go/no-go criteria tying the AI kit to the broader staging push (Supabase decision log persistence, prompt regression hygiene, operator enablement collateral).

## Current Status Snapshot (2025-10-10)

- `FEATURE_AI_ESCALATIONS` remains off (`0`) across environments pending Supabase credential delivery and QA artifact retention confirmation (`feedback/manager.md:181`).
- Supabase memory client falls back to in-memory storage when `SUPABASE_URL`/`SUPABASE_SERVICE_KEY` are unset (`app/config/supabase.server.ts:8`-`app/config/supabase.server.ts:43`), so decision logs currently evaporate between requests.
- Daily prompt regression harness (`npm run ai:regression`) is restored; latest artifact `artifacts/ai/prompt-regression-2025-10-09-174559.json` meets QA retention expectations (`feedback/qa.md:74`, `feedback/manager.md:181`).
- Annotated dry-run samples for CX Escalations and Sales Pulse live under `docs/enablement/job_aids/ai_samples/`, awaiting enablement/support review for the Shopify walkthrough.

## Guardrails & Kill Switch Plan

- `FEATURE_AI_ESCALATIONS`
  - Default `0` in all environments. Only flip to `1` once Supabase decision logging is verified and QA confirms evidence capture pipeline.
  - Staging enablement order: reliability delivers secrets → deployment wires into GitHub env → QA validates logging + captures baseline metrics → product/compliance sign off.
- Decision provenance
  - Every AI suggestion must log `who/what/why` + prompt metadata to Supabase (`packages/memory/supabase.ts:59`-`packages/memory/supabase.ts:99`) with scope `build` for training evidence.
  - Absence of Supabase connectivity requires falling back to manual template mode; operators must see “AI unavailable” copy in the modal once design ships it.
- Operator approvals
  - Maintain the engineer-owned approval flow; AI suggestions surface as draft copy only until explicitly accepted. Aligns with the guardrail directive in `docs/directions/ai.md:19`.

## Telemetry & Logging Requirements

- Structured retry metrics: extend `packages/memory/supabase.ts` `executeWithRetry` helper to emit counters for attempts, retries, and hard failures (target consumption by reliability dashboards).
- Decision/fact parity checks: once Supabase credentials available, run the parity script comparing in-memory fallback vs persisted entries to confirm no data loss.
- Prompt regression evidence: ensure each `npm run ai:regression` run logs BLEU/ROUGE deltas + qualitative notes to Memory (scope `build`) and archives artifacts where QA can bundle with Playwright results.
- Incident response: hook Supabase failure modes into reliability alerting (PagerDuty/Linear OCC-212) with remediation steps referencing `docs/runbooks/incident_response_supabase.md`.

## Dependencies & Owners

- **Reliability/Data** — Provide `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, and log export samples per `docs/runbooks/supabase_staging_secret_handoff.md`; pair on telemetry counters + monitoring dashboard.
- **QA** — Confirm artifact storage location for prompt regression outputs; expand coverage for the CX Escalations modal once `FEATURE_AI_ESCALATIONS=1` in staging.
- **Deployment** — Wire Supabase secrets into the staging GitHub environment and document rotation cadence; ensure `.github/workflows/deploy-staging.yml` references the new env vars.
- **Enablement/Support** — Review AI sample drafts and align on operator talking points for the 2025-10-16 dry run; flag additional scenarios if staging data deviates.
- **Compliance/Product** — Validate guardrails, kill switch, and audit traces before approving production rollout; ensure vendor DPAs (GA MCP, Supabase, OpenAI) remain current (`docs/compliance/evidence/vendor_dpa_status.md`).

## Go / No-Go Criteria (Staging Dry Run)

- **Go** when:
  - Supabase credentials active in staging; sample decision/fact writes persist and surface in dashboards.
  - `npm run ai:regression` passes with documented BLEU/ROUGE deltas + QA-reviewed artifact path.
  - Enablement signs off on annotated operator scripts; Shopify staging build demonstrates modal suggestions end-to-end with mock data.
  - Compliance signs off on guardrails + logging plan; reliability confirms monitoring signals fire on forced failure test.
- **No-Go / Blockers:**
  - Supabase secrets missing or telemetry counters not landing in monitoring.
  - QA lacks an evidence retention path for regression artifacts.
  - Operator enablement materials incomplete or misaligned with staging experience.
  - Kill switch unverified (no synthetic flip test captured).

## Evidence & Next Actions

1. Draft synthetic Supabase failure test plan (retry + hard-fail scenarios) and schedule a run with reliability.
2. Capture baseline `npm run ai:regression` metrics once secrets land; attach artifact links + commentary to `feedback/ai.md` and Memory (`scope="build"`).
3. Update CX Escalations modal copy with “AI unavailable” fallback messaging tied to the kill switch state; coordinate with design/copy deck.
4. Package this brief + sample outputs for product/compliance review; target sign-off by 2025-10-14.

## Open Questions

- What is the long-term storage location for regression artifacts (`artifacts/ai/` vs external bucket)? Owner TBD (QA vs Reliability).
- Should production rollout gate `FEATURE_AI_ESCALATIONS` behind a staged percentage (0%→10%→100%) once telemetry validates?
- Do we need additional Shopify-specific telemetry (action IDs, shop domain tags) before the dry run to support audit trails?
