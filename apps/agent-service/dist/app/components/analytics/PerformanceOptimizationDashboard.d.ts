/**
 * Growth Engine Performance Optimization Dashboard
 *
 * ANALYTICS-001: Advanced performance optimization dashboard for Growth Engine
 * Displays performance analysis, optimization recommendations, and real-time monitoring
 */
import type { PerformanceAnalysisResult } from "~/lib/growth-engine/performance-analysis";
import type { OptimizationResult as OptimizerResult } from "~/services/analytics/performance-optimizer";
interface PerformanceOptimizationDashboardProps {
    analysis?: PerformanceAnalysisResult;
    optimization?: OptimizerResult;
    loading?: boolean;
    error?: string;
}
export declare function PerformanceOptimizationDashboard({ analysis, optimization, loading, error, }: PerformanceOptimizationDashboardProps): React.JSX.Element;
export default PerformanceOptimizationDashboard;
//# sourceMappingURL=PerformanceOptimizationDashboard.d.ts.map