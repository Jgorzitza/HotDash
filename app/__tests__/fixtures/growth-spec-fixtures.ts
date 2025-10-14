/**
 * Growth Spec Test Fixtures (TDD)
 * Realistic mock data for all growth features
 */

export const mockActions = {
  seoCtrFix: {
    type: 'seo_ctr_fix' as const,
    payload: {
      pageId: 'gid://shopify/OnlineStorePage/123',
      currentTitle: 'Powder Board XL',
      proposedTitle: 'Powder Board XL - Premium All-Mountain Snowboard 2025',
      currentCtr: 0.025,
      benchmarkCtr: 0.041,
      expectedLift: 0.64,
    },
    score: 0.85,
    merchantId: 'merchant_hotrodan',
  },

  metaobjectGen: {
    type: 'metaobject_gen' as const,
    payload: {
      pageId: 'gid://shopify/Product/456',
      metaobjectType: 'faq',
      entries: [
        { question: 'Are these waterproof?', answer: 'Yes, fully waterproof.' },
        { question: 'What sizes?', answer: 'XS to XXL available.' },
      ],
    },
    score: 0.78,
    merchantId: 'merchant_hotrodan',
  },
};

export const mockBulkActions = Array.from({ length: 100 }, (_, i) => ({
  type: 'seo_ctr_fix' as const,
  payload: {
    pageId: `page_${i}`,
    proposedTitle: `Title ${i}`,
  },
  score: 0.5 + Math.random() * 0.4,
  merchantId: 'merchant_test',
}));

export const mockGSCData = {
  pages: [
    {
      url: '/products/powder-board-xl',
      impressions: 12500,
      clicks: 312,
      ctr: 0.025,
      position: 3.2,
    },
  ],
};

export const performanceTestData = {
  actions1000: mockBulkActions,
};

