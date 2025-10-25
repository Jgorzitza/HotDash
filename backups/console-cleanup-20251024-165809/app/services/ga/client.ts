export interface DateRange {
  start: string; // ISO date
  end: string; // ISO date
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
