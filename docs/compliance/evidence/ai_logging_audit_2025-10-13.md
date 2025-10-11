---
epoch: 2025.10.E1
doc: docs/compliance/evidence/ai_logging_audit_2025-10-13.md
owner: compliance
last_reviewed: 2025-10-13
doc_hash: TBD
expires: 2026-01-13
---
# AI Logging & Index Retention Audit — 2025-10-13

## Summary
- Reviewed new AI build artifacts introduced in sprint (LlamaIndex snapshot + recommendation logs).
- Verified `scripts/ai/build-llama-index.ts` wipes `packages/memory/indexes/operator_knowledge/` before regeneration, satisfying 90-day retention by rebuild cadence.
- Confirmed `scripts/ai/log-recommendation.ts` writes NDJSON + detail JSON files under `packages/memory/logs/build/`; no automated purge exists yet.
- Added retention requirements (30 days for logs, 90 days for index) to `docs/compliance/data_inventory.md` and `docs/compliance/retention_automation_plan.md`.
- Created action item for AI engineering to implement rolling cleanup and evidence capture.

## Outstanding Risks
1. **Manual cleanup gap:** Without pre-run purge, AI logs could exceed 30-day retention and risk accidental git commits.
2. **Artifact storage**: Logs and index snapshots live in workspace. Need encrypted bucket once pipeline moves to CI.

## Follow-up Tasks
- Track AI cleanup implementation in retention automation plan (due 2025-10-16); manual purge evidence logged 2025-10-10 (`docs/compliance/evidence/ai_logging/purge_run_2025-10-15.json`).
- Once purge script exists, archive first-run evidence + hash summary in `docs/compliance/evidence/ai_logging/` (folder to create).
- Coordinate with engineering to ensure gitignore excludes build logs (already respected but monitor).
