export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

export function withTimeout<T>(promise: Promise<T>, ms: number, label = 'operation'): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new TimeoutError(`Timed out after ${ms}ms: ${label}`)), ms);
  });
  return Promise.race([
    promise.finally(() => clearTimeout(timer!)),
    timeout,
  ]);
}

export async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit = {}, ms = 10000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const resp = await fetch(input, { ...init, signal: controller.signal });
    return resp;
  } finally {
    clearTimeout(timer);
  }
}

