/**
 * Publer Workspace Manager
 *
 * Manages Publer workspace configuration and settings.
 *
 * @see docs/integrations/publer-oauth-setup.md
 */

import type {
  PublerWorkspace,
  PublerConnectedAccount,
} from "~/adapters/publer/types";

/**
 * Get Active Workspace
 *
 * PLACEHOLDER: Loads from environment/database.
 *
 * @returns Active workspace configuration
 */
export async function getActiveWorkspace(): Promise<PublerWorkspace> {
  console.log("[PLACEHOLDER] getActiveWorkspace");

  return {
    id: process.env.PUBLER_WORKSPACE_ID || "mock-workspace-id",
    name: "Hot Rod AN",
    accounts: [],
  };
}

/**
 * List Workspace Accounts
 *
 * @param workspace_id - Workspace ID
 * @returns Connected social accounts
 */
export async function listWorkspaceAccounts(
  workspace_id: string,
): Promise<PublerConnectedAccount[]> {
  const { getPublerClient } = await import("~/adapters/publer/client.mock");
  const publer = getPublerClient(workspace_id);

  return await publer.listConnectedAccounts();
}
