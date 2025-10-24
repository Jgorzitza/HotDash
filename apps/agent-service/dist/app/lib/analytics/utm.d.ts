export interface UTMBreakdownRow {
    source: string;
    medium: string;
    campaign: string;
    sessions: number;
    users: number;
    conversions: number;
    revenue: number;
    conversionRate: number;
}
export declare function getUTMBreakdown(): Promise<UTMBreakdownRow[]>;
//# sourceMappingURL=utm.d.ts.map