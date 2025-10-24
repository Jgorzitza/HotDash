/**
 * Reusable Bar Chart Component
 *
 * Wraps react-chartjs-2 Bar component with OCC design tokens
 * Per Context7 docs: Bar component with data and options props
 * Supports horizontal mode via indexAxis option
 */
import type { ChartData, ChartOptions } from "chart.js";
interface BarChartProps {
    data: ChartData<"bar">;
    options?: ChartOptions<"bar">;
    title?: string;
    height?: number;
    horizontal?: boolean;
}
export declare function BarChart({ data, options, title, height, horizontal, }: BarChartProps): React.JSX.Element;
export {};
//# sourceMappingURL=BarChart.d.ts.map