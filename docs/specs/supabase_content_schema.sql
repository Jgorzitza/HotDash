-- ============================================================================
-- Supabase Schema for Content Management
-- ============================================================================
-- 
-- Tables for storing content posts, performance metrics, and HITL workflow data.
-- Designed for Hot Rod AN Control Center content management system.
--
-- Version: 1.0
-- Date: 2025-10-16
-- Owner: content agent
--

-- ============================================================================
-- Enable UUID extension
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Table: content_posts
-- Stores all content posts across platforms
-- ============================================================================

CREATE TABLE IF NOT EXISTS content_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Platform and content
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'facebook', 'tiktok')),
  content TEXT NOT NULL,
  media_urls TEXT[], -- Array of media URLs
  
  -- Status and workflow
  status TEXT NOT NULL CHECK (status IN ('draft', 'pending_review', 'approved', 'rejected', 'scheduled', 'published', 'failed')),
  
  -- Metadata
  hashtags TEXT[],
  mentions TEXT[],
  character_count INTEGER,
  word_count INTEGER,
  
  -- Scheduling
  scheduled_for TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  
  -- Platform response
  platform_post_id TEXT, -- ID from platform (Instagram, Facebook, TikTok)
  platform_url TEXT, -- URL to post on platform
  
  -- Ownership and audit
  created_by TEXT NOT NULL, -- 'ai-content-agent' or user ID
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Indexes
  CONSTRAINT content_posts_platform_idx CHECK (platform IS NOT NULL)
);

CREATE INDEX idx_content_posts_status ON content_posts(status);
CREATE INDEX idx_content_posts_platform ON content_posts(platform);
CREATE INDEX idx_content_posts_scheduled ON content_posts(scheduled_for) WHERE scheduled_for IS NOT NULL;
CREATE INDEX idx_content_posts_published ON content_posts(published_at) WHERE published_at IS NOT NULL;

-- ============================================================================
-- Table: content_drafts
-- Stores draft versions and reasoning
-- ============================================================================

CREATE TABLE IF NOT EXISTS content_drafts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES content_posts(id) ON DELETE CASCADE,
  
  -- Draft content
  content TEXT NOT NULL,
  platform TEXT NOT NULL,
  
  -- Metadata
  hashtags TEXT[],
  character_count INTEGER,
  word_count INTEGER,
  
  -- AI reasoning
  strategy TEXT,
  expected_performance TEXT,
  based_on TEXT[],
  
  -- Version tracking
  version INTEGER NOT NULL DEFAULT 1,
  is_current BOOLEAN NOT NULL DEFAULT true,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_content_drafts_post ON content_drafts(post_id);
CREATE INDEX idx_content_drafts_current ON content_drafts(post_id, is_current) WHERE is_current = true;

-- ============================================================================
-- Table: content_reviews
-- Stores HITL review feedback and grades
-- ============================================================================

CREATE TABLE IF NOT EXISTS content_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES content_posts(id) ON DELETE CASCADE,
  
  -- Reviewer
  reviewed_by TEXT NOT NULL, -- User ID or email
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Grades (1-5 scale)
  tone_grade INTEGER CHECK (tone_grade >= 1 AND tone_grade <= 5),
  accuracy_grade INTEGER CHECK (accuracy_grade >= 1 AND accuracy_grade <= 5),
  policy_grade INTEGER CHECK (policy_grade >= 1 AND policy_grade <= 5),
  
  -- Feedback
  comments TEXT,
  
  -- Decision
  approved BOOLEAN NOT NULL,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_content_reviews_post ON content_reviews(post_id);
CREATE INDEX idx_content_reviews_reviewer ON content_reviews(reviewed_by);

-- ============================================================================
-- Table: content_edits
-- Tracks human edits for learning
-- ============================================================================

CREATE TABLE IF NOT EXISTS content_edits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES content_posts(id) ON DELETE CASCADE,
  review_id UUID REFERENCES content_reviews(id) ON DELETE CASCADE,
  
  -- Edit details
  field TEXT NOT NULL, -- 'content', 'hashtags', etc.
  original_value TEXT NOT NULL,
  edited_value TEXT NOT NULL,
  
  -- Edit analysis
  edit_type TEXT CHECK (edit_type IN ('addition', 'deletion', 'modification', 'rewrite')),
  edit_distance INTEGER, -- Levenshtein distance
  significance TEXT CHECK (significance IN ('minor', 'moderate', 'major')),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_content_edits_post ON content_edits(post_id);
CREATE INDEX idx_content_edits_review ON content_edits(review_id);

-- ============================================================================
-- Table: content_performance
-- Stores performance metrics from platforms
-- ============================================================================

CREATE TABLE IF NOT EXISTS content_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES content_posts(id) ON DELETE CASCADE,
  
  -- Engagement metrics
  likes INTEGER NOT NULL DEFAULT 0,
  comments INTEGER NOT NULL DEFAULT 0,
  shares INTEGER NOT NULL DEFAULT 0,
  saves INTEGER DEFAULT 0, -- Instagram/TikTok specific
  engagement_rate DECIMAL(5,2), -- Percentage
  
  -- Reach metrics
  impressions INTEGER NOT NULL DEFAULT 0,
  reach INTEGER NOT NULL DEFAULT 0,
  unique_views INTEGER,
  
  -- Click metrics
  clicks INTEGER NOT NULL DEFAULT 0,
  click_through_rate DECIMAL(5,2), -- Percentage
  link_clicks INTEGER,
  profile_clicks INTEGER,
  
  -- Conversion metrics
  conversions INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2), -- Percentage
  revenue DECIMAL(10,2),
  
  -- Measurement period
  measured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_content_performance_post ON content_performance(post_id);
CREATE INDEX idx_content_performance_measured ON content_performance(measured_at);

-- ============================================================================
-- Table: content_audit_log
-- Complete audit trail for all actions
-- ============================================================================

CREATE TABLE IF NOT EXISTS content_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES content_posts(id) ON DELETE CASCADE,
  
  -- Action details
  action TEXT NOT NULL, -- 'draft_created', 'submitted_for_review', 'approved', 'published', etc.
  actor TEXT NOT NULL, -- User ID, email, or 'system'
  details TEXT,
  
  -- Metadata
  metadata JSONB, -- Additional structured data
  
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_content_audit_post ON content_audit_log(post_id);
CREATE INDEX idx_content_audit_action ON content_audit_log(action);
CREATE INDEX idx_content_audit_timestamp ON content_audit_log(timestamp);

-- ============================================================================
-- Table: content_snippets
-- Reusable content snippets library
-- ============================================================================

CREATE TABLE IF NOT EXISTS content_snippets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Snippet details
  type TEXT NOT NULL CHECK (type IN ('tagline', 'cta', 'description', 'phrase', 'disclaimer')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  
  -- Platform support
  platforms TEXT[] NOT NULL, -- Array of supported platforms
  
  -- Organization
  category TEXT,
  tags TEXT[],
  
  -- Usage tracking
  usage_count INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_content_snippets_type ON content_snippets(type);
CREATE INDEX idx_content_snippets_usage ON content_snippets(usage_count DESC);

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE content_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_edits ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_snippets ENABLE ROW LEVEL SECURITY;

-- Policies (to be customized based on auth setup)
-- Example: Allow authenticated users to read all content
CREATE POLICY "Allow authenticated read" ON content_posts
  FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================================================
-- Functions and Triggers
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_content_posts_updated_at
  BEFORE UPDATE ON content_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_snippets_updated_at
  BEFORE UPDATE ON content_snippets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE content_posts IS 'Stores all content posts across social media platforms';
COMMENT ON TABLE content_drafts IS 'Stores draft versions with AI reasoning';
COMMENT ON TABLE content_reviews IS 'Stores HITL review feedback and grades';
COMMENT ON TABLE content_edits IS 'Tracks human edits for machine learning';
COMMENT ON TABLE content_performance IS 'Stores performance metrics from platforms';
COMMENT ON TABLE content_audit_log IS 'Complete audit trail for all actions';
COMMENT ON TABLE content_snippets IS 'Reusable content snippets library';

