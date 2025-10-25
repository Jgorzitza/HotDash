export type PublerJobResponse = {
    job_id: string;
};
type ScheduleInput = {
    text: string;
    accountIds: string[];
    scheduledAt?: string;
    workspaceId?: string;
};
export declare function listWorkspaces(): Promise<unknown>;
export declare function listAccounts(workspaceId?: string): Promise<unknown>;
export declare function schedulePost(input: ScheduleInput): Promise<PublerJobResponse>;
export declare function getJobStatus(jobId: string, workspaceId?: string): Promise<unknown>;
export {};
//# sourceMappingURL=publer.d.ts.map