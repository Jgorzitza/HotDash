/**
 * Publer Job Status Poller
 *
 * Polls async Publer operations until completion.
 * Implements timeout and retry logic.
 *
 * @see app/adapters/publer/client.mock.ts
 */

import { getPublerClient } from "~/adapters/publer/client.mock";

export interface JobPollResult {
  status: "completed" | "failed" | "timeout";
  post_id?: string;
  error?: string;
  elapsed_ms: number;
}

/**
 * Poll Job Status Until Complete
 *
 * @param job_id - Publer job ID
 * @param timeoutMs - Maximum wait time
 * @param intervalMs - Poll interval
 * @returns Job result
 */
export async function pollJobStatus(
  job_id: string,
  timeoutMs = 60000,
  intervalMs = 2000,
): Promise<JobPollResult> {
  const startTime = Date.now();
  const publer = getPublerClient();

  while (Date.now() - startTime < timeoutMs) {
    const status = await publer.checkJobStatus(job_id);

    if (status.status === "completed") {
      return {
        status: "completed",
        post_id: status.post_id,
        elapsed_ms: Date.now() - startTime,
      };
    }

    if (status.status === "failed") {
      return {
        status: "failed",
        error: status.error,
        elapsed_ms: Date.now() - startTime,
      };
    }

    // Wait before next poll
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  return {
    status: "timeout",
    elapsed_ms: Date.now() - startTime,
  };
}
