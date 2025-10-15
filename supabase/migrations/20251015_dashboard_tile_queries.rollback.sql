-- Rollback: Dashboard Tile Queries
-- Date: 2025-10-15

-- Drop all RPC functions
DROP FUNCTION IF EXISTS public.get_revenue_tile();
DROP FUNCTION IF EXISTS public.get_aov_tile();
DROP FUNCTION IF EXISTS public.get_returns_tile();
DROP FUNCTION IF EXISTS public.get_stock_risk_tile();
DROP FUNCTION IF EXISTS public.get_seo_anomalies_tile();
DROP FUNCTION IF EXISTS public.get_cx_queue_tile();
DROP FUNCTION IF EXISTS public.get_approvals_queue_tile();

