-- Content Approvals Schema
-- Stores HITL approval history for social media posts
-- Author: content agent
-- Date: 2025-10-19

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Content Approvals Table
CREATE TABLE IF NOT EXISTS public.content_approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Approval metadata
  kind TEXT NOT NULL DEFAULT 'content' CHECK (kind IN ('content', 'cx_reply', 'inventory', 'growth', 'misc')),
  state TEXT NOT NULL DEFAULT 'draft' CHECK (state IN ('draft', 'pending_review', 'approved', 'declined', 'applied', 'audited', 'learned')),
  summary TEXT NOT NULL,
  
  -- Actors
  created_by TEXT NOT NULL DEFAULT 'content-agent',
  reviewer TEXT, -- CEO username
  
  -- Post draft (JSONB for flexibility)
  post_draft JSONB NOT NULL,
  
  -- Evidence
  evidence JSONB NOT NULL,
  
  -- Projected impact
  projected_impact JSONB NOT NULL,
  
  -- Risk assessment
  risks JSONB NOT NULL,
  
  -- Rollback plan
  rollback JSONB NOT NULL,
  
  -- Tone validation results
  tone_check JSONB NOT NULL,
  
  -- CEO grading (1-5 scale)
  grades JSONB,
  
  -- CEO edits
  edits JSONB,
  
  -- Apply result (Publer job/post IDs)
  apply_result JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  applied_at TIMESTAMPTZ,
  audited_at TIMESTAMPTZ,
  
  -- Indexes
  CONSTRAINT valid_grades CHECK (
    grades IS NULL OR (
      (grades->>'tone')::INT BETWEEN 1 AND 5 AND
      (grades->>'accuracy')::INT BETWEEN 1 AND 5 AND
      (grades->>'policy')::INT BETWEEN 1 AND 5
    )
  )
);

-- Indexes for common queries
CREATE INDEX idx_content_approvals_state ON public.content_approvals(state);
CREATE INDEX idx_content_approvals_created_by ON public.content_approvals(created_by);
CREATE INDEX idx_content_approvals_reviewer ON public.content_approvals(reviewer);
CREATE INDEX idx_content_approvals_created_at ON public.content_approvals(created_at DESC);
CREATE INDEX idx_content_approvals_platform ON public.content_approvals((post_draft->>'platform'));

-- RLS Policies
ALTER TABLE public.content_approvals ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can read
CREATE POLICY "Anyone can view content approvals" ON public.content_approvals
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy: Only content agent can insert
CREATE POLICY "Content agent can create approvals" ON public.content_approvals
  FOR INSERT
  WITH CHECK (created_by = 'content-agent');

-- Policy: Only CEO can update (approve/decline)
CREATE POLICY "CEO can update approvals" ON public.content_approvals
  FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE email = 'justin@hotrodan.com'));

-- Comments
COMMENT ON TABLE public.content_approvals IS 'HITL approval history for social media posts';
COMMENT ON COLUMN public.content_approvals.post_draft IS 'Complete post draft including platform, content, target metrics';
COMMENT ON COLUMN public.content_approvals.grades IS 'CEO quality grades: tone, accuracy, policy (1-5)';
COMMENT ON COLUMN public.content_approvals.edits IS 'Before/after text if CEO edited the post';

