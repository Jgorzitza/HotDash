# AI Dry-Run Sample Outputs

> **QA Hold — 2025-10-12:** Credentials validated 2025-10-10 15:45 UTC; continue rehearsing with mock artifacts until QA posts green `?mock=0` evidence. Log any access issues via `customer.support@hotrodan.com` and `feedback/ai.md`.

This folder houses the facilitator packets referenced in `docs/enablement/dry_run_training_materials.md` for the 2025-10-16 operator rehearsal. Each kit includes telemetry callouts, Supabase evidence reminders, and facilitation notes per the 2025-10-10 enablement direction.

- `cx_escalations_training_samples.md` — CX Escalations scenarios A–D with Shopify/Chatwoot cues and AI copy
- `sales_pulse_training_samples.md` — Sales Pulse KPI drills covering surge, dip, channel mix, and promo readiness
- `inventory_heatmap_training_samples.md` — Inventory Heatmap drills for restock, transfer, and intentional low-stock workflows
- Async companions (staged while staging is unavailable): recorded mock walkthroughs live under `artifacts/training/async_modules/2025-10-10/`. Pair each video with the corresponding sample packet below and log takeaways in `artifacts/ops/dry_run_2025-10-16/async_prep_notes.xlsx`.

> Append annotated screenshots and Supabase decision IDs once staging secrets and design overlays land (dependency tracked in `feedback/enablement.md`).

## Latest Supabase Evidence (2025-10-10 export)
Use the refreshed log bundle while rehearsing (`artifacts/logs/supabase_decision_export_2025-10-10T07-29-39Z.ndjson`, summary in `artifacts/monitoring/supabase-sync-summary-latest.json`). Pair the sample IDs with the scenario tables inside each kit and note the hourly monitor now references the same dataset.

| decisionId | Status | Attempt | Duration (ms) | Suggested usage |
| --- | --- | --- | --- | --- |
| 101 | SUCCESS | 1 | 241.12 | Baseline approval reference (Sales Surge, CX ship_update, Inventory restock). |
| 102 | SUCCESS | 1 | 198.77 | Secondary success sample for marketing/intentional-low-stock narratives. |
| 103 | TIMEOUT | 3 | 1500.55 | Use to illustrate escalation when Supabase logs `ETIMEDOUT` and operators must capture fallbacks. |
| 104 | SUCCESS | 2 | 265.43 | Demonstrate retry metadata; call out documenting follow-up actions in Q&A templates. |
