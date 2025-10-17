# Escalation — 2025-10-17

## Sub-agent Sandbox Still Read-Only
- **Issue:** Mandatory launch command (`codex --sandbox workspace-write --ask-for-approval never ...`) reports workspace as read-only; lanes exit without edits (`reports/runs/20251017T154136Z/task_ads_diff_slice_b/exec.log.jsonl`).
- **Impact:** Cannot maintain required active lanes or execute direction tasks; automation paused.
- **Request:** Approve alternate launch configuration (e.g., `--full-auto`) or adjust sandbox so workspace-write allows edits.

## GitHub Actions Billing Blocker
- **Issue:** GitHub Actions billing failure prevents CI (fmt/lint/test:ci/scan/Gitleaks) from running.
- **Impact:** Guardrails cannot verify launch readiness.
- **Request:** Finance/account owner to resolve billing immediately and confirm workflows rerun.
