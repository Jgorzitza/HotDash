---
epoch: 2025.10.E1
doc: docs/data/churn_risk_scoring.md
owner: data
last_reviewed: 2025-10-11
expires: 2025-11-11
---

# Customer Churn Risk Scoring

## Overview

ML-based churn prediction using support interaction patterns, agent engagement quality, and conversation sentiment to identify at-risk customers.

## Churn Risk Factors

### 1. Support Interaction Patterns (Weight: 40%)
- High ticket frequency (>3 tickets/month)
- Unresolved issues (pending >7 days)
- Escalation rate (escalated tickets / total tickets)
- Negative sentiment in recent conversations

### 2. Agent Response Quality (Weight: 30%)
- Low approval rates on agent responses
- High human edit rates (agent responses corrected)
- Slow response times (>SLA)
- Unsafe responses flagged

### 3. Resolution Effectiveness (Weight: 20%)
- Average resolution time
- Re-open rate (tickets reopened after resolution)
- Customer satisfaction scores
- First-contact resolution rate

### 4. Engagement Trends (Weight: 10%)
- Declining conversation frequency
- Shorter conversation length
- Fewer positive interactions

## Scoring Model

**Churn Risk Score:** 0-100 (higher = more likely to churn)

```sql
CREATE TABLE customer_churn_risk (
  customer_id TEXT PRIMARY KEY,
  churn_score NUMERIC(5,2) NOT NULL CHECK (churn_score BETWEEN 0 AND 100),
  risk_tier TEXT NOT NULL CHECK (risk_tier IN ('low', 'medium', 'high', 'critical')),
  -- Contributing factors
  support_pattern_score NUMERIC(5,2),
  response_quality_score NUMERIC(5,2),
  resolution_effectiveness_score NUMERIC(5,2),
  engagement_trend_score NUMERIC(5,2),
  -- Supporting metrics
  total_tickets_30d INTEGER,
  unresolved_tickets INTEGER,
  avg_resolution_hours NUMERIC(10,2),
  last_interaction_at TIMESTAMPTZ,
  -- Model metadata
  model_version TEXT,
  scored_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  next_rescore_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '24 hours'
);

CREATE INDEX customer_churn_risk_score_idx ON customer_churn_risk (churn_score DESC);
CREATE INDEX customer_churn_risk_tier_idx ON customer_churn_risk (risk_tier);
CREATE INDEX customer_churn_risk_scored_idx ON customer_churn_risk (scored_at DESC);
```

## Calculation Logic

```sql
CREATE OR REPLACE FUNCTION calculate_churn_risk(p_customer_id TEXT)
RETURNS NUMERIC AS $$
DECLARE
  v_support_score NUMERIC;
  v_quality_score NUMERIC;
  v_resolution_score NUMERIC;
  v_engagement_score NUMERIC;
  v_final_score NUMERIC;
BEGIN
  -- Support pattern score (0-100, higher = worse)
  SELECT 
    LEAST(100, (
      (ticket_count::NUMERIC / 10 * 30) + -- High volume penalty
      (unresolved_count::NUMERIC / ticket_count * 40) + -- Unresolved penalty
      (escalation_count::NUMERIC / ticket_count * 30) -- Escalation penalty
    ))
  INTO v_support_score
  FROM (
    SELECT 
      COUNT(*) as ticket_count,
      COUNT(*) FILTER (WHERE status = 'unresolved') as unresolved_count,
      COUNT(*) FILTER (WHERE escalated = true) as escalation_count
    FROM support_tickets
    WHERE customer_id = p_customer_id
      AND created_at > NOW() - INTERVAL '30 days'
  ) t;
  
  -- Response quality score (based on agent interactions)
  SELECT 
    LEAST(100, (
      ((1 - COALESCE(AVG((rubric->>'overall')::NUMERIC / 5.0), 0.8)) * 60) +
      (COALESCE(AVG(CASE WHEN safe_to_send = false THEN 1 ELSE 0 END), 0) * 40)
    ))
  INTO v_quality_score
  FROM agent_feedback f
  JOIN agent_queries q ON f.conversation_id = q.conversation_id
  WHERE q.conversation_id LIKE '%' || p_customer_id || '%'
    AND f.created_at > NOW() - INTERVAL '30 days';
  
  -- Calculate final weighted score
  v_final_score := (
    COALESCE(v_support_score, 0) * 0.4 +
    COALESCE(v_quality_score, 0) * 0.3 +
    COALESCE(v_resolution_score, 0) * 0.2 +
    COALESCE(v_engagement_score, 0) * 0.1
  );
  
  RETURN ROUND(v_final_score, 2);
END;
$$ LANGUAGE plpgsql;
```

**Status:** Churn scoring framework designed

