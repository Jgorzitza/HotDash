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

## Current Sprint Focus — 2025-10-10
- Pull the rewritten history (post git-filter-repo) and reset local tooling (`git remote add origin <repo>` if needed); log confirmation in `feedback/deployment.md` that no `postgresql://` strings remain.
- Freeze staging deploys until reliability rotates Supabase credentials tomorrow; queue the redeploy script with placeholders and outline evidence you need once new secrets land.
- Update `docs/deployment/env_matrix.md` and the staging install runbook to flag that Supabase + Shopify secrets are invalidated pending rotation; coordinate handoff timing with product/support.
- Audit GitHub Actions secrets for leftover DSNs or outdated tokens, noting any cleanup required in `feedback/deployment.md`, and be ready to re-run `scripts/deploy/staging-deploy.sh` immediately after the new bundle drops.
