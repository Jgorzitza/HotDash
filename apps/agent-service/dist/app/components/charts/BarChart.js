/**
 * Reusable Bar Chart Component
 *
 * Wraps react-chartjs-2 Bar component with OCC design tokens
 * Per Context7 docs: Bar component with data and options props
 * Supports horizontal mode via indexAxis option
 */
import { Bar } from "react-chartjs-2";
import { getOCCChartOptions } from "./chartConfig";
export function BarChart({ data, options, title, height = 300, horizontal = false, }) {
    const defaultOptions = getOCCChartOptions(title);
    const mergedOptions = {
        ...defaultOptions,
        ...options,
        ...(horizontal && {
            indexAxis: "y", // Per Context7: indexAxis: 'y' for horizontal bars
        }),
    };
    return (<div style={{ height: `${height}px`, width: "100%" }}>
      <Bar data={data} options={mergedOptions}/>
    </div>);
}
//# sourceMappingURL=BarChart.js.map