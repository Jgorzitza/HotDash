// packages/integrations/publer.ts
// Minimal, typed Publer client using official API.
// Docs: https://publer.com/docs (Business plan required).
// Headers per docs: Authorization: Bearer-API <key>, Publer-Workspace-Id: <id>

const PUBLER_BASE_URL =
  process.env.PUBLER_BASE_URL || "https://app.publer.com/api/v1/";

export type PublerJobResponse = { job_id: string };

type ScheduleInput = {
  text: string;
  accountIds: string[];
  scheduledAt?: string; // ISO 8601
  workspaceId?: string;
};

function assertEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

async function publerFetch(
  path: string,
  init: RequestInit & { workspaceId?: string } = {},
) {
  const apiKey = assertEnv("PUBLER_API_KEY");
  const workspace = init.workspaceId || process.env.PUBLER_WORKSPACE_ID;
  if (!workspace)
    throw new Error(
      "Missing Publer workspace id (PUBLER_WORKSPACE_ID or pass workspaceId)",
    );
  const headers = {
    Authorization: `Bearer-API ${apiKey}`,
    "Publer-Workspace-Id": workspace,
    "Content-Type": "application/json",
    ...(init.headers || {}),
  };
  const res = await fetch(new URL(path, PUBLER_BASE_URL).toString(), {
    ...init,
    headers,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Publer API error ${res.status}: ${text}`);
  }
  return res.json();
}

export async function listWorkspaces() {
  const apiKey = assertEnv("PUBLER_API_KEY");
  const res = await fetch(new URL("workspaces", PUBLER_BASE_URL).toString(), {
    headers: { Authorization: `Bearer-API ${apiKey}` },
  });
  if (!res.ok) throw new Error(`Publer API error ${res.status}`);
  return res.json();
}

export async function listAccounts(workspaceId?: string) {
  return publerFetch("accounts", { method: "GET", workspaceId });
}

export async function schedulePost(
  input: ScheduleInput,
): Promise<PublerJobResponse> {
  const body = {
    bulk: {
      state: "scheduled",
      posts: [
        {
          networks: {},
          text: input.text,
          accounts: input.accountIds.map((id) => ({
            id,
            scheduled_at: input.scheduledAt || null,
          })),
        },
      ],
    },
  };
  return publerFetch("posts/schedule", {
    method: "POST",
    body: JSON.stringify(body),
    workspaceId: input.workspaceId,
  });
}

export async function getJobStatus(jobId: string, workspaceId?: string) {
  return publerFetch(`job_status/${encodeURIComponent(jobId)}`, {
    method: "GET",
    workspaceId,
  });
}
