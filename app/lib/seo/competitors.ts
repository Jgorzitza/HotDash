/**
 * Competitor Position Tracking
 * Track top 3 competitors for main keywords and alert on position gains
 */

export interface CompetitorRanking {
  keyword: string;
  competitor: string;
  position: number;
  url: string;
  recordedAt: string;
}

export interface CompetitorAlert {
  keyword: string;
  competitor: string;
  previousPosition: number;
  currentPosition: number;
  positionGain: number; // Negative = they moved up (gained)
  severity: "warning" | "info";
}

/**
 * Track top 3 competitors for a keyword
 */
export async function trackCompetitors(
  keyword: string,
  topCompetitors: string[] = [],
): Promise<CompetitorRanking[]> {
  // Stub - in production, fetch from Search Console API
  console.warn("trackCompetitors: Stub implementation");

  return topCompetitors.slice(0, 3).map((competitor, index) => ({
    keyword,
    competitor,
    position: index + 1,
    url: `https://${competitor}/example`,
    recordedAt: new Date().toISOString(),
  }));
}

/**
 * Detect if competitors gained positions
 */
export function detectCompetitorGains(
  current: CompetitorRanking[],
  previous: CompetitorRanking[],
): CompetitorAlert[] {
  const alerts: CompetitorAlert[] = [];

  const prevMap = new Map(
    previous.map((r) => [`${r.keyword}:${r.competitor}`, r.position]),
  );

  for (const curr of current) {
    const key = `${curr.keyword}:${curr.competitor}`;
    const prevPosition = prevMap.get(key);

    if (prevPosition !== undefined) {
      const positionGain = curr.position - prevPosition;

      // Alert if competitor moved up (gained) by 3+ positions
      if (positionGain <= -3) {
        alerts.push({
          keyword: curr.keyword,
          competitor: curr.competitor,
          previousPosition: prevPosition,
          currentPosition: curr.position,
          positionGain,
          severity: positionGain <= -5 ? "warning" : "info",
        });
      }
    }
  }

  return alerts;
}
