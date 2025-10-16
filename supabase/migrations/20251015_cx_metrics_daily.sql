-- CX Metrics: Daily Aggregation Schema
-- Priority: P0 - Launch Critical
-- Owner: data
-- Date: 2025-10-15
-- Task: 5 - CX Metrics Schema

-- ============================================================================
-- Table: cx_metrics_daily
-- Purpose: Daily aggregation of CX conversation metrics
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.cx_metrics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date DATE NOT NULL,
  shop_domain TEXT NOT NULL DEFAULT 'hotrodan.myshopify.com',
  
  -- Volume metrics
  conversations_total INTEGER NOT NULL DEFAULT 0,
  conversations_new INTEGER NOT NULL DEFAULT 0,
  conversations_resolved INTEGER NOT NULL DEFAULT 0,
  conversations_pending INTEGER NOT NULL DEFAULT 0,
  
  -- Response time metrics
  avg_first_response_minutes NUMERIC(10,2),
  median_first_response_minutes NUMERIC(10,2),
  p95_first_response_minutes NUMERIC(10,2),
  avg_resolution_minutes NUMERIC(10,2),
  median_resolution_minutes NUMERIC(10,2),
  
  -- SLA metrics
  sla_target_minutes INTEGER DEFAULT 120,
  sla_met_count INTEGER DEFAULT 0,
  sla_breached_count INTEGER DEFAULT 0,
  sla_compliance_pct NUMERIC(5,2),
  
  -- Quality metrics
  escalations_count INTEGER DEFAULT 0,
  escalation_rate_pct NUMERIC(5,2),
  avg_messages_per_conversation NUMERIC(5,2),
  
  -- Sentiment distribution
  sentiment_positive_count INTEGER DEFAULT 0,
  sentiment_neutral_count INTEGER DEFAULT 0,
  sentiment_negative_count INTEGER DEFAULT 0,
  sentiment_very_negative_count INTEGER DEFAULT 0,
  
  -- AI metrics (from approval_grades)
  ai_drafted_count INTEGER DEFAULT 0,
  ai_approval_rate_pct NUMERIC(5,2),
  avg_tone_grade NUMERIC(3,2),
  avg_accuracy_grade NUMERIC(3,2),
  avg_policy_grade NUMERIC(3,2),
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT cx_metrics_daily_unique_date UNIQUE (metric_date, shop_domain),
  CONSTRAINT cx_metrics_daily_sla_check CHECK (sla_compliance_pct >= 0 AND sla_compliance_pct <= 100)
);

-- Indexes
CREATE INDEX IF NOT EXISTS cx_metrics_daily_date_idx ON public.cx_metrics_daily (metric_date DESC);
CREATE INDEX IF NOT EXISTS cx_metrics_daily_shop_idx ON public.cx_metrics_daily (shop_domain);
CREATE INDEX IF NOT EXISTS cx_metrics_daily_sla_idx ON public.cx_metrics_daily (sla_compliance_pct) 
  WHERE sla_compliance_pct < 90;

-- Comments
COMMENT ON TABLE public.cx_metrics_daily IS 'Daily aggregation of CX conversation metrics';
COMMENT ON COLUMN public.cx_metrics_daily.metric_date IS 'Date of metrics aggregation';
COMMENT ON COLUMN public.cx_metrics_daily.conversations_total IS 'Total conversations on this date';
COMMENT ON COLUMN public.cx_metrics_daily.avg_first_response_minutes IS 'Average time to first response';
COMMENT ON COLUMN public.cx_metrics_daily.sla_compliance_pct IS 'Percentage of conversations meeting SLA';
COMMENT ON COLUMN public.cx_metrics_daily.ai_drafted_count IS 'Number of AI-drafted replies';
COMMENT ON COLUMN public.cx_metrics_daily.avg_tone_grade IS 'Average tone grade from HITL reviews (1-5)';

-- Trigger for updated_at
CREATE TRIGGER trg_cx_metrics_daily_updated_at
BEFORE UPDATE ON public.cx_metrics_daily
FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ============================================================================
-- RLS Policies
-- ============================================================================

ALTER TABLE public.cx_metrics_daily ENABLE ROW LEVEL SECURITY;

-- Policy 1: Service role full access
CREATE POLICY cx_metrics_daily_service_role
  ON public.cx_metrics_daily
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy 2: Authenticated users can read all
CREATE POLICY cx_metrics_daily_read_all
  ON public.cx_metrics_daily
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy 3: Service role can insert/update
CREATE POLICY cx_metrics_daily_insert_service
  ON public.cx_metrics_daily
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY cx_metrics_daily_update_service
  ON public.cx_metrics_daily
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy 4: No deletes (audit trail)
CREATE POLICY cx_metrics_daily_no_delete
  ON public.cx_metrics_daily
  FOR DELETE
  TO authenticated
  USING (false);

-- ============================================================================
-- Permissions
-- ============================================================================

GRANT SELECT ON public.cx_metrics_daily TO authenticated;
GRANT ALL ON public.cx_metrics_daily TO service_role;

