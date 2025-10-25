/**
 * Reusable Line Chart Component
 *
 * Wraps react-chartjs-2 Line component with OCC design tokens
 * Per Context7 docs: Line component with data and options props
 */
import type { ChartData, ChartOptions } from "chart.js";
interface LineChartProps {
    data: ChartData<"line">;
    options?: ChartOptions<"line">;
    title?: string;
    height?: number;
}
export declare function LineChart({ data, options, title, height, }: LineChartProps): React.JSX.Element;
export {};
//# sourceMappingURL=LineChart.d.ts.map