# Blockers to Green — Service Stack (Launch Day)

Last updated: 2025-10-18

1) Deploy to Staging: Build application step fails
- Owner: Engineer + DevOps
- Evidence: Latest GH Actions run (Deploy to Staging)
- Next actions (broad):
  - Pull last 300 lines from failing job; identify minimal type/import fixes
  - Patch with smallest viable diffs; re-run
- ETA: Today

2) Gitleaks: GH job failing while local scan clean
- Owner: DevOps/Security
- Next actions (broad):
  - Extract failing finding from SARIF; validate true/false positive
  - Adjust `.gitleaks.toml` or baseline with precise ignore if benign
- ETA: Today

3) Supabase staging connectivity (IPv6 route failure)
- Owner: DevOps/Manager
- Next actions (broad):
  - Use IPv4 pooler host (vault/occ/supabase/database_url_staging.env)
  - Re-run apply with non-destructive path; capture evidence
- ETA: Today

4) CI heavy lanes red (lint/tests)
- Owner: Engineer/QA
- Next actions (broad):
  - Scope lint to changed paths for hotfix PRs; split gates where needed
  - Targeted Tier A tests first; backlog heavier suites
- ETA: Today/Tomorrow

Notes
- Keep MCP-first for Shopify dev work; GA4/GSC via internal adapters (no MCP). Attach command logs.
- Autopublish toggles remain OFF until CEO enables per section.
