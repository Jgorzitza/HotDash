/**
 * Reusable Line Chart Component
 * 
 * Wraps react-chartjs-2 Line component with OCC design tokens
 * Per Context7 docs: Line component with data and options props
 */

import { Line } from 'react-chartjs-2';
import type { ChartData, ChartOptions } from 'chart.js';
import { getOCCChartOptions } from './chartConfig';

interface LineChartProps {
  data: ChartData<'line'>;
  options?: ChartOptions<'line'>;
  title?: string;
  height?: number;
}

export function LineChart({ data, options, title, height = 300 }: LineChartProps) {
  const defaultOptions = getOCCChartOptions(title);
  const mergedOptions: ChartOptions<'line'> = {
    ...defaultOptions,
    ...options,
  };

  return (
    <div style={{ height: `${height}px`, width: '100%' }}>
      <Line data={data} options={mergedOptions} />
    </div>
  );
}


