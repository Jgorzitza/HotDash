-- Migration: Enhance DecisionLog for Efficient Feedback Tracking
-- Date: 2025-10-22
-- Purpose: Add structured fields to enable manager dashboard queries
-- Impact: Reduces manager consolidation time from 30-60min to 5-10min per cycle
-- Risk: LOW - All fields nullable, backward compatible

-- Step 1: Add new columns (one at a time for safety)
ALTER TABLE "DecisionLog" ADD COLUMN IF NOT EXISTS "taskId" TEXT;
ALTER TABLE "DecisionLog" ADD COLUMN IF NOT EXISTS "status" TEXT;
ALTER TABLE "DecisionLog" ADD COLUMN IF NOT EXISTS "progressPct" INTEGER;
ALTER TABLE "DecisionLog" ADD COLUMN IF NOT EXISTS "blockerDetails" TEXT;
ALTER TABLE "DecisionLog" ADD COLUMN IF NOT EXISTS "blockedBy" TEXT;
ALTER TABLE "DecisionLog" ADD COLUMN IF NOT EXISTS "durationEstimate" DECIMAL(5,2);
ALTER TABLE "DecisionLog" ADD COLUMN IF NOT EXISTS "durationActual" DECIMAL(5,2);
ALTER TABLE "DecisionLog" ADD COLUMN IF NOT EXISTS "nextAction" TEXT;

-- Step 2: Add constraints (only if column doesn't already have constraint)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_progress_range'
  ) THEN
    ALTER TABLE "DecisionLog" ADD CONSTRAINT "check_progress_range" 
    CHECK ("progressPct" IS NULL OR ("progressPct" >= 0 AND "progressPct" <= 100));
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_duration_positive'
  ) THEN
    ALTER TABLE "DecisionLog" ADD CONSTRAINT "check_duration_positive"
    CHECK ("durationEstimate" IS NULL OR "durationEstimate" >= 0);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_duration_actual_positive'
  ) THEN
    ALTER TABLE "DecisionLog" ADD CONSTRAINT "check_duration_actual_positive"
    CHECK ("durationActual" IS NULL OR "durationActual" >= 0);
  END IF;
END $$;

-- Step 3: Add indexes
CREATE INDEX IF NOT EXISTS "DecisionLog_actor_status_createdAt_idx" 
  ON "DecisionLog"("actor", "status", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS "DecisionLog_taskId_idx" 
  ON "DecisionLog"("taskId");

CREATE INDEX IF NOT EXISTS "DecisionLog_status_createdAt_idx" 
  ON "DecisionLog"("status", "createdAt" DESC);

-- Step 4: Add documentation comments
COMMENT ON COLUMN "DecisionLog"."taskId" IS 'Task identifier from direction file (e.g., ENG-029, DATA-017)';
COMMENT ON COLUMN "DecisionLog"."status" IS 'Task status: pending, in_progress, completed, blocked, cancelled';
COMMENT ON COLUMN "DecisionLog"."progressPct" IS 'Progress percentage (0-100)';
COMMENT ON COLUMN "DecisionLog"."blockerDetails" IS 'Detailed description of what is blocking this task';
COMMENT ON COLUMN "DecisionLog"."blockedBy" IS 'Task ID or resource that is blocking this task';
COMMENT ON COLUMN "DecisionLog"."durationEstimate" IS 'Estimated duration in hours';
COMMENT ON COLUMN "DecisionLog"."durationActual" IS 'Actual duration in hours';
COMMENT ON COLUMN "DecisionLog"."nextAction" IS 'Agent stated next action';

