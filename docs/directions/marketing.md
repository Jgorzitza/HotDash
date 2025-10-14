# Marketing Agent Direction
**Updated**: 2025-10-14
**Priority**: GROWTH SPEC EXECUTION - CONTENT SYSTEMS
**Focus**: Build Content Generation Pipelines (NOT Create Content)

## Mission

Build **content generation systems** that create marketing materials at scale. NOT creating individual content pieces - build the AUTOMATION that generates content.

## CRITICAL MINDSET SHIFT

**❌ WRONG** (What you were doing):
- Writing individual blog posts for merchants
- Creating one-off social media content
- Manually crafting email campaigns
- Producing single-use marketing materials

**✅ RIGHT** (What you should build):
- Content generation pipeline (creates 100s of blog posts)
- Social media automation system (generates posts automatically)
- Email campaign generator (creates personalized campaigns at scale)
- Marketing asset factory (produces materials programmatically)

## Human-in-the-Loop for All Marketing Content

**CRITICAL REQUIREMENT**: ALL marketing content MUST use CEO approval workflow

**Why**: Train system to match CEO voice/tone, ensure brand consistency, maintain quality

**Reference**: [OpenAI Agents SDK - Human in the Loop](https://openai.github.io/openai-agents-js/guides/human-in-the-loop/)

**All marketing tools MUST have**:
```typescript
import { tool } from '@openai/agents';

const contentTool = tool({
  name: 'publishBlogPost',
  // ... parameters ...
  needsApproval: true,  // CEO approves ALL marketing content
  execute: async (params) => {
    // Executes only after CEO approval
  },
});
```

**Learning from CEO Approvals**:
- Track CEO edits (tone, voice, technical accuracy)
- Learn brand voice patterns (Hot Rod AN voice - see 01-hot-rod-an-voice.mdc)
- Improve content quality based on approval history
- Adjust confidence scores based on edit frequency
- Build examples library from approved content


## Priority 0 - Wait for Content Recommender

**BLOCKER**: AI agent building content recommenders (6-8 hours)

**While Waiting** (2-3 hours):
- [ ] Define content templates and schemas
- [ ] Study growth spec content requirements
- [ ] Design content generation architecture
- [ ] Prepare brand voice guidelines for automation

## Priority 1 - Content Generation Systems

### Task 1: Build Blog Post Generation Pipeline (6-8 hours)
**Goal**: Automated blog post creation from SEO data

**NOT**: Writing blog posts manually
**YES**: Building the system that writes blog posts

**Architecture**:
```typescript
// app/services/content/blog-generator.server.ts
class BlogPostGenerator {
  async generateFromSEOData(keywords: string[], gscData: GSCData) {
    // 1. Analyze keyword opportunities
    const topics = identifyTopics(keywords, gscData);
    
    // 2. Generate outlines with LlamaIndex
    const outlines = await Promise.all(
      topics.map(topic => generateOutline(topic))
    );
    
    // 3. Generate full posts
    const posts = await Promise.all(
      outlines.map(outline => generateFullPost(outline))
    );
    
    // 4. Create Actions for each post
    posts.forEach(post => createAction({
      type: 'content_publish',
      payload: post,
      score: calculateQualityScore(post)
    }));
  }
}
```

**Deliverables**:
- [ ] Blog generation pipeline implemented
- [ ] Template system for consistency
- [ ] Quality scoring algorithm
- [ ] Batch generation (50+ posts at once)
- [ ] Actions created for operator approval
- [ ] LlamaIndex MCP integration
- [ ] GitHub commit

### Task 2: Build Social Media Automation (4-6 hours)
**Goal**: Automated social post generation

**NOT**: Creating individual social posts
**YES**: Building the system that creates social posts

**Features**:
- Generate posts from blog content
- Create platform-specific variations (Twitter/LinkedIn/Instagram)
- Schedule posts automatically
- A/B test copy variations

**Deliverables**:
- [ ] Social media generator service
- [ ] Platform adapters (Twitter/LinkedIn/etc)
- [ ] Scheduling system
- [ ] Variation testing
- [ ] GitHub commit

### Task 3: Build Email Campaign Generator (4-6 hours)
**Goal**: Personalized email automation

**NOT**: Writing individual emails
**YES**: Building the email generation system

**Features**:
- Segment-based content generation
- Personalization variables
- A/B testing support
- Performance tracking

**Deliverables**:
- [ ] Email generator service
- [ ] Segmentation logic
- [ ] Template system
- [ ] Tracking integration
- [ ] GitHub commit

## Priority 2 - Content Distribution Systems

### Task 4: Build Multi-Channel Publisher (3-4 hours)
**Goal**: Automated content distribution

**Channels**:
- Shopify blog
- Social media platforms
- Email lists
- Content syndication

**Features**:
- One-click publish to all channels
- Platform-specific formatting
- Error handling and retries
- Publication audit trail

**Deliverables**:
- [ ] Multi-channel publisher service
- [ ] Channel adapters
- [ ] Publication queue
- [ ] Audit logging
- [ ] GitHub commit

### Task 5: Build Content Performance Analytics (3-4 hours)
**Goal**: Measure content impact automatically

**Metrics to Track**:
- Blog post traffic (GA integration)
- Social engagement (likes, shares, comments)
- Email open/click rates
- Conversion attribution

**Deliverables**:
- [ ] Analytics collection service
- [ ] Performance dashboards
- [ ] ROI calculations
- [ ] A/B test results
- [ ] GitHub commit

## Build Content SYSTEMS, Not Content

**✅ RIGHT**:
- Build blog generator (creates 50+ posts/day)
- Build social automation (posts 24/7)
- Build email engine (personalized at scale)

**❌ WRONG**:
- Write blog posts manually (one at a time)
- Create social posts yourself (not scalable)
- Draft individual emails (human-hours wasted)

## Brand Voice Automation

**Challenge**: Maintain Hot Rod AN voice at scale
**Solution**: Brand voice validation system

```typescript
// app/services/content/brand-voice-validator.ts
class BrandVoiceValidator {
  async validate(content: string): Promise<ValidationResult> {
    // Check against brand voice rules (01-hot-rod-an-voice.mdc)
    // - Conversational, not corporate
    // - Enthusiastic, not pushy
    // - Clear, not jargon-heavy
    
    return {
      score: 0.0-1.0,
      issues: [...],
      suggestions: [...]
    };
  }
}
```

**Deliverables**:
- [ ] Brand voice validator
- [ ] Auto-correction suggestions
- [ ] Quality threshold enforcement
- [ ] GitHub commit

## Evidence Required

- Git commits for all generation systems
- LlamaIndex MCP validation
- Generated content samples (to prove it works)
- Performance metrics (posts/hour, quality scores)

## Success Criteria

**Week 1 Complete When**:
- [ ] Blog generation pipeline operational (50+ posts)
- [ ] Social media automation running (24/7 posting)
- [ ] Email campaign generator functional (personalized at scale)
- [ ] Multi-channel publisher distributing content
- [ ] Performance analytics tracking impact
- [ ] Brand voice maintained automatically

**This enables**: Marketing content at scale without human creation hours

## Report Every 2 Hours

Update `feedback/marketing.md`:
- Generation systems built
- Content produced (quantities)
- Distribution channels active
- Performance metrics
- Evidence (commits, samples)

---

**Remember**: Build CONTENT GENERATION SYSTEMS, not create content manually. Automate creation at scale.
