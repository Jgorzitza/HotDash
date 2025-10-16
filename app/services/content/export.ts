/**
 * Content Export Service
 * 
 * Export content data to various formats:
 * - CSV export of posts
 * - Performance reports
 * - Analytics summaries
 */

import type { ContentPerformance, SocialPlatform } from '../../lib/content/tracking';
import type { HITLPost } from './hitl-posting';

// ============================================================================
// Types
// ============================================================================

export interface ExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  dateRange?: {
    start: string;
    end: string;
  };
  platforms?: SocialPlatform[];
  includeMetrics?: boolean;
  includeHashtags?: boolean;
}

export interface CSVRow {
  [key: string]: string | number | boolean;
}

// ============================================================================
// Export Functions
// ============================================================================

/**
 * Export posts to CSV
 */
export async function exportPostsToCSV(
  posts: HITLPost[],
  options: ExportOptions = { format: 'csv' }
): Promise<string> {
  const rows: CSVRow[] = posts.map(post => ({
    id: post.id,
    platform: post.draft.platform,
    content: post.draft.content.replace(/"/g, '""'), // Escape quotes
    status: post.state,
    created_at: post.createdAt,
    published_at: post.publishedAt || '',
    scheduled_for: post.scheduledFor || '',
    tone_grade: post.feedback?.tone || '',
    accuracy_grade: post.feedback?.accuracy || '',
    policy_grade: post.feedback?.policy || '',
    hashtags: post.draft.metadata.hashtags.join(', '),
    character_count: post.draft.metadata.characterCount,
    word_count: post.draft.metadata.wordCount,
  }));

  return convertToCSV(rows);
}

/**
 * Export performance data to CSV
 */
export async function exportPerformanceToCSV(
  performances: ContentPerformance[]
): Promise<string> {
  const rows: CSVRow[] = performances.map(perf => ({
    post_id: perf.postId,
    platform: perf.platform,
    published_at: perf.publishedAt,
    likes: perf.engagement.likes,
    comments: perf.engagement.comments,
    shares: perf.engagement.shares,
    saves: perf.engagement.saves || 0,
    engagement_rate: perf.engagement.engagementRate.toFixed(2),
    impressions: perf.reach.impressions,
    reach: perf.reach.reach,
    clicks: perf.clicks.clicks,
    click_through_rate: perf.clicks.clickThroughRate.toFixed(2),
    conversions: perf.conversions?.conversions || 0,
    revenue: perf.conversions?.revenue || 0,
  }));

  return convertToCSV(rows);
}

/**
 * Export analytics summary
 */
export async function exportAnalyticsSummary(
  startDate: string,
  endDate: string,
  platform?: SocialPlatform
): Promise<string> {
  // TODO: Aggregate analytics data
  const summary: CSVRow[] = [
    {
      metric: 'Total Posts',
      value: 0,
      period: `${startDate} to ${endDate}`,
    },
    {
      metric: 'Average Engagement Rate',
      value: 0,
      period: `${startDate} to ${endDate}`,
    },
    {
      metric: 'Total Reach',
      value: 0,
      period: `${startDate} to ${endDate}`,
    },
  ];

  return convertToCSV(summary);
}

/**
 * Convert rows to CSV format
 */
function convertToCSV(rows: CSVRow[]): string {
  if (rows.length === 0) {
    return '';
  }

  // Get headers from first row
  const headers = Object.keys(rows[0]);
  
  // Create CSV header row
  const headerRow = headers.map(h => `"${h}"`).join(',');
  
  // Create data rows
  const dataRows = rows.map(row => {
    return headers.map(header => {
      const value = row[header];
      if (typeof value === 'string') {
        return `"${value}"`;
      }
      return value;
    }).join(',');
  });

  return [headerRow, ...dataRows].join('\n');
}

/**
 * Generate filename for export
 */
export function generateExportFilename(
  type: 'posts' | 'performance' | 'analytics',
  format: 'csv' | 'json' | 'xlsx'
): string {
  const timestamp = new Date().toISOString().split('T')[0];
  return `content_${type}_${timestamp}.${format}`;
}

/**
 * Export to JSON
 */
export async function exportToJSON(data: any): Promise<string> {
  return JSON.stringify(data, null, 2);
}

/**
 * Trigger download in browser
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

