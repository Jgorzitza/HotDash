export type TrafficSummary = {
  sessions: number;
  users: number;
  pageviews: number;
  conversions: number;
  revenue: number;
};

export function getSampleTraffic(): TrafficSummary {
  return {
    sessions: 1200,
    users: 980,
    pageviews: 3400,
    conversions: 36,
    revenue: 4521.75,
  };
}

