# Content - Social Posts + Engagement + Publer

> Generate posts. Validate tone. Schedule via Publer. Track engagement. HITL approvals.

**Issue**: #116 | **Repository**: Jgorzitza/HotDash | **Allowed Paths**: app/lib/content/**, app/services/content/**, tests/unit/content/\*\*

## Constraints

- MCP Tools: MANDATORY for all discovery
  - `mcp_context7_get-library-docs` for React Router 7 patterns (library: `/remix-run/react-router`)
  - Context7 for Publer API docs (if available)
- Framework: React Router 7 (NOT Remix) - use loaders/actions for server-side
- All posts require HITL approval
- Tone validation: MANDATORY before approval
- Publer queue: ≤5 pending approvals
- Feature flag: PUBLER_LIVE controls mock vs real posting

## Definition of Done

- [ ] Post drafter generating platform-optimized content
- [ ] Tone validator enforcing brand voice
- [ ] Publer integration operational
- [ ] Content approval flow complete
- [ ] Engagement analytics tracked
- [ ] Evidence: Posts approved and scheduled

## Production Molecules

### CON-001: Post Drafter - Platform Optimization (40 min)

**File**: app/services/content/post-drafter.ts
**Optimize**: Character limits, hashtags, emoji per platform
**Platforms**: Instagram, Facebook, Twitter/X
**Evidence**: Posts generated, platform-specific

### CON-002: Tone Validator (35 min)

**File**: app/lib/content/tone-validator.ts
**Rules**: Brand voice guidelines, prohibited words, sentiment check
**Block**: Posts that fail validation
**Evidence**: Tone validation working (tests exist per Manager)

### CON-003: Publer API Client Integration (40 min)

**File**: app/adapters/publer/client.real.ts (verify completeness)
**MCP**: Context7 for API reference
**Endpoints**: /post_create, /post_status, /social_accounts
**Evidence**: API client operational

### CON-004: Content Approval Card (30 min)

**File**: app/components/approvals/ContentApprovalCard.tsx
**Display**: Post preview, platform, schedule time, tone score
**Actions**: Approve, reject, edit, grade
**Evidence**: Approval UI working

### CON-005: Publer Scheduling Integration (35 min)

**File**: app/services/content/post-scheduler.ts
**Schedule**: Via Publer API with approved posts
**Feature flag**: PUBLER_LIVE guards real posting
**Evidence**: Posts scheduled (mock in dev, real in staging)

### CON-006: Content Calendar Fixture (25 min)

**File**: app/fixtures/content/content-calendar.json
**Data**: 30 days of scheduled posts
**Use**: For dashboard display and testing
**Evidence**: Calendar populated

### CON-007: Engagement Analytics Fetcher (35 min)

**File**: app/services/content/publer-analytics-fetcher.ts
**Fetch**: Likes, shares, comments, reach per post
**Periods**: 24h, 7d, 30d
**Evidence**: Analytics retrieved

### CON-008: Engagement Analyzer (30 min)

**File**: app/services/content/engagement-analyzer.ts
**Analyze**: Best performing content types, optimal posting times
**Report**: Weekly insights
**Evidence**: Analysis accurate

### CON-009: Content Performance Tile (30 min)

**File**: app/components/dashboard/ContentTile.tsx
**Display**: Top 3 posts, engagement metrics, queue status
**Evidence**: Tile rendering

### CON-010: A/B Testing Framework (Optional) (35 min)

**File**: app/services/content/ab-testing.ts
**Test**: Different post variations, measure performance
**Report**: Which performed better
**Evidence**: A/B logic implemented

### CON-011: Media Upload Handler (25 min)

**File**: app/lib/content/media-uploader.ts
**Upload**: Images/videos to Publer
**Validation**: File size, format, dimensions
**Evidence**: Uploads working

### CON-012: Publer Health Check (20 min)

**File**: app/services/content/publer-health-checker.ts
**Check**: API accessible, rate limits, account status
**Evidence**: Health monitored

### CON-013: Weekly Performance Brief (30 min)

**File**: scripts/content/weekly-brief.mjs
**Generate**: docs/reports/content/weekly-YYYY-MM-DD.md
**Include**: Top posts, engagement trends, recommendations
**Evidence**: Report generated

### CON-014: Documentation (20 min)

**Files**: docs/specs/content_pipeline.md, docs/integrations/publer-oauth-setup.md (verify)
**Update**: Current state, scheduling flow
**Evidence**: Docs accurate

### CON-015: WORK COMPLETE Block (10 min)

**Update**: feedback/content/2025-10-19.md
**Include**: Posts generating, tone validated, Publer integrated, approvals working
**Evidence**: Feedback entry

## Foreground Proof

1. post-drafter.ts implementation
2. tone-validator.ts working
3. publer/client.real.ts integration
4. ContentApprovalCard.tsx UI
5. post-scheduler.ts scheduling
6. content-calendar.json fixture
7. publer-analytics-fetcher.ts data
8. engagement-analyzer.ts insights
9. ContentTile.tsx component
10. A/B testing framework (optional)
11. media-uploader.ts uploads
12. publer-health-checker.ts monitoring
13. weekly-brief.mjs report
14. Documentation updated
15. WORK COMPLETE feedback

**TOTAL ESTIMATE**: ~6 hours
**SUCCESS**: Social posts scheduled, tone validated, engagement tracked, Publer operational
