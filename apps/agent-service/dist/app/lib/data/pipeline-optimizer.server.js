/**
 * Growth Engine Data Pipeline Optimizer
 *
 * Optimizes data pipeline performance for Growth Engine phases 9-12
 * with advanced analytics, real-time processing, and performance improvements.
 *
 * @file app/lib/data/pipeline-optimizer.server.ts
 * @author Data Agent
 * @date 2025-10-22
 * @task DATA-110
 */
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
/**
 * Pipeline Optimizer Service
 *
 * Provides comprehensive data pipeline optimization capabilities
 * for Growth Engine phases 9-12 with advanced analytics and real-time processing.
 */
export class PipelineOptimizer {
    /**
     * Optimize pipeline performance based on historical data
     */
    async optimizePipelinePerformance(pipelineJobId) {
        try {
            const { data, error } = await supabase.rpc('optimize_pipeline_performance', {
                p_pipeline_job_id: pipelineJobId
            });
            if (error) {
                throw new Error(`Pipeline optimization failed: ${error.message}`);
            }
            return data;
        }
        catch (error) {
            console.error('Pipeline optimization error:', error);
            throw error;
        }
    }
    /**
     * Process real-time data stream
     */
    async processRealtimeStream(streamId, data) {
        try {
            const { data: result, error } = await supabase.rpc('process_realtime_stream', {
                p_stream_id: streamId,
                p_data: data
            });
            if (error) {
                throw new Error(`Real-time stream processing failed: ${error.message}`);
            }
            return result;
        }
        catch (error) {
            console.error('Real-time stream processing error:', error);
            throw error;
        }
    }
    /**
     * Compute analytics aggregation
     */
    async computeAnalyticsAggregation(aggregationName, windowStart, windowEnd) {
        try {
            const { data, error } = await supabase.rpc('compute_analytics_aggregation', {
                p_aggregation_name: aggregationName,
                p_window_start: windowStart,
                p_window_end: windowEnd
            });
            if (error) {
                throw new Error(`Analytics aggregation failed: ${error.message}`);
            }
            return data;
        }
        catch (error) {
            console.error('Analytics aggregation error:', error);
            throw error;
        }
    }
    /**
     * Get pipeline performance metrics
     */
    async getPipelinePerformanceMetrics(pipelineJobId, hoursBack = 24) {
        try {
            const { data, error } = await supabase.rpc('get_pipeline_performance_metrics', {
                p_pipeline_job_id: pipelineJobId,
                p_hours_back: hoursBack
            });
            if (error) {
                throw new Error(`Performance metrics retrieval failed: ${error.message}`);
            }
            return data;
        }
        catch (error) {
            console.error('Performance metrics error:', error);
            throw error;
        }
    }
    /**
     * Create a new pipeline job
     */
    async createPipelineJob(jobData) {
        try {
            const { data, error } = await supabase
                .from('data_pipeline_jobs')
                .insert(jobData)
                .select()
                .single();
            if (error) {
                throw new Error(`Pipeline job creation failed: ${error.message}`);
            }
            return data;
        }
        catch (error) {
            console.error('Pipeline job creation error:', error);
            throw error;
        }
    }
    /**
     * Create a new real-time data stream
     */
    async createRealtimeStream(streamData) {
        try {
            const { data, error } = await supabase
                .from('real_time_data_streams')
                .insert(streamData)
                .select()
                .single();
            if (error) {
                throw new Error(`Real-time stream creation failed: ${error.message}`);
            }
            return data;
        }
        catch (error) {
            console.error('Real-time stream creation error:', error);
            throw error;
        }
    }
    /**
     * Get all active pipeline jobs
     */
    async getActivePipelineJobs() {
        try {
            const { data, error } = await supabase
                .from('data_pipeline_jobs')
                .select('*')
                .eq('is_active', true)
                .order('priority', { ascending: false });
            if (error) {
                throw new Error(`Active pipeline jobs retrieval failed: ${error.message}`);
            }
            return data || [];
        }
        catch (error) {
            console.error('Active pipeline jobs error:', error);
            throw error;
        }
    }
    /**
     * Get all active real-time streams
     */
    async getActiveRealtimeStreams() {
        try {
            const { data, error } = await supabase
                .from('real_time_data_streams')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false });
            if (error) {
                throw new Error(`Active real-time streams retrieval failed: ${error.message}`);
            }
            return data || [];
        }
        catch (error) {
            console.error('Active real-time streams error:', error);
            throw error;
        }
    }
    /**
     * Get analytics aggregations for a time range
     */
    async getAnalyticsAggregations(startTime, endTime, aggregationName) {
        try {
            let query = supabase
                .from('analytics_aggregations')
                .select('*')
                .gte('window_start', startTime)
                .lte('window_end', endTime);
            if (aggregationName) {
                query = query.eq('aggregation_name', aggregationName);
            }
            const { data, error } = await query.order('computed_at', { ascending: false });
            if (error) {
                throw new Error(`Analytics aggregations retrieval failed: ${error.message}`);
            }
            return data || [];
        }
        catch (error) {
            console.error('Analytics aggregations error:', error);
            throw error;
        }
    }
    /**
     * Get performance metrics for a component
     */
    async getPerformanceMetrics(componentName, hoursBack = 24) {
        try {
            const { data, error } = await supabase
                .from('performance_metrics')
                .select('*')
                .eq('component_name', componentName)
                .gte('metric_timestamp', new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString())
                .order('metric_timestamp', { ascending: false });
            if (error) {
                throw new Error(`Performance metrics retrieval failed: ${error.message}`);
            }
            return data || [];
        }
        catch (error) {
            console.error('Performance metrics error:', error);
            throw error;
        }
    }
    /**
     * Update pipeline job status
     */
    async updatePipelineJobStatus(jobId, status, metrics) {
        try {
            const updateData = {
                status,
                updated_at: new Date().toISOString()
            };
            if (status === 'running') {
                updateData.started_at = new Date().toISOString();
            }
            else if (status === 'completed' || status === 'failed') {
                updateData.completed_at = new Date().toISOString();
            }
            if (metrics) {
                Object.assign(updateData, metrics);
            }
            const { data, error } = await supabase
                .from('data_pipeline_jobs')
                .update(updateData)
                .eq('id', jobId)
                .select()
                .single();
            if (error) {
                throw new Error(`Pipeline job status update failed: ${error.message}`);
            }
            return data;
        }
        catch (error) {
            console.error('Pipeline job status update error:', error);
            throw error;
        }
    }
    /**
     * Get pipeline health status
     */
    async getPipelineHealthStatus() {
        try {
            // Get active jobs count
            const { count: activeJobsCount } = await supabase
                .from('data_pipeline_jobs')
                .select('*', { count: 'exact', head: true })
                .eq('is_active', true);
            // Get failed jobs in last 24 hours
            const { count: failedJobsCount } = await supabase
                .from('data_pipeline_jobs')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'failed')
                .gte('updated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
            // Get active streams count
            const { count: activeStreamsCount } = await supabase
                .from('real_time_data_streams')
                .select('*', { count: 'exact', head: true })
                .eq('is_active', true);
            // Get average lag for streams
            const { data: streamsData } = await supabase
                .from('real_time_data_streams')
                .select('current_lag_ms')
                .eq('is_active', true);
            const averageLagMs = streamsData?.length
                ? streamsData.reduce((sum, stream) => sum + (stream.current_lag_ms || 0), 0) / streamsData.length
                : 0;
            return {
                activeJobsCount: activeJobsCount || 0,
                failedJobsCount: failedJobsCount || 0,
                activeStreamsCount: activeStreamsCount || 0,
                averageLagMs: Math.round(averageLagMs),
                healthStatus: failedJobsCount && failedJobsCount > 0 ? 'degraded' : 'healthy',
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
            console.error('Pipeline health status error:', error);
            throw error;
        }
    }
}
// Export singleton instance
export const pipelineOptimizer = new PipelineOptimizer();
//# sourceMappingURL=pipeline-optimizer.server.js.map