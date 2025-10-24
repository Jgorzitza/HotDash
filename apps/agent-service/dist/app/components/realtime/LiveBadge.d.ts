/**
 * Live Badge Component
 *
 * Real-time updating badge for approval queue count
 * Updates via SSE without page reload
 *
 * Features:
 * - Pulse animation on update
 * - Color-coded by urgency (gray/blue/yellow/red)
 * - Accessible count announcement
 *
 * Phase 5 - ENG-024
 */
interface LiveBadgeProps {
    count: number;
    label?: string;
    showPulse?: boolean;
}
export declare function LiveBadge({ count, label, showPulse, }: LiveBadgeProps): React.JSX.Element;
export {};
//# sourceMappingURL=LiveBadge.d.ts.map