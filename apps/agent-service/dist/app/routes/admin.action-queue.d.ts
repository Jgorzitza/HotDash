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
/**
 * Loader: Fetch top 10 actions from Action Queue
 * Ranked by: Expected Revenue × Confidence × Ease
 */
export declare function loader({ request }: LoaderFunctionArgs): Promise<any>;
/**
 * Action Queue Dashboard Page
 *
 * Polaris Index pattern with table layout
 * Shows top 10 actions with approve/edit/dismiss buttons
 */
export default function ActionQueueDashboard(): React.JSX.Element;
//# sourceMappingURL=admin.action-queue.d.ts.map