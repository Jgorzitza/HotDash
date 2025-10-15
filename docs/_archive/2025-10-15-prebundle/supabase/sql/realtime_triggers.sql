-- Real-time Analytics: Database Triggers for Notifications
-- Purpose: pg_notify triggers for instant event broadcasting
-- Owner: data
-- Date: 2025-10-11
-- Ref: docs/data/realtime_analytics_pipeline.md

-- =============================================================================
-- Trigger 1: Notify on New Pending Approval
-- =============================================================================

CREATE OR REPLACE FUNCTION notify_new_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'pending' THEN
    PERFORM pg_notify(
      'approval_queue_stream',
      json_build_object(
        'event', 'new_approval',
        'id', NEW.id,
        'conversation_id', NEW.conversation_id,
        'created_at', NEW.created_at,
        'age_seconds', 0
      )::text
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_new_approval ON agent_approvals;
CREATE TRIGGER trg_notify_new_approval
AFTER INSERT ON agent_approvals
FOR EACH ROW
WHEN (NEW.status = 'pending')
EXECUTE FUNCTION notify_new_approval();

COMMENT ON FUNCTION notify_new_approval IS 'Broadcasts new pending approvals via pg_notify for real-time dashboard updates.';

-- =============================================================================
-- Trigger 2: Notify on Approval Status Change
-- =============================================================================

CREATE OR REPLACE FUNCTION notify_approval_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status != NEW.status THEN
    PERFORM pg_notify(
      'approval_queue_stream',
      json_build_object(
        'event', 'status_change',
        'id', NEW.id,
        'conversation_id', NEW.conversation_id,
        'old_status', OLD.status,
        'new_status', NEW.status,
        'approved_by', NEW.approved_by,
        'resolution_seconds', EXTRACT(EPOCH FROM (NEW.updated_at - NEW.created_at))
      )::text
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_approval_status_change ON agent_approvals;
CREATE TRIGGER trg_notify_approval_status_change
AFTER UPDATE ON agent_approvals
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION notify_approval_status_change();

COMMENT ON FUNCTION notify_approval_status_change IS 'Broadcasts approval status changes for real-time queue monitoring.';

-- =============================================================================
-- Trigger 3: Notify on Slow Query (Performance Alert)
-- =============================================================================

CREATE OR REPLACE FUNCTION notify_slow_query()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latency_ms > 200 THEN
    PERFORM pg_notify(
      'performance_alert_stream',
      json_build_object(
        'event', 'slow_query',
        'agent', NEW.agent,
        'latency_ms', NEW.latency_ms,
        'query', LEFT(NEW.query, 100),
        'conversation_id', NEW.conversation_id,
        'created_at', NEW.created_at,
        'severity', CASE 
          WHEN NEW.latency_ms > 500 THEN 'critical'
          WHEN NEW.latency_ms > 300 THEN 'warning'
          ELSE 'info'
        END
      )::text
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_slow_query ON agent_queries;
CREATE TRIGGER trg_notify_slow_query
AFTER INSERT ON agent_queries
FOR EACH ROW
WHEN (NEW.latency_ms > 200)
EXECUTE FUNCTION notify_slow_query();

COMMENT ON FUNCTION notify_slow_query IS 'Broadcasts slow query alerts for performance monitoring and degradation detection.';

-- =============================================================================
-- Trigger 4: Notify on Unsafe Training Data
-- =============================================================================

CREATE OR REPLACE FUNCTION notify_unsafe_feedback()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.safe_to_send = false THEN
    PERFORM pg_notify(
      'training_feedback_stream',
      json_build_object(
        'event', 'unsafe_response',
        'id', NEW.id,
        'conversation_id', NEW.conversation_id,
        'labels', NEW.labels,
        'annotator', NEW.annotator,
        'created_at', NEW.created_at
      )::text
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_unsafe_feedback ON agent_feedback;
CREATE TRIGGER trg_notify_unsafe_feedback
AFTER INSERT OR UPDATE ON agent_feedback
FOR EACH ROW
WHEN (NEW.safe_to_send = false)
EXECUTE FUNCTION notify_unsafe_feedback();

COMMENT ON FUNCTION notify_unsafe_feedback IS 'Broadcasts unsafe response detections for immediate safety review.';

-- =============================================================================
-- Trigger 5: Notify on SLA Breach (5-minute threshold)
-- =============================================================================

CREATE OR REPLACE FUNCTION notify_sla_breach()
RETURNS TRIGGER AS $$
DECLARE
  age_minutes numeric;
BEGIN
  -- Check age of pending approvals
  IF NEW.status = 'pending' THEN
    age_minutes := EXTRACT(EPOCH FROM (NOW() - NEW.created_at)) / 60;
    
    IF age_minutes > 5 THEN
      PERFORM pg_notify(
        'sla_breach_stream',
        json_build_object(
          'event', 'sla_breach',
          'id', NEW.id,
          'conversation_id', NEW.conversation_id,
          'age_minutes', age_minutes,
          'created_at', NEW.created_at,
          'severity', CASE 
            WHEN age_minutes > 15 THEN 'critical'
            WHEN age_minutes > 10 THEN 'warning'
            ELSE 'info'
          END
        )::text
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: This trigger runs on INSERT/UPDATE
-- For ongoing monitoring, use a scheduled job to check pending approvals

COMMENT ON FUNCTION notify_sla_breach IS 'Broadcasts SLA breaches for approval queue monitoring (5-minute threshold).';

-- =============================================================================
-- Grant Permissions
-- =============================================================================

GRANT EXECUTE ON FUNCTION notify_new_approval TO service_role;
GRANT EXECUTE ON FUNCTION notify_approval_status_change TO service_role;
GRANT EXECUTE ON FUNCTION notify_slow_query TO service_role;
GRANT EXECUTE ON FUNCTION notify_unsafe_feedback TO service_role;
GRANT EXECUTE ON FUNCTION notify_sla_breach TO service_role;

