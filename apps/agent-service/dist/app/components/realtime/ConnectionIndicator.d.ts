/**
 * Connection Status Indicator
 *
 * Visual indicator for SSE connection status
 * Shows in top-right of dashboard
 *
 * States:
 * - Connected: Green dot with pulse
 * - Connecting: Yellow dot
 * - Disconnected: Gray dot
 * - Error: Red dot
 *
 * Phase 5 - ENG-023
 */
import type { ConnectionStatus } from "~/hooks/useSSE";
interface ConnectionIndicatorProps {
    status: ConnectionStatus;
    lastHeartbeat: Date | null;
}
export declare function ConnectionIndicator({ status, lastHeartbeat, }: ConnectionIndicatorProps): React.JSX.Element;
export {};
//# sourceMappingURL=ConnectionIndicator.d.ts.map