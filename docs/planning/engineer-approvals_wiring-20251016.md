# Issue Seed — Engineer — PR Polish & Live Wiring (Start 2025-10-16)

Agent: engineer

Definition of Done:
- PR feedback addressed for Dashboard + Approvals Drawer (updated screenshots + tests)
- Tiles wired to API loaders (revenue, AOV, returns, stock risk, SEO, CX) with feature-flagged fallbacks
- Route typing: explicit loader return types + `useLoaderData` generics; no `any`
- Accessibility polish: focus order, ARIA, keyboard navigation validated
- Approve disabled until `/validate` OK and ai-customer `human_review: true`
- Error states: tile fallbacks with retry + telemetry events
- Evidence bundle attached: P95 timings, Lighthouse a11y, screenshots (3 breakpoints)

Acceptance Checks:
- Approvals Drawer shows evidence, grading UI; Approve disabled until `/validate` returns OK
- All loader modules export typed contracts; typecheck passes without `any`
- P95 tile load < 3s (local/dev fixtures acceptable with provenance)
- Unit/integration tests pass; screenshots updated

Allowed paths: app/components/**, app/routes/**, tests/**, .storybook/**, docs/specs/**

Evidence:
- Screenshots (mobile/tablet/desktop), Lighthouse a11y score, test logs

Rollback Plan:
- Revert PR commit; feature flags keep production stable

