-- Migration: Create notifications table + RLS
-- Description: Add notifications table with read/unread and priority levels
-- Date: 2025-10-22
-- Agent: data
-- Task: DATA-105

-- =============================================================================
-- TABLE: notifications (User notifications system)
-- =============================================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User Identification
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_domain TEXT NOT NULL,
  
  -- Notification Content
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL DEFAULT 'info' CHECK (notification_type IN ('info', 'warning', 'error', 'success', 'urgent')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  
  -- Notification Status
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  
  -- Action Information
  action_url TEXT, -- URL to navigate to when notification is clicked
  action_text TEXT, -- Text for action button (e.g., "View Order", "Approve Request")
  action_data JSONB DEFAULT '{}', -- Additional data for the action
  
  -- Source Information
  source_type TEXT, -- 'system', 'inventory', 'orders', 'customers', 'marketing', 'approvals'
  source_id TEXT, -- ID of the source entity (order_id, product_id, etc.)
  source_reference TEXT, -- Human-readable reference (order number, product name, etc.)
  
  -- Notification Channels
  email_sent BOOLEAN DEFAULT FALSE,
  push_sent BOOLEAN DEFAULT FALSE,
  sms_sent BOOLEAN DEFAULT FALSE,
  
  -- Delivery Information
  email_sent_at TIMESTAMPTZ,
  push_sent_at TIMESTAMPTZ,
  sms_sent_at TIMESTAMPTZ,
  
  -- Expiration
  expires_at TIMESTAMPTZ,
  
  -- Metadata
  tags JSONB DEFAULT '[]', -- Array of tags for filtering/categorization
  metadata JSONB DEFAULT '{}', -- Additional metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_shop ON notifications(shop_domain);
CREATE INDEX idx_notifications_type ON notifications(notification_type);
CREATE INDEX idx_notifications_priority ON notifications(priority);
CREATE INDEX idx_notifications_read ON notifications(is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_archived ON notifications(is_archived) WHERE is_archived = FALSE;
CREATE INDEX idx_notifications_source ON notifications(source_type, source_id);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX idx_notifications_expires ON notifications(expires_at) WHERE expires_at IS NOT NULL;

-- Trigger to update updated_at
CREATE TRIGGER set_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- RLS POLICIES
-- =============================================================================

-- Enable RLS on notifications table
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can read their own notifications
CREATE POLICY "notifications_read_own"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy 2: Users can insert their own notifications (for testing/admin)
CREATE POLICY "notifications_insert_own"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update their own notifications (mark as read, archive)
CREATE POLICY "notifications_update_own"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can delete their own notifications
CREATE POLICY "notifications_delete_own"
  ON notifications
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy 5: Service role has full access (for system operations)
CREATE POLICY "notifications_service_role_all"
  ON notifications
  FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- Policy 6: Operators can read all notifications (for admin purposes)
CREATE POLICY "notifications_read_operators"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' IN ('operator', 'admin'));

-- =============================================================================
-- FUNCTIONS: Notification Management
-- =============================================================================

-- Function to get user notifications with filtering
CREATE OR REPLACE FUNCTION get_user_notifications(
  p_user_id UUID,
  p_shop_domain TEXT,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0,
  p_unread_only BOOLEAN DEFAULT FALSE,
  p_notification_type TEXT DEFAULT NULL,
  p_priority TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_notifications JSONB;
  v_total_count INTEGER;
BEGIN
  -- Get total count
  SELECT COUNT(*) INTO v_total_count
  FROM notifications
  WHERE user_id = p_user_id 
    AND shop_domain = p_shop_domain
    AND (p_unread_only = FALSE OR is_read = FALSE)
    AND (p_notification_type IS NULL OR notification_type = p_notification_type)
    AND (p_priority IS NULL OR priority = p_priority)
    AND is_archived = FALSE
    AND (expires_at IS NULL OR expires_at > NOW());
  
  -- Get notifications
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', id,
      'title', title,
      'message', message,
      'notification_type', notification_type,
      'priority', priority,
      'is_read', is_read,
      'is_archived', is_archived,
      'read_at', read_at,
      'action_url', action_url,
      'action_text', action_text,
      'action_data', action_data,
      'source_type', source_type,
      'source_id', source_id,
      'source_reference', source_reference,
      'tags', tags,
      'metadata', metadata,
      'created_at', created_at,
      'expires_at', expires_at
    ) ORDER BY created_at DESC
  ) INTO v_notifications
  FROM notifications
  WHERE user_id = p_user_id 
    AND shop_domain = p_shop_domain
    AND (p_unread_only = FALSE OR is_read = FALSE)
    AND (p_notification_type IS NULL OR notification_type = p_notification_type)
    AND (p_priority IS NULL OR priority = p_priority)
    AND is_archived = FALSE
    AND (expires_at IS NULL OR expires_at > NOW())
  LIMIT p_limit OFFSET p_offset;
  
  RETURN jsonb_build_object(
    'notifications', COALESCE(v_notifications, '[]'::jsonb),
    'total_count', v_total_count,
    'limit', p_limit,
    'offset', p_offset
  );
END;
$$ LANGUAGE plpgsql;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(
  p_notification_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_updated INTEGER;
BEGIN
  UPDATE notifications
  SET is_read = TRUE, read_at = NOW(), updated_at = NOW()
  WHERE id = p_notification_id AND user_id = p_user_id;
  
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$ LANGUAGE plpgsql;

-- Function to mark all notifications as read
CREATE OR REPLACE FUNCTION mark_all_notifications_read(
  p_user_id UUID,
  p_shop_domain TEXT
)
RETURNS INTEGER AS $$
DECLARE
  v_updated INTEGER;
BEGIN
  UPDATE notifications
  SET is_read = TRUE, read_at = NOW(), updated_at = NOW()
  WHERE user_id = p_user_id 
    AND shop_domain = p_shop_domain
    AND is_read = FALSE;
  
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated;
END;
$$ LANGUAGE plpgsql;

-- Function to archive notification
CREATE OR REPLACE FUNCTION archive_notification(
  p_notification_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_updated INTEGER;
BEGIN
  UPDATE notifications
  SET is_archived = TRUE, archived_at = NOW(), updated_at = NOW()
  WHERE id = p_notification_id AND user_id = p_user_id;
  
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$ LANGUAGE plpgsql;

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_shop_domain TEXT,
  p_title TEXT,
  p_message TEXT,
  p_notification_type TEXT DEFAULT 'info',
  p_priority TEXT DEFAULT 'medium',
  p_action_url TEXT DEFAULT NULL,
  p_action_text TEXT DEFAULT NULL,
  p_action_data JSONB DEFAULT '{}',
  p_source_type TEXT DEFAULT NULL,
  p_source_id TEXT DEFAULT NULL,
  p_source_reference TEXT DEFAULT NULL,
  p_tags JSONB DEFAULT '[]',
  p_metadata JSONB DEFAULT '{}',
  p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id, shop_domain, title, message, notification_type, priority,
    action_url, action_text, action_data, source_type, source_id, source_reference,
    tags, metadata, expires_at
  ) VALUES (
    p_user_id, p_shop_domain, p_title, p_message, p_notification_type, p_priority,
    p_action_url, p_action_text, p_action_data, p_source_type, p_source_id, p_source_reference,
    p_tags, p_metadata, p_expires_at
  ) RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get notification counts
CREATE OR REPLACE FUNCTION get_notification_counts(
  p_user_id UUID,
  p_shop_domain TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_counts JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total', COUNT(*),
    'unread', COUNT(*) FILTER (WHERE is_read = FALSE),
    'archived', COUNT(*) FILTER (WHERE is_archived = TRUE),
    'by_type', jsonb_object_agg(
      notification_type, 
      COUNT(*) FILTER (WHERE is_read = FALSE)
    ),
    'by_priority', jsonb_object_agg(
      priority, 
      COUNT(*) FILTER (WHERE is_read = FALSE)
    )
  ) INTO v_counts
  FROM notifications
  WHERE user_id = p_user_id 
    AND shop_domain = p_shop_domain
    AND (expires_at IS NULL OR expires_at > NOW());
  
  RETURN COALESCE(v_counts, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- Comments for documentation
-- =============================================================================
COMMENT ON TABLE notifications IS 'User notifications system with read/unread status and priority levels';
COMMENT ON COLUMN notifications.notification_type IS 'Type of notification (info, warning, error, success, urgent)';
COMMENT ON COLUMN notifications.priority IS 'Priority level (low, medium, high, critical)';
COMMENT ON COLUMN notifications.action_url IS 'URL to navigate to when notification is clicked';
COMMENT ON COLUMN notifications.action_text IS 'Text for action button (e.g., "View Order", "Approve Request")';
COMMENT ON COLUMN notifications.source_type IS 'Source of the notification (system, inventory, orders, customers, marketing, approvals)';
COMMENT ON COLUMN notifications.tags IS 'Array of tags for filtering and categorization';

COMMENT ON FUNCTION get_user_notifications IS 'Gets user notifications with filtering options';
COMMENT ON FUNCTION mark_notification_read IS 'Marks a specific notification as read';
COMMENT ON FUNCTION mark_all_notifications_read IS 'Marks all user notifications as read';
COMMENT ON FUNCTION archive_notification IS 'Archives a specific notification';
COMMENT ON FUNCTION create_notification IS 'Creates a new notification';
COMMENT ON FUNCTION get_notification_counts IS 'Gets notification counts and statistics';
