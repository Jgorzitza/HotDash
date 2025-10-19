/**
 * Determine if a GA4 response error was triggered by sampling.
 * Existing routes fall back to 503 when sampling occurs so tiles retry later.
 */
export function isSamplingError(error: unknown): boolean {
  if (!error) return false;

  const message =
    typeof error === "string"
      ? error
      : typeof (error as any).message === "string"
        ? (error as any).message
        : "";

  return /sampling/i.test(message);
}
