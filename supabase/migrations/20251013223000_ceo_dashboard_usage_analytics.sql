-- CEO Dashboard Usage Analytics
-- Date: 2025-10-13
-- Owner: Product Agent
-- Purpose: Track CEO usage of HotDash dashboard for pilot metrics
-- Ref: docs/directions/product.md P2 Priority (Analytics & Roadmap)

-- Table 1: Dashboard Sessions
CREATE TABLE IF NOT EXISTS public.dashboard_sessions (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  user_email TEXT,
  customer_id TEXT NOT NULL DEFAULT 'hot-rodan',
  login_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  logout_at TIMESTAMPTZ,
  session_duration_seconds INTEGER,
  device_type TEXT CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 2: Tile Interactions
CREATE TABLE IF NOT EXISTS public.tile_interactions (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.dashboard_sessions(session_id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  customer_id TEXT NOT NULL DEFAULT 'hot-rodan',
  tile_name TEXT NOT NULL,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('view', 'click', 'expand', 'refresh', 'export')),
  interaction_data JSONB,
  interaction_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 3: Approval Actions
CREATE TABLE IF NOT EXISTS public.approval_actions (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.dashboard_sessions(session_id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  customer_id TEXT NOT NULL DEFAULT 'hot-rodan',
  approval_type TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('approve', 'reject', 'defer', 'edit')),
  approval_data JSONB NOT NULL,
  time_to_decision_seconds INTEGER,
  approved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS dashboard_sessions_user_id_idx 
  ON public.dashboard_sessions (user_id, login_at DESC);

CREATE INDEX IF NOT EXISTS dashboard_sessions_customer_id_idx 
  ON public.dashboard_sessions (customer_id, login_at DESC);

CREATE INDEX IF NOT EXISTS dashboard_sessions_login_at_idx 
  ON public.dashboard_sessions (login_at DESC);

CREATE INDEX IF NOT EXISTS tile_interactions_session_id_idx 
  ON public.tile_interactions (session_id, interaction_at DESC);

CREATE INDEX IF NOT EXISTS tile_interactions_tile_name_idx 
  ON public.tile_interactions (tile_name, interaction_at DESC);

CREATE INDEX IF NOT EXISTS tile_interactions_user_id_idx 
  ON public.tile_interactions (user_id, interaction_at DESC);

CREATE INDEX IF NOT EXISTS approval_actions_session_id_idx 
  ON public.approval_actions (session_id, approved_at DESC);

CREATE INDEX IF NOT EXISTS approval_actions_user_id_idx 
  ON public.approval_actions (user_id, approved_at DESC);

CREATE INDEX IF NOT EXISTS approval_actions_type_idx 
  ON public.approval_actions (approval_type, approved_at DESC);

-- Comments
COMMENT ON TABLE public.dashboard_sessions IS 'CEO dashboard session tracking for usage analytics';
COMMENT ON TABLE public.tile_interactions IS 'Individual tile interaction tracking (views, clicks, refreshes)';
COMMENT ON TABLE public.approval_actions IS 'Approval queue action tracking (approve, reject, defer, edit)';

-- Enable Row Level Security
ALTER TABLE public.dashboard_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tile_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Service role has full access
CREATE POLICY dashboard_sessions_service_role_all
  ON public.dashboard_sessions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY tile_interactions_service_role_all
  ON public.tile_interactions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY approval_actions_service_role_all
  ON public.approval_actions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies: Users can read their own data
CREATE POLICY dashboard_sessions_read_own
  ON public.dashboard_sessions
  FOR SELECT
  TO authenticated
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY tile_interactions_read_own
  ON public.tile_interactions
  FOR SELECT
  TO authenticated
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY approval_actions_read_own
  ON public.approval_actions
  FOR SELECT
  TO authenticated
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Trigger: Update session duration on logout
CREATE OR REPLACE FUNCTION update_session_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.logout_at IS NOT NULL AND OLD.logout_at IS NULL THEN
    NEW.session_duration_seconds := EXTRACT(EPOCH FROM (NEW.logout_at - NEW.login_at))::INTEGER;
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_dashboard_sessions_duration
  BEFORE UPDATE ON public.dashboard_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_session_duration();

-- Analytics View: Daily Usage Summary
CREATE OR REPLACE VIEW v_daily_usage_summary AS
SELECT 
  customer_id,
  user_id,
  DATE(login_at) as usage_date,
  COUNT(DISTINCT session_id) as total_sessions,
  AVG(session_duration_seconds) as avg_session_duration_seconds,
  MIN(login_at) as first_login,
  MAX(login_at) as last_login,
  COUNT(DISTINCT CASE WHEN device_type = 'mobile' THEN session_id END) as mobile_sessions,
  COUNT(DISTINCT CASE WHEN device_type = 'desktop' THEN session_id END) as desktop_sessions
FROM public.dashboard_sessions
WHERE logout_at IS NOT NULL
GROUP BY customer_id, user_id, DATE(login_at);

-- Analytics View: Tile Usage Summary
CREATE OR REPLACE VIEW v_tile_usage_summary AS
SELECT 
  customer_id,
  tile_name,
  DATE(interaction_at) as usage_date,
  COUNT(*) as total_interactions,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT session_id) as unique_sessions,
  COUNT(CASE WHEN interaction_type = 'view' THEN 1 END) as views,
  COUNT(CASE WHEN interaction_type = 'click' THEN 1 END) as clicks,
  COUNT(CASE WHEN interaction_type = 'refresh' THEN 1 END) as refreshes,
  COUNT(CASE WHEN interaction_type = 'export' THEN 1 END) as exports
FROM public.tile_interactions
GROUP BY customer_id, tile_name, DATE(interaction_at);

-- Analytics View: Approval Queue Metrics
CREATE OR REPLACE VIEW v_approval_queue_metrics AS
SELECT 
  customer_id,
  approval_type,
  DATE(approved_at) as approval_date,
  COUNT(*) as total_approvals,
  COUNT(DISTINCT user_id) as unique_approvers,
  COUNT(CASE WHEN action = 'approve' THEN 1 END) as approved_count,
  COUNT(CASE WHEN action = 'reject' THEN 1 END) as rejected_count,
  COUNT(CASE WHEN action = 'defer' THEN 1 END) as deferred_count,
  COUNT(CASE WHEN action = 'edit' THEN 1 END) as edited_count,
  AVG(time_to_decision_seconds) as avg_decision_time_seconds,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY time_to_decision_seconds) as median_decision_time_seconds
FROM public.approval_actions
GROUP BY customer_id, approval_type, DATE(approved_at);

-- Grant permissions
GRANT SELECT ON v_daily_usage_summary TO authenticated, service_role;
GRANT SELECT ON v_tile_usage_summary TO authenticated, service_role;
GRANT SELECT ON v_approval_queue_metrics TO authenticated, service_role;
