/**
 * Reusable Doughnut Chart Component
 *
 * Wraps react-chartjs-2 Doughnut component with OCC design tokens
 * Per Context7 docs: Doughnut component with data and options props
 */
import { Doughnut } from "react-chartjs-2";
import { getOCCChartOptions } from "./chartConfig";
export function DoughnutChart({ data, options, title, height = 300, }) {
    const defaultOptions = getOCCChartOptions(title);
    const mergedOptions = {
        ...defaultOptions,
        ...options,
    };
    return (<div style={{ height: `${height}px`, width: "100%" }}>
      <Doughnut data={data} options={mergedOptions}/>
    </div>);
}
//# sourceMappingURL=DoughnutChart.js.map