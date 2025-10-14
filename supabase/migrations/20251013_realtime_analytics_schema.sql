-- Migration: 20251013_realtime_analytics_schema.sql
-- Description: Real-time analytics dashboard schema for operator insights

-- ============================================================================
-- ANALYTICS AGGREGATION TABLES
-- ============================================================================

-- Hourly order metrics for real-time monitoring
CREATE TABLE IF NOT EXISTS order_metrics_hourly (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hour_start TIMESTAMPTZ NOT NULL,
  total_orders INTEGER NOT NULL DEFAULT 0,
  total_revenue NUMERIC(12,2) NOT NULL DEFAULT 0,
  avg_order_value NUMERIC(10,2),
  orders_fulfilled INTEGER NOT NULL DEFAULT 0,
  orders_pending INTEGER NOT NULL DEFAULT 0,
  orders_cancelled INTEGER NOT NULL DEFAULT 0,
  fulfillment_rate_pct NUMERIC(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(hour_start)
);

CREATE INDEX idx_order_metrics_hourly_hour ON order_metrics_hourly(hour_start DESC);

COMMENT ON TABLE order_metrics_hourly IS 
'Hourly aggregation of order metrics for real-time dashboard monitoring';

-- Customer activity metrics
CREATE TABLE IF NOT EXISTS customer_activity_hourly (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hour_start TIMESTAMPTZ NOT NULL,
  new_customers INTEGER NOT NULL DEFAULT 0,
  active_customers INTEGER NOT NULL DEFAULT 0,
  returning_customers INTEGER NOT NULL DEFAULT 0,
  total_sessions INTEGER NOT NULL DEFAULT 0,
  avg_session_duration_seconds INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(hour_start)
);

CREATE INDEX idx_customer_activity_hourly_hour ON customer_activity_hourly(hour_start DESC);

COMMENT ON TABLE customer_activity_hourly IS
'Hourly customer activity metrics for engagement tracking';

-- Product performance metrics
CREATE TABLE IF NOT EXISTS product_metrics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  product_id TEXT NOT NULL,
  product_title TEXT,
  units_sold INTEGER NOT NULL DEFAULT 0,
  revenue NUMERIC(12,2) NOT NULL DEFAULT 0,
  views INTEGER NOT NULL DEFAULT 0,
  conversion_rate_pct NUMERIC(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(date, product_id)
);

CREATE INDEX idx_product_metrics_daily_date ON product_metrics_daily(date DESC);
CREATE INDEX idx_product_metrics_daily_revenue ON product_metrics_daily(revenue DESC);

COMMENT ON TABLE product_metrics_daily IS
'Daily product performance metrics for inventory and sales analysis';

-- ============================================================================
-- MATERIALIZED VIEWS FOR PERFORMANCE
-- ============================================================================

-- Current day summary (refreshed every 5 minutes)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_today_summary AS
SELECT
  COUNT(*) as total_orders,
  COALESCE(SUM(total_price), 0) as total_revenue,
  COALESCE(AVG(total_price), 0) as avg_order_value,
  COUNT(*) FILTER (WHERE fulfillment_status = 'fulfilled') as orders_fulfilled,
  COUNT(*) FILTER (WHERE fulfillment_status = 'pending') as orders_pending,
  ROUND(
    (COUNT(*) FILTER (WHERE fulfillment_status = 'fulfilled')::NUMERIC / 
     NULLIF(COUNT(*), 0) * 100), 2
  ) as fulfillment_rate_pct,
  MAX(created_at) as last_order_at
FROM conversations
WHERE created_at >= CURRENT_DATE;

CREATE UNIQUE INDEX idx_mv_today_summary ON mv_today_summary ((1));

COMMENT ON MATERIALIZED VIEW mv_today_summary IS
'Real-time summary of today''s orders - refresh every 5 minutes';

-- Last 7 days trend (refreshed hourly)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_week_trend AS
SELECT
  DATE(created_at) as date,
  COUNT(*) as total_orders,
  COALESCE(SUM(total_price), 0) as total_revenue,
  COALESCE(AVG(total_price), 0) as avg_order_value,
  COUNT(*) FILTER (WHERE fulfillment_status = 'fulfilled') as orders_fulfilled
FROM conversations
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

CREATE UNIQUE INDEX idx_mv_week_trend_date ON mv_week_trend(date);

COMMENT ON MATERIALIZED VIEW mv_week_trend IS
'7-day order trend for dashboard charts - refresh hourly';

-- ============================================================================
-- ANALYTICS HELPER FUNCTIONS
-- ============================================================================

-- Function to refresh today's summary
CREATE OR REPLACE FUNCTION refresh_today_summary()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_today_summary;
END;
$$;

COMMENT ON FUNCTION refresh_today_summary() IS
'Refresh today''s summary materialized view - call every 5 minutes';

-- Function to refresh week trend
CREATE OR REPLACE FUNCTION refresh_week_trend()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_week_trend;
END;
$$;

COMMENT ON FUNCTION refresh_week_trend() IS
'Refresh week trend materialized view - call hourly';

-- Function to aggregate hourly order metrics
CREATE OR REPLACE FUNCTION aggregate_hourly_orders(target_hour TIMESTAMPTZ)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_orders INTEGER;
  v_total_revenue NUMERIC(12,2);
  v_avg_order_value NUMERIC(10,2);
  v_orders_fulfilled INTEGER;
  v_orders_pending INTEGER;
  v_orders_cancelled INTEGER;
  v_fulfillment_rate NUMERIC(5,2);
BEGIN
  -- Calculate metrics for the hour
  SELECT
    COUNT(*),
    COALESCE(SUM(total_price), 0),
    COALESCE(AVG(total_price), 0),
    COUNT(*) FILTER (WHERE fulfillment_status = 'fulfilled'),
    COUNT(*) FILTER (WHERE fulfillment_status = 'pending'),
    COUNT(*) FILTER (WHERE fulfillment_status = 'cancelled'),
    ROUND(
      (COUNT(*) FILTER (WHERE fulfillment_status = 'fulfilled')::NUMERIC / 
       NULLIF(COUNT(*), 0) * 100), 2
    )
  INTO
    v_total_orders,
    v_total_revenue,
    v_avg_order_value,
    v_orders_fulfilled,
    v_orders_pending,
    v_orders_cancelled,
    v_fulfillment_rate
  FROM conversations
  WHERE created_at >= target_hour
    AND created_at < target_hour + INTERVAL '1 hour';

  -- Insert or update hourly metrics
  INSERT INTO order_metrics_hourly (
    hour_start,
    total_orders,
    total_revenue,
    avg_order_value,
    orders_fulfilled,
    orders_pending,
    orders_cancelled,
    fulfillment_rate_pct,
    updated_at
  ) VALUES (
    target_hour,
    v_total_orders,
    v_total_revenue,
    v_avg_order_value,
    v_orders_fulfilled,
    v_orders_pending,
    v_orders_cancelled,
    v_fulfillment_rate,
    now()
  )
  ON CONFLICT (hour_start)
  DO UPDATE SET
    total_orders = EXCLUDED.total_orders,
    total_revenue = EXCLUDED.total_revenue,
    avg_order_value = EXCLUDED.avg_order_value,
    orders_fulfilled = EXCLUDED.orders_fulfilled,
    orders_pending = EXCLUDED.orders_pending,
    orders_cancelled = EXCLUDED.orders_cancelled,
    fulfillment_rate_pct = EXCLUDED.fulfillment_rate_pct,
    updated_at = now();
END;
$$;

COMMENT ON FUNCTION aggregate_hourly_orders(TIMESTAMPTZ) IS
'Aggregate order metrics for a specific hour - call hourly via cron';

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Order metrics hourly
ALTER TABLE order_metrics_hourly ENABLE ROW LEVEL SECURITY;

CREATE POLICY "order_metrics_hourly_read_authenticated"
  ON order_metrics_hourly FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "order_metrics_hourly_service_role"
  ON order_metrics_hourly FOR ALL
  TO service_role
  USING (true);

-- Customer activity hourly
ALTER TABLE customer_activity_hourly ENABLE ROW LEVEL SECURITY;

CREATE POLICY "customer_activity_hourly_read_authenticated"
  ON customer_activity_hourly FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "customer_activity_hourly_service_role"
  ON customer_activity_hourly FOR ALL
  TO service_role
  USING (true);

-- Product metrics daily
ALTER TABLE product_metrics_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "product_metrics_daily_read_authenticated"
  ON product_metrics_daily FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "product_metrics_daily_service_role"
  ON product_metrics_daily FOR ALL
  TO service_role
  USING (true);

-- ============================================================================
-- INITIAL DATA POPULATION
-- ============================================================================

-- Populate last 24 hours of hourly metrics
DO $$
DECLARE
  v_hour TIMESTAMPTZ;
BEGIN
  FOR v_hour IN 
    SELECT generate_series(
      date_trunc('hour', now() - INTERVAL '24 hours'),
      date_trunc('hour', now()),
      INTERVAL '1 hour'
    )
  LOOP
    PERFORM aggregate_hourly_orders(v_hour);
  END LOOP;
END $$;

-- Refresh materialized views
SELECT refresh_today_summary();
SELECT refresh_week_trend();
