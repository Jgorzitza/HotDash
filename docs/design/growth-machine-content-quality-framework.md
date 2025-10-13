# Growth Machine Content Quality Framework

**Version:** 1.0.0  
**Owner:** Localization  
**Created:** 2025-10-13  
**Purpose:** Content quality standards for programmatic content generation in growth machine

---

## Overview

This framework ensures all programmatically generated content (recommendations, automated actions, AI-generated copy) maintains Hot Rod AN brand voice, automotive terminology consistency, and professional quality standards.

---

## 1. Content Generation Guidelines

### Programmatic Content Types

**1.1 Recommendation Text**
- Action recommendations shown to operators
- Must be clear, specific, and actionable
- Include rationale and expected impact

**1.2 Automated Publishing Content**
- Product descriptions, SEO meta content
- Blog post titles, social media posts
- Must maintain brand voice

**1.3 AI-Generated Drafts**
- Email responses, support replies
- Must follow Agent Response Copy Guidelines
- Requires human approval before publishing

---

## 2. Automotive Voice in Growth Features

### Brand Voice Application

**Core Principles:**
- Professional operator-to-operator tone
- Subtle automotive metaphors (1-2 per message max)
- Technical competence and efficiency
- Solution-oriented

### Growth-Specific Terms

**Recommendations:**
```
✅ Good: "Boost performance: Optimize this underperforming product page"
✅ Good: "Full speed ahead: Launch this high-converting content"
✅ Good: "Tune-up needed: Update outdated SEO meta descriptions"
```

```
❌ Bad: "You should probably fix this"
❌ Bad: "This might be a good idea to try"
❌ Bad: "Consider looking at this page"
```

**Action Queue Headings:**
```
✅ "Top 10 Actions to Accelerate Growth"
✅ "Priority Actions - Week of [Date]"
✅ "Recommended Actions"
```

**Success Messages:**
```
✅ "Action executed successfully"
✅ "Content published and monitoring started"
✅ "Full speed ahead - changes are live"
```

---

## 3. Content Quality Standards

### Mandatory Checks

**Before Publishing ANY Programmatic Content:**

1. **Grammar & Spelling** - Zero tolerance for errors
2. **Brand Voice** - Matches Hot Rod AN automotive theme
3. **Terminology** - Consistent with GLOSSARY.md
4. **Accuracy** - All data, stats, claims are verified
5. **Clarity** - Operator can understand and act immediately

### Quality Tiers

**Tier 1: Auto-Publish (No Approval Required)**
- SEO meta descriptions from templates
- Product attribute standardization
- Data corrections (SKU formatting, etc.)
- Requires: 95%+ historical accuracy

**Tier 2: Light Review (Quick Approval)**
- Product descriptions from templates
- Blog post titles and summaries
- Social media posts from templates
- Requires: Human approval within 5 minutes

**Tier 3: Full Review (Standard Approval)**
- Custom email responses
- New content templates
- Brand-sensitive content
- Requires: Full human approval process

---

## 4. Programmatic Content Templates

### Template Structure

```markdown
## Template: [NAME]
**Type**: [Tier 1/2/3]
**Use Case**: [When to use]
**Variables**: [Dynamic fields]
**Voice**: [Automotive/Professional/Technical]

### Template:
[Template text with {{variables}}]

### Examples:
✅ Good: [Example 1]
✅ Good: [Example 2]
❌ Bad: [Anti-example]
```

### Core Templates

#### 1. Product Recommendation

**Type**: Tier 2  
**Use Case**: AI recommends optimizing product page  
**Variables**: {{product_name}}, {{metric}}, {{opportunity}}

**Template:**
```
Action: Optimize {{product_name}} product page

Why: {{metric}} performance indicates {{opportunity}}

Expected impact: [conversion/visibility/sales] increase

Evidence: [data source and trend]
```

**Example:**
```
✅ Action: Optimize AN816-06-06BK Adapter product page

Why: SEO performance indicates high search volume, low rankings

Expected impact: 40% visibility increase, 15-20 additional monthly orders

Evidence: GSC data shows 890 monthly searches, currently position 12
```

#### 2. Content Publishing Action

**Type**: Tier 2  
**Use Case**: AI recommends publishing blog post or content  
**Variables**: {{content_type}}, {{topic}}, {{rationale}}

**Template:**
```
Action: Publish {{content_type}} - "{{topic}}"

Why: {{rationale}}

Expected impact: [traffic/engagement/conversions]

Draft: [Link to draft]
```

**Example:**
```
✅ Action: Publish blog post - "Complete Guide to AN Fitting Sizes"

Why: High-value search term (1,200 monthly searches) with low competition

Expected impact: 500+ monthly organic visitors, 50+ product page visits

Draft: [Link]
```

#### 3. SEO Optimization Action

**Type**: Tier 1  
**Use Case**: Programmatic SEO updates  
**Variables**: {{page}}, {{metric}}, {{change}}

**Template:**
```
Action: Update SEO meta - {{page}}

Change: {{change}}

Impact: {{metric}} improvement expected

Auto-publish: {{timestamp}}
```

**Example:**
```
✅ Action: Update SEO meta - /products/an-fittings-6an

Change: Title optimized for "6AN fittings automotive" (180 searches/mo)

Impact: 25-30% CTR improvement expected (GSC data)

Auto-publish: 2025-10-13 14:30 UTC
```

---

## 5. Content Quality Monitoring

### Automated Quality Checks

**Run on ALL programmatic content before publishing:**

```sql
-- Quality Check Query (pseudo-code)
SELECT 
  content_id,
  check_grammar(content),
  check_brand_voice(content),
  check_terminology(content),
  check_clarity_score(content),
  check_automotive_term_usage(content)
FROM generated_content
WHERE published = false;
```

### Quality Metrics

**Track for ALL programmatic content:**
- Grammar errors per 1000 words (target: 0)
- Brand voice score (target: >90%)
- Operator approval rate (target: >85%)
- Edit rate before approval (target: <15%)
- Content effectiveness (conversions/engagement)

### Quality Thresholds

**Auto-Publish Criteria (Tier 1):**
- 0 grammar errors
- 95%+ brand voice score
- 0 terminology inconsistencies
- Historical accuracy >95%
- No brand-sensitive content

**Escalation Triggers:**
- Grammar errors detected → Human review
- Brand voice score <80% → Regenerate content
- Terminology issues → Localization review
- 3+ operator rejections → Disable template

---

## 6. Approval Workflows

### Tier 1: Auto-Publish (No Human Review)

**Criteria:**
- Template tested with 100+ successful publishes
- <2% rejection rate historically
- Non-brand-sensitive content only
- Automated quality checks pass

**Process:**
1. Content generated from template
2. Automated quality checks run
3. All checks pass → Auto-publish
4. Log for post-publish monitoring

### Tier 2: Light Review (Quick Approval)

**Criteria:**
- Template tested with 50+ publishes
- 5-10% rejection rate historically
- Some brand sensitivity

**Process:**
1. Content generated from template
2. Automated quality checks run
3. Present to operator with quality scores
4. Operator approves/rejects/edits (5-min target)
5. Approved → Publish

### Tier 3: Full Review (Standard Approval)

**Criteria:**
- New templates (<50 uses)
- High brand sensitivity
- Custom content (not templated)

**Process:**
1. Content generated or drafted
2. Quality checks run
3. Present to operator with full context
4. Operator reviews carefully
5. May require senior approval
6. Approved → Publish

---

## 7. Automotive Terminology in Growth Features

### Approved Terms for Programmatic Content

**Action Recommendations:**
- "Optimize" / "Tune-up"
- "Boost performance"
- "Accelerate growth"
- "Full speed ahead" (success only)
- "Engine trouble" (errors only)

**Status Messages:**
- "All systems ready"
- "Monitoring active"
- "Performance optimal"
- "Attention needed"

**Metrics:**
- "Performance metrics"
- "Speed to market"
- "Conversion velocity"

### Usage Rules

**DO:**
- ✅ Use 1-2 automotive terms per recommendation
- ✅ Keep terms professional (no "vroom vroom")
- ✅ Match existing UI voice
- ✅ Use consistently across all features

**DON'T:**
- ❌ Overuse automotive metaphors
- ❌ Force automotive terms where they don't fit
- ❌ Use informal car slang
- ❌ Mix metaphors inconsistently

---

## 8. Content Review Process

### Daily Content Audit

**Schedule**: Every morning at 9 AM UTC

**Review:**
1. All Tier 1 auto-published content from previous day
2. Quality metrics dashboard
3. Operator feedback on recommendations
4. Content effectiveness data

**Actions:**
- Flag templates with <85% approval rate
- Update templates based on operator edits
- Escalate quality issues
- Celebrate high-performing content

### Weekly Content Review

**Schedule**: Every Monday at 10 AM UTC

**Review:**
1. Template performance rankings
2. New template proposals
3. Terminology consistency across growth features
4. Quality metric trends

**Actions:**
- Approve new templates for testing
- Update quality thresholds
- Refine automotive voice usage
- Update documentation

### Monthly Content Strategy

**Schedule**: First Monday of each month

**Review:**
1. Overall content quality trends
2. Operator satisfaction with recommendations
3. Content effectiveness (ROI)
4. Competitive analysis

**Actions:**
- Adjust content strategy
- Invest in high-performing content types
- Deprecate low-performing templates
- Update brand voice guidelines

---

## 9. Integration with Existing Standards

### Links to Related Documentation

- **Brand Voice**: `docs/design/agent-response-copy-guidelines.md`
- **Terminology**: `docs/GLOSSARY.md`
- **Automotive Theme**: `app/copy/hot-rodan-strings.ts`
- **Approval Process**: Agent SDK prompts in `app/prompts/agent-sdk/`

### Consistency Requirements

**All programmatic content must align with:**
1. Agent Response Copy Guidelines (voice and tone)
2. Technical Glossary (terminology)
3. Hot Rod AN automotive theme
4. Existing UI copy standards

---

## 10. Success Metrics

### Content Quality KPIs

**Target Metrics:**
- Operator approval rate: >85%
- Content edit rate: <15%
- Grammar error rate: 0 per 1000 words
- Brand voice score: >90%
- Terminology consistency: 100%

**Effectiveness Metrics:**
- Recommendation acceptance rate: >60%
- Auto-published content accuracy: >95%
- Operator time saved: 2+ hours/week
- Content ROI: 3x+ (revenue/cost)

### Monitoring Dashboard

**Real-time metrics:**
- Content generated today
- Auto-publish success rate
- Pending approvals
- Quality check pass rate

**Historical trends:**
- Quality score over time
- Template performance rankings
- Operator satisfaction trend
- Content effectiveness by type

---

## 11. Emergency Procedures

### Quality Issue Detected

**If automated checks fail:**
1. Hold content (do not publish)
2. Alert localization team
3. Review and fix issue
4. Update quality checks if needed

**If operator reports issue:**
1. Immediately review flagged content
2. Unpublish if already live
3. Root cause analysis
4. Update templates/checks
5. Report to manager

### Template Performance Drop

**If template approval rate drops below 70%:**
1. Pause template immediately
2. Review recent rejections
3. Analyze operator feedback
4. Fix template or deprecate
5. Re-test before re-enabling

---

## 12. Future Enhancements

**Phase 1 (Current):**
- Manual template creation
- Basic quality checks
- Simple approval workflows

**Phase 2 (Next Month):**
- AI-generated template suggestions
- Advanced quality scoring (ML)
- A/B testing for templates
- Predictive approval rates

**Phase 3 (Quarter 2):**
- Fully automated template optimization
- Self-improving quality checks
- Multi-variant content testing
- Advanced ROI tracking

---

## Appendix: Quick Reference

### Content Quality Checklist

Before publishing ANY programmatic content:

- [ ] Grammar & spelling checked (0 errors)
- [ ] Brand voice score >90%
- [ ] Terminology consistent with glossary
- [ ] Automotive terms used appropriately (1-2 max)
- [ ] Clear and actionable for operator
- [ ] Data/stats verified
- [ ] Appropriate tier approval obtained
- [ ] Quality metrics logged

### Automotive Voice Quick Guide

**Use These:**
- Optimize, tune-up, boost, accelerate
- Full speed ahead (success)
- Engine trouble (errors)
- All systems ready (status)

**Avoid These:**
- Vroom, rev up, floor it
- Literal car imagery
- Overuse of metaphors
- Inconsistent terminology

---

**Document Owner**: Localization  
**Review Schedule**: Monthly  
**Last Updated**: 2025-10-13  
**Next Review**: 2025-11-13

