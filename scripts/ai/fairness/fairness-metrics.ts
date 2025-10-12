/**
 * Task AF: AI Fairness Metrics
 */

function calculateTPRByGroup(outcomes: any[]): Record<string, number> {
  const byGroup = groupBy(outcomes, 'demographic');
  const tpr: Record<string, number> = {};
  
  for (const [group, items] of Object.entries(byGroup)) {
    const itemsArray = items as any[];
    const truePositives = itemsArray.filter((i: any) => i.actual === 'positive' && i.predicted === 'positive').length;
    const actualPositives = itemsArray.filter((i: any) => i.actual === 'positive').length;
    tpr[group] = truePositives / actualPositives;
  }
  
  return tpr;
}

function averageQuality(responses: any[]): number {
  if (responses.length === 0) return 0;
  return responses.reduce((sum, r) => sum + (r.quality_score || 0), 0) / responses.length;
}

function groupBy(arr: any[], key: string): Record<string, any[]> {
  return arr.reduce((groups: Record<string, any[]>, item) => {
    const group = item[key] || 'unknown';
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
}

export const FAIRNESS_METRICS = {
  demographic_parity: (outcomes: any[]) => {
    const byGroup = groupBy(outcomes, 'demographic');
    const rates = Object.values(byGroup).map((g: any) => g.filter((o: any) => o.positive).length / g.length);
    const maxDiff = Math.max(...rates) - Math.min(...rates);
    return { score: 1 - maxDiff, threshold: 0.10, pass: maxDiff < 0.10 };
  },
  
  equal_opportunity: (outcomes: any[]) => {
    // True positive rate equality across groups
    const tprByGroup = calculateTPRByGroup(outcomes);
    const tprValues = Object.values(tprByGroup) as number[];
    const maxDiff = Math.max(...tprValues) - Math.min(...tprValues);
    return { score: 1 - maxDiff, threshold: 0.10, pass: maxDiff < 0.10 };
  },
  
  treatment_equality: (responses: any[]) => {
    // Response quality equality across customer segments
    const qualityBySegment = {
      standard: averageQuality(responses.filter(r => r.customerType === 'standard')),
      vip: averageQuality(responses.filter(r => r.customerType === 'vip')),
    };
    const diff = Math.abs(qualityBySegment.standard - qualityBySegment.vip);
    return { score: 1 - diff, threshold: 0.05, pass: diff < 0.05 };
  },
};
