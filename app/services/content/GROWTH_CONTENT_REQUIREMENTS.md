# Growth-Aligned Content Requirements

**Based on**: Product-Led Growth Strategy & Viral Referral Mechanisms  
**Owner**: Marketing Agent  
**Created**: 2025-10-14

---

## Growth Strategy Alignment

### PLG Principles → Content Needs

**1. Free to Start (Open Source)**
- **Content Needed**: Developer-focused technical content
  - GitHub README optimization
  - Quick start guides (value in <5 minutes)
  - API documentation
  - Integration tutorials
  - Open source contribution guides

**2. In-Product Upsells**
- **Content Needed**: Usage-triggered educational content
  - "You're at 4,800/5,000 tickets" → Blog: "Scaling Your Support Team"
  - "Unlock Billing Agent" → Case study: "How Company X saved $50K with Billing Agent"
  - Email campaigns triggered by usage thresholds

**3. Viral Loops**
- **Content Needed**: Shareable, referral-driving content
  - Operator success stories (shareable on LinkedIn)
  - "How I 3x'd my support capacity" (viral potential)
  - Referral program landing pages
  - Case study templates (customers share their wins)

**4. Usage-Driven Expansion**
- **Content Needed**: Upgrade path education
  - Feature comparison content
  - ROI calculators
  - Growth trajectory examples
  - Enterprise feature spotlights

---

## Content Generation by Growth Mechanism

### Mechanism 1: Operator Referrals ($500 credit)

**Content Types to Generate**:

1. **Referral Landing Page** (automated generation)
   - Input: Customer success metrics
   - Output: Personalized referral page with their results
   - Template: "I 3x'd my support capacity with HotDash. You can too!"

2. **LinkedIn Share Posts** (automated from case studies)
   - Input: Customer interview data
   - Output: Platform-optimized social posts
   - Example: "Before HotDash: 50 tickets/day. After: 180 tickets/day. Same team. Here's how..."

3. **Email Referral Campaigns** (triggered by satisfaction scores)
   - Trigger: Customer satisfaction >90%
   - Content: "Love HotDash? Know someone who'd benefit? Refer and get $500"
   - Personalized with their specific wins

**Generation Rules**:
```typescript
const referralContent = {
  trigger: {
    satisfaction_score: { min: 90 },
    usage_days: { min: 30 },
  },
  generate: [
    'personalized_referral_page',
    'linkedin_share_post',
    'email_to_customer',
  ],
  personalization: {
    include_customer_metrics: true,
    include_success_story: true,
    cta: 'Refer a friend → $500 credit',
  },
};
```

---

### Mechanism 2: "Powered by HotDash" Badge

**Content Types to Generate**:

1. **Badge Embed Code** (auto-generated for customers)
   - SVG badge with customer branding
   - One-click embed snippet
   - A/B test: "Powered by" vs "Protected by" vs "Accelerated by"

2. **Badge ROI Content** (convince customers to display it)
   - Blog: "How 'Powered by' Badges Drive Trust and Conversions"
   - Email: "Get 10% off by adding our badge to your support page"
   - Case study: "Company X saw 15% more support satisfaction with badge"

**Generation Rules**:
```typescript
const badgeContent = {
  generate_for: 'high_satisfaction_customers',
  content_types: [
    {
      type: 'email',
      subject: 'Get 10% off: Add HotDash badge to your site',
      includes: ['badge_preview', 'embed_code', 'discount_cta'],
    },
    {
      type: 'blog',
      topic: 'Trust badges and customer confidence',
      angle: 'How transparency builds loyalty',
    },
  ],
};
```

---

### Mechanism 3: Case Study Sharing

**Content Types to Generate**:

1. **Auto-Generated Case Studies** (from customer data)
   - Input: Customer metrics from database
   - Output: Publication-ready case study
   - CEO approval required before customer sees it

2. **Social Share Templates** (make it easy for customers)
   - Pre-written LinkedIn posts with their metrics
   - Twitter threads about their success
   - Instagram quote graphics

3. **Case Study Landing Pages** (SEO-optimized)
   - Generate from approved case study
   - Optimize for "[Industry] + support automation"
   - Include customer testimonial videos (if available)

**Generation Rules**:
```typescript
const caseStudyContent = {
  auto_generate_when: {
    customer_metrics: {
      capacity_increase: { min: '2x' },
      satisfaction_improvement: { min: 10 }, // percentage points
      time_saved: { min: '20 hours/week' },
    },
  },
  output_format: [
    'case_study_draft',  // CEO approves, then customer approves
    'social_share_pack', // LinkedIn, Twitter, Instagram ready
    'seo_landing_page',  // Optimized for organic search
  ],
  incentive: {
    type: '$1000_credit',
    requirement: 'customer_shares_on_social',
  },
};
```

---

### Mechanism 4: Open Source Community

**Content Types to Generate**:

1. **GitHub README Optimization** (auto-updated)
   - Pull latest features from codebase
   - Generate: badges, quick start, API examples
   - Keep fresh (update weekly)

2. **Developer Blog Posts** (technical content)
   - "Building AI Agents with OpenAI SDK"
   - "LlamaIndex RAG for Customer Support"
   - "Human-in-Loop Approval Patterns"
   - Generated from: code commits, architecture docs, MCP tool usage

3. **Contribution Guides** (auto-generated from code)
   - Parse codebase for "good first issue" patterns
   - Generate: setup docs, architecture overview, PR templates

**Generation Rules**:
```typescript
const openSourceContent = {
  automated_updates: {
    github_readme: {
      frequency: 'weekly',
      sections: ['features', 'quick_start', 'api_examples', 'contributors'],
      source: 'codebase + package.json + recent commits',
    },
    developer_blog: {
      trigger: 'major_architecture_change || new_integration',
      generate: 'technical_deep_dive',
      target: 'dev.to + hashnode + medium',
    },
  },
  goal: '1000_github_stars_year_2',
};
```

---

## PLG Metrics → Content Types

### Activation Rate: 70% (first 100 tickets processed)

**Content to Drive Activation**:
- Onboarding email sequence (Days 1, 3, 7)
- In-app tutorials (generated from feature docs)
- "Your first 100 tickets" progress emails
- Quick win showcases

**Generation**:
```typescript
// Auto-generate based on user progress
if (user.tickets_processed < 100) {
  if (days_since_signup === 3 && tickets_processed < 20) {
    generate_email({
      template: 'activation_nudge',
      personalization: {
        tickets_remaining: 100 - tickets_processed,
        estimated_time: calculateTimeToValue(user),
      },
    });
  }
}
```

---

### Time to Value: <24 hours

**Content to Reduce TTV**:
- "5-minute setup guide" (auto-generated from install steps)
- "First conversation handled in <10 minutes" (walkthrough)
- Video tutorials (scripts auto-generated from feature docs)

---

### Free to Paid Conversion: 20% within 12 months

**Content to Drive Conversion**:
- Usage milestone celebrations ("You've processed 5,000 tickets!")
- Upgrade trigger emails ("You're at 95% of free tier")
- ROI calculators (personalized based on their usage)
- Feature comparison (auto-generated: Free vs Pro vs Enterprise)

**Generation**:
```typescript
const conversionContent = {
  trigger_points: [
    { usage: '80%', content: 'approaching_limit_email' },
    { usage: '95%', content: 'urgent_upgrade_reminder' },
    { usage: '100%', content: 'overage_warning_with_upgrade_cta' },
  ],
  personalize: {
    show_cost_savings: true,
    show_roi_calculation: true,
    show_similar_customer_upgrades: true,
  },
};
```

---

### Viral Coefficient: 0.3 (every customer refers 0.3 new customers)

**Content to Increase Viral Coefficient**:
- Success story templates (easy for customers to share)
- "Share your results" one-click posts
- Referral program promotions
- Community highlights (showcase top referrers)

**Generation**:
```typescript
const viralContent = {
  generate_shareable: {
    input: customer_metrics,
    outputs: [
      'linkedin_post',     // "I 3x'd support capacity with HotDash"
      'twitter_thread',    // "How we handle 200 tickets/day with a team of 3"
      'blog_post_draft',   // "Our HotDash success story"
    ],
    make_it_easy: {
      pre_written: true,
      one_click_share: true,
      includes_their_metrics: true,
    },
  },
};
```

---

## Content Calendar (Growth-Driven)

### Week 1-4: Product Launch Content
- Blog: "Introducing HotDash: AI Support with Human Oversight"
- Case studies: 3 pilot customers (auto-generated from metrics)
- Developer content: "Building with OpenAI Agents SDK" (technical)
- Social: Daily product updates and customer wins

### Month 2-3: Activation & Conversion Content
- Email sequences: Onboarding (Days 1, 3, 7, 14, 30)
- Blog series: "Getting to Value in <24 hours"
- Comparison content: HotDash vs Competitors (auto-updated)
- Upgrade content: Feature spotlights, ROI calculators

### Month 4-6: Viral & Referral Content
- Customer success stories (2 per week, auto-generated)
- Referral program content (landing pages, emails, social)
- Open source community content (GitHub, dev blogs, tutorials)
- Badge campaign content (convincing customers to display)

### Ongoing (Automated)
- Weekly: GitHub README updates
- Daily: Social posts from blog content
- Triggered: Upgrade emails, referral prompts, milestone celebrations
- Monthly: Case study pipeline, customer spotlight

---

## Content Generation Priorities (Aligned to Growth)

### P0: Activation Content
Generate content that gets new users to 100 tickets:
- Onboarding emails
- Quick start guides
- Tutorial walkthroughs
- Progress nudges

### P1: Conversion Content
Generate content that drives free-to-paid:
- Usage milestone emails
- Upgrade comparison pages
- ROI calculators
- Feature spotlights

### P2: Viral Content
Generate content that drives referrals:
- Customer success stories
- Shareable social posts
- Referral landing pages
- Case study templates

### P3: Retention Content
Generate content that prevents churn:
- Advanced feature guides
- Power user tips
- Community highlights
- Product roadmap teasers

---

## Success Metrics (Content Performance)

**Activation Content**:
- 70% of readers complete onboarding
- <24 hours average time to value
- 50% click-through on tutorial content

**Conversion Content**:
- 20% free-to-paid conversion (12 months)
- 30% upgrade when shown comparison
- 40% use ROI calculator before upgrading

**Viral Content**:
- 0.3 viral coefficient achieved
- 20% of customers share success stories
- 50% of referrals mention content

**Retention Content**:
- <5% churn rate
- 80% feature adoption (advanced features)
- 60% community engagement

---

## Automation Requirements

**All content generation MUST**:
1. Align to growth metrics (activation, conversion, viral, retention)
2. Be personalized based on user data
3. Be triggered by user behavior or milestones
4. Include CEO approval workflow (needsApproval: true)
5. Track performance metrics (GA + conversion tracking)
6. Learn from CEO edits (improve future generation)

**CEO approval particularly critical for**:
- Customer-facing success stories
- Viral/shareable content (brand reputation)
- Conversion/sales content (messaging consistency)
- Case studies (customer relationships)

---

**Status**: Growth content requirements defined, ready for system implementation

