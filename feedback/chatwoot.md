---
epoch: 2025.10.E1
doc: feedback/chatwoot.md
owner: chatwoot
last_reviewed: 2025-10-11
doc_hash: TBD
expires: 2025-10-18
---

<!-- Log new updates below. Include timestamp, command/output, and evidence path. -->

## 2025-10-11 01:12 UTC - Chatwoot Readiness Documentation Created
**Action:** Created comprehensive Chatwoot production readiness tracking document
**File:** `docs/integrations/chatwoot_readiness.md` (105 lines)
**Content:** Production credential requirements, Support coordination plan, readiness checklist, current blockers analysis
**Next Steps:** Address Supabase DSN alignment, coordinate with Support team for inbox scopes, begin API token generation process
**Evidence:** Full readiness tracking matrix with 10-item checklist and Support coordination requirements

## 2025-10-11 01:37 UTC - Chatwoot Direction Review and Ready-for-Execution
Status: Reviewed manager direction and linked canon. Prepared evidence scaffolding and execution plan; awaiting manager alignment before running preflight.

Commands executed (evidence captured):
- git --no-pager rev-parse --abbrev-ref HEAD → artifacts/integrations/chatwoot-manager-feedback-2025-10-11T01:37:42Z/git_branch.txt
- git --no-pager status -sb → artifacts/integrations/chatwoot-manager-feedback-2025-10-11T01:37:42Z/git_status.txt

Artifacts & references:
- Artifact root: artifacts/integrations/chatwoot-manager-feedback-2025-10-11T01:37:42Z/
- Reviewed docs list: artifacts/integrations/chatwoot-manager-feedback-2025-10-11T01:37:42Z/reviewed_docs.txt
- Direction: docs/directions/chatwoot.md
- Runbook: docs/deployment/chatwoot_fly_runbook.md
- Governance & credentials: docs/directions/README.md, docs/ops/credential_index.md
- Deploy config: deploy/chatwoot/fly.toml; Client: packages/integrations/chatwoot.ts

Planned next actions (pending manager OK):
1) Preflight + evidence scaffolding per runbook; verify Fly auth and toolchain
2) Supabase DSN alignment and Fly secrets refresh (Supabase-only; no Fly Postgres)
3) Redeploy; run db:chatwoot_prepare, create_redis_keys, and super admin; verify health endpoint
4) Coordinate inbound email for customer.support@hotrodan.com; configure webhook to Supabase; generate scoped API token
5) Run scripts/ops/chatwoot-fly-smoke.sh and update readiness dashboard; log all evidence

Asks/clarifications for manager:
- Confirm vault files are present locally: vault/occ/fly/api_token.env, vault/occ/supabase/database_url_staging.env, vault/occ/chatwoot/redis_staging.env
- Approve aligning Fly http_checks path to /hc if routes confirm that endpoint (current config shows /api)
- Preference for inbound email integration (IMAP/SMTP vs provider API) and contact for Support handoff
- Confirm Data-provided Supabase webhook endpoint and secret path

Ready state: On approval, will begin preflight and halt if any credentials are missing; all steps will be logged with commands and artifact paths as required by direction.
