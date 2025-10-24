import { GoogleAdsApi } from "google-ads-api";
const client = new GoogleAdsApi({
    client_id: process.env.GOOGLE_ADS_CLIENT_ID,
    client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
    developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
});
export const getGoogleAdsCustomer = (customerId, refreshToken) => {
    return client.Customer({
        customer_id: customerId,
        refresh_token: refreshToken,
        login_customer_id: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID,
    });
};
export const listAccessibleCustomers = async (refreshToken) => {
    return await client.listAccessibleCustomers(refreshToken);
};
export const getCampaigns = async (customerId, refreshToken) => {
    const customer = getGoogleAdsCustomer(customerId, refreshToken);
    const campaigns = await customer.query(`
    SELECT
      campaign.id,
      campaign.name,
      campaign.bidding_strategy_type,
      campaign_budget.amount_micros,
      metrics.cost_micros,
      metrics.clicks,
      metrics.impressions,
      metrics.all_conversions
    FROM
      campaign
    WHERE
      campaign.status = "ENABLED"
    LIMIT 20
  `);
    return campaigns;
};
export const googleAdsApiService = {
    getCampaignPerformance: async (campaignIds) => {
        return [
            {
                campaign: { id: "1", name: "Test Campaign" },
                metrics: {
                    cost_micros: 5000000,
                    clicks: 150,
                    impressions: 5000,
                    all_conversions: 12,
                    conversions_value: 12000
                }
            }
        ];
    },
    fetchCampaigns: async () => {
        return [
            { id: "1", name: "Test Campaign", status: "ENABLED" }
        ];
    }
};
//# sourceMappingURL=googleAdsApi.server.js.map