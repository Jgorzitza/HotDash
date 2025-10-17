# DevOps Direction

- **Owner:** Manager Agent
- **Effective:** 2025-10-17
- **Version:** 2.0

## Objective

Restore full CI/CD health (GitHub Actions, staging deploys, secrets) and guarantee drift-free production releases for launch.

## Tasks

1. Resolve GitHub Actions billing issue and confirm all workflows (`ci`, `manager-outcome`, Gitleaks) run green.
2. Schedule and execute Supabase staging apply rehearsal with Data; capture logs and rollback drill.
3. Maintain Playwright/Node CI environments with required env vars (`DISABLE_WELCOME_MODAL`, `OPENAI_API_KEY` from vault) and document rotations.
4. Automate daily drift sweep + secrets scan; publish results to `reports/status/gaps.md`.
5. Write feedback to `feedback/devops/2025-10-17.md` and clean up stray md files.

## Constraints

- **Allowed Tools:** `bash`, `npm`, `npx`, `node`, `gh`, `jq`, `rg`
- **Process:** Follow docs/OPERATING_MODEL.md (Signals→Learn pipeline), use MCP servers for tool calls, and log daily feedback per docs/RULES.md.
- **Touched Directories:** `.github/workflows/**`, `docs/runbooks/**`, `scripts/manager/**`, `feedback/devops/2025-10-17.md`
- **Budget:** time ≤ 60 minutes, tokens ≤ 140k, files ≤ 50 per PR
- **Guardrails:** No secret leakage; use GitHub environments; document all changes.

## Definition of Done

- [ ] CI billing resolved and workflows green
- [ ] Staging rehearsal completed with logs
- [ ] `npm run fmt`
- [ ] `npm run lint`
- [ ] `npm run test:ci`
- [ ] `npm run scan`
- [ ] Runbooks updated with new env requirements
- [ ] Feedback entry updated with evidence
- [ ] Contract test passes

## Contract Test

- **Command:** `gh workflow run ci --ref production-smoke-test`
- **Expectations:** Workflow completes successfully (or logs failure with remediation plan).

## Risk & Rollback

- **Risk Level:** High — CI outages block launch.
- **Rollback Plan:** Revert workflow changes, disable failing jobs, communicate freeze until fixed.
- **Monitoring:** GitHub Actions dashboard, Prometheus alerts, drift sweep output.

## Links & References

- North Star: `docs/NORTH_STAR.md`
- Roadmap: `docs/roadmap.md`
- Feedback: `feedback/devops/2025-10-17.md`
- Specs / Runbooks: `docs/runbooks/ci_billing_recovery.md`, `docs/runbooks/manager_startup_checklist.md`

## Change Log

- 2025-10-17: Version 2.0 – Production launch CI/CD readiness
- 2025-10-15: Version 1.0 – Deployment rehearsal tasks
