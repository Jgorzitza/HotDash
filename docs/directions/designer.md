# Designer - Design System Sign-Off + Engineer Pairing

> Verify implementations. Sign off on UI. Pair with Engineer. Ship polished.

**Issue**: #118 | **Repository**: Jgorzitza/HotDash | **Allowed Paths**: docs/design/\*\*

## Constraints

- All UI must match design system (docs/design/design-system-guide.md)
- Polaris components used correctly
- Accessibility: WCAG 2.1 AA compliance verified
- No new design work - verification and pairing only
- All design docs already complete (Manager confirmed 46 tasks done)

## Definition of Done

- [ ] All 8 dashboard tiles reviewed and signed off
- [ ] Approvals drawer reviewed and signed off
- [ ] Idea pool drawer reviewed and signed off
- [ ] Design system compliance verified
- [ ] Engineer pairing sessions completed
- [ ] Evidence: Sign-off document with screenshots

## Production Molecules

### DES-001: Design System Compliance Audit (45 min)

**Review**: All components against docs/design/design-system-guide.md
**Check**: Colors, typography, spacing, borders, shadows
**Document**: Any deviations
**Evidence**: Compliance report

### DES-002: Dashboard Tiles Visual Review (40 min)

**Review**: All 8 tiles (Revenue, AOV, Conversion, Inventory, CX, SEO, Approvals, Ideas)
**Check**: Layout, spacing, loading states, error states, empty states
**Screenshot**: Each state
**Evidence**: Screenshots + feedback

### DES-003: Approvals Drawer Visual Review (35 min)

**Review**: app/components/approvals/ApprovalsDrawer.tsx implementation
**Check**: Microcopy matches docs/design/approvals_microcopy.md
**Verify**: Grading scales, evidence section, button states
**Evidence**: Screenshots + sign-off

### DES-004: Idea Pool Drawer Visual Review (30 min)

**Review**: Idea pool drawer implementation
**Check**: 5 ideas display, wildcard highlighting, approval actions
**Evidence**: Screenshots + feedback

### DES-005: Responsive Layout Verification (35 min)

**Test**: Desktop (1920x1080), Tablet (768x1024), Mobile (375x667)
**Check**: Grid adapts correctly, no overflow, readable text
**Evidence**: Multi-viewport screenshots

### DES-006: Accessibility Review (40 min)

**Tool**: Axe DevTools
**Check**: Color contrast, focus indicators, ARIA labels, keyboard nav
**Requirement**: 0 critical violations
**Evidence**: Accessibility report

### DES-007: Loading States Review (25 min)

**Check**: Skeleton loaders, spinners, progressive loading
**Verify**: No content jumps (CLS), smooth transitions
**Evidence**: Loading state screenshots

### DES-008: Error States Review (25 min)

**Check**: Error messages helpful, retry buttons present, icons appropriate
**Verify**: Tone friendly, no technical jargon
**Evidence**: Error state screenshots

### DES-009: Empty States Review (25 min)

**Check**: Empty state messaging helpful, CTAs clear, illustrations (if any)
**Verify**: User knows what to do next
**Evidence**: Empty state screenshots

### DES-010: Engineer Pairing - Tile Refinements (40 min)

**Pair with**: Engineer agent
**Review**: Any visual issues in tiles
**Fix**: Spacing, alignment, font sizes together
**Evidence**: Pairing notes, fixes applied

### DES-011: Engineer Pairing - Drawer Refinements (35 min)

**Pair with**: Engineer agent
**Review**: Drawer animations, focus management, close behavior
**Fix**: Any UX issues together
**Evidence**: Pairing notes, improvements

### DES-012: Polaris Component Usage Verification (30 min)

**Check**: All Polaris components used correctly per docs
**Verify**: Props match Polaris API, no custom reimplementations
**Evidence**: Component usage report

### DES-013: Final Design Sign-Off (30 min)

**File**: docs/design/final-design-signoff.md (update)
**Document**: All reviewed components with sign-off status
**Include**: Screenshots of final implementations
**Evidence**: Sign-off document complete

### DES-014: Design Debt Documentation (Optional) (25 min)

**Document**: Any compromises made, future improvements
**File**: docs/design/design-debt.md
**Prioritize**: For post-launch iterations
**Evidence**: Debt documented

### DES-015: WORK COMPLETE Block (10 min)

**Update**: feedback/designer/2025-10-19.md
**Include**: All components reviewed, signed off, Engineer pairing done
**Evidence**: Feedback entry

## Foreground Proof

1. Design system compliance report
2. All 8 tile screenshots
3. Approvals drawer screenshots
4. Idea pool drawer screenshots
5. Responsive layout screenshots
6. Accessibility audit report
7. Loading states screenshots
8. Error states screenshots
9. Empty states screenshots
10. Engineer pairing notes (tiles)
11. Engineer pairing notes (drawers)
12. Polaris component usage report
13. final-design-signoff.md updated
14. Design debt documented (optional)
15. WORK COMPLETE feedback

**TOTAL ESTIMATE**: ~7 hours
**SUCCESS**: All UI signed off, design system compliance verified, polished product
