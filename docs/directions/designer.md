# Designer Direction

- **Owner:** Designer Agent
- **Effective:** 2025-10-19
- **Version:** 4.0

## Objective

Current Issue: #118

**UNBLOCKED**: Production app live at `https://hotdash-staging.fly.dev` - Execute complete visual review and design system audit using Chrome DevTools MCP.

## Production App Access

**URL**: `https://hotdash-staging.fly.dev`  
**Tool**: Chrome DevTools MCP (use `mcp_Chrome_DevTools_*` functions)  
**Status**: Version hot-dash-22 deployed and accessible ✅

## Tasks (15 Molecules - Visual Review)

### Phase 1: Setup & Initial Audit (3 molecules)

1. **DES-001: Connect to Production App** (15 min)
   - Use Chrome DevTools MCP: `new_page` with URL `https://hotdash-staging.fly.dev`
   - Take initial screenshot: `take_screenshot`
   - Take page snapshot: `take_snapshot`
   - Evidence: Screenshots, page structure snapshot

2. **DES-002: Design System Compliance Audit** (45 min)
   - Use Chrome DevTools MCP to inspect Polaris component usage
   - Verify: Typography scale, spacing tokens, color palette, icon usage
   - Check: All components use @shopify/polaris (no custom overrides)
   - Evidence: Compliance report with screenshots

3. **DES-003: Dashboard Layout Review** (40 min)
   - Inspect grid system, tile spacing, responsive breakpoints
   - Use `resize_page` to test 375px, 768px, 1024px, 1440px
   - Evidence: Screenshots at each breakpoint

### Phase 2: Component Deep Dive (6 molecules)

4. **DES-004: Dashboard Tiles Visual Review** (35 min)
   - Review all 8 tiles: visual hierarchy, data visualization, loading states
   - Use `take_screenshot` for each tile
   - Evidence: Annotated tile screenshots

5. **DES-005: Approvals Drawer Review** (40 min)
   - Inspect drawer: layout, typography, button states, evidence section
   - Use `click` to open drawer, `take_screenshot` for states
   - Evidence: Drawer state screenshots (closed, open, loading, submitted)

6. **DES-006: Mobile Responsiveness** (45 min)
   - Test touch targets (min 44x44px), scrolling, drawer behavior
   - Use `resize_page` for mobile sizes
   - Evidence: Mobile screenshots, touch target measurements

7. **DES-007: Color Contrast WCAG AA** (30 min)
   - Use Chrome DevTools accessibility audit
   - Verify all text meets 4.5:1 ratio (normal), 3:1 (large)
   - Evidence: Contrast audit report

8. **DES-008: Loading States Review** (25 min)
   - Inspect skeleton loaders, spinners, progressive loading
   - Use `take_screenshot` during data fetch
   - Evidence: Loading state screenshots

9. **DES-009: Error States Review** (30 min)
   - Inspect error messages, empty states, validation feedback
   - Use `evaluate_script` to trigger error scenarios
   - Evidence: Error state screenshots

### Phase 3: Interaction & Polish (4 molecules)

10. **DES-010: Microcopy Polish** (30 min)
    - Review button labels, help text, tooltips, error messages
    - Check alignment with `docs/design/approvals_microcopy.md`
    - Evidence: Microcopy audit document

11. **DES-011: Animation & Transitions** (25 min)
    - Review drawer slide-in, modal fades, loading animations
    - Verify timing (200-300ms standard, 500ms max)
    - Evidence: Animation timing report

12. **DES-012: Focus States & Keyboard Nav** (30 min)
    - Test tab order, Enter/Escape handlers, focus indicators
    - Use Chrome DevTools to inspect focus rings
    - Evidence: Keyboard nav audit

13. **DES-013: Icon Consistency** (20 min)
    - Verify all icons from Polaris icon set
    - Check sizing (16px, 20px standard)
    - Evidence: Icon audit document

### Phase 4: Documentation & Sign-off (2 molecules)

14. **DES-014: Screenshot Gallery** (30 min)
    - Create comprehensive screenshot gallery for stakeholders
    - Capture: Dashboard, all tiles, drawers, mobile views, error states
    - Evidence: `artifacts/designer/production-screenshots/`

15. **DES-015: WORK COMPLETE** (15 min)
    - Final feedback entry
    - Design sign-off document
    - Evidence: Complete feedback file

## Constraints

- **Allowed Tools:** Chrome DevTools MCP (all functions), `bash`, `curl`
- **MCP Tools (Mandatory):**
  - **mcp_Chrome_DevTools_new_page**: Open production app
  - **mcp_Chrome_DevTools_take_screenshot**: Capture UI states
  - **mcp_Chrome_DevTools_take_snapshot**: Page structure analysis
  - **mcp_Chrome_DevTools_resize_page**: Responsive testing
  - **mcp_Chrome_DevTools_click**: Interaction testing
  - **mcp_Chrome_DevTools_evaluate_script**: Error scenario testing
- **Allowed Paths:** `docs/design/**`, `artifacts/designer/**`, `reports/designer/**`, `feedback/designer/2025-10-19.md`
- **Budget:** ≤60 min per molecule

## Definition of Done

- [ ] All 15 molecules executed with Chrome DevTools MCP
- [ ] Complete screenshot gallery created
- [ ] Design system compliance verified
- [ ] WCAG AA color contrast confirmed
- [ ] Mobile responsiveness validated
- [ ] Design sign-off document complete
- [ ] Feedback entry with all evidence

## Contract Test

- **Command:** `curl https://hotdash-staging.fly.dev` (200 OK)
- **Visual Test:** All Polaris components render correctly
- **Evidence:** Screenshot gallery in `artifacts/designer/production-screenshots/`

## Risk & Rollback

- **Risk Level:** LOW (read-only visual review)
- **Rollback Plan:** N/A (no code changes)
- **Monitoring:** Screenshots document current UI state

## Links & References

- Production App: https://hotdash-staging.fly.dev
- Feedback: `feedback/designer/2025-10-19.md`
- Microcopy Spec: `docs/design/approvals_microcopy.md`
- Dashboard Tiles Spec: `docs/design/dashboard-tiles.md`

## Change Log

- 2025-10-19: Version 4.0 – **UNBLOCKED** - Production app accessible, Chrome DevTools MCP ready
- 2025-10-19: Version 3.0 – Blocked awaiting running app
