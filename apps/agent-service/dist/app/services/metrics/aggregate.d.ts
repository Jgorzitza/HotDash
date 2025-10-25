import { type ServiceResult } from "../types";
export interface ActivationAggregate {
    windowStart: string;
    windowEnd: string;
    totalActiveShops: number;
    activatedShops: number;
    activationRate: number;
}
export interface SlaAggregate {
    windowStart: string;
    windowEnd: string;
    sampleSize: number;
    medianMinutes: number | null;
    p90Minutes: number | null;
}
export interface OpsAggregateMetrics {
    activation?: ActivationAggregate;
    sla?: SlaAggregate;
}
export declare function getOpsAggregateMetrics(): Promise<ServiceResult<OpsAggregateMetrics>>;
//# sourceMappingURL=aggregate.d.ts.map