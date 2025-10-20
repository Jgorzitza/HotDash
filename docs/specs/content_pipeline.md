# Content Pipeline Specification

**Version:** 2.0  
**Date:** 2025-10-19  
**Owner:** Content Agent  
**Status:** Production Ready

---

## Purpose

Define the complete content pipeline from ideation through HITL approval to publication, ensuring all content matches CEO tone, includes evidence, and follows the approvals loop defined in NORTH_STAR.md.

---

## Pipeline Stages

### 1. Ideation (Idea Pool)

**Source:** `app/fixtures/content/idea-pool.json`

**Requirements:**

- Maintain exactly **5** active ideas at all times
- Exactly **1** must be a Wildcard type
- Types: `launch`, `evergreen`, `wildcard`
- Each idea must include:
  - Evidence (metrics, product data, trend data)
  - Supabase linkage (table, IDs, timestamps)
  - Projected metrics (reach, engagement, clicks, conversions)
  - Risk assessment and rollback plan (for wildcards)

**Cadence:**

- Launch: Immediate (tied to product releases)
- Evergreen: Weekly/Bi-weekly (consistent community building)
- Wildcard: Opportunistic (48-72 hour trend windows)

### 2. Draft Creation

**Process:**

- Content agent drafts copy based on approved idea
- Copy must match **CEO tone guidelines** (see QA section)
- Include all required elements:
  - Platform-specific copy
  - Hashtags (3-5 relevant)
  - Suggested media (images/video)
  - Call-to-action
  - Link (if applicable)

**Output:** Publer-ready draft stored as Private Note or draft post

### 3. HITL Review & Approval

**States:** Draft → Pending Review → Approved → Applied → Audited → Learned

**Review Criteria:**

1. **Evidence** - Data backing the content decision
2. **Projected Impact** - Expected metrics with confidence level
3. **Risk & Rollback** - What could go wrong, how to undo
4. **CEO Tone Match** - Passes tone QA checklist (see below)

**Grading (1-5 scale):**

- **Tone**: Does it sound like CEO/brand voice?
- **Accuracy**: Are facts, products, claims accurate?
- **Policy**: Follows brand guidelines, legal requirements?

**SLA:**

- Business hours review: **≤ 15 minutes**
- Off-hours: **Same day**

### 4. Publication

**Adapter:** Publer API

**Requirements:**

- Only publish **approved** content
- Store Publer receipt payload in Supabase
- Record publication timestamp, platform, post ID

**Health Checks (Pre-publish):**

- Publer `/account_info` returns 200
- Publer `/social_accounts` shows target platform active
- All required media uploaded successfully

### 5. Performance Tracking

**Source:** Content tracking system (see `content_tracking.md`)

**Metrics Captured:**

- Engagement (likes, comments, shares, saves)
- Reach (impressions, unique views)
- Clicks (CTR, link clicks, profile clicks)
- Conversions (if trackable via GA4)

**Reporting:**

- Weekly performance brief
- Top performing content by platform
- Underperforming content analysis
- Recommendations for future content

### 6. Learning Loop

**Process:**

- Analyze approved vs. actual performance
- Review CEO edits and grades
- Identify high-performing patterns (hashtags, copy style, timing)
- Update idea pool priorities based on learnings
- Feed into supervised fine-tuning / evals

---

## QA Checklist: Copy Quality <a id="qa"></a>

### CEO Tone Guidelines

✅ **Voice Attributes:**

- [ ] Authentic and conversational (not corporate)
- [ ] Passionate about hot rods and craftsmanship
- [ ] Knowledgeable but not gatekeeping
- [ ] Community-focused (celebrates customer builds)
- [ ] Confident but humble (shows process, not just results)

✅ **Language Style:**

- [ ] Uses contractions (we're, don't, it's)
- [ ] Active voice preferred over passive
- [ ] Short, punchy sentences mixed with longer explanations
- [ ] Technical terms used naturally, not forced
- [ ] Emojis used sparingly (1-3 per post, contextual)

✅ **Content Do's:**

- [ ] Show behind-the-scenes / process
- [ ] Celebrate customer stories and builds
- [ ] Explain the "why" behind products
- [ ] Use specific product details (years, models, specs)
- [ ] Include call-to-action (tag us, check link, DM us)

❌ **Content Don'ts:**

- [ ] Avoid superlatives without evidence ("best ever", "never seen before")
- [ ] No hard sales language ("buy now", "limited time only" unless true)
- [ ] Don't oversell or hype unrealistically
- [ ] Avoid negativity toward competitors
- [ ] No industry jargon without context

### Platform-Specific Guidelines

**Instagram:**

- [ ] Copy: 50-150 characters (short and punchy)
- [ ] Hashtags: 3-5 relevant (no hashtag stuffing)
- [ ] CTA in caption or first comment
- [ ] Visual quality: High-res, well-lit, on-brand

**Facebook:**

- [ ] Copy: Can be longer (150-300 characters for engagement posts)
- [ ] Link placement: Include early in copy
- [ ] Community engagement: Ask questions, encourage comments
- [ ] Visuals: Image + link preview works well

**TikTok:**

- [ ] Copy: Very short (< 100 characters)
- [ ] Trending sounds/hashtags when relevant
- [ ] Hook in first 3 seconds (for video)
- [ ] Authentic, raw content over polished

### Microcopy Standards

**Product Titles:**

- [ ] Format: `[Year] [Make] [Model] [Part Type]`
- [ ] Example: "1957 Chevy Bel Air Custom Grille"
- [ ] Capitalize proper nouns (Chevy, Bel Air)

**CTAs:**

- [ ] Clear action verb (Shop, Explore, Check out, Tag us)
- [ ] Benefit-oriented (See how it transforms, Get yours before they sell out)
- [ ] Platform-appropriate (Link in bio for Instagram, Direct link for Facebook)

**Hashtags:**

- [ ] Brand hashtag always included: #HotRodAN
- [ ] Product-specific when applicable: #CustomGrille, #RestorationParts
- [ ] Community/industry: #HotRod, #ClassicCars, #CarCommunity
- [ ] Trending/platform-specific: #CarTok, #FYP (TikTok only)

---

## Evidence Requirements

Every content idea must include:

1. **Product Evidence (for launch content):**
   - Shopify Product ID
   - Inventory count
   - Cost basis and retail price
   - Margin calculation
   - Product tags and category

2. **Performance Evidence (for evergreen content):**
   - Historical engagement rates
   - Best performing time slots
   - Audience interest signals
   - Similar content benchmarks

3. **Trend Evidence (for wildcard content):**
   - Trend velocity (rising/peak/declining)
   - Hashtag performance data
   - Optimal window for participation
   - Similar content performance
   - Risk assessment (trend could die, brand misalignment)

4. **Supabase Linkage:**
   - Table reference (product_suggestions, content_performance, trend_opportunities)
   - Record IDs
   - Timestamps (created_at, expires_at if applicable)

---

## Supabase Schema (Content Tables)

### `product_suggestions`

```sql
CREATE TABLE product_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL,
  suggestion_type TEXT CHECK (suggestion_type IN ('launch', 'evergreen', 'wildcard')),
  title TEXT NOT NULL,
  description TEXT,
  evidence JSONB,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ
);
```

### `content_performance`

```sql
CREATE TABLE content_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id TEXT NOT NULL,
  platform TEXT CHECK (platform IN ('instagram', 'facebook', 'tiktok')),
  content_category TEXT,
  published_at TIMESTAMPTZ,
  metrics JSONB, -- engagement, reach, clicks, conversions
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `trend_opportunities`

```sql
CREATE TABLE trend_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trend_id TEXT UNIQUE NOT NULL,
  platform TEXT,
  trend_type TEXT,
  velocity TEXT CHECK (velocity IN ('rising', 'peak', 'declining')),
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  evidence JSONB
);
```

---

## Weekly Content Performance Brief Template

**Week of:** `[Start Date] - [End Date]`

### Summary Metrics

- Total posts published: `X`
- Total reach: `X`
- Total engagement: `X`
- Average engagement rate: `X%`
- Total clicks: `X`
- Total conversions: `X`

### Top Performers

1. **[Post Title]** - Platform: `X` - Engagement Rate: `X%`
   - Why it worked: `[Analysis]`
2. **[Post Title]** - Platform: `X` - Engagement Rate: `X%`
   - Why it worked: `[Analysis]`
3. **[Post Title]** - Platform: `X` - Engagement Rate: `X%`
   - Why it worked: `[Analysis]`

### Underperformers

- **[Post Title]** - Platform: `X` - Engagement Rate: `X%`
  - Why it underperformed: `[Analysis]`
  - Recommendation: `[Action]`

### Learnings & Recommendations

- **Timing:** `[Best posting times observed]`
- **Content Type:** `[What resonated with audience]`
- **Hashtags:** `[Most effective tags]`
- **Next Week Focus:** `[Priorities based on data]`

---

## Rollback Plan

**If content underperforms or causes issues:**

1. **Immediate (< 1 hour):**
   - Delete post if engagement rate < 0.5% after 1 hour
   - Remove if negative comments > 10% of total engagement

2. **Same Day:**
   - Archive post if it violates brand guidelines upon review
   - Update idea pool to deprioritize similar content

3. **Learning:**
   - Document what went wrong in `content_performance` table
   - Update QA checklist if gap identified
   - Brief CEO on incident and corrective actions

**Notification:**

- Escalate to CEO immediately for any content crisis
- Log incident in feedback file with timestamp and actions taken

---

## Definition of Done

- [ ] Idea pool fixture contains ≥ 5 scenarios (exactly 1 Wildcard)
- [ ] All ideas include evidence and Supabase linkage
- [ ] Copy QA checklist completed for all drafts
- [ ] Publer health checks passing before publish
- [ ] Publication receipts stored in Supabase
- [ ] Weekly performance brief generated with analytics
- [ ] CEO approval grades captured (tone/accuracy/policy)
- [ ] Learning loop documented in feedback

---

## Contract Test

```bash
# Verify idea pool has at least 3 scenarios
jq '. | length >= 3' app/fixtures/content/idea-pool.json

# Verify exactly 1 Wildcard
jq '[.[] | select(.type == "wildcard")] | length == 1' app/fixtures/content/idea-pool.json

# Verify all scenarios have evidence
jq 'all(.evidence != null)' app/fixtures/content/idea-pool.json

# Verify all scenarios have Supabase linkage
jq 'all(.supabase_linkage != null)' app/fixtures/content/idea-pool.json
```

Expected output: `true` for all tests

---

## References

- North Star: `docs/NORTH_STAR.md` (Approvals Loop, HITL requirements)
- Operating Model: `docs/OPERATING_MODEL.md` (Pipeline, guardrails)
- Content Tracking: `docs/specs/content_tracking.md` (Metrics, API endpoints)
- Approvals Drawer: `docs/specs/approvals_drawer_spec.md` (UI/UX for reviews)

---

## Change Log

- **2025-10-19:** Version 2.0 - Production-ready spec with QA checklist, microcopy standards, evidence requirements, Supabase schema
- **2025-10-17:** Version 1.0 - Initial content pipeline foundation
