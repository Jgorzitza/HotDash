-- Rollback for A/B harness tables
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ab_outcomes') THEN
    DROP TABLE public.ab_outcomes;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ab_exposures') THEN
    DROP TABLE public.ab_exposures;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ab_assignments') THEN
    DROP TABLE public.ab_assignments;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ab_arms') THEN
    DROP TABLE public.ab_arms;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ab_experiments') THEN
    DROP TABLE public.ab_experiments;
  END IF;
END;
$$;
