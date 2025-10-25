/**
 * Reusable Bar Chart Component
 *
 * Wraps react-chartjs-2 Bar component with OCC design tokens
 * Per Context7 docs: Bar component with data and options props
 * Supports horizontal mode via indexAxis option
 */

import { Bar } from "react-chartjs-2";
import type { ChartData, ChartOptions } from "chart.js";
import { getOCCChartOptions } from "./chartConfig";

interface BarChartProps {
  data: ChartData<"bar">;
  options?: ChartOptions<"bar">;
  title?: string;
  height?: number;
  horizontal?: boolean;
}

export function BarChart({
  data,
  options,
  title,
  height = 300,
  horizontal = false,
}: BarChartProps) {
  const defaultOptions = getOCCChartOptions(title);
  const mergedOptions: ChartOptions<"bar"> = {
    ...defaultOptions,
    ...options,
    ...(horizontal && {
      indexAxis: "y", // Per Context7: indexAxis: 'y' for horizontal bars
    }),
  };

  return (
    <div style={{ height: `${height}px`, width: "100%" }}>
      <Bar data={data} options={mergedOptions} />
    </div>
  );
}
