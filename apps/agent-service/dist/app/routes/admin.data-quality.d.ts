/**
 * Data Quality Monitoring Dashboard
 *
 * Task: DATA-QUALITY-001
 * MCP Evidence: artifacts/data/2025-10-24/mcp/data-quality-monitoring.jsonl
 *
 * Provides comprehensive data quality monitoring interface:
 * - Real-time quality metrics
 * - Validation rule status
 * - Anomaly detection alerts
 * - Data freshness monitoring
 * - Quality trends and history
 */
import { type LoaderFunctionArgs } from "@remix-run/node";
export declare const loader: ({ request }: LoaderFunctionArgs) => Promise<import("@remix-run/node").TypedResponse<{
    validationResults: any;
    qualityMetrics: any;
    anomalies: any;
    freshnessChecks: any;
    overallScore: number;
    timestamp: string;
}>>;
export default function DataQualityDashboard(): React.JSX.Element;
//# sourceMappingURL=admin.data-quality.d.ts.map