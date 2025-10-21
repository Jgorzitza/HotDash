/**
 * Growth Metrics Modal Component (ENG-026)
 * 
 * Overall growth analytics view with:
 * - Multi-channel trend chart (line)
 * - Channel comparison bar chart
 * - Weekly growth report
 */

import { LineChart, BarChart, OCC_CHART_COLORS } from '../charts';
import type { ChartData } from 'chart.js';

interface ChannelData {
  channel: string;
  thisWeek: number;
  lastWeek: number;
  growth: number;
}

interface GrowthMetricsModalProps {
  data: {
    trend: {
      labels: string[];
      social: number[];
      seo: number[];
      ads: number[];
      email: number[];
    };
    channelComparison: ChannelData[];
    weeklyReport: {
      summary: string;
      recommendations: string[];
    };
  };
  onClose: () => void;
}

export function GrowthMetricsModal({ data, onClose }: GrowthMetricsModalProps) {
  const trendChartData: ChartData<'line'> = {
    labels: data.trend.labels,
    datasets: [
      {
        label: 'Social Media',
        data: data.trend.social,
        borderColor: OCC_CHART_COLORS.primary,
        backgroundColor: 'rgba(0, 91, 211, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'SEO/Organic',
        data: data.trend.seo,
        borderColor: OCC_CHART_COLORS.success,
        backgroundColor: 'rgba(0, 128, 96, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Paid Ads',
        data: data.trend.ads,
        borderColor: OCC_CHART_COLORS.warning,
        backgroundColor: 'rgba(255, 184, 0, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Email',
        data: data.trend.email,
        borderColor: OCC_CHART_COLORS.purple,
        backgroundColor: 'rgba(156, 39, 176, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const comparisonChartData: ChartData<'bar'> = {
    labels: data.channelComparison.map(c => c.channel),
    datasets: [
      {
        label: 'This Week',
        data: data.channelComparison.map(c => c.thisWeek),
        backgroundColor: OCC_CHART_COLORS.primary,
      },
      {
        label: 'Last Week',
        data: data.channelComparison.map(c => c.lastWeek),
        backgroundColor: 'rgba(0, 91, 211, 0.3)',
      },
    ],
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0, 0, 0, 0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: "var(--occ-bg-surface)", borderRadius: "var(--occ-radius-lg)", padding: "var(--occ-space-6)", maxWidth: "1000px", width: "90%", maxHeight: "90vh", overflow: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--occ-space-6)" }}>
          <h2 style={{ margin: 0, fontSize: "var(--occ-font-size-xl)", fontWeight: "var(--occ-font-weight-bold)" }}>Growth Analytics</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "var(--occ-text-secondary)" }}>×</button>
        </div>

        <div style={{ marginBottom: "var(--occ-space-6)" }}>
          <h3 style={{ fontSize: "var(--occ-font-size-md)", fontWeight: "var(--occ-font-weight-semibold)", marginBottom: "var(--occ-space-4)" }}>Multi-Channel Trends</h3>
          <LineChart data={trendChartData} height={320} />
        </div>

        <div style={{ marginBottom: "var(--occ-space-6)" }}>
          <h3 style={{ fontSize: "var(--occ-font-size-md)", fontWeight: "var(--occ-font-weight-semibold)", marginBottom: "var(--occ-space-4)" }}>Channel Comparison</h3>
          <BarChart data={comparisonChartData} height={250} />
        </div>

        <div style={{ padding: "var(--occ-space-4)", background: "var(--occ-bg-secondary)", borderRadius: "var(--occ-radius-md)" }}>
          <h3 style={{ fontSize: "var(--occ-font-size-md)", fontWeight: "var(--occ-font-weight-semibold)", marginBottom: "var(--occ-space-3)" }}>Weekly Report</h3>
          <p style={{ marginBottom: "var(--occ-space-4)", color: "var(--occ-text-default)" }}>{data.weeklyReport.summary}</p>
          
          <div style={{ fontSize: "var(--occ-font-size-sm)", fontWeight: "600", marginBottom: "var(--occ-space-2)" }}>Recommendations:</div>
          <ul style={{ margin: 0, paddingLeft: "var(--occ-space-5)", color: "var(--occ-text-secondary)" }}>
            {data.weeklyReport.recommendations.map((rec, i) => (
              <li key={i} style={{ marginBottom: "var(--occ-space-2)" }}>{rec}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

