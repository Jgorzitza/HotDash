# task_feature_pack_audit — Direction

- **Owner:** Manager Sub-Agent
- **Effective:** 2025-10-17
- **Version:** 1.0

## Objective
Catalog the Google Drive feature pack (1wxfcnjUh6yed0mmuAunAO_qEaYGcKK2h), unpack it to `integrations/new_feature_20251017T033137Z/`, and produce an integration summary with risks and required follow-up tasks.

## Current Tasks

1. Download the archive to `tmp/` (use curl/wget + gdown if needed) and extract into `integrations/new_feature_20251017T033137Z/`.
2. Generate a file tree (`tree` or `find`) and checksum (sha256) log saved under `integrations/new_feature_20251017T033137Z/README.md`.
3. Write `reports/runs/20251017T033137Z/task_feature_pack_audit/summary.md` describing components, dependencies, and suggested merge locations.
4. Note explicit risks/tests required for downstream tasks.
5. Write feedback to `feedback/manager/2025-10-17.md` if discrepancies arise and clean stray md files.

## Constraints

- **Allowed Tools:** `bash`, `curl`, `wget`, `gdown`, `node` (read-only), `tree`, `sha256sum`.
- **Touched Directories:** `tmp/`, `integrations/new_feature_20251017T033137Z/`, `reports/runs/20251017T033137Z/task_feature_pack_audit/`.
- **Budget:** ≤ 75 minutes wall clock, ≤ 7,500 tokens. Max 20 files touched.
- **Guardrails:** Do not merge into app code; keep intake isolated until reviewed.

## Definition of Done

- [ ] Archive downloaded and extracted to the timestamped directory.
- [ ] `integrations/new_feature_20251017T033137Z/README.md` contains file listing + checksums.
- [ ] `reports/runs/20251017T033137Z/task_feature_pack_audit/summary.md` created with risks/tests.
- [ ] Run `npm run scan` for secrets on modified artifacts.
- [ ] Feedback logged and stray docs cleaned.

## Risk & Rollback

- **Risk Level:** Medium (unknown archive contents).
- **Rollback Plan:** Delete `integrations/new_feature_20251017T033137Z/` and re-run download; no repo code touched.
- **Monitoring:** Verify checksums and ensure no binary secrets included.

## Links & References

- North Star: `docs/NORTH_STAR.md`
- Roadmap: `plans/roadmap.md`
- Spec placeholders: `docs/specs/chatwoot_health_check.md` (if present), existing direction files.

## Change Log

- 2025-10-17: Version 1.0 — initial task packet.
