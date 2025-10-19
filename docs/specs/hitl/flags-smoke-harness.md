Title: Feature Flags — Smoke Harness (dev/staging)

Objective

- Verify that growth-engine capabilities are gated behind flags and can be toggled safely in dev/staging.

Scope

- Flags: feature.programmaticSeoFactory, feature.seoTelemetry, feature.abHarness (all OFF by default)
- Environments: dev/staging only; no production changes

Smoke Cases (happy + one edge)

- When flag OFF → related routes/components return 404/hidden state
- When flag ON (staff + HITL token) → preview endpoints respond 200 with stub payload

Run

- Unit: `npx vitest run tests/unit/smoke/flags.spec.ts`
- Evidence: save output to `artifacts/seo/YYYY-MM-DD/flags-smoke.log`

Rollback

- Disable flags; clear any in-memory/kv mirrors; verify OFF path returns 404/hidden

Notes

- Autopublish OFF; preview-only surfaces allowed when explicitly ON for staff
- No customer/CEO-facing content; no CX messages
