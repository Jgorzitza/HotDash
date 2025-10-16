# North Star Task Plan — Engineer Agent

## A. Approvals Experience
- [ ] Restore and harden `ApprovalCard` wiring (loading/error states, evidence rendering, action buttons).
- [ ] Finish `ApprovalsDrawer` flows: grade form, validation banner, CTA disable logic, optimistic updates.
- [ ] Implement approvals list pagination, filter chips, and empty-state messaging.
- [ ] Wire approve/reject actions to Supabase/agent-service endpoints with audit logging.
- [ ] Build fixture set for approvals (live/mock) and add Storybook stories.
- [ ] Add keyboard accessibility (focus trap, ESC/Enter handlers) for drawer.
- [ ] Surface error notifications and retry hints when agent-service is unreachable.
- [ ] Provide screenshot & video artifacts demonstrating happy path and error path.

## B. Dashboard Tiles
- [ ] Complete Revenue, AOV, Returns, Stock, SEO, CX tiles using live loaders/actions.
- [ ] Implement approvals summary tile with badge counts and deep link.
- [ ] Add loading skeletons, error banners, and empty states per tile.
- [ ] Localize currency/number formatting, respect locale feature flags.
- [ ] Integrate new tiles into grid layout with responsive breakpoints and spacing tokens.
- [ ] Connect tiles to feature flag utility, ensure fallback to mock data for dev/testing.
- [ ] Build Storybook coverage and screenshot tests across breakpoints.
- [ ] Validate tile accessibility (ARIA labels, color contrast, focus order).

## C. Routing & Data Loaders
- [ ] Update `app.routes/app._index.tsx` loaders to consume Integrations/Data outputs.
- [ ] Add query parameter toggles for mock/live modes and ensure deterministic data for tests.
- [ ] Ensure Supabase session tracking and error handling (unauthenticated, rate limit) per route.
- [ ] Implement caching hints (ETags/headers) where appropriate.
- [ ] Write integration tests to verify loader responses and shared utilities.

## D. Shared Utilities & Components
- [ ] Finalize shared components: `TileCard`, `DateRangePicker`, badges, `useFocusTrap`.
- [ ] Audit and fix keyboard navigation (`useKeyboardNav`) and telemetry/feature flag helpers.
- [ ] Remove stray `any` types, supply generics to utility functions.
- [ ] Create Storybook documentation pages for core components/utilities.

## E. Testing & Tooling
- [ ] Resolve lint errors throughout app components and utility hooks.
- [ ] Add Vitest coverage for drawer logic, tile mapping helpers, and route loaders.
- [ ] Expand Playwright suite: approvals happy path, rejection path, error fallback, tile grid layout.
- [ ] Set up visual regression screenshots for dashboard/approvals states.
- [ ] Integrate tests into CI (`test.yml`) and ensure they run within target duration.

## F. Documentation & DoD Evidence
- [ ] Produce engineering handoff doc summarizing dashboard/approvals architecture.
- [ ] Capture design alignment notes with Designer (Polaris usage, spacing tokens).
- [ ] Link evidence (screenshots, logs) in Issues/feedback for each milestone.
- [ ] Coordinate with QA to confirm DoD checklist (tests, screenshots, rollback).

## G. Cleanup & Stabilization
- [ ] Remove deprecated or duplicate components/scripts replaced by new implementation.
- [ ] Verify tree-shaking/build output remains performant after new modules.
- [ ] Ensure `npm run lint`, `npm run test:unit`, and E2E suites are green before merge.
