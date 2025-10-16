/**
 * Dashboard Service Outputs
 * Task 12
 */
export interface DashboardTileOutput {
  id: string;
  title: string;
  value: number | string;
  change?: number;
  status: 'good' | 'warning' | 'critical';
}

export function formatDashboardTiles(metrics: any): DashboardTileOutput[] {
  return [
    {
      id: 'open_conversations',
      title: 'Open Conversations',
      value: metrics.overview.openConversations,
      status: metrics.overview.openConversations > 20 ? 'warning' : 'good',
    },
    {
      id: 'sla_compliance',
      title: 'SLA Compliance',
      value: metrics.sla.responseComplianceRate.toFixed(1) + '%',
      status: metrics.sla.responseComplianceRate >= 95 ? 'good' : 'warning',
    },
  ];
}
