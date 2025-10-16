/**
 * SEO Recommendations Engine
 *
 * Aggregates signals from rankings, vitals, crawl errors, content gaps,
 * and meta tag audits to produce prioritized, human-readable SEO actions.
 * Pure functions; no network calls.
 *
 * Allowed path: app/services/seo/recommendations.ts
 */

import type { RankingChange, KeywordRanking } from '../../lib/seo/rankings';
import type { PageVitals, VitalsAlert } from '../../lib/seo/web-vitals';
import type { CrawlError } from '../../lib/seo/crawl-errors';
import type { ContentOpportunity } from './content-gaps';
import type { MetaOptimizeResult } from './meta-optimizer';

export type Priority = 'P0' | 'P1' | 'P2' | 'P3';

export interface SEORecommendation {
  id: string;
  category: 'rankings' | 'vitals' | 'crawl' | 'meta' | 'content';
  action: string;
  rationale: string;
  evidence?: Record<string, unknown>;
  priority: Priority;
}

function priFromScore(score: number): Priority {
  if (score >= 90) return 'P0';
  if (score >= 70) return 'P1';
  if (score >= 50) return 'P2';
  return 'P3';
}

export interface RecommendationInputs {
  rankingChanges?: RankingChange[];
  currentRankings?: KeywordRanking[];
  vitalsAlerts?: VitalsAlert[];
  vitalsPages?: PageVitals[];
  crawlErrors?: CrawlError[];
  contentOps?: ContentOpportunity[];
  meta?: MetaOptimizeResult;
}

export function generateRecommendations(inputs: RecommendationInputs): SEORecommendation[] {
  const recs: SEORecommendation[] = [];

  // Rankings: surface major drops and top opportunities
  (inputs.rankingChanges || [])
    .filter(c => c.severity === 'major')
    .slice(0, 10)
    .forEach(c => recs.push({
      id: `rank-drop:${c.keyword}:${c.url}`,
      category: 'rankings',
      action: `Investigate ranking ${c.changeType} of ${c.change} for "${c.keyword}" → ${c.currentPosition}`,
      rationale: 'Large ranking movements can signal technical or competitive changes. Address promptly.',
      evidence: { change: c.change, position: c.currentPosition, url: c.url, date: c.date },
      priority: c.changeType === 'drop' ? 'P0' : 'P1',
    }));

  // Vitals: critical alerts first
  (inputs.vitalsAlerts || [])
    .filter(a => a.severity === 'critical')
    .slice(0, 10)
    .forEach(a => recs.push({
      id: `vitals:${a.metric}:${a.url}`,
      category: 'vitals',
      action: `Reduce ${a.metric} on ${a.url} (current ${a.currentValue} > threshold ${a.threshold})`,
      rationale: 'Core Web Vitals directly impact rankings and UX. Fix critical issues first.',
      evidence: { metric: a.metric, current: a.currentValue, threshold: a.threshold, device: a.device },
      priority: 'P0',
    }));

  // Crawl errors: critical first
  (inputs.crawlErrors || [])
    .filter(e => e.severity === 'critical')
    .slice(0, 10)
    .forEach(e => recs.push({
      id: `crawl:${e.errorType}:${e.url}`,
      category: 'crawl',
      action: `Fix ${e.errorType} for ${e.url}`,
      rationale: 'Crawl errors prevent indexing and erode equity. Address critical errors immediately.',
      evidence: { count: e.errorCount, first: e.firstDetected, last: e.lastDetected },
      priority: 'P0',
    }));

  // Meta optimization: if score < 80, propose improving title/description
  if (inputs.meta && inputs.meta.score < 80) {
    recs.push({
      id: 'meta:optimize',
      category: 'meta',
      action: 'Improve title/meta description for focus page(s)',
      rationale: 'Clear, keyword-aligned meta can improve CTR and relevance.',
      evidence: { issues: inputs.meta.issues, score: inputs.meta.score },
      priority: priFromScore(60 + Math.max(0, 80 - inputs.meta.score)),
    });
  }

  // Content opportunities
  (inputs.contentOps || [])
    .slice(0, 10)
    .forEach(op => recs.push({
      id: `content:${op.topic}`,
      category: 'content',
      action: `Create content targeting: ${op.topic}`,
      rationale: 'Competitors rank for these terms; capturing them can expand traffic.',
      evidence: { keywords: op.keywords, difficulty: op.difficulty, trafficScore: op.potentialTrafficScore },
      priority: op.priority,
    }));

  // De-duplicate by id, keep highest priority
  const best: Record<string, SEORecommendation> = {};
  for (const r of recs) {
    const existing = best[r.id];
    if (!existing) best[r.id] = r;
    else {
      const order: Priority[] = ['P0', 'P1', 'P2', 'P3'];
      if (order.indexOf(r.priority) < order.indexOf(existing.priority)) best[r.id] = r;
    }
  }

  // Final ordering: P0→P3, then deterministic by category/id
  const order: Priority[] = ['P0', 'P1', 'P2', 'P3'];
  return Object.values(best).sort((a, b) => {
    const pa = order.indexOf(a.priority);
    const pb = order.indexOf(b.priority);
    if (pa !== pb) return pa - pb;
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return a.id.localeCompare(b.id);
  });
}

