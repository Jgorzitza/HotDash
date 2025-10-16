-- Audit Trigger for Approvals Table
-- Priority: P0 - Launch Critical
-- Owner: data
-- Date: 2025-10-16
-- Task: 19 - Audit trigger on approvals table

-- ============================================================================
-- Audit Trigger Function
-- ============================================================================

CREATE OR REPLACE FUNCTION public.log_approval_audit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_actor TEXT;
  v_action TEXT;
  v_payload JSONB;
  v_result_details JSONB;
BEGIN
  -- Determine actor
  v_actor := COALESCE(
    current_setting('app.current_user', true),
    auth.jwt() ->> 'email',
    'system'
  );
  
  -- Determine action
  v_action := 'approvals.' || lower(TG_OP);
  
  -- Build payload and result details based on operation
  IF TG_OP = 'DELETE' THEN
    v_payload := to_jsonb(OLD);
    v_result_details := jsonb_build_object(
      'operation', 'DELETE',
      'table', 'approvals',
      'id', OLD.id,
      'kind', OLD.kind,
      'state', OLD.state
    );
  ELSIF TG_OP = 'UPDATE' THEN
    v_payload := jsonb_build_object(
      'before', to_jsonb(OLD),
      'after', to_jsonb(NEW)
    );
    v_result_details := jsonb_build_object(
      'operation', 'UPDATE',
      'table', 'approvals',
      'id', NEW.id,
      'state_change', OLD.state || ' -> ' || NEW.state,
      'reviewer_assigned', OLD.reviewer IS NULL AND NEW.reviewer IS NOT NULL
    );
  ELSE -- INSERT
    v_payload := to_jsonb(NEW);
    v_result_details := jsonb_build_object(
      'operation', 'INSERT',
      'table', 'approvals',
      'id', NEW.id,
      'kind', NEW.kind,
      'state', NEW.state
    );
  END IF;
  
  -- Insert audit log
  INSERT INTO audit_logs (
    actor,
    action,
    entity_type,
    entity_id,
    payload,
    result,
    result_details
  ) VALUES (
    v_actor,
    v_action,
    'approval',
    COALESCE(NEW.id::TEXT, OLD.id::TEXT),
    v_payload,
    'success',
    v_result_details
  );
  
  -- Return appropriate record
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

COMMENT ON FUNCTION public.log_approval_audit IS 'Trigger function to log all approvals table changes to audit_logs';

-- ============================================================================
-- Apply Audit Trigger to Approvals Table
-- ============================================================================

CREATE TRIGGER trg_approvals_audit
AFTER INSERT OR UPDATE OR DELETE ON public.approvals
FOR EACH ROW EXECUTE PROCEDURE public.log_approval_audit();

COMMENT ON TRIGGER trg_approvals_audit ON public.approvals IS 'Audit log for all approval changes';

-- ============================================================================
-- Apply Audit Trigger to Approval Grades Table
-- ============================================================================

CREATE OR REPLACE FUNCTION public.log_approval_grades_audit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_actor TEXT;
BEGIN
  v_actor := COALESCE(
    current_setting('app.current_user', true),
    auth.jwt() ->> 'email',
    'system'
  );
  
  INSERT INTO audit_logs (
    actor,
    action,
    entity_type,
    entity_id,
    payload,
    result,
    result_details
  ) VALUES (
    v_actor,
    'approval_grades.' || lower(TG_OP),
    'approval_grades',
    COALESCE(NEW.id::TEXT, OLD.id::TEXT),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(NEW) END,
    'success',
    jsonb_build_object(
      'operation', TG_OP,
      'table', 'approval_grades',
      'approval_id', COALESCE(NEW.approval_id, OLD.approval_id),
      'reviewer', COALESCE(NEW.reviewer, OLD.reviewer)
    )
  );
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

CREATE TRIGGER trg_approval_grades_audit
AFTER INSERT OR UPDATE OR DELETE ON public.approval_grades
FOR EACH ROW EXECUTE PROCEDURE public.log_approval_grades_audit();

COMMENT ON TRIGGER trg_approval_grades_audit ON public.approval_grades IS 'Audit log for HITL grading';

