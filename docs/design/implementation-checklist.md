# Complete Vision Implementation Checklist

**File:** `docs/design/implementation-checklist.md`  
**Owner:** Designer Agent  
**Version:** 1.0  
**Date:** 2025-10-20  
**For:** All Agents (Engineer, Designer, Data, QA)

---

## Purpose

Comprehensive implementation checklist for the complete HotDash vision (Option A) based on all 57 design specifications. This ensures every designed feature is built exactly as specified.

---

## 🎯 SUCCESS CRITERIA

**When is Option A complete?**

- ✅ ALL 38 Engineer tasks complete
- ✅ ALL 15 Designer validation tasks pass
- ✅ ALL 5 Data migrations applied
- ✅ QA approves implementation against design specs
- ✅ WCAG 2.2 AA accessibility verified
- ✅ 8 tiles working (not 6)
- ✅ Approval queue functional
- ✅ Enhanced modals with grading sliders
- ✅ Notification system working
- ✅ Personalization functional (drag & drop)
- ✅ Settings page complete
- ✅ No `@remix-run` imports
- ✅ MCP evidence logged for all work

---

## 📋 PHASE 1: P0 IMMEDIATE (Start Now)

### Engineer Tasks (ENG-P0 to ENG-004)

#### ENG-P0: Health Endpoint (15 min) - QA BLOCKER

- [ ] **File**: `app/routes/health.tsx`
- [ ] **Spec**: URGENT_QA_FINDINGS_OCT19.md
- [ ] **Implementation**:
  ```typescript
  export async function loader() {
    const checks = {
      db: await checkDatabase(), // Supabase ping
      shopify: await checkShopify(), // Test API call
    };
    const allHealthy = Object.values(checks).every((c) => c === "ok");
    return Response.json(
      { status: allHealthy ? "ok" : "degraded", checks },
      { status: allHealthy ? 200 : 503 },
    );
  }
  ```
- [ ] **Test**: `curl http://localhost:3000/health`
- [ ] **Deploy**: `fly deploy`
- [ ] **Notify**: QA for retest

#### ENG-001: Approval Queue Route (2h)

- [ ] **File**: `app/routes/approvals/route.tsx`
- [ ] **Spec**: `HANDOFF-approval-queue-ui.md`
- [ ] **Features**:
  - [ ] GET /approvals endpoint integration
  - [ ] ApprovalCard component with risk badges
  - [ ] Auto-refresh every 5 seconds
  - [ ] Approve/Reject actions with instant feedback
  - [ ] Navigation badge showing pending count
- [ ] **Components**:
  - [ ] `<ApprovalCard>` with HIGH/MEDIUM/LOW risk badges
  - [ ] `<ApprovalQueue>` main container
  - [ ] `<ApprovalActions>` approve/reject buttons
- [ ] **Designer Validation**: DES-002

#### ENG-002: Approval History Route (1h)

- [ ] **File**: `app/routes/approvals/history/route.tsx`
- [ ] **Features**:
  - [ ] Historical approvals list
  - [ ] CSV export functionality
  - [ ] Filter by date range
  - [ ] Search by agent/tool
- [ ] **Designer Validation**: DES-003

#### ENG-003: Enhanced CX Modal (2h)

- [ ] **File**: `app/components/modals/CXModal.tsx`
- [ ] **Spec**: `modal-refresh-handoff.md`
- [ ] **Features**:
  - [ ] Conversation preview
  - [ ] AI reply display
  - [ ] Internal notes field
  - [ ] **Grading sliders** (tone/accuracy/policy 1-5)
  - [ ] Multiple actions (Approve/Edit/Escalate/Resolve)
- [ ] **Accessibility**: WCAG 2.2 AA compliance
- [ ] **Designer Validation**: DES-004

#### ENG-004: Enhanced Sales Modal (1.5h)

- [ ] **File**: `app/components/modals/SalesModal.tsx`
- [ ] **Features**:
  - [ ] Variance review (WoW)
  - [ ] Action dropdown
  - [ ] Notes with audit trail
- [ ] **Designer Validation**: DES-005

### Data Tasks (DATA-P0 to DATA-NEW-005)

#### DATA-P0: RLS Verification (30 min) - QA BLOCKER

- [ ] **Script**: `supabase/rls_tests.sql`
- [ ] **Tables to Verify**:
  - [ ] `ads_metrics_daily`
  - [ ] `agent_run`
  - [ ] `agent_qc`
  - [ ] `creds_meta`
- [ ] **Steps**:
  - [ ] Connect to production Supabase database
  - [ ] Run RLS test script
  - [ ] Document pass/fail for each table
  - [ ] If any FAIL: Escalate to Manager immediately (P0 security issue)
  - [ ] If all PASS: Notify QA for sign-off

#### DATA-NEW-001: User Preferences Table (30 min)

- [ ] **Table**: `user_preferences`
- [ ] **Spec**: `dashboard-features-1K-1P.md` Task 1K
- [ ] **Schema**:
  ```sql
  CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    tile_order JSONB DEFAULT '[]',
    tile_visibility JSONB DEFAULT '{}',
    theme TEXT DEFAULT 'light',
    notifications JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
  ```
- [ ] **RLS**: Enable RLS, create policies

#### DATA-NEW-002: Notifications Table (30 min)

- [ ] **Table**: `notifications`
- [ ] **Spec**: `notification-system-design.md`
- [ ] **Schema**:
  ```sql
  CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    type TEXT NOT NULL, -- 'toast', 'banner', 'badge'
    title TEXT NOT NULL,
    message TEXT,
    severity TEXT DEFAULT 'info', -- 'info', 'warning', 'error', 'success'
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
  );
  ```

#### DATA-NEW-003: Approval History Table (30 min)

- [ ] **Table**: `approval_history`
- [ ] **Schema**:
  ```sql
  CREATE TABLE approval_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    approval_id TEXT NOT NULL,
    action TEXT NOT NULL, -- 'approved', 'rejected'
    user_id TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  );
  ```

#### DATA-NEW-004: Settings Table (30 min)

- [ ] **Table**: `user_settings`
- [ ] **Schema**:
  ```sql
  CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    dashboard_config JSONB DEFAULT '{}',
    appearance_config JSONB DEFAULT '{}',
    notification_config JSONB DEFAULT '{}',
    integration_config JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
  ```

#### DATA-NEW-005: Modal Grading Table (30 min)

- [ ] **Table**: `modal_gradings`
- [ ] **Schema**:
  ```sql
  CREATE TABLE modal_gradings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    modal_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    tone_rating INTEGER CHECK (tone_rating >= 1 AND tone_rating <= 5),
    accuracy_rating INTEGER CHECK (accuracy_rating >= 1 AND accuracy_rating <= 5),
    policy_rating INTEGER CHECK (policy_rating >= 1 AND policy_rating <= 5),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  );
  ```

### Designer Tasks (DES-001 to DES-002)

#### DES-001: Design Specs Review (1h) ✅ COMPLETE

- [x] **Review all 57 design specs**
- [x] **Create implementation checklist** (this document)
- [x] **Identify key specifications**:
  - [x] `design-system-guide.md` (38KB, 1800+ lines)
  - [x] `HANDOFF-approval-queue-ui.md`
  - [x] `dashboard-features-1K-1P.md`
  - [x] `notification-system-design.md`
  - [x] `modal-refresh-handoff.md`
  - [x] `accessibility-approval-flow.md`

#### DES-002: Visual QA on Approval Queue (when Engineer completes)

- [ ] **Validate against spec**: `HANDOFF-approval-queue-ui.md`
- [ ] **Check components**:
  - [ ] ApprovalCard with risk badges
  - [ ] Auto-refresh functionality
  - [ ] Approve/Reject actions
  - [ ] Navigation badge
- [ ] **Accessibility**: WCAG 2.2 AA compliance
- [ ] **Pass/Fail**: Provide to Engineer

### QA Tasks (QA-003 to QA-014)

#### QA-003 to QA-014: UI/UX Tests with Chrome DevTools MCP

- [ ] **Use Chrome DevTools MCP** for testing
- [ ] **Test approval queue** (when Engineer completes)
- [ ] **Test health endpoint** (when Engineer completes)
- [ ] **Review RLS results** (when Data completes)
- [ ] **Final GO/NO-GO decision**

---

## 📋 PHASE 2: P1 NEXT (After P0 Complete)

### Engineer Tasks (ENG-005 to ENG-017)

#### ENG-005 to ENG-007: Enhanced Modals

- [ ] **ENG-005**: Inventory Modal (1.5h)
  - [ ] 14-day velocity analysis
  - [ ] Reorder approval
  - [ ] Vendor selection
- [ ] **ENG-006**: Modal Accessibility (1h)
  - [ ] Focus management
  - [ ] Screen reader support
  - [ ] Keyboard navigation
- [ ] **ENG-007**: Modal Testing (1h)
  - [ ] Unit tests
  - [ ] Integration tests
  - [ ] Accessibility tests

#### ENG-008 to ENG-010: Missing Tiles

- [ ] **ENG-008**: Idea Pool Tile (2h)
  - [ ] 5/5 ideas display
  - [ ] Wildcard badge system
  - [ ] Accept/Reject actions
- [ ] **ENG-009**: Approvals Queue Tile (1h)
  - [ ] Pending count display
  - [ ] Quick actions
- [ ] **ENG-010**: Tile Integration (1h)
  - [ ] 8 tiles total (not 6)
  - [ ] Consistent styling
  - [ ] Performance optimization

#### ENG-011 to ENG-013: Notification System

- [ ] **ENG-011**: Toast Messages (1h)
  - [ ] Success/error/info toasts
  - [ ] 5-second auto-dismiss
  - [ ] Polaris toast integration
- [ ] **ENG-012**: Banner Alerts (1h)
  - [ ] Queue backlog >10
  - [ ] Performance <70%
  - [ ] System health alerts
- [ ] **ENG-013**: Desktop Notifications (1h)
  - [ ] Browser notifications
  - [ ] Sound option
  - [ ] Persistent notifications

#### ENG-014 to ENG-017: Personalization

- [ ] **ENG-014**: Drag & Drop Tiles (2h)
  - [ ] @dnd-kit/core integration
  - [ ] Tile reordering
  - [ ] Save preferences to Supabase
- [ ] **ENG-015**: Tile Visibility Toggles (1h)
  - [ ] Show/hide individual tiles
  - [ ] Settings page integration
- [ ] **ENG-016**: User Preferences (1h)
  - [ ] Default view settings
  - [ ] Theme preferences
- [ ] **ENG-017**: Real-time Updates (1h)
  - [ ] SSE integration
  - [ ] Live indicators
  - [ ] Auto-refresh

### Designer Tasks (DES-003 to DES-008)

#### DES-003 to DES-007: Visual QA on P1 Features

- [ ] **DES-003**: Enhanced Modals QA
- [ ] **DES-004**: Missing Tiles QA
- [ ] **DES-005**: Notification System QA
- [ ] **DES-006**: Personalization QA
- [ ] **DES-007**: Integration QA

#### DES-008: Accessibility Audit

- [ ] **Spec**: `accessibility-approval-flow.md`
- [ ] **WCAG 2.2 AA compliance**
- [ ] **Keyboard navigation**
- [ ] **Screen reader support**
- [ ] **Color contrast verification**

---

## 📋 PHASE 3: P2 POLISH (After P1 Complete)

### Engineer Tasks (ENG-018 to ENG-038)

#### ENG-018 to ENG-022: Settings Page

- [ ] **ENG-018**: Settings Route (1h)
- [ ] **ENG-019**: Dashboard Tab (1h)
- [ ] **ENG-020**: Appearance Tab (1h)
- [ ] **ENG-021**: Notifications Tab (1h)
- [ ] **ENG-022**: Integrations Tab (1h)

#### ENG-023 to ENG-026: Real-Time Features

- [ ] **ENG-023**: SSE Setup (1h)
- [ ] **ENG-024**: Live Indicators (1h)
- [ ] **ENG-025**: Auto-refresh (1h)
- [ ] **ENG-026**: Performance Optimization (1h)

#### ENG-027 to ENG-030: Data Visualization

- [ ] **ENG-027**: Sparklines in Tiles (1h)
- [ ] **ENG-028**: Charts in Modals (1h)
- [ ] **ENG-029**: Performance Metrics (1h)
- [ ] **ENG-030**: Analytics Integration (1h)

#### ENG-031 to ENG-034: Approval History

- [ ] **ENG-031**: History Route (1h)
- [ ] **ENG-032**: CSV Export (1h)
- [ ] **ENG-033**: Filtering (1h)
- [ ] **ENG-034**: Search (1h)

#### ENG-035 to ENG-038: Polish & Accessibility

- [ ] **ENG-035**: Dark Mode (1h)
- [ ] **ENG-036**: Mobile Optimization (1h)
- [ ] **ENG-037**: Performance Tuning (1h)
- [ ] **ENG-038**: Final Testing (1h)

### Designer Tasks (DES-009 to DES-015)

#### DES-009 to DES-012: P2 Feature QA

- [ ] **DES-009**: Settings Page QA
- [ ] **DES-010**: Real-Time Features QA
- [ ] **DES-011**: Data Visualization QA
- [ ] **DES-012**: Approval History QA

#### DES-013 to DES-015: Final Validation

- [ ] **DES-013**: Complete System QA
- [ ] **DES-014**: Accessibility Final Audit
- [ ] **DES-015**: Design Sign-off

---

## 📋 PHASE 4: P3 POST-LAUNCH (After P2 Complete)

### Engineer Tasks (ENG-039 to ENG-042)

#### ENG-039 to ENG-042: Onboarding Flow

- [ ] **ENG-039**: Welcome Modal (1h)
- [ ] **ENG-040**: 4-Step Tour (1h)
- [ ] **ENG-041**: Feature Introduction (1h)
- [ ] **ENG-042**: Onboarding Analytics (1h)

---

## 🔧 TECHNICAL REQUIREMENTS

### React Router 7 ONLY

- [ ] **FORBIDDEN**: `@remix-run/*` imports (ANY)
- [ ] **FORBIDDEN**: `json()` helper
- [ ] **REQUIRED**: `import from "react-router"` ONLY
- [ ] **REQUIRED**: `Response.json()` for loaders
- [ ] **Verification**: `rg "@remix-run" app/` MUST return 0 results

### MCP Tools (MANDATORY)

- [ ] **Context7 MCP**: Verify React Router 7 patterns, Polaris components, @dnd-kit usage
- [ ] **Shopify Dev MCP**: Validate GraphQL queries (if any)
- [ ] **Chrome DevTools MCP**: UI testing, validation (Designer, QA, Pilot)
- [ ] **Evidence**: Log MCP conversation IDs in feedback file
- [ ] **Enforcement**: Manager REJECTS PRs without MCP evidence

### Design System Compliance

- [ ] **Polaris Components**: Use `@shopify/polaris` components
- [ ] **Design Tokens**: Use Polaris design tokens
- [ ] **Accessibility**: WCAG 2.2 AA compliance
- [ ] **Responsive**: Desktop (1280px+), tablet (768px), mobile
- [ ] **Consistency**: Match design specifications EXACTLY

---

## 📊 PROGRESS TRACKING

### Phase 1 (P0) - IMMEDIATE

- [ ] Engineer: ENG-P0 to ENG-004 (5 tasks)
- [ ] Data: DATA-P0 to DATA-NEW-005 (6 tasks)
- [ ] Designer: DES-001 to DES-002 (2 tasks)
- [ ] QA: QA-003 to QA-014 (12 tasks)

### Phase 2 (P1) - NEXT

- [ ] Engineer: ENG-005 to ENG-017 (13 tasks)
- [ ] Designer: DES-003 to DES-008 (6 tasks)

### Phase 3 (P2) - POLISH

- [ ] Engineer: ENG-018 to ENG-038 (21 tasks)
- [ ] Designer: DES-009 to DES-015 (7 tasks)

### Phase 4 (P3) - POST-LAUNCH

- [ ] Engineer: ENG-039 to ENG-042 (4 tasks)

**Total**: 76 tasks across all phases

---

## 🎯 COORDINATION

### Engineer ↔ Designer

1. Engineer completes task (e.g. ENG-001: Approval Queue)
2. Engineer tags Designer in feedback
3. Designer runs visual QA (DES-002)
4. Designer provides pass/fail
5. If fail: Engineer fixes, repeat
6. If pass: Engineer proceeds to next task

### Engineer ↔ Data

1. Data creates migrations (user_preferences, notifications, etc.)
2. Engineer uses new tables in features
3. Coordinate on RLS policies
4. Test together

### All Agents ↔ QA

1. Complete your phase
2. QA tests against design specs
3. QA provides pass/fail
4. Fix any failures
5. QA re-tests

---

## 📚 REFERENCE DOCUMENTS

### Primary Design Specs

- `design-system-guide.md` (38KB, 1800+ lines) - Design system
- `HANDOFF-approval-queue-ui.md` - Approval queue (ENG-001 to ENG-004)
- `dashboard-features-1K-1P.md` - Personalization + notifications (ENG-014 to ENG-022)
- `notification-system-design.md` - Toast, banner, browser notifs (ENG-011 to ENG-013)
- `modal-refresh-handoff.md` - Enhanced modals (ENG-005 to ENG-007)
- `accessibility-approval-flow.md` - WCAG 2.2 AA (DES-008)

### Supporting Specs

- `dashboard_wireframes.md` - Complete mockups (DES-004)
- `approval-queue-edge-states.md` - Edge case handling
- `approvalcard-component-spec.md` - Component specifications
- `copy-decks.md` - Microcopy guidelines
- `mobile-responsive-68-73.md` - Mobile optimization
- `dark-mode-design.md` - Dark mode implementation

### All 57 Design Files

Located in `/docs/design/` (760KB total)

---

## 🚨 CRITICAL REMINDERS

### Design Specs Are Your Bible

- **EVERY feature MUST match the design specifications EXACTLY**
- Not "close enough"
- Not "similar to the spec"
- **EXACTLY as specified**

### No More Minimal Implementations

- ❌ Building 6 tiles when spec says 8
- ❌ Basic modals when spec shows enhanced modals
- ❌ "We'll add that later" for designed features
- ✅ Build complete feature from spec
- ✅ Include all designed elements
- ✅ Match wireframes exactly

### Manager Will Reject

**Manager WILL REJECT PRs that**:

- Don't match design specs
- Are missing designed features
- Have no MCP evidence
- Have `@remix-run` imports
- Have no Designer sign-off

**No warnings - immediate rejection**

---

## 🎯 LAUNCH CRITERIA

**Option A is complete when**:

- ✅ ALL 38 Engineer tasks complete
- ✅ ALL 15 Designer validation tasks pass
- ✅ ALL 5 Data migrations applied
- ✅ QA approves implementation against design specs
- ✅ WCAG 2.2 AA accessibility verified
- ✅ 8 tiles working (not 6)
- ✅ Approval queue functional
- ✅ Enhanced modals with grading sliders
- ✅ Notification system working
- ✅ Personalization functional (drag & drop)
- ✅ Settings page complete
- ✅ No `@remix-run` imports
- ✅ MCP evidence logged for all work

**Timeline**: 3-4 days from now

---

## 📞 SUPPORT

**Manager**: Ready to review PRs, validate against design specs, support agents  
**CEO**: Awaiting complete vision implementation  
**Designer**: Available for validation and sign-off

**Let's build what was actually designed** 🚀

---

## Change Log

- 2025-10-20: Version 1.0 – Initial comprehensive implementation checklist
- Based on AGENT_LAUNCH_PROMPT_OCT20.md
- Includes all 57 design specifications
- Covers all 4 phases (P0, P1, P2, P3)
- 76 total tasks across all agents
