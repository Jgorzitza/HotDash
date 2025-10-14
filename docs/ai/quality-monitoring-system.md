# Agent Response Quality Monitoring System

**Version**: 1.0.0  
**Created**: 2025-10-14T12:50:00Z  
**Owner**: AI Agent  
**Status**: Design Complete, Ready for Implementation

## Overview

Automated system for monitoring and scoring AI agent response quality using multiple metrics including BLEU, ROUGE, human approval rates, and custom Hot Rod AN quality criteria.

## Quality Metrics

### 1. BLEU Score (Translation Quality)
**Purpose**: Measure how similar agent response is to human-approved responses

**Calculation**:
- Compare n-grams in agent draft vs human-edited version
- Score range: 0.0 (completely different) to 1.0 (identical)
- Target: >0.3 for acceptable quality

**Implementation**:
```javascript
function calculateBLEU(draft, humanVersion) {
  // Using n-gram precision (unigrams, bigrams, trigrams)
  // Brevity penalty for too-short responses
  // Standard BLEU-4 implementation
  return bleuScore; // 0.0-1.0
}
```

### 2. ROUGE-L Score (Summary Quality)
**Purpose**: Measure recall and precision of key information

**Calculation**:
- Longest Common Subsequence between draft and approved
- F1 score of recall and precision
- Score range: 0.0 to 1.0
- Target: >0.4 for good quality

**Implementation**:
```javascript
function calculateROUGE_L(draft, humanVersion) {
  // Find longest common subsequence
  // Calculate recall = LCS / len(human)
  // Calculate precision = LCS / len(draft)
  // F1 = 2 * (precision * recall) / (precision + recall)
  return rougeScore; // 0.0-1.0
}
```

### 3. Human Approval Rate
**Purpose**: Track operator acceptance of agent responses

**Calculation**:
```sql
SELECT 
  COUNT(CASE WHEN status = 'approved' THEN 1 END)::float / COUNT(*) as approval_rate,
  COUNT(CASE WHEN status = 'edited' THEN 1 END)::float / COUNT(*) as edit_rate,
  COUNT(CASE WHEN status = 'rejected' THEN 1 END)::float / COUNT(*) as rejection_rate
FROM agent_approvals
WHERE created_at >= NOW() - INTERVAL '7 days';
```

**Targets**:
- Approval rate: >85%
- Edit rate: <30%
- Rejection rate: <10%

### 4. Brand Voice Compliance
**Purpose**: Ensure responses match Hot Rod AN personality

**Scoring Criteria**:
- ✅ Uses conversational language (+10 points)
- ✅ Includes signature phrases ("Let's get this sorted") (+5 points)
- ✅ References customer's build/project (+10 points)
- ✅ Avoids corporate jargon (+10 points)
- ✅ Shows enthusiasm (+5 points)
- ✅ Ends with engaging question or sign-off (+5 points)
- ❌ Uses forbidden phrases ("per our policy") (-20 points)
- ❌ Too formal/stiff (-10 points)
- ❌ Doesn't personalize (-10 points)

**Calculation**:
```javascript
function scoreBrandVoice(response) {
  let score = 50; // baseline
  
  // Check for signature phrases
  const signatures = ["let's get", "i'd be stoked", "perfect for your build"];
  if (signatures.some(phrase => response.toLowerCase().includes(phrase))) score += 10;
  
  // Check for forbidden corporate language
  const forbidden = ["per our policy", "unfortunately", "we apologize for"];
  if (forbidden.some(phrase => response.toLowerCase().includes(phrase))) score -= 20;
  
  // Check for personalization
  if (response.includes("your build") || response.includes("your setup")) score += 10;
  
  return Math.min(100, Math.max(0, score));
}
```

### 5. Response Completeness
**Purpose**: Verify all customer questions answered

**Scoring**:
- Extract questions from customer message
- Check if draft addresses each question
- Score = questions_answered / total_questions

**Target**: >90% completeness

## Real-Time Dashboard

### Metrics Display (Live Updates)

```
┌─────────────────────────────────────────────┐
│   Agent Response Quality - Last 24 Hours    │
├─────────────────────────────────────────────┤
│ Queries Processed:        247               │
│ Approval Rate:            87.4%  ✅         │
│ Avg BLEU Score:           0.42   ✅         │
│ Avg ROUGE-L Score:        0.51   ✅         │
│ Brand Voice Score:        78/100 ⚠️         │
│ Avg Response Time:        342ms  ✅         │
│ Knowledge Coverage:       94.3%  ✅         │
└─────────────────────────────────────────────┘

Recent Alerts:
⚠️  Brand voice score declining (85→78) last 6 hours
✅ Response time within target
✅ Approval rate above threshold
```

### Charts to Include
1. **Approval Rate Trend** (line chart, 7-day rolling)
2. **Quality Scores Distribution** (histogram)
3. **Response Time P95** (line chart)
4. **Top Rejection Reasons** (bar chart)
5. **Edit Patterns** (word cloud or category breakdown)

## Automated Alerts

### Critical Alerts (Immediate Action)
🚨 **Approval Rate <70% for 2 hours**
- Notify: AI agent, Manager
- Action: Review recent responses, check for prompt drift
- SLA: 1 hour response

🚨 **Service Error Rate >10%**
- Notify: Engineer, AI agent
- Action: Check MCP health, review error logs
- SLA: 30 minutes response

### Warning Alerts (4-Hour Response)
⚠️ **BLEU Score <0.25 for 24 hours**
- Notify: AI agent
- Action: Analyze operator edits, update prompts
- SLA: Next business day

⚠️ **Response Time P95 >1s**
- Notify: AI agent, Engineer
- Action: Optimize queries, check MCP performance
- SLA: 4 hours

### Info Alerts (Daily Review)
ℹ️ **New query pattern detected**
- Notify: AI agent
- Action: Review for knowledge gaps
- SLA: Weekly review

ℹ️ **Brand voice variance >15%**
- Notify: AI agent
- Action: Review responses, update guidelines
- SLA: Weekly review

## Quality Thresholds

### Green Zone (Healthy Operation)
- Approval rate: >85%
- BLEU score: >0.35
- ROUGE-L score: >0.45
- Brand voice: >75/100
- Response time: <500ms P95
- Edit rate: <25%

### Yellow Zone (Needs Attention)
- Approval rate: 70-85%
- BLEU score: 0.25-0.35
- ROUGE-L score: 0.35-0.45
- Brand voice: 60-75/100
- Response time: 500ms-1s P95
- Edit rate: 25-40%

### Red Zone (Immediate Action Required)
- Approval rate: <70%
- BLEU score: <0.25
- ROUGE-L score: <0.35
- Brand voice: <60/100
- Response time: >1s P95
- Edit rate: >40%

## Implementation Plan

### Phase 1: Data Collection (Week 1-2)
- Capture all agent responses
- Store operator edits
- Log approval decisions
- Gather baseline metrics

### Phase 2: Metric Calculation (Week 3)
- Implement BLEU calculation
- Implement ROUGE calculation
- Build brand voice scorer
- Create completeness checker

### Phase 3: Dashboard Creation (Week 4)
- Real-time metrics display
- Trend charts
- Alert configuration
- Automated reports

### Phase 4: Continuous Optimization (Ongoing)
- Weekly quality reviews
- Monthly prompt updates
- Quarterly comprehensive analysis
- A/B testing framework

## Database Schema

### quality_metrics Table
```sql
CREATE TABLE agent_quality_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  approval_id UUID REFERENCES agent_approvals(id),
  
  -- Scores
  bleu_score NUMERIC(4,3),
  rouge_l_score NUMERIC(4,3),
  brand_voice_score INTEGER CHECK (brand_voice_score BETWEEN 0 AND 100),
  completeness_score NUMERIC(4,3),
  
  -- Operator actions
  was_edited BOOLEAN DEFAULT false,
  edit_distance INTEGER,
  was_approved BOOLEAN,
  
  -- Performance
  latency_ms INTEGER,
  knowledge_sources_count INTEGER,
  
  -- Meta
  calculated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_quality_metrics_approval ON agent_quality_metrics(approval_id);
CREATE INDEX idx_quality_metrics_date ON agent_quality_metrics(created_at);
```

### quality_alerts Table
```sql
CREATE TABLE agent_quality_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT CHECK (alert_type IN ('critical', 'warning', 'info')),
  metric_name TEXT,
  current_value NUMERIC,
  threshold_value NUMERIC,
  duration_minutes INTEGER,
  message TEXT,
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_by BIGINT,
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

## Reporting

### Daily Quality Report (Auto-Generated)
```markdown
# Agent Quality Report - 2025-10-14

## Summary
- Queries: 247
- Approval Rate: 87.4% ✅
- Avg BLEU: 0.42 ✅
- Avg ROUGE-L: 0.51 ✅
- Brand Voice: 78/100 ⚠️

## Top Performing Queries
1. Shipping questions (95% approval)
2. Product sizing (92% approval)
3. Order status (91% approval)

## Needs Improvement
1. Complex technical questions (72% approval) - add more KB content
2. Custom build requests (68% approval) - need better prompts
3. Returns processing (75% approval) - simplify language

## Actions Taken
- Updated prompts for custom builds
- Added 3 new KB articles
- Refined brand voice examples

## Recommended Next Steps
1. A/B test new custom build prompt
2. Monitor returns responses for 48h
3. Schedule prompt review for Friday
```

### Weekly Trend Report
- 7-day quality metrics chart
- Week-over-week comparisons
- Significant changes highlighted
- Recommended actions prioritized

### Monthly Executive Summary
- Business impact (time saved, cost reduction)
- Quality trend lines
- Strategic recommendations
- ROI analysis

## Testing & Validation

### Pre-Deployment Testing
1. Test BLEU calculation with sample data
2. Verify ROUGE implementation accuracy
3. Validate brand voice scorer
4. Confirm alert thresholds trigger correctly
5. Test dashboard refresh rates

### Ongoing Validation
- Weekly spot-check metric calculations
- Monthly audit of quality scores vs human perception
- Quarterly recalibration of thresholds

## Success Criteria

**Week 4**:
- ✅ All metrics collecting correctly
- ✅ Dashboard operational
- ✅ Alerts firing appropriately

**Week 8**:
- ✅ Approval rate >85%
- ✅ Quality scores trending up
- ✅ Zero critical alerts

**Week 12**:
- ✅ Sustainable >90% approval
- ✅ Autonomous operation (minimal manual intervention)
- ✅ Documented ROI

**Status**: Design complete, ready for Engineer to implement

