export interface CampaignData {
    campaignId: string;
    campaignName: string;
    campaignType: string;
    status: string;
    budget: number;
    spend: number;
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    roas: number;
    ctr: number;
    conversionRate: number;
    costPerConversion: number;
    date: string;
}
export interface PerformanceAlert {
    campaignId: string;
    campaignName: string;
    alertType: 'low_roas' | 'high_spend' | 'low_conversions' | 'performance_drop';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    threshold: number;
    currentValue: number;
    recommendation: string;
    createdAt: string;
}
export declare class CampaignPerformanceService {
    private readonly ROAS_THRESHOLD;
    private readonly SPEND_THRESHOLD;
    private readonly CONVERSION_THRESHOLD;
    syncCampaignPerformance(customerId: string, refreshToken: string): Promise<{
        campaigns: number;
        alerts: number;
        trends: number;
        opportunities: number;
    }>;
    private processCampaignData;
    private storeCampaignData;
    private generatePerformanceAlerts;
    getCampaignPerformanceDashboard(): Promise<{
        topPerformers: {
            campaignId: string;
            campaignName: string;
            roas: number;
            spend: number;
            conversions: number;
            revenue: number;
        }[];
        bottomPerformers: {
            campaignId: string;
            campaignName: string;
            roas: number;
            spend: number;
            conversions: number;
            revenue: number;
        }[];
        recentAlerts: {
            campaignId: string;
            campaignName: string;
            alertType: string;
            severity: string;
            message: string;
            createdAt: string;
        }[];
        opportunities: {
            type: string;
            campaignId: string;
            campaignName: string;
            recommendation: string;
            potentialImpact: string;
        }[];
        summary: {
            totalCampaigns: number;
            activeAlerts: number;
            opportunities: number;
        };
    }>;
}
export declare const campaignPerformanceService: CampaignPerformanceService;
//# sourceMappingURL=campaignPerformance.server.d.ts.map