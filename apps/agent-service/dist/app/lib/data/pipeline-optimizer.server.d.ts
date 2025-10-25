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
export interface PipelineJob {
    id: string;
    jobName: string;
    jobType: 'batch' | 'stream' | 'realtime' | 'analytics' | 'optimization';
    pipelineStage: 'ingestion' | 'processing' | 'transformation' | 'aggregation' | 'analytics' | 'output';
    jobConfig: Record<string, any>;
    dataSources: Array<Record<string, any>>;
    outputTargets: Array<Record<string, any>>;
    processingRules: Record<string, any>;
    batchSize: number;
    maxParallelWorkers: number;
    timeoutSeconds: number;
    retryAttempts: number;
    scheduleCron?: string;
    isActive: boolean;
    priority: number;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'paused';
    startedAt?: string;
    completedAt?: string;
    lastRunAt?: string;
    nextRunAt?: string;
    executionTimeMs?: number;
    recordsProcessed: number;
    recordsSuccessful: number;
    recordsFailed: number;
    memoryUsageMb?: number;
    cpuUsagePercent?: number;
    errorMessage?: string;
    errorDetails: Record<string, any>;
    retryCount: number;
    createdAt: string;
    updatedAt: string;
}
export interface RealTimeStream {
    id: string;
    streamName: string;
    streamType: 'events' | 'metrics' | 'logs' | 'transactions' | 'user_actions';
    dataSchema: Record<string, any>;
    processingMode: 'streaming' | 'micro_batch' | 'windowed';
    windowSizeSeconds: number;
    watermarkDelaySeconds: number;
    outputFormat: 'json' | 'avro' | 'parquet' | 'csv';
    compressionEnabled: boolean;
    partitioningKey?: string;
    maxThroughputPerSecond: number;
    bufferSizeMb: number;
    flushIntervalMs: number;
    isActive: boolean;
    lastProcessedAt?: string;
    totalRecordsProcessed: number;
    currentLagMs: number;
    createdAt: string;
    updatedAt: string;
}
export interface AnalyticsAggregation {
    id: string;
    aggregationName: string;
    aggregationType: 'count' | 'sum' | 'avg' | 'min' | 'max' | 'percentile' | 'histogram' | 'trend';
    metricName: string;
    dimensionKeys: string[];
    timeWindowType: 'rolling' | 'fixed' | 'sliding';
    windowSizeMinutes: number;
    windowOffsetMinutes: number;
    sourceTables: Array<Record<string, any>>;
    filterConditions: Record<string, any>;
    aggregationKey: string;
    aggregationValue: number;
    aggregationMetadata: Record<string, any>;
    windowStart: string;
    windowEnd: string;
    computedAt: string;
    computationTimeMs?: number;
    recordsProcessed?: number;
    createdAt: string;
}
export interface PerformanceMetric {
    id: string;
    metricName: string;
    metricCategory: 'throughput' | 'latency' | 'memory' | 'cpu' | 'error_rate' | 'queue_depth';
    componentName: string;
    metricValue: number;
    metricUnit: string;
    metricTimestamp: string;
    pipelineJobId?: string;
    streamId?: string;
    aggregationId?: string;
    contextData: Record<string, any>;
    tags: string[];
    createdAt: string;
}
/**
 * Pipeline Optimizer Service
 *
 * Provides comprehensive data pipeline optimization capabilities
 * for Growth Engine phases 9-12 with advanced analytics and real-time processing.
 */
export declare class PipelineOptimizer {
    /**
     * Optimize pipeline performance based on historical data
     */
    optimizePipelinePerformance(pipelineJobId: string): Promise<Record<string, any>>;
    /**
     * Process real-time data stream
     */
    processRealtimeStream(streamId: string, data: Record<string, any>): Promise<Record<string, any>>;
    /**
     * Compute analytics aggregation
     */
    computeAnalyticsAggregation(aggregationName: string, windowStart: string, windowEnd: string): Promise<Record<string, any>>;
    /**
     * Get pipeline performance metrics
     */
    getPipelinePerformanceMetrics(pipelineJobId: string, hoursBack?: number): Promise<Record<string, any>>;
    /**
     * Create a new pipeline job
     */
    createPipelineJob(jobData: Partial<PipelineJob>): Promise<PipelineJob>;
    /**
     * Create a new real-time data stream
     */
    createRealtimeStream(streamData: Partial<RealTimeStream>): Promise<RealTimeStream>;
    /**
     * Get all active pipeline jobs
     */
    getActivePipelineJobs(): Promise<PipelineJob[]>;
    /**
     * Get all active real-time streams
     */
    getActiveRealtimeStreams(): Promise<RealTimeStream[]>;
    /**
     * Get analytics aggregations for a time range
     */
    getAnalyticsAggregations(startTime: string, endTime: string, aggregationName?: string): Promise<AnalyticsAggregation[]>;
    /**
     * Get performance metrics for a component
     */
    getPerformanceMetrics(componentName: string, hoursBack?: number): Promise<PerformanceMetric[]>;
    /**
     * Update pipeline job status
     */
    updatePipelineJobStatus(jobId: string, status: PipelineJob['status'], metrics?: {
        executionTimeMs?: number;
        recordsProcessed?: number;
        recordsSuccessful?: number;
        recordsFailed?: number;
        memoryUsageMb?: number;
        cpuUsagePercent?: number;
    }): Promise<PipelineJob>;
    /**
     * Get pipeline health status
     */
    getPipelineHealthStatus(): Promise<Record<string, any>>;
}
export declare const pipelineOptimizer: PipelineOptimizer;
//# sourceMappingURL=pipeline-optimizer.server.d.ts.map