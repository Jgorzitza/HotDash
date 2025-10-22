-- Migration: Create user_preferences table + RLS
-- Description: Add Supabase table for personalization (tile order, visibility, theme, notifications)
-- Date: 2025-10-22
-- Agent: data
-- Task: DATA-104

-- =============================================================================
-- TABLE: user_preferences (User personalization settings)
-- =============================================================================
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User Identification
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_domain TEXT NOT NULL,
  
  -- Dashboard Personalization
  tile_order JSONB DEFAULT '[]', -- Array of tile IDs in preferred order
  tile_visibility JSONB DEFAULT '{}', -- Object with tile_id: boolean visibility
  dashboard_layout TEXT DEFAULT 'default' CHECK (dashboard_layout IN ('default', 'compact', 'expanded', 'custom')),
  
  -- Theme Preferences
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  accent_color TEXT DEFAULT '#0070f3', -- Hex color code
  font_size TEXT DEFAULT 'medium' CHECK (font_size IN ('small', 'medium', 'large')),
  
  -- Notification Preferences
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  sms_notifications BOOLEAN DEFAULT FALSE,
  
  -- Notification Types
  inventory_alerts BOOLEAN DEFAULT TRUE,
  order_alerts BOOLEAN DEFAULT TRUE,
  customer_alerts BOOLEAN DEFAULT TRUE,
  system_alerts BOOLEAN DEFAULT TRUE,
  marketing_alerts BOOLEAN DEFAULT FALSE,
  
  -- Notification Frequency
  notification_frequency TEXT DEFAULT 'immediate' CHECK (notification_frequency IN ('immediate', 'hourly', 'daily', 'weekly')),
  quiet_hours_start TIME DEFAULT '22:00:00',
  quiet_hours_end TIME DEFAULT '08:00:00',
  
  -- Dashboard Settings
  auto_refresh_interval INTEGER DEFAULT 30, -- seconds
  show_advanced_metrics BOOLEAN DEFAULT FALSE,
  show_beta_features BOOLEAN DEFAULT FALSE,
  
  -- Data Display Preferences
  currency_code TEXT DEFAULT 'USD',
  date_format TEXT DEFAULT 'MM/DD/YYYY',
  time_format TEXT DEFAULT '12h' CHECK (time_format IN ('12h', '24h')),
  number_format TEXT DEFAULT 'US' CHECK (number_format IN ('US', 'EU', 'UK')),
  
  -- Accessibility
  high_contrast BOOLEAN DEFAULT FALSE,
  reduced_motion BOOLEAN DEFAULT FALSE,
  screen_reader_optimized BOOLEAN DEFAULT FALSE,
  
  -- Privacy Settings
  data_sharing BOOLEAN DEFAULT TRUE,
  analytics_tracking BOOLEAN DEFAULT TRUE,
  crash_reporting BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure one preference record per user per shop
  UNIQUE(user_id, shop_domain)
);

-- Indexes for user_preferences
CREATE INDEX idx_user_prefs_user ON user_preferences(user_id);
CREATE INDEX idx_user_prefs_shop ON user_preferences(shop_domain);
CREATE INDEX idx_user_prefs_theme ON user_preferences(theme);
CREATE INDEX idx_user_prefs_notifications ON user_preferences(email_notifications, push_notifications);

-- Trigger to update updated_at
CREATE TRIGGER set_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- RLS POLICIES
-- =============================================================================

-- Enable RLS on user_preferences table
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can read their own preferences
CREATE POLICY "user_preferences_read_own"
  ON user_preferences
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy 2: Users can insert their own preferences
CREATE POLICY "user_preferences_insert_own"
  ON user_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update their own preferences
CREATE POLICY "user_preferences_update_own"
  ON user_preferences
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can delete their own preferences
CREATE POLICY "user_preferences_delete_own"
  ON user_preferences
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy 5: Service role has full access (for system operations)
CREATE POLICY "user_preferences_service_role_all"
  ON user_preferences
  FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- =============================================================================
-- FUNCTIONS: User Preferences Management
-- =============================================================================

-- Function to get user preferences with defaults
CREATE OR REPLACE FUNCTION get_user_preferences(
  p_user_id UUID,
  p_shop_domain TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_preferences JSONB;
BEGIN
  -- Get user preferences
  SELECT to_jsonb(up.*) INTO v_preferences
  FROM user_preferences up
  WHERE up.user_id = p_user_id AND up.shop_domain = p_shop_domain;
  
  -- Return preferences or default structure
  IF v_preferences IS NULL THEN
    v_preferences := jsonb_build_object(
      'user_id', p_user_id,
      'shop_domain', p_shop_domain,
      'tile_order', '[]',
      'tile_visibility', '{}',
      'dashboard_layout', 'default',
      'theme', 'light',
      'accent_color', '#0070f3',
      'font_size', 'medium',
      'email_notifications', true,
      'push_notifications', true,
      'sms_notifications', false,
      'inventory_alerts', true,
      'order_alerts', true,
      'customer_alerts', true,
      'system_alerts', true,
      'marketing_alerts', false,
      'notification_frequency', 'immediate',
      'quiet_hours_start', '22:00:00',
      'quiet_hours_end', '08:00:00',
      'auto_refresh_interval', 30,
      'show_advanced_metrics', false,
      'show_beta_features', false,
      'currency_code', 'USD',
      'date_format', 'MM/DD/YYYY',
      'time_format', '12h',
      'number_format', 'US',
      'high_contrast', false,
      'reduced_motion', false,
      'screen_reader_optimized', false,
      'data_sharing', true,
      'analytics_tracking', true,
      'crash_reporting', true
    );
  END IF;
  
  RETURN v_preferences;
END;
$$ LANGUAGE plpgsql;

-- Function to update user preferences
CREATE OR REPLACE FUNCTION update_user_preferences(
  p_user_id UUID,
  p_shop_domain TEXT,
  p_preferences JSONB
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Insert or update user preferences
  INSERT INTO user_preferences (
    user_id, shop_domain,
    tile_order, tile_visibility, dashboard_layout,
    theme, accent_color, font_size,
    email_notifications, push_notifications, sms_notifications,
    inventory_alerts, order_alerts, customer_alerts, system_alerts, marketing_alerts,
    notification_frequency, quiet_hours_start, quiet_hours_end,
    auto_refresh_interval, show_advanced_metrics, show_beta_features,
    currency_code, date_format, time_format, number_format,
    high_contrast, reduced_motion, screen_reader_optimized,
    data_sharing, analytics_tracking, crash_reporting
  ) VALUES (
    p_user_id, p_shop_domain,
    COALESCE(p_preferences->>'tile_order', '[]')::JSONB,
    COALESCE(p_preferences->>'tile_visibility', '{}')::JSONB,
    COALESCE(p_preferences->>'dashboard_layout', 'default'),
    COALESCE(p_preferences->>'theme', 'light'),
    COALESCE(p_preferences->>'accent_color', '#0070f3'),
    COALESCE(p_preferences->>'font_size', 'medium'),
    COALESCE((p_preferences->>'email_notifications')::BOOLEAN, TRUE),
    COALESCE((p_preferences->>'push_notifications')::BOOLEAN, TRUE),
    COALESCE((p_preferences->>'sms_notifications')::BOOLEAN, FALSE),
    COALESCE((p_preferences->>'inventory_alerts')::BOOLEAN, TRUE),
    COALESCE((p_preferences->>'order_alerts')::BOOLEAN, TRUE),
    COALESCE((p_preferences->>'customer_alerts')::BOOLEAN, TRUE),
    COALESCE((p_preferences->>'system_alerts')::BOOLEAN, TRUE),
    COALESCE((p_preferences->>'marketing_alerts')::BOOLEAN, FALSE),
    COALESCE(p_preferences->>'notification_frequency', 'immediate'),
    COALESCE(p_preferences->>'quiet_hours_start', '22:00:00')::TIME,
    COALESCE(p_preferences->>'quiet_hours_end', '08:00:00')::TIME,
    COALESCE((p_preferences->>'auto_refresh_interval')::INTEGER, 30),
    COALESCE((p_preferences->>'show_advanced_metrics')::BOOLEAN, FALSE),
    COALESCE((p_preferences->>'show_beta_features')::BOOLEAN, FALSE),
    COALESCE(p_preferences->>'currency_code', 'USD'),
    COALESCE(p_preferences->>'date_format', 'MM/DD/YYYY'),
    COALESCE(p_preferences->>'time_format', '12h'),
    COALESCE(p_preferences->>'number_format', 'US'),
    COALESCE((p_preferences->>'high_contrast')::BOOLEAN, FALSE),
    COALESCE((p_preferences->>'reduced_motion')::BOOLEAN, FALSE),
    COALESCE((p_preferences->>'screen_reader_optimized')::BOOLEAN, FALSE),
    COALESCE((p_preferences->>'data_sharing')::BOOLEAN, TRUE),
    COALESCE((p_preferences->>'analytics_tracking')::BOOLEAN, TRUE),
    COALESCE((p_preferences->>'crash_reporting')::BOOLEAN, TRUE)
  )
  ON CONFLICT (user_id, shop_domain)
  DO UPDATE SET
    tile_order = EXCLUDED.tile_order,
    tile_visibility = EXCLUDED.tile_visibility,
    dashboard_layout = EXCLUDED.dashboard_layout,
    theme = EXCLUDED.theme,
    accent_color = EXCLUDED.accent_color,
    font_size = EXCLUDED.font_size,
    email_notifications = EXCLUDED.email_notifications,
    push_notifications = EXCLUDED.push_notifications,
    sms_notifications = EXCLUDED.sms_notifications,
    inventory_alerts = EXCLUDED.inventory_alerts,
    order_alerts = EXCLUDED.order_alerts,
    customer_alerts = EXCLUDED.customer_alerts,
    system_alerts = EXCLUDED.system_alerts,
    marketing_alerts = EXCLUDED.marketing_alerts,
    notification_frequency = EXCLUDED.notification_frequency,
    quiet_hours_start = EXCLUDED.quiet_hours_start,
    quiet_hours_end = EXCLUDED.quiet_hours_end,
    auto_refresh_interval = EXCLUDED.auto_refresh_interval,
    show_advanced_metrics = EXCLUDED.show_advanced_metrics,
    show_beta_features = EXCLUDED.show_beta_features,
    currency_code = EXCLUDED.currency_code,
    date_format = EXCLUDED.date_format,
    time_format = EXCLUDED.time_format,
    number_format = EXCLUDED.number_format,
    high_contrast = EXCLUDED.high_contrast,
    reduced_motion = EXCLUDED.reduced_motion,
    screen_reader_optimized = EXCLUDED.screen_reader_optimized,
    data_sharing = EXCLUDED.data_sharing,
    analytics_tracking = EXCLUDED.analytics_tracking,
    crash_reporting = EXCLUDED.crash_reporting,
    updated_at = NOW()
  RETURNING to_jsonb(user_preferences.*) INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- Comments for documentation
-- =============================================================================
COMMENT ON TABLE user_preferences IS 'User personalization settings for dashboard, theme, and notifications';
COMMENT ON COLUMN user_preferences.tile_order IS 'Array of tile IDs in user preferred order';
COMMENT ON COLUMN user_preferences.tile_visibility IS 'Object with tile_id: boolean visibility settings';
COMMENT ON COLUMN user_preferences.dashboard_layout IS 'Dashboard layout preference (default, compact, expanded, custom)';
COMMENT ON COLUMN user_preferences.theme IS 'User theme preference (light, dark, auto)';
COMMENT ON COLUMN user_preferences.notification_frequency IS 'How often to send notifications (immediate, hourly, daily, weekly)';
COMMENT ON COLUMN user_preferences.quiet_hours_start IS 'Start time for quiet hours (no notifications)';
COMMENT ON COLUMN user_preferences.quiet_hours_end IS 'End time for quiet hours (no notifications)';

COMMENT ON FUNCTION get_user_preferences IS 'Gets user preferences with defaults if not set';
COMMENT ON FUNCTION update_user_preferences IS 'Updates user preferences with conflict resolution';
