-- Rollback: ETL Historical Imports
-- Date: 2025-10-15

DROP VIEW IF EXISTS public.v_recent_etl_jobs;
DROP FUNCTION IF EXISTS public.get_etl_job_status(UUID);
DROP FUNCTION IF EXISTS public.import_historical_cx(JSONB, TEXT);
DROP FUNCTION IF EXISTS public.import_historical_sales(JSONB, TEXT);
DROP TABLE IF EXISTS public.etl_jobs;

