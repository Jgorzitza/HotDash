# Phase 6 Test Plan - Addendum: Phase 11 Separation

**Addendum to**: `docs/specs/phase-6-test-plan.md`
**Created**: 2025-10-22T12:20:00Z
**Author**: QA Agent
**Purpose**: Document Phase 6 vs Phase 11 test scenario separation

---

## Important Notice: Phase 11 Dependencies

**Date Added**: 2025-10-22
**Issue Identified**: 12 out of 35 test scenarios require Phase 11 database infrastructure (`user_preferences` table)
**Impact**: These scenarios cannot be executed until Phase 11 is implemented

---

## Test Scenario Separation Summary

### ✅ Phase 6 Testable NOW (23 scenarios)

**Immediate Execution** - No database persistence required
**Estimated Testing Time**: 8 hours
**Tests**: UI functionality, accessibility, performance, error handling (client-side)

### ⚠️ Phase 11 Required (12 scenarios)

**Deferred Execution** - Requires `user_preferences` Supabase table with RLS
**Estimated Testing Time**: 11 hours (additional)
**Tests**: Persistence, multi-session sync, server-side validation, conflict resolution

**Blocker**: Database table `user_preferences` does not exist in current schema (see `prisma/schema.prisma`)
**Evidence**: settings.tsx line 49: `// TODO (Phase 11): Load from Supabase user_preferences`

---

## Scenario-by-Scenario Breakdown

### Dashboard Tab Settings (8 total)

| Scenario | Title                        | Phase 6 | Phase 11 | Blocker                       |
| -------- | ---------------------------- | ------- | -------- | ----------------------------- |
| TS-001   | Toggle Tile Visibility       | ✅      |          | UI only                       |
| TS-002   | Drag/Drop Tile Reordering    |         | ⚠️       | tile_order persistence        |
| TS-003   | Minimum Tile Enforcement     |         | ⚠️       | Server-side validation        |
| TS-004   | Default View Selection       | ✅      |          | UI only                       |
| TS-005   | Auto-Refresh Toggle          |         | ⚠️       | auto_refresh persistence      |
| TS-006   | Reset to Defaults            |         | ⚠️       | /api/preferences/reset        |
| TS-007   | Concurrent Edit Conflict     |         | ⚠️       | Optimistic locking            |
| TS-008   | Tile Order Performance       | ✅      |          | UI drag/drop benchmark        |

**Phase 6: 3 scenarios | Phase 11: 5 scenarios**

---

### Appearance Tab Settings (6 total)

| Scenario | Title                          | Phase 6 | Phase 11 | Blocker                |
| -------- | ------------------------------ | ------- | -------- | ---------------------- |
| TS-009   | Light Theme Selection          | ✅      |          | CSS instant apply      |
| TS-010   | Dark Theme Selection           | ✅      |          | CSS instant apply      |
| TS-011   | Auto Theme (System Preference) | ✅      |          | Media query test       |
| TS-012   | Theme Persistence After Logout |         | ⚠️       | theme field + SSR      |
| TS-013   | Rapid Theme Switching          | ✅      |          | UI performance         |
| TS-014   | Theme Accessibility            | ✅      |          | Color contrast audit   |

**Phase 6: 5 scenarios | Phase 11: 1 scenario**

---

### Notifications Tab Settings (5 total)

| Scenario | Title                              | Phase 6 | Phase 11 | Blocker                       |
| -------- | ---------------------------------- | ------- | -------- | ----------------------------- |
| TS-015   | Desktop Notifications Toggle       | ✅      |          | Browser API test              |
| TS-016   | Notification Sound Toggle          | ✅      |          | Audio playback test           |
| TS-017   | Threshold Config (Queue Backlog)   |         | ⚠️       | notification_settings storage |
| TS-018   | Threshold Config (Performance)     |         | ⚠️       | notification_settings storage |
| TS-019   | Notification Frequency Setting     | ✅      |          | UI dropdown test              |

**Phase 6: 3 scenarios | Phase 11: 2 scenarios**

---

### Integrations Tab Settings (4 total)

| Scenario | Title                         | Phase 6 | Phase 11 | Blocker                 |
| -------- | ----------------------------- | ------- | -------- | ----------------------- |
| TS-020   | Integration Status Display    | ✅      |          | Mock data display       |
| TS-021   | Manual Health Check Trigger   | ✅      |          | UI button test          |
| TS-022   | Masked API Keys Display       |         | ⚠️       | creds_meta integration  |
| TS-023   | Integration Reconnection Flow |         | ⚠️       | OAuth + DB update       |

**Phase 6: 2 scenarios | Phase 11: 2 scenarios**

---

### Accessibility Testing (6 total)

| Scenario | Title                            | Phase 6 | Phase 11 | Blocker |
| -------- | -------------------------------- | ------- | -------- | ------- |
| TS-024   | Keyboard Navigation              | ✅      |          | N/A     |
| TS-025   | Screen Reader Compatibility      | ✅      |          | N/A     |
| TS-026   | Drag/Drop Keyboard Alternative   | ✅      |          | N/A     |
| TS-027   | Color Contrast Verification      | ✅      |          | N/A     |
| TS-028   | Focus Management in Modals       | ✅      |          | N/A     |
| TS-029   | ARIA Labels and Roles Audit      | ✅      |          | N/A     |

**Phase 6: 6 scenarios | Phase 11: 0 scenarios**

---

### Error Handling & Edge Cases (6 total)

| Scenario | Title                         | Phase 6 | Phase 11 | Blocker                  |
| -------- | ----------------------------- | ------- | -------- | ------------------------ |
| TS-030   | Network Failure During Save   | ✅      |          | Client error handling    |
| TS-031   | API Validation Error          | ✅      |          | Client validation        |
| TS-032   | Session Timeout During Edit   |         | ⚠️       | Session mgmt + 401       |
| TS-033   | Concurrent Save Conflict      |         | ⚠️       | Optimistic locking       |
| TS-034   | Drag Tile to Invalid Position | ✅      |          | UI drop validation       |
| TS-035   | Long Preference Value         | ✅      |          | Input field validation   |

**Phase 6: 4 scenarios | Phase 11: 2 scenarios**

---

## Total Summary

| Phase    | Scenarios | Testing Time | Status            |
| -------- | --------- | ------------ | ----------------- |
| Phase 6  | 23        | 8 hours      | ✅ READY NOW      |
| Phase 11 | 12        | 11 hours     | ⚠️ DEFERRED       |
| **TOTAL**| **35**    | **19 hours** | **Separated**     |

---

## Phase 11 Deferred Scenarios (12)

**Dashboard Tab** (5):
- ⚠️ TS-002: Drag/drop tile reordering
- ⚠️ TS-003: Minimum tile enforcement (server-side)
- ⚠️ TS-005: Auto-refresh toggle persistence
- ⚠️ TS-006: Reset to defaults
- ⚠️ TS-007: Concurrent edit conflict

**Appearance Tab** (1):
- ⚠️ TS-012: Theme persistence after logout

**Notifications Tab** (2):
- ⚠️ TS-017: Threshold configuration (queue backlog)
- ⚠️ TS-018: Threshold configuration (performance)

**Integrations Tab** (2):
- ⚠️ TS-022: Masked API keys display
- ⚠️ TS-023: Integration reconnection flow

**Error Handling** (2):
- ⚠️ TS-032: Session timeout during edit
- ⚠️ TS-033: Concurrent save conflict

**Full Details**: See `artifacts/qa/2025-10-22/phase-11-dependencies-tracker.md`

---

## Phase 6 Execution Plan (Revised)

### Phase A: Accessibility Tests (3 hours)
**Scenarios**: TS-024, TS-025, TS-026, TS-027, TS-028, TS-029 (6 scenarios)
**Tools**: axe DevTools, Lighthouse, NVDA screen reader
**Deliverable**: WCAG 2.2 AA compliance report

### Phase B: UI Functional Tests (3 hours)
**Scenarios**: TS-001, TS-004, TS-009, TS-010, TS-011, TS-013, TS-014, TS-015, TS-016, TS-019, TS-020, TS-021 (12 scenarios)
**Tools**: Playwright E2E tests
**Deliverable**: UI functionality validation report

### Phase C: Error Handling Tests (2 hours)
**Scenarios**: TS-030, TS-031, TS-034, TS-035 (4 scenarios)
**Tools**: Playwright + network throttling
**Deliverable**: Error handling validation report

**Total Phase 6 Testing**: 8 hours (reduced from original 19 hours)

---

## Database Prerequisite for Phase 11

### Required Table: user_preferences

**Status**: ❌ NOT YET CREATED (verified 2025-10-22)
**Location**: Supabase database
**Schema File**: `prisma/schema.prisma` (needs addition)

```sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT CHECK (theme IN ('light', 'dark', 'auto')) DEFAULT 'auto',
  dashboard_view TEXT CHECK (dashboard_view IN ('grid', 'list')) DEFAULT 'grid',
  auto_refresh BOOLEAN DEFAULT true,
  tile_order JSONB DEFAULT '[]'::JSONB,
  tile_visibility JSONB DEFAULT '{}'::JSONB,
  notification_settings JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- RLS Policies (MANDATORY)
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### Required API Endpoints

**POST /api/preferences/save**
- Upsert user preferences
- Server-side validation (min 2 tiles, valid enum values)
- Return success/error

**GET /api/preferences/load**
- Fetch by user_id (RLS enforced)
- Return defaults if no record

**POST /api/preferences/reset**
- Clear custom preferences
- Restore defaults

---

## Updated Sign-Off Section

### Test Plan Approval Status

**Original Document**: `docs/specs/phase-6-test-plan.md` (1400 lines)
**Addendum**: This document (phase-6-test-plan-addendum.md)

**QA Agent Sign-Off**:
- **Date**: 2025-10-22
- **Status**: ✅ APPROVED with Phase 11 Separation
- **Rationale**: Test plan is comprehensive. 23/35 scenarios testable NOW. 12/35 scenarios require Phase 11 database infrastructure and are properly documented as deferred.

**Pending Approvals**:
- ☐ **Engineer Agent**: Review implementation alignment
- ☐ **Designer Agent**: Review accessibility requirements
- ☐ **Manager Agent**: Review execution timeline and Phase 11 deferral

---

## How to Use This Addendum

### For Immediate Phase 6 Testing:
1. Execute **23 scenarios** marked ✅ Phase 6 in tables above
2. Estimated time: **8 hours**
3. Test execution guide: See original test plan sections for each scenario
4. Skip scenarios marked ⚠️ Phase 11

### For Phase 11 Testing (Future):
1. Wait for Manager/Engineer to announce: "Phase 11 user_preferences infrastructure complete"
2. Verify Phase 11 Readiness Checklist (see phase-11-dependencies-tracker.md)
3. Execute **12 scenarios** marked ⚠️ Phase 11 in tables above
4. Estimated time: **11 hours**
5. Detailed test steps: See phase-11-dependencies-tracker.md

### For Test Result Documentation:
- **Phase 6 Results**: `artifacts/qa/YYYY-MM-DD/phase-6-test-results.md`
- **Phase 11 Results**: `artifacts/qa/YYYY-MM-DD/phase-11-test-results.md`

---

## Related Documents

- **Main Test Plan**: `docs/specs/phase-6-test-plan.md` (original 35 scenarios)
- **QA Review**: `artifacts/qa/2025-10-22/QA-002-test-plan-review.md`
- **Phase 11 Tracker**: `artifacts/qa/2025-10-22/phase-11-dependencies-tracker.md`
- **Production Readiness**: `docs/runbooks/phase-6-production-readiness.md`
- **Implementation**: `app/routes/settings.tsx` (TODO line 49)
- **Schema**: `prisma/schema.prisma` (user_preferences not added)

---

**Addendum Status**: ACTIVE
**Applies To**: Phase 6 Test Plan (docs/specs/phase-6-test-plan.md)
**Created**: 2025-10-22T12:20:00Z
**Last Updated**: 2025-10-22T12:20:00Z

**EOF - Phase 6 Test Plan Addendum**
