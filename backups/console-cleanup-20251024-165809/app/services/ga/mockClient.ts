import type { DateRange, GaClient, GaSession } from "./client";

const SAMPLE_DATA: GaSession[] = [
  {
    landingPage: "/collections/new-arrivals",
    sessions: 420,
    wowDelta: -0.18,
  },
  {
    landingPage: "/products/featured-widget",
    sessions: 310,
    wowDelta: 0.05,
  },
  {
    landingPage: "/blogs/news/october-launch",
    sessions: 120,
    wowDelta: -0.27,
  },
];

export function createMockGaClient(): GaClient {
  return {
    async fetchLandingPageSessions(_range: DateRange) {
      return SAMPLE_DATA;
    },
  };
}
