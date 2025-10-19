/**
 * Publer API Client (Production)
 *
 * Real Publer API integration for social media posting
 *
 * @module app/adapters/publer/client.real
 */

import { AdsConfig } from "~/config/ads.server";

const BASE_URL = "https://app.publer.com/api/v1";

interface PublerAccountInfo {
  id: string;
  name: string;
  email: string;
  workspaces: Array<{
    id: string;
    name: string;
    role: string;
  }>;
}

interface PublerSocialAccount {
  id: string;
  name: string;
  platform: string;
  status: "active" | "disconnected" | "expired";
  avatar?: string;
}

interface PublerPostStatus {
  id: string;
  status: "draft" | "scheduled" | "published" | "failed";
  scheduled_at?: string;
  published_at?: string;
  platforms: string[];
  error?: string;
}

/**
 * Get account information
 */
export async function getAccountInfo(): Promise<PublerAccountInfo> {
  const response = await fetch(`${BASE_URL}/account_info`, {
    headers: {
      Authorization: `Bearer-API ${AdsConfig.publer.apiKey}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Publer /account_info failed: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

/**
 * Get connected social accounts
 */
export async function getSocialAccounts(): Promise<PublerSocialAccount[]> {
  const response = await fetch(`${BASE_URL}/social_accounts`, {
    headers: {
      Authorization: `Bearer-API ${AdsConfig.publer.apiKey}`,
      "Publer-Workspace-Id": AdsConfig.publer.workspaceId,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Publer /social_accounts failed: ${response.status} ${response.statusText}`,
    );
  }

  const data = await response.json();
  return data.accounts || [];
}

/**
 * Get post status by job ID
 */
export async function getPostStatus(jobId: string): Promise<PublerPostStatus> {
  const response = await fetch(`${BASE_URL}/job_status/${jobId}`, {
    headers: {
      Authorization: `Bearer-API ${AdsConfig.publer.apiKey}`,
      "Publer-Workspace-Id": AdsConfig.publer.workspaceId,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Publer /job_status failed: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

/**
 * Health check for Publer API connectivity
 */
export async function checkPublerHealth(): Promise<{
  accessible: boolean;
  accountValid: boolean;
  rateLimitOK: boolean;
  message: string;
}> {
  try {
    const accountInfo = await getAccountInfo();

    return {
      accessible: true,
      accountValid: accountInfo.id !== undefined,
      rateLimitOK: true,
      message: `Connected as ${accountInfo.name}`,
    };
  } catch (error) {
    return {
      accessible: false,
      accountValid: false,
      rateLimitOK: false,
      message: error instanceof Error ? error.message : "Connection failed",
    };
  }
}
