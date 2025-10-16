/**
 * KB Telemetry and Event Tracking
 * Tracks search, usage, and quality metrics
 */

import { createClient } from '@supabase/supabase-js';
import { KBConfig } from './config';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface TelemetryEvent {
  event_type: string;
  event_data: Record<string, any>;
  timestamp: string;
  user_id?: string;
  session_id?: string;
}

interface SearchMetrics {
  query: string;
  results_count: number;
  top_result_confidence: number;
  latency_ms: number;
  category?: string;
}

interface UsageMetrics {
  article_id: number;
  used_in_draft: boolean;
  was_helpful?: boolean;
  approval_id?: number;
}

interface QualityMetrics {
  article_id: number;
  confidence_before: number;
  confidence_after: number;
  grades?: {
    tone: number;
    accuracy: number;
    policy: number;
  };
}

/**
 * Track search event
 */
export async function trackSearch(metrics: SearchMetrics): Promise<void> {
  if (!KBConfig.telemetry.events.search) return;
  
  // Sample based on configuration
  if (Math.random() > KBConfig.telemetry.sampling.search) return;

  const event: TelemetryEvent = {
    event_type: 'kb_search',
    event_data: {
      query: metrics.query,
      results_count: metrics.results_count,
      top_result_confidence: metrics.top_result_confidence,
      latency_ms: metrics.latency_ms,
      category: metrics.category,
      timestamp: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  };

  await logEvent(event);

  // Track latency metrics
  await trackLatency('search', metrics.latency_ms);
}

/**
 * Track article usage
 */
export async function trackUsage(metrics: UsageMetrics): Promise<void> {
  if (!KBConfig.telemetry.events.articleUsage) return;

  const event: TelemetryEvent = {
    event_type: 'kb_article_usage',
    event_data: {
      article_id: metrics.article_id,
      used_in_draft: metrics.used_in_draft,
      was_helpful: metrics.was_helpful,
      approval_id: metrics.approval_id,
      timestamp: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  };

  await logEvent(event);

  // Also log to usage_log table
  await supabase
    .from('kb_usage_log')
    .insert({
      article_id: metrics.article_id,
      approval_id: metrics.approval_id,
      used_in_draft: metrics.used_in_draft,
      was_helpful: metrics.was_helpful
    });
}

/**
 * Track quality update
 */
export async function trackQualityUpdate(metrics: QualityMetrics): Promise<void> {
  if (!KBConfig.telemetry.events.confidenceUpdate) return;

  const event: TelemetryEvent = {
    event_type: 'kb_quality_update',
    event_data: {
      article_id: metrics.article_id,
      confidence_before: metrics.confidence_before,
      confidence_after: metrics.confidence_after,
      confidence_delta: metrics.confidence_after - metrics.confidence_before,
      grades: metrics.grades,
      timestamp: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  };

  await logEvent(event);
}

/**
 * Track article creation
 */
export async function trackArticleCreation(articleId: number, source: string): Promise<void> {
  if (!KBConfig.telemetry.events.articleCreation) return;

  const event: TelemetryEvent = {
    event_type: 'kb_article_created',
    event_data: {
      article_id: articleId,
      source,
      timestamp: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  };

  await logEvent(event);
}

/**
 * Track article archival
 */
export async function trackArticleArchival(articleId: number, reason: string): Promise<void> {
  if (!KBConfig.telemetry.events.articleArchival) return;

  const event: TelemetryEvent = {
    event_type: 'kb_article_archived',
    event_data: {
      article_id: articleId,
      reason,
      timestamp: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  };

  await logEvent(event);
}

/**
 * Track learning extraction
 */
export async function trackLearningExtraction(
  learningEditId: number,
  learningType: string,
  editRatio: number
): Promise<void> {
  if (!KBConfig.telemetry.events.learningExtraction) return;

  const event: TelemetryEvent = {
    event_type: 'kb_learning_extracted',
    event_data: {
      learning_edit_id: learningEditId,
      learning_type: learningType,
      edit_ratio: editRatio,
      timestamp: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  };

  await logEvent(event);
}

/**
 * Log event to telemetry system
 */
async function logEvent(event: TelemetryEvent): Promise<void> {
  try {
    // In production, this would send to a telemetry service (e.g., Prometheus, DataDog)
    // For now, we'll log to console and could store in a telemetry table
    console.log('[Telemetry]', event.event_type, event.event_data);

    // Optional: Store in database for analysis
    // await supabase.from('kb_telemetry_events').insert(event);
  } catch (error) {
    console.error('[Telemetry] Error logging event:', error);
    // Don't throw - telemetry failures shouldn't break the application
  }
}

/**
 * Track latency metrics
 */
async function trackLatency(operation: string, latencyMs: number): Promise<void> {
  const slo = KBConfig.slo.searchLatency;

  // Check if latency exceeds SLO
  if (latencyMs > slo.p99) {
    console.warn(`[Telemetry] ${operation} latency exceeded P99 SLO: ${latencyMs}ms > ${slo.p99}ms`);
  }

  // In production, send to metrics system (Prometheus, CloudWatch, etc.)
  console.log(`[Metrics] ${operation}_latency_ms: ${latencyMs}`);
}

/**
 * Get telemetry summary for time period
 */
export async function getTelemetrySummary(hours: number = 24): Promise<{
  searches: number;
  articlesUsed: number;
  articlesCreated: number;
  articlesArchived: number;
  avgSearchLatency: number;
  avgConfidenceChange: number;
}> {
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);

  // In production, query telemetry database
  // For now, return mock data structure
  return {
    searches: 0,
    articlesUsed: 0,
    articlesCreated: 0,
    articlesArchived: 0,
    avgSearchLatency: 0,
    avgConfidenceChange: 0
  };
}

/**
 * Check SLO compliance
 */
export async function checkSLOCompliance(): Promise<{
  compliant: boolean;
  violations: string[];
  metrics: Record<string, number>;
}> {
  const violations: string[] = [];
  const metrics: Record<string, number> = {};

  // Check search latency (would query actual metrics in production)
  const avgLatency = 150; // Mock value
  metrics.avgSearchLatency = avgLatency;

  if (avgLatency > KBConfig.slo.searchLatency.p95) {
    violations.push(`Search latency P95 exceeded: ${avgLatency}ms > ${KBConfig.slo.searchLatency.p95}ms`);
  }

  // Check quality metrics
  const { data: articles } = await supabase
    .from('kb_articles')
    .select('confidence_score')
    .is('archived_at', null);

  if (articles && articles.length > 0) {
    const avgConfidence = articles.reduce((sum, a) => sum + a.confidence_score, 0) / articles.length;
    metrics.avgConfidence = avgConfidence;

    if (avgConfidence < KBConfig.slo.quality.avgConfidence) {
      violations.push(`Average confidence below target: ${avgConfidence.toFixed(2)} < ${KBConfig.slo.quality.avgConfidence}`);
    }
  }

  return {
    compliant: violations.length === 0,
    violations,
    metrics
  };
}

/**
 * Generate telemetry report
 */
export async function generateTelemetryReport(days: number = 7): Promise<string> {
  const summary = await getTelemetrySummary(days * 24);
  const sloCheck = await checkSLOCompliance();

  let report = `# KB Telemetry Report (Last ${days} days)\n\n`;
  
  report += `## Activity Summary\n`;
  report += `- Searches: ${summary.searches}\n`;
  report += `- Articles Used: ${summary.articlesUsed}\n`;
  report += `- Articles Created: ${summary.articlesCreated}\n`;
  report += `- Articles Archived: ${summary.articlesArchived}\n\n`;

  report += `## Performance Metrics\n`;
  report += `- Avg Search Latency: ${summary.avgSearchLatency}ms\n`;
  report += `- Avg Confidence Change: ${summary.avgConfidenceChange.toFixed(3)}\n\n`;

  report += `## SLO Compliance\n`;
  report += `- Status: ${sloCheck.compliant ? '✅ COMPLIANT' : '❌ VIOLATIONS'}\n`;
  
  if (sloCheck.violations.length > 0) {
    report += `\n### Violations:\n`;
    sloCheck.violations.forEach(v => {
      report += `- ${v}\n`;
    });
  }

  report += `\n### Metrics:\n`;
  Object.entries(sloCheck.metrics).forEach(([key, value]) => {
    report += `- ${key}: ${typeof value === 'number' ? value.toFixed(2) : value}\n`;
  });

  return report;
}

