# Content Management Flows Specification

**Version:** 1.0  
**Date:** 2025-10-15  
**Owner:** content agent  
**Status:** Complete - Ready for Implementation

---

## Overview

This document specifies all content management workflows for the Hot Rod AN Control Center, covering the complete lifecycle from content creation to performance analysis.

---

## Core Workflows

### 1. HITL Posting Workflow

**Flow:** Draft → Review → Approve → Post → Track → Learn

#### Step 1: Draft
- **Actor:** AI Content Agent
- **Input:** Topic, platform, product ID (optional)
- **Process:**
  1. Generate post using `draftPost()` from post-drafter service
  2. Get optimization suggestions via `optimizePost()`
  3. Validate draft with `validatePost()`
  4. Create HITL post record with evidence and rollback plan
- **Output:** Draft post in 'draft' state
- **File:** `app/services/content/hitl-posting.ts`

#### Step 2: Review
- **Actor:** AI Content Agent
- **Input:** Draft post ID
- **Process:**
  1. Submit draft for review via `submitForReview()`
  2. Update state to 'pending_review'
  3. Send notification to human reviewer
- **Output:** Post in 'pending_review' state
- **File:** `app/services/content/hitl-posting.ts`

#### Step 3: Approve
- **Actor:** Human Reviewer (CEO)
- **Input:** Approval decision, feedback, edits
- **Process:**
  1. Review draft with optimization suggestions
  2. Provide grades (tone, accuracy, policy: 1-5)
  3. Make edits if needed
  4. Approve or reject via `processApproval()`
  5. Optionally schedule for later
- **Output:** Post in 'approved', 'rejected', or 'scheduled' state
- **File:** `app/services/content/hitl-posting.ts`

#### Step 4: Post
- **Actor:** System
- **Input:** Approved post ID
- **Process:**
  1. Publish to platform via Ayrshare API
  2. Update state to 'published' or 'failed'
  3. Record platform post ID and URL
  4. Log audit trail
- **Output:** Published post or error
- **File:** `app/services/content/hitl-posting.ts`

#### Step 5: Track
- **Actor:** System (automated)
- **Input:** Published post ID
- **Process:**
  1. Fetch performance metrics from platform
  2. Calculate engagement rate, CTR, save rate
  3. Store metrics in Supabase
  4. Update performance dashboard
- **Output:** Performance metrics
- **File:** `app/lib/content/tracking.ts`

#### Step 6: Learn
- **Actor:** System (automated)
- **Input:** Post with feedback and performance
- **Process:**
  1. Capture human edits for training
  2. Record grades (tone, accuracy, policy)
  3. Compare actual vs projected performance
  4. Generate insights for improvement
  5. Feed to supervised fine-tuning
- **Output:** Learning insights
- **File:** `app/services/content/hitl-posting.ts`

---

### 2. Content Calendar Workflow

**Flow:** Plan → Schedule → Publish → Review

#### Plan
- View calendar by month/week
- Identify gaps in posting schedule
- Get recommendations for optimal posting times
- **File:** `app/routes/content.calendar.tsx`

#### Schedule
- Drag-and-drop posts to calendar slots
- Set publish date/time
- Assign to platforms
- **File:** `app/routes/content.calendar.tsx`

#### Publish
- Automated publishing at scheduled time
- Manual publish option
- Multi-platform posting
- **File:** `app/services/content/hitl-posting.ts`

#### Review
- View published posts
- Check performance metrics
- Identify top performers
- **File:** `app/lib/content/tracking.ts`

---

### 3. Content Recommendation Workflow

**Flow:** Analyze → Recommend → Create → Publish

#### Analyze
- Historical performance data
- Trending topics
- Competitor activity
- Seasonal events
- **File:** `app/services/content/recommendations.ts`

#### Recommend
- Topic suggestions
- Format recommendations
- Timing recommendations
- Product showcase ideas
- **File:** `app/services/content/recommendations.ts`

#### Create
- Use template or AI draft
- Fill placeholders
- Optimize for platform
- **File:** `app/services/content/templates.ts`, `app/services/content/post-drafter.ts`

#### Publish
- Follow HITL workflow
- Track performance
- Learn from results
- **File:** `app/services/content/hitl-posting.ts`

---

### 4. Competitor Analysis Workflow

**Flow:** Track → Analyze → Benchmark → Adapt

#### Track
- Add competitors to watch list
- Monitor their posts
- Collect engagement metrics
- **File:** `app/services/content/competitors.ts`

#### Analyze
- Post frequency patterns
- Content themes
- Hashtag strategies
- Posting times
- **File:** `app/services/content/competitors.ts`

#### Benchmark
- Compare your metrics vs competitors
- Identify performance gaps
- Find opportunities
- **File:** `app/services/content/competitors.ts`

#### Adapt
- Get content inspiration
- Test competitor strategies
- Improve based on insights
- **File:** `app/services/content/recommendations.ts`

---

### 5. Hashtag Optimization Workflow

**Flow:** Analyze → Suggest → Validate → Track

#### Analyze
- Extract topics from content
- Check historical hashtag performance
- Identify trending hashtags
- **File:** `app/services/content/hashtags.ts`

#### Suggest
- Platform-optimized hashtags
- Relevance and performance scoring
- Category classification
- **File:** `app/services/content/hashtags.ts`

#### Validate
- Check platform limits
- Validate characters and format
- Avoid spammy hashtags
- **File:** `app/services/content/hashtags.ts`

#### Track
- Monitor hashtag performance
- Update recommendations
- Identify new trends
- **File:** `app/services/content/engagement-analyzer.ts`

---

### 6. Engagement Analysis Workflow

**Flow:** Collect → Analyze → Insight → Optimize

#### Collect
- Fetch engagement metrics from platforms
- Store in Supabase
- Track over time
- **File:** `app/lib/content/tracking.ts`

#### Analyze
- Calculate engagement rate, CTR, save rate
- Identify patterns and trends
- Compare across platforms
- **File:** `app/lib/content/engagement.ts`

#### Insight
- Generate performance insights
- Identify top content
- Find improvement areas
- **File:** `app/services/content/engagement-analyzer.ts`

#### Optimize
- Adjust content strategy
- Test new approaches
- Improve based on data
- **File:** `app/services/content/recommendations.ts`

---

## Data Flow

### Content Creation
```
User Input → AI Draft → Optimization → Validation → HITL Review → Approval → Publishing
```

### Performance Tracking
```
Published Post → Platform Metrics → Data Collection → Analysis → Insights → Recommendations
```

### Learning Loop
```
Human Feedback → Edit Tracking → Grade Recording → Performance Comparison → Model Training
```

---

## Integration Points

### External Services
1. **OpenAI API** - AI-powered content generation
2. **Ayrshare API** - Multi-platform publishing
3. **Platform APIs** - Direct integration (Instagram, Facebook, TikTok)
4. **Supabase** - Data storage and retrieval
5. **GA4** - Conversion tracking

### Internal Services
1. **Shopify Admin GraphQL** - Product data
2. **Metrics Service** - Performance tracking
3. **Approvals Service** - HITL workflow
4. **Cache Service** - Performance optimization

---

## State Management

### Post States
- `draft` - Initial creation
- `pending_review` - Awaiting human review
- `approved` - Approved for publishing
- `rejected` - Rejected by reviewer
- `scheduled` - Scheduled for future publish
- `published` - Successfully published
- `failed` - Publishing failed

### State Transitions
```
draft → pending_review → approved → published
                       ↓
                    rejected

approved → scheduled → published
```

---

## Error Handling

### Publishing Failures
1. Log error details
2. Update post state to 'failed'
3. Notify reviewer
4. Provide rollback instructions
5. Retry option available

### API Failures
1. Implement exponential backoff
2. Cache responses when possible
3. Graceful degradation
4. User-friendly error messages

---

## Security & Privacy

### HITL Enforcement
- All posts require human approval
- No automatic publishing without approval
- Audit trail for all actions
- Rollback capability

### Data Protection
- No customer data in posts without consent
- Compliance with platform policies
- Privacy guardrails in dev mode
- Staging vs production separation

---

## Performance Considerations

### Caching Strategy
- Cache platform metrics (5-minute TTL)
- Cache recommendations (1-hour TTL)
- Cache competitor data (24-hour TTL)

### Rate Limiting
- Respect platform API limits
- Queue posts for publishing
- Throttle competitor tracking

---

## Metrics & Monitoring

### Success Metrics
- Draft approval rate (target: ≥ 90%)
- Average review time (target: ≤ 15 min)
- Publishing success rate (target: ≥ 99%)
- Engagement rate improvement (target: +10% MoM)

### Quality Metrics
- Tone grade average (target: ≥ 4.5)
- Accuracy grade average (target: ≥ 4.7)
- Policy grade average (target: ≥ 4.8)

---

## Future Enhancements

1. A/B testing framework
2. Multi-language support (i18n)
3. Video content optimization
4. Influencer collaboration tracking
5. ROI attribution
6. Automated content calendar generation
7. AI-powered image generation
8. Sentiment analysis
9. Crisis management workflows
10. Content approval workflows for teams

