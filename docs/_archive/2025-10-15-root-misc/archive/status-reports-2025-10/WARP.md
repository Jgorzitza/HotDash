# WARP Project Rules — HotDash

These project rules govern how Warp (Agent Mode) should operate in this repository. Subdirectory rules override parent rules when conflicts arise.

1. Source of Truth

- The current local branch is the single source of truth.

2. Direction Authorship (Manager-only)

- Direction documents under docs/directions/\*\* are curator-owned and may only be authored/modified by the Manager.
- Changes must flow via PRs with evidence and explicit manager approval.
- CI Direction Guard blocks non-manager edits unless the PR is labeled approved-by-manager.

3. Feedback Process (Agents)

- Every agent must log status exclusively in feedback/<agent>.md.
- Each entry must include: timestamp, command executed (or script path), and output path/screenshot reference.
- Escalations require two failed attempts with evidence before involving another team.

4. Evidence Gate & Quality

- PRs must reference evidence artifacts: Vitest, Playwright, Lighthouse, and metrics (SSE soak if streaming).
- Evidence is enforced by .github/workflows/evidence.yml.

5. Branch Policy

- Branch names must follow agent/<agent>/<molecule> or hotfix/<slug> (main allowed). Enforced by branch_name.yml.

6. Manager Stand-up

- Manager posts a daily stand-up in feedback/manager.md by 15:00 UTC using docs/directions/manager_standup_template.md.
- Enforced by manager_standup_guard.yml.

7. Secrets & Canonical Toolkit

- Never commit secrets. Use vault paths in docs/ops/credential_index.md and GitHub/Fly environment secrets.
- Keep stack within the canonical toolkit defined in docs/directions/README.md#canonical-toolkit--secrets.

8. Stop List

- No ad-hoc direction/runbook edits by agents.
- No agent launches without the credential checklist.
- No status updates without evidence.

9. References

- Governance: docs/directions/README.md
- Feedback & Direction Controls: docs/policies/feedback_controls.md
- Agent Launch Checklist: docs/runbooks/agent_launch_checklist.md
