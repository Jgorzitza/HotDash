-- Add Action table for CEO approval workflow
-- Growth Spec B1-B7

CREATE TABLE IF NOT EXISTS public."Action" (
  id SERIAL PRIMARY KEY,
  "toolName" TEXT NOT NULL,
  agent TEXT NOT NULL,
  parameters JSONB NOT NULL,
  rationale TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  "needsApproval" BOOLEAN NOT NULL DEFAULT true,
  "conversationId" INTEGER,
  "shopDomain" TEXT,
  "externalRef" TEXT,
  "requestedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "reviewedAt" TIMESTAMP,
  "reviewedBy" TEXT,
  "executedAt" TIMESTAMP,
  result JSONB,
  error TEXT,
  priority TEXT NOT NULL DEFAULT 'normal',
  tags TEXT[] NOT NULL DEFAULT '{}',
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "Action_status_requestedAt_idx" ON public."Action" (status, "requestedAt");
CREATE INDEX IF NOT EXISTS "Action_conversationId_idx" ON public."Action" ("conversationId");
CREATE INDEX IF NOT EXISTS "Action_shopDomain_status_idx" ON public."Action" ("shopDomain", status);
CREATE INDEX IF NOT EXISTS "Action_agent_status_idx" ON public."Action" (agent, status);

-- Add comment
COMMENT ON TABLE public."Action" IS 'Agent actions requiring CEO approval - Growth Spec B1-B7';

