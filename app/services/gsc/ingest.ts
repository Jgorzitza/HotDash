import { setCached, getCached } from '../cache.server';
import { recordDashboardFact } from '../facts.server';
import { toInputJson } from '../json';
import { ServiceError, type ServiceResult } from '../types';
import type { DateRange, GSCPage, GSCAnomalyDetection } from './client';
import { createDirectGSCClient } from './directClient';
import { createBigQueryExporter, type GSCExportConfig } from './bigquery-export';

interface GetGSCPagesOptions {
  shopDomain: string;
  range?: DateRange;
  exportToBigQuery?: boolean;
}

interface GetGSCAnomaliesOptions {
  shopDomain: string;
  currentRange?: DateRange;
  previousRange?: DateRange;
  exportToBigQuery?: boolean;
}

const CACHE_TTL_MS = Number(process.env.GSC_CACHE_TTL_MS ?? 5 * 60 * 1000); // 5 min default

function defaultRange(): DateRange {
  const end = new Date();
  const start = new Date(end);
  start.setUTCDate(end.getUTCDate() - 7); // Last 7 days
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

function previousPeriod(range: DateRange): DateRange {
  const startDate = new Date(range.start);
  const endDate = new Date(range.end);
  const periodLength = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const previousStart = new Date(startDate);
  previousStart.setDate(previousStart.getDate() - periodLength);
  const previousEnd = new Date(endDate);
  previousEnd.setDate(previousEnd.getDate() - periodLength);

  return {
    start: previousStart.toISOString().slice(0, 10),
    end: previousEnd.toISOString().slice(0, 10),
  };
}

function getGSCClient() {
  const siteUrl = process.env.GSC_SITE_URL;
  if (!siteUrl) {
    throw new Error('GSC_SITE_URL environment variable required');
  }

  return createDirectGSCClient(siteUrl);
}

function getBigQueryExporter(): ReturnType<typeof createBigQueryExporter> | null {
  const projectId = process.env.BIGQUERY_PROJECT_ID;
  const datasetId = process.env.BIGQUERY_DATASET_ID || 'analytics';

  if (!projectId) {
    console.warn('[GSC] BigQuery export disabled: BIGQUERY_PROJECT_ID not set');
    return null;
  }

  return createBigQueryExporter({
    projectId,
    datasetId,
    tableId: 'gsc_organic_pages', // Not used directly, kept for interface
  });
}

/**
 * Fetch organic search pages from Google Search Console
 *
 * - Filters for web organic search only
 * - Calculates WoW (week-over-week) delta
 * - Optionally exports to BigQuery
 * - Caches results for 5 minutes
 *
 * @param options - Configuration options
 * @returns ServiceResult with GSC page data
 */
export async function getGSCOrganicPages(
  options: GetGSCPagesOptions
): Promise<ServiceResult<GSCPage[]>> {
  const client = getGSCClient();
  const range = options.range ?? defaultRange();
  const cacheKey = `gsc:organic-pages:${range.start}:${range.end}`;

  // Check cache
  const cached = getCached<ServiceResult<GSCPage[]>>(cacheKey);
  if (cached) {
    return { ...cached, source: 'cache' };
  }

  // Fetch data
  let pages: GSCPage[];
  try {
    pages = await client.fetchOrganicPages(range);
  } catch (error) {
    throw new ServiceError('Failed to retrieve GSC organic pages', {
      scope: 'gsc.organic-pages',
      retryable: true,
      cause: error,
    });
  }

  // Export to BigQuery if enabled
  if (options.exportToBigQuery) {
    const exporter = getBigQueryExporter();
    if (exporter) {
      try {
        await exporter.exportPages(pages, range.end);
      } catch (error) {
        console.error('[GSC] BigQuery export failed:', error);
        // Don't fail the request if export fails
      }
    }
  }

  // Record fact
  const fact = await recordDashboardFact({
    shopDomain: options.shopDomain,
    factType: 'gsc.organic-pages',
    scope: 'ops',
    value: toInputJson(pages),
    metadata: toInputJson({
      range,
      generatedAt: new Date().toISOString(),
    }),
  });

  const result: ServiceResult<GSCPage[]> = {
    data: pages,
    fact,
    source: 'fresh',
  };

  // Cache result
  setCached(cacheKey, result, CACHE_TTL_MS);

  return result;
}

/**
 * Detect traffic anomalies in Google Search Console data
 *
 * - Compares current period vs previous period
 * - Flags changes >= 20% as anomalies
 * - Optionally exports to BigQuery
 * - Caches results for 5 minutes
 *
 * @param options - Configuration options
 * @returns ServiceResult with anomaly detections
 */
export async function getGSCAnomalies(
  options: GetGSCAnomaliesOptions
): Promise<ServiceResult<GSCAnomalyDetection[]>> {
  const client = getGSCClient();
  const currentRange = options.currentRange ?? defaultRange();
  const prevRange = options.previousRange ?? previousPeriod(currentRange);
  const cacheKey = `gsc:anomalies:${currentRange.start}:${currentRange.end}:${prevRange.start}:${prevRange.end}`;

  // Check cache
  const cached = getCached<ServiceResult<GSCAnomalyDetection[]>>(cacheKey);
  if (cached) {
    return { ...cached, source: 'cache' };
  }

  // Detect anomalies
  let anomalies: GSCAnomalyDetection[];
  try {
    anomalies = await client.detectAnomalies(currentRange, prevRange);
  } catch (error) {
    throw new ServiceError('Failed to detect GSC anomalies', {
      scope: 'gsc.anomalies',
      retryable: true,
      cause: error,
    });
  }

  // Export to BigQuery if enabled
  if (options.exportToBigQuery) {
    const exporter = getBigQueryExporter();
    if (exporter) {
      try {
        await exporter.exportAnomalies(anomalies, currentRange.end);
      } catch (error) {
        console.error('[GSC] BigQuery anomaly export failed:', error);
        // Don't fail the request if export fails
      }
    }
  }

  // Record fact
  const fact = await recordDashboardFact({
    shopDomain: options.shopDomain,
    factType: 'gsc.anomalies',
    scope: 'ops',
    value: toInputJson(anomalies),
    metadata: toInputJson({
      currentRange,
      previousRange: prevRange,
      generatedAt: new Date().toISOString(),
    }),
  });

  const result: ServiceResult<GSCAnomalyDetection[]> = {
    data: anomalies,
    fact,
    source: 'fresh',
  };

  // Cache result
  setCached(cacheKey, result, CACHE_TTL_MS);

  return result;
}

