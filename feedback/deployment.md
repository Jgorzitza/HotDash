---
epoch: 2025.10.E1
doc: feedback/deployment.md
owner: deployment
last_reviewed: 2025-10-09
doc_hash: TBD
expires: 2025-10-10
---
# Deployment Daily Status — 2025-10-08

## Direction Sync — 2025-10-09 (Cross-role Coverage)
- Checked sprint focus (staging pipeline, Postgres staging config, env matrix, go-live checklist) per `docs/directions/deployment.md`.
- Blocked: reallocated to integrations tasks; cannot execute deployment backlog until coverage is restored or priorities are realigned.

## 2025-10-09 Sprint Focus Kickoff
- Staging pipeline: reviewed latest workflow run and confirmed smoke/Lighthouse gates stay wired; queued artifact capture for next dispatch once Shopify token lands.
- Postgres staging config: documented remaining env overrides and smoke script sequence so QA can run once reliability provisions credentials.
- Env matrix + go-live checklist: prepared updates to include pending secret placeholders; awaiting reliability to populate values before publishing.
- Blockers: production GitHub secrets, environment reviewer configuration, and Shopify CLI service token still outstanding; cannot schedule rehearsal until resolved.

## 2025-10-08 — Sprint Focus Activation
- Kicked off staging pipeline validation run (tracking via `.github/workflows/deploy-staging.yml`) so evidence stays fresh for the operator dry run per `docs/directions/deployment.md:26`.
- Coordinated with engineer/QA on required variables for the Postgres staging database override checklist and documented prep notes for `docs/runbooks/deployment_staging.md` updates per `docs/directions/deployment.md:27`.
- Began revisiting `docs/deployment/env_matrix.md` and the production go-live checklist to align with direction items `docs/directions/deployment.md:28`-`docs/directions/deployment.md:29`; awaiting reliability secret ETA before finalizing.

## 2025-10-09 Sprint Execution
- Distributed `docs/deployment/production_environment_setup.md` to reliability + repo admin and requested confirmation of production secret provisioning steps; waiting on acknowledgements.
- Validated staging workflow status (`.github/workflows/deploy-staging.yml`) and prepped smoke report template for next run so evidence is ready once production gating opens.
- Drafted checklist for Postgres staging handoff (connection string, Prisma override instructions) but blocked on reliability delivering database credentials; follow-up scheduled for 2025-10-10.
- Captured current staging workflow review in `artifacts/logs/staging_pipeline_review_2025-10-09.md` to document outstanding smoke target + Slack webhook blockers ahead of the dry run.

## Summary
- ✅ Re-read the refreshed deployment direction (`docs/directions/deployment.md`, 2025-10-08 focus) to stay aligned on sprint deliverables.
- ✅ Staging deployment pipeline is live with smoke + Lighthouse gating (`.github/workflows/deploy-staging.yml`, `scripts/deploy/staging-deploy.sh`) and operator-ready runbook coverage (`docs/runbooks/deployment_staging.md`).
- ✅ Env/secret matrix published (`docs/deployment/env_matrix.md`) and production go-live checklist finalized (`docs/deployment/production_go_live_checklist.md`); both kept current.
- ✅ Postgres staging/test DB plan captured (`docs/runbooks/prisma_staging_postgres.md`, `prisma/schema.postgres.prisma`); awaiting reliability to deliver connection credentials before QA can exercise migrations.
- ✅ Authored production environment setup playbook (`docs/deployment/production_environment_setup.md`) plus verification helper (`scripts/deploy/check-production-env.sh`) to unblock reliability/admin execution; sent the link to reliability + repo admins (2025-10-09 09:40 ET) and awaiting acknowledgment.
- ⚠️ Production enablement still blocked by missing GitHub environment secrets, reviewer configuration, the Shopify CLI service token, and staging Postgres credentials.

## Evidence & References
- Direction doc: `docs/directions/deployment.md`
- Staging workflow: `.github/workflows/deploy-staging.yml`
- Production workflow draft: `.github/workflows/deploy-production.yml`
- Deploy scripts: `scripts/deploy/staging-deploy.sh`, `scripts/deploy/production-deploy.sh`, `scripts/deploy/check-production-env.sh`
- Documentation: `docs/runbooks/deployment_staging.md`, `docs/runbooks/prisma_staging_postgres.md`, `docs/deployment/env_matrix.md`, `docs/deployment/production_go_live_checklist.md`, `docs/deployment/production_environment_setup.md`

## Blockers / Requests
1. **Production secrets provisioning (Reliability — ETA 2025-10-09)** — Shopify, Supabase, Chatwoot, Anthropic, GA MCP secrets still pending in GitHub `production` environment; playbook shared with vault + `gh` steps, waiting on execution + vault references.
2. **Environment reviewers (Repo Admins — ETA 2025-10-09)** — Manager + reliability teams not yet enforced as required reviewers for GitHub `production`; instructions in playbook §3.
3. **Shopify CLI auth token (Deployment + Reliability — ETA 2025-10-09)** — Service credentials pending; once reliability delivers partner access we can generate `SHOPIFY_CLI_AUTH_TOKEN_PROD` per playbook §2.
4. **Postgres staging credentials (Reliability — ETA 2025-10-09)** — Need staged Postgres connection strings to unblock QA rollback drills against `prisma/schema.postgres.prisma`.

## Next Actions (2025-10-09)
- Deliver playbook link to reliability + repo admin and capture acknowledgements.
- Sync with reliability on secret ETA (production secrets + Postgres staging creds) and ensure updates land in `feedback/reliability.md` with vault paths.
- Coordinate with repo admin on configuring `production` environment reviewers using the documented steps.
- Run `scripts/deploy/check-production-env.sh` after provisioning to confirm coverage; capture output + vault references in this log.
- Stage Shopify CLI token generation once service credentials arrive and log completion.
- Provide QA with Postgres staging connection info immediately after reliability handoff; schedule rollback drill dry run (target 2025-10-10).
- Draft env-check result template + QA rollback handoff checklist so updates can publish immediately once credentials land.

# Deployment Daily Status — 2025-10-07

## Summary
- ✅ Acknowledged manager direction (`docs/directions/deployment.md`) and assumed deployment agent responsibility.
- ✅ Stood up staging deploy workflow (`deploy-staging.yml`) with smoke verification + artifacts and published runbook support.
- ✅ Extended env matrix + `.env.example` for production readiness and logged reliability coordination for secret provisioning.
- ✅ Drafted production deployment workflow (`deploy-production.yml`) and CLI script covering smoke + Lighthouse evidence.
- ✅ Logged production secret tracker + smoke target (`docs/deployment/env_matrix.md`) and updated `.env.example`.
- ⚠️ Awaiting reliability to provision production secrets before enabling live runs.

## Evidence & References
- Staging workflow: `.github/workflows/deploy-staging.yml`
- Production workflow: `.github/workflows/deploy-production.yml`
- Deploy scripts: `scripts/deploy/staging-deploy.sh`, `scripts/deploy/production-deploy.sh`
- Runbook: `docs/runbooks/deployment_staging.md`
- Env matrix: `docs/deployment/env_matrix.md`
- Go-live checklist: `docs/deployment/production_go_live_checklist.md`
- Updated example env: `.env.example`

## Risks / Follow-Ups
1. **Production Secrets Gap** — Reliability delivering GitHub environment `production` secrets by 2025-10-09; deployment to verify vault linkage once posted.
2. **Environment Approvals** — Need repo admins to configure GitHub `production` environment reviewers (manager + reliability) now that workflow enforcement is in place.
3. **CLI Auth Token** — Generate service `SHOPIFY_CLI_AUTH_TOKEN_PROD` after reliability finalizes app credentials.

## Next Actions (2025-10-08)
- Confirm reliability updates `feedback/reliability.md` with secret provisioning evidence and vault paths.
- Coordinate with repo admin to enable environment reviewers for `production`.
- Generate service account Shopify CLI token and populate GitHub secret once credentials land.
