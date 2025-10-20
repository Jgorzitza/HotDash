# 🚀 AGENT LAUNCH PROMPT — October 20, 2025

**To**: All 16 Agents (Engineer, Designer, Data, QA, and all others)  
**From**: CEO Justin + Manager  
**Priority**: P0 URGENT  
**Timeline**: 3-4 days (30 hours work)

---

## 🎯 MISSION: Build the COMPLETE Vision

**We are building to the FULL designed specification - not a minimal version.**

**All 57 design files have been recovered and are now in `/docs/design/`**

Your job: Build **EXACTLY** what's in those design specifications.

---

## 📋 WHAT YOU'RE BUILDING (Option A)

**Complete Operator Control Center** with:

### Dashboard
- **8 tiles** (not 6): Ops, Sales, Fulfillment, Inventory, CX, SEO, **Idea Pool**, **Approvals Queue**
- Drag & drop tile reordering (@dnd-kit/core)
- Tile visibility toggles (show/hide individual tiles)
- User preferences (saved to Supabase)
- Real-time updates (SSE, live indicators)

### Approval Queue (P0 - Core HITL)
- `/approvals` route with list of pending actions
- ApprovalCard component with risk badges (HIGH/MEDIUM/LOW)
- Auto-refresh every 5 seconds
- Approve/Reject actions with instant feedback
- Navigation badge showing pending count
- Approval history (`/approvals/history`) with CSV export

### Enhanced Modals (P1)
- **CX Modal**: Conversation preview, AI reply, internal notes, **grading sliders** (tone/accuracy/policy 1-5), multiple actions (Approve/Edit/Escalate/Resolve)
- **Sales Modal**: Variance review (WoW), action dropdown, notes with audit trail
- **Inventory Modal**: 14-day velocity analysis, reorder approval, vendor selection

### Notification System (P1)
- Toast messages (success/error/info, 5-second auto-dismiss)
- Banner alerts (queue backlog >10, performance <70%, system health)
- Desktop notifications (browser, sound option, persistent)
- Notification center (slide-out panel, grouped by date)

### Settings & Personalization (P1-P2)
- Settings page (`/settings`) with 4 tabs:
  - Dashboard (tile visibility, default view)
  - Appearance (Light/Dark/Auto theme)
  - Notifications (desktop, sound, frequency)
  - Integrations (Shopify, Chatwoot, GA status)

### Advanced Features (P2-P3)
- Data visualization (sparklines in tiles, charts in modals)
- Onboarding flow (welcome modal, 4-step tour)
- Dark mode (Hot Rodan red adjusted)
- Mobile optimization (touch-friendly, responsive)
- Complete accessibility (WCAG 2.2 AA)

**Total**: 38 tasks across 11 phases

---

## 📖 YOUR INSTRUCTIONS

### 1. Read Your Direction File

**Your assigned tasks**: `docs/directions/{YOUR_AGENT_NAME}.md`

**Key agents**:
- **Engineer**: 38 tasks (ENG-P0, ENG-001 through ENG-038)
- **Designer**: 15 validation tasks (DES-001 through DES-015)
- **Data**: 5 new table migrations (DATA-NEW-001 through DATA-NEW-005)
- **QA**: Test against design specs (including P0 health endpoint + RLS)
- **All others**: Continue current tasks + support Option A build

### 2. Reference Design Specifications

**ALL design specs are in `/docs/design/` (57 files)**

**MANDATORY - Read these for your tasks**:
- `HANDOFF-approval-queue-ui.md` - Approval queue (Engineer: ENG-001 to ENG-004)
- `dashboard-features-1K-1P.md` - Personalization + notifications (Engineer: ENG-014 to ENG-022)
- `notification-system-design.md` - Toast, banner, browser notifs (Engineer: ENG-011 to ENG-013)
- `modal-refresh-handoff.md` - Enhanced modals (Engineer: ENG-005 to ENG-007)
- `design-system-guide.md` - Design system (38KB, 1800+ lines) (Designer: all tasks)
- `dashboard_wireframes.md` - Complete mockups (Designer: DES-004)
- `accessibility-approval-flow.md` - WCAG 2.2 AA (Designer: DES-008)

**See your direction file for which specs to read for each task**

### 3. Use MCP Tools (MANDATORY)

**Required for ALL work**:
- **Context7 MCP**: Verify React Router 7 patterns, Polaris components, @dnd-kit usage
- **Shopify Dev MCP**: Validate GraphQL queries (if any)
- **Chrome DevTools MCP**: UI testing, validation (Designer, QA, Pilot)

**Evidence**: Log MCP conversation IDs in your feedback file

**Enforcement**: Manager REJECTS PRs without MCP evidence

### 4. Follow React Router 7 ONLY

**FORBIDDEN** ❌:
- `@remix-run/*` imports (ANY)
- `json()` helper

**REQUIRED** ✅:
- `import from "react-router"` ONLY
- `Response.json()` for loaders

**Verification**: `rg "@remix-run" app/` MUST return 0 results

### 5. Write Feedback

**Your feedback file**: `feedback/{YOUR_AGENT_NAME}/2025-10-19.md`

**Include**:
- Task completed (with task ID: ENG-001, DES-003, etc.)
- Design spec referenced
- MCP conversation ID
- Evidence (files created, tests passing, screenshots)
- Blockers (if any)

**Report every 4 hours** for long phases

---

## 🚦 PRIORITY ORDER

### **IMMEDIATE (P0) - Start Now**

**Engineer**:
1. ENG-P0: Health endpoint (/health route) - **QA blocker, 15 min**
2. ENG-001 to ENG-004: Approval Queue (3-4 hours)

**Data**:
1. DATA-P0: RLS verification (supabase/rls_tests.sql) - **QA blocker, 30 min**
2. DATA-NEW-001 to DATA-NEW-005: New tables for Option A (2-3 hours)

**QA**:
1. Execute QA-003 to QA-014 (UI/UX tests with Chrome DevTools MCP)
2. Retest health endpoint after Engineer completes
3. Review RLS results from Data
4. Final GO/NO-GO decision

**Designer**:
1. DES-001: Review all 57 design specs, create implementation checklist
2. DES-002: Visual QA on approval queue (when Engineer completes)

---

### **NEXT (P1) - After P0 Complete**

**Engineer**:
- Phase 2: Enhanced Modals (ENG-005 to ENG-007)
- Phase 3: Missing Tiles (ENG-008 to ENG-010)
- Phase 4: Notifications (ENG-011 to ENG-013)
- Phase 5: Personalization (ENG-014 to ENG-017)

**Designer**:
- DES-003 to DES-007: Visual QA on all P1 features
- DES-008: Accessibility audit

**Data**:
- Apply new migrations to staging
- Verify RLS policies

---

### **POLISH (P2) - After P1 Complete**

**Engineer**:
- Phase 6: Settings Page
- Phase 7: Real-Time Features
- Phase 8: Data Visualization
- Phase 10: Approval History
- Phase 11: Polish & Accessibility

---

### **POST-LAUNCH (P3) - After P2 Complete**

**Engineer**:
- Phase 9: Onboarding Flow

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

**Timeline**: 3-4 days from now

---

## 🚨 CRITICAL REMINDERS

### Design Specs Are Your Bible

**EVERY feature MUST match the design specifications EXACTLY**

- Not "close enough"
- Not "similar to the spec"
- **EXACTLY as specified**

**Check your work**:
1. Read the design spec for your task
2. Build it EXACTLY as specified
3. Have Designer validate against spec
4. If Designer finds discrepancies: FIX IMMEDIATELY

### No More Minimal Implementations

**Unacceptable**:
- ❌ Building 6 tiles when spec says 8
- ❌ Basic modals when spec shows enhanced modals
- ❌ "We'll add that later" for designed features

**Required**:
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

## 📞 COORDINATION

### Engineer ↔ Designer

**Process**:
1. Engineer completes task (e.g. ENG-001: Approval Queue)
2. Engineer tags Designer in feedback
3. Designer runs visual QA (DES-002)
4. Designer provides pass/fail
5. If fail: Engineer fixes, repeat
6. If pass: Engineer proceeds to next task

**Tight loop - stay aligned**

### Engineer ↔ Data

**Process**:
1. Data creates migrations (user_preferences, notifications, etc.)
2. Engineer uses new tables in features
3. Coordinate on RLS policies
4. Test together

### All Agents ↔ QA

**Process**:
1. Complete your phase
2. QA tests against design specs
3. QA provides pass/fail
4. Fix any failures
5. QA re-tests

---

## 🎯 YOUR FIRST TASKS

### Engineer
1. **NOW**: ENG-P0 - Create `/health` route (15 min)
2. **NEXT**: ENG-001 - Approval queue route (2h)
3. **Reference**: `docs/design/HANDOFF-approval-queue-ui.md`

### Data
1. **NOW**: DATA-P0 - Run RLS tests (30 min)
2. **NEXT**: DATA-NEW-001 - user_preferences table (30 min)
3. **Reference**: `docs/design/dashboard-features-1K-1P.md` Task 1K

### Designer
1. **NOW**: DES-001 - Review all 57 design specs (1h)
2. **NEXT**: DES-002 - Visual QA on approval queue (when Engineer completes)
3. **Reference**: ALL files in `docs/design/`

### QA
1. **NOW**: QA-003 to QA-014 - UI/UX tests with Chrome DevTools MCP
2. **WHEN Engineer completes**: Retest health endpoint
3. **WHEN Data completes**: Review RLS results
4. **THEN**: Final GO/NO-GO decision

---

## 📚 RESOURCES

**Complete Vision**: `COMPLETE_VISION_OVERVIEW.md` (read first - 10 min)  
**Your Direction**: `docs/directions/{YOUR_AGENT}.md` (read fully - 15-20 min)  
**Design Specs**: `/docs/design/` (57 files - reference as needed)  
**Protection Policy**: `docs/DESIGN_PROTECTION_POLICY.md` (why this matters)

---

## 🎯 LAUNCH!

**You have everything you need**:
- ✅ Complete vision documented
- ✅ Detailed task-by-task directions
- ✅ All 57 design specifications
- ✅ MCP tools ready
- ✅ Design specs protected (never disappearing again)

**Timeline**: 3-4 days to complete vision

**First step**: Read your direction file, then START with your first P0 task

**Let's build what was actually designed** 🚀

---

**Manager Status**: Ready to review PRs, validate against design specs, support agents

**CEO Status**: Awaiting complete vision implementation

**Go build!** ✅

