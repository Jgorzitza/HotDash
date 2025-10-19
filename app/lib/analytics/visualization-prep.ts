/**
 * Trend Visualization Data Preparation
 *
 * Prepares analytics data for charting and visualization.
 * Formats data for popular chart libraries (Chart.js, Recharts, etc.)
 */

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
  }>;
}

/**
 * Prepare revenue trend data for line chart
 */
export function prepareRevenueTrendChart(
  data: Array<{ date: string; revenue: number }>,
): ChartData {
  return {
    labels: data.map((d) => d.date),
    datasets: [
      {
        label: "Revenue",
        data: data.map((d) => d.revenue),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
      },
    ],
  };
}

/**
 * Prepare conversion funnel data
 */
export function prepareFunnelChart(
  steps: Array<{ name: string; users: number }>,
): ChartData {
  return {
    labels: steps.map((s) => s.name),
    datasets: [
      {
        label: "Users",
        data: steps.map((s) => s.users),
        backgroundColor: "rgba(54, 162, 235, 0.5)",
      },
    ],
  };
}

/**
 * Prepare channel distribution pie chart
 */
export function prepareChannelDistributionChart(
  channels: Array<{ channel: string; sessions: number }>,
): ChartData {
  return {
    labels: channels.map((c) => c.channel),
    datasets: [
      {
        label: "Sessions",
        data: channels.map((c) => c.sessions),
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(75, 192, 192, 0.5)",
          "rgba(153, 102, 255, 0.5)",
        ],
      },
    ],
  };
}
