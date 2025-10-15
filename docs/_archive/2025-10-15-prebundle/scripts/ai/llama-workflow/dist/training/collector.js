/**
 * Training Data Collector
 *
 * Collects, validates, and stores training samples from Agent SDK feedback
 * for LlamaIndex query optimization and model improvement.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { TrainingSample, TrainingSampleSchema, QueryPerformance, QueryPerformanceSchema, TrainingBatch, AggregatedMetrics } from './schema.js';
import { getConfig } from '../config.js';
/**
 * JSONL file-based storage (simple, no dependencies)
 */
export class JSONLStorage {
    dataDir;
    constructor(dataDir) {
        this.dataDir = dataDir || path.join(process.cwd(), 'data', 'training');
    }
    async init() {
        await fs.mkdir(this.dataDir, { recursive: true });
        await fs.mkdir(path.join(this.dataDir, 'samples'), { recursive: true });
        await fs.mkdir(path.join(this.dataDir, 'performance'), { recursive: true });
    }
    async saveSample(sample) {
        await this.init();
        const date = new Date(sample.created_at);
        const filename = `samples-${date.toISOString().slice(0, 10)}.jsonl`;
        const filepath = path.join(this.dataDir, 'samples', filename);
        const line = JSON.stringify(sample) + '\n';
        await fs.appendFile(filepath, line);
    }
    async savePerformance(metrics) {
        await this.init();
        const date = new Date(metrics.timestamp);
        const filename = `performance-${date.toISOString().slice(0, 10)}.jsonl`;
        const filepath = path.join(this.dataDir, 'performance', filename);
        const line = JSON.stringify(metrics) + '\n';
        await fs.appendFile(filepath, line);
    }
    async getSamples(filters) {
        await this.init();
        const samplesDir = path.join(this.dataDir, 'samples');
        const files = await fs.readdir(samplesDir);
        let samples = [];
        for (const file of files) {
            if (!file.endsWith('.jsonl'))
                continue;
            const filepath = path.join(samplesDir, file);
            const content = await fs.readFile(filepath, 'utf-8');
            const lines = content.trim().split('\n').filter(l => l.trim());
            for (const line of lines) {
                try {
                    const sample = JSON.parse(line);
                    samples.push(sample);
                }
                catch (error) {
                    console.warn(`Failed to parse line in ${file}:`, error);
                }
            }
        }
        // Apply filters
        if (filters) {
            samples = this.applyFilters(samples, filters);
        }
        return samples;
    }
    applyFilters(samples, filters) {
        let filtered = samples;
        if (filters.dateRange) {
            filtered = filtered.filter(s => {
                const created = new Date(s.created_at);
                return created >= filters.dateRange.start && created <= filters.dateRange.end;
            });
        }
        if (filters.approvedOnly) {
            filtered = filtered.filter(s => s.human_feedback.approved);
        }
        if (filters.minQualityScore) {
            filtered = filtered.filter(s => {
                const scores = s.human_feedback.quality_scores;
                if (!scores)
                    return false;
                const avg = ((scores.factuality || 0) +
                    (scores.helpfulness || 0) +
                    (scores.tone || 0) +
                    (scores.policy_alignment || 0) +
                    (scores.citation_quality || 0)) / 5;
                return avg >= filters.minQualityScore;
            });
        }
        if (filters.tags && filters.tags.length > 0) {
            filtered = filtered.filter(s => s.tags && s.tags.some(t => filters.tags.includes(t)));
        }
        if (filters.agentName) {
            filtered = filtered.filter(s => s.source.agent_name === filters.agentName);
        }
        return filtered;
    }
    async getAggregatedMetrics(startDate, endDate) {
        const samples = await this.getSamples({
            dateRange: { start: startDate, end: endDate }
        });
        const approvedSamples = samples.filter(s => s.human_feedback.approved);
        const editedSamples = samples.filter(s => s.human_feedback.human_edited_text);
        const qualityScores = samples
            .filter(s => s.human_feedback.quality_scores)
            .map(s => s.human_feedback.quality_scores);
        const avgFactuality = qualityScores.length > 0
            ? qualityScores.reduce((sum, s) => sum + (s.factuality || 0), 0) / qualityScores.length
            : undefined;
        const avgHelpfulness = qualityScores.length > 0
            ? qualityScores.reduce((sum, s) => sum + (s.helpfulness || 0), 0) / qualityScores.length
            : undefined;
        const avgCitationQuality = qualityScores.length > 0
            ? qualityScores.reduce((sum, s) => sum + (s.citation_quality || 0), 0) / qualityScores.length
            : undefined;
        return {
            period: {
                start: startDate.toISOString(),
                end: endDate.toISOString(),
            },
            query_metrics: {
                total_queries: samples.length,
                avg_latency_ms: 0, // Would need performance data
                p50_latency_ms: 0,
                p95_latency_ms: 0,
                p99_latency_ms: 0,
                cache_hit_rate: 0,
            },
            quality_metrics: {
                approval_rate: samples.length > 0 ? approvedSamples.length / samples.length : 0,
                edit_rate: samples.length > 0 ? editedSamples.length / samples.length : 0,
                avg_factuality: avgFactuality,
                avg_helpfulness: avgHelpfulness,
                avg_citation_quality: avgCitationQuality,
            },
            training_corpus: {
                total_samples: samples.length,
                approved_samples: approvedSamples.length,
                evaluation_samples: samples.filter(s => s.training_flags.include_in_evaluation).length,
                avg_quality_score: avgFactuality,
            },
        };
    }
}
/**
 * Supabase-based storage (production-ready, scalable)
 */
export class SupabaseStorage {
    supabase;
    constructor() {
        const config = getConfig();
        this.supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
    }
    async saveSample(sample) {
        const { error } = await this.supabase
            .from('agent_training_samples')
            .insert([sample]);
        if (error) {
            throw new Error(`Failed to save training sample: ${error.message}`);
        }
    }
    async savePerformance(metrics) {
        const { error } = await this.supabase
            .from('agent_query_performance')
            .insert([metrics]);
        if (error) {
            throw new Error(`Failed to save performance metrics: ${error.message}`);
        }
    }
    async getSamples(filters) {
        let query = this.supabase
            .from('agent_training_samples')
            .select('*');
        if (filters?.dateRange) {
            query = query
                .gte('created_at', filters.dateRange.start.toISOString())
                .lte('created_at', filters.dateRange.end.toISOString());
        }
        if (filters?.approvedOnly) {
            query = query.eq('human_feedback->>approved', true);
        }
        if (filters?.agentName) {
            query = query.eq('source->>agent_name', filters.agentName);
        }
        const { data, error } = await query;
        if (error) {
            throw new Error(`Failed to fetch samples: ${error.message}`);
        }
        return data || [];
    }
    async getAggregatedMetrics(startDate, endDate) {
        // Use SQL views or procedures for efficient aggregation
        const { data, error } = await this.supabase
            .rpc('get_training_metrics', {
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
        });
        if (error) {
            throw new Error(`Failed to fetch aggregated metrics: ${error.message}`);
        }
        return data;
    }
}
/**
 * Main training data collector
 */
export class TrainingDataCollector {
    storage;
    constructor(storage) {
        this.storage = storage || new JSONLStorage();
    }
    /**
     * Log a query with agent response for training
     */
    async logQuery(params) {
        const sampleId = uuidv4();
        const sample = {
            sample_id: sampleId,
            created_at: new Date().toISOString(),
            source: {
                agent_name: params.agentName,
                conversation_id: params.conversationId,
            },
            query: {
                text: params.query,
                intent: params.queryIntent,
                metadata: params.metadata,
            },
            agent_response: {
                text: params.response,
                sources: params.sources,
                confidence: params.confidence,
                processing_time_ms: params.processingTimeMs,
            },
            human_feedback: {
                approved: false, // Will be updated when human reviews
            },
            training_flags: {
                include_in_training: true,
                include_in_evaluation: false,
                quality_reviewed: false,
                pii_redacted: false,
            },
        };
        // Validate schema
        TrainingSampleSchema.parse(sample);
        await this.storage.saveSample(sample);
        return sampleId;
    }
    /**
     * Update sample with human feedback
     */
    async recordFeedback(params) {
        const samples = await this.storage.getSamples();
        const sample = samples.find(s => s.sample_id === params.sampleId);
        if (!sample) {
            throw new Error(`Sample ${params.sampleId} not found`);
        }
        sample.updated_at = new Date().toISOString();
        sample.human_feedback = {
            approved: params.approved,
            approved_by: params.approvedBy,
            approved_at: new Date().toISOString(),
            human_edited_text: params.humanEditedText,
            edit_reason: params.editReason,
            quality_scores: params.qualityScores,
            overall_rating: params.overallRating,
            notes: params.notes,
        };
        sample.training_flags.quality_reviewed = true;
        await this.storage.saveSample(sample);
    }
    /**
     * Log query performance metrics
     */
    async logPerformance(params) {
        const metrics = {
            metric_id: uuidv4(),
            timestamp: new Date().toISOString(),
            query_text: params.queryText,
            query_hash: this.hashQuery(params.queryText),
            performance: {
                latency_ms: params.latencyMs,
                topK: params.topK,
                cache_hit: params.cacheHit || false,
            },
            quality: {
                sources_count: params.sourcesCount,
                avg_source_score: params.avgSourceScore,
                confidence: params.confidence,
            },
            outcome: params.approved !== undefined ? {
                approved: params.approved,
                edited: params.edited,
            } : undefined,
        };
        QueryPerformanceSchema.parse(metrics);
        await this.storage.savePerformance(metrics);
    }
    /**
     * Export training data for fine-tuning or evaluation
     */
    async exportTrainingData(params) {
        const samples = await this.storage.getSamples(params.filters);
        if (params.format === 'jsonl') {
            const lines = samples.map(s => JSON.stringify(s)).join('\n');
            await fs.writeFile(params.outputPath, lines);
        }
        else if (params.format === 'csv') {
            // Convert to CSV format
            const headers = [
                'sample_id',
                'query',
                'response',
                'approved',
                'quality_score',
                'edit_reason'
            ];
            const rows = samples.map(s => [
                s.sample_id,
                s.query.text,
                s.agent_response.text,
                s.human_feedback.approved,
                s.human_feedback.quality_scores?.factuality || '',
                s.human_feedback.edit_reason || ''
            ]);
            const csv = [
                headers.join(','),
                ...rows.map(r => r.map(v => `"${v}"`).join(','))
            ].join('\n');
            await fs.writeFile(params.outputPath, csv);
        }
    }
    /**
     * Get aggregated metrics for reporting
     */
    async getMetrics(startDate, endDate) {
        return await this.storage.getAggregatedMetrics(startDate, endDate);
    }
    hashQuery(query) {
        // Simple hash for deduplication
        return Buffer.from(query.toLowerCase().trim()).toString('base64');
    }
}
// Export singleton instance
export const trainingCollector = new TrainingDataCollector();
//# sourceMappingURL=collector.js.map