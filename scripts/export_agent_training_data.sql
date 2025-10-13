-- =====================================================
-- Agent Training Data Export Utilities
-- Purpose: Export training data for model fine-tuning
-- Created: 2025-10-12
-- =====================================================

-- =====================================================
-- Export Format 1: JSON (OpenAI Fine-tuning Format)
-- =====================================================

-- Export for OpenAI fine-tuning (JSONL format)
CREATE OR REPLACE FUNCTION export_training_data_openai_jsonl(
  days_back INTEGER DEFAULT 30,
  include_pii BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
  jsonl_row TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    jsonb_build_object(
      'messages', jsonb_build_array(
        jsonb_build_object(
          'role', 'system',
          'content', 'You are a helpful customer support assistant for Hot Rod AN, specializing in AN fittings and automotive fuel systems.'
        ),
        jsonb_build_object(
          'role', 'user',
          'content', CASE 
            WHEN include_pii THEN a.customer_message 
            ELSE regexp_replace(a.customer_message, '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', '[EMAIL]', 'g')
          END
        ),
        jsonb_build_object(
          'role', 'assistant',
          'content', COALESCE(a.edited_response, a.draft_response)
        )
      ),
      'metadata', jsonb_build_object(
        'conversation_id', a.conversation_id,
        'confidence_score', a.confidence_score,
        'status', a.status,
        'knowledge_sources', a.knowledge_sources,
        'suggested_tags', a.suggested_tags
      )
    )::TEXT as jsonl_row
  FROM agent_approvals a
  WHERE a.created_at > NOW() - make_interval(days => days_back)
  AND a.status IN ('approved', 'edited')
  AND a.confidence_score >= 70;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION export_training_data_openai_jsonl IS 
  'Exports approved agent responses in OpenAI JSONL format for fine-tuning';

-- =====================================================
-- Export Format 2: CSV (Excel/Analysis)
-- =====================================================

-- Export as CSV for analysis
CREATE OR REPLACE VIEW v_training_data_export_csv AS
SELECT 
  a.id,
  a.conversation_id,
  TO_CHAR(a.created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at,
  -- Sanitized PII
  CASE 
    WHEN a.customer_name IS NOT NULL THEN '[CUSTOMER]'
    ELSE NULL
  END as customer_name,
  CASE 
    WHEN a.customer_email IS NOT NULL THEN '[EMAIL]'
    ELSE NULL
  END as customer_email,
  -- Training data
  a.customer_message,
  a.draft_response,
  COALESCE(a.edited_response, a.draft_response) as final_response,
  a.confidence_score,
  a.status,
  a.priority,
  ARRAY_TO_STRING(a.suggested_tags, ',') as tags,
  JSONB_ARRAY_LENGTH(a.knowledge_sources) as knowledge_source_count,
  (a.sentiment_analysis->>'sentiment')::TEXT as sentiment,
  a.recommended_action,
  LENGTH(a.draft_response) as draft_length,
  LENGTH(COALESCE(a.edited_response, a.draft_response)) as final_length,
  CASE 
    WHEN a.edited_response IS NOT NULL THEN TRUE
    ELSE FALSE
  END as was_edited
FROM agent_approvals a
WHERE a.status IN ('approved', 'edited')
ORDER BY a.created_at DESC;

COMMENT ON VIEW v_training_data_export_csv IS 
  'CSV-ready export view with PII sanitized for safe sharing';

-- =====================================================
-- Export Format 3: Feedback Annotations (ML Training)
-- =====================================================

CREATE OR REPLACE VIEW v_feedback_export AS
SELECT 
  f.id,
  TO_CHAR(f."createdAt", 'YYYY-MM-DD HH24:MI:SS') as created_at,
  f."inputText" as input,
  f."modelDraft" as model_output,
  f."safeToSend" as is_safe,
  (f.rubric->>'clarity')::INTEGER as clarity_score,
  (f.rubric->>'accuracy')::INTEGER as accuracy_score,
  (f.rubric->>'helpfulness')::INTEGER as helpfulness_score,
  (f.rubric->>'tone')::INTEGER as tone_score,
  (
    ((f.rubric->>'clarity')::INTEGER + 
     (f.rubric->>'accuracy')::INTEGER + 
     (f.rubric->>'helpfulness')::INTEGER + 
     (f.rubric->>'tone')::INTEGER) / 4.0
  ) as overall_score,
  f.annotator,
  f.notes,
  f.labels
FROM "AgentFeedback" f
WHERE f.rubric IS NOT NULL
AND f."createdAt" > NOW() - INTERVAL '30 days'
ORDER BY f."createdAt" DESC;

COMMENT ON VIEW v_feedback_export IS 
  'Training feedback with quality scores for model improvement';

-- =====================================================
-- Export Format 4: Query Performance Dataset
-- =====================================================

CREATE OR REPLACE VIEW v_query_performance_export AS
SELECT 
  q.id,
  TO_CHAR(q."createdAt", 'YYYY-MM-DD HH24:MI:SS') as created_at,
  q.agent,
  LEFT(q.query, 500) as query_preview, -- Truncate for privacy
  q."latencyMs" as latency_ms,
  q.approved,
  q."humanEdited" as human_edited,
  CASE 
    WHEN q."latencyMs" < 200 THEN 'excellent'
    WHEN q."latencyMs" < 500 THEN 'good'
    WHEN q."latencyMs" < 1000 THEN 'fair'
    ELSE 'poor'
  END as performance_rating
FROM "AgentQuery" q
WHERE q."createdAt" > NOW() - INTERVAL '30 days'
ORDER BY q."createdAt" DESC;

COMMENT ON VIEW v_query_performance_export IS 
  'Query performance data for latency analysis and optimization';

-- =====================================================
-- Batch Export Function
-- =====================================================

CREATE OR REPLACE FUNCTION export_training_batch(
  batch_size INTEGER DEFAULT 1000,
  offset_rows INTEGER DEFAULT 0,
  format TEXT DEFAULT 'json'
)
RETURNS TABLE (
  batch_number INTEGER,
  total_rows INTEGER,
  export_data JSONB
) AS $$
BEGIN
  IF format = 'json' THEN
    RETURN QUERY
    SELECT 
      (offset_rows / batch_size + 1)::INTEGER as batch_number,
      COUNT(*) OVER ()::INTEGER as total_rows,
      jsonb_agg(
        jsonb_build_object(
          'id', a.id,
          'input', a.customer_message,
          'output', COALESCE(a.edited_response, a.draft_response),
          'metadata', jsonb_build_object(
            'confidence', a.confidence_score,
            'status', a.status,
            'tags', a.suggested_tags
          )
        )
      ) as export_data
    FROM (
      SELECT * FROM agent_approvals 
      WHERE status IN ('approved', 'edited')
      ORDER BY created_at DESC
      LIMIT batch_size OFFSET offset_rows
    ) a
    GROUP BY batch_number;
  ELSE
    RAISE EXCEPTION 'Unsupported format: %', format;
  END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION export_training_batch IS 
  'Exports training data in batches for large datasets';

-- =====================================================
-- Usage Examples
-- =====================================================

-- Example 1: Export for OpenAI fine-tuning (last 30 days)
COPY (
  SELECT jsonl_row 
  FROM export_training_data_openai_jsonl(30, FALSE)
) TO '/tmp/agent_training_openai.jsonl';

-- Example 2: Export CSV (sanitized)
COPY (
  SELECT * FROM v_training_data_export_csv LIMIT 1000
) TO '/tmp/agent_training_data.csv' WITH CSV HEADER;

-- Example 3: Export feedback annotations
COPY (
  SELECT * FROM v_feedback_export
) TO '/tmp/agent_feedback_annotations.csv' WITH CSV HEADER;

-- Example 4: Export query performance data
COPY (
  SELECT * FROM v_query_performance_export
) TO '/tmp/agent_query_performance.csv' WITH CSV HEADER;

-- Example 5: Batch export (for very large datasets)
SELECT 
  batch_number,
  total_rows,
  jsonb_array_length(export_data) as rows_in_batch
FROM export_training_batch(1000, 0, 'json');

-- =====================================================
-- Verification Queries
-- =====================================================

-- Count exportable records
SELECT 
  'agent_approvals' as table_name,
  COUNT(*) FILTER (WHERE status IN ('approved', 'edited')) as exportable_rows,
  COUNT(*) as total_rows
FROM agent_approvals
UNION ALL
SELECT 
  'AgentFeedback',
  COUNT(*) FILTER (WHERE rubric IS NOT NULL),
  COUNT(*)
FROM "AgentFeedback"
UNION ALL
SELECT 
  'AgentQuery',
  COUNT(*),
  COUNT(*)
FROM "AgentQuery";

-- Sample export data
SELECT * FROM export_training_data_openai_jsonl(7, FALSE) LIMIT 5;

