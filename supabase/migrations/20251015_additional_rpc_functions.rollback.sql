-- Rollback: Additional RPC Functions
-- Date: 2025-10-15

DROP FUNCTION IF EXISTS public.get_seo_anomalies_feed(INTEGER, NUMERIC);
DROP FUNCTION IF EXISTS public.get_ads_performance(INTEGER);
DROP FUNCTION IF EXISTS public.get_content_engagement(INTEGER);
DROP FUNCTION IF EXISTS public.get_approvals_list(TEXT, TEXT, INTEGER);

