# Product Direction v5.1

📌 **FIRST ACTION: Git Setup**
```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251020
git pull origin manager-reopen-20251020
git branch --show-current  # Verify: should show manager-reopen-20251020
```


**Owner**: Manager  
**Effective**: 2025-10-20T20:00Z  
**Version**: 5.0  
**Status**: ACTIVE — Feature Flags v2 + A/B Testing (PARALLEL DAY 2-4)

---

## Objective

**Build enhanced feature flag system and A/B testing infrastructure**

**Primary Reference**: `docs/manager/PROJECT_PLAN.md` (Option A Execution Plan — LOCKED)

**Timeline**: Day 2-4 — START DAY 2 (Parallel with Engineer Phases 2-5)

---

## Day 2 Tasks (START DAY 2 - 4h)

### PRODUCT-001: Feature Flags v2 UI

**Enhance existing feature flag system**:

**Build UI in Settings** - `app/routes/settings.feature-flags.tsx`:
- Tab in Settings page: "Feature Flags"
- List all available flags with descriptions
- Toggle switches (enable/disable)
- "Experimental" badge for beta features
- Save to user_preferences table (Data creates)

**Current Flags** (from codebase):
- `FEATURE_SUPABASE_IDEA_POOL`
- `FEATURE_FLAG_*` (legacy prefix)

**Add New Flags**:
- `FEATURE_REALTIME_UPDATES` (Phase 5 SSE)
- `FEATURE_DARK_MODE` (Phase 6)
- `FEATURE_ADVANCED_CHARTS` (Phase 7-8)
- `FEATURE_CEO_AGENT` (Phase 11)

**Coordinate with Engineer**: They build settings page structure, you add feature flags tab

---

### PRODUCT-002: A/B Testing Infrastructure

**Build experiment framework**:

**File**: `app/services/experiments/ab-testing.ts`

**Features**:
- Assign users to experiment variants (A/B)
- Track variant assignment
- Collect metrics per variant
- Statistical significance calculation

**Example Experiment**:
```typescript
{
  id: 'approval_cta_test',
  name: 'Approval Button Text Test',
  variants: [
    { id: 'control', name: 'Approve', weight: 0.5 },
    { id: 'variant', name: 'Approve & Send', weight: 0.5 }
  ],
  metrics: ['click_rate', 'time_to_approve'],
  status: 'running'
}
```

**Storage**: Store in user_preferences or new experiments table

---

## Day 3-4 Tasks

### PRODUCT-003: User Feedback Collection System

**Build feedback widget**:

**Component** (coordinate with Engineer): `app/components/FeedbackWidget.tsx`
- Small widget in corner: "Feedback?"
- Modal with form: "How can we improve?" textarea
- Rating (1-5 stars)
- Category dropdown (Bug, Feature Request, UX Issue, Other)
- Submit stores in Supabase feedback table

**Backend**: `app/routes/api.feedback.submit.ts`
- Store feedback submissions
- Email notification to Manager (optional)
- Weekly digest

---

### PRODUCT-004: Product Analytics Dashboard

**Build analytics for product decisions**:

**Metrics to Track**:
- Feature adoption rates (% users using each feature)
- Tile engagement (clicks per tile)
- Modal actions (approve vs reject rates)
- Settings changes (theme, tile visibility)
- A/B test results

**Service**: `app/services/analytics/product-analytics.ts`
- Query decision_log, user_preferences
- Calculate adoption rates
- Generate insights

**Display**: Future "Product Analytics" tile or CEO dashboard

---

## Work Protocol

**1. MCP Tools**:
```bash
# TypeScript patterns:
mcp_context7_get-library-docs("/microsoft/TypeScript", "generics")

# React patterns:
mcp_context7_get-library-docs("/react-router/react-router", "forms")
```

**2. Coordinate**:
- **Engineer**: Settings page structure, feedback widget UI
- **Data**: user_preferences table, feedback table (if needed)
- **Analytics**: Share analytics patterns

**3. Reporting (Every 2 hours)**:
```md
## YYYY-MM-DDTHH:MM:SSZ — Product: Feature Flags v2

**Working On**: PRODUCT-001 (Feature flags UI)
**Progress**: Backend logic complete, UI pending Engineer

**Evidence**:
- Files: app/services/experiments/feature-flags.ts (125 lines)
- Tests: 8/8 passing
- Flags added: 4 new flags for Option A features
- Coordinated with: Engineer (settings tab structure)

**Blockers**: None
**Next**: Build A/B testing framework
```

---

## Definition of Done

**Feature Flags v2**:
- [ ] UI in Settings (coordinate with Engineer)
- [ ] All Option A features flagged
- [ ] Toggle functionality working
- [ ] Persists to user_preferences

**A/B Testing**:
- [ ] Framework functional
- [ ] Can create experiments
- [ ] Metrics tracked
- [ ] Statistical significance calculated

**Feedback System**:
- [ ] Widget implemented
- [ ] Submissions stored
- [ ] Weekly digest functional

**Product Analytics**:
- [ ] Feature adoption tracked
- [ ] Tile engagement measured
- [ ] Insights generated

---

## Phase Schedule

**Day 2**: PRODUCT-001, PRODUCT-002 (Feature flags + A/B testing - 4h) — START DAY 2
**Day 3-4**: PRODUCT-003, PRODUCT-004 (Feedback + analytics - 4h)

**Total**: 8 hours across Days 2-4 (parallel with Engineer)

---

## Quick Reference

**Plan**: `docs/manager/PROJECT_PLAN.md`
**Feedback**: `feedback/product/2025-10-20.md`

---

**START WITH**: PRODUCT-001 (Feature flags v2 - DAY 2) — Coordinate with Engineer on settings page

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

---

## ✅ MANAGER UPDATE (2025-10-21T00:00Z)

---

## ✅ ALL TASKS COMPLETE - STANDBY MODE

**Manager Update** (2025-10-21T01:25Z): All feedback reviewed, work verified complete

**Your Status**: ✅ STANDBY
- All assigned tasks completed successfully
- Evidence documented in feedback file
- Ready for Phase 3+ coordination or new assignments

**Current Focus**: Monitor feedback and await direction for:
- Phase 6: Settings page (feature flags UI)
- A/B testing coordination with Engineer
- Grading UI integration (Phase 2)

**No Action Required**: Stay in standby until Manager assigns next task

**If Contacted By Other Agents**: Respond to coordination requests and document in feedback

**Status**: ALL TASKS COMPLETE ✅

**Evidence**: See feedback/product/2025-10-20.md

**Your Work**:
Work verified complete by Manager

**Next Assignment**: STANDBY - Await Phase 3-13 coordination requests

**No Action Required**: You are in standby mode until Manager assigns next phase work

