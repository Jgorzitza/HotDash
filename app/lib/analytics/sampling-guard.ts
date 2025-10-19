interface SamplingError {
  code?: string;
  status?: number;
  message?: string;
}

const SAMPLING_KEYWORDS = ["sample", "data sampling"];
const SAMPLING_ERROR_CODES = new Set(["DATA_PARTIAL", "DATA_SAMPLING"]); // align with GA4 error codes when sampling occurs

export function isSamplingError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const details = error as SamplingError;

  if (details.code && SAMPLING_ERROR_CODES.has(details.code)) {
    return true;
  }

  const rawMessage =
    details.message ??
    ("message" in error ? (error as { message?: unknown }).message : "");

  if (typeof rawMessage !== "string") {
    return false;
  }

  const normalizedMessage = rawMessage.toLowerCase();
  return SAMPLING_KEYWORDS.some((keyword) =>
    normalizedMessage.includes(keyword),
  );
}
