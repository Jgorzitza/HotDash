---
epoch: 2025.10.E1
doc: docs/policies/agentfeedbackprocess.md
owner: manager
last_reviewed: 2025-10-11
doc_hash: TBD
expires: 2025-10-18
---

# Agent Feedback Process (Unified, Evidence-First)

This document standardizes how agents capture progress, blockages, and evidence during execution. It complements the WARP rules and each agent’s Local Execution Policy (Auto-Run) defined in docs/directions/<agent>.md.

References:
- WARP Rules: docs/directions/WARP.md
- Feedback & Direction Controls: docs/policies/feedback_controls.md
- Agent Direction: docs/directions/<agent>.md (contains Local Execution Policy)

## Scope
- Applies to all agents. The manager-only file feedback/manager.md must not be edited by agents.
- Each agent logs exclusively in feedback/<agent>.md.

## Required fields for every entry
- Timestamp: ISO 8601 UTC (e.g., 2025-10-11T04:00:00Z)
- Command executed OR script path: exact command/script that was run
- Output/artifact path(s): path(s) where outputs, logs, screenshots, or reports were saved
- Optional: related PR/commit link, issue ID, and short summary

## Evidence storage conventions
- Save large outputs under artifacts/<agent>/... and link the paths in the feedback entry.
- Example folders: artifacts/qa/, artifacts/deployment/, artifacts/reliability/, artifacts/integrations/, artifacts/enablement/.

## Non-interactive commands and pager discipline
- Use non-interactive forms only. Add flags to avoid prompts.
- Disable pagers for VCS and CLIs that might paginate: with git, always add --no-pager; pipe long outputs to files.
- Do not invoke less/man/vim or other interactive tools in auto-run tasks.

## Secrets hygiene
- Load secrets from vault files or environment; never print secret values.
- Reference variables by name only (e.g., $SUPABASE_DB_URL). Do not echo secrets or check them into git.

## Retry and escalation policy

## Correlation with performance metrics
- When possible, include or link a `run_id` (UUID) that also appears in the `agent_run` metrics row, so evidence entries and KPIs can be correlated.
- Do not print secrets in logs; sanitize payload snippets. Reference variable names and run IDs only.
- Retry a failing step up to two times with small, safe adjustments.
- If still failing, escalate by adding a new feedback entry that includes:
  - The failing command(s)
  - The exact error output (sanitized)
  - The artifact paths containing full logs
  - The next proposed action or the owner of the dependency

## Acceptable local operations under Auto-Run
- Local repo operations and local Supabase (127.0.0.1) commands that are non-interactive and safe.
- Read-only remote checks (e.g., git --no-pager status, gh repo view) are acceptable.
- Not allowed under auto-run: remote infrastructure changes, destructive commands, git mutations (commit/push/rewrite).

## Minimal entry template

```markdown path=null start=null
[YYYY-MM-DDTHH:MM:SSZ] — Short Title
- Command/Script: <exact command or script path>
- Output/Artifacts: <paths to logs, screenshots, reports>
- PR/Commit (optional): <link>
- Notes: <brief summary>
```

## Example entries

```markdown path=null start=null
[2025-10-11T04:03:15Z] — Local Supabase status check
- Command/Script: npx supabase status --json > artifacts/qa/2025-10-11T040315Z/supabase-status.json
- Output/Artifacts: artifacts/qa/2025-10-11T040315Z/supabase-status.json
- Notes: API/DB/Studio healthy. Proceeding to migrations.
```

```markdown path=null start=null
[2025-10-11T04:07:42Z] — Shopify helpers: typecheck
- Command/Script: npm run typecheck > artifacts/engineer/2025-10-11T040742Z/typecheck.log
- Output/Artifacts: artifacts/engineer/2025-10-11T040742Z/typecheck.log
- PR/Commit: (pending)
- Notes: Typecheck passed. Moving to Playwright smoke (mock=1).
```

```markdown path=null start=null
[2025-10-11T04:10:03Z] — Synthetic check latency (mock=0) attempt 2/2
- Command/Script: node scripts/ci/synthetic-check.mjs --host=https://hotdash-staging.fly.dev --mode=live --out artifacts/reliability/2025-10-11T041003Z/synth.json
- Output/Artifacts: artifacts/reliability/2025-10-11T041003Z/synth.json
- Notes: P95=372ms (over budget). Escalating to Deployment with artifact link and change suggestions.
```

## Role notes (apply with your direction doc)
- QA: Keep mock=1 green by default; use Admin login creds for mock=0 smoke; save traces/screens.
- Engineer: Add --no-pager to all git commands; store large diffs/logs under artifacts/engineer/.
- Reliability: Prefer non-interactive CLIs; if a tool forces interactivity, switch to a non-interactive alternative and log a blocker after 2 attempts.
- Deployment: Record env matrix and runbook parity evidence; no remote infra changes under auto-run.
- Support/Chatwoot: Capture webhook payload tests and inbox checks with sanitized logs; never print secrets.
- Data: Save schema dumps and parity outputs under artifacts/data/ with timestamps.
- Enablement/Designer/Marketing: Link deliverables (docs, assets) and approval evidence under artifacts/<role>/.
- Compliance/Localization/Product/Integrations: Keep outreach logs and responses attached; sanitize transcripts and credentials.

---

This process is effective immediately. It aligns with the Local Execution Policy (Auto-Run) in each docs/directions/<agent>.md and with the WARP governance controls. Agents should resume work now, logging every action with timestamps, commands, and artifact paths.
