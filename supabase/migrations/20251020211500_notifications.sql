-- Notifications & Preferences
-- Task: DATA-NEW-002
-- Date: 2025-10-20
-- Ref: docs/design/notification-system-design.md

-- ============================================================================
-- TABLE: notifications
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('critical','high','medium','low')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_label TEXT,
  action_url TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  project TEXT NOT NULL DEFAULT 'occ'
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_project ON public.notifications(project);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);

COMMENT ON TABLE public.notifications IS 'Operator notifications (toast, banner, browser)';

-- ============================================================================
-- TABLE: notification_preferences
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  browser_notifications BOOLEAN NOT NULL DEFAULT false,
  sound_enabled BOOLEAN NOT NULL DEFAULT false,
  frequency TEXT NOT NULL DEFAULT 'realtime', -- realtime | 5min | hourly
  queue_warnings BOOLEAN NOT NULL DEFAULT true,
  perf_alerts BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  project TEXT NOT NULL DEFAULT 'occ',
  UNIQUE(user_id, project)
);

CREATE INDEX IF NOT EXISTS idx_notification_prefs_user ON public.notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_prefs_project ON public.notification_preferences(project);

COMMENT ON TABLE public.notification_preferences IS 'Per-user notification preferences';

-- ============================================================================
-- Trigger: updated_at for preferences
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- RLS Enable
-- ============================================================================
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policies: notifications
-- ============================================================================
CREATE POLICY notifications_service_role_all
  ON public.notifications FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY notifications_read_by_project
  ON public.notifications FOR SELECT TO authenticated
  USING (project = COALESCE(current_setting('app.current_project', true), auth.jwt() ->> 'project'));

CREATE POLICY notifications_insert_by_project
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (project = COALESCE(current_setting('app.current_project', true), auth.jwt() ->> 'project'));

CREATE POLICY notifications_update_by_project
  ON public.notifications FOR UPDATE TO authenticated
  USING (project = COALESCE(current_setting('app.current_project', true), auth.jwt() ->> 'project'));

-- ============================================================================
-- RLS Policies: notification_preferences
-- ============================================================================
CREATE POLICY notification_preferences_service_role_all
  ON public.notification_preferences FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY notification_preferences_read_by_project
  ON public.notification_preferences FOR SELECT TO authenticated
  USING (project = COALESCE(current_setting('app.current_project', true), auth.jwt() ->> 'project'));

CREATE POLICY notification_preferences_insert_by_project
  ON public.notification_preferences FOR INSERT TO authenticated
  WITH CHECK (project = COALESCE(current_setting('app.current_project', true), auth.jwt() ->> 'project'));

CREATE POLICY notification_preferences_update_by_project
  ON public.notification_preferences FOR UPDATE TO authenticated
  USING (project = COALESCE(current_setting('app.current_project', true), auth.jwt() ->> 'project'));

-- ============================================================================
-- Grants
-- ============================================================================
GRANT SELECT, INSERT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

GRANT SELECT, INSERT, UPDATE ON public.notification_preferences TO authenticated;
GRANT ALL ON public.notification_preferences TO service_role;


