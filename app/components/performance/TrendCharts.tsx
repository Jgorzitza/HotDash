/**
 * TrendCharts Component - P0
 * 
 * Displays trend charts for approval rates and ROI over time
 * Uses simple SVG-based charts (no external charting library)
 */

import {
  Card,
  BlockStack,
  InlineStack,
  Text,
  Box,
  Grid,
} from '@shopify/polaris';

export interface TrendChartsProps {
  trends: {
    approvals: Array<{ date: string; approved: number; rejected: number }>;
    roi: Array<{ week: string; roi: number }>;
  };
}

export function TrendCharts({ trends }: TrendChartsProps) {
  return (
    <Grid columns={{ xs: 1, sm: 1, md: 2, lg: 2, xl: 2 }}>
      {/* Approval Trend Chart */}
      <Card>
        <BlockStack gap="400">
          <Text variant="headingMd" as="h3">
            Approval Trend
          </Text>
          
          <Box>
            <ApprovalTrendChart data={trends.approvals} />
          </Box>

          <InlineStack gap="400" align="center">
            <InlineStack gap="200" blockAlign="center">
              <Box
                background="bg-fill-success"
                borderRadius="100"
                style={{ width: '12px', height: '12px' }}
              />
              <Text variant="bodySm">Approved</Text>
            </InlineStack>
            <InlineStack gap="200" blockAlign="center">
              <Box
                background="bg-fill-critical"
                borderRadius="100"
                style={{ width: '12px', height: '12px' }}
              />
              <Text variant="bodySm">Rejected</Text>
            </InlineStack>
          </InlineStack>
        </BlockStack>
      </Card>

      {/* ROI Trend Chart */}
      <Card>
        <BlockStack gap="400">
          <Text variant="headingMd" as="h3">
            ROI by Week
          </Text>
          
          <Box>
            <ROITrendChart data={trends.roi} />
          </Box>

          <Text variant="bodySm" tone="subdued" alignment="center">
            Weekly revenue impact
          </Text>
        </BlockStack>
      </Card>
    </Grid>
  );
}

/**
 * Simple SVG-based approval trend chart
 */
function ApprovalTrendChart({ 
  data 
}: { 
  data: Array<{ date: string; approved: number; rejected: number }> 
}) {
  const maxValue = Math.max(
    ...data.map(d => Math.max(d.approved, d.rejected))
  );
  const width = 400;
  const height = 200;
  const padding = 40;

  const xScale = (index: number) => 
    padding + (index * (width - padding * 2) / (data.length - 1));
  
  const yScale = (value: number) =>
    height - padding - ((value / maxValue) * (height - padding * 2));

  // Generate path for approved line
  const approvedPath = data.map((d, i) => {
    const x = xScale(i);
    const y = yScale(d.approved);
    return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
  }).join(' ');

  // Generate path for rejected line
  const rejectedPath = data.map((d, i) => {
    const x = xScale(i);
    const y = yScale(d.rejected);
    return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '200px' }}>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
        <line
          key={ratio}
          x1={padding}
          y1={height - padding - (ratio * (height - padding * 2))}
          x2={width - padding}
          y2={height - padding - (ratio * (height - padding * 2))}
          stroke="#e4e5e7"
          strokeWidth="1"
        />
      ))}

      {/* Approved line */}
      <path
        d={approvedPath}
        fill="none"
        stroke="var(--p-color-bg-fill-success)"
        strokeWidth="3"
      />

      {/* Rejected line */}
      <path
        d={rejectedPath}
        fill="none"
        stroke="var(--p-color-bg-fill-critical)"
        strokeWidth="3"
      />

      {/* Data points */}
      {data.map((d, i) => (
        <g key={i}>
          <circle
            cx={xScale(i)}
            cy={yScale(d.approved)}
            r="4"
            fill="var(--p-color-bg-fill-success)"
          />
          <circle
            cx={xScale(i)}
            cy={yScale(d.rejected)}
            r="4"
            fill="var(--p-color-bg-fill-critical)"
          />
        </g>
      ))}
    </svg>
  );
}

/**
 * Simple SVG-based ROI bar chart
 */
function ROITrendChart({ 
  data 
}: { 
  data: Array<{ week: string; roi: number }> 
}) {
  const maxValue = Math.max(...data.map(d => d.roi));
  const width = 400;
  const height = 200;
  const padding = 40;
  const barWidth = (width - padding * 2) / data.length - 10;

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: 'compact',
    }).format(value);
  };

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '200px' }}>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
        <line
          key={ratio}
          x1={padding}
          y1={height - padding - (ratio * (height - padding * 2))}
          x2={width - padding}
          y2={height - padding - (ratio * (height - padding * 2))}
          stroke="#e4e5e7"
          strokeWidth="1"
        />
      ))}

      {/* Bars */}
      {data.map((d, i) => {
        const barHeight = (d.roi / maxValue) * (height - padding * 2);
        const x = padding + (i * (width - padding * 2) / data.length) + 5;
        const y = height - padding - barHeight;

        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill="var(--p-color-bg-fill-info)"
              rx="4"
            />
            <text
              x={x + barWidth / 2}
              y={height - padding + 20}
              textAnchor="middle"
              fontSize="12"
              fill="#6d7175"
            >
              {d.week}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

