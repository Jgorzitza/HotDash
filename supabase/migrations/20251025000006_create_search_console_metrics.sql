-- Migration: DATA-021 Search Console Metrics Tables
-- Description: Create tables for storing Google Search Console API data for historical trend analysis
-- Date: 2025-10-21
-- Agent: data
-- Related: Phase 11 - Search Console Persistence

-- =============================================================================
-- TABLE 1: seo_search_console_metrics
-- =============================================================================
CREATE TABLE IF NOT EXISTS seo_search_console_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Time period
  date DATE NOT NULL,
  period_days INTEGER NOT NULL DEFAULT 30, -- 7, 30, 90 day windows
  
  -- Core metrics
  clicks INTEGER NOT NULL DEFAULT 0,
  impressions INTEGER NOT NULL DEFAULT 0,
  ctr DECIMAL(5,4) NOT NULL DEFAULT 0, -- Click-through rate (0.1234 = 12.34%)
  position DECIMAL(5,2) NOT NULL DEFAULT 0, -- Average search position
  
  -- 7-day change (for trend detection)
  clicks_change_7d DECIMAL(6,2),
  impressions_change_7d DECIMAL(6,2),
  ctr_change_7d DECIMAL(6,2),
  position_change_7d DECIMAL(6,2),
  
  -- Index coverage
  indexed_pages INTEGER,
  total_pages INTEGER,
  coverage_pct DECIMAL(5,2),
  
  -- Metadata
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Prevent duplicate daily records
  UNIQUE(date, period_days)
);

-- Indexes for seo_search_console_metrics
CREATE INDEX idx_seo_metrics_date ON seo_search_console_metrics(date DESC);
CREATE INDEX idx_seo_metrics_period ON seo_search_console_metrics(period_days, date DESC);

-- =============================================================================
-- TABLE 2: seo_search_queries
-- =============================================================================
CREATE TABLE IF NOT EXISTS seo_search_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Time period
  date DATE NOT NULL,
  period_days INTEGER NOT NULL DEFAULT 30,
  
  -- Query details
  query TEXT NOT NULL,
  clicks INTEGER NOT NULL DEFAULT 0,
  impressions INTEGER NOT NULL DEFAULT 0,
  ctr DECIMAL(5,4) NOT NULL DEFAULT 0,
  position DECIMAL(5,2) NOT NULL DEFAULT 0,
  
  -- Ranking (1 = top query by clicks)
  rank INTEGER NOT NULL,
  
  -- Metadata
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Prevent duplicate query records per day
  UNIQUE(date, period_days, query)
);

-- Indexes for seo_search_queries
CREATE INDEX idx_seo_queries_date ON seo_search_queries(date DESC);
CREATE INDEX idx_seo_queries_period ON seo_search_queries(period_days, date DESC);
CREATE INDEX idx_seo_queries_rank ON seo_search_queries(date DESC, rank ASC);

-- =============================================================================
-- TABLE 3: seo_landing_pages
-- =============================================================================
CREATE TABLE IF NOT EXISTS seo_landing_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Time period
  date DATE NOT NULL,
  period_days INTEGER NOT NULL DEFAULT 30,
  
  -- Page details
  url TEXT NOT NULL,
  clicks INTEGER NOT NULL DEFAULT 0,
  impressions INTEGER NOT NULL DEFAULT 0,
  ctr DECIMAL(5,4) NOT NULL DEFAULT 0,
  position DECIMAL(5,2) NOT NULL DEFAULT 0,
  
  -- 7-day trend
  clicks_change_7d DECIMAL(6,2),
  
  -- Ranking (1 = top page by clicks)
  rank INTEGER NOT NULL,
  
  -- Metadata
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Prevent duplicate page records per day
  UNIQUE(date, period_days, url)
);

-- Indexes for seo_landing_pages
CREATE INDEX idx_seo_landing_pages_date ON seo_landing_pages(date DESC);
CREATE INDEX idx_seo_landing_pages_period ON seo_landing_pages(period_days, date DESC);
CREATE INDEX idx_seo_landing_pages_rank ON seo_landing_pages(date DESC, rank ASC);
CREATE INDEX idx_seo_landing_pages_url ON seo_landing_pages(url, date DESC);

-- =============================================================================
-- RLS POLICIES: seo_search_console_metrics
-- =============================================================================
ALTER TABLE seo_search_console_metrics ENABLE ROW LEVEL SECURITY;

-- Read all (all authenticated users)
CREATE POLICY "seo_metrics_read_all"
  ON seo_search_console_metrics
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- Insert service_role only (automated jobs)
CREATE POLICY "seo_metrics_insert_service"
  ON seo_search_console_metrics
  FOR INSERT
  TO service_role
  WITH CHECK (TRUE);

-- No deletes (historical data)
CREATE POLICY "seo_metrics_no_delete"
  ON seo_search_console_metrics
  FOR DELETE
  TO authenticated
  USING (FALSE);

-- =============================================================================
-- RLS POLICIES: seo_search_queries
-- =============================================================================
ALTER TABLE seo_search_queries ENABLE ROW LEVEL SECURITY;

-- Read all
CREATE POLICY "seo_queries_read_all"
  ON seo_search_queries
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- Insert service_role only
CREATE POLICY "seo_queries_insert_service"
  ON seo_search_queries
  FOR INSERT
  TO service_role
  WITH CHECK (TRUE);

-- No deletes
CREATE POLICY "seo_queries_no_delete"
  ON seo_search_queries
  FOR DELETE
  TO authenticated
  USING (FALSE);

-- =============================================================================
-- RLS POLICIES: seo_landing_pages
-- =============================================================================
ALTER TABLE seo_landing_pages ENABLE ROW LEVEL SECURITY;

-- Read all
CREATE POLICY "seo_landing_pages_read_all"
  ON seo_landing_pages
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- Insert service_role only
CREATE POLICY "seo_landing_pages_insert_service"
  ON seo_landing_pages
  FOR INSERT
  TO service_role
  WITH CHECK (TRUE);

-- No deletes
CREATE POLICY "seo_landing_pages_no_delete"
  ON seo_landing_pages
  FOR DELETE
  TO authenticated
  USING (FALSE);

-- =============================================================================
-- Comments for documentation
-- =============================================================================
COMMENT ON TABLE seo_search_console_metrics IS 'Google Search Console overall metrics with 7-day trend analysis';
COMMENT ON TABLE seo_search_queries IS 'Top search queries from Search Console ranked by clicks';
COMMENT ON TABLE seo_landing_pages IS 'Top landing pages from Search Console ranked by clicks';

COMMENT ON COLUMN seo_search_console_metrics.ctr IS 'Click-through rate: clicks / impressions (0.1234 = 12.34%)';
COMMENT ON COLUMN seo_search_console_metrics.position IS 'Average search position (lower is better, 1 = top position)';
COMMENT ON COLUMN seo_search_console_metrics.clicks_change_7d IS '7-day percentage change in clicks';
