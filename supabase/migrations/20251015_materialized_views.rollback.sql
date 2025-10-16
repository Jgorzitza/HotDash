-- Rollback: Materialized Views
-- Date: 2025-10-15

DROP FUNCTION IF EXISTS public.refresh_all_materialized_views();
DROP MATERIALIZED VIEW IF EXISTS public.mv_seo_anomalies_summary;
DROP MATERIALIZED VIEW IF EXISTS public.mv_cx_performance_summary;
DROP MATERIALIZED VIEW IF EXISTS public.mv_inventory_alerts;
DROP MATERIALIZED VIEW IF EXISTS public.mv_revenue_trends_30d;

