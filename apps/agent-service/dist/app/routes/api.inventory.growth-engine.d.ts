/**
 * API Route: Growth Engine Inventory Agent
 *
 * POST /api/inventory/growth-engine/analyze
 * POST /api/inventory/growth-engine/reconciliation
 * GET /api/inventory/growth-engine/compliance
 *
 * Enhanced inventory agent that integrates with the Growth Engine framework
 * to provide advanced inventory management capabilities with MCP evidence,
 * heartbeat monitoring, and action queue integration.
 *
 * Context7: /websites/reactrouter - action patterns
 * Context7: /microsoft/typescript - async/Promise types
 *
 * INVENTORY-534: Growth Engine inventory Task
 */
import { type LoaderFunctionArgs, type ActionFunctionArgs } from "react-router";
export declare function loader({ request }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
export declare function action({ request }: ActionFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.inventory.growth-engine.d.ts.map