export interface DateRange {
    start: string;
    end: string;
}
export interface GaSession {
    landingPage: string;
    sessions: number;
    wowDelta: number;
    evidenceUrl?: string;
}
export interface GaClient {
    fetchLandingPageSessions(range: DateRange): Promise<GaSession[]>;
}
//# sourceMappingURL=client.d.ts.map