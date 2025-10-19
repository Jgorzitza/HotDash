/**
 * Cohort Analysis
 *
 * Analyzes customer behavior by cohort (e.g., month of first purchase).
 * Tracks retention and LTV by cohort.
 */

export interface Cohort {
  cohortId: string;
  cohortDate: string; // Month of first purchase
  customersCount: number;
  totalRevenue: number;
  averageLTV: number;
  retentionRates: {
    month1: number;
    month3: number;
    month6: number;
    month12: number;
  };
}

export interface CohortAnalysisResult {
  cohorts: Cohort[];
  summary: {
    totalCohorts: number;
    avgRetention3Month: number;
    avgRetention12Month: number;
    bestPerformingCohort: string;
  };
}

/**
 * Generate mock cohort data
 */
export function getCohortAnalysis(): CohortAnalysisResult {
  const cohorts: Cohort[] = [];
  const today = new Date();

  for (let i = 0; i < 12; i++) {
    const cohortDate = new Date(today);
    cohortDate.setMonth(today.getMonth() - i);
    const dateStr = cohortDate.toISOString().substring(0, 7);

    cohorts.push({
      cohortId: `cohort-${dateStr}`,
      cohortDate: dateStr,
      customersCount: Math.round(40 + Math.random() * 20),
      totalRevenue: Math.round(3000 + Math.random() * 2000),
      averageLTV: Math.round(200 + Math.random() * 100),
      retentionRates: {
        month1: 85 + Math.random() * 10,
        month3: 60 + Math.random() * 15,
        month6: 40 + Math.random() * 15,
        month12: 25 + Math.random() * 10,
      },
    });
  }

  const avgRetention3 =
    cohorts.reduce((sum, c) => sum + c.retentionRates.month3, 0) /
    cohorts.length;
  const avgRetention12 =
    cohorts
      .filter((c) => c.retentionRates.month12)
      .reduce((sum, c) => sum + c.retentionRates.month12, 0) / cohorts.length;

  const bestCohort = cohorts.reduce((best, current) =>
    current.averageLTV > best.averageLTV ? current : best,
  );

  return {
    cohorts,
    summary: {
      totalCohorts: cohorts.length,
      avgRetention3Month: avgRetention3,
      avgRetention12Month: avgRetention12,
      bestPerformingCohort: bestCohort.cohortId,
    },
  };
}
