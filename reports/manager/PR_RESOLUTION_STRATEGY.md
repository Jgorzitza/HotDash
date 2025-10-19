# PR Resolution Strategy - Clean Slate Approach

**Date**: 2025-10-19T16:00:00Z
**Issue**: 19/20 open PRs have merge conflicts, blocking agents
**Resolution**: Close conflicting PRs, start fresh with updated directions

---

## Current Situation

**Open PRs**: 20
**Conflicting**: 19 (95%)
**Mergeable**: 1 (PR #44, but failing CI)

**Root Cause**: 
- All PRs created before manager's direction updates
- Direction files completely rewritten (React Router 7, Context7 MCP, P0 RLS fix)
- Agent work from old directions now conflicts with new directions

**Impact**: Agents blocked - can't merge old work, can't start new work

---

## Manager Decision: CLOSE CONFLICTING PRS

**Rationale**:
1. All directions rewritten (16 files, 241 new molecules)
2. Framework changed (Remix → React Router 7 clarity)
3. Database security added (P0 RLS fix)
4. Old PRs based on outdated direction (not aligned)
5. Merge conflicts require manual resolution (not worth time)

**Better Approach**: Fresh PRs from updated directions

---

## PRs to Close (19 total)

**With conflicts** (close with comment explaining):
- #95 - Ads molecules (outdated direction)
- #94 - Engineer approvals SSR (outdated)
- #93 - Analytics export (outdated)
- #92 - Analytics tiles (outdated)
- #91 - Analytics GA4 stub (outdated)
- #87 - Manager enforcement (superseded)
- #86 - Directions autonomy (superseded by new directions)
- #85 - Product A/B harness (check if still needed)
- #84 - Analytics CWV spec (check if still needed)
- #82 - Approvals SSR fix (verify if still needed)
- #76 - Manager plan seed (superseded)
- #47 - Manager startup readiness (old)
- #46 - AI-knowledge stub (outdated)
- #45 - Support webhook retry (may still be useful)
- #35 - AI-knowledge KB design (outdated)
- #33 - Integrations dashboard APIs (outdated)
- #32 - Inventory schema design (outdated)
- #31 - AI-knowledge KB design (duplicate/outdated)
- #28 - Support Chatwoot integration (outdated)

**Review needed**:
- #44 - Ads slice-b foundations (MERGEABLE but failing CI)

---

## Closure Comment Template

```markdown
Closing this PR as direction files have been completely rewritten by Manager with:
- React Router 7 patterns (not Remix)
- Context7 MCP requirements
- Supabase security fixes (P0 RLS)
- 241 new production molecules

Please create a new PR based on updated direction file: docs/directions/<lane>.md

See: reports/manager/FINAL_MANAGER_REPORT_2025-10-19.md for details
```

---

## Alternative: Merge PR #44 (if salvageable)

**PR #44**: "ads: slice-b foundations"
**Status**: MERGEABLE but CI failing
**Check**: Does it conflict with new ads.md direction?

**If compatible**: Fix CI, merge
**If not**: Close and recreate

---

## Post-Closure Actions

**For agents**:
1. Read updated direction: docs/directions/<lane>.md
2. Start fresh molecules from new direction
3. Create new PRs with updated patterns
4. Reference new issues if needed

**Expected**: Fresh PRs within 2-4 hours as agents complete molecules

---

## Manager Actions (Execute Now)

### 1. Close Conflicting PRs (bulk)

```bash
# Close with standardized comment
for pr in 95 94 93 92 91 87 86 85 84 82 76 47 46 45 35 33 32 31 28; do
  gh pr close $pr --comment "Closing: Direction files rewritten by Manager. Please create new PR from updated docs/directions/<lane>.md. See reports/manager/FINAL_MANAGER_REPORT_2025-10-19.md"
done
```

### 2. Review PR #44

Check if ads work aligns with new ads.md direction
- If YES: Fix CI and merge
- If NO: Close and let Ads agent recreate

### 3. Document in Feedback

Update feedback/manager/2025-10-19.md with PR closure rationale

---

**Status**: Ready to execute
**Timeline**: 15 minutes to close all PRs
**Unblocks**: All 16 agents (fresh start with updated directions)

