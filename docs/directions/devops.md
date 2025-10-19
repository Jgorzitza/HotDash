# DevOps Direction

- **Owner:** DevOps Agent
- **Effective:** 2025-10-18
- **Version:** 2.1

## Objective

Current Issue: #108

Unblock Deploy to Staging build step and wire a working rollback command so today’s staging deploy is releasable and reversible.

## Tasks

1. Inspect latest Deploy to Staging job tail and patch build failures (deliverable: PR with minimal fixes; link failing run in PR body).
2. Replace rollback placeholder with correct Fly command in `.github/workflows/deploy-staging.yml` (deliverable: dry-run success proof in logs + doc update).
3. Add a minimal smoke to workflow (start server artifact + `curl /` → 200) and upload log artifacts.
4. Capture logs to `artifacts/devops/2025-10-18/` with `sha256_manifest.txt`.
5. Write feedback to `feedback/devops/2025-10-18.md` and clean up stray md files.

## Constraints

- **Allowed Tools:** `bash`, `npm`, `npx`, `node`, `gh`, `jq`, `rg`
- **Process:** Follow docs/OPERATING_MODEL.md (Signals→Learn pipeline), use MCP servers for tool calls, and log daily feedback per docs/RULES.md.
- **Touched Directories:** `.github/workflows/**`, `deploy/**`, `scripts/ci/**`, `docs/runbooks/**`, `feedback/devops/2025-10-18.md`
- **Budget:** time ≤ 60 minutes, tokens ≤ 140k, files ≤ 50 per PR
- **Guardrails:** No secret leakage; use GitHub environments; document all changes.

## Tasks

1. Follow docs/manager/EXECUTION_ROADMAP.md (DevOps — Roadmap). Autonomy Mode applies. Log evidence in `feedback/devops/<YYYY-MM-DD>.md`.

## Definition of Done

- [ ] Deploy to Staging build passes
- [ ] Rollback command validated (dry-run)
- [ ] `npm run fmt`
- [ ] `npm run lint`
- [ ] `npm run test:ci`
- [ ] `npm run scan`
- [ ] Runbooks updated with new env requirements
- [ ] Feedback entry updated with evidence
- [ ] Contract test passes
- [ ] Foreground Proof: committed `artifacts/devops/<YYYY-MM-DD>/logs/heartbeat.log`

## Autonomy Mode (Do Not Stop)

- If blocked > 15 minutes, document blocker and proceed to next queued task. Do not idle.
- Keep changes restricted to infra/config paths; attach logs.

## Foreground Proof (Required)

- For any step expected to run >15s, run via `scripts/policy/with-heartbeat.sh devops -- <command>`.
- Append ISO timestamps on each step to `artifacts/devops/<YYYY-MM-DD>/logs/heartbeat.log`.
- Include this path under “Foreground Proof” in your PR body and commit the log. PRs without it fail CI.

## Fallback Work Queue (aligned to NORTH_STAR)

1. CI gates: ensure `ci` job runs fmt/lint/tests/scan; fix flakes
2. Gitleaks SARIF upload and push protection audits
3. Staging deploy rehearsal doc and rollback scripts
4. Prometheus alert sanity for tiles; slow query analysis
5. Runner capacity and cache optimization
6. Workflow concurrency groups and cancellation to reduce queue time
7. Cache key strategy and restore/fallback tuning for node_modules
8. Secrets/Environments audit and branch protection checks
9. Base image updates and lockfile hygiene guidance
10. Pre-commit and pre-push guard scripts doc refresh

## Contract Test

- **Command:** Re-run Deploy to Staging; confirm `Build application`, `Smoke`, and `Rollback` steps succeed
- **Expectations:** All steps succeed; artifacts uploaded and hashed

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
