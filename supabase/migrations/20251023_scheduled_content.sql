-- Create scheduled_content table for content calendar and publishing workflow
CREATE TABLE IF NOT EXISTS scheduled_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_entry_id UUID REFERENCES content_entries(id) ON DELETE SET NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('social_post', 'blog_post', 'product_description', 'email_campaign')),
  platform TEXT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'publishing', 'published', 'failed', 'cancelled')),
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for common queries
CREATE INDEX idx_scheduled_content_status ON scheduled_content(status);
CREATE INDEX idx_scheduled_content_scheduled_for ON scheduled_content(scheduled_for);
CREATE INDEX idx_scheduled_content_content_type ON scheduled_content(content_type);
CREATE INDEX idx_scheduled_content_platform ON scheduled_content(platform) WHERE platform IS NOT NULL;
CREATE INDEX idx_scheduled_content_created_by ON scheduled_content(created_by);

-- Create index for calendar queries (date range)
CREATE INDEX idx_scheduled_content_date_range ON scheduled_content(scheduled_for) WHERE status = 'scheduled';

-- Enable Row Level Security
ALTER TABLE scheduled_content ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read all scheduled content
CREATE POLICY "Allow authenticated users to read scheduled content"
  ON scheduled_content
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy for authenticated users to insert scheduled content
CREATE POLICY "Allow authenticated users to insert scheduled content"
  ON scheduled_content
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policy for authenticated users to update scheduled content
CREATE POLICY "Allow authenticated users to update scheduled content"
  ON scheduled_content
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policy for authenticated users to delete scheduled content
CREATE POLICY "Allow authenticated users to delete scheduled content"
  ON scheduled_content
  FOR DELETE
  TO authenticated
  USING (true);

-- Add comment to table
COMMENT ON TABLE scheduled_content IS 'Stores scheduled content for future publishing across platforms';
COMMENT ON COLUMN scheduled_content.content_entry_id IS 'Optional reference to content_entries table';
COMMENT ON COLUMN scheduled_content.content_type IS 'Type of content: social_post, blog_post, product_description, email_campaign';
COMMENT ON COLUMN scheduled_content.platform IS 'Platform for social posts (facebook, instagram, twitter, linkedin)';
COMMENT ON COLUMN scheduled_content.scheduled_for IS 'When the content should be published';
COMMENT ON COLUMN scheduled_content.status IS 'Current status: scheduled, publishing, published, failed, cancelled';
COMMENT ON COLUMN scheduled_content.retry_count IS 'Number of times publishing has been retried';
COMMENT ON COLUMN scheduled_content.metadata IS 'Additional metadata for the scheduled content';

