/**
 * Training Data Collection Schema for Agent SDK Feedback
 *
 * This schema captures agent queries, responses, human feedback, and approval
 * data to build a training corpus for LlamaIndex query optimization and
 * Agent SDK performance improvement.
 *
 * Reference: docs/AgentSDKopenAI.md (Agent feedback capture)
 */
import { z } from "zod";
/**
 * Core training sample capturing a single query-response interaction
 */
export declare const TrainingSampleSchema: z.ZodObject<
  {
    sample_id: z.ZodString;
    created_at: z.ZodString;
    updated_at: z.ZodOptional<z.ZodString>;
    source: z.ZodObject<
      {
        agent_name: z.ZodString;
        agent_sdk_version: z.ZodOptional<z.ZodString>;
        conversation_id: z.ZodNumber;
        chatwoot_conversation_id: z.ZodOptional<z.ZodNumber>;
      },
      z.core.$strip
    >;
    query: z.ZodObject<
      {
        text: z.ZodString;
        intent: z.ZodOptional<
          z.ZodEnum<{
            order_status: "order_status";
            refund: "refund";
            cancel: "cancel";
            exchange: "exchange";
            product_question: "product_question";
            policy_question: "policy_question";
            technical_support: "technical_support";
            escalation: "escalation";
            other: "other";
          }>
        >;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodAny, z.core.SomeType>>;
      },
      z.core.$strip
    >;
    agent_response: z.ZodObject<
      {
        text: z.ZodString;
        sources: z.ZodOptional<
          z.ZodArray<
            z.ZodObject<
              {
                id: z.ZodString;
                score: z.ZodNumber;
                text: z.ZodString;
                metadata: z.ZodRecord<z.ZodAny, z.core.SomeType>;
              },
              z.core.$strip
            >
          >
        >;
        confidence: z.ZodOptional<z.ZodNumber>;
        processing_time_ms: z.ZodOptional<z.ZodNumber>;
      },
      z.core.$strip
    >;
    human_feedback: z.ZodObject<
      {
        approved: z.ZodBoolean;
        approved_by: z.ZodOptional<z.ZodString>;
        approved_at: z.ZodOptional<z.ZodString>;
        human_edited_text: z.ZodOptional<z.ZodString>;
        edit_reason: z.ZodOptional<
          z.ZodEnum<{
            other: "other";
            tone_adjustment: "tone_adjustment";
            factual_correction: "factual_correction";
            policy_clarification: "policy_clarification";
            added_context: "added_context";
            removed_content: "removed_content";
            complete_rewrite: "complete_rewrite";
          }>
        >;
        quality_scores: z.ZodOptional<
          z.ZodObject<
            {
              factuality: z.ZodOptional<z.ZodNumber>;
              helpfulness: z.ZodOptional<z.ZodNumber>;
              tone: z.ZodOptional<z.ZodNumber>;
              policy_alignment: z.ZodOptional<z.ZodNumber>;
              citation_quality: z.ZodOptional<z.ZodNumber>;
            },
            z.core.$strip
          >
        >;
        overall_rating: z.ZodOptional<
          z.ZodEnum<{
            poor: "poor";
            fair: "fair";
            good: "good";
            excellent: "excellent";
          }>
        >;
        notes: z.ZodOptional<z.ZodString>;
      },
      z.core.$strip
    >;
    customer_outcome: z.ZodOptional<
      z.ZodObject<
        {
          resolved: z.ZodOptional<z.ZodBoolean>;
          csat_score: z.ZodOptional<z.ZodNumber>;
          resolution_time_minutes: z.ZodOptional<z.ZodNumber>;
          required_escalation: z.ZodOptional<z.ZodBoolean>;
        },
        z.core.$strip
      >
    >;
    tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
    training_flags: z.ZodObject<
      {
        include_in_training: z.ZodDefault<z.ZodBoolean>;
        include_in_evaluation: z.ZodDefault<z.ZodBoolean>;
        quality_reviewed: z.ZodDefault<z.ZodBoolean>;
        pii_redacted: z.ZodDefault<z.ZodBoolean>;
      },
      z.core.$strip
    >;
  },
  z.core.$strip
>;
export type TrainingSample = z.infer<typeof TrainingSampleSchema>;
/**
 * Batch collection metadata for tracking corpus building
 */
export declare const TrainingBatchSchema: z.ZodObject<
  {
    batch_id: z.ZodString;
    created_at: z.ZodString;
    samples_count: z.ZodNumber;
    date_range: z.ZodObject<
      {
        start: z.ZodString;
        end: z.ZodString;
      },
      z.core.$strip
    >;
    sources: z.ZodArray<z.ZodString>;
    quality_metrics: z.ZodObject<
      {
        approval_rate: z.ZodNumber;
        avg_factuality: z.ZodOptional<z.ZodNumber>;
        avg_helpfulness: z.ZodOptional<z.ZodNumber>;
        edit_rate: z.ZodOptional<z.ZodNumber>;
      },
      z.core.$strip
    >;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodAny, z.core.SomeType>>;
  },
  z.core.$strip
>;
export type TrainingBatch = z.infer<typeof TrainingBatchSchema>;
/**
 * Query performance metrics for optimization tracking
 */
export declare const QueryPerformanceSchema: z.ZodObject<
  {
    metric_id: z.ZodString;
    timestamp: z.ZodString;
    query_text: z.ZodString;
    query_hash: z.ZodString;
    performance: z.ZodObject<
      {
        latency_ms: z.ZodNumber;
        topK: z.ZodNumber;
        cache_hit: z.ZodDefault<z.ZodBoolean>;
        index_version: z.ZodOptional<z.ZodString>;
      },
      z.core.$strip
    >;
    quality: z.ZodObject<
      {
        sources_count: z.ZodNumber;
        avg_source_score: z.ZodNumber;
        confidence: z.ZodOptional<z.ZodNumber>;
      },
      z.core.$strip
    >;
    outcome: z.ZodOptional<
      z.ZodObject<
        {
          approved: z.ZodOptional<z.ZodBoolean>;
          edited: z.ZodOptional<z.ZodBoolean>;
          human_rating: z.ZodOptional<z.ZodNumber>;
        },
        z.core.$strip
      >
    >;
  },
  z.core.$strip
>;
export type QueryPerformance = z.infer<typeof QueryPerformanceSchema>;
/**
 * Aggregated metrics for monitoring and reporting
 */
export declare const AggregatedMetricsSchema: z.ZodObject<
  {
    period: z.ZodObject<
      {
        start: z.ZodString;
        end: z.ZodString;
      },
      z.core.$strip
    >;
    query_metrics: z.ZodObject<
      {
        total_queries: z.ZodNumber;
        avg_latency_ms: z.ZodNumber;
        p50_latency_ms: z.ZodNumber;
        p95_latency_ms: z.ZodNumber;
        p99_latency_ms: z.ZodNumber;
        cache_hit_rate: z.ZodNumber;
      },
      z.core.$strip
    >;
    quality_metrics: z.ZodObject<
      {
        approval_rate: z.ZodNumber;
        edit_rate: z.ZodNumber;
        avg_factuality: z.ZodOptional<z.ZodNumber>;
        avg_helpfulness: z.ZodOptional<z.ZodNumber>;
        avg_citation_quality: z.ZodOptional<z.ZodNumber>;
      },
      z.core.$strip
    >;
    training_corpus: z.ZodObject<
      {
        total_samples: z.ZodNumber;
        approved_samples: z.ZodNumber;
        evaluation_samples: z.ZodNumber;
        avg_quality_score: z.ZodOptional<z.ZodNumber>;
      },
      z.core.$strip
    >;
  },
  z.core.$strip
>;
export type AggregatedMetrics = z.infer<typeof AggregatedMetricsSchema>;
/**
 * Export format for training data (compatible with fine-tuning)
 */
export declare const TrainingExportSchema: z.ZodObject<
  {
    export_id: z.ZodString;
    created_at: z.ZodString;
    format: z.ZodEnum<{
      jsonl: "jsonl";
      parquet: "parquet";
      csv: "csv";
    }>;
    filters: z.ZodObject<
      {
        date_range: z.ZodOptional<
          z.ZodObject<
            {
              start: z.ZodString;
              end: z.ZodString;
            },
            z.core.$strip
          >
        >;
        min_quality_score: z.ZodOptional<z.ZodNumber>;
        approved_only: z.ZodDefault<z.ZodBoolean>;
        include_tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
        exclude_tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
      },
      z.core.$strip
    >;
    samples_count: z.ZodNumber;
    file_path: z.ZodString;
    statistics: z.ZodObject<
      {
        approval_rate: z.ZodNumber;
        edit_rate: z.ZodNumber;
        avg_quality: z.ZodOptional<z.ZodNumber>;
        intent_distribution: z.ZodOptional<
          z.ZodRecord<z.ZodNumber, z.core.SomeType>
        >;
      },
      z.core.$strip
    >;
  },
  z.core.$strip
>;
export type TrainingExport = z.infer<typeof TrainingExportSchema>;
//# sourceMappingURL=schema.d.ts.map
