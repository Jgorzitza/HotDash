/**
 * Growth Engine Analytics Dashboard Component
 *
 * ANALYTICS-274: Comprehensive Growth Engine analytics dashboard with
 * phase tracking, action performance, and optimization recommendations
 */
import type { GrowthEngineAnalytics } from "~/services/analytics/growthEngine";
interface GrowthEngineDashboardProps {
    analytics: GrowthEngineAnalytics;
    loading?: boolean;
    error?: string;
}
export declare function GrowthEngineDashboard({ analytics, loading, error, }: GrowthEngineDashboardProps): React.JSX.Element;
export default GrowthEngineDashboard;
//# sourceMappingURL=GrowthEngineDashboard.d.ts.map