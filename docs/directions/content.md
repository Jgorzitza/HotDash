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


## Backlog (Sprint-Ready — 25 tasks)
1) Post drafter service (HITL)
2) Content calendar CRUD
3) Engagement analyzer (CTR, saves, shares)
4) Topic recommender (read-only)
5) Cross-channel scheduler (staging)
6) Draft templates library
7) Hashtag helper
8) Media handling pipeline (thumbs/meta)
9) Performance tiles
10) Export CSV of posts
11) Unit tests for analyzers
12) Integration tests adapters
13) Caching for feeds
14) Docs/specs for content flows
15) Draft diffs vs approved (learning)
16) Reviewer rubric for content
17) A/B test scaffolding (placeholders)
18) Privacy guardrails (no prod post)
19) Staging vs prod adapters
20) Error taxonomy + UX
21) Telemetry events for drafts
22) Alerts (read-only) for anomalies
23) i18n scaffolding for drafts
24) Admin toggles
25) SLO dashboard for content APIs
