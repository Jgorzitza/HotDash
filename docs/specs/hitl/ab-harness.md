Title: Lightweight A/B Harness

Current Issue: #80 (Product)

## Goal

Minimal copy/layout testing powered by first-party cookie + GA4 custom dimension, with HITL-controlled promotions and audit trails.

## Architecture

1. **Assignment:** cookie-based bucketing (`__ab_variant`) seeded on first eligible request; deterministic using hash(exp_key + visitor_id).
2. **Registry:** JSON/YAML file (see config) enumerating experiments, hypotheses, targeting, metrics, guardrails, and rollout plans.
3. **Analytics:** GA4 custom dimension `ab_variant` (session scope) populated via analytics adapter; Supabase decision log captures exposures + outcomes.
4. **Promotion Workflow:** HITL approves promotion once metrics meet thresholds; automated script toggles default variant and archives experiment arms.

## Experiment Registry Fields

```json
{
  "key": "pdp_hero_copy_q4",
  "status": "running",
  "hypothesis": "Performance-focused hero copy increases add-to-cart",
  "primary_metric": "atc_rate",
  "min_effect_pct": 5,
  "targeting": {
    "routes": ["/products/*"],
    "min_sessions": 500,
    "device": "all"
  },
  "arms": [
    { "id": "control", "rollout": 0.5 },
    { "id": "variant_a", "rollout": 0.5 }
  ],
  "guardrails": ["conversion_rate_drop > -3%", "refund_rate increase < 2%"],
  "rollout_plan": [
    { "stage": 1, "rollout": 0.1, "min_duration_hours": 24 },
    { "stage": 2, "rollout": 0.5, "criteria": "power >= 0.8" }
  ],
  "approvals": { "role": "CEO", "timestamp": null }
}
```

## Verification Checklist

- GA4 custom dimension visible via adapter proof (`npx analytics-cli ga4 --list-dim ab_variant`).
- Cookie assignment stable across sessions; QA to validate TTL (30 days) and path `/` coverage.
- Evidence bundle per experiment: hypothesis doc, metrics snapshot, export of GA4 results, Supabase decision log excerpt.

## Promotion & Rollback

- **Promote:** script `scripts/ops/ab-promote.mjs` flips default variant, archives experiment entry, and records decision log entry.
- **Rollback:** `scripts/ops/ab-rollback.mjs` re-enables prior variant, resets cookie assignments, notifies analytics to stop sending new exposures.
- Audit: maintain `artifacts/seo/YYYY-MM-DD/ab-harness/<experiment_key>/` with promotion/rollback evidence.

## Feature Flags

- `feature.abHarness` — gates overall harness surfaces.
- `feature.abHarnessAutopromo` — optional second flag controlling automated promotion script execution. Both default OFF; require HITL approval.

## Acceptance Targets

- 1–2 live experiments per week.
- Promotion workflow produces audit trail + rollback script output in < 5 minutes.

## Telemetry & Analytics

- GA4 session-scope dimension `ab_variant` (control vs variant) with `experiment_key` prefix for dedupe.
- Supabase decision log entries with scope `ab-harness` capture assignment + outcomes; used for audit.
- Optional BigQuery export for longer-term analysis.

## Test Harness Endpoints (docs-only)

- `POST /api/ab/assign` — accepts `{ experiment_key, visitor_id }`, returns `{ arm: 'control'|'variant_a', ttlDays: 30 }` without side effects in dev.
- `GET /api/ab/variant?experiment_key=...` — returns current assignment derived from cookie in dev.
- `POST /api/ab/clear` — clears assignment cookie (dev only) to allow QA reseeding.

These endpoints are for harness documentation and QA rehearsal only while `feature.abHarness` is OFF. Production wiring happens behind HITL approvals with audit trails.

## Open Items

1. Define guardrail metrics (refund rate, NPS changes) and owners.
2. Coordinate with product for experiment backlog prioritization.
3. Build CLI stubs for promote/rollback scripts (no autopublish) and document usage.
