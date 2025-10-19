-- RPC Function: Get Pending Content Approvals
-- Returns all content approvals awaiting CEO review
-- Author: content agent
-- Date: 2025-10-19

CREATE OR REPLACE FUNCTION public.content_get_pending_approvals()
RETURNS TABLE (
  id UUID,
  summary TEXT,
  platform TEXT,
  post_text TEXT,
  target_engagement_rate DECIMAL,
  created_at TIMESTAMPTZ,
  evidence JSONB,
  tone_check JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ca.id,
    ca.summary,
    (ca.post_draft->>'platform')::TEXT AS platform,
    (ca.post_draft->'content'->>'text')::TEXT AS post_text,
    ((ca.projected_impact->>'engagement_rate')::DECIMAL) AS target_engagement_rate,
    ca.created_at,
    ca.evidence,
    ca.tone_check
  FROM public.content_approvals ca
  WHERE ca.state = 'pending_review'
  ORDER BY ca.created_at ASC;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.content_get_pending_approvals() TO authenticated;

COMMENT ON FUNCTION public.content_get_pending_approvals() IS 'Fetch all content approvals waiting for CEO review';

