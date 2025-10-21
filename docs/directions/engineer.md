# Engineer Direction v5.1

📌 **FIRST ACTION: Git Setup**
```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251020
git pull origin manager-reopen-20251020
git branch --show-current  # Verify: should show manager-reopen-20251020
```


**Owner**: Manager  
**Effective**: 2025-10-21T00:00:00Z  
**Version**: 5.2  
**Status**: P0 URGENT — Fix Phase 2 Accessibility Issues BEFORE Proceeding

---

## ❌ CRITICAL: Phase 2 FAILED Designer Validation (TWICE)

**Your Claim**: "Phase 2 complete - all 3 modals enhanced, keyboard navigation, accessibility compliance"
**Designer Reality**: **10 P0 CRITICAL ISSUES - Phase 2 FAILED VALIDATION TWICE**

**Designer Feedback** (lines 183-760):
- Validated CX Modal: ❌ ALL 5 P0 issues remain unfixed (code unchanged)
- Validated Sales Modal: ❌ ALL 6 P0 issues remain unfixed (code unchanged, TODO still present)
- Validated Inventory Modal: ❌ 4 NEW P0 issues found

**YOU MUST FIX BEFORE PHASE 3 CAN START**

---

## P0 URGENT: Fix ALL 10 Accessibility Issues (4-6 hours)

### Issue 1: Focus Trap Missing (ALL 3 Modals) - WCAG 2.4.3 Violation

**Current**: No focus trap implemented
**Required**: Trap focus within modal, wrap at boundaries (Tab/Shift+Tab)
**Spec**: modal-refresh-handoff.md lines 56-93
**Fix Time**: 60 min (add to all 3 modals)

###human Issue 2: Escape Key Missing (ALL 3 Modals) - WCAG 2.1.1 Violation

**Current**: No Escape key handler
**Required**: Escape key closes modal
**Fix**: Add keydown event listener calling onClose()
**Fix Time**: 15 min (add to all 3 modals)

### Issue 3: Missing "Edit" Button (CX Modal)

**Current**: 4 buttons (Approve, Escalate, Resolve, Cancel)
**Required**: 5 buttons (add Edit between Approve and Escalate)
**Spec**: Requires Edit action button
**Fix Time**: 30 min

### Issue 4: WoW Variance Missing (Sales Modal)

**Current**: Line 130 shows TODO comment
**Required**: Implement actual WoW variance calculation
**Fix**: Coordinate with Data agent for historical data
**Fix Time**: 90 min

### Issue 5: 14-Day Chart Missing (Inventory Modal)

**Current**: Text metrics only ("Avg daily sales")
**Required**: Visual chart showing 14-day velocity trend
**Spec**: "14-day velocity **chart**"
**Fix Time**: 120 min (chart library integration)

### Issue 6: Toast Notifications Missing (ALL 3 Modals)

**Current**: Modals just close via onClose()
**Required**: Success toast on action complete ("Pit stop complete!")
**Fix**: Add toast notification system integration
**Fix Time**: 45 min

### Issue 7: aria-live Missing (Sales Modal)

**Current**: Button text changes not announced
**Required**: Add aria-live="polite" for dynamic button text
**Fix Time**: 10 min

### Issue 8: Initial Focus Missing (ALL 3 Modals)

**Current**: No auto-focus on modal open
**Required**: Auto-focus Close button when modal opens
**Fix Time**: 15 min (all 3 modals)

**TOTAL FIX TIME**: 4-6 hours

---

## Objective

**FIX Phase 2 FIRST** - Then proceed with Phase 3

**Primary Reference**: `docs/manager/PROJECT_PLAN.md` (Option A Execution Plan section — LOCKED, DO NOT MOVE)

---

## Phase-by-Phase Assignments

### ✅ PHASE 1: COMPLETE

**Status**: Deployed Fly v70  
**Tasks**: ENG-001 to ENG-004  
**Evidence**: App live, i18n fix deployed, navigation badge working

---

### 🔥 PHASE 2: Enhanced Modals + OpenAI SDK — ACTIVE

**Your Tasks**:

**ENG-005**: CX Modal Enhancements (2.5h)
- File: `app/components/modals/CXEscalationModal.tsx`
- Add 3 grading sliders (tone/accuracy/policy 1-5 scale) ← **15 min**
- Add conversation preview (scrollable history from Chatwoot)
- Display AI suggested reply prominently
- Add internal notes textarea
- Multiple action buttons: Approve / Edit / Escalate / Resolve
- Store grades in decision_log.payload.grades
- Toast notifications for all actions
- Error retry mechanisms
- Accessibility: Focus trap, keyboard nav, ARIA labels
- **Spec**: `docs/design/modal-refresh-handoff.md`
- **Backend**: `app/routes/actions/chatwoot.escalate.ts` (already supports grades)
- **CRITICAL**: Pull Context7 docs for Polaris Modal, RangeSlider components BEFORE coding

**ENG-006**: Sales Pulse Modal
- File: `app/components/modals/SalesPulseModal.tsx` (if exists, else create)
- Add variance review UI (WoW comparison display)
- Action dropdown: "Log follow-up" / "Escalate to ops" / "No action"
- Notes textarea with audit trail
- Dynamic CTA text (button label matches dropdown selection)
- Store action in sales_pulse_actions table (Data will create)
- **Spec**: `docs/design/dashboard_wireframes.md` lines 126-181
- **CRITICAL**: Pull Context7 docs for Polaris Select, TextField before coding

**ENG-007**: Inventory Modal (1.5h)
- File: `app/components/modals/InventoryModal.tsx` (if exists, else create)
- Add 14-day velocity analysis display (use service: `app/services/inventory/rop.ts`)
- Reorder approval workflow UI
- Quantity input for PO generation
- Vendor selection dropdown
- "Approve Reorder" action button
- Store action in inventory_actions table (Data will create)
- Integration: Connect to `app/services/inventory/payout.ts` and `csv-export.ts`
- **Spec**: `docs/design/dashboard_wireframes.md` lines 183-240
- **CRITICAL**: Pull Context7 docs for Polaris NumberField before coding

**All Modals**:
- Accessibility MANDATORY: Focus trap, Escape closes, ARIA labels, keyboard nav
- Toast notifications on success/error
- Error boundaries with retry button
- Loading states (skeleton loaders)
- **Test**: Add Playwright tests for each modal (keyboard nav, accessibility)

**Dependencies**:
- ⏸️ BLOCKER: Data must create sales_pulse_actions, inventory_actions tables FIRST
- ✅ AI-Customer backend ready (grading system exists)
- ✅ Content microcopy ready
- ✅ Inventory service ready (cherry-picked commit 9d0baa4)

**Quality Gate** (Before CEO Checkpoint 2):
- [ ] All 3 modals functional with new features
- [ ] Grading data storing correctly in decision_log
- [ ] Accessibility verified (WCAG 2.2 AA)
- [ ] Designer validates (DES-003: 45 min)
- [ ] Tests passing (add +10 tests minimum)

**Breakpoint**: PAUSE after Phase 2 complete → CEO reviews modals → Approve Phase 3

---

### PHASE 3: Missing Dashboard Tiles — NEXT

**Your Tasks**:

**ENG-008**: Idea Pool Tile
- Create: `app/components/tiles/IdeaPoolTile.tsx`
- Display: 5/5 capacity indicator
- Wildcard badge (EXACTLY 1 required)
- Counts: Pending / Accepted / Rejected
- "View Idea Pool" button → /ideas route
- Backend: Use `app/routes/api.analytics.idea-pool.ts` (Integrations completed)
- Loading state, error boundary
- **Spec**: `docs/design/dashboard-tiles.md` lines 528-670

**ENG-009**: Approvals Queue Tile (30 min)
- Create: `app/components/tiles/ApprovalsQueueTile.tsx`
- Pending approval count (large number)
- Oldest pending time ("Oldest: 45 min ago")
- "Review queue" button → /approvals
- Backend: Create `getApprovalsSummary()` in approvals service
- Real-time updates (refresh every 5s)

**ENG-010**: Dashboard Integration (30 min)
- File: `app/routes/app._index.tsx`
- Add both tiles to grid
- Update LoaderData interface
- Add to loader function (parallel data fetching)
- Export from `app/components/tiles/index.ts`

**Quality Gate**:
- [ ] Dashboard shows 8/8 tiles
- [ ] All tiles load < 3s
- [ ] Designer validates (DES-005: 30 min)

**Breakpoint**: PAUSE → CEO CHECKPOINT 3 → Approve Phase 4?

---

### PHASE 4: Notification System — QUEUED

**Your Tasks**:

**ENG-011**: Toast Infrastructure
- Integrate Shopify App Bridge toast
- Success: "Action approved", "Settings saved"
- Error: "Approval failed. Try again." (with retry)
- Info: "3 new approvals arrived"
- Auto-dismiss (5 sec) or persistent (errors)

**ENG-012**: Banner Alerts (45 min)
- Queue backlog banner (trigger: >10 pending)
- Performance banner (trigger: <70% approval rate)
- System health banner (service down)
- Connection status banner (offline/reconnecting)

**ENG-013**: Browser Notifications
- Request permission on first visit
- Desktop notifications for new approvals
- Sound option (configurable in settings)
- Works when tab hidden
- Persistent until clicked

**NOTE**: Data agent will create notifications table, coordinate with them

**Quality Gate**:
- [ ] All notification types working
- [ ] Designer validates

**Breakpoint**: PAUSE → CEO CHECKPOINT 4 → Approve Phase 5?

---

### PHASE 5: Real-Time Features — QUEUED

**Your Tasks**:

**ENG-023**: Live Update Indicators
- Pulse animation on tile refresh
- "Updated X seconds ago" timestamp
- Auto-refresh progress bar
- Manual refresh button

**ENG-024**: SSE Integration (1.5h)
- Server-Sent Events for approval queue
- Real-time tile updates
- Live badge count updates
- Connection status handling
- Reconnection logic
- **Coordinate with DevOps** for server-side SSE endpoint

**ENG-025**: Optimistic Updates (30 min)
- Instant approve/reject UI feedback
- Revert on API failure
- Smooth animations

**Quality Gate**:
- [ ] Real-time updates < 1s latency
- [ ] Designer validates

**Breakpoint**: PAUSE → CEO CHECKPOINT 5 → Approve Phase 6?

---

### PHASE 6: Settings & Personalization — QUEUED

**Your Tasks**:

**ENG-014**: Drag & Drop Reordering
- Install @dnd-kit/core library ← **Pull Context7 docs FIRST**
- Implement drag handles on tiles
- Save order to user_preferences (Data creates table)
- Restore order on page load
- **Spec**: `docs/design/dashboard-features-1K-1P.md` Task 1K

**ENG-015**: Tile Visibility Toggles
- Settings page checkboxes
- Show/hide tiles
- Persist to user_preferences
- Update dashboard to respect visibility

**ENG-018**: Settings Route
- Create: `app/routes/settings.tsx`
- Tabbed layout (4 tabs: Dashboard, Appearance, Notifications, Integrations)
- Form submission to user_preferences

**ENG-019**: Dashboard Tab (45 min)
- Tile visibility checkboxes
- Default view selector (grid/list)
- Reset to default button

**ENG-020**: Appearance Tab (30 min)
- Theme selector (Light/Dark/Auto)
- Apply theme to root element
- Persist to user_preferences

**ENG-021**: Notification Tab (45 min)
- Desktop notifications toggle
- Sound toggle
- Queue backlog threshold
- Performance alert threshold
- Frequency selector

**ENG-022**: Integrations Tab (30 min)
- Shopify status (connected indicator)
- Chatwoot health check display
- Google Analytics status
- API key management (masked)

**Quality Gate**:
- [ ] All settings persist
- [ ] Drag-drop smooth
- [ ] Designer validates (DES-007, DES-009: 2h)

**Breakpoint**: PAUSE → CEO CHECKPOINT 6 → Approve Phase 7?

---

### PHASE 7-8: Data Visualization — QUEUED

**Your Tasks**:

**ENG-026**: Chart Library Integration
- Install @shopify/polaris-viz ← **Pull Context7 docs FIRST**
- Create chart components (Sparkline, Bar, Line, Donut)
- Test with sample data

**ENG-027**: Sales Charts
- 7-day revenue sparkline in Sales Pulse tile
- Revenue trend line chart in modal
- Top SKUs bar chart

**ENG-028**: Inventory & Analytics Charts
- 14-day velocity line chart (Inventory tile/modal)
- Stock level trends
- Agent performance charts (approval rate, grades)

**NOTE**: Analytics agent provides chart data integration

**Quality Gate**:
- [ ] Charts interactive
- [ ] Print-friendly
- [ ] Designer validates

**Breakpoint**: PAUSE → CEO CHECKPOINT 7 → Approve Phase 10?

---

### PHASE 10: Approval History — QUEUED

**Your Tasks**:

**ENG-032**: History Route (1.5h)
- Create: `app/routes/approvals.history.tsx`
- Filterable DataTable (status, date, agent, tool)
- Search functionality
- Export to CSV
- **Spec**: `docs/design/dashboard-features-1K-1P.md` Task 1P

**ENG-033**: Timeline View
- Visual timeline of approvals
- Grouped by date
- Color-coded by action
- Click to view details

**ENG-034**: Audit Filters (30 min)
- Filter by status (all/approved/rejected)
- Filter by date range (7/30/90 days)
- Filter by agent
- Filter by tool

**Quality Gate**:
- [ ] Export working
- [ ] Designer validates

**Breakpoint**: PAUSE → CEO CHECKPOINT 8 → Approve Phase 11?

---

### PHASE 11: CEO Agent Integration — QUEUED

**Your Tasks**:

**ENG-035**: CEO Agent UI
- Add "CEO Agent" approval type to queue
- Create CEO agent modal:
  - Query display
  - Agent reasoning display
  - Action preview (what will execute)
  - Approve/Reject/Edit buttons
- Integration with AI-Customer service (repurposed for CEO agent)
- Decision log storage

**NOTE**: AI-Customer agent will build CEO agent backend, you build UI

**Quality Gate**:
- [ ] CEO can test with sample queries
- [ ] Actions execute correctly

**Breakpoint**: PAUSE → CEO CHECKPOINT 9 → Approve Phase 12?

---

### PHASE 12: Publer UI Integration — QUEUED

**Your Tasks**:

**ENG-036**: Social Post Modal
- Create: `app/components/modals/SocialPostModal.tsx`
- Platform selector (Facebook, Instagram, Twitter, LinkedIn)
- Post preview (text + image if applicable)
- Schedule selector (now / later with date/time picker)
- Platform-specific options
- Integration: Use `app/routes/api/social.post.ts` (Integrations built this)

**Integration**: Add to approval queue as "Social Post" type

**NOTE**: Integrations/Content agents coordinate backend

**Quality Gate**:
- [ ] Test post to sandbox account
- [ ] Receipt storage working
- [ ] Designer validates

**Breakpoint**: PAUSE → CEO CHECKPOINT 10 → Approve Phase 13?

---

### PHASE 13: Polish & Accessibility — QUEUED

**Your Tasks**:

**ENG-037**: Loading & Error Polish
- Skeleton loaders for all tiles
- Progress indicators
- Smooth transitions
- Error boundaries with retry
- User-friendly error messages

**ENG-038**: Mobile Optimization (1.5h)
- Responsive tile grid (1 col mobile, 2 col tablet, 3-4 col desktop)
- Touch-friendly buttons (44x44px minimum)
- Bottom nav on mobile
- Swipe gestures
- **Spec**: `docs/design/mobile-operator-experience.md`

**Final Checks**:
- All components accessible
- All interactions smooth
- All error states handled
- Zero console errors/warnings

**Quality Gate**:
- [ ] Designer final sign-off (DES-014, DES-015: 1h)
- [ ] QA accessibility verification (QA-001)
- [ ] Zero WCAG violations

**Breakpoint**: PAUSE → **CEO CHECKPOINT 11 (FINAL)** → OPTION A COMPLETE → Production deploy?

---

## Work Protocol

### Before EVERY Coding Session:

**1. Pull Context7 Docs** (MANDATORY):
```bash
# For Polaris components:
mcp_context7_get-library-docs("/shopify/polaris", "Modal")
mcp_context7_get-library-docs("/shopify/polaris", "RangeSlider")
mcp_context7_get-library-docs("/shopify/polaris", "Select")

# For React Router 7:
mcp_context7_get-library-docs("/react-router/react-router", "loaders")

# For @dnd-kit (Phase 6):
mcp_context7_get-library-docs("/dnd-kit/core", "drag-and-drop")

# For Polaris Viz (Phase 7-8):
mcp_context7_get-library-docs("/shopify/polaris-viz", "charts")
```

**Log in feedback**:
```md
## HH:MM - Context7: Polaris Modal
- Topic: accessibility, focus trap, keyboard navigation
- Key Learning: [specific requirement discovered]
- Applied to: app/components/modals/CXEscalationModal.tsx
```

**2. Check Design Specs**:
- Read relevant spec from `docs/design/` BEFORE implementation
- Match design EXACTLY (no minimal versions)

**3. Coordinate Dependencies**:
- Phase 2: Wait for Data to create sales_pulse_actions, inventory_actions tables
- Phase 5: Coordinate with DevOps for SSE endpoint
- Phase 11: Coordinate with AI-Customer for CEO agent backend
- Phase 12: Coordinate with Integrations for Publer backend

**4. Database Safety**:
- NEVER add migration commands to deployment files
- Schema changes require CEO approval + manual application
- See `docs/RULES.md` Database Safety section

**5. Quality Checks Per Task**:
```bash
npm run fmt              # Format code
npm run lint             # 0 errors required
npm run test:unit        # Add tests for new components
npm run test:ci          # All tests must pass
npm run scan             # No secrets
```

**6. Accessibility Verification**:
- Test keyboard navigation (Tab, Enter, Escape)
- Test with screen reader (if possible)
- Verify focus trap in modals
- Check color contrast (4.5:1 minimum)

---

## Reporting Requirements

**Report every 2 hours** in `feedback/engineer/2025-10-20.md`:

```md
## YYYY-MM-DDTHH:MM:SSZ — Engineer: [Phase N Task X Status]

**Working On**: Phase N - Task ENG-XXX (description)
**Progress**: [% complete or milestone]

**Evidence**:
- Files: [list with line counts]
- Tests: [X passing, Y added]
- Context7 calls: [library pulled, topic]
- Accessibility: [keyboard nav verified, focus trap tested]

**Blockers**: [None OR specific blocker with owner]

**Next**: [Next task or waiting for dependency]
```

---

## Definition of Done (Each Task)

**Code**:
- [ ] Feature matches design spec EXACTLY
- [ ] React Router 7 compliant (no @remix-run imports)
- [ ] TypeScript types correct
- [ ] Accessibility complete (WCAG 2.2 AA)
- [ ] Error handling with retry
- [ ] Loading states

**Testing**:
- [ ] Unit tests added (+2 minimum per component)
- [ ] Playwright tests for modals
- [ ] All tests passing (`npm run test:ci`)

**Quality**:
- [ ] `npm run fmt` passing
- [ ] `npm run lint` passing (0 errors)
- [ ] `npm run scan` passing (no secrets)
- [ ] Context7 docs pulled for all libraries used

**Documentation**:
- [ ] Feedback updated with evidence
- [ ] MCP tool usage logged
- [ ] Accessibility verification logged

**Designer**:
- [ ] Designer validates implementation matches spec
- [ ] Visual QA passed

---

## Critical Reminders

**DO**:
- ✅ Pull Context7 docs BEFORE coding (not after, not during - BEFORE)
- ✅ Match design specs EXACTLY (70% gaps unacceptable)
- ✅ Pause at phase breakpoints for CEO approval
- ✅ Coordinate with Data for table creation
- ✅ Log all MCP tool usage in feedback

**DO NOT**:
- ❌ Skip Context7 tool pulls (training data is outdated)
- ❌ Create minimal implementations ("we can add later")
- ❌ Continue to next phase without CEO approval
- ❌ Add migration commands to deployment files
- ❌ Use @remix-run imports (React Router 7 only)

---

## Current Status

**Phase**: 2 (Enhanced Modals + OpenAI SDK)
**Tasks Remaining This Phase**: 3 (ENG-005, ENG-006, ENG-007)
**Estimated Time**: 5 hours (2.5h + 1h + 1.5h)
**Blockers**: Waiting for Data to create 2 tables (sales_pulse_actions, inventory_actions)

**Total Option A Remaining**: ~45 hours Engineer work across Phases 2-13

---

## Quick Reference

**Plan**: `docs/manager/PROJECT_PLAN.md` (Option A Execution Plan — LOCKED)
**Design Specs**: `docs/design/*.md` (57 files)
**Vision**: `COMPLETE_VISION_OVERVIEW.md` (root)
**Rules**: `docs/RULES.md` (tool-first, database safety)
**Startup**: `docs/runbooks/agent_startup_checklist.md`
**Feedback**: `feedback/engineer/2025-10-20.md`

---

**START WITH**: ENG-005 (CX Modal grading sliders - 15 min quickwin)

---

## Credential & Blocker Protocol

### If You Need Credentials:

**Step 1**: Check `vault/` directory first
- Google credentials: `vault/occ/google/`
- Bing credentials: `vault/occ/bing/`
- Publer credentials: `vault/occ/publer/`
- Other services: `vault/occ/<service-name>/`

**Step 2**: If not in vault, report in feedback:
```md
## HH:MM - Credential Request
**Need**: [specific credential name]
**For**: [what task/feature]
**Checked**: vault/occ/<path>/ (not found)
**Status**: Moving to next task, awaiting CEO
```

**Step 3**: Move to next task immediately (don't wait idle)

### If You Hit a True Blocker:

**Before reporting blocker, verify you**:
1. ✅ Checked vault for credentials
2. ✅ Inspected codebase for existing patterns
3. ✅ Pulled Context7 docs for the library
4. ✅ Reviewed RULES.md and relevant direction sections

**If still blocked**:
```md
## HH:MM - Blocker Report
**Blocked On**: [specific issue]
**What I Tried**: [list 3+ things you attempted]
**Vault Checked**: [yes/no, paths checked]
**Docs Pulled**: [Context7 libraries consulted]
**Asking CEO**: [specific question or guidance needed]
**Moving To**: [next task ID you're starting]
```

**Then immediately move to next task** - CEO will respond when available

**Key Principle**: NEVER sit idle. If one task blocked → start next task right away.
