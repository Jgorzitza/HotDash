-- Knowledge Base Content Audit Query
-- Reviews canned_responses content

SELECT 
  id,
  short_code,
  LEFT(content, 100) as content_preview,
  LENGTH(content) as content_length,
  created_at,
  updated_at
FROM canned_responses
ORDER BY created_at DESC;

