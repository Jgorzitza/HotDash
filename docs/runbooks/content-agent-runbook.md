# Content Agent Runbook

**Owner:** Content Agent  
**Version:** 1.0  
**Date:** 2025-10-19

---

## Purpose

Operational guide for content agent tasks: idea pool maintenance, post drafting, HITL approvals, performance tracking.

---

## Daily Workflow

### Morning Startup

1. Execute `docs/runbooks/agent_startup_checklist.md`
2. Read direction from `docs/directions/content.md`
3. Check lanes file: `reports/manager/lanes/latest.json`
4. Review pending approvals (if any)
5. Log startup in `feedback/content/YYYY-MM-DD.md`

### During Day

1. Execute molecules sequentially (NO-ASK mode)
2. Log progress every 2 hours in feedback file
3. Run contract tests after fixture updates
4. Submit drafts for HITL review (never auto-publish)
5. Track MCP tool usage (4+ calls minimum)

### End of Day

1. Complete WORK COMPLETE block in feedback
2. Verify all work within allowed paths
3. Run lint/tests/scan
4. Create completion artifacts
5. Await Manager review

---

## Key Tasks

### Task: Maintain Idea Pool Fixtures

**File:** `app/fixtures/content/idea-pool.json`

**Requirements:**

- ≥3 scenarios at all times
- Exactly 1 wildcard (North Star requirement)
- Each scenario must have:
  - Provenance (mode: dev:test, agent, feedback_ref)
  - Evidence (market data, competitor analysis, etc.)
  - Supabase linkage (table, status, priority)
  - Messaging (headline/hook, benefits, CTA)
  - Timeline (for launches)

**Contract Test:**

```bash
jq '. | length >= 3' app/fixtures/content/idea-pool.json
# Should return: true
```

**Validation:**

```bash
# Use fixture loader
node -e "import('./app/lib/content/fixture-loader.ts').then(m => console.log(m.validateIdeaPool()))"
```

### Task: Draft Social Media Posts

**Service:** `app/services/content/post-drafter.ts`

**Workflow:**

1. Load fixture: `loadIdeaPoolFixture(fixtureId)`
2. Generate platform-specific post: `generatePostFromFixture(fixtureId, platform)`
3. Validate tone: `validateTone(post.text, platform)`
4. Create approval: `createContentApproval(draft)`
5. Submit for HITL: `submitForReview(approval)`

**Platform Guidelines:**

- **Instagram**: Hook in first line, 125 chars optimal, hashtags in caption, no clickable links
- **Facebook**: Conversational, include link URL, 120 chars optimal
- **TikTok**: Short/punchy, 100 chars optimal, hashtag-heavy

**Tone Requirements:**

- Conversational ("you", "we", "your")
- Hot rod enthusiast peer (not salesperson)
- Clear CTA
- No spammy language ("buy now!!!", "click here!!!")
- Community language encouraged ("restoration", "build", "classic")

### Task: Analyze Performance

**Service:** `app/services/content/engagement-analyzer.ts`

**Functions:**

- `analyzePostPerformance(postId, platform)` - Single post analysis
- `analyzeContentStrategy(startDate, endDate)` - Strategic insights
- `exportWeeklyReport(startDate, endDate)` - Markdown report

**Metrics:**

- Engagement Rate: (likes + comments + shares + saves) / impressions × 100
- Click-Through Rate: clicks / impressions × 100
- Conversion Rate: conversions / clicks × 100

**Targets:**

- Instagram ER: ≥4.0%
- TikTok ER: ≥5.0%
- Facebook ER: ≥2.0%
- All platforms CTR: ≥1.2%
- All platforms CR: ≥2.0%

### Task: Content Approvals (HITL)

**Integration:** `app/services/content/approvals-integration.ts`

**Approval Flow:**

1. Draft → Pending Review → Approved → Applied → Audited
2. CEO reviews in approvals drawer
3. CEO can edit copy and provide grades (tone/accuracy/policy 1-5)
4. Edits logged for learning
5. Approved posts scheduled via Publer
6. Performance tracked post-publish

**Grading Criteria:**

- **Tone** (1-5): Brand voice alignment
- **Accuracy** (1-5): Claims/specs correctness
- **Policy** (1-5): Guidelines compliance

**Rollback:**

- Delete post via Publer API within 15 minutes
- Issue correction post if already widely distributed
- Low complexity, low risk

---

## Tools & Integrations

### Publer API (Mock Mode)

**Status:** Mock client active, live posting disabled

**Feature Flag:** `PUBLER_LIVE_POSTING_ENABLED = false`

**Client:** `app/adapters/publer/client.mock.ts`

**OAuth Setup:** See `docs/integrations/publer-oauth-setup.md`

**Usage:**

```typescript
import { getPublerClient } from "~/adapters/publer/client.mock";

const publer = getPublerClient();
const response = await publer.schedulePost(request);
```

### MCP Tools

**Required:** 4+ calls per session

**Available:**

- Shopify Admin MCP (product data, metafields)
- Context7 MCP (API documentation lookup)
- GitHub MCP (repository access)

**Usage Example:**

```typescript
// Get Publer API docs
mcp_context7_get -
  library -
  docs({
    context7CompatibleLibraryID: "/websites/publer",
    topic: "OAuth authentication scheduling",
    tokens: 5000,
  });
```

---

## File Structure

```
app/
├── fixtures/content/
│   └── idea-pool.json              # 3+ scenarios (1 wildcard)
├── lib/content/
│   ├── tracking.ts                 # Metrics calculations
│   ├── tone-validator.ts           # Brand voice validation
│   ├── fixture-loader.ts           # Load idea pool fixtures
│   └── index.ts                    # Public exports
├── services/content/
│   ├── post-drafter.ts             # Generate social posts
│   ├── engagement-analyzer.ts      # Performance analysis
│   └── approvals-integration.ts    # HITL flow
├── adapters/publer/
│   ├── types.ts                    # Publer API types
│   ├── client.mock.ts              # Mock client + feature flag
│   └── README.md                   # Usage guide
├── components/dashboard/
│   └── ContentTile.tsx             # Dashboard tile
└── routes/
    └── api.content.performance.ts  # Performance API

docs/
├── integrations/
│   └── publer-oauth-setup.md       # OAuth setup guide
├── specs/
│   ├── content_pipeline.md         # Main spec + KPIs
│   ├── content_tracking.md         # Metrics spec
│   └── weekly-content-performance-brief.md
└── design/
    └── content-coordination.md     # Agent coordination protocol

tests/unit/content/
├── tracking.spec.ts                # Tracking tests
└── tone-validator.spec.ts          # Tone validation tests

feedback/content/
└── YYYY-MM-DD.md                   # Daily progress log
```

---

## Common Commands

### Run Contract Test

```bash
jq '. | length >= 3' app/fixtures/content/idea-pool.json
```

### Validate Idea Pool

```bash
node -e "import('./app/lib/content/fixture-loader.ts').then(m => console.log(m.validateIdeaPool()))"
```

### Run Content Tests

```bash
npm run test tests/unit/content
```

### Lint Content Files

```bash
npm run lint -- app/lib/content app/services/content app/adapters/publer
```

### Check Feature Flags

```bash
grep "PUBLER_LIVE_POSTING_ENABLED" app/adapters/publer/client.mock.ts
# Should show: false
```

---

## Troubleshooting

### "Fixture not found"

- Verify ID matches entry in `app/fixtures/content/idea-pool.json`
- Check fixture has all required fields

### "Tone validation failing"

- Review brand voice rules in `tone-validator.ts`
- Check for spammy language
- Ensure conversational tone ("you", "we", "your")
- Add clear CTA

### "Approvals not showing"

- Verify approval created with `createContentApproval(draft)`
- Check approval.state is "pending_review"
- Ensure `submitApproval()` was called

### "Publer errors"

- Confirm `PUBLER_LIVE_POSTING_ENABLED = false` (mock mode)
- Check if trying to use live client without OAuth
- See `docs/integrations/publer-oauth-setup.md`

---

## Safety & Compliance

### HITL Requirements

**All social posts must:**

- Draft via Post Drafter Service
- Stage in Approvals Drawer
- Await CEO approval/edits
- Record grades (tone/accuracy/policy)
- Never auto-publish without HITL

### Allowed Paths

- `app/fixtures/content/**`
- `app/lib/content/**`
- `app/services/content/**`
- `app/adapters/publer/**`
- `app/components/dashboard/ContentTile.tsx`
- `app/routes/api.content.*`
- `docs/specs/content*.md`
- `docs/design/content*.md`
- `docs/integrations/publer*.md`
- `feedback/content/YYYY-MM-DD.md`
- `tests/unit/content/**`

### Forbidden

- ❌ Publishing without HITL approval
- ❌ Auto-posting to social media
- ❌ Enabling `PUBLER_LIVE_POSTING_ENABLED` without CEO approval
- ❌ Editing other agents' feedback files
- ❌ Creating ad-hoc documents outside allowed paths
- ❌ Committing OAuth credentials

---

## Performance Metrics

### Success Criteria

- Approval grades: tone ≥4.5, accuracy ≥4.7, policy ≥4.8
- Engagement rates meet platform targets
- Weekly brief delivered on time
- Zero unauthorized posts
- MCP tools used 4+ times per session

### Monitoring

- Content Dashboard Tile (real-time)
- Weekly performance brief (insights)
- Approval grades (Supabase - future)
- CEO feedback on edits

---

## Resources

- **North Star:** `docs/NORTH_STAR.md`
- **Operating Model:** `docs/OPERATING_MODEL.md`
- **Approvals Spec:** `docs/specs/approvals_drawer_spec.md`
- **Content Tracking:** `docs/specs/content_tracking.md`
- **Publer Docs:** https://publer.com/docs/
- **Direction:** `docs/directions/content.md`
- **Feedback:** `feedback/content/YYYY-MM-DD.md`
