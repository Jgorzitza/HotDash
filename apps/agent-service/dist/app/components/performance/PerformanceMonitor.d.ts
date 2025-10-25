/**
 * Performance Monitor Component
 *
 * Displays real-time performance metrics for Growth Engine phases 9-12
 * including load times, memory usage, and optimization recommendations.
 */
import React from "react";
interface PerformanceMonitorProps {
    showDetails?: boolean;
    position?: "top-right" | "bottom-right" | "bottom-left";
}
export declare function PerformanceMonitor({ showDetails, position }: PerformanceMonitorProps): React.JSX.Element;
export declare function PerformanceIndicator(): React.JSX.Element;
export {};
//# sourceMappingURL=PerformanceMonitor.d.ts.map