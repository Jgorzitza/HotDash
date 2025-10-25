-- Create TaskAssignment table for database-driven direction/task management
-- Replaces markdown direction files with structured, queryable task assignments

CREATE TABLE IF NOT EXISTS "TaskAssignment" (
  "id" SERIAL PRIMARY KEY,
  
  -- Assignment metadata
  "assignedBy" TEXT NOT NULL,
  "assignedTo" TEXT NOT NULL,
  "taskId" TEXT UNIQUE NOT NULL,
  
  -- Task details
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "acceptanceCriteria" JSONB NOT NULL,
  "allowedPaths" JSONB NOT NULL,
  
  -- Priority & sizing
  "priority" TEXT NOT NULL,
  "phase" TEXT,
  "estimatedHours" DECIMAL(5,2),
  
  -- Dependencies & blocking
  "dependencies" JSONB,
  "blocks" JSONB,
  
  -- Status & lifecycle
  "status" TEXT NOT NULL DEFAULT 'assigned',
  "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "cancelledAt" TIMESTAMP(3),
  
  -- Context preservation
  "completionNotes" TEXT,
  "cancellationReason" TEXT,
  
  -- Evidence & artifacts
  "evidenceUrl" TEXT,
  "issueUrl" TEXT,
  "prUrl" TEXT,
  
  -- Metadata
  "payload" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS "TaskAssignment_assignedTo_status_priority_idx" 
  ON "TaskAssignment"("assignedTo", "status", "priority");

CREATE INDEX IF NOT EXISTS "TaskAssignment_status_priority_idx" 
  ON "TaskAssignment"("status", "priority");

CREATE INDEX IF NOT EXISTS "TaskAssignment_assignedBy_assignedAt_idx" 
  ON "TaskAssignment"("assignedBy", "assignedAt");

CREATE INDEX IF NOT EXISTS "TaskAssignment_phase_status_idx" 
  ON "TaskAssignment"("phase", "status");

-- Add check constraints
ALTER TABLE "TaskAssignment" ADD CONSTRAINT "TaskAssignment_priority_check" 
  CHECK ("priority" IN ('P0', 'P1', 'P2', 'P3'));

ALTER TABLE "TaskAssignment" ADD CONSTRAINT "TaskAssignment_status_check" 
  CHECK ("status" IN ('assigned', 'in_progress', 'completed', 'blocked', 'cancelled'));

-- Comments for documentation
COMMENT ON TABLE "TaskAssignment" IS 'Database-driven task assignments replacing markdown direction files';
COMMENT ON COLUMN "TaskAssignment"."completionNotes" IS 'Preserve context when marking task complete - prevents information loss';
COMMENT ON COLUMN "TaskAssignment"."dependencies" IS 'Array of taskIds this task depends on (blocks task until dependencies complete)';
COMMENT ON COLUMN "TaskAssignment"."blocks" IS 'Array of taskIds that are blocked by this task';

