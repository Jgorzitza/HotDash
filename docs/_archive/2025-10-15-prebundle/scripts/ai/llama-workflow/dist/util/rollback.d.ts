#!/usr/bin/env node
/**
 * Rollback utility for switching to previous successful index
 */
export declare function rollbackIndex(): Promise<{
    success: boolean;
    message: string;
    prevIndex?: string;
}>;
export declare function verifyRollback(): Promise<{
    success: boolean;
    message: string;
    details?: any;
}>;
//# sourceMappingURL=rollback.d.ts.map