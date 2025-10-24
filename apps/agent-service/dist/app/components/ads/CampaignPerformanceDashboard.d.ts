import React from "react";
interface CampaignPerformanceDashboardProps {
    data: {
        topPerformers: any[];
        bottomPerformers: any[];
        recentAlerts: any[];
        opportunities: any[];
        summary: {
            totalCampaigns: number;
            activeAlerts: number;
            opportunities: number;
        };
    };
}
export declare function CampaignPerformanceDashboard({ data, }: CampaignPerformanceDashboardProps): React.JSX.Element;
export {};
//# sourceMappingURL=CampaignPerformanceDashboard.d.ts.map