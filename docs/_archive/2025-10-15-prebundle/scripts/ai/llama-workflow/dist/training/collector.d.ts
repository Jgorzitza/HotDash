/**
 * Training Data Collector
 *
 * Collects, validates, and stores training samples from Agent SDK feedback
 * for LlamaIndex query optimization and model improvement.
 */
import {
  TrainingSample,
  QueryPerformance,
  AggregatedMetrics,
} from "./schema.js";
/**
 * Storage backend interface
 */
interface StorageBackend {
  saveSample(sample: TrainingSample): Promise<void>;
  savePerformance(metrics: QueryPerformance): Promise<void>;
  getSamples(filters?: SampleFilters): Promise<TrainingSample[]>;
  getAggregatedMetrics(
    startDate: Date,
    endDate: Date,
  ): Promise<AggregatedMetrics>;
}
export interface SampleFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  approvedOnly?: boolean;
  minQualityScore?: number;
  tags?: string[];
  agentName?: string;
}
/**
 * JSONL file-based storage (simple, no dependencies)
 */
export declare class JSONLStorage implements StorageBackend {
  private dataDir;
  constructor(dataDir?: string);
  init(): Promise<void>;
  saveSample(sample: TrainingSample): Promise<void>;
  savePerformance(metrics: QueryPerformance): Promise<void>;
  getSamples(filters?: SampleFilters): Promise<TrainingSample[]>;
  private applyFilters;
  getAggregatedMetrics(
    startDate: Date,
    endDate: Date,
  ): Promise<AggregatedMetrics>;
}
/**
 * Supabase-based storage (production-ready, scalable)
 */
export declare class SupabaseStorage implements StorageBackend {
  private supabase;
  constructor();
  saveSample(sample: TrainingSample): Promise<void>;
  savePerformance(metrics: QueryPerformance): Promise<void>;
  getSamples(filters?: SampleFilters): Promise<TrainingSample[]>;
  getAggregatedMetrics(
    startDate: Date,
    endDate: Date,
  ): Promise<AggregatedMetrics>;
}
/**
 * Main training data collector
 */
export declare class TrainingDataCollector {
  private storage;
  constructor(storage?: StorageBackend);
  /**
   * Log a query with agent response for training
   */
  logQuery(params: {
    conversationId: number;
    agentName: string;
    query: string;
    queryIntent?: TrainingSample["query"]["intent"];
    response: string;
    sources?: TrainingSample["agent_response"]["sources"];
    confidence?: number;
    processingTimeMs?: number;
    metadata?: Record<string, any>;
  }): Promise<string>;
  /**
   * Update sample with human feedback
   */
  recordFeedback(params: {
    sampleId: string;
    approved: boolean;
    approvedBy: string;
    humanEditedText?: string;
    editReason?: TrainingSample["human_feedback"]["edit_reason"];
    qualityScores?: TrainingSample["human_feedback"]["quality_scores"];
    overallRating?: TrainingSample["human_feedback"]["overall_rating"];
    notes?: string;
  }): Promise<void>;
  /**
   * Log query performance metrics
   */
  logPerformance(params: {
    queryText: string;
    latencyMs: number;
    topK: number;
    cacheHit?: boolean;
    sourcesCount: number;
    avgSourceScore: number;
    confidence?: number;
    approved?: boolean;
    edited?: boolean;
  }): Promise<void>;
  /**
   * Export training data for fine-tuning or evaluation
   */
  exportTrainingData(params: {
    outputPath: string;
    format: "jsonl" | "csv";
    filters?: SampleFilters;
  }): Promise<void>;
  /**
   * Get aggregated metrics for reporting
   */
  getMetrics(startDate: Date, endDate: Date): Promise<AggregatedMetrics>;
  private hashQuery;
}
export declare const trainingCollector: TrainingDataCollector;
export {};
//# sourceMappingURL=collector.d.ts.map
