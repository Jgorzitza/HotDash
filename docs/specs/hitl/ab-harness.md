Title: Lightweight A/B Harness

Goal

- Minimal copy/layout testing powered by first‑party cookie + GA4 custom dimension; auto‑promote winners.

Design

- Variant assignment via cookie; GA4 dimension records variant
- Experiment registry; manual Approve → Autopromote when threshold met

Verification

- GA4 custom dimension present (adapter proof)
- Cookie assignment stable across sessions; bucketing documented
- Evidence bundle per experiment: hypothesis, metrics, result

Rollback/Promote

- One-click promote: remove alternate branch; keep audit
- One-click rollback: re-enable prior variant; re-assign cookies

Flags

- `feature.abHarness` OFF by default; enable only in dev/staging

Acceptance

- 1–2 live experiments/week
- Auto‑promotion with audit and rollback
