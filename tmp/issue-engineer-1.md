**Agent:** engineer
**Priority:** P0
**Deadline:** 2025-10-17 (2 days)

## Definition of Done
- [ ] Dashboard route created at `app/routes/dashboard.tsx`
- [ ] Responsive grid layout using Shopify Polaris Card components
- [ ] Loading states implemented for all tiles
- [ ] Unit tests pass with >80% coverage
- [ ] Screenshots attached showing responsive behavior
- [ ] Polaris components used throughout
- [ ] Accessibility verified (WCAG 2.1 AA)

## Acceptance Checks
- [ ] Dashboard loads in < 3s (P95)
- [ ] Grid is responsive on mobile, tablet, desktop
- [ ] Loading states show while data fetching
- [ ] No console errors or warnings
- [ ] Tests cover all component states

## Allowed paths
```
app/routes/dashboard.*
app/components/dashboard/*
tests/unit/routes/dashboard.*
tests/unit/components/dashboard/*
```

## Context
- Review Shopify Polaris Card and Layout components
- Use fixtures for dev mode (no real API calls yet)
- Coordinate with integrations agent for API contracts
- Reference: docs/specs/approvals_drawer_spec.md

## Branch
`agent/engineer/dashboard-foundation`

## Evidence Required
- Screenshots (mobile, tablet, desktop)
- Test results
- Bundle size impact
- Lighthouse accessibility score

