/**
 * Competitor Analysis Service
 *
 * Compare our keyword rankings against competitors and surface
 * opportunities and risks. Pure functions; inputs are pre-collected data.
 *
 * Allowed path: app/services/seo/competitors.ts
 */

import type { KeywordRanking, RankingChange } from '../../lib/seo/rankings';

export interface Competitor {
  name: string;
  rankings: KeywordRanking[];
}

export interface VisibilityScore {
  domain: string;
  score: number; // 0-100
}

export interface CompetitorInsight {
  keyword: string;
  url?: string;
  ourPosition?: number;
  competitor: string;
  competitorPosition: number;
  gap: number; // positive => competitor ahead
  type: 'opportunity' | 'risk';
}

function computeVisibility(rankings: KeywordRanking[]): number {
  if (!rankings.length) return 0;
  // Simple visibility: impressions weighted by position (higher weight for top positions)
  const weighted = rankings.reduce((acc, r) => acc + (r.impressions || 0) * (Math.max(1, 11 - Math.min(10, r.position))), 0);
  const denom = rankings.reduce((acc, r) => acc + (r.impressions || 0) * 10, 0) || 1;
  return Math.round((weighted / denom) * 100);
}

export function compareDomainVisibility(ours: KeywordRanking[], competitor: Competitor): VisibilityScore[] {
  return [
    { domain: 'us', score: computeVisibility(ours) },
    { domain: competitor.name, score: computeVisibility(competitor.rankings) },
  ];
}

export function findKeywordGaps(our: KeywordRanking[], competitors: Competitor[]): CompetitorInsight[] {
  const insights: CompetitorInsight[] = [];
  const ourMap = new Map<string, KeywordRanking>();
  for (const r of our) ourMap.set(`${r.keyword}|${r.country}|${r.device}`, r);

  for (const comp of competitors) {
    for (const cr of comp.rankings) {
      const key = `${cr.keyword}|${cr.country}|${cr.device}`;
      const or = ourMap.get(key);
      if (!or) {
        // We have no ranking; competitor does => opportunity to create/optimize content
        insights.push({ keyword: cr.keyword, url: cr.url, competitor: comp.name, competitorPosition: cr.position, type: 'opportunity', gap: 99 });
      } else {
        const gap = or.position - cr.position; // positive means competitor is ahead of us (better)
        if (gap > 5) {
          // Large gap where competitor is significantly ahead — flag as risk
          insights.push({ keyword: cr.keyword, url: or.url, competitor: comp.name, competitorPosition: cr.position, ourPosition: or.position, gap, type: 'risk' });
        } else if (gap > 0) {
          // Smaller gap — opportunity to improve
          insights.push({ keyword: cr.keyword, url: or.url, competitor: comp.name, competitorPosition: cr.position, ourPosition: or.position, gap, type: 'opportunity' });
        }
        // If gap <= 0, we are equal or ahead — no risk/opportunity emitted
      }
    }
  }

  // Sort: opportunities with largest gap first
  return insights.sort((a, b) => b.gap - a.gap).slice(0, 100);
}

export function summarizeCompetitors(
  our: KeywordRanking[],
  competitors: Competitor[]
): { visibility: VisibilityScore[]; insights: CompetitorInsight[] } {
  const visibility = competitors.flatMap(c => compareDomainVisibility(our, c));
  const insights = findKeywordGaps(our, competitors);
  return { visibility, insights };
}

