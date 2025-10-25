import { type ServiceResult } from "../types";
import type { DateRange, GaSession } from "./client";
export interface LandingPageAnomaly extends GaSession {
    isAnomaly: boolean;
}
interface GetAnomaliesOptions {
    shopDomain: string;
    range?: DateRange;
}
export declare function getLandingPageAnomalies(options: GetAnomaliesOptions): Promise<ServiceResult<LandingPageAnomaly[]>>;
export {};
//# sourceMappingURL=ingest.d.ts.map