---
epoch: 2025.10.E1
doc: docs/directions/designer.md
owner: manager
last_reviewed: 2025-10-14
expires: 2025-10-21
---
# Designer — Direction

## Canon
- North Star: docs/NORTH_STAR.md (MCP-First Development)
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- MCP Allowlist: docs/policies/mcp-allowlist.json
- Credential Map: docs/ops/credential_index.md

> **Training Data WARNING**: We are in 2025. Shopify APIs in training from 2023 (2 YEARS OLD). React Router 7 training has v6/Remix (2+ years old). ALWAYS verify with appropriate MCP tools.
- Agent Launch Checklist: docs/runbooks/agent_launch_checklist.md
- Agent Workflow Rules: .cursor/rules/04-agent-workflow.mdc (alwaysApply: true)
- Operator Workflows: docs/specs/operator-workflows.md
- Design System: Shopify Polaris + HotDash brand

> **English Only**: All UI labels, content, and documentation in English only (CEO directive)

## Current Sprint Focus — Growth System UX (2025-10-14)

**Status**: Priority 1 & 2 components complete ✅  
**Next**: Design remaining growth UI components

**Priority 0: Core Growth UX** (This Week - 12-15 hours)

1. **Action Detail Modal Enhanced** (3-4 hours)
   - Diff visualization (before/after, syntax highlighted)
   - Confidence indicator (0-100% color coded)
   - Impact metrics (CTR lift, traffic, revenue)
   - AI rationale in plain language
   - Action buttons (Approve/Reject/Edit/Schedule)
   - Real-time execution status
   - Deliverable: Figma mockup + component spec

2. **Batch Action Interface** (2-3 hours)
   - Multi-select with checkboxes
   - Sticky bulk actions bar at bottom
   - Actions: Approve All, Reject All, Schedule All
   - Confirmation modal
   - Progress indicator (X/Y processed)
   - Deliverable: Figma mockup + interaction spec

3. **Recommender Performance Dashboard** (3 hours)
   - Overview cards (actions, approval rate, ROI, time saved)
   - Recommender breakdown table
   - Trend charts (approval over time, ROI by week)
   - Filters (date range, type, status)
   - Export button
   - Deliverable: Figma mockup (desktop/tablet/mobile)

4. **Auto-Approval Configuration UI** (2-3 hours)
   - Threshold sliders by recommender
   - Live preview ("X actions would auto-approve")
   - Safety guardrails (max/day, high-value approval)
   - Audit log table
   - Deliverable: Figma mockup + flow diagram

**Priority 1: Advanced Features** (Week 2 - 10-12 hours)

5. **A/B Test Management UI** (3 hours)
6. **Scheduled Actions Calendar** (2 hours)
7. **ROI Impact Visualizer** (2-3 hours)
8. **Mobile Approval Experience** (2 hours)
9. **Action Templates Library** (1-2 hours)
10. **Experiment Results Dashboard** (1 hour)

**Priority 2: Polish & Optimization** (Week 3 - 8-10 hours)

11. **Onboarding Flow** (3 hours)
12. **Accessibility Audit & Fixes** (2 hours - WCAG 2.1 AA)
13. **Dark Mode Design** (2 hours)
14. **Loading & Empty States** (1 hour)
15. **Micro-interactions & Animations** (1-2 hours)
16. **Design System Documentation** (1 hour)
17. **User Testing Insights** (1-2 hours)

## Design Principles

1. **Trust Through Transparency** - Show AI confidence, explain why, easy reject/rollback
2. **Progressive Disclosure** - Summary first, drill-down available
3. **Speed & Efficiency** - Bulk actions, keyboard shortcuts, minimal clicks
4. **Data Visualization** - Charts for trends, color coding, large numbers for KPIs
5. **Mobile-First** - Responsive, 44px touch targets, swipe gestures

## Design Deliverables Format

Every task requires:
1. Figma mockup (high-fidelity)
2. Component spec document
3. Interaction flow diagram
4. Accessibility annotations
5. Dev-ready assets & measurements

**Figma Organization**:
```
📁 HotDash Growth System
  📁 01 - Core Components
  📁 02 - Dashboards  
  📁 03 - Advanced Features
  📁 04 - Mobile
```

## Evidence & Compliance

Every task requires:
1. Figma file link
2. Screenshot/preview
3. Component spec doc (PDF/Notion)
4. Accessibility checklist
5. Evidence in `feedback/designer.md`

Report every 2 hours:
```
## YYYY-MM-DDTHH:MM:SSZ — Designer: [Task] [Status]
**Working On**: [P0 task]
**Progress**: [% or milestone]
**Evidence**: 
- Figma: [link]
- Preview: [screenshot]
- Spec: [doc link]
- Accessibility: WCAG 2.1 AA
**Blockers**: [None or details]
**Next**: [Next task]
```

## Success Criteria

**P0 Complete** (This Week):
- ✅ Action Detail Modal enhanced
- ✅ Batch action interface
- ✅ Performance dashboard
- ✅ Auto-approval config UI
- ✅ All WCAG 2.1 AA compliant
- ✅ Responsive specs (mobile/tablet/desktop)

**P1 Complete** (Week 2):
- ✅ A/B test manager
- ✅ Calendar view
- ✅ ROI visualizer
- ✅ Mobile experience optimized

**P2 Complete** (Week 3):
- ✅ Onboarding flow
- ✅ Dark mode
- ✅ All states (loading/error/empty)
- ✅ Design system docs

## Coordination

**With Engineer**: Provide specs before implementation, review accuracy  
**With Product**: Align on flows, validate operator needs  
**With QA**: Define expected UI behavior  
**With Enablement**: Create training visuals

## Blockers & Escalation

**Current**: NONE (Engineer completed Action API, Designer unblocked)

If stuck >2 hours:
```
🚨 BLOCKER: [Task] blocked on [reason]
**Attempted**: [what tried]
**Needed**: [missing requirement]
**Impact**: [designs blocked]
```

## Timeline

- Week 1: 12-15 hours (Core UX)
- Week 2: 10-12 hours (Advanced)
- Week 3: 8-10 hours (Polish)
- **Total**: 30-37 hours over 3 weeks

---

**Last Updated**: 2025-10-14T21:15:00Z  
**Start**: Action Detail Modal immediately  
**Evidence**: All work in `feedback/designer.md`
