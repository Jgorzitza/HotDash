**Agent:** engineer
**Priority:** P0
**Deadline:** 2025-10-17 (2 days)

## Definition of Done
- [ ] Approvals Drawer component created
- [ ] Drawer opens/closes smoothly
- [ ] Evidence sections display properly
- [ ] Grading interface (tone/accuracy/policy 1-5 scale)
- [ ] Approve/Reject buttons (disabled in dev mode)
- [ ] Unit tests pass with >80% coverage
- [ ] Screenshots attached showing all states

## Acceptance Checks
- [ ] Drawer opens from approvals queue tile
- [ ] Evidence sections render (queries, samples, diffs, impact, rollback)
- [ ] Grading sliders work (1-5 scale)
- [ ] Approve button disabled in dev mode
- [ ] Drawer closes on cancel
- [ ] Accessible (keyboard navigation, screen reader)

## Allowed paths
```
app/components/approvals/*
app/routes/approvals.*
tests/unit/components/approvals/*
```

## Context
- Review docs/specs/approvals_drawer_spec.md
- Use Shopify Polaris Drawer component
- Implement HITL approval workflow UI
- Use fixtures for dev mode data

## Branch
`agent/engineer/dashboard-foundation`

## Evidence Required
- Screenshots (open, closed, grading states)
- Test results
- Accessibility verification

