-- Audit Triggers for Critical Tables
-- Priority: P0 - Launch Critical
-- Owner: data
-- Date: 2025-10-15
-- Task: 14 - Triggers for audit logging on writes

-- ============================================================================
-- Audit Trigger Function
-- ============================================================================

CREATE OR REPLACE FUNCTION public.log_audit_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_actor TEXT;
  v_action TEXT;
  v_payload JSONB;
BEGIN
  -- Determine actor
  v_actor := COALESCE(
    current_setting('app.current_user', true),
    auth.jwt() ->> 'email',
    'system'
  );
  
  -- Determine action
  v_action := TG_TABLE_NAME || '.' || lower(TG_OP);
  
  -- Build payload based on operation
  IF TG_OP = 'DELETE' THEN
    v_payload := to_jsonb(OLD);
  ELSE
    v_payload := to_jsonb(NEW);
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
    TG_TABLE_NAME,
    COALESCE((v_payload->>'id')::TEXT, 'unknown'),
    v_payload,
    'success',
    jsonb_build_object('operation', TG_OP, 'table', TG_TABLE_NAME)
  );
  
  -- Return appropriate record
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

COMMENT ON FUNCTION public.log_audit_event IS 'Trigger function to log all write operations to audit_logs table';

-- ============================================================================
-- Apply Audit Triggers to Critical Tables
-- ============================================================================

-- Approvals table
CREATE TRIGGER trg_approvals_audit
AFTER INSERT OR UPDATE OR DELETE ON public.approvals
FOR EACH ROW EXECUTE PROCEDURE public.log_audit_event();

-- Approval grades table
CREATE TRIGGER trg_approval_grades_audit
AFTER INSERT OR UPDATE ON public.approval_grades
FOR EACH ROW EXECUTE PROCEDURE public.log_audit_event();

-- Picker payouts table (financial data)
CREATE TRIGGER trg_picker_payouts_audit
AFTER INSERT OR UPDATE ON public.picker_payouts
FOR EACH ROW EXECUTE PROCEDURE public.log_audit_event();

-- CX conversations table (customer data)
CREATE TRIGGER trg_cx_conversations_audit
AFTER INSERT OR UPDATE ON public.cx_conversations
FOR EACH ROW EXECUTE PROCEDURE public.log_audit_event();

COMMENT ON TRIGGER trg_approvals_audit ON public.approvals IS 'Audit log for all approval changes';
COMMENT ON TRIGGER trg_approval_grades_audit ON public.approval_grades IS 'Audit log for HITL grading';
COMMENT ON TRIGGER trg_picker_payouts_audit ON public.picker_payouts IS 'Audit log for payout changes';
COMMENT ON TRIGGER trg_cx_conversations_audit ON public.cx_conversations IS 'Audit log for customer conversations';

