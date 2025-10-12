-- ================================================================
-- Audit Trail & Decision Logging Queries
-- P0 Task 1: Comprehensive audit trail for Hot Rod AN
-- Created: 2025-10-12
-- ================================================================

-- 1. Audit Queries: Who approved what, when
-- ================================================================

-- Query: Recent approvals/rejections (last 30 days)
CREATE OR REPLACE VIEW v_recent_decisions AS
SELECT 
  id,
  scope,
  actor,
  action,
  rationale,
  "evidenceUrl" as evidence_url,
  "shopDomain" as shop_domain,
  "externalRef" as external_ref,
  payload,
  "createdAt" as created_at
FROM public."DecisionLog"
WHERE "createdAt" >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY "createdAt" DESC;

COMMENT ON VIEW v_recent_decisions IS 'Recent decisions (last 30 days) with full audit trail';

-- Query: Decisions by actor (operator performance)
CREATE OR REPLACE VIEW v_decisions_by_actor AS
SELECT 
  actor,
  scope,
  action,
  COUNT(*) as decision_count,
  COUNT(CASE WHEN action = 'approved' THEN 1 END) as approvals_count,
  COUNT(CASE WHEN action = 'rejected' THEN 1 END) as rejections_count,
  MIN("createdAt") as first_decision_at,
  MAX("createdAt") as last_decision_at
FROM public."DecisionLog"
GROUP BY actor, scope, action
ORDER BY decision_count DESC;

COMMENT ON VIEW v_decisions_by_actor IS 'Operator decision statistics for performance tracking';

-- Query: Decisions by scope (where are decisions happening)
CREATE OR REPLACE VIEW v_decisions_by_scope AS
SELECT 
  scope,
  COUNT(*) as total_decisions,
  COUNT(DISTINCT actor) as unique_actors,
  COUNT(DISTINCT "shopDomain") as unique_shops,
  MIN("createdAt") as first_decision_at,
  MAX("createdAt") as last_decision_at
FROM public."DecisionLog"
GROUP BY scope
ORDER BY total_decisions DESC;

COMMENT ON VIEW v_decisions_by_scope IS 'Decision distribution across scopes (sales, inventory, cx, etc.)';

-- Query: Audit trail for specific shop
CREATE OR REPLACE FUNCTION get_shop_audit_trail(shop_domain TEXT)
RETURNS TABLE (
  id INTEGER,
  created_at TIMESTAMP,
  actor TEXT,
  action TEXT,
  scope TEXT,
  rationale TEXT,
  evidence_url TEXT,
  external_ref TEXT,
  payload JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dl.id,
    dl."createdAt",
    dl.actor,
    dl.action,
    dl.scope,
    dl.rationale,
    dl."evidenceUrl",
    dl."externalRef",
    dl.payload
  FROM public."DecisionLog" dl
  WHERE dl."shopDomain" = shop_domain
  ORDER BY dl."createdAt" DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_shop_audit_trail IS 'Get complete audit trail for a specific shop';

-- 2. Audit Retention: 180-day automatic cleanup
-- ================================================================

-- Create function to archive old audit logs
CREATE OR REPLACE FUNCTION archive_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete decision logs older than 180 days
  DELETE FROM public."DecisionLog"
  WHERE "createdAt" < CURRENT_DATE - INTERVAL '180 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION archive_old_audit_logs IS 'Archives audit logs older than 180 days (compliance requirement)';

-- Schedule daily cleanup at 2 AM UTC (requires pg_cron extension)
-- Note: This will be scheduled via Supabase dashboard or CLI
-- SELECT cron.schedule(
--   'audit-log-cleanup',
--   '0 2 * * *',  -- Daily at 2 AM UTC
--   $$ SELECT archive_old_audit_logs(); $$
-- );

-- 3. Audit Export Functionality
-- ================================================================

-- View: Export-ready audit data (CSV/JSON format)
CREATE OR REPLACE VIEW v_audit_export AS
SELECT 
  id,
  scope,
  actor,
  action,
  rationale,
  "evidenceUrl" as evidence_url,
  "shopDomain" as shop_domain,
  "externalRef" as external_ref,
  payload::TEXT as payload_json,
  "createdAt" as created_at,
  EXTRACT(EPOCH FROM "createdAt")::BIGINT as created_at_unix
FROM public."DecisionLog"
ORDER BY "createdAt" DESC;

COMMENT ON VIEW v_audit_export IS 'Export-ready audit data with Unix timestamps for external systems';

-- Function: Export audit logs for date range
CREATE OR REPLACE FUNCTION export_audit_logs(
  start_date DATE,
  end_date DATE
)
RETURNS TABLE (
  id INTEGER,
  scope TEXT,
  actor TEXT,
  action TEXT,
  rationale TEXT,
  evidence_url TEXT,
  shop_domain TEXT,
  external_ref TEXT,
  payload_json TEXT,
  created_at TIMESTAMP,
  created_at_unix BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dl.id,
    dl.scope,
    dl.actor,
    dl.action,
    dl.rationale,
    dl."evidenceUrl",
    dl."shopDomain",
    dl."externalRef",
    dl.payload::TEXT,
    dl."createdAt",
    EXTRACT(EPOCH FROM dl."createdAt")::BIGINT
  FROM public."DecisionLog" dl
  WHERE dl."createdAt"::DATE BETWEEN start_date AND end_date
  ORDER BY dl."createdAt" DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION export_audit_logs IS 'Export audit logs for a specific date range (for compliance exports)';

-- 4. Audit Quality Checks
-- ================================================================

-- View: Audit data completeness
CREATE OR REPLACE VIEW v_audit_quality_checks AS
SELECT 
  'Missing Rationale' as check_name,
  COUNT(*) as issue_count,
  ARRAY_AGG(id ORDER BY "createdAt" DESC) FILTER (WHERE rationale IS NULL OR rationale = '') as affected_ids
FROM public."DecisionLog"
WHERE rationale IS NULL OR rationale = ''
UNION ALL
SELECT 
  'Missing Actor' as check_name,
  COUNT(*) as issue_count,
  ARRAY_AGG(id ORDER BY "createdAt" DESC) FILTER (WHERE actor IS NULL OR actor = '')
FROM public."DecisionLog"
WHERE actor IS NULL OR actor = ''
UNION ALL
SELECT 
  'Missing Scope' as check_name,
  COUNT(*) as issue_count,
  ARRAY_AGG(id ORDER BY "createdAt" DESC) FILTER (WHERE scope IS NULL OR scope = '')
FROM public."DecisionLog"
WHERE scope IS NULL OR scope = ''
UNION ALL
SELECT 
  'Missing Evidence URL' as check_name,
  COUNT(*) as issue_count,
  ARRAY_AGG(id ORDER BY "createdAt" DESC) FILTER (WHERE "evidenceUrl" IS NULL OR "evidenceUrl" = '')
FROM public."DecisionLog"
WHERE "evidenceUrl" IS NULL OR "evidenceUrl" = '';

COMMENT ON VIEW v_audit_quality_checks IS 'Data quality monitoring for audit trail completeness';

-- 5. Audit Statistics Dashboard
-- ================================================================

CREATE OR REPLACE VIEW v_audit_stats_7d AS
SELECT 
  COUNT(*) as total_decisions_7d,
  COUNT(DISTINCT actor) as unique_actors_7d,
  COUNT(DISTINCT scope) as unique_scopes_7d,
  COUNT(DISTINCT "shopDomain") as unique_shops_7d,
  COUNT(CASE WHEN action = 'approved' THEN 1 END) as approvals_7d,
  COUNT(CASE WHEN action = 'rejected' THEN 1 END) as rejections_7d,
  ROUND(
    COUNT(CASE WHEN action = 'approved' THEN 1 END)::NUMERIC / 
    NULLIF(COUNT(*), 0) * 100, 
    2
  ) as approval_rate_pct_7d,
  MIN("createdAt") as earliest_decision_7d,
  MAX("createdAt") as latest_decision_7d
FROM public."DecisionLog"
WHERE "createdAt" >= CURRENT_DATE - INTERVAL '7 days';

COMMENT ON VIEW v_audit_stats_7d IS '7-day audit statistics for dashboard display';

-- ================================================================
-- RLS Policies for Audit Trail
-- ================================================================

-- Enable RLS on DecisionLog (if not already enabled)
-- Note: Table already has RLS enabled per schema

-- Verify existing policies
-- Operators should have read-only access to audit trail
-- Service role should have full access

-- ================================================================
-- Migration Complete
-- ================================================================

-- Verify all views created
SELECT 
  schemaname,
  viewname,
  viewowner,
  definition IS NOT NULL as has_definition
FROM pg_views
WHERE viewname LIKE 'v_audit_%' OR viewname LIKE 'v_recent_decisions' OR viewname LIKE 'v_decisions_by_%'
ORDER BY viewname;

