-- Dashboard Tile Queries (RPC Functions)
-- Priority: P0 - Launch Critical
-- Owner: data
-- Date: 2025-10-15
-- Purpose: Real-time queries for 7 dashboard tiles

-- ============================================================================
-- Tile 1: Revenue (Last 30 Days with Trend)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_revenue_tile()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
  v_current_30d NUMERIC;
  v_previous_30d NUMERIC;
  v_trend_pct NUMERIC;
BEGIN
  -- Current 30 days revenue
  SELECT COALESCE(SUM((value->>'total_revenue')::NUMERIC), 0)
  INTO v_current_30d
  FROM facts
  WHERE topic = 'shopify.sales'
    AND created_at >= NOW() - INTERVAL '30 days';
  
  -- Previous 30 days revenue (for trend)
  SELECT COALESCE(SUM((value->>'total_revenue')::NUMERIC), 0)
  INTO v_previous_30d
  FROM facts
  WHERE topic = 'shopify.sales'
    AND created_at >= NOW() - INTERVAL '60 days'
    AND created_at < NOW() - INTERVAL '30 days';
  
  -- Calculate trend percentage
  IF v_previous_30d > 0 THEN
    v_trend_pct := ROUND(((v_current_30d - v_previous_30d) / v_previous_30d) * 100, 2);
  ELSE
    v_trend_pct := 0;
  END IF;
  
  -- Build result
  v_result := jsonb_build_object(
    'current_30d', v_current_30d,
    'previous_30d', v_previous_30d,
    'trend_pct', v_trend_pct,
    'trend_direction', CASE 
      WHEN v_trend_pct > 0 THEN 'up'
      WHEN v_trend_pct < 0 THEN 'down'
      ELSE 'flat'
    END,
    'last_updated', NOW()
  );
  
  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_revenue_tile TO authenticated, service_role;
COMMENT ON FUNCTION public.get_revenue_tile IS 'Revenue tile: Last 30 days with trend vs previous 30 days';

-- ============================================================================
-- Tile 2: AOV (Average Order Value with Trend)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_aov_tile()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
  v_current_aov NUMERIC;
  v_previous_aov NUMERIC;
  v_trend_pct NUMERIC;
BEGIN
  -- Current 30 days AOV
  SELECT COALESCE(
    SUM((value->>'total_revenue')::NUMERIC) / NULLIF(SUM((value->>'order_count')::NUMERIC), 0),
    0
  )
  INTO v_current_aov
  FROM facts
  WHERE topic = 'shopify.sales'
    AND created_at >= NOW() - INTERVAL '30 days';

  -- Previous 30 days AOV
  SELECT COALESCE(
    SUM((value->>'total_revenue')::NUMERIC) / NULLIF(SUM((value->>'order_count')::NUMERIC), 0),
    0
  )
  INTO v_previous_aov
  FROM facts
  WHERE topic = 'shopify.sales'
    AND created_at >= NOW() - INTERVAL '60 days'
    AND created_at < NOW() - INTERVAL '30 days';

  -- Calculate trend
  IF v_previous_aov > 0 THEN
    v_trend_pct := ROUND(((v_current_aov - v_previous_aov) / v_previous_aov) * 100, 2);
  ELSE
    v_trend_pct := 0;
  END IF;

  v_result := jsonb_build_object(
    'current_aov', ROUND(v_current_aov, 2),
    'previous_aov', ROUND(v_previous_aov, 2),
    'trend_pct', v_trend_pct,
    'trend_direction', CASE
      WHEN v_trend_pct > 0 THEN 'up'
      WHEN v_trend_pct < 0 THEN 'down'
      ELSE 'flat'
    END,
    'last_updated', NOW()
  );

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_aov_tile TO authenticated, service_role;
COMMENT ON FUNCTION public.get_aov_tile IS 'AOV tile: Average order value with trend';

-- ============================================================================
-- Tile 3: Returns (Return Rate with Trend)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_returns_tile()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
  v_current_rate NUMERIC;
  v_previous_rate NUMERIC;
  v_trend_pct NUMERIC;
BEGIN
  -- Current 30 days return rate
  SELECT COALESCE(
    (COUNT(*) FILTER (WHERE value->>'status' = 'returned')::NUMERIC / NULLIF(COUNT(*), 0)) * 100,
    0
  )
  INTO v_current_rate
  FROM facts
  WHERE topic = 'shopify.orders'
    AND created_at >= NOW() - INTERVAL '30 days';

  -- Previous 30 days return rate
  SELECT COALESCE(
    (COUNT(*) FILTER (WHERE value->>'status' = 'returned')::NUMERIC / NULLIF(COUNT(*), 0)) * 100,
    0
  )
  INTO v_previous_rate
  FROM facts
  WHERE topic = 'shopify.orders'
    AND created_at >= NOW() - INTERVAL '60 days'
    AND created_at < NOW() - INTERVAL '30 days';

  -- Calculate trend
  IF v_previous_rate > 0 THEN
    v_trend_pct := ROUND(((v_current_rate - v_previous_rate) / v_previous_rate) * 100, 2);
  ELSE
    v_trend_pct := 0;
  END IF;

  v_result := jsonb_build_object(
    'current_rate_pct', ROUND(v_current_rate, 2),
    'previous_rate_pct', ROUND(v_previous_rate, 2),
    'trend_pct', v_trend_pct,
    'trend_direction', CASE
      WHEN v_trend_pct > 0 THEN 'up'
      WHEN v_trend_pct < 0 THEN 'down'
      ELSE 'flat'
    END,
    'last_updated', NOW()
  );

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_returns_tile TO authenticated, service_role;
COMMENT ON FUNCTION public.get_returns_tile IS 'Returns tile: Return rate with trend';

-- ============================================================================
-- Tile 4: Stock Risk (Products with WOS < 14 days)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_stock_risk_tile()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
  v_critical_count INT;
  v_warning_count INT;
  v_total_products INT;
BEGIN
  -- Count products by risk level based on WOS (Weeks of Stock)
  SELECT
    COUNT(*) FILTER (WHERE (value->>'wos')::NUMERIC < 2) as critical,
    COUNT(*) FILTER (WHERE (value->>'wos')::NUMERIC >= 2 AND (value->>'wos')::NUMERIC < 4) as warning,
    COUNT(*) as total
  INTO v_critical_count, v_warning_count, v_total_products
  FROM facts
  WHERE topic = 'shopify.inventory'
    AND created_at >= NOW() - INTERVAL '1 day'
  ORDER BY created_at DESC
  LIMIT 1000;

  v_result := jsonb_build_object(
    'critical_count', COALESCE(v_critical_count, 0),
    'warning_count', COALESCE(v_warning_count, 0),
    'total_products', COALESCE(v_total_products, 0),
    'risk_level', CASE
      WHEN v_critical_count > 10 THEN 'high'
      WHEN v_critical_count > 5 THEN 'medium'
      ELSE 'low'
    END,
    'last_updated', NOW()
  );

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_stock_risk_tile TO authenticated, service_role;
COMMENT ON FUNCTION public.get_stock_risk_tile IS 'Stock risk tile: Products with low WOS (< 14 days)';

-- ============================================================================
-- Tile 5: SEO Anomalies (Traffic Drops > 20%)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_seo_anomalies_tile()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
  v_anomaly_count INT;
  v_total_pages INT;
BEGIN
  -- Count pages with traffic drops > 20%
  SELECT
    COUNT(*) FILTER (WHERE (value->>'traffic_change_pct')::NUMERIC < -20) as anomalies,
    COUNT(*) as total
  INTO v_anomaly_count, v_total_pages
  FROM facts
  WHERE topic = 'analytics.traffic'
    AND created_at >= NOW() - INTERVAL '7 days';

  v_result := jsonb_build_object(
    'anomaly_count', COALESCE(v_anomaly_count, 0),
    'total_pages', COALESCE(v_total_pages, 0),
    'severity', CASE
      WHEN v_anomaly_count > 10 THEN 'critical'
      WHEN v_anomaly_count > 5 THEN 'warning'
      ELSE 'normal'
    END,
    'last_updated', NOW()
  );

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_seo_anomalies_tile TO authenticated, service_role;
COMMENT ON FUNCTION public.get_seo_anomalies_tile IS 'SEO anomalies tile: Pages with traffic drops > 20%';

-- ============================================================================
-- Tile 6: CX Queue (Pending Conversations)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_cx_queue_tile()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
  v_pending_count INT;
  v_sla_breaches INT;
BEGIN
  -- Count pending conversations and SLA breaches
  SELECT
    COUNT(*) as pending,
    COUNT(*) FILTER (WHERE created_at < NOW() - INTERVAL '15 minutes') as sla_breaches
  INTO v_pending_count, v_sla_breaches
  FROM cx_conversations
  WHERE status = 'pending';

  v_result := jsonb_build_object(
    'pending_count', COALESCE(v_pending_count, 0),
    'sla_breaches', COALESCE(v_sla_breaches, 0),
    'urgency', CASE
      WHEN v_sla_breaches > 5 THEN 'critical'
      WHEN v_sla_breaches > 0 THEN 'warning'
      ELSE 'normal'
    END,
    'last_updated', NOW()
  );

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_cx_queue_tile TO authenticated, service_role;
COMMENT ON FUNCTION public.get_cx_queue_tile IS 'CX queue tile: Pending conversations with SLA tracking';

-- ============================================================================
-- Tile 7: Approvals Queue (Pending Approvals)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_approvals_queue_tile()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
  v_pending_count INT;
  v_by_kind JSONB;
BEGIN
  -- Count pending approvals by kind
  SELECT
    COUNT(*) as total,
    jsonb_object_agg(
      kind,
      count
    ) as by_kind
  INTO v_pending_count, v_by_kind
  FROM (
    SELECT
      kind,
      COUNT(*) as count
    FROM approvals
    WHERE state = 'pending_review'
    GROUP BY kind
  ) subq;

  v_result := jsonb_build_object(
    'pending_count', COALESCE(v_pending_count, 0),
    'by_kind', COALESCE(v_by_kind, '{}'::JSONB),
    'urgency', CASE
      WHEN v_pending_count > 10 THEN 'high'
      WHEN v_pending_count > 5 THEN 'medium'
      ELSE 'low'
    END,
    'last_updated', NOW()
  );

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_approvals_queue_tile TO authenticated, service_role;
COMMENT ON FUNCTION public.get_approvals_queue_tile IS 'Approvals queue tile: Pending approvals by kind';
