import { BigQuery } from '@google-cloud/bigquery';
import type { GSCPage, GSCAnomalyDetection, GSCExportConfig } from './client';

/**
 * BigQuery Export for Google Search Console Data
 *
 * Exports GSC organic search data and anomalies to BigQuery for
 * long-term storage, analysis, and reporting.
 *
 * @module services/gsc/bigquery-export
 *
 * ## Authentication
 *
 * Uses GOOGLE_APPLICATION_CREDENTIALS environment variable.
 *
 * ## Schema
 *
 * ### gsc_organic_pages table:
 * - date: DATE (partition key)
 * - url: STRING
 * - clicks: INTEGER
 * - impressions: INTEGER
 * - ctr: FLOAT
 * - position: FLOAT
 * - wow_delta: FLOAT
 * - exported_at: TIMESTAMP
 *
 * ### gsc_anomalies table:
 * - detection_date: DATE (partition key)
 * - page: STRING
 * - current_clicks: INTEGER
 * - previous_clicks: INTEGER
 * - delta: INTEGER
 * - delta_percentage: FLOAT
 * - anomaly_type: STRING (spike/drop/none)
 * - exported_at: TIMESTAMP
 *
 * @example
 * ```typescript
 * const exporter = createBigQueryExporter({
 *   projectId: 'hotdash-prod',
 *   datasetId: 'analytics',
 *   tableId: 'gsc_organic_pages'
 * });
 *
 * await exporter.exportPages(pages, '2025-10-14');
 * ```
 */
export function createBigQueryExporter(config: GSCExportConfig) {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS environment variable required');
  }

  const bigquery = new BigQuery({
    projectId: config.projectId,
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  });

  return {
    /**
     * Export GSC organic pages data to BigQuery
     * @param pages - Array of GSC page data
     * @param date - Date string (YYYY-MM-DD) for partition
     */
    async exportPages(pages: GSCPage[], date: string): Promise<void> {
      const dataset = bigquery.dataset(config.datasetId);
      const table = dataset.table('gsc_organic_pages');

      // Ensure table exists with proper schema
      const [tableExists] = await table.exists();
      if (!tableExists) {
        await table.create({
          schema: {
            fields: [
              { name: 'date', type: 'DATE', mode: 'REQUIRED' },
              { name: 'url', type: 'STRING', mode: 'REQUIRED' },
              { name: 'clicks', type: 'INTEGER', mode: 'REQUIRED' },
              { name: 'impressions', type: 'INTEGER', mode: 'REQUIRED' },
              { name: 'ctr', type: 'FLOAT', mode: 'REQUIRED' },
              { name: 'position', type: 'FLOAT', mode: 'REQUIRED' },
              { name: 'wow_delta', type: 'FLOAT', mode: 'REQUIRED' },
              { name: 'exported_at', type: 'TIMESTAMP', mode: 'REQUIRED' },
            ],
          },
          timePartitioning: {
            type: 'DAY',
            field: 'date',
          },
        });
      }

      // Transform data for BigQuery
      const rows = pages.map((page) => ({
        date,
        url: page.url,
        clicks: page.clicks,
        impressions: page.impressions,
        ctr: page.ctr,
        position: page.position,
        wow_delta: page.wowDelta,
        exported_at: new Date().toISOString(),
      }));

      // Insert rows
      await table.insert(rows);

      console.log(
        `[BigQuery] Exported ${rows.length} GSC pages to ${config.projectId}.${config.datasetId}.gsc_organic_pages`
      );
    },

    /**
     * Export GSC anomalies to BigQuery
     * @param anomalies - Array of anomaly detections
     * @param detectionDate - Date string (YYYY-MM-DD) for partition
     */
    async exportAnomalies(
      anomalies: GSCAnomalyDetection[],
      detectionDate: string
    ): Promise<void> {
      const dataset = bigquery.dataset(config.datasetId);
      const table = dataset.table('gsc_anomalies');

      // Ensure table exists
      const [tableExists] = await table.exists();
      if (!tableExists) {
        await table.create({
          schema: {
            fields: [
              { name: 'detection_date', type: 'DATE', mode: 'REQUIRED' },
              { name: 'page', type: 'STRING', mode: 'REQUIRED' },
              { name: 'current_clicks', type: 'INTEGER', mode: 'REQUIRED' },
              { name: 'previous_clicks', type: 'INTEGER', mode: 'REQUIRED' },
              { name: 'delta', type: 'INTEGER', mode: 'REQUIRED' },
              { name: 'delta_percentage', type: 'FLOAT', mode: 'REQUIRED' },
              { name: 'is_anomaly', type: 'BOOLEAN', mode: 'REQUIRED' },
              { name: 'anomaly_type', type: 'STRING', mode: 'REQUIRED' },
              { name: 'exported_at', type: 'TIMESTAMP', mode: 'REQUIRED' },
            ],
          },
          timePartitioning: {
            type: 'DAY',
            field: 'detection_date',
          },
        });
      }

      // Transform data for BigQuery
      const rows = anomalies.map((anomaly) => ({
        detection_date: detectionDate,
        page: anomaly.page,
        current_clicks: anomaly.currentClicks,
        previous_clicks: anomaly.previousClicks,
        delta: anomaly.delta,
        delta_percentage: anomaly.deltaPercentage,
        is_anomaly: anomaly.isAnomaly,
        anomaly_type: anomaly.anomalyType,
        exported_at: new Date().toISOString(),
      }));

      // Insert rows
      await table.insert(rows);

      console.log(
        `[BigQuery] Exported ${rows.length} GSC anomalies to ${config.projectId}.${config.datasetId}.gsc_anomalies`
      );
    },
  };
}

