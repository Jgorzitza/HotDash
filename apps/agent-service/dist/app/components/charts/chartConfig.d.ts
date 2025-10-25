/**
 * Chart.js Configuration and Registration
 *
 * Per Context7 react-chartjs-2 docs: Must register Chart.js elements
 * for tree-shaking in v4+
 *
 * Registers only the elements we need to reduce bundle size.
 */
import { type ChartOptions } from "chart.js";
/**
 * Get OCC-themed chart options
 *
 * Applies OCC design tokens to Chart.js charts for consistent styling
 * with the rest of the application.
 */
export declare function getOCCChartOptions(title?: string): ChartOptions<any>;
/**
 * OCC Color Palette for Charts
 *
 * Consistent colors across all analytics charts
 */
export declare const OCC_CHART_COLORS: {
    primary: string;
    success: string;
    warning: string;
    critical: string;
    purple: string;
    teal: string;
    orange: string;
    pink: string;
};
/**
 * Transparent version of OCC colors (for area fills)
 */
export declare const OCC_CHART_COLORS_TRANSPARENT: {
    primary: string;
    success: string;
    warning: string;
    critical: string;
    purple: string;
    teal: string;
    orange: string;
    pink: string;
};
//# sourceMappingURL=chartConfig.d.ts.map