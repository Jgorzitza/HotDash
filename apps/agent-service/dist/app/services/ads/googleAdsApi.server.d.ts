export declare const getGoogleAdsCustomer: (customerId: string, refreshToken: string) => import("google-ads-api").Customer;
export declare const listAccessibleCustomers: (refreshToken: string) => Promise<import("google-ads-node/build/protos/protos").google.ads.googleads.v21.services.ListAccessibleCustomersResponse>;
export declare const getCampaigns: (customerId: string, refreshToken: string) => Promise<import("google-ads-node/build/protos/protos").google.ads.googleads.v21.services.IGoogleAdsRow[]>;
export declare const googleAdsApiService: {
    getCampaignPerformance: (campaignIds?: string) => Promise<{
        campaign: {
            id: string;
            name: string;
        };
        metrics: {
            cost_micros: number;
            clicks: number;
            impressions: number;
            all_conversions: number;
            conversions_value: number;
        };
    }[]>;
    fetchCampaigns: () => Promise<{
        id: string;
        name: string;
        status: string;
    }[]>;
};
//# sourceMappingURL=googleAdsApi.server.d.ts.map