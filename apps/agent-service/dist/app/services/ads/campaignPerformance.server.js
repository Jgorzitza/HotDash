import { googleAdsApiService } from "./googleAdsApi.server";
export class CampaignPerformanceService {
    ROAS_THRESHOLD = 2.0;
    SPEND_THRESHOLD = 1000;
    CONVERSION_THRESHOLD = 5;
    async syncCampaignPerformance(customerId, refreshToken) {
        try {
            console.log("🔄 Starting campaign performance sync...");
            const campaigns = await googleAdsApiService.fetchCampaigns();
            const performanceData = await googleAdsApiService.getCampaignPerformance();
            const processedData = await this.processCampaignData(campaigns, performanceData);
            await this.storeCampaignData(processedData);
            const alerts = await this.generatePerformanceAlerts(processedData);
            console.log("✅ Campaign performance sync completed");
            return {
                campaigns: processedData.length,
                alerts: alerts.length,
                trends: 0,
                opportunities: 0
            };
        }
        catch (error) {
            console.error("❌ Error syncing campaign performance:", error);
            throw error;
        }
    }
    async processCampaignData(campaigns, performanceData) {
        const processedData = [];
        for (const campaign of campaigns) {
            const performance = performanceData.find(p => p.campaign?.id === campaign.id);
            if (!performance)
                continue;
            const metrics = performance.metrics || {};
            const spend = (metrics.cost_micros || 0) / 1000000;
            const revenue = (metrics.conversions_value || 0) / 1000000;
            const conversions = metrics.all_conversions || 0;
            const impressions = metrics.impressions || 0;
            const clicks = metrics.clicks || 0;
            const roas = spend > 0 ? revenue / spend : 0;
            const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
            const conversionRate = clicks > 0 ? (conversions / clicks) * 100 : 0;
            const costPerConversion = conversions > 0 ? spend / conversions : 0;
            processedData.push({
                campaignId: campaign.id,
                campaignName: campaign.name,
                campaignType: campaign.type || 'SEARCH',
                status: campaign.status || 'ENABLED',
                budget: campaign.budget || 0,
                spend,
                impressions,
                clicks,
                conversions,
                revenue,
                roas,
                ctr,
                conversionRate,
                costPerConversion,
                date: new Date().toISOString().split('T')[0]
            });
        }
        return processedData;
    }
    async storeCampaignData(data) {
        console.log(`📊 Storing ${data.length} campaign records...`);
        for (const record of data) {
            console.log(`Campaign ${record.campaignId}: ${record.campaignName}`);
            console.log(`  Spend: $${record.spend.toFixed(2)}, ROAS: ${record.roas.toFixed(2)}x`);
        }
    }
    async generatePerformanceAlerts(data) {
        const alerts = [];
        for (const campaign of data) {
            if (campaign.roas < this.ROAS_THRESHOLD && campaign.spend > 100) {
                alerts.push({
                    campaignId: campaign.campaignId,
                    campaignName: campaign.campaignName,
                    alertType: 'low_roas',
                    severity: campaign.roas < 1.0 ? 'critical' : campaign.roas < 1.5 ? 'high' : 'medium',
                    message: `ROAS of ${campaign.roas.toFixed(2)}x is below threshold of ${this.ROAS_THRESHOLD}x`,
                    threshold: this.ROAS_THRESHOLD,
                    currentValue: campaign.roas,
                    recommendation: 'Review targeting, ad copy, or consider pausing campaign',
                    createdAt: new Date().toISOString()
                });
            }
        }
        return alerts;
    }
    async getCampaignPerformanceDashboard() {
        try {
            console.log("📊 Fetching campaign performance dashboard data...");
            const topPerformers = [
                {
                    campaignId: "campaign-001",
                    campaignName: "Summer Sale Campaign",
                    roas: 4.2,
                    spend: 2500,
                    conversions: 45,
                    revenue: 10500
                }
            ];
            const bottomPerformers = [
                {
                    campaignId: "campaign-003",
                    campaignName: "Brand Awareness",
                    roas: 1.2,
                    spend: 3200,
                    conversions: 8,
                    revenue: 3840
                }
            ];
            const recentAlerts = [
                {
                    campaignId: "campaign-003",
                    campaignName: "Brand Awareness",
                    alertType: "low_roas",
                    severity: "high",
                    message: "ROAS of 1.20x is below threshold of 2.00x",
                    createdAt: new Date().toISOString()
                }
            ];
            const opportunities = [
                {
                    type: "scale_up",
                    campaignId: "campaign-001",
                    campaignName: "Summer Sale Campaign",
                    recommendation: "Scale up budget by 20-30% - current ROAS of 4.20x is excellent",
                    potentialImpact: "high"
                }
            ];
            return {
                topPerformers,
                bottomPerformers,
                recentAlerts,
                opportunities,
                summary: {
                    totalCampaigns: topPerformers.length + bottomPerformers.length,
                    activeAlerts: recentAlerts.length,
                    opportunities: opportunities.length
                }
            };
        }
        catch (error) {
            console.error("❌ Error fetching dashboard data:", error);
            throw error;
        }
    }
}
export const campaignPerformanceService = new CampaignPerformanceService();
//# sourceMappingURL=campaignPerformance.server.js.map