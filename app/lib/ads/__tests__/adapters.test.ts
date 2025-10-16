/**
 * Integration Tests for Ad Platform Adapters
 * 
 * Purpose: Test adapter integrations with mock data
 * Owner: ads agent
 * Date: 2025-10-15
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createAdapter,
  getAdapterConfig,
  MetaAdsAdapter,
  GoogleAdsAdapter,
  TikTokAdsAdapter,
  type AdapterConfig,
} from '../adapters';

describe('Ad Platform Adapters', () => {
  let config: AdapterConfig;

  beforeEach(() => {
    config = getAdapterConfig('development');
  });

  describe('createAdapter', () => {
    it('creates Meta adapter', () => {
      const adapter = createAdapter('meta', config);
      expect(adapter).toBeInstanceOf(MetaAdsAdapter);
    });

    it('creates Google adapter', () => {
      const adapter = createAdapter('google', config);
      expect(adapter).toBeInstanceOf(GoogleAdsAdapter);
    });

    it('creates TikTok adapter', () => {
      const adapter = createAdapter('tiktok', config);
      expect(adapter).toBeInstanceOf(TikTokAdsAdapter);
    });

    it('throws error for unsupported platform', () => {
      expect(() => createAdapter('invalid' as any, config)).toThrow('Unsupported platform');
    });
  });

  describe('MetaAdsAdapter', () => {
    let adapter: MetaAdsAdapter;

    beforeEach(() => {
      adapter = new MetaAdsAdapter(config);
    });

    it('fetches campaigns with mock data', async () => {
      const campaigns = await adapter.fetchCampaigns('2025-10-01', '2025-10-15');
      
      expect(campaigns).toHaveLength(1);
      expect(campaigns[0].platform).toBe('meta');
      expect(campaigns[0].campaignName).toContain('Meta');
      expect(campaigns[0].adSpend).toBeGreaterThan(0);
      expect(campaigns[0].revenue).toBeGreaterThan(0);
    });

    it('fetches campaign by ID', async () => {
      const campaign = await adapter.fetchCampaignById('meta_001');
      
      expect(campaign.campaignId).toBe('meta_001');
      expect(campaign.platform).toBe('meta');
    });

    it('throws error for non-existent campaign', async () => {
      await expect(adapter.fetchCampaignById('invalid_id')).rejects.toThrow('Campaign invalid_id not found');
    });

    it('throws error when not using mock data', async () => {
      const prodConfig = { ...config, useMockData: false };
      const prodAdapter = new MetaAdsAdapter(prodConfig);
      
      await expect(prodAdapter.fetchCampaigns('2025-10-01', '2025-10-15')).rejects.toThrow('Meta Ads API integration not yet implemented');
    });
  });

  describe('GoogleAdsAdapter', () => {
    let adapter: GoogleAdsAdapter;

    beforeEach(() => {
      adapter = new GoogleAdsAdapter(config);
    });

    it('fetches campaigns with mock data', async () => {
      const campaigns = await adapter.fetchCampaigns('2025-10-01', '2025-10-15');
      
      expect(campaigns).toHaveLength(1);
      expect(campaigns[0].platform).toBe('google');
      expect(campaigns[0].campaignName).toContain('Search');
      expect(campaigns[0].adSpend).toBeGreaterThan(0);
    });

    it('fetches campaign by ID', async () => {
      const campaign = await adapter.fetchCampaignById('google_001');
      
      expect(campaign.campaignId).toBe('google_001');
      expect(campaign.platform).toBe('google');
    });
  });

  describe('TikTokAdsAdapter', () => {
    let adapter: TikTokAdsAdapter;

    beforeEach(() => {
      adapter = new TikTokAdsAdapter(config);
    });

    it('fetches campaigns with mock data', async () => {
      const campaigns = await adapter.fetchCampaigns('2025-10-01', '2025-10-15');
      
      expect(campaigns).toHaveLength(1);
      expect(campaigns[0].platform).toBe('tiktok');
      expect(campaigns[0].campaignName).toContain('TikTok');
      expect(campaigns[0].adSpend).toBeGreaterThan(0);
    });

    it('fetches campaign by ID', async () => {
      const campaign = await adapter.fetchCampaignById('tiktok_001');
      
      expect(campaign.campaignId).toBe('tiktok_001');
      expect(campaign.platform).toBe('tiktok');
    });
  });

  describe('getAdapterConfig', () => {
    it('returns development config with mock data', () => {
      const devConfig = getAdapterConfig('development');
      
      expect(devConfig.environment).toBe('development');
      expect(devConfig.useMockData).toBe(true);
    });

    it('returns staging config with mock data', () => {
      const stagingConfig = getAdapterConfig('staging');
      
      expect(stagingConfig.environment).toBe('staging');
      expect(stagingConfig.useMockData).toBe(true);
    });

    it('returns production config without mock data', () => {
      const prodConfig = getAdapterConfig('production');
      
      expect(prodConfig.environment).toBe('production');
      expect(prodConfig.useMockData).toBe(false);
    });
  });

  describe('Integration scenarios', () => {
    it('fetches campaigns from all platforms', async () => {
      const metaAdapter = createAdapter('meta', config);
      const googleAdapter = createAdapter('google', config);
      const tiktokAdapter = createAdapter('tiktok', config);

      const [metaCampaigns, googleCampaigns, tiktokCampaigns] = await Promise.all([
        metaAdapter.fetchCampaigns('2025-10-01', '2025-10-15'),
        googleAdapter.fetchCampaigns('2025-10-01', '2025-10-15'),
        tiktokAdapter.fetchCampaigns('2025-10-01', '2025-10-15'),
      ]);

      expect(metaCampaigns[0].platform).toBe('meta');
      expect(googleCampaigns[0].platform).toBe('google');
      expect(tiktokCampaigns[0].platform).toBe('tiktok');
    });

    it('aggregates campaigns across platforms', async () => {
      const platforms: Array<'meta' | 'google' | 'tiktok'> = ['meta', 'google', 'tiktok'];
      const allCampaigns = [];

      for (const platform of platforms) {
        const adapter = createAdapter(platform, config);
        const campaigns = await adapter.fetchCampaigns('2025-10-01', '2025-10-15');
        allCampaigns.push(...campaigns);
      }

      expect(allCampaigns).toHaveLength(3);
      expect(allCampaigns.map(c => c.platform)).toEqual(['meta', 'google', 'tiktok']);
    });
  });
});

