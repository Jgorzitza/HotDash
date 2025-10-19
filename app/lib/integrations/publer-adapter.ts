/**
 * Publer Adapter
 *
 * Production-ready adapter for Publer social media scheduling API.
 * Supports feature flag toggle between mock (dev) and real API (production).
 */

import { isPublerLive } from "../../utils/feature-flags.server";
import type { PublerJobResponse } from "../../../packages/integrations/publer";

export interface SchedulePostInput {
  text: string;
  accountIds: string[];
  scheduledAt?: string; // ISO 8601
  workspaceId?: string;
}

export interface JobStatus {
  status: "pending" | "processing" | "complete" | "failed";
  jobId: string;
  error?: string;
  completedAt?: string;
}

// Mock data for development
const mockJobs = new Map<string, JobStatus>();
let mockJobCounter = 1;

function generateMockJobId(): string {
  return `mock-job-${mockJobCounter++}-${Date.now()}`;
}

async function mockSchedulePost(
  _input: SchedulePostInput,
): Promise<PublerJobResponse> {
  const jobId = generateMockJobId();

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Store mock job status
  mockJobs.set(jobId, {
    status: "pending",
    jobId,
  });

  // Simulate async processing
  setTimeout(() => {
    mockJobs.set(jobId, {
      status: "complete",
      jobId,
      completedAt: new Date().toISOString(),
    });
  }, 2000);

  return { job_id: jobId };
}

async function mockGetJobStatus(jobId: string): Promise<JobStatus> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 50));

  const status = mockJobs.get(jobId);
  if (!status) {
    return {
      status: "failed",
      jobId,
      error: "Job not found",
    };
  }

  return status;
}

/**
 * Schedule a post to Publer
 * Uses mock API in dev mode, real API in production (when PUBLER_LIVE=true)
 */
export async function schedulePost(
  input: SchedulePostInput,
): Promise<PublerJobResponse> {
  if (!isPublerLive()) {
    console.log("[publer-adapter] Using mock API (dev mode)");
    return mockSchedulePost(input);
  }

  console.log("[publer-adapter] Using real Publer API (production mode)");

  // Dynamic import to avoid loading in dev
  const { schedulePost: realSchedulePost } = await import(
    "../../../packages/integrations/publer"
  );

  return realSchedulePost(input);
}

/**
 * Get job status from Publer
 * Uses mock API in dev mode, real API in production (when PUBLER_LIVE=true)
 */
export async function getJobStatus(
  jobId: string,
  workspaceId?: string,
): Promise<JobStatus> {
  if (!isPublerLive()) {
    console.log("[publer-adapter] Using mock API (dev mode)");
    return mockGetJobStatus(jobId);
  }

  console.log("[publer-adapter] Using real Publer API (production mode)");

  // Dynamic import to avoid loading in dev
  const { getJobStatus: realGetJobStatus } = await import(
    "../../../packages/integrations/publer"
  );

  const rawStatus = await realGetJobStatus(jobId, workspaceId);

  // Normalize response from Publer API to our JobStatus interface
  return {
    status: rawStatus.status || "pending",
    jobId,
    error: rawStatus.error,
    completedAt: rawStatus.completed_at,
  };
}

/**
 * List all social accounts (production only)
 */
export async function listAccounts(workspaceId?: string) {
  if (!isPublerLive()) {
    console.log("[publer-adapter] Using mock API (dev mode)");
    return [
      {
        id: "mock-twitter-1",
        name: "Mock Twitter Account",
        platform: "twitter",
      },
      {
        id: "mock-facebook-1",
        name: "Mock Facebook Page",
        platform: "facebook",
      },
    ];
  }

  const { listAccounts: realListAccounts } = await import(
    "../../../packages/integrations/publer"
  );

  return realListAccounts(workspaceId);
}

/**
 * Reset mock job storage (testing only)
 */
export function __resetMockJobs() {
  mockJobs.clear();
  mockJobCounter = 1;
}
