# Batch 20251017T033137Z — Kickoff

## Goals
- Land guardrails (completed on branch guardrails-20251017T033137Z).
- Intake Drive feature pack and map merge strategy.
- Align documentation and agent direction to launch priorities.

## Task Graph
- `task_feature_pack_audit` → prerequisite for understanding code impact.
- `task_docs_alignment` depends on audit summary to ensure docs reference accurate features.
- `task_direction_sync` depends on docs alignment so assignments match vision.

## Parallelization Plan
- Start `task_feature_pack_audit` immediately.
- Once audit summary committed, run `task_docs_alignment` and `task_direction_sync` sequentially (doc alignment first).
- Future batches will spawn implementation-specific lanes (engineer, devops, qa).

## Risks
- Feature pack may diverge significantly from current repo, requiring conflict resolution.
- Missing credentials (Publer workspace ID, Chatwoot tokens) could block verification.
- Large volume of existing unmerged changes increases diff scope risk; monitor `scripts/policy/check-diff-scope.sh` outputs.

## Mitigations
- Use integrations/new_feature timestamped directory to keep intake isolated.
- Document required secrets in AGENTS.md and escalate via `reports/manager/ESCALATION.md` if unavailable.
- Keep direction updates scoped per agent template; avoid touching code until tasks dispatched.

## Success Criteria
- Plan JSON & kickoff committed.
- Sub-agent packets ready under `reports/runs/20251017T033137Z/`.
- At least two sub-agent lanes executed with JSON event logs and resulting PR summaries.
