export type Approval = {
  id: string;
  kind: "cx_reply" | "inventory" | "growth" | "misc";
  state:
    | "draft"
    | "pending_review"
    | "approved"
    | "applied"
    | "audited"
    | "learned";
  summary: string;
  created_by: string;
  reviewer?: string;
  evidence: {
    what_changes?: string;
    why_now?: string;
    impact_forecast?: string;
    diffs?: Array<{ path: string; before: string; after: string }>;
    samples?: Array<{ label: string; content: string }>;
    queries?: Array<{ label: string; query: string; result?: string }>;
    screenshots?: Array<{ label: string; url: string }>;
  };
  impact: {
    expected_outcome?: string;
    metrics_affected?: string[];
    user_experience?: string;
    business_value?: string;
  };
  risk: {
    what_could_go_wrong?: string;
    recovery_time?: string;
  };
  rollback: {
    steps?: string[];
    artifact_location?: string;
  };
  actions: Array<{
    endpoint: string;
    payload: unknown;
    dry_run_status?: string;
  }>;
  receipts?: Array<{
    id: string;
    timestamp: string;
    metrics?: unknown;
  }>;
  created_at: string;
  updated_at: string;
  validation_errors?: string[];
};
