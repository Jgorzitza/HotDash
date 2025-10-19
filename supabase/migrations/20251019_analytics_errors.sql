-- Analytics Error Logging Table
-- 
-- Stores analytics errors for historical debugging and pattern detection.
-- DO NOT APPLY without Manager/DevOps approval.
--
-- Date: 2025-10-19
-- Owner: Analytics Agent
-- Status: PENDING APPROVAL

-- Create analytics_errors table
CREATE TABLE IF NOT EXISTS analytics_errors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Error details
    endpoint TEXT NOT NULL,
    error_type TEXT NOT NULL,
    error_message TEXT NOT NULL,
    error_stack TEXT,
    
    -- Request context
    request_method TEXT,
    request_path TEXT,
    request_ip TEXT,
    user_agent TEXT,
    
    -- Response context
    http_status INTEGER,
    response_time_ms INTEGER,
    
    -- Metadata
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    
    -- Indexing
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_errors_endpoint 
    ON analytics_errors(endpoint);
    
CREATE INDEX IF NOT EXISTS idx_analytics_errors_occurred_at 
    ON analytics_errors(occurred_at DESC);
    
CREATE INDEX IF NOT EXISTS idx_analytics_errors_is_resolved 
    ON analytics_errors(is_resolved) 
    WHERE is_resolved = FALSE;

CREATE INDEX IF NOT EXISTS idx_analytics_errors_error_type 
    ON analytics_errors(error_type);

-- Row Level Security (RLS)
ALTER TABLE analytics_errors ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do anything
CREATE POLICY "Service role full access" 
    ON analytics_errors 
    FOR ALL 
    TO service_role 
    USING (true) 
    WITH CHECK (true);

-- Policy: Authenticated users can read
CREATE POLICY "Authenticated users can read errors" 
    ON analytics_errors 
    FOR SELECT 
    TO authenticated 
    USING (true);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_analytics_errors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER analytics_errors_updated_at
    BEFORE UPDATE ON analytics_errors
    FOR EACH ROW
    EXECUTE FUNCTION update_analytics_errors_updated_at();

-- Comments
COMMENT ON TABLE analytics_errors IS 'Stores analytics API errors for debugging and monitoring';
COMMENT ON COLUMN analytics_errors.endpoint IS 'Analytics endpoint that failed (e.g. /api/analytics/revenue)';
COMMENT ON COLUMN analytics_errors.error_type IS 'Error classification (GA4Error, NetworkError, ValidationError, etc.)';
COMMENT ON COLUMN analytics_errors.is_resolved IS 'Whether the error has been investigated and resolved';

