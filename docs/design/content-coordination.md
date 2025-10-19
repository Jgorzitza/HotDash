# Content Coordination Protocol

**Owner:** Content Agent  
**Version:** 1.0  
**Effective:** 2025-10-19

## Purpose

Define how Content agent coordinates with AI-Customer and Ads agents to ensure messaging consistency, HITL approval flow, and Publer draft management.

## Agent Coordination Matrix

### Content ↔ AI-Customer

**Shared Objective:** Customer-facing messaging maintains brand voice and tone

**Content Provides:**

- Copy QA checklist (docs/specs/content_pipeline.md)
- Microcopy standards for buttons, errors, success messages
- Brand voice guidelines: "hot rod enthusiast peer" tone
- Product messaging from idea pool fixtures

**AI-Customer Uses:**

- Copy QA checklist to draft customer replies (Chatwoot)
- Microcopy standards for automated response templates
- Escalates tone conflicts to Content for review

**Handoff Pattern:**

1. Content updates copy guidelines → notifies AI-Customer via feedback file
2. AI-Customer drafts replies using guidelines → submits for HITL review
3. CEO/Manager approves/edits → edits logged for Content to refine guidelines
4. Content analyzes approval grades (tone/accuracy/policy) → updates checklist

### Content ↔ Ads

**Shared Objective:** Social posts and ad copy align with product launches and content calendar

**Content Provides:**

- Idea pool fixtures (app/fixtures/content/idea-pool.json) with messaging sections
- Weekly performance brief with CTR/engagement data
- Platform-specific copy guidelines (Instagram/Facebook/TikTok)
- Content calendar for evergreen topics

**Ads Uses:**

- Idea pool messaging to draft social posts
- Performance brief data to optimize ad targeting
- Platform guidelines to format posts correctly

**Handoff Pattern:**

1. Content creates idea pool entry → Ads reviews messaging section
2. Ads drafts Publer post → stages in Publer (not auto-publish)
3. Content/CEO reviews draft → approves or requests edits
4. Ads publishes → logs Publer receipt to Supabase
5. Content tracks performance → includes in next weekly brief

## Publer Draft Management (HITL Required)

### Staging Protocol

1. **Draft Creation:** Ads agent creates post in Publer (status: draft)
2. **Evidence Attachment:** Include fixture reference, target metrics, rollback plan
3. **Review Request:** Tag Content and CEO in approval queue
4. **Approval Gate:** CEO must approve before publish (no auto-post)
5. **Publish:** Ads publishes approved draft, captures Publer receipt
6. **Tracking:** Ads logs receipt payload to Supabase for performance analysis

### Required Fields for Approval

- **Post Copy:** Full text with hashtags
- **Media:** Images/video with alt text
- **Platform:** Instagram/Facebook/TikTok/etc
- **Publish Time:** UTC timestamp (future: optimal time from analytics)
- **Target Metrics:** Expected engagement rate, CTR
- **Fixture Reference:** Link to idea pool entry (launch/evergreen/wildcard)
- **Rollback Plan:** How to delete/edit if performance <50% of target

### Approval Criteria

- [ ] Copy passes QA checklist (docs/specs/content_pipeline.md)
- [ ] Messaging aligns with idea pool fixture
- [ ] Media is high-quality and on-brand
- [ ] CTA is clear and actionable
- [ ] Publish time doesn't conflict with other launches
- [ ] Target metrics are realistic (based on historical performance)

## Messaging Synchronization

### Source of Truth

**Idea Pool Fixtures** (`app/fixtures/content/idea-pool.json`) are the canonical source for:

- Product launch messaging (headlines, benefits, CTAs)
- Evergreen content topics and distribution channels
- Wildcard experiment hooks and incentive structures

### Update Flow

1. Content updates idea pool fixture → commits to repo
2. Content notifies Ads + AI-Customer in feedback files
3. Agents review messaging sections relevant to their work
4. Agents flag conflicts/questions in own feedback → Content resolves

### Conflict Resolution

If messaging conflicts between agents:

1. Content agent reviews all versions
2. Content proposes unified messaging in content_pipeline.md
3. CEO approves final version
4. Content updates idea pool fixture as canonical reference
5. All agents use updated messaging going forward

## HITL Approval Recording

### Grading System (1-5 scale)

After CEO approves/edits content:

**Tone:** How well does it match brand voice?
**Accuracy:** Are claims/specs correct?
**Policy:** Does it follow guidelines and legal requirements?

### Storage

- Approval grades logged to Supabase `content_approvals` table
- Edits stored as before/after diffs for learning
- Content analyzes trends quarterly → updates copy guidelines

## Performance Feedback Loop

### Weekly Cadence

1. **Monday:** Content produces weekly performance brief (CTR/engagement)
2. **Tuesday:** Ads reviews brief → adjusts targeting/creative strategy
3. **Wednesday:** AI-Customer reviews brief → refines messaging templates
4. **Thursday:** Content updates idea pool based on performance data
5. **Friday:** All agents sync on next week's launches/content

### Performance Brief Contents

- Platform-by-platform engagement rates (actual vs target)
- Top 3 performing posts (why they worked)
- Bottom 3 posts (what to avoid)
- CTR trends over time
- Conversion data (when available from GA4)

## Tools & Artifacts

- **Fixtures:** app/fixtures/content/idea-pool.json
- **Guidelines:** docs/specs/content_pipeline.md
- **Tracking:** app/lib/content/tracking.ts
- **Coordination:** docs/design/content-coordination.md (this file)
- **Feedback:** feedback/content/YYYY-MM-DD.md

## Escalation

If coordination breaks down:

1. Log specific issue in own feedback file
2. @mention Manager in Issue
3. Propose solution (don't just report problem)
4. Wait for direction update before proceeding
