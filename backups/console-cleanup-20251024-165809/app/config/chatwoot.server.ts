export interface ChatwootConfig {
  baseUrl: string;
  token: string;
  accountId: number;
  slaMinutes: number;
  embedToken?: string;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getChatwootConfig(): ChatwootConfig {
  const baseUrl = requireEnv("CHATWOOT_BASE_URL");
  const token = requireEnv("CHATWOOT_TOKEN");
  const accountId = Number.parseInt(requireEnv("CHATWOOT_ACCOUNT_ID"), 10);
  if (Number.isNaN(accountId)) {
    throw new Error("CHATWOOT_ACCOUNT_ID must be a valid integer");
  }

  const slaMinutes = Number.parseInt(
    process.env.CHATWOOT_SLA_MINUTES ?? "30",
    10,
  );

  const embedToken = process.env.CHATWOOT_EMBED_TOKEN;

  return {
    baseUrl,
    token,
    accountId,
    slaMinutes: Number.isFinite(slaMinutes) ? slaMinutes : 30,
    embedToken,
  };
}
