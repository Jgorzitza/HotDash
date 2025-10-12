export const DEFAULT_SHOPIFY_HOST_PARAM =
  process.env.DEFAULT_SHOPIFY_HOST_PARAM ??
  "YWRtaW4uc2hvcGlmeS5jb20vc3RvcmUvaG90ZGFzaC1zdGFnaW5nL2FwcHMvNGY3MjM3NmVhNjFiZTk1NmM4NjBkZDAyMDU1MjEyNGQ=";

export function resolveShopifyHostParam(): string {
  const envHost = process.env.PLAYWRIGHT_SHOPIFY_HOST_PARAM?.trim();
  if (envHost) {
    return envHost;
  }
  return DEFAULT_SHOPIFY_HOST_PARAM;
}

export function resolvePlaywrightBaseUrl(): string {
  return process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:4173";
}
