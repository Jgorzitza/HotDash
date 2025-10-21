-- Migration: Create SEO Audits table
-- Phase: 7-8 (Growth)
-- Created: 2025-10-21
-- Task: DATA-011
-- Dependencies: None

-- Create table
CREATE TABLE IF NOT EXISTS seo_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_domain TEXT NOT NULL,
  crawled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Crawl metadata
  pages_crawled INT NOT NULL,
  pages_with_issues INT NOT NULL,
  total_issues INT NOT NULL,
  
  -- Core Web Vitals
  avg_lcp DECIMAL(8, 2),  -- Largest Contentful Paint (ms)
  avg_fid DECIMAL(8, 2),  -- First Input Delay (ms)
  avg_cls DECIMAL(5, 3),  -- Cumulative Layout Shift (score)
  
  -- SEO scores
  technical_score INT CHECK (technical_score BETWEEN 0 AND 100),
  content_score INT CHECK (content_score BETWEEN 0 AND 100),
  performance_score INT CHECK (performance_score BETWEEN 0 AND 100),
  mobile_score INT CHECK (mobile_score BETWEEN 0 AND 100),
  
  -- Issue breakdown
  critical_issues INT DEFAULT 0,
  high_priority_issues INT DEFAULT 0,
  medium_priority_issues INT DEFAULT 0,
  low_priority_issues INT DEFAULT 0,
  
  -- Audit details
  audit_provider TEXT,  -- 'screaming_frog', 'semrush', 'internal'
  audit_url TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  project TEXT NOT NULL DEFAULT 'occ'
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_seo_audits_shop_crawled 
ON seo_audits(shop_domain, crawled_at DESC);

CREATE INDEX IF NOT EXISTS idx_seo_audits_project 
ON seo_audits(project);

CREATE INDEX IF NOT EXISTS idx_seo_audits_scores 
ON seo_audits(technical_score, performance_score) 
WHERE technical_score IS NOT NULL;

-- Enable RLS
ALTER TABLE seo_audits ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their shop SEO audits"
  ON seo_audits FOR SELECT
  TO authenticated
  USING (shop_domain = current_setting('app.current_shop', true));

CREATE POLICY "System can insert SEO audits"
  ON seo_audits FOR INSERT
  TO authenticated
  WITH CHECK (shop_domain = current_setting('app.current_shop', true));

-- Update statistics
ANALYZE seo_audits;

