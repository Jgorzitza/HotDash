import type { DashboardFact } from "@prisma/client";

export interface ServiceResult<T> {
  data: T;
  fact: DashboardFact;
  source: "fresh" | "cache";
}

export class ServiceError extends Error {
  constructor(
    message: string,
    readonly options: {
      scope: string;
      code?: string;
      retryable?: boolean;
      cause?: unknown;
    },
  ) {
    super(message);
    this.name = "ServiceError";
  }

  get scope() {
    return this.options.scope;
  }

  get code() {
    return this.options.code;
  }

  get retryable() {
    return this.options.retryable ?? false;
  }
}
