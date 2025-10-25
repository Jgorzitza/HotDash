/**
 * LlamaIndex MCP Monitoring Dashboard
 *
 * Task: ANALYTICS-LLAMAINDEX-001
 *
 * Route: /admin/analytics/llamaindex-mcp
 *
 * Displays comprehensive monitoring for LlamaIndex MCP server:
 * - Metrics dashboard for MCP server
 * - Track calls per agent (CEO, Order Support, Product Q&A)
 * - Track query latency and errors
 * - Track knowledge base stats (documents, categories)
 * - Alerts for errors or high latency
 * - Weekly report automation
 */
import { type LoaderFunctionArgs } from "react-router";
export declare function loader({ request }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
export default function LlamaIndexMCPDashboard(): React.JSX.Element;
//# sourceMappingURL=admin.analytics.llamaindex-mcp.d.ts.map