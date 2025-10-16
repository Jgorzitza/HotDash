# Issue Seed — DevOps — Guardrails & Validation (Start 2025-10-16)

Agent: devops

Definition of Done:
- Verify Gitleaks runs locally and on PRs; attach outputs
- Run Docs Policy + AI Config checks; attach outputs and fix deltas
- Draft Danger rules audit notes (Allowed paths, Issue linkage, DoD)
- Prepare staging smoke plan (post-deploy warmup + smoke job outline)
- Evidence bundle: command outputs, screenshots, checklist

Acceptance Checks:
- All checks green locally; reproducible commands documented
- Danger audit notes list current rules and gaps
- Staging smoke plan reviewed and linked in PR template

Allowed paths: .github/workflows/**, scripts/policy/**, docs/runbooks/**, tests/**

Evidence:
- Command outputs, screenshots, checklists

Rollback Plan:
- Revert workflow or script changes; maintain previous stable versions

