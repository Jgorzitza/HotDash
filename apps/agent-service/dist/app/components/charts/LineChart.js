/**
 * Reusable Line Chart Component
 *
 * Wraps react-chartjs-2 Line component with OCC design tokens
 * Per Context7 docs: Line component with data and options props
 */
import { Line } from "react-chartjs-2";
import { getOCCChartOptions } from "./chartConfig";
export function LineChart({ data, options, title, height = 300, }) {
    const defaultOptions = getOCCChartOptions(title);
    const mergedOptions = {
        ...defaultOptions,
        ...options,
    };
    return (<div style={{ height: `${height}px`, width: "100%" }}>
      <Line data={data} options={mergedOptions}/>
    </div>);
}
//# sourceMappingURL=LineChart.js.map