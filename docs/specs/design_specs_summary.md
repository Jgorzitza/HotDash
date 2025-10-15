# Design Specifications Summary

**Date:** 2025-10-15  
**Author:** Designer Agent  
**Status:** Ready for Engineer Review

---

## Overview

Two comprehensive design specifications have been created for the Hot Rod AN Control Center foundation:

1. **Dashboard Tiles Design Spec** - Complete tile design system
2. **Approvals Drawer UX Spec** - Detailed UX flows and accessibility

Both specs follow Shopify Polaris design system and ensure WCAG 2.1 AA compliance.

---

## 1. Dashboard Tiles Design Spec

**File:** `docs/specs/dashboard_tiles_design_spec.md`

### Coverage

#### Tile Types (6)
- **Metric Tile**: Single KPI with trend (Revenue, AOV)
- **List Tile**: Multiple items (Inventory Alerts, CX Escalations)
- **Heatmap Tile**: Visual distribution (Inventory buckets)
- **Status Tile**: System health (Ops Metrics)
- **Chart Tile**: Time-series data (Sales Pulse)
- **Action Tile**: Approvals queue with count badge

#### States (10)
- **Loading**: Skeleton, Spinner, Progressive, Refresh
- **Success**: Healthy (OK), Data Available
- **Error**: Network, Auth, Validation, Timeout
- **Empty**: No Data, Unconfigured

#### Responsive Design
- **Mobile** (< 768px): 1 column, touch-optimized
- **Tablet** (768-1024px): 2 columns, hybrid
- **Desktop** (> 1024px): 3-4 columns, auto-fit

#### Accessibility (WCAG 2.1 AA)
- Keyboard navigation with Tab, Enter, Escape, Arrows
- Screen reader support with ARIA labels and live regions
- Color contrast ratios verified (4.5:1 text, 3:1 UI)
- Focus indicators (2px solid, high contrast)
- High contrast mode support

#### Polaris Component Mapping
- `<Card>` for tile container
- `<Badge>` for status indicators
- `<Banner>` for error messages
- `<EmptyState>` for no data
- `<SkeletonBodyText>` and `<Spinner>` for loading

### Key Features

✅ Operator-first design (scannable, actionable, trustworthy)  
✅ Polaris-aligned components and tokens  
✅ Comprehensive state management  
✅ Accessibility-first approach  
✅ Implementation guidelines with code examples  
✅ Testing requirements defined

---

## 2. Approvals Drawer UX Spec

**File:** `docs/specs/approvals_drawer_ux_spec.md`

### Coverage

#### State Transitions (7 States)
```
Draft → Pending Review → Approved → Applied → Audited → Learned
                      ↓
              Request Changes / Reject
```

#### Drawer Layout (6 Sections)
1. **Header**: Title, meta info, status chip, close button
2. **Evidence**: Summary cards + tabs (Diffs, Samples, Queries, Screenshots)
3. **Risks & Rollback**: Editable risk list and rollback plan
4. **Tool Calls Preview**: Declarative actions with dry-run status
5. **Audit**: Receipts, metrics, rollback link (after apply)
6. **Sticky Footer**: Request Changes, Reject, Approve buttons

#### Grading Interface (HITL)
- **Trigger**: After approval, before apply (CX/social only)
- **Ratings**: Tone, Accuracy, Policy (1-5 scale each)
- **Notes**: Optional text field
- **Flow**: Grade → Submit & Apply → Success

#### Keyboard Navigation (10 Shortcuts)
- `Escape`: Close drawer
- `Tab` / `Shift+Tab`: Navigate elements
- `Cmd/Ctrl+Enter`: Approve
- `Cmd/Ctrl+R`: Request changes
- `Cmd/Ctrl+Delete`: Reject
- `Arrow Up/Down`: Navigate tabs
- `Space/Enter`: Activate button/toggle

#### Screen Reader Support
- Drawer announcement on open/close
- Section announcements with state
- Button state announcements (enabled/disabled)
- Live regions for validation, progress, success/error
- Error messages with `role="alert"`

#### Responsive Behavior
- **Desktop**: 60% width (max 800px), side-by-side layouts
- **Tablet**: 80% width, single column
- **Mobile**: Full screen, simplified, touch-optimized

#### Error Handling UX
- **Validation Errors**: Inline messages, error summary, disabled approve
- **Apply Errors**: Error banner, retry button, rollback option
- **Network Errors**: Offline indicator, auto-retry with backoff

#### Accessibility (WCAG 2.1 AA)
- All 4 principles covered (Perceivable, Operable, Understandable, Robust)
- Complete checklist with 25+ criteria verified
- Focus management (trap, return, order)
- High contrast mode support
- Zoom support (200%, 400%)

### Key Features

✅ Trust through transparency (evidence, rollback, audit)  
✅ Efficient review workflow (keyboard shortcuts, SLA timers)  
✅ Safe by default (validation required, confirmation for high-risk)  
✅ Keyboard-first navigation  
✅ Full screen reader support  
✅ Responsive across all breakpoints  
✅ Comprehensive error handling

---

## Implementation Priorities

### Phase 1: Foundation (Current)
- [ ] Review design specs for technical feasibility
- [ ] Validate Polaris component choices
- [ ] Set up accessibility testing environment
- [ ] Verify design tokens sufficiency

### Phase 2: Dashboard Tiles
- [ ] Implement TileCard with all states
- [ ] Add loading states (skeleton, spinner)
- [ ] Add error states with retry
- [ ] Implement responsive grid
- [ ] Add keyboard navigation
- [ ] Test accessibility (WCAG 2.1 AA)

### Phase 3: Approvals Drawer
- [ ] Implement drawer layout with Polaris Modal
- [ ] Add evidence section with tabs
- [ ] Implement validation flow
- [ ] Add grading interface (HITL)
- [ ] Implement keyboard shortcuts
- [ ] Add screen reader support
- [ ] Test accessibility (WCAG 2.1 AA)

### Phase 4: Polish & Testing
- [ ] Visual regression tests
- [ ] Accessibility audit (axe, Lighthouse)
- [ ] Screen reader testing (NVDA, JAWS, VoiceOver)
- [ ] High contrast mode testing
- [ ] Performance optimization
- [ ] Documentation updates

---

## Questions for Engineer

### Technical Feasibility

1. **Polaris Migration**
   - Is migration from custom CSS to Polaris Card feasible?
   - Timeline estimate for full Polaris adoption?
   - Any known issues with Polaris Modal size="large"?

2. **Backend Support**
   - Is `/validate` endpoint implemented?
   - Retry mechanism for failed actions?
   - SSE/WebSocket for real-time updates?

3. **Accessibility Infrastructure**
   - Focus trap library recommendation? (focus-trap-react?)
   - Screen reader test environment available?
   - Automated testing setup (axe, Lighthouse)?

4. **Performance**
   - Drawer first paint target (500ms) achievable?
   - Animation performance concerns (300ms transitions)?
   - Pagination/virtualization needed for large datasets?

### Design Decisions

1. **Grading Interface**
   - MVP or Phase 2?
   - Separate modal or inline?
   - Skip option acceptable?

2. **Loading States**
   - Skeleton UI vs spinner preference?
   - Progressive loading for large datasets?
   - Stale data indicator design?

3. **Error Handling**
   - Auto-retry strategy (exponential backoff)?
   - Rollback button placement?
   - Error log access level?

4. **Keyboard Shortcuts**
   - Any conflicts with Shopify Admin shortcuts?
   - Customizable shortcuts needed?
   - Shortcut hints always visible or on hover?

---

## Design Tokens Verification

All required tokens are defined in `app/styles/tokens.css`:

✅ **Colors**: Status (healthy, attention, unconfigured), text, backgrounds  
✅ **Spacing**: Tile padding, gap, internal gap, modal padding  
✅ **Typography**: Font families, sizes, weights, line heights  
✅ **Border Radius**: Tile, modal, button  
✅ **Shadows**: Tile, tile hover, modal  
✅ **Transitions**: Durations, easing functions  
✅ **Component Tokens**: Tile, button, modal specific

**Additional tokens needed**: None identified

---

## Accessibility Testing Plan

### Automated Testing
- **axe DevTools**: Run on all components, target 0 violations
- **Lighthouse**: Accessibility score ≥ 95
- **Pa11y**: CI integration for regression prevention

### Manual Testing
- **Keyboard Navigation**: All elements reachable, logical order
- **Screen Readers**: NVDA (Windows), JAWS (Windows), VoiceOver (Mac)
- **High Contrast Mode**: Windows High Contrast, forced-colors
- **Zoom**: 200%, 400% zoom levels
- **Color Blindness**: Deuteranopia, Protanopia, Tritanopia simulators

### Test Environments
- **Browsers**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Devices**: Desktop, tablet, mobile (iOS, Android)
- **Assistive Tech**: Screen readers, keyboard-only, voice control

---

## Next Steps

1. **Engineer Review** (Priority: High)
   - Review both design specs
   - Answer feasibility questions
   - Identify technical blockers
   - Estimate implementation timeline

2. **Prototype** (Priority: High)
   - Build basic drawer with Polaris Modal
   - Test keyboard navigation
   - Validate responsive behavior

3. **Accessibility Setup** (Priority: Medium)
   - Install axe DevTools, Lighthouse
   - Set up screen reader test environment
   - Configure CI accessibility checks

4. **Design Tokens** (Priority: Low)
   - Verify all tokens sufficient
   - Add any missing tokens
   - Document token usage

5. **Manager Approval** (Priority: High)
   - Review design decisions
   - Approve implementation priorities
   - Allocate resources

---

## Success Criteria

### Design Specs
- [x] Dashboard tiles design spec complete
- [x] Approvals drawer UX spec complete
- [x] WCAG 2.1 AA compliance documented
- [x] Polaris component mapping complete
- [x] Testing requirements defined

### Implementation (Future)
- [ ] All tile states implemented
- [ ] Approvals drawer functional
- [ ] WCAG 2.1 AA compliance verified
- [ ] Performance targets met (P95 < 3s)
- [ ] Accessibility audit passed

---

## References

- **Design Specs**:
  - `docs/specs/dashboard_tiles_design_spec.md`
  - `docs/specs/approvals_drawer_ux_spec.md`
- **Technical Spec**: `docs/specs/approvals_drawer_spec.md`
- **Design Tokens**: `app/styles/tokens.css`
- **Current Implementation**: `app/components/tiles/`
- **Polaris**: https://polaris.shopify.com/
- **WCAG 2.1**: https://www.w3.org/WAI/WCAG21/quickref/

---

## Contact

**Designer Agent**  
**Feedback**: `feedback/designer/2025-10-15.md`  
**Branch**: `agent/designer/foundation-specs`

