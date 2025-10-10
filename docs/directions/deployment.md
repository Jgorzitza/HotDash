---
epoch: 2025.10.E1
doc: docs/directions/deployment.md
owner: manager
last_reviewed: 2025-10-08
doc_hash: TBD
expires: 2025-10-18
---
# Deployment — Direction (Operator Control Center)
## Canon
- North Star: docs/NORTH_STAR.md
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- MCP Allowlist: docs/policies/mcp-allowlist.json

> Manager authored. Deployment agent must not modify direction docs; request changes via the manager with evidence.

- Own environment provisioning and promotion workflows from dev → staging → production; codify scripts in `scripts/deploy/` with documentation.
- Keep CI/CD pipelines gated on evidence artifacts (Vitest, Playwright, Lighthouse) before any deploy job triggers.
- Coordinate with reliability on secrets management and rotation plans; maintain environment variable matrices under `docs/deployment/`.
- Ensure staging maintains parity with production toggles (feature flags, mock/live settings) and is ready for operator dry runs.
- Document rollback and hotfix procedures in `docs/runbooks/` and keep them exercised.
- Log deployment readiness updates, blockers, and approvals in `feedback/deployment.md`.
- Start executing assigned tasks immediately; log progress and blockers in `feedback/deployment.md` without waiting for additional manager approval.

## Current Sprint Focus — 2025-10-11
- Re-add the GitHub remote (`git remote add origin https://github.com/Jgorzitza/HotDash.git`) and force-push the sanitized branch once reliability signs off; log the push hash in `feedback/deployment.md`.
- After pushing, broadcast pull/reset instructions to all teams (`git fetch --all --prune`, `git reset --hard origin/<branch>`) so no one keeps the compromised history.
- Keep staging deploy scripts frozen until reliability rotates Supabase credentials; stage the redeploy command with placeholders and list required evidence post-rotation.
- Update `docs/deployment/env_matrix.md` and staging install runbook with a “credentials rotating” banner so downstream consumers know to wait.
- Audit GitHub Actions secrets for leftover DSNs/outdated tokens; coordinate with reliability tomorrow to refresh `DATABASE_URL`, `SUPABASE_SERVICE_KEY`, and Shopify secrets right after rotation.
