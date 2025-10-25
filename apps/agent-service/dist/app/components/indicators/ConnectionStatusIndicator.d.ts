/**
 * Connection Status Indicator Component
 *
 * Displays SSE connection status with visual indicators and quality metrics.
 * Shows connection quality, last message time, and reconnection status.
 */
import React from "react";
interface ConnectionStatusIndicatorProps {
    status: "connecting" | "connected" | "disconnected" | "error";
    connectionQuality: "excellent" | "good" | "poor" | "disconnected";
    lastMessage?: {
        timestamp: string;
    } | null;
    lastHeartbeat?: Date | null;
    showDetails?: boolean;
    size?: "small" | "medium" | "large";
}
export declare function ConnectionStatusIndicator({ status, connectionQuality, lastMessage, lastHeartbeat, showDetails, size, }: ConnectionStatusIndicatorProps): React.JSX.Element;
export declare const connectionStatusStyles = "\n  @keyframes pulse {\n    0% {\n      transform: scale(1);\n      opacity: 1;\n    }\n    50% {\n      transform: scale(1.2);\n      opacity: 0.7;\n    }\n    100% {\n      transform: scale(1);\n      opacity: 1;\n    }\n  }\n";
export {};
//# sourceMappingURL=ConnectionStatusIndicator.d.ts.map