/**
 * Attribution Panel API Route
 *
 * ANALYTICS-101: API endpoint for action attribution panel data
 * Provides comprehensive attribution analysis with 7/14/28-day performance metrics
 */
import type { LoaderFunctionArgs } from "react-router";
import { type AttributionPanelData } from "~/services/ga/attribution";
export interface AttributionPanelResponse {
    success: boolean;
    data?: AttributionPanelData;
    error?: string;
}
export declare function loader({ request }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.attribution.panel.d.ts.map