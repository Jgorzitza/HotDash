import React from "react";
interface SortableTileProps {
    id: string;
    children: React.ReactNode;
}
/**
 * Sortable wrapper component for dashboard tiles
 *
 * Uses @dnd-kit/sortable for drag and drop functionality.
 * Wraps tile content with sortable behavior including:
 * - Drag handle via listeners
 * - Smooth animations with CSS transforms
 * - Touch support for mobile
 *
 * Based on Context7 documentation: /websites/dndkit
 */
export declare function SortableTile({ id, children }: SortableTileProps): React.JSX.Element;
export {};
//# sourceMappingURL=SortableTile.d.ts.map