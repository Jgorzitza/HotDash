---
epoch: 2025.10.E1
doc: docs/runbooks/supabase_staging_secret_handoff.md
owner: ai
last_reviewed: 2025-10-10
doc_hash: TBD
expires: 2025-10-17
---

# Supabase Staging Secret Handoff Checklist

## Purpose

- Document the exact credentials reliability must provide so AI decision logging can move off the in-memory fallback ahead of the Shopify staging push.
- Give deployment a single reference for loading GitHub environment secrets and engineers a template for populating local `.env` files without guesswork.

## Required Secrets

| Variable                       | Environment                  | Owner                    | Notes                                                                                                                                             |
| ------------------------------ | ---------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SUPABASE_URL`                 | Local development / CI       | Reliability → AI         | Staging project URL (e.g., `https://<project>.supabase.co`) with Row Level Security enabled.                                                      |
| `SUPABASE_SERVICE_KEY`         | Local development / CI       | Reliability → AI         | Service role key scoped to `decision_log` and `facts` tables. Store in `vault/occ/supabase/service_key_staging.env` and mirror into local `.env`. |
| `SUPABASE_URL_STAGING`         | GitHub `staging` environment | Reliability → Deployment | Optional alias if staging differs from dev; reuse `SUPABASE_URL` if identical.                                                                    |
| `SUPABASE_SERVICE_KEY_STAGING` | GitHub `staging` environment | Reliability → Deployment | Service role key for staging deploys; follow 90-day rotation cadence per `docs/runbooks/secret_rotation.md`.                                      |

## Delivery Steps

1. Reliability exports the staging Supabase URL + service key and attaches them to the secure vault item (`AI/OCC Staging — Supabase`).
2. Deployment loads the values into the GitHub `staging` environment and runs `node scripts/ci/check-supabase.mjs`, attaching output to `feedback/deployment.md`.
3. AI agent updates local `.env` and reruns `npm run ai:regression` plus Supabase parity checks to confirm persistence.
4. Reliability logs completion (timestamp + owner) in `feedback/reliability.md`; AI mirrors status in `feedback/ai.md` and `feedback/manager.md`.

## Verification Notes

- After secrets land, run `npx vitest run tests/unit/supabase.config.spec.ts` to confirm config resolution.
- Trigger `npm run ai:regression` and ensure future artifacts note Supabase storage once telemetry wiring completes.
- Capture a sample decision log entry via the CX Escalations modal and confirm persistence in the Supabase console.

## Open Questions

- Should QA receive a distinct service role key for automated regression versus operator dry run usage?
- Do we want a dedicated schema (e.g., `ai_memory`) before production to simplify rotation and access control?
- Who owns the rotation calendar entry once secrets are delivered (reliability vs manager)?
