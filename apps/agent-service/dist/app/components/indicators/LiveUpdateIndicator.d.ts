/**
 * Live Update Indicator Component
 *
 * Displays pulse animation and timestamp for live updates.
 * Used to show when tiles have been refreshed or updated.
 */
import React from "react";
interface LiveUpdateIndicatorProps {
    isUpdating?: boolean;
    lastUpdated?: Date;
    size?: "small" | "medium" | "large";
    showTimestamp?: boolean;
    className?: string;
}
export declare function LiveUpdateIndicator({ isUpdating, lastUpdated, size, showTimestamp, className, }: LiveUpdateIndicatorProps): React.JSX.Element;
export declare const liveUpdateStyles = "\n  @keyframes pulse {\n    0% {\n      transform: scale(1);\n      opacity: 1;\n    }\n    50% {\n      transform: scale(1.2);\n      opacity: 0.7;\n    }\n    100% {\n      transform: scale(1);\n      opacity: 1;\n    }\n  }\n\n  .live-update-indicator {\n    display: inline-flex;\n    align-items: center;\n    gap: var(--occ-space-1);\n  }\n";
export declare function useLiveUpdate(): {
    isUpdating: boolean;
    lastUpdated: Date;
    startUpdate: () => void;
    endUpdate: () => void;
    updateComplete: () => void;
};
export {};
//# sourceMappingURL=LiveUpdateIndicator.d.ts.map