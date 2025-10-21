# HITL Implementation Checklist (100% until proven)

- Insert `HITL_GATE` before any irreversible/user‑visible action.
- Persist checkpoints to Supabase on gate entry; block execution until a recorded approval row exists.
- Reviewer UI lists pending approvals; decisions: Approve / Reject / Edit (edited payload replaces proposal).
- CI eval gate: composite correctness/groundedness/tone; fail < threshold.
- Observability: emit session_id to traces; track p95 latency, token cost, error rate, human override rate.
- Rollback ladder: stay at 100% HITL until each agent has 7/7 sessions at 100% confidence, no SLO breaches; then sample down.

(See the full spec already in repo; wire exactly to it.)
