# Designer Agent Direction
**Updated**: 2025-10-14
**Priority**: GROWTH SPEC EXECUTION - UI
**Focus**: Build Action System UI Components

## Mission

Build **UI components for Action system**. NOT designing mockups - build WORKING components for growth automation.

## Priority 0 - Wait for Action API

**BLOCKER**: Engineer building Action API (4-6 hours)

**While Waiting** (2-3 hours):
- [ ] Study growth spec UI requirements (E1-E3)
- [ ] Design component architecture
- [ ] Create component specifications
- [ ] Prepare design tokens/theme

## Priority 1 - Action Dock UI (Growth Spec E1)

### Task 1: Build Top-10 Action Dock (6-8 hours)
**Goal**: Display prioritized actions for operator review

**Requirements** (Growth Spec E1):
```typescript
// app/components/ActionDock.tsx
interface ActionDockProps {
  actions: Action[];  // Top 10 by score
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onViewDetail: (id: string) => void;
}

// Features:
// - Top 10 actions by confidence score
// - Action type badges (SEO, content, CX, etc)
// - Quick approve/reject buttons
// - Expand for detail view
// - Real-time updates (new actions appear)
```

**Deliverables**:
- [ ] ActionDock component built
- [ ] Action card component
- [ ] Quick action buttons
- [ ] Real-time subscription (if available)
- [ ] Responsive design
- [ ] Verify with React Router 7 MCP (patterns)
- [ ] GitHub commit

## Priority 2 - Action Detail View (Growth Spec E2)

### Task 2: Build Action Detail Modal (6-8 hours)
**Goal**: Show action details with diff preview

**Requirements** (Growth Spec E2):
```typescript
// app/components/ActionDetailModal.tsx
interface ActionDetailProps {
  action: Action;
  onApprove: () => void;
  onReject: () => void;
  onEdit: (changes: Partial<Action>) => void;
}

// Features:
// - Before/after diff view
// - Confidence score visualization
// - Edit capability (operator can modify)
// - Impact preview (expected lift)
// - Execution history (if re-run)
```

**Components Needed**:
- DiffViewer (before/after side-by-side)
- ConfidenceScoreGauge
- EditableActionForm
- ImpactProjection

**Deliverables**:
- [ ] ActionDetailModal component
- [ ] Diff viewer (syntax highlighted if code)
- [ ] Edit form with validation
- [ ] Impact visualization
- [ ] Verify with RR7 MCP
- [ ] GitHub commit

## Priority 3 - Auto-Publish Controls (Growth Spec E3)

### Task 3: Build Auto-Publish UI (4-6 hours)
**Goal**: Configure automation rules

**Requirements** (Growth Spec E3):
```typescript
// app/components/AutoPublishSettings.tsx
interface AutoPublishRule {
  actionType: string;           // "seo_ctr_fix", etc
  minConfidence: number;         // 0.0 - 1.0
  requireApproval: boolean;
  maxBatchSize: number;
  schedule?: string;             // cron expression
}

// Features:
// - Rule builder UI
// - Confidence threshold slider
// - Batch size limiter
// - Schedule picker
// - Test mode toggle
```

**Deliverables**:
- [ ] AutoPublishSettings component
- [ ] Rule builder UI
- [ ] Threshold controls
- [ ] Test mode visualization
- [ ] Verify with RR7 MCP
- [ ] GitHub commit

## Priority 4 - Monitoring Dashboards UI

### Task 4: Build KPI Dashboard Components (4-6 hours)
**Goal**: Visualize growth metrics

**Requirements** (Growth Spec I1-I8):

**Metrics to Visualize**:
- Action throughput (line chart)
- Approval rate (gauge)
- SEO lift (trend chart)
- Content velocity (bar chart)
- Guided selling performance (conversion funnel)
- CWV scores (multi-metric gauge)

**Deliverables**:
- [ ] Metric visualization components
- [ ] Chart library integration (Recharts/Victory)
- [ ] Real-time data updates
- [ ] Responsive dashboard layout
- [ ] GitHub commit

## Build UI Components, Not Design Mockups

**✅ RIGHT**:
- Build ActionDock component (working UI)
- Build DiffViewer component (functional)
- Build dashboard charts (live data)

**❌ WRONG**:
- Create Figma mockups (not executable)
- Design static prototypes (not integrated)
- Write design specs without code (not shippable)

## Design System Compliance

- Use existing Polaris components where possible
- Follow Hot Rod AN brand voice (see 01-hot-rod-an-voice.mdc)
- Ensure accessibility (WCAG AA)
- Responsive design (mobile-first)
- Verify patterns with RR7 MCP (not v6/Remix)

## Evidence Required

- Git commits for all components
- Component screenshots (working UI)
- Storybook stories (if available)
- RR7 MCP validation
- Accessibility audit results

## Success Criteria

**Week 1 Complete When**:
- [ ] Action Dock operational (E1)
- [ ] Action Detail view working (E2)
- [ ] Auto-publish controls functional (E3)
- [ ] KPI dashboards visualizing live data
- [ ] All components responsive and accessible
- [ ] RR7 patterns verified with MCP

## Report Every 2 Hours

Update `feedback/designer.md`:
- Components built
- Integration progress
- UI/UX decisions
- Evidence (commits, screenshots)

---

**Remember**: Build WORKING UI COMPONENTS, not design deliverables. Ship code, not mockups.

## 🚨 UPDATE: ENGINEER COMPLETE - YOU ARE UNBLOCKED

**Engineer Status**: ✅ Action API COMPLETE

**Your Action**: Start building approval queue UI NOW

**Build**:
- Approval queue main view
- Approval detail modal
- Approval actions & state management
- Learning metrics dashboard

**ENGLISH ONLY** - All UI text, labels, messages in English

---
