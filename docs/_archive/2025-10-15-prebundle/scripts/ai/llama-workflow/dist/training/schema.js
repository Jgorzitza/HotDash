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
export const TrainingSampleSchema = z.object({
  // Unique identifier for this sample
  sample_id: z.string().uuid(),
  // Timestamps
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().optional(),
  // Source information
  source: z.object({
    agent_name: z.string(), // e.g., "Order Support", "Product Q&A", "Triage"
    agent_sdk_version: z.string().optional(),
    conversation_id: z.number(),
    chatwoot_conversation_id: z.number().optional(),
  }),
  // Query data
  query: z.object({
    text: z.string().min(1),
    intent: z
      .enum([
        "order_status",
        "refund",
        "cancel",
        "exchange",
        "product_question",
        "policy_question",
        "technical_support",
        "escalation",
        "other",
      ])
      .optional(),
    metadata: z.record(z.any()).optional(),
  }),
  // Agent response
  agent_response: z.object({
    text: z.string().min(1),
    sources: z
      .array(
        z.object({
          id: z.string(),
          score: z.number(),
          text: z.string(),
          metadata: z.record(z.any()),
        }),
      )
      .optional(),
    confidence: z.number().min(0).max(1).optional(),
    processing_time_ms: z.number().optional(),
  }),
  // Human feedback
  human_feedback: z.object({
    // Approval status
    approved: z.boolean(),
    approved_by: z.string().optional(), // operator username
    approved_at: z.string().datetime().optional(),
    // Human-edited version (if agent response was modified)
    human_edited_text: z.string().optional(),
    edit_reason: z
      .enum([
        "tone_adjustment",
        "factual_correction",
        "policy_clarification",
        "added_context",
        "removed_content",
        "complete_rewrite",
        "other",
      ])
      .optional(),
    // Quality scores (1-5 scale)
    quality_scores: z
      .object({
        factuality: z.number().min(1).max(5).optional(),
        helpfulness: z.number().min(1).max(5).optional(),
        tone: z.number().min(1).max(5).optional(),
        policy_alignment: z.number().min(1).max(5).optional(),
        citation_quality: z.number().min(1).max(5).optional(),
      })
      .optional(),
    // Overall rating
    overall_rating: z.enum(["poor", "fair", "good", "excellent"]).optional(),
    // Freeform notes
    notes: z.string().optional(),
  }),
  // Customer outcome (if available)
  customer_outcome: z
    .object({
      resolved: z.boolean().optional(),
      csat_score: z.number().min(1).max(5).optional(),
      resolution_time_minutes: z.number().optional(),
      required_escalation: z.boolean().optional(),
    })
    .optional(),
  // Tags for filtering and analysis
  tags: z.array(z.string()).optional(),
  // Training corpus flags
  training_flags: z.object({
    include_in_training: z.boolean().default(true),
    include_in_evaluation: z.boolean().default(false),
    quality_reviewed: z.boolean().default(false),
    pii_redacted: z.boolean().default(false),
  }),
});
/**
 * Batch collection metadata for tracking corpus building
 */
export const TrainingBatchSchema = z.object({
  batch_id: z.string().uuid(),
  created_at: z.string().datetime(),
  samples_count: z.number(),
  date_range: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }),
  sources: z.array(z.string()),
  quality_metrics: z.object({
    approval_rate: z.number().min(0).max(1),
    avg_factuality: z.number().optional(),
    avg_helpfulness: z.number().optional(),
    edit_rate: z.number().min(0).max(1).optional(),
  }),
  metadata: z.record(z.any()).optional(),
});
/**
 * Query performance metrics for optimization tracking
 */
export const QueryPerformanceSchema = z.object({
  metric_id: z.string().uuid(),
  timestamp: z.string().datetime(),
  query_text: z.string(),
  query_hash: z.string(), // for deduplication
  performance: z.object({
    latency_ms: z.number(),
    topK: z.number(),
    cache_hit: z.boolean().default(false),
    index_version: z.string().optional(),
  }),
  quality: z.object({
    sources_count: z.number(),
    avg_source_score: z.number().min(0).max(1),
    confidence: z.number().min(0).max(1).optional(),
  }),
  outcome: z
    .object({
      approved: z.boolean().optional(),
      edited: z.boolean().optional(),
      human_rating: z.number().min(1).max(5).optional(),
    })
    .optional(),
});
/**
 * Aggregated metrics for monitoring and reporting
 */
export const AggregatedMetricsSchema = z.object({
  period: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }),
  query_metrics: z.object({
    total_queries: z.number(),
    avg_latency_ms: z.number(),
    p50_latency_ms: z.number(),
    p95_latency_ms: z.number(),
    p99_latency_ms: z.number(),
    cache_hit_rate: z.number().min(0).max(1),
  }),
  quality_metrics: z.object({
    approval_rate: z.number().min(0).max(1),
    edit_rate: z.number().min(0).max(1),
    avg_factuality: z.number().min(1).max(5).optional(),
    avg_helpfulness: z.number().min(1).max(5).optional(),
    avg_citation_quality: z.number().min(1).max(5).optional(),
  }),
  training_corpus: z.object({
    total_samples: z.number(),
    approved_samples: z.number(),
    evaluation_samples: z.number(),
    avg_quality_score: z.number().min(1).max(5).optional(),
  }),
});
/**
 * Export format for training data (compatible with fine-tuning)
 */
export const TrainingExportSchema = z.object({
  export_id: z.string().uuid(),
  created_at: z.string().datetime(),
  format: z.enum(["jsonl", "parquet", "csv"]),
  filters: z.object({
    date_range: z
      .object({
        start: z.string().datetime(),
        end: z.string().datetime(),
      })
      .optional(),
    min_quality_score: z.number().min(1).max(5).optional(),
    approved_only: z.boolean().default(true),
    include_tags: z.array(z.string()).optional(),
    exclude_tags: z.array(z.string()).optional(),
  }),
  samples_count: z.number(),
  file_path: z.string(),
  statistics: z.object({
    approval_rate: z.number(),
    edit_rate: z.number(),
    avg_quality: z.number().optional(),
    intent_distribution: z.record(z.number()).optional(),
  }),
});
//# sourceMappingURL=schema.js.map
