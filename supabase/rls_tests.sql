\echo '== RLS contract verification =='
\set ON_ERROR_STOP on

-- Check RLS is enabled on critical tables when they exist.
DO $$
DECLARE
  missing text;
BEGIN
  WITH expected AS (
    SELECT unnest(ARRAY[
      'product_categories',
      'customer_segments',
      'agent_approvals',
      'agent_feedback',
      'agent_queries',
      'programmatic_seo_blueprints',
      'programmatic_seo_generation_runs',
      'programmatic_seo_internal_links',
      'guided_vehicle_profiles',
      'guided_use_case_modifiers',
      'guided_kit_bundles',
      'guided_conflict_rules',
      'guided_recommendation_edges',
      'seo_cwv_opportunities',
      'seo_cwv_backtests',
      'ab_experiments',
      'ab_arms',
      'ab_assignments',
      'ab_exposures',
      'ab_outcomes'
    ]) AS table_name
  ), present AS (
    SELECT e.table_name,
           c.relrowsecurity
    FROM expected e
    JOIN information_schema.tables t
      ON t.table_schema = 'public'
     AND t.table_name = e.table_name
    JOIN pg_class c
      ON c.relname = e.table_name
    JOIN pg_namespace n
      ON n.oid = c.relnamespace
     AND n.nspname = 'public'
  )
  SELECT string_agg(table_name, ', ')
    INTO missing
    FROM present
   WHERE relrowsecurity IS DISTINCT FROM TRUE;

  IF missing IS NOT NULL THEN
    RAISE EXCEPTION 'RLS disabled for tables: %', missing;
  END IF;
END;
$$;

-- Ensure authenticated readers have SELECT policies and service_role has ALL access where tables exist.
DO $$
DECLARE
  missing text;
BEGIN
  WITH expected AS (
    SELECT * FROM (
      VALUES
        ('product_categories', 'public', 'SELECT'),
        ('customer_segments', 'public', 'SELECT'),
        ('agent_approvals', 'authenticated', 'SELECT'),
        ('agent_approvals', 'service_role', 'ALL'),
        ('agent_feedback', 'authenticated', 'SELECT'),
        ('agent_feedback', 'service_role', 'ALL'),
        ('agent_queries', 'authenticated', 'SELECT'),
        ('agent_queries', 'service_role', 'ALL'),
        ('programmatic_seo_blueprints', 'authenticated', 'SELECT'),
        ('programmatic_seo_blueprints', 'service_role', 'ALL'),
        ('programmatic_seo_generation_runs', 'authenticated', 'SELECT'),
        ('programmatic_seo_generation_runs', 'service_role', 'ALL'),
        ('programmatic_seo_internal_links', 'authenticated', 'SELECT'),
        ('programmatic_seo_internal_links', 'service_role', 'ALL'),
        ('guided_vehicle_profiles', 'authenticated', 'SELECT'),
        ('guided_vehicle_profiles', 'service_role', 'ALL'),
        ('guided_use_case_modifiers', 'authenticated', 'SELECT'),
        ('guided_use_case_modifiers', 'service_role', 'ALL'),
        ('guided_kit_bundles', 'authenticated', 'SELECT'),
        ('guided_kit_bundles', 'service_role', 'ALL'),
        ('guided_conflict_rules', 'authenticated', 'SELECT'),
        ('guided_conflict_rules', 'service_role', 'ALL'),
        ('guided_recommendation_edges', 'authenticated', 'SELECT'),
        ('guided_recommendation_edges', 'service_role', 'ALL'),
        ('seo_cwv_opportunities', 'authenticated', 'SELECT'),
        ('seo_cwv_opportunities', 'service_role', 'ALL'),
        ('seo_cwv_backtests', 'authenticated', 'SELECT'),
        ('seo_cwv_backtests', 'service_role', 'ALL'),
        ('ab_experiments', 'authenticated', 'SELECT'),
        ('ab_experiments', 'service_role', 'ALL'),
        ('ab_arms', 'authenticated', 'SELECT'),
        ('ab_arms', 'service_role', 'ALL'),
        ('ab_assignments', 'authenticated', 'SELECT'),
        ('ab_assignments', 'service_role', 'ALL'),
        ('ab_exposures', 'authenticated', 'SELECT'),
        ('ab_exposures', 'service_role', 'ALL'),
        ('ab_outcomes', 'authenticated', 'SELECT'),
        ('ab_outcomes', 'service_role', 'ALL')
    ) AS v(table_name, role_name, cmd)
  ), present AS (
    SELECT e.table_name,
           e.role_name,
           e.cmd,
           EXISTS (
             SELECT 1
             FROM pg_policies p
             WHERE p.schemaname = 'public'
               AND p.tablename = e.table_name
               AND e.role_name = ANY(p.roles)
               AND (
                 p.cmd = e.cmd
                 OR (e.cmd = 'SELECT' AND p.cmd = 'ALL')
               )
           ) AS has_policy
    FROM expected e
    JOIN information_schema.tables t
      ON t.table_schema = 'public'
     AND t.table_name = e.table_name
  )
  SELECT string_agg(format('%s[%s %s]', table_name, role_name, cmd), ', ')
    INTO missing
    FROM present
   WHERE has_policy IS FALSE;

  IF missing IS NOT NULL THEN
    RAISE EXCEPTION 'Missing policy coverage: %', missing;
  END IF;
END;
$$;

-- Confirm inventory sample data covers multiple tenants when inventory_products exists.
DO $$
DECLARE
  tenant_count int;
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'inventory_products'
  ) THEN
    SELECT COUNT(DISTINCT shop_domain)
      INTO tenant_count
      FROM public.inventory_products;

    IF tenant_count < 2 THEN
      RAISE EXCEPTION 'inventory_products lacks multi-tenant coverage (found %)', tenant_count;
    END IF;
  END IF;
END;
$$;

\echo 'RLS contract verification complete.'
