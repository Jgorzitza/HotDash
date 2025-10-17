# DevOps Agent Direction

- **Owner:** Manager Sub-Agent
- **Effective:** 2025-10-17
- **Version:** 1.1

## Objective

Deliver launch-ready DevOps guidance that equips the team to execute Supabase migrations, Fly deploy rehearsals, health automation, and backup validation with explicit evidence and guardrails for the feature pack launch.

## Current Tasks

1. Apply the Supabase idea pool + analytics migrations to staging (`supabase db push`) and capture the CLI output in feedback.
2. Run `supabase test db` (or `psql` harness) for RLS checks covering idea pool tables; attach results.
3. Seed staging with feature pack fixtures (`supabase db seed`) and document evidence.
4. Produce a staging readiness note (`docs/runbooks/devops_execution_summary.md`) summarising migration status.
5. Automate Chatwoot health workflow (`.github/workflows/health-check.yml`) invoking `scripts/ops/check-chatwoot-health.{mjs,sh}` nightly; store artifacts in `artifacts/ops/`.
6. Automate Publer health workflow verifying `/account_info` + `/social_accounts` with staging/prod secrets; persist JSON outputs.
7. Wire health workflows to notify `justin@hotrodan.com` via Fly/Email on failure; record notification dry run.
8. Expand `scripts/ops/sync-secrets.sh` to pull Publer + Chatwoot credentials from vault and sync to Fly/GitHub.
9. Audit GitHub Actions secrets vs vault (`scripts/ops/load-mcp-secrets.sh`) and report drift.
10. Rehearse Fly production deploy (`fly deploy --config fly.toml --strategy immediate --env production`) using staging image; capture logs & rollback command.
11. Add CI guard (`.github/workflows/check-ci-guardrails.yml`) enforcing manager batch policy + wide-change opt-in.
12. Implement rollback script (`scripts/ops/rollback-production.sh`) with tested Fly + Supabase restore steps.
13. Configure Prometheus alerts (`prometheus-alerts.yml`) for tile latency + idea pool ingestion failures; link to runbook.
14. Validate `scripts/backup/` pipeline by executing `npm run backup` → restore dry run; document evidence.
15. Update `docs/runbooks/production_deployment.md` with new deploy/rollback flow, linking to feature pack guardrails.
16. Pair with QA to expose health artifact links in daily report; document integration notes.
17. Confirm `npm run ci`, `npm run scan`, and `npm run test:ci` pass on manager-batch branch with updated workflows.
18. Write feedback to `feedback/devops/2025-10-17.md` and clean stray md files.

## Constraints

- **Allowed Tools:** `bash`, `node`, `npm`, `npx prettier`, `supabase`, `flyctl`, `rg`
- **Touched Directories:** `docs/directions/devops.md`
- **Budget:** ≤45 minutes, ≤5,000 tokens, ≤3 files modified/staged
- **Guardrails:** Follow launch guardrails, keep evidence for migrations/deploys, and do not edit other direction files.

## Definition of Done

- [ ] Objective delivered with template-compliant launch guidance and evidence expectations.
- [ ] Task list matches 2025-10-17 direction items and ends with the feedback hygiene entry.
- [ ] Supabase migrations, health workflows, Fly deploy rehearsal, backup validation, and associated runbooks updated with documented proof.
- [ ] `npm run fmt`, `npm run lint`, `npm run test:ci`, and `npm run scan` executed with artefacts attached in feedback.
- [ ] Runbooks and guardrail docs refreshed alongside deploy/rollback updates.
- [ ] Feedback recorded in `feedback/devops/2025-10-17.md` and stray markdown cleaned.

## Risk & Rollback

- **Risk Level:** Medium — inaccurate direction compromises launch readiness.
- **Rollback Plan:** `git checkout -- docs/directions/devops.md` before staging.
- **Monitoring:** Ensure tasks align with backlog T2/T6, feature pack ops docs, and Supabase/Fly telemetry.

## Links & References

- Template: `docs/directions/agenttemplate.md`
- Feature Pack Ops: `integrations/new_feature_20251017T033137Z/manager_agent_pack_v1/07-ops/`
- Supabase schema: `integrations/.../03-database/supabase_schema.sql`
- Health scripts: `scripts/ops/`
- Feedback log: `feedback/devops/2025-10-17.md`
- Runbooks: `docs/runbooks/production_deployment.md`, `docs/runbooks/devops_execution_summary.md`

## Change Log

- 2025-10-17: Version 1.1 – Template rewrite with explicit launch tasks.
