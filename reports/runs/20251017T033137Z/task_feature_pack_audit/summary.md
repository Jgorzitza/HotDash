# Feature Pack Audit — 2025-10-17T04:27:10Z

## Intake Status
- Downloaded archive `1wxfcnjUh6yed0mmuAunAO_qEaYGcKK2h` via `gdown` (12.8 KB) and extracted to `integrations/new_feature_20251017T033137Z/manager_agent_pack_v1/`.
- Recorded file tree and SHA256 checksums in `integrations/new_feature_20251017T033137Z/README.md`.
- Secret scan (`npm run scan`) completed successfully post-extraction.

## Components & Dependencies
- **00-overview**: README summarising idea pool launch scope.
- **01-task-plans/manager_tasks.yaml**: 30-task manager playbook (needs alignment with direction sync).
- **02-schemas**: JSON schema definitions for product drafts, patterns, and SKU rules—map to Supabase validation + tests.
- **03-database**: Supabase SQL migration + RLS notes—diff against current migrations before applying.
- **04-api/api_contracts.json**: REST contract surface for analytics/idea endpoints.
- **05-integrations/shopify_notes.md**: Implementation notes for Shopify draft automation.
- **06-ui/react_router7_routes.tsx**: Router 7 scaffolding for dashboards, idea pool, and social routes.
- **07-ops**: Guardrail checklist + monitoring experiment design (tie into DevOps/QA tasks).
- **08-edge-functions/functions_list.md**: Required edge functions (ideation backfill, experiment promotion, etc.).
- **09-configuration/.env.example**: Environment template; ensure secrets moved to vault.

## Risks & Required Follow-Up
- Reconcile the provided Supabase schema with existing migrations to avoid drift; add integration tests.
- Validate API contracts against router modules before coding.
- Update direction files so each agent owns slices of the pack (pending `task_direction_sync`).
- After integration, regenerate checksum log if files change.

## Suggested Merge Targets
- Keep assets under `integrations/new_feature_20251017T033137Z/manager_agent_pack_v1/`.
- Map SQL to `supabase/migrations/20251016_idea_pool_schema.sql` derivatives.
- Derive UI routes into `app/routes/**` per provided `react_router7_routes.tsx`.
