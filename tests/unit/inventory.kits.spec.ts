/**
 * Unit tests for Kit/Bundle Tracking Service
 */

import { describe, it, expect } from 'vitest';
import {
  detectBundleFromTags,
  extractPackCountFromTags,
  detectBundle,
  calculateBundleAvailability,
  calculateComponentAvailability,
  getBundleInfo,
  hasSufficientComponents,
  calculatePickerPieces,
  getPickerPayoutBracket,
  calculatePickerPayout,
  type BundleComponent,
} from '../../app/services/inventory/kits';

describe('Kit/Bundle Tracking Service', () => {
  describe('detectBundleFromTags', () => {
    it('should detect BUNDLE:TRUE tag', () => {
      expect(detectBundleFromTags(['BUNDLE:TRUE', 'Featured'])).toBe(true);
    });

    it('should detect BUNDLE tag (case insensitive)', () => {
      expect(detectBundleFromTags(['bundle:true'])).toBe(true);
      expect(detectBundleFromTags(['BUNDLE'])).toBe(true);
    });

    it('should return false when no bundle tag', () => {
      expect(detectBundleFromTags(['Featured', 'New'])).toBe(false);
    });
  });

  describe('extractPackCountFromTags', () => {
    it('should extract pack count from PACK:X tag', () => {
      expect(extractPackCountFromTags(['PACK:8', 'Featured'])).toBe(8);
    });

    it('should handle case insensitive', () => {
      expect(extractPackCountFromTags(['pack:12'])).toBe(12);
    });

    it('should return 1 when no pack tag', () => {
      expect(extractPackCountFromTags(['Featured'])).toBe(1);
    });

    it('should return 1 for invalid pack count', () => {
      expect(extractPackCountFromTags(['PACK:invalid'])).toBe(1);
      expect(extractPackCountFromTags(['PACK'])).toBe(1);
    });
  });

  describe('detectBundle', () => {
    it('should prioritize metafields over tags', () => {
      const result = detectBundle(
        ['BUNDLE:TRUE', 'PACK:8'],
        { isBundle: false, packCount: 12 }
      );

      expect(result.isBundle).toBe(false); // Metafield wins
      expect(result.packCount).toBe(12); // Metafield wins
      expect(result.detectionMethod).toBe('metafield');
    });

    it('should fall back to tags when no metafields', () => {
      const result = detectBundle(['BUNDLE:TRUE', 'PACK:8']);

      expect(result.isBundle).toBe(true);
      expect(result.packCount).toBe(8);
      expect(result.detectionMethod).toBe('tag');
    });

    it('should use defaults when neither tags nor metafields', () => {
      const result = detectBundle([]);

      expect(result.isBundle).toBe(false);
      expect(result.packCount).toBe(1);
      expect(result.detectionMethod).toBe('none');
    });
  });

  describe('calculateComponentAvailability', () => {
    it('should calculate how many bundles can be made', () => {
      const component: BundleComponent = {
        sku: 'COMP-001',
        productId: 'gid://shopify/Product/1',
        variantId: 'gid://shopify/ProductVariant/1',
        quantityRequired: 2,
        currentQuantity: 10,
        availableForBundle: 0,
      };

      const result = calculateComponentAvailability(component);

      // 10 / 2 = 5 bundles can be made
      expect(result.availableForBundle).toBe(5);
    });

    it('should handle fractional availability', () => {
      const component: BundleComponent = {
        sku: 'COMP-002',
        productId: 'gid://shopify/Product/2',
        variantId: 'gid://shopify/ProductVariant/2',
        quantityRequired: 3,
        currentQuantity: 10,
        availableForBundle: 0,
      };

      const result = calculateComponentAvailability(component);

      // 10 / 3 = 3.33 → floor to 3
      expect(result.availableForBundle).toBe(3);
    });
  });

  describe('calculateBundleAvailability', () => {
    it('should return minimum component availability', () => {
      const components: BundleComponent[] = [
        {
          sku: 'COMP-001',
          productId: 'gid://shopify/Product/1',
          variantId: 'gid://shopify/ProductVariant/1',
          quantityRequired: 1,
          currentQuantity: 10,
          availableForBundle: 10,
        },
        {
          sku: 'COMP-002',
          productId: 'gid://shopify/Product/2',
          variantId: 'gid://shopify/ProductVariant/2',
          quantityRequired: 2,
          currentQuantity: 6,
          availableForBundle: 3,
        },
        {
          sku: 'COMP-003',
          productId: 'gid://shopify/Product/3',
          variantId: 'gid://shopify/ProductVariant/3',
          quantityRequired: 1,
          currentQuantity: 20,
          availableForBundle: 20,
        },
      ];

      const availability = calculateBundleAvailability(components);

      // Minimum is 3 (from COMP-002)
      expect(availability).toBe(3);
    });

    it('should return 0 for empty components', () => {
      expect(calculateBundleAvailability([])).toBe(0);
    });
  });

  describe('getBundleInfo', () => {
    it('should create bundle info with component tracking', () => {
      const components = [
        {
          sku: 'COMP-001',
          productId: 'gid://shopify/Product/1',
          variantId: 'gid://shopify/ProductVariant/1',
          quantityRequired: 1,
          currentQuantity: 10,
        },
        {
          sku: 'COMP-002',
          productId: 'gid://shopify/Product/2',
          variantId: 'gid://shopify/ProductVariant/2',
          quantityRequired: 2,
          currentQuantity: 6,
        },
      ];

      const bundle = getBundleInfo(
        'BUNDLE-001',
        'gid://shopify/Product/100',
        'gid://shopify/ProductVariant/100',
        'Starter Kit',
        50,
        ['BUNDLE:TRUE', 'PACK:5'],
        undefined,
        components
      );

      expect(bundle.isBundle).toBe(true);
      expect(bundle.packCount).toBe(5);
      expect(bundle.components).toHaveLength(2);
      expect(bundle.maxBundlesAvailable).toBe(3); // Min of 10 and 3
    });
  });

  describe('hasSufficientComponents', () => {
    it('should return true when sufficient components', () => {
      const bundle = getBundleInfo(
        'BUNDLE-001',
        'gid://shopify/Product/100',
        'gid://shopify/ProductVariant/100',
        'Starter Kit',
        50,
        ['BUNDLE:TRUE'],
        undefined,
        [
          {
            sku: 'COMP-001',
            productId: 'gid://shopify/Product/1',
            variantId: 'gid://shopify/ProductVariant/1',
            quantityRequired: 1,
            currentQuantity: 20,
          },
        ]
      );

      expect(hasSufficientComponents(bundle, 10)).toBe(true);
    });

    it('should return false when insufficient components', () => {
      const bundle = getBundleInfo(
        'BUNDLE-001',
        'gid://shopify/Product/100',
        'gid://shopify/ProductVariant/100',
        'Starter Kit',
        50,
        ['BUNDLE:TRUE'],
        undefined,
        [
          {
            sku: 'COMP-001',
            productId: 'gid://shopify/Product/1',
            variantId: 'gid://shopify/ProductVariant/1',
            quantityRequired: 1,
            currentQuantity: 5,
          },
        ]
      );

      expect(hasSufficientComponents(bundle, 10)).toBe(false);
    });
  });

  describe('Picker Payout', () => {
    describe('calculatePickerPieces', () => {
      it('should calculate pieces for regular product', () => {
        expect(calculatePickerPieces(3, 1)).toBe(3);
      });

      it('should calculate pieces for pack product', () => {
        expect(calculatePickerPieces(5, 8)).toBe(40); // 5 × 8
      });

      it('should calculate pieces for bundle', () => {
        expect(calculatePickerPieces(1, 5)).toBe(5); // 1 × 5
      });
    });

    describe('getPickerPayoutBracket', () => {
      it('should return $2.00 for 1-4 pieces', () => {
        expect(getPickerPayoutBracket(1)).toEqual({ bracket: '1-4', amount: 2.00 });
        expect(getPickerPayoutBracket(4)).toEqual({ bracket: '1-4', amount: 2.00 });
      });

      it('should return $4.00 for 5-10 pieces', () => {
        expect(getPickerPayoutBracket(5)).toEqual({ bracket: '5-10', amount: 4.00 });
        expect(getPickerPayoutBracket(10)).toEqual({ bracket: '5-10', amount: 4.00 });
      });

      it('should return $7.00 for 11+ pieces', () => {
        expect(getPickerPayoutBracket(11)).toEqual({ bracket: '11+', amount: 7.00 });
        expect(getPickerPayoutBracket(100)).toEqual({ bracket: '11+', amount: 7.00 });
      });
    });

    describe('calculatePickerPayout', () => {
      it('should calculate payout for small order', () => {
        const result = calculatePickerPayout([
          { sku: 'TEST-001', quantity: 2, packCount: 1 },
        ]);

        expect(result.totalPieces).toBe(2);
        expect(result.bracket).toBe('1-4');
        expect(result.payoutAmount).toBe(2.00);
      });

      it('should calculate payout for medium order', () => {
        const result = calculatePickerPayout([
          { sku: 'TEST-001', quantity: 1, packCount: 8 },
        ]);

        expect(result.totalPieces).toBe(8);
        expect(result.bracket).toBe('5-10');
        expect(result.payoutAmount).toBe(4.00);
      });

      it('should calculate payout for large order', () => {
        const result = calculatePickerPayout([
          { sku: 'TEST-001', quantity: 5, packCount: 8 }, // 40 pieces
          { sku: 'TEST-002', quantity: 2, packCount: 1 }, // 2 pieces
          { sku: 'TEST-003', quantity: 1, packCount: 5 }, // 5 pieces
        ]);

        expect(result.totalPieces).toBe(47);
        expect(result.bracket).toBe('11+');
        expect(result.payoutAmount).toBe(7.00);
        expect(result.lineItemBreakdown).toHaveLength(3);
      });
    });
  });
});

