/**
 * Ad Tracking Validation Tests
 * 
 * ADS-007: Tests for UTM parameters, conversion tracking, and ROAS validation
 */

import { describe, it, expect } from 'vitest';
import {
  validateUTMParameters,
  parseUTMFromURL,
  buildURLWithUTM,
  validateConversionEvent,
  validateTrackingPixel,
  validateROASCalculation,
  testUTMTracking,
} from '~/lib/ads/tracking-validation';
import type { UTMParameters, ConversionEvent, TrackingPixelData } from '~/lib/ads/tracking-validation';

describe('Ad Tracking Validation', () => {
  describe('validateUTMParameters', () => {
    it('should validate complete UTM parameters', () => {
      const params: UTMParameters = {
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: 'summer_sale_2025',
        utm_term: 'running shoes',
        utm_content: 'ad_variant_a',
      };

      const result = validateUTMParameters(params);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should require utm_source', () => {
      const params = {
        utm_medium: 'cpc',
        utm_campaign: 'test',
      };

      const result = validateUTMParameters(params);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('utm_source is required');
    });

    it('should require utm_medium', () => {
      const params = {
        utm_source: 'google',
        utm_campaign: 'test',
      };

      const result = validateUTMParameters(params);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('utm_medium is required');
    });

    it('should require utm_campaign', () => {
      const params = {
        utm_source: 'google',
        utm_medium: 'cpc',
      };

      const result = validateUTMParameters(params);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('utm_campaign is required');
    });

    it('should warn about long parameter values', () => {
      const params: UTMParameters = {
        utm_source: 'a'.repeat(150),
        utm_medium: 'cpc',
        utm_campaign: 'test',
      };

      const result = validateUTMParameters(params);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('longer than 100 characters');
    });

    it('should warn about special characters', () => {
      const params: UTMParameters = {
        utm_source: 'google<script>',
        utm_medium: 'cpc',
        utm_campaign: 'test',
      };

      const result = validateUTMParameters(params);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('special characters');
    });

    it('should reject empty parameter values', () => {
      const params: UTMParameters = {
        utm_source: '',
        utm_medium: 'cpc',
        utm_campaign: 'test',
      };

      const result = validateUTMParameters(params);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('utm_source cannot be empty');
    });
  });

  describe('parseUTMFromURL', () => {
    it('should parse UTM parameters from URL', () => {
      const url = 'https://example.com/product?utm_source=google&utm_medium=cpc&utm_campaign=summer_sale';
      const params = parseUTMFromURL(url);

      expect(params).toBeDefined();
      expect(params!.utm_source).toBe('google');
      expect(params!.utm_medium).toBe('cpc');
      expect(params!.utm_campaign).toBe('summer_sale');
    });

    it('should parse optional UTM parameters', () => {
      const url = 'https://example.com/product?utm_source=google&utm_medium=cpc&utm_campaign=test&utm_term=shoes&utm_content=variant_a';
      const params = parseUTMFromURL(url);

      expect(params).toBeDefined();
      expect(params!.utm_term).toBe('shoes');
      expect(params!.utm_content).toBe('variant_a');
    });

    it('should return null for URL without UTM parameters', () => {
      const url = 'https://example.com/product';
      const params = parseUTMFromURL(url);

      expect(params).toBeNull();
    });

    it('should handle invalid URLs', () => {
      const url = 'not-a-valid-url';
      const params = parseUTMFromURL(url);

      expect(params).toBeNull();
    });

    it('should handle URLs with partial UTM parameters', () => {
      const url = 'https://example.com/product?utm_source=google';
      const params = parseUTMFromURL(url);

      expect(params).toBeDefined();
      expect(params!.utm_source).toBe('google');
      expect(params!.utm_medium).toBeUndefined();
    });
  });

  describe('buildURLWithUTM', () => {
    it('should build URL with UTM parameters', () => {
      const baseUrl = 'https://example.com/product';
      const params: UTMParameters = {
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: 'summer_sale',
      };

      const url = buildURLWithUTM(baseUrl, params);
      expect(url).toContain('utm_source=google');
      expect(url).toContain('utm_medium=cpc');
      expect(url).toContain('utm_campaign=summer_sale');
    });

    it('should include optional parameters', () => {
      const baseUrl = 'https://example.com/product';
      const params: UTMParameters = {
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: 'test',
        utm_term: 'shoes',
        utm_content: 'variant_a',
      };

      const url = buildURLWithUTM(baseUrl, params);
      expect(url).toContain('utm_term=shoes');
      expect(url).toContain('utm_content=variant_a');
    });

    it('should preserve existing query parameters', () => {
      const baseUrl = 'https://example.com/product?id=123';
      const params: UTMParameters = {
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: 'test',
      };

      const url = buildURLWithUTM(baseUrl, params);
      expect(url).toContain('id=123');
      expect(url).toContain('utm_source=google');
    });

    it('should throw error for invalid base URL', () => {
      const baseUrl = 'not-a-valid-url';
      const params: UTMParameters = {
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: 'test',
      };

      expect(() => buildURLWithUTM(baseUrl, params)).toThrow('Invalid base URL');
    });
  });

  describe('validateConversionEvent', () => {
    it('should validate complete conversion event', () => {
      const event: ConversionEvent = {
        eventId: 'evt_123',
        campaignId: 'campaign_1',
        timestamp: new Date().toISOString(),
        value: 10000,
        currency: 'USD',
        conversionType: 'purchase',
        utmParams: {
          utm_source: 'google',
          utm_medium: 'cpc',
          utm_campaign: 'test',
        },
      };

      const result = validateConversionEvent(event);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should require eventId', () => {
      const event = {
        campaignId: 'campaign_1',
        timestamp: new Date().toISOString(),
        value: 10000,
        currency: 'USD',
        conversionType: 'purchase' as const,
      };

      const result = validateConversionEvent(event);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('eventId is required');
    });

    it('should require valid timestamp', () => {
      const event = {
        eventId: 'evt_123',
        campaignId: 'campaign_1',
        timestamp: 'invalid-date',
        value: 10000,
        currency: 'USD',
        conversionType: 'purchase' as const,
      };

      const result = validateConversionEvent(event);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('timestamp is not a valid date');
    });

    it('should reject negative values', () => {
      const event = {
        eventId: 'evt_123',
        campaignId: 'campaign_1',
        timestamp: new Date().toISOString(),
        value: -100,
        currency: 'USD',
        conversionType: 'purchase' as const,
      };

      const result = validateConversionEvent(event);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('value cannot be negative');
    });

    it('should validate currency code', () => {
      const event = {
        eventId: 'evt_123',
        campaignId: 'campaign_1',
        timestamp: new Date().toISOString(),
        value: 10000,
        currency: 'US',
        conversionType: 'purchase' as const,
      };

      const result = validateConversionEvent(event);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('currency must be a 3-letter ISO code (e.g., USD, EUR)');
    });

    it('should validate conversion type', () => {
      const event = {
        eventId: 'evt_123',
        campaignId: 'campaign_1',
        timestamp: new Date().toISOString(),
        value: 10000,
        currency: 'USD',
        conversionType: 'invalid' as any,
      };

      const result = validateConversionEvent(event);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('conversionType must be one of');
    });

    it('should warn when UTM parameters are missing', () => {
      const event = {
        eventId: 'evt_123',
        campaignId: 'campaign_1',
        timestamp: new Date().toISOString(),
        value: 10000,
        currency: 'USD',
        conversionType: 'purchase' as const,
      };

      const result = validateConversionEvent(event);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('No UTM parameters');
    });
  });

  describe('validateTrackingPixel', () => {
    it('should validate complete tracking pixel data', () => {
      const pixelData: TrackingPixelData = {
        pixelId: 'px_123',
        platform: 'google',
        eventType: 'purchase',
        eventData: { value: 100, currency: 'USD' },
        timestamp: new Date().toISOString(),
      };

      const result = validateTrackingPixel(pixelData);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should require pixelId', () => {
      const pixelData = {
        platform: 'google' as const,
        eventType: 'purchase',
        eventData: {},
        timestamp: new Date().toISOString(),
      };

      const result = validateTrackingPixel(pixelData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('pixelId is required');
    });

    it('should validate platform', () => {
      const pixelData = {
        pixelId: 'px_123',
        platform: 'invalid' as any,
        eventType: 'purchase',
        eventData: {},
        timestamp: new Date().toISOString(),
      };

      const result = validateTrackingPixel(pixelData);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('platform must be one of');
    });
  });

  describe('validateROASCalculation', () => {
    it('should calculate ROAS correctly', () => {
      const result = validateROASCalculation(400000, 100000);
      
      expect(result.valid).toBe(true);
      expect(result.calculatedROAS).toBe(4.0);
      expect(result.errors).toHaveLength(0);
    });

    it('should warn when ROAS is below 1.0', () => {
      const result = validateROASCalculation(50000, 100000);
      
      expect(result.valid).toBe(true);
      expect(result.calculatedROAS).toBe(0.5);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('below 1.0');
    });

    it('should warn when spend is zero', () => {
      const result = validateROASCalculation(100000, 0);
      
      expect(result.valid).toBe(true);
      expect(result.calculatedROAS).toBeNull();
      expect(result.warnings).toContain('Spend is zero - ROAS cannot be calculated');
    });

    it('should validate against expected ROAS', () => {
      const result = validateROASCalculation(400000, 100000, 3.0, 10);
      
      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('differs from expected');
    });

    it('should reject negative revenue', () => {
      const result = validateROASCalculation(-100000, 50000);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Revenue cannot be negative');
    });

    it('should reject negative spend', () => {
      const result = validateROASCalculation(100000, -50000);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Spend cannot be negative');
    });
  });

  describe('testUTMTracking', () => {
    it('should validate matching UTM parameters', () => {
      const testURL = 'https://example.com/product?utm_source=google&utm_medium=cpc&utm_campaign=summer_sale';
      const expectedParams: UTMParameters = {
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: 'summer_sale',
      };

      const result = testUTMTracking(testURL, expectedParams);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect mismatched utm_source', () => {
      const testURL = 'https://example.com/product?utm_source=facebook&utm_medium=cpc&utm_campaign=test';
      const expectedParams: UTMParameters = {
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: 'test',
      };

      const result = testUTMTracking(testURL, expectedParams);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('utm_source mismatch');
    });

    it('should detect missing UTM parameters', () => {
      const testURL = 'https://example.com/product';
      const expectedParams: UTMParameters = {
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: 'test',
      };

      const result = testUTMTracking(testURL, expectedParams);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('No UTM parameters found in URL');
    });
  });
});

