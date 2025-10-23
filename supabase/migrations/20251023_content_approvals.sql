-- Create content_approvals table for content approval workflow
CREATE TABLE IF NOT EXISTS content_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_entry_id UUID REFERENCES content_entries(id) ON DELETE SET NULL,
  scheduled_content_id UUID REFERENCES scheduled_content(id) ON DELETE SET NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('social_post', 'blog_post', 'product_description', 'email_campaign')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'rejected', 'changes_requested')),
  submitted_by TEXT NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  requested_changes TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  previous_version_id UUID REFERENCES content_approvals(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for common queries
CREATE INDEX idx_content_approvals_status ON content_approvals(status);
CREATE INDEX idx_content_approvals_content_entry ON content_approvals(content_entry_id) WHERE content_entry_id IS NOT NULL;
CREATE INDEX idx_content_approvals_scheduled_content ON content_approvals(scheduled_content_id) WHERE scheduled_content_id IS NOT NULL;
CREATE INDEX idx_content_approvals_content_type ON content_approvals(content_type);
CREATE INDEX idx_content_approvals_submitted_by ON content_approvals(submitted_by);
CREATE INDEX idx_content_approvals_reviewed_by ON content_approvals(reviewed_by) WHERE reviewed_by IS NOT NULL;
CREATE INDEX idx_content_approvals_submitted_at ON content_approvals(submitted_at);

-- Create index for pending review queue
CREATE INDEX idx_content_approvals_pending ON content_approvals(submitted_at) WHERE status = 'pending_review';

-- Enable Row Level Security
ALTER TABLE content_approvals ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read all content approvals
CREATE POLICY "Allow authenticated users to read content approvals"
  ON content_approvals
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy for authenticated users to insert content approvals
CREATE POLICY "Allow authenticated users to insert content approvals"
  ON content_approvals
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policy for authenticated users to update content approvals
CREATE POLICY "Allow authenticated users to update content approvals"
  ON content_approvals
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policy for authenticated users to delete content approvals
CREATE POLICY "Allow authenticated users to delete content approvals"
  ON content_approvals
  FOR DELETE
  TO authenticated
  USING (true);

-- Add comments to table
COMMENT ON TABLE content_approvals IS 'Stores content approval workflow with version control';
COMMENT ON COLUMN content_approvals.content_entry_id IS 'Optional reference to content_entries table';
COMMENT ON COLUMN content_approvals.scheduled_content_id IS 'Optional reference to scheduled_content table';
COMMENT ON COLUMN content_approvals.content_type IS 'Type of content: social_post, blog_post, product_description, email_campaign';
COMMENT ON COLUMN content_approvals.status IS 'Current status: pending_review, approved, rejected, changes_requested';
COMMENT ON COLUMN content_approvals.version IS 'Version number for tracking revisions';
COMMENT ON COLUMN content_approvals.previous_version_id IS 'Reference to previous version for version control';
COMMENT ON COLUMN content_approvals.metadata IS 'Additional metadata for the approval';

