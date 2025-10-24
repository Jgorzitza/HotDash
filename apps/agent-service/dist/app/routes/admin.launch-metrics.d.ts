/**
 * Launch Metrics Dashboard
 *
 * Task: ANALYTICS-LAUNCH-001
 *
 * Route: /admin/launch-metrics
 *
 * Comprehensive launch metrics dashboard tracking:
 * 1. User engagement (DAU, WAU, MAU)
 * 2. Feature adoption rates
 * 3. Performance metrics (load times, errors)
 * 4. Agent performance (suggestions, approvals, accuracy)
 * 5. Business metrics (orders, revenue, inventory turns)
 *
 * Features:
 * - Real-time updates via SSE
 * - Historical trend analysis
 * - Alerts for anomalies
 * - Export to Google Analytics
 */
import { type LoaderFunctionArgs } from "react-router";
export declare function loader({ request }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
export default function LaunchMetricsDashboard(): React.JSX.Element;
//# sourceMappingURL=admin.launch-metrics.d.ts.map