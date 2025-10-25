/**
 * Action Queue Dashboard
 * 
 * DESIGNER-GE-002: Action Queue Dashboard UI
 * 
 * Displays top 10 actions ranked by Expected Revenue × Confidence × Ease
 * Implements operator approval workflow with evidence and rollback plans
 * 
 * MCP Evidence: f9741770-612f-4529-a53e-d871b03a3e00
 * MCP JSONL: artifacts/designer/2025-10-24/mcp/designer-ge-002.jsonl
 */

import { type LoaderFunctionArgs } from "react-router";
import { useLoaderData, useRevalidator } from "react-router";
import { useState, useEffect } from "react";
import { ActionQueueService } from "~/services/action-queue/action-queue.service";
import type { ActionQueueItem } from "~/lib/growth-engine/action-queue";

/**
 * Loader: Fetch top 10 actions from Action Queue
 * Ranked by: Expected Revenue × Confidence × Ease
 */
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const actions = await ActionQueueService.getTopActions(10);
    
    return Response.json({
      actions,
      total: actions.length,
      error: null,
    });
  } catch (error) {
    console.error("Error loading action queue:", error);
    return Response.json({
      actions: [],
      total: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Action Queue Dashboard Page
 * 
 * Polaris Index pattern with table layout
 * Shows top 10 actions with approve/edit/dismiss buttons
 */
export default function ActionQueueDashboard() {
  const { actions, total, error } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();
  const [selectedAction, setSelectedAction] = useState<ActionQueueItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      revalidator.revalidate();
    }, 30000);
    return () => clearInterval(interval);
  }, [revalidator]);

  const handleViewDetails = (action: ActionQueueItem) => {
    setSelectedAction(action);
    setIsModalOpen(true);
  };

  const handleApprove = async (actionId: string) => {
    try {
      await fetch(`/api/action-queue/${actionId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      revalidator.revalidate();
    } catch (error) {
      console.error("Error approving action:", error);
    }
  };

  const handleDismiss = async (actionId: string) => {
    try {
      await fetch(`/api/action-queue/${actionId}/dismiss`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      revalidator.revalidate();
    } catch (error) {
      console.error("Error dismissing action:", error);
    }
  };

  return (
    <s-page heading="Action Queue" subtitle={`${total} recommended actions`}>
      <s-button slot="secondary-actions" onClick={() => revalidator.revalidate()}>
        Refresh
      </s-button>

      {error && (
        <s-banner tone="critical">
          <s-text>Error loading actions: {error}</s-text>
        </s-banner>
      )}

      {actions.length === 0 ? (
        <EmptyActionQueueState />
      ) : (
        <>
          <ActionQueueTable 
            actions={actions} 
            onViewDetails={handleViewDetails}
            onApprove={handleApprove}
            onDismiss={handleDismiss}
          />
          
          {selectedAction && (
            <ActionDetailsModal
              action={selectedAction}
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onApprove={() => handleApprove(selectedAction.id)}
              onDismiss={() => handleDismiss(selectedAction.id)}
            />
          )}
        </>
      )}
    </s-page>
  );
}

/**
 * Empty State Component
 */
function EmptyActionQueueState() {
  return (
    <s-section accessibilityLabel="Empty state section">
      <s-grid gap="base" justifyItems="center" paddingBlock="large-400">
        <s-box maxInlineSize="200px" maxBlockSize="200px">
          <s-image
            aspectRatio="1/0.5"
            src="https://cdn.shopify.com/static/images/polaris/patterns/callout.png"
            alt="No actions available"
          />
        </s-box>
        <s-grid justifyItems="center" maxInlineSize="450px" gap="base">
          <s-stack alignItems="center">
            <s-heading>No Actions in Queue</s-heading>
            <s-paragraph>
              All actions have been processed. Check back later for new recommendations.
            </s-paragraph>
          </s-stack>
        </s-grid>
      </s-grid>
    </s-section>
  );
}

/**
 * Action Queue Table Component
 * 
 * Displays top 10 actions in ranked order
 * Columns: Rank, Action, Target, Impact, Confidence, Ease, Freshness, Actions
 */
interface ActionQueueTableProps {
  actions: ActionQueueItem[];
  onViewDetails: (action: ActionQueueItem) => void;
  onApprove: (actionId: string) => void;
  onDismiss: (actionId: string) => void;
}

function ActionQueueTable({ actions, onViewDetails, onApprove, onDismiss }: ActionQueueTableProps) {
  return (
    <s-section padding="none" accessibilityLabel="Action queue table">
      <s-table>
        <s-table-header-row>
          <s-table-header format="numeric">#</s-table-header>
          <s-table-header listSlot="primary">Action</s-table-header>
          <s-table-header>Target</s-table-header>
          <s-table-header format="numeric">Impact</s-table-header>
          <s-table-header format="numeric">Confidence</s-table-header>
          <s-table-header>Ease</s-table-header>
          <s-table-header>Freshness</s-table-header>
          <s-table-header>Actions</s-table-header>
        </s-table-header-row>
        <s-table-body>
          {actions.map((action, index) => (
            <ActionQueueRow
              key={action.id}
              action={action}
              rank={index + 1}
              onViewDetails={onViewDetails}
              onApprove={onApprove}
              onDismiss={onDismiss}
            />
          ))}
        </s-table-body>
      </s-table>
    </s-section>
  );
}

/**
 * Action Queue Table Row Component
 */
interface ActionQueueRowProps {
  action: ActionQueueItem;
  rank: number;
  onViewDetails: (action: ActionQueueItem) => void;
  onApprove: (actionId: string) => void;
  onDismiss: (actionId: string) => void;
}

function ActionQueueRow({ action, rank, onViewDetails, onApprove, onDismiss }: ActionQueueRowProps) {
  const impactValue = action.expected_impact.delta;
  const impactUnit = action.expected_impact.unit;
  const confidencePercent = Math.round(action.confidence * 100);
  
  return (
    <s-table-row>
      <s-table-cell>{rank}</s-table-cell>
      <s-table-cell>
        <s-stack direction="block" gap="small">
          <s-link onClick={() => onViewDetails(action)}>
            {action.type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
          </s-link>
          <s-text size="small" type="subdued">
            {truncate(action.draft, 60)}
          </s-text>
        </s-stack>
      </s-table-cell>
      <s-table-cell>
        <s-text size="small">{truncate(action.target, 30)}</s-text>
      </s-table-cell>
      <s-table-cell>
        <s-text type="strong">
          {impactUnit === "$" ? `$${impactValue.toFixed(0)}` : `${impactValue}${impactUnit}`}
        </s-text>
      </s-table-cell>
      <s-table-cell>
        <s-badge tone={confidencePercent >= 80 ? "success" : confidencePercent >= 60 ? "info" : "warning"}>
          {confidencePercent}%
        </s-badge>
      </s-table-cell>
      <s-table-cell>
        <s-badge tone={action.ease === "simple" ? "success" : action.ease === "medium" ? "info" : "warning"}>
          {action.ease}
        </s-badge>
      </s-table-cell>
      <s-table-cell>
        <s-text size="small" type="subdued">{action.freshness_label}</s-text>
      </s-table-cell>
      <s-table-cell>
        <s-stack direction="inline" gap="small">
          <s-button size="small" variant="primary" onClick={() => onApprove(action.id)}>
            Approve
          </s-button>
          <s-button size="small" onClick={() => onViewDetails(action)}>
            Edit
          </s-button>
          <s-button size="small" tone="critical" onClick={() => onDismiss(action.id)}>
            Dismiss
          </s-button>
        </s-stack>
      </s-table-cell>
    </s-table-row>
  );
}

/**
 * Action Details Modal Component
 * 
 * Shows full action details with evidence and rollback plan
 */
interface ActionDetailsModalProps {
  action: ActionQueueItem;
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
  onDismiss: () => void;
}

function ActionDetailsModal({ action, isOpen, onClose, onApprove, onDismiss }: ActionDetailsModalProps) {
  if (!isOpen) return null;

  return (
    <s-modal open={isOpen} onClose={onClose} variant="large">
      <s-stack direction="block" gap="base">
        <s-heading>{action.type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</s-heading>
        
        <s-box padding="base" background="subdued" borderRadius="small">
          <s-stack direction="block" gap="small">
            <s-text type="strong">What will change:</s-text>
            <s-text>{action.draft}</s-text>
          </s-stack>
        </s-box>

        <s-stack direction="block" gap="small">
          <s-text type="strong">Target:</s-text>
          <s-text>{action.target}</s-text>
        </s-stack>

        <s-stack direction="block" gap="small">
          <s-text type="strong">Expected Impact:</s-text>
          <s-text>
            {action.expected_impact.unit === "$" 
              ? `$${action.expected_impact.delta.toFixed(0)}` 
              : `${action.expected_impact.delta}${action.expected_impact.unit}`
            } in {action.expected_impact.metric}
          </s-text>
        </s-stack>

        <s-stack direction="block" gap="small">
          <s-text type="strong">Evidence:</s-text>
          <s-text size="small">MCP Requests: {action.evidence.mcp_request_ids.join(", ")}</s-text>
          <s-text size="small">Datasets: {action.evidence.dataset_links.join(", ")}</s-text>
        </s-stack>

        <s-stack direction="block" gap="small">
          <s-text type="strong">Rollback Plan:</s-text>
          <s-text>{action.rollback_plan}</s-text>
        </s-stack>

        <s-stack direction="inline" gap="small">
          <s-button variant="primary" onClick={() => { onApprove(); onClose(); }}>
            Approve
          </s-button>
          <s-button onClick={onClose}>Cancel</s-button>
          <s-button tone="critical" onClick={() => { onDismiss(); onClose(); }}>
            Dismiss
          </s-button>
        </s-stack>
      </s-stack>
    </s-modal>
  );
}

/**
 * Utility: Truncate text with ellipsis
 */
function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "…";
}
