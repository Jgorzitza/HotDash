/**
 * Reusable Doughnut Chart Component
 * 
 * Wraps react-chartjs-2 Doughnut component with OCC design tokens
 * Per Context7 docs: Doughnut component with data and options props
 */

import { Doughnut } from 'react-chartjs-2';
import type { ChartData, ChartOptions } from 'chart.js';
import { getOCCChartOptions } from './chartConfig';

interface DoughnutChartProps {
  data: ChartData<'doughnut'>;
  options?: ChartOptions<'doughnut'>;
  title?: string;
  height?: number;
}

export function DoughnutChart({ data, options, title, height = 300 }: DoughnutChartProps) {
  const defaultOptions = getOCCChartOptions(title);
  const mergedOptions: ChartOptions<'doughnut'> = {
    ...defaultOptions,
    ...options,
  };

  return (
    <div style={{ height: `${height}px`, width: '100%' }}>
      <Doughnut data={data} options={mergedOptions} />
    </div>
  );
}

