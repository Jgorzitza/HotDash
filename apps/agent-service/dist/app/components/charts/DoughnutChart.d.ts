/**
 * Reusable Doughnut Chart Component
 *
 * Wraps react-chartjs-2 Doughnut component with OCC design tokens
 * Per Context7 docs: Doughnut component with data and options props
 */
import type { ChartData, ChartOptions } from "chart.js";
interface DoughnutChartProps {
    data: ChartData<"doughnut">;
    options?: ChartOptions<"doughnut">;
    title?: string;
    height?: number;
}
export declare function DoughnutChart({ data, options, title, height, }: DoughnutChartProps): React.JSX.Element;
export {};
//# sourceMappingURL=DoughnutChart.d.ts.map