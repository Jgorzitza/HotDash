/**
 * Content Gap Analysis
 *
 * Identify topics and keywords competitors rank for that we do not, and
 * suggest content opportunities. Pure functions only.
 *
 * Allowed path: app/services/seo/content-gaps.ts
 */

export interface ContentGapInput {
  ourKeywords: string[]; // normalized queries we rank/target
  competitorKeywords: string[]; // deduped competitor queries
  existingSlugs?: string[]; // known content URLs or slugs to avoid duplicates
}

export interface ContentOpportunity {
  topic: string;
  keywords: string[];
  reason: string;
  difficulty: 'low' | 'medium' | 'high';
  potentialTrafficScore: number; // 0-100 heuristic
  priority: 'P0' | 'P1' | 'P2' | 'P3';
}

function normalizeKeyword(k: string): string {
  return k.trim().toLowerCase();
}

function estimateDifficulty(keyword: string): 'low' | 'medium' | 'high' {
  // Naive heuristic: length and presence of modifiers
  const len = keyword.split(' ').length;
  if (len <= 2) return 'high'; // usually short, competitive
  if (len >= 4) return 'low';
  return 'medium';
}

function trafficHeuristic(keyword: string): number {
  // Longer tail tends to have lower traffic but higher conversion; bound 30-80
  const base = 80 - Math.min(30, Math.max(0, (keyword.split(' ').length - 2) * 10));
  return Math.max(30, Math.min(80, base));
}

function toPriority(difficulty: 'low' | 'medium' | 'high', traffic: number): 'P0' | 'P1' | 'P2' | 'P3' {
  if (difficulty === 'low' && traffic >= 60) return 'P0';
  if (difficulty !== 'high' && traffic >= 50) return 'P1';
  if (traffic >= 40) return 'P2';
  return 'P3';
}

export function findContentGaps(input: ContentGapInput): ContentOpportunity[] {
  const our = new Set(input.ourKeywords.map(normalizeKeyword));
  const existing = new Set((input.existingSlugs || []).map(s => s.toLowerCase()));

  const gaps = input.competitorKeywords
    .map(normalizeKeyword)
    .filter(k => !our.has(k))
    .filter(k => !existing.has(k.replace(/\s+/g, '-')));

  // Group by topic (first 2 words) for a simple clustering
  const clusters = new Map<string, string[]>();
  for (const k of gaps) {
    const topic = k.split(' ').slice(0, 2).join(' ');
    clusters.set(topic, [...(clusters.get(topic) || []), k]);
  }

  const opportunities: ContentOpportunity[] = [];
  for (const [topic, keywords] of clusters.entries()) {
    // Choose the representative keyword with highest traffic heuristic
    let best = keywords[0];
    let bestTraffic = trafficHeuristic(best);
    for (const k of keywords.slice(1)) {
      const t = trafficHeuristic(k);
      if (t > bestTraffic) {
        best = k;
        bestTraffic = t;
      }
    }
    const diff = estimateDifficulty(best);
    opportunities.push({
      topic,
      keywords: keywords.slice(0, 5),
      reason: 'Competitors rank for these queries while we do not. Create targeted content to close gaps.',
      difficulty: diff,
      potentialTrafficScore: bestTraffic,
      priority: toPriority(diff, bestTraffic),
    });
  }

  // Prioritize highest value first
  return opportunities.sort((a, b) => {
    const p = ['P0', 'P1', 'P2', 'P3'] as const;
    const ai = p.indexOf(a.priority);
    const bi = p.indexOf(b.priority);
    if (ai !== bi) return ai - bi;
    return b.potentialTrafficScore - a.potentialTrafficScore;
  });
}

