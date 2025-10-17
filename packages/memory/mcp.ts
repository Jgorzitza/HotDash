// packages/memory/mcp.ts
// Thin client that proxies to a Memory MCP server if available.
export async function putFactMCP(
  serverUrl: string,
  payload: any,
): Promise<void> {
  await fetch(`${serverUrl}/facts`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
}
