/**
 * Approvals Drawer - Refactored
 *
 * Spec: docs/specs/approvals_drawer_spec.md
 *
 * Main orchestrator for approval details drawer.
 * Split into subcomponents to stay under 300 lines and avoid nested modals.
 *
 * HITL enforced: "Approve" disabled until evidence + rollback + /validate OK
 */
import React from "react";
export interface Approval {
    id: string;
    kind: "cx_reply" | "inventory" | "growth" | "misc";
    state: "draft" | "pending_review" | "approved" | "applied" | "audited" | "learned";
    summary: string;
    created_by: string;
    reviewer?: string;
    evidence: {
        what_changes?: string;
        why_now?: string;
        impact_forecast?: string;
        diffs?: Array<{
            path: string;
            before: string;
            after: string;
        }>;
        samples?: Array<{
            label: string;
            content: string;
        }>;
        queries?: Array<{
            label: string;
            query: string;
            result?: string;
        }>;
        screenshots?: Array<{
            label: string;
            url: string;
        }>;
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
        payload: any;
        dry_run_status?: string;
    }>;
    receipts?: Array<{
        id: string;
        timestamp: string;
        metrics?: any;
    }>;
    created_at: string;
    updated_at: string;
    validation_errors?: string[];
}
export interface ApprovalsDrawerProps {
    open: boolean;
    approval: Approval | null;
    onClose: () => void;
    onApprove: (grades?: {
        tone: number;
        accuracy: number;
        policy: number;
    }) => void;
    onReject: (reason: string) => void;
    onRequestChanges: (note: string) => void;
    onApply?: () => void;
}
export declare function ApprovalsDrawer({ open, approval, onClose, onApprove, onReject, onRequestChanges, onApply, }: ApprovalsDrawerProps): React.JSX.Element;
//# sourceMappingURL=ApprovalsDrawer.d.ts.map