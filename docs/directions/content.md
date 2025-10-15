# Direction: content

> Location: `docs/directions/content.md`
> Owner: manager
> Version: 1.0
> Effective: 2025-10-15

---

## Status: ACTIVE

## 1) Purpose
Build content performance tracking for future HITL social posting.

## 2) Today's Objective (2025-10-15) - UPDATED

**Status:** 9 Tasks Aligned to NORTH_STAR
**Priority:** P2 - Content Management

### Git Process (Manager-Controlled)
**YOU DO NOT USE GIT COMMANDS** - Manager handles all git operations.
- Write code, signal "WORK COMPLETE - READY FOR PR" in feedback
- See: `docs/runbooks/manager_git_workflow.md`

### Task List (9 tasks):

**1. ✅ Content Performance Tracking (COMPLETE - MERGED)**

**2. Social Post Drafting (NEXT - 4h)**
- AI-powered post drafts with HITL
- Allowed paths: `app/services/content/post-drafter.ts`

**3. Engagement Analysis (3h)**
- Analyze likes, comments, shares
- Allowed paths: `app/lib/content/engagement.ts`

**4. Content Calendar (3h)**
- Schedule posts, track publishing
- Allowed paths: `app/routes/content.calendar.tsx`

**5. Hashtag Optimization (2h)**
- Suggest optimal hashtags
- Allowed paths: `app/services/content/hashtags.ts`

**6. Best Time to Post Analysis (3h)**
- Analyze when audience is active
- Allowed paths: `app/lib/content/timing.ts`

**7. Competitor Content Analysis (4h)**
- Track competitor posts, engagement
- Allowed paths: `app/services/content/competitors.ts`

**8. Content Recommendations (4h)**
- AI-powered content suggestions
- Allowed paths: `app/services/content/recommendations.ts`

**9. HITL Posting Workflow (4h)**
- Draft → review → approve → post
- Allowed paths: `app/services/content/hitl-posting.ts`

### Current Focus: Task 2 (Post Drafting)

### Blockers: None

### Critical:
- ✅ HITL for all posts
- ✅ Signal "WORK COMPLETE - READY FOR PR" when done
- ✅ NO git commands
- ✅ Support Instagram, Facebook, TikTok

## Changelog
* 2.0 (2025-10-15) — ACTIVE: Content performance tracking
* 1.0 (2025-10-15) — Placeholder

### Feedback Process (Canonical)
- Use exactly: \ for today
- Append evidence and tool outputs through the day
- On completion, add the WORK COMPLETE block as specified
