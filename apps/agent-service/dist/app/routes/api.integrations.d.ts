/**
 * Integration API Routes
 *
 * Provides REST endpoints for third-party API integrations:
 * - Health monitoring
 * - Bulk operations
 * - Analytics and metrics
 * - Integration management
 */
import type { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router';
export declare function loader({ request }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
export declare function action({ request }: ActionFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.integrations.d.ts.map