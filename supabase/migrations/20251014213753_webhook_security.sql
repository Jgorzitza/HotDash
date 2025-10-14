-- Webhook Security: Processed Webhooks Table
-- Supports idempotency key tracking and replay protection
-- Created: 2025-10-14

-- Create processed_webhook table
CREATE TABLE IF NOT EXISTS processed_webhook (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL, -- shopify, chatwoot, stripe, etc.
  idempotency_key TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Composite unique constraint for source + idempotencyKey
  CONSTRAINT processed_webhook_source_key_unique UNIQUE (source, idempotency_key)
);

-- Create index on source for faster lookups
CREATE INDEX IF NOT EXISTS idx_processed_webhook_source 
  ON processed_webhook(source);

-- Create index on expires_at for cleanup queries
CREATE INDEX IF NOT EXISTS idx_processed_webhook_expires 
  ON processed_webhook(expires_at);

-- Create index on idempotency_key for faster lookups
CREATE INDEX IF NOT EXISTS idx_processed_webhook_idempotency_key 
  ON processed_webhook(idempotency_key);

-- Enable Row Level Security
ALTER TABLE processed_webhook ENABLE ROW LEVEL SECURITY;

-- Create policy for service role (allow all operations)
CREATE POLICY "Service role can manage webhooks" ON processed_webhook
  FOR ALL
  USING (auth.role() = 'service_role');

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_processed_webhook_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_processed_webhook_updated_at_trigger
  BEFORE UPDATE ON processed_webhook
  FOR EACH ROW
  EXECUTE FUNCTION update_processed_webhook_updated_at();

-- Add comments
COMMENT ON TABLE processed_webhook IS 'Tracks processed webhooks for idempotency and replay protection';
COMMENT ON COLUMN processed_webhook.source IS 'Webhook source (shopify, chatwoot, stripe, etc.)';
COMMENT ON COLUMN processed_webhook.idempotency_key IS 'Unique identifier for the webhook (prevents duplicate processing)';
COMMENT ON COLUMN processed_webhook.expires_at IS 'When this record should be cleaned up';

