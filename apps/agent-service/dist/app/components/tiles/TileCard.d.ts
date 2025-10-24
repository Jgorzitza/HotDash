import type { ReactNode } from "react";
export type TileStatus = "ok" | "error" | "unconfigured";
export type TileSource = "fresh" | "cache" | "mock" | "api";
export interface TileFact {
    id: number;
    createdAt: string;
}
export interface TileState<T> {
    status: TileStatus;
    data?: T;
    fact?: TileFact;
    source?: TileSource;
    error?: string;
}
interface TileCardProps<T> {
    title: string;
    tile: TileState<T>;
    render: (data: T) => ReactNode;
    testId?: string;
    onRefresh?: () => void;
    isRefreshing?: boolean;
    autoRefreshInterval?: number;
    showRefreshIndicator?: boolean;
}
export declare function TileCard<T>({ title, tile, render, testId, onRefresh, isRefreshing, autoRefreshInterval, showRefreshIndicator, }: TileCardProps<T>): React.JSX.Element;
export {};
//# sourceMappingURL=TileCard.d.ts.map