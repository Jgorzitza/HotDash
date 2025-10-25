/**
 * Action Queue Card Component
 *
 * Displays action recommendations with GA4 attribution tracking.
 * Part of Growth Engine - Action ROI measurement and queue re-ranking.
 *
 * ENG-032: Action Link Click Handler with hd_action_key attribution
 */
export interface ActionQueueItem {
    id: string;
    actionKey: string;
    actionType: "seo" | "inventory" | "content" | "pricing" | "ads";
    title: string;
    description: string;
    targetUrl: string;
    expectedRevenue: number;
    priority: "high" | "medium" | "low";
    status: "pending" | "approved" | "applied";
    createdAt: string;
    realizedRevenue7d?: number;
    realizedRevenue14d?: number;
    realizedRevenue28d?: number;
    conversionRate?: number;
}
export interface ActionQueueCardProps {
    action: ActionQueueItem;
    onApprove?: (actionId: string) => void;
    onReject?: (actionId: string) => void;
    onViewDetails?: (actionId: string) => void;
}
export declare function ActionQueueCard({ action, onApprove, onReject, onViewDetails, }: ActionQueueCardProps): React.JSX.Element;
//# sourceMappingURL=ActionQueueCard.d.ts.map