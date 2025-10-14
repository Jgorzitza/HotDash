# Content Generation System Architecture

**Owner**: Marketing Agent  
**Created**: 2025-10-14  
**Status**: Design Phase (Waiting for AI agent content recommenders)

---

## System Overview

Automated content generation pipeline that creates marketing materials at scale with CEO approval for all output.

### Core Principle
**Build systems that generate content, not create content manually**

---

## Architecture Layers

### Layer 1: Content Recommender (AI Agent - In Progress)
**Status**: Being built by AI agent (6-8 hours)  
**Purpose**: Analyze data and recommend content opportunities

```
Input: SEO data, customer data, product updates
Output: Content recommendations with priority scores
```

**What it provides to Marketing**:
- Blog post topics ranked by SEO opportunity
- Social post suggestions based on engagement data
- Email campaign triggers based on user behavior
- Content gaps identified from analytics

---

### Layer 2: Content Generator (Marketing Agent - This System)
**Purpose**: Generate actual content from recommendations

```typescript
// app/services/content/generators/blog-generator.server.ts
class BlogPostGenerator {
  async generateFromRecommendation(rec: ContentRecommendation): Promise<BlogPost> {
    // 1. Get context from LlamaIndex MCP
    const context = await llamaIndex.query(rec.topic, rec.keywords);
    
    // 2. Generate content using OpenAI
    const draft = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: BLOG_SYSTEM_PROMPT },
        { role: "user", content: buildPrompt(rec, context) }
      ],
    });
    
    // 3. Validate brand voice
    const voiceCheck = await validateBrandVoice(draft.content);
    if (!voiceCheck.passes) {
      // Auto-correct or flag for review
    }
    
    // 4. Calculate SEO score
    const seoScore = calculateSEOScore(draft, rec.keywords);
    
    // 5. Create Action for CEO approval
    return {
      ...draft,
      needsApproval: true,
      qualityScore: calculateOverallScore(voiceCheck, seoScore),
    };
  }
}
```

---

### Layer 3: Approval Workflow (OpenAI Agents SDK)
**Purpose**: CEO approves all marketing content

```typescript
// app/agents/marketing-content-agent.server.ts
import { tool } from '@openai/agents';

const publishBlogPost = tool({
  name: 'publish_blog_post',
  description: 'Publish a blog post to the website',
  parameters: BlogPostSchema,
  needsApproval: true,  // CEO MUST approve
  execute: async ({ title, content, ... }) => {
    // This only runs AFTER CEO approval
    const published = await blogService.publish({
      title,
      content,
      publishedAt: new Date(),
    });
    
    return { success: true, url: published.url };
  },
});

const generateSocialPost = tool({
  name: 'generate_social_post',
  description: 'Generate social media post from blog content',
  parameters: SocialPostSchema,
  needsApproval: true,  // CEO MUST approve
  execute: async ({ platform, content, ... }) => {
    // Publish to social platform after approval
    return await socialService.publish(platform, content);
  },
});
```

---

### Layer 4: Distribution System
**Purpose**: Multi-channel content distribution

```
Approved Content
    ↓
Distribution Queue
    ↓
┌─────────────┬─────────────┬─────────────┬─────────────┐
│   Shopify   │   Twitter   │  LinkedIn   │    Email    │
│    Blog     │             │             │  Campaign   │
└─────────────┴─────────────┴─────────────┴─────────────┘
    ↓               ↓               ↓               ↓
Performance Tracking (Google Analytics, social APIs)
```

---

### Layer 5: Learning & Optimization
**Purpose**: Improve content quality over time

```typescript
class ContentLearningSystem {
  async learnFromCEOApproval(
    original: BlogPost,
    ceoEdits: string[],
    approved: boolean
  ) {
    // Track what CEO changes
    const patterns = analyzeCEOEdits(original, ceoEdits);
    
    // Store as training examples
    await trainingData.save({
      original,
      approved_version: ceoEdits,
      patterns,
      timestamp: Date.now(),
    });
    
    // Update generation prompts
    updateSystemPrompts(patterns);
    
    // Adjust confidence scores
    if (!approved) {
      decreaseConfidence(original.category, original.tone);
    }
  }
}
```

---

## Data Flow

### 1. Content Recommendation (AI Agent)
```
SEO Data (GSC) → Content Recommender → Recommendations
                                              ↓
Customer Data → Content Recommender → Priority Scores
                                              ↓
Product Updates → Content Recommender → Content Queue
```

### 2. Content Generation (Marketing Agent)
```
Recommendation
    ↓
LlamaIndex Context (query knowledge base)
    ↓
OpenAI Generation (create draft)
    ↓
Brand Voice Validation (check Hot Rod AN voice)
    ↓
SEO Optimization (keyword placement, meta)
    ↓
Quality Scoring (overall readiness)
    ↓
Action Creation (CEO approval queue)
```

### 3. CEO Approval Workflow
```
Action Created (needsApproval: true)
    ↓
CEO Dashboard (shows draft + context)
    ↓
CEO Reviews:
    ├─ Approve → Publish to channels
    ├─ Edit → Save edits + Publish + Learn
    └─ Reject → Log reason + Learn
```

### 4. Publishing & Distribution
```
Approved Content
    ↓
Format for each channel:
    ├─ Blog: Full post with SEO meta
    ├─ Twitter: 280 char + hashtags
    ├─ LinkedIn: 500 char storytelling
    ├─ Email: Segmented personalized
    └─ Instagram: Visual + caption
```

### 5. Performance Tracking
```
Published Content
    ↓
Track metrics:
    ├─ Views (GA)
    ├─ Clicks (UTM params)
    ├─ Conversions (attribution)
    ├─ Engagement (social APIs)
    └─ Revenue impact (Shopify)
```

---

## Integration Points

### LlamaIndex MCP Server
**Purpose**: Knowledge base for content context

```typescript
// Get relevant context from docs
const context = await llamaIndexMCP.tools.query_support({
  query: "How does approval queue work?",
  max_results: 5,
});

// Use in blog generation
const blogPrompt = `
Write a blog post about: ${topic}

Context from our docs:
${context.results.join('\n\n')}

Requirements:
- Conversational tone (Hot Rod AN voice)
- Include specific examples
- 800-1000 words
- SEO optimized for: ${keywords.join(', ')}
`;
```

### Google Search Console API
**Purpose**: SEO data for content opportunities

```typescript
// Get keyword opportunities
const opportunities = await gscAPI.getTopQueries({
  position: { min: 4, max: 20 },  // Keywords we rank 4-20
  impressions: { min: 100 },      // Decent search volume
  clicks: { min: 10 },            // Some interest
});

// Generate blog posts to capture these rankings
for (const keyword of opportunities) {
  const recommendation = {
    type: 'blog',
    topic: keyword.query,
    seoOpportunity: calculateOpportunity(keyword),
    priority: keyword.position < 10 ? 'high' : 'medium',
  };
  
  await contentQueue.add(recommendation);
}
```

### Shopify Blog API
**Purpose**: Publish blog posts

```typescript
// After CEO approval
const published = await shopify.graphql(`
  mutation createBlogPost($input: BlogPostInput!) {
    blogPostCreate(input: $input) {
      blogPost {
        id
        title
        handle
        publishedAt
      }
    }
  }
`, {
  input: {
    title: approved.title,
    content: approved.content,
    tags: approved.keywords,
    publishedAt: new Date().toISOString(),
  },
});
```

### Social Media APIs
**Purpose**: Multi-platform distribution

```typescript
// Twitter
await twitter.tweets.create({ text: approved.content });

// LinkedIn
await linkedin.posts.create({
  author: `urn:li:organization:${ORG_ID}`,
  commentary: approved.content,
});
```

---

## Key Design Decisions

### 1. CEO Approval Required (All Content)
**Why**: Train system on CEO voice, ensure quality, maintain brand

```typescript
// Every content tool MUST have
needsApproval: true
```

### 2. Batch Generation (Not One-by-One)
**Why**: Efficiency - generate 50 blog posts at once

```typescript
// Generate in batches
const batch = await BlogPostGenerator.generateBatch({
  recommendations: topRecommendations.slice(0, 50),
  parallel: 10,  // 10 concurrent generations
});
```

### 3. Quality Gates (Before CEO Review)
**Why**: Don't waste CEO time on bad drafts

```typescript
// Only send to CEO if passes quality threshold
if (qualityScore.overall >= 70 && voiceCheck.passes) {
  createApprovalAction(content);
} else {
  flagForRegeneration(content, qualityScore.issues);
}
```

### 4. Learning from Approvals
**Why**: Improve generation quality over time

```typescript
// Track CEO patterns
if (ceoApproved) {
  reinforcePatterns(content.tone, content.structure);
} else {
  learnFromRejection(content, ceoFeedback);
}
```

---

## Performance Targets

### Generation Speed
- Blog post: <30 seconds
- Social post: <5 seconds
- Email: <10 seconds
- Batch of 50 blogs: <10 minutes

### Quality Metrics
- Brand voice score: >0.85
- SEO score: >80/100
- CEO approval rate: >70% (Week 1) → >90% (Week 4)
- Content engagement: 2x industry average

### Scale Targets
- Blog posts: 50+/day
- Social posts: 100+/day
- Emails: 1000+/day (personalized)
- Manual hours saved: 95%

---

## Technology Stack

**Content Generation**:
- OpenAI GPT-4 (text generation)
- LlamaIndex MCP (knowledge retrieval)
- Zod (schema validation)

**Approval Workflow**:
- OpenAI Agents SDK (human-in-loop)
- Actions Queue (CEO dashboard integration)

**Distribution**:
- Shopify Blog API
- Twitter API v2
- LinkedIn API
- Email service (TBD)

**Analytics**:
- Google Analytics 4 (traffic)
- Social platform APIs (engagement)
- Shopify (conversions)

---

## Next Steps (After AI Agent Completes)

1. **Implement Blog Generator** (Priority 1)
   - LlamaIndex integration
   - OpenAI generation
   - Brand voice validation
   - CEO approval workflow

2. **Implement Social Generator** (Priority 1)
   - Platform adapters
   - Content derivation from blogs
   - Scheduling system

3. **Implement Email Generator** (Priority 1)
   - Segmentation logic
   - Personalization engine
   - A/B testing framework

4. **Build Distribution System** (Priority 2)
   - Multi-channel publisher
   - Publication queue
   - Error handling

5. **Build Analytics System** (Priority 2)
   - Metric collection
   - Performance dashboards
   - ROI tracking

---

## Success Criteria

**System is successful when**:
- ✅ Generating 100+ content pieces/day
- ✅ CEO approval rate >90%
- ✅ Manual content creation hours: 0
- ✅ Content performance: 2x baseline
- ✅ Full automation: recommendation → generation → approval → publish → measure

**Evidence Required**:
- Git commits for all systems
- Generated content samples
- CEO approval metrics
- Performance analytics
- Scale demonstrations (50+ posts)

---

**Status**: Architecture complete, awaiting AI agent content recommenders to begin implementation

