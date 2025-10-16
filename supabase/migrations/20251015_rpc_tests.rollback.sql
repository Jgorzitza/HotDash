-- Rollback: RPC Test Harness
-- Date: 2025-10-15

DROP VIEW IF EXISTS public.v_latest_test_results;
DROP FUNCTION IF EXISTS public.run_all_rpc_tests();
DROP FUNCTION IF EXISTS public.run_rpc_test(TEXT, TEXT, JSONB, TEXT[]);
DROP TABLE IF EXISTS public.rpc_test_results;

