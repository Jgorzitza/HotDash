/**
 * Idea Pool Tile
 *
 * Displays product idea backlog health showing pool capacity (5/5),
 * wildcard status, and pending/accepted/rejected counts.
 *
 * Spec: docs/design/dashboard-tiles.md (Section 12)
 */
export interface IdeaPoolData {
    totalIdeas: number;
    maxIdeas: number;
    wildcardId?: string;
    wildcardTitle?: string;
    pendingCount: number;
    acceptedCount: number;
    rejectedCount: number;
}
interface IdeaPoolTileProps {
    data?: IdeaPoolData;
    loading?: boolean;
    error?: string;
}
export declare function IdeaPoolTile({ data, loading, error }: IdeaPoolTileProps): React.JSX.Element;
export {};
//# sourceMappingURL=IdeaPoolTile.d.ts.map