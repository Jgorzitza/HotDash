/**
 * Tests for Storefront tools leveraging the Storefront Sub-Agent service.
 */

import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';

const mockStorefront = {
  searchProducts: vi.fn(),
  checkAvailability: vi.fn(),
  queryPolicy: vi.fn(),
  browseCollections: vi.fn(),
  getPerformanceMetrics: vi.fn(),
};

vi.mock('@openai/agents', () => {
  return {
    Agent: class {},
    tool: (config: any) => config,
    setDefaultOpenAIKey: vi.fn(),
    run: vi.fn(),
  };
});

const storefrontServiceMock = vi.fn().mockResolvedValue(mockStorefront);

vi.mock('../../../src/tools/storefront-service-proxy.js', () => {
  return {
    getStorefrontService: storefrontServiceMock,
  };
});

let storefrontSearchProducts: any;
let storefrontCheckAvailability: any;
let storefrontQueryPolicy: any;
let storefrontBrowseCollections: any;
let storefrontGetMetrics: any;

beforeAll(async () => {
  const tools = await import(new URL('../../../src/tools/storefront.ts', import.meta.url).href);
  storefrontSearchProducts = tools.storefrontSearchProducts;
  storefrontCheckAvailability = tools.storefrontCheckAvailability;
  storefrontQueryPolicy = tools.storefrontQueryPolicy;
  storefrontBrowseCollections = tools.storefrontBrowseCollections;
  storefrontGetMetrics = tools.storefrontGetMetrics;
});

describe('Storefront tools', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storefrontServiceMock.mockResolvedValue(mockStorefront);
  });

  it('storefront_search_products delegates to StorefrontSubAgent', async () => {
    const mockResult = {
      products: [{ id: 'prod-1' }],
      collections: [],
      filters: [],
    };

    mockStorefront.searchProducts.mockResolvedValue(mockResult as any);

    const response = await storefrontSearchProducts.execute({
      customerId: 'cust-1',
      query: 'brake pads',
      limit: 5,
    });

    expect(mockStorefront.searchProducts).toHaveBeenCalledWith(
      'cust-1',
      'brake pads',
      undefined,
      undefined,
      5,
    );
    expect(response.success).toBe(true);
    expect(response.results).toBe(mockResult);
  });

  it('storefront_check_availability delegates to StorefrontSubAgent', async () => {
    const availability = {
      productId: 'prod-1',
      variantId: 'var-1',
      available: true,
      quantity: 12,
    };

    mockStorefront.checkAvailability.mockResolvedValue(availability as any);

    const response = await storefrontCheckAvailability.execute({
      customerId: 'cust-1',
      productId: 'prod-1',
      variantId: 'var-1',
      location: 'warehouse-1',
    });

    expect(mockStorefront.checkAvailability).toHaveBeenCalledWith(
      'cust-1',
      'prod-1',
      'var-1',
      'warehouse-1',
    );
    expect(response.success).toBe(true);
    expect(response.availability).toBe(availability);
  });

  it('storefront_query_policy delegates to StorefrontSubAgent', async () => {
    const policy = {
      policyType: 'return',
      content: 'Return policy details',
      lastUpdated: '2025-01-01',
      applicable: true,
    };

    mockStorefront.queryPolicy.mockResolvedValue(policy as any);

    const response = await storefrontQueryPolicy.execute({
      customerId: 'cust-1',
      policyType: 'return',
    });

    expect(mockStorefront.queryPolicy).toHaveBeenCalledWith('cust-1', 'return');
    expect(response.success).toBe(true);
    expect(response.policy).toBe(policy);
  });

  it('storefront_browse_collections delegates to StorefrontSubAgent', async () => {
    const collections = [
      { id: 'coll-1', title: 'Featured', handle: 'featured', description: 'desc', products: [] },
    ];

    mockStorefront.browseCollections.mockResolvedValue(collections as any);

    const response = await storefrontBrowseCollections.execute({
      customerId: 'cust-1',
      collectionHandle: 'featured',
      limit: 10,
    });

    expect(mockStorefront.browseCollections).toHaveBeenCalledWith('cust-1', 'featured', 10);
    expect(response.success).toBe(true);
    expect(response.collections).toBe(collections);
  });

  it('storefront_get_metrics delegates to StorefrontSubAgent', async () => {
    const metrics = {
      totalQueries: 5,
      successfulQueries: 5,
      averageResponseTime: 120,
      mcpEnabled: true,
      errorRate: 0,
    };

    mockStorefront.getPerformanceMetrics.mockResolvedValue(metrics as any);

    const response = await storefrontGetMetrics.execute({});

    expect(mockStorefront.getPerformanceMetrics).toHaveBeenCalled();
    expect(response.success).toBe(true);
    expect(response.metrics).toBe(metrics);
  });
});
