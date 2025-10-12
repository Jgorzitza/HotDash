-- Rollback: Chatwoot curated replies schema
-- Removes support_curated_replies table and all related objects

-- Drop indexes first
DROP INDEX IF EXISTS public.support_curated_replies_tags_gin;
DROP INDEX IF EXISTS public.support_curated_replies_created_at_idx;
DROP INDEX IF EXISTS public.support_curated_replies_updated_at_idx;
DROP INDEX IF EXISTS public.support_curated_replies_source_msg_idx;
DROP INDEX IF EXISTS public.support_curated_replies_conversation_idx;
DROP INDEX IF EXISTS public.support_curated_replies_approved_at_idx;

-- Drop RLS policies
DROP POLICY IF EXISTS support_curated_replies_read_all ON public.support_curated_replies;
DROP POLICY IF EXISTS support_curated_replies_service_all ON public.support_curated_replies;
DROP POLICY IF EXISTS support_curated_replies_insert_auth ON public.support_curated_replies;

-- Drop table
DROP TABLE IF EXISTS public.support_curated_replies CASCADE;

