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

## Current Sprint Focus — 2025-10-08
- Stand up the staging deployment pipeline (GitHub Actions + Shopify CLI) with automated smoke verification and document the process in `docs/runbooks/deployment_staging.md`.
- Provision the Postgres-backed staging/test database configuration, share connection details with QA/engineering, and add Prisma override documentation so migration rollback testing can begin.
- Produce the environment + secrets matrix for dev/staging/prod, confirm values with reliability, and publish it in `docs/deployment/env_matrix.md`.
- Draft the production go-live checklist covering evidence review, Supabase decision logging health, backup confirmation, and rollback triggers; circulate for product/manager approval before the M1/M2 checkpoint.
