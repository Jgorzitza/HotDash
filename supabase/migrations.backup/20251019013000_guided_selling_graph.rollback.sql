-- Rollback for guided selling graph tables
-- Drops graph tables if they exist. Use with caution.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'guided_recommendation_edges'
  ) THEN
    DROP TABLE public.guided_recommendation_edges;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'guided_conflict_rules'
  ) THEN
    DROP TABLE public.guided_conflict_rules;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'guided_kit_bundles'
  ) THEN
    DROP TABLE public.guided_kit_bundles;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'guided_use_case_modifiers'
  ) THEN
    DROP TABLE public.guided_use_case_modifiers;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'guided_vehicle_profiles'
  ) THEN
    DROP TABLE public.guided_vehicle_profiles;
  END IF;
END;
$$;
