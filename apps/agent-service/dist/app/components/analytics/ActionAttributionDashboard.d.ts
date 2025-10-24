/**
 * Action Attribution Dashboard Component
 *
 * ANALYTICS-002: Comprehensive action attribution and ROI measurement dashboard
 * Displays action performance, ROI tracking, and attribution analysis
 */
import type { AttributionSummary } from "~/services/analytics/action-attribution";
interface ActionAttributionDashboardProps {
    attributionData?: AttributionSummary[];
    loading?: boolean;
    error?: string;
    onRefresh?: () => void;
}
export declare function ActionAttributionDashboard({ attributionData, loading, error, onRefresh, }: ActionAttributionDashboardProps): React.JSX.Element;
export default ActionAttributionDashboard;
//# sourceMappingURL=ActionAttributionDashboard.d.ts.map