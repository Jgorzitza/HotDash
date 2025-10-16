/**
 * Export CSV of Anomalies
 * @module lib/seo/export-csv
 */

import type { SEOAnomaly } from './anomalies';

export function exportAnomaliesCSV(anomalies: SEOAnomaly[]): string {
  const headers = ['Type', 'Severity', 'Title', 'Description', 'URL', 'Current Value', 'Previous Value', 'Change %', 'Detected At'];
  const rows = anomalies.map(a => [
    a.type,
    a.severity,
    a.title,
    a.description,
    a.affectedUrl || '',
    a.metric.current.toString(),
    a.metric.previous?.toString() || '',
    a.metric.changePercent ? (a.metric.changePercent * 100).toFixed(2) + '%' : '',
    a.detectedAt,
  ]);
  
  const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  return csv;
}

export function downloadCSV(csv: string, filename: string): void {
  if (typeof window === 'undefined') return;
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
