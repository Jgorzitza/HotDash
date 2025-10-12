---
epoch: 2025.10.E1
doc: docs/directions/designer.md
owner: manager
last_reviewed: 2025-10-12
doc_hash: TBD
expires: 2025-10-19
---
# Designer — Direction (Operator Control Center)
## Canon
- North Star: docs/NORTH_STAR.md
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- MCP Allowlist: docs/policies/mcp-allowlist.json
- Credential Map: docs/ops/credential_index.md
- Agent Launch Checklist (manager executed): docs/runbooks/agent_launch_checklist.md

> Manager authored. Request updates through manager with evidence; do not create independent direction docs.

## Local Execution Policy (Auto-Run)

You may run local, non-interactive commands (exports, scripts) without approval. Guardrails:

- Scope: local repo assets only; do not modify remote systems under auto-run.
- Non-interactive: avoid pagers and interactive editors; export assets to artifacts/collateral/.
- Evidence: log timestamp, command, outputs in feedback/designer.md.
- Secrets: never print values; reference names only.
- Retry: up to 2 attempts; then escalate with evidence.

- Deliver Polaris-aligned wireframes for dashboard + tile detail states by EOW; annotate approvals and toast flows.
- Define responsive breakpoints (min 1280px desktop, 768px tablet) and hand off tokens via Figma variables.
- Partner with engineer to map accessibility acceptance criteria (WCAG 2.2 AA) and focus order.
- Provide copy decks for tile summaries/action CTAs; keep copy English-only and coordinate updates with marketing.
- Attach evidence links (Figma share, accessibility audit) to feedback/manager.md daily.
- Review mock/live data states to ensure visual hierarchy holds when tiles error or show empty state.
- Stack guardrails: align visuals with `docs/directions/README.md#canonical-toolkit--secrets` (React Router 7 shell, Supabase-backed data, Chatwoot on Supabase); remove references to deprecated stacks like Remix or Fly Postgres.
- Start executing assigned tasks immediately; log progress and blockers in `feedback/designer.md` without waiting for additional manager confirmation.

## Current Sprint Focus — 2025-10-12
Own each deliverable through sign-off; post the artifacts (Figma links, screenshots, checklists) in `feedback/designer.md` as you finish them. If another team is needed, schedule the working session and follow it to completion rather than passing the task back.

## Aligned Task List — 2025-10-11 (Updated: Accelerated Delivery)

**Reference Docs**:
- docs/AgentSDKopenAI.md - Section 12 for approval queue UI patterns
- feedback/designer.md - Your completed approval queue designs

**LAUNCH CRITICAL TASKS** (Do These FIRST):

## 🚨 P0 UI IMPLEMENTATION

1. ✅ **Approval Queue UI Specs** - COMPLETE
   - ApprovalCard component specs ready
   - Handoff to Engineer complete
   - Evidence: Specs in feedback/designer.md

**Next - While Engineer Builds**:

1A. **Prepare UI Assets for Approval Queue**
   - Create icons for approve/reject actions
   - Design loading states
   - Create empty state illustration
   - Prepare error state visuals
   - Evidence: Asset files in artifacts/design/
   - Timeline: 2-3 hours

1B. **Design Agent Response Formatting**
   - Create text formatting guidelines for AI responses
   - Design code block styling for responses
   - Create link and button styles
   - Design attachment preview patterns
   - Evidence: Response formatting spec
   - Timeline: 2-3 hours

1C. **Design Real-Time Update Indicators**
   - Create new approval notification badge
   - Design update animation
   - Create timestamp refresh indicator
   - Design connection status indicator
   - Evidence: Animation specs and assets
   - Timeline: 2-3 hours

1D. **Accessibility Review for Approval Flow**
   - Document keyboard navigation flow
   - Create screen reader announcements
   - Design focus states for all interactive elements
   - Create ARIA labels spec
   - Evidence: Accessibility specification
   - Timeline: 2-3 hours

2. **Agent SDK UI Polish** (After basic approval queue works)
   - Refine approval card styling
   - Add loading/error states
   - Ensure accessibility (keyboard nav, screen readers)
   - Mobile responsive check
   - Evidence: Polished UI, accessibility audit

---

## ✅ TASK 1 COMPLETE (2025-10-12T00:50Z)

**Your Report**: Minimal spec ready for Engineer Task 6

**Manager Acknowledgment**: Excellent - Engineer can proceed with UI build

**Your Next Work**: Continue with Tasks 1A-1D (UI assets while Engineer builds)

Execute Tasks 1A-1D. Report evidence in feedback/designer.md.

---

## 📋 ADDITIONAL LAUNCH-ALIGNED TASKS (In-Depth)

**Task 1E**: Hot Rodan Brand Integration
- Ensure dashboard matches Hot Rodan visual identity
- Use hot rod/automotive imagery where appropriate
- Color scheme aligned with www.hotrodan.com
- Evidence: Brand alignment doc
- Timeline: 2-3 hours

**Task 1F**: Mobile Operator Experience
- Design mobile-responsive approval queue
- Touch-optimized approve/reject buttons
- Mobile tile views
- Evidence: Mobile designs
- Timeline: 2-3 hours

**Task 1G**: Error State Design Deep Dive
- Design all possible error states (API down, timeout, invalid data)
- Create helpful error messages for operators
- Design recovery actions
- Evidence: Error state catalog
- Timeline: 2-3 hours

**Task 1H**: Loading State Micro-interactions
- Design skeleton loaders for each tile
- Loading animations
- Progressive disclosure patterns
- Evidence: Animation specs
- Timeline: 2-3 hours

**Task 1I**: Dashboard Onboarding Flow
- First-time user walkthrough design
- Tooltip placement and copy
- Dismiss and "don't show again" logic
- Evidence: Onboarding flow mockups
- Timeline: 2-3 hours

Execute 1A-1I (all Hot Rodan Dashboard launch-aligned). Total: ~20-25 hours work.

---

## 📋 NEXT WAVE - DEEP LAUNCH PREP (Tasks 1J-1S)

**Task 1J**: Tile-Specific UI Refinement
- Design detailed states for each of 5 tiles (CX, Sales, Inventory, SEO, Fulfillment)
- Create data visualization components (charts, graphs, sparklines)
- Hot rod-themed iconography for automotive context
- Evidence: 5 tile design specifications
- Timeline: 3-4 hours

**Task 1K**: Operator Dashboard Personalization
- Design customizable dashboard layout
- Tile reordering and hiding
- User preference persistence
- Operator-specific views
- Evidence: Personalization design spec
- Timeline: 2-3 hours

**Task 1L**: Notification and Alert Design
- Design notification center for approval queue
- Alert badges and counters
- Sound/vibration preferences
- Priority visual hierarchy
- Evidence: Notification system design
- Timeline: 2-3 hours

**Task 1M**: Data Visualization Library
- Design chart components for Hot Rodan metrics
- Sales trends, inventory levels, SEO performance
- Interactive tooltips and drill-downs
- Print-friendly reports
- Evidence: Data viz component library
- Timeline: 3-4 hours

**Task 1N**: Dark Mode Design
- Create dark mode color palette
- Ensure contrast ratios meet WCAG AA
- Toggle UI and preference storage
- Evidence: Dark mode design system
- Timeline: 2-3 hours

**Task 1O**: Empty States and First-Use
- Design empty states for each tile (no data yet)
- First-use guidance and setup wizards
- Motivational copy for new users
- Evidence: Empty state designs
- Timeline: 2-3 hours

**Task 1P**: Approval History and Audit Trail UI
- Design approval history view
- Filter and search approvals
- Export capabilities
- Timeline visualization
- Evidence: Audit trail UI design
- Timeline: 2-3 hours

**Task 1Q**: Hot Rodan-Specific Illustrations
- Create custom illustrations for automotive context
- Hot rod-themed empty states
- Industry-specific success celebrations
- Evidence: Illustration set
- Timeline: 3-4 hours

**Task 1R**: Responsive Table Design
- Design data tables for various screen sizes
- Sortable columns, filters
- Bulk actions UI
- Mobile table patterns
- Evidence: Table component designs
- Timeline: 2-3 hours

**Task 1S**: Component Documentation
- Document all components for Engineer
- Usage examples and code snippets
- Props and variants
- Accessibility guidelines
- Evidence: Component documentation
- Timeline: 2-3 hours

Execute 1J-1S. Total: ~45-50 hours additional launch-aligned work.

**DO FIRST**: Tasks 1-2 above (approval queue)

**PAUSE UNTIL AFTER LAUNCH**: Tasks 3-87 (all expanded design work)

---

**Tasks in Priority Order** (PAUSED - execute after launch gates):

1. ✅ **UI Consistency Audit** - COMPLETE (2025-10-11)
   - Polaris alignment verified
   - Component duplication identified
   - Accessibility audit complete
   - Evidence: feedback/designer.md

2. ✅ **Approval Queue UI Design** - COMPLETE (2025-10-11, 2h)
   - Approval card component designed
   - All states documented (pending, approved, rejected, loading, error)
   - Real-time update patterns specified
   - Evidence: Complete mockups in feedback/designer.md

3. **Detailed ApprovalCard Component Specs** - Provide implementation-ready specifications
   - Create detailed component spec with all props and variants
   - Document Polaris components to use (Card, Button, Badge, Text, etc.)
   - Specify loading skeleton and optimistic updates
   - Define error state UI and retry patterns
   - Provide color/spacing tokens from Polaris
   - Coordinate: Tag @engineer when specs ready for implementation
   - Evidence: Component spec document, Polaris mapping, logged in feedback/designer.md

4. **Implementation Review** - Review Engineer's component implementation
   - Review ApprovalCard component as @engineer builds
   - Check Polaris alignment and accessibility
   - Verify all states render correctly
   - Provide feedback and polish recommendations
   - Evidence: Review notes in feedback/designer.md

5. **Loading & Error States** - Design all edge case UI
   - Design loading states for approve/reject actions
   - Design error recovery UI
   - Design empty state ("No approvals pending")
   - Design timeout/expired approval states
   - Provide specs to @engineer
   - Evidence: State designs documented

6. **Visual Polish** - Final UI refinement
   - Review deployed approval queue in staging
   - Identify visual polish opportunities
   - Provide spacing/color adjustments
   - Verify responsive behavior
   - Evidence: Polish recommendations with screenshots

**Ongoing Requirements**:
- Coordinate with @engineer via feedback files
- Ensure all designs use Polaris components only
- Log all design reviews in feedback/designer.md with timestamps

---

### 🚀 EXECUTE TASK 3 NOW (Engineer Waiting for Specs)

**Task 3: Detailed ApprovalCard Component Specs** - URGENT for Engineer

Create complete implementation spec with:
- All props and TypeScript interfaces
- Every state variant (pending, approved, rejected, loading, error, expired)
- Polaris components to use (Card, Button, Badge, Stack, Text, InlineStack)
- Color tokens, spacing, typography
- Loading skeletons
- Animation patterns
- Responsive behavior
- Accessibility requirements (ARIA labels, keyboard nav)

**Format**: Markdown document with code examples, ready for Engineer to implement

**Timeline**: 1-2 hours

**Coordinate**: Tag @engineer immediately when complete

**Evidence**: Component spec document in docs/design/approval-card-spec.md

---

### 🚀 ADDITIONAL PARALLEL TASKS

**Task A: Design System Documentation** - Create component library guide
- Document all Polaris components used in HotDash
- Create usage guidelines
- Document color/spacing/typography tokens
- Provide do's and don'ts
- Evidence: Design system guide

**Task B: Accessibility Audit Report** - Comprehensive WCAG review
- Audit current dashboard for WCAG 2.2 AA
- Document accessibility issues
- Create remediation checklist
- Prioritize fixes
- Evidence: Accessibility audit report

Execute Task 3 IMMEDIATELY (Engineer needs it), then A and B.

---

### 🚀 EXPANDED TASK LIST (2x Capacity for Fast Agent)

**Task 7: Agent Performance Metrics UI Design**
- Design dashboard tiles for agent performance metrics
- Create visualizations for approval queue depth
- Design charts for response accuracy trends
- Specify real-time update UI patterns
- Evidence: Metrics UI design specifications

**Task 8: Agent Training Data Visualization**
- Design UI for viewing training data quality
- Create visualizations for feedback scores
- Design operator feedback submission UI
- Specify data filtering and sorting
- Evidence: Training data UI designs

**Task 9: Notification System Design**
- Design notification UI for new approvals
- Create toast/banner patterns for updates
- Design notification center (optional)
- Specify notification priorities and styling
- Evidence: Notification system design

**Task 10: Mobile Responsive Optimization**
- Audit all designs for mobile responsiveness
- Create mobile-specific approval queue design
- Optimize for tablet viewports
- Document responsive breakpoints
- Evidence: Mobile design specifications

**Task 11: Dark Mode Design**
- Create dark mode color palette
- Design all components for dark mode
- Document dark mode switching logic
- Ensure WCAG compliance in dark mode
- Evidence: Dark mode design system

**Task 12: Empty State Design Library**
- Design empty states for all features
- Create error state variations
- Design loading states for all async operations
- Document state transition animations
- Evidence: Complete state design library

Execute 7-12 in any order - all enhance design system maturity.

---

### 🚀 MASSIVE EXPANSION (5x Capacity) - 15 Additional Tasks

**Task 13-17: Advanced UI Components** (5 tasks)
- 13: Design comprehensive data table component (sorting, filtering, pagination)
- 14: Create advanced form components (multi-step, validation, auto-save)
- 15: Design chart and visualization library (metrics, trends, comparisons)
- 16: Create modal and dialog system (confirmation, forms, alerts)
- 17: Design toast notification system with priority levels

**Task 18-22: Design System Governance** (5 tasks)
- 18: Create design token management system
- 19: Design component versioning and deprecation process
- 20: Create design review and approval workflow
- 21: Implement design QA checklist
- 22: Design design system documentation site

**Task 23-27: User Experience** (5 tasks)
- 23: Conduct heuristic evaluation of entire dashboard
- 24: Create user flow diagrams for all major workflows
- 25: Design onboarding experience for new operators
- 26: Create contextual help and tooltips system
- 27: Design feedback collection UI for operators

Execute 13-27 in any order. Total: 27 tasks, ~15-18 hours of design work.

---

### 🚀 SECOND MASSIVE EXPANSION (Another 20 Tasks)

**Task 28-35: Advanced Design Systems** (8 tasks)
- 28: Create animation and micro-interaction library
- 29: Design iconography system with custom icon set
- 30: Create illustration style guide and asset library
- 31: Design data visualization style guide (charts, graphs, metrics)
- 32: Create spacing and layout system documentation
- 33: Design typography scale and pairing guide
- 34: Create color palette generator for themes
- 35: Design accessibility annotation system for all components

**Task 36-43: Product Design** (8 tasks)
- 36: Design advanced dashboard customization (drag-drop widgets)
- 37: Create operator workspace personalization features
- 38: Design multi-view layouts (list, grid, kanban)
- 39: Create advanced filtering and search UI
- 40: Design bulk operations UI patterns
- 41: Create keyboard shortcut overlay and documentation
- 42: Design command palette (Cmd+K style)
- 43: Create quick actions menu system

**Task 44-47: Research & Innovation** (4 tasks)
- 44: Conduct competitive UX analysis (top 5 dashboards)
- 45: Design future-state concepts (AI-first interfaces)
- 46: Create operator journey maps for all workflows
- 47: Design gamification and engagement features

Execute 28-47 in any order. Total: 47 tasks now, ~25-30 hours work.

---

### 🚀 FOURTH MASSIVE EXPANSION (Another 20 Tasks)

**Task 48-53: Design Operations** (6 tasks)
- 48: Create design version control and asset management system
- 49: Design handoff process automation (Figma → Code)
- 50: Implement design QA and review workflow
- 51: Create design metrics and KPI dashboard
- 52: Design collaboration tools for design team
- 53: Implement design system governance model

**Task 54-59: Advanced UX** (6 tasks)
- 54: Conduct usability testing program design
- 55: Create user research framework and repository
- 56: Design A/B testing infrastructure for UX
- 57: Implement heatmap and user behavior analytics
- 58: Create persona development and management system
- 59: Design customer journey analytics integration

**Task 60-67: Innovation & Future** (8 tasks)
- 60: Design voice interface for operator commands
- 61: Create AR/VR visualization concepts for data
- 62: Design AI-powered design assistance tools
- 63: Create generative design system exploration
- 64: Design adaptive interfaces (personalized per operator)
- 65: Create predictive UX (anticipate operator needs)
- 66: Design emotional intelligence in UI
- 67: Create next-generation dashboard concepts

Execute 48-67 in any order. Total: 67 tasks, ~35-40 hours work.

---

### 🚀 FIFTH MASSIVE EXPANSION (Another 20 Tasks)

**Task 68-73: Mobile & Responsive** (6 tasks)
- 68: Design responsive breakpoints and layout system
- 69: Create mobile-first component adaptations
- 70: Design touch interaction patterns
- 71: Create mobile navigation patterns
- 72: Design progressive disclosure for mobile
- 73: Implement mobile performance optimization guidelines

**Task 74-79: Accessibility Excellence** (6 tasks)
- 74: Create comprehensive WCAG 2.1 AA compliance audit
- 75: Design screen reader optimization patterns
- 76: Create keyboard navigation flow documentation
- 77: Design focus management system
- 78: Create accessible animation guidelines
- 79: Implement accessibility testing framework

**Task 80-87: Design System Governance** (8 tasks)
- 80: Create design token governance model
- 81: Design component deprecation strategy
- 82: Create design system roadmap and versioning
- 83: Design contribution guidelines for designers
- 84: Create design review and approval process
- 85: Implement design system metrics dashboard
- 86: Design designer-developer handoff automation
- 87: Create design system documentation site

Execute 68-87 in any order. Total: 87 tasks, ~45 hours work.
