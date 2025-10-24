import type { DashboardFact } from "@prisma/client";
export interface ServiceResult<T> {
    data: T;
    fact: DashboardFact;
    source: "fresh" | "cache";
}
export declare class ServiceError extends Error {
    readonly options: {
        scope: string;
        code?: string;
        retryable?: boolean;
        cause?: unknown;
    };
    constructor(message: string, options: {
        scope: string;
        code?: string;
        retryable?: boolean;
        cause?: unknown;
    });
    get scope(): string;
    get code(): string;
    get retryable(): boolean;
}
//# sourceMappingURL=types.d.ts.map