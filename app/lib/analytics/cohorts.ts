/**
 * Cohort Analysis
 * 
 * Track user cohorts by week and analyze retention.
 */

import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { getGaConfig } from '../../config/ga.server.ts';
import { appMetrics } from '../../utils/metrics.server.ts';

export interface CohortData {
  cohortWeek: string;
  newUsers: number;
  retention: {
    week0: number;
    week1: number;
    week2: number;
    week3: number;
    week4: number;
  };
}

export async function getCohortAnalysis(weeks: number = 8): Promise<CohortData[]> {
  const startTime = Date.now();
  
  try {
    const config = getGaConfig();
    const client = new BetaAnalyticsDataClient();

    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (weeks * 7));

    const [response] = await client.runReport({
      property: `properties/${config.propertyId}`,
      dateRanges: [{ 
        startDate: startDate.toISOString().split('T')[0], 
        endDate: today.toISOString().split('T')[0] 
      }],
      dimensions: [{ name: 'cohort' }, { name: 'cohortNthWeek' }],
      metrics: [{ name: 'cohortActiveUsers' }],
    });

    const cohortMap = new Map<string, any>();
    
    response.rows?.forEach((row) => {
      const cohort = row.dimensionValues?.[0]?.value || '';
      const week = parseInt(row.dimensionValues?.[1]?.value || '0', 10);
      const users = parseInt(row.metricValues?.[0]?.value || '0', 10);
      
      if (!cohortMap.has(cohort)) {
        cohortMap.set(cohort, { cohortWeek: cohort, newUsers: 0, retention: {} });
      }
      
      const cohortData = cohortMap.get(cohort);
      if (week === 0) {
        cohortData.newUsers = users;
      }
      cohortData.retention[`week${week}`] = users;
    });

    const cohorts: CohortData[] = Array.from(cohortMap.values()).map(cohort => ({
      cohortWeek: cohort.cohortWeek,
      newUsers: cohort.newUsers,
      retention: {
        week0: cohort.retention.week0 || 0,
        week1: cohort.retention.week1 || 0,
        week2: cohort.retention.week2 || 0,
        week3: cohort.retention.week3 || 0,
        week4: cohort.retention.week4 || 0,
      },
    }));

    const duration = Date.now() - startTime;
    appMetrics.gaApiCall('getCohortAnalysis', true, duration);

    return cohorts;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    appMetrics.gaApiCall('getCohortAnalysis', false, duration);
    throw error;
  }
}

