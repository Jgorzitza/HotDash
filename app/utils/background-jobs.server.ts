/**
 * Background job processing system
 * 
 * Simple job queue for async operations that don't need
 * to block the request/response cycle.
 */

import { createClient } from "@supabase/supabase-js";

export type JobStatus = "pending" | "processing" | "completed" | "failed";

export interface Job {
  id: string;
  type: string;
  payload: unknown;
  status: JobStatus;
  attempts: number;
  maxAttempts: number;
  scheduledFor: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  createdAt: Date;
}

interface JobHandler<T = unknown> {
  (payload: T): Promise<void>;
}

class JobQueue {
  private handlers = new Map<string, JobHandler>();

  /**
   * Register a job handler
   */
  register<T>(type: string, handler: JobHandler<T>): void {
    this.handlers.set(type, handler as JobHandler);
  }

  /**
   * Enqueue a job for processing
   */
  async enqueue(
    type: string,
    payload: unknown,
    options: {
      scheduledFor?: Date;
      maxAttempts?: number;
    } = {},
  ): Promise<string> {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const jobId = `job-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    const { error } = await supabase.from("background_jobs").insert({
      id: jobId,
      type,
      payload,
      status: "pending",
      attempts: 0,
      max_attempts: options.maxAttempts || 3,
      scheduled_for: (options.scheduledFor || new Date()).toISOString(),
      created_at: new Date().toISOString(),
    });

    if (error) {
      throw new Error(`Failed to enqueue job: ${error.message}`);
    }

    return jobId;
  }

  /**
   * Process pending jobs
   * Should be called by a cron job or background worker
   */
  async processPendingJobs(): Promise<{
    processed: number;
    succeeded: number;
    failed: number;
  }> {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get jobs ready for processing
    const { data: jobs, error: fetchError } = await supabase
      .from("background_jobs")
      .select("*")
      .eq("status", "pending")
      .lte("scheduled_for", new Date().toISOString())
      .lt("attempts", "max_attempts")
      .limit(50);

    if (fetchError || !jobs) {
      console.error("Error fetching jobs:", fetchError);
      return { processed: 0, succeeded: 0, failed: 0 };
    }

    let succeeded = 0;
    let failed = 0;

    for (const job of jobs) {
      const handler = this.handlers.get(job.type);

      if (!handler) {
        console.error(`No handler registered for job type: ${job.type}`);
        await supabase
          .from("background_jobs")
          .update({
            status: "failed",
            error: `No handler registered for type: ${job.type}`,
            completed_at: new Date().toISOString(),
          })
          .eq("id", job.id);
        failed++;
        continue;
      }

      // Mark as processing
      await supabase
        .from("background_jobs")
        .update({
          status: "processing",
          started_at: new Date().toISOString(),
        })
        .eq("id", job.id);

      try {
        await handler(job.payload);

        // Mark as completed
        await supabase
          .from("background_jobs")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
          })
          .eq("id", job.id);

        succeeded++;
      } catch (error) {
        const newAttempts = job.attempts + 1;
        const errorMessage = error instanceof Error ? error.message : "Unknown error";

        if (newAttempts >= job.max_attempts) {
          // Mark as failed
          await supabase
            .from("background_jobs")
            .update({
              status: "failed",
              attempts: newAttempts,
              error: errorMessage,
              completed_at: new Date().toISOString(),
            })
            .eq("id", job.id);
        } else {
          // Retry with exponential backoff
          const delay = 1000 * Math.pow(2, newAttempts); // 2s, 4s, 8s, etc.
          const scheduledFor = new Date(Date.now() + delay);

          await supabase
            .from("background_jobs")
            .update({
              status: "pending",
              attempts: newAttempts,
              error: errorMessage,
              scheduled_for: scheduledFor.toISOString(),
            })
            .eq("id", job.id);
        }

        failed++;
      }
    }

    return {
      processed: jobs.length,
      succeeded,
      failed,
    };
  }

  /**
   * Get job status
   */
  async getJob(jobId: string): Promise<Job | null> {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from("background_jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (error || !data) {
      return null;
    }

    return data as unknown as Job;
  }
}

// Singleton instance
export const jobQueue = new JobQueue();

// Register example job handlers
jobQueue.register("send-email", async (payload: { to: string; subject: string; body: string }) => {
  console.log(`Sending email to ${payload.to}: ${payload.subject}`);
  // TODO: Implement actual email sending
});

jobQueue.register("sync-inventory", async (payload: { shopDomain: string }) => {
  console.log(`Syncing inventory for ${payload.shopDomain}`);
  // TODO: Implement inventory sync
});

jobQueue.register("process-webhook", async (payload: { webhookId: string }) => {
  console.log(`Processing webhook ${payload.webhookId}`);
  // TODO: Implement webhook processing
});

