import { describe, it, expect } from 'vitest';
import {
  maskEmail,
  maskPhone,
  maskAddress,
  maskOrderId,
  maskTracking,
  redactCustomerInfo,
  type CustomerInfo,
} from '../../app/utils/pii-redaction';

describe('PII Redaction Utility', () => {
  describe('maskEmail', () => {
    it('masks standard email addresses', () => {
      expect(maskEmail('justin@hotrodan.com')).toBe('j***@h***.com');
      expect(maskEmail('john.doe@example.org')).toBe('j***@e***.org');
      expect(maskEmail('a@test.io')).toBe('a***@t***.io');
    });

    it('handles edge cases', () => {
      expect(maskEmail('')).toBe('***');
      expect(maskEmail('invalid')).toBe('***');
      expect(maskEmail('@domain.com')).toBe('***');
      expect(maskEmail('user@')).toBe('***');
    });

    it('preserves domain extension', () => {
      expect(maskEmail('test@domain.com')).toContain('.com');
      expect(maskEmail('test@domain.co.uk')).toContain('.uk');
      expect(maskEmail('test@subdomain.example.org')).toContain('.org');
    });
  });

  describe('maskPhone', () => {
    it('masks phone numbers keeping last 4 digits', () => {
      expect(maskPhone('555-123-4567')).toBe('***-***-4567');
      expect(maskPhone('(555) 123-4567')).toBe('***-***-4567');
      expect(maskPhone('5551234567')).toBe('***-***-4567');
      expect(maskPhone('+1-555-123-4567')).toBe('***-***-4567');
    });

    it('handles edge cases', () => {
      expect(maskPhone('')).toBe('***');
      expect(maskPhone('123')).toBe('***');
      expect(maskPhone('1234')).toBe('***-***-1234');
    });
  });

  describe('maskAddress', () => {
    it('masks address keeping city, region, country, and zip prefix', () => {
      const address = {
        address1: '123 Main St',
        city: 'Los Angeles',
        province: 'CA',
        country: 'USA',
        zip: '90210',
      };
      
      expect(maskAddress(address)).toBe('Los Angeles, CA 902**, USA');
    });

    it('handles short zip codes', () => {
      const address = {
        address1: '123 Main St',
        city: 'Toronto',
        province: 'ON',
        country: 'Canada',
        zip: 'M5',
      };
      
      expect(maskAddress(address)).toBe('Toronto, ON ***, Canada');
    });
  });

  describe('maskOrderId', () => {
    it('masks order IDs keeping last 4 digits', () => {
      expect(maskOrderId('#1234567890')).toBe('#***7890');
      expect(maskOrderId('1234567890')).toBe('#***7890');
      expect(maskOrderId('#12345')).toBe('#***2345');
    });

    it('handles edge cases', () => {
      expect(maskOrderId('')).toBe('#***');
      expect(maskOrderId('#123')).toBe('#***');
      expect(maskOrderId('1234')).toBe('#***1234');
    });
  });

  describe('maskTracking', () => {
    it('masks tracking to carrier and last event', () => {
      const tracking = {
        carrier: 'UPS',
        number: '1Z999AA10123456784',
        url: 'https://www.ups.com/track?number=1Z999AA10123456784',
        lastEvent: 'Delivered',
        lastEventDate: '2025-10-20T14:30:00Z',
      };
      
      const masked = maskTracking(tracking);
      expect(masked).toContain('UPS');
      expect(masked).toContain('Delivered');
      expect(masked).not.toContain('1Z999AA10123456784');
    });

    it('handles missing tracking info', () => {
      const tracking = {
        carrier: '',
        number: '',
        url: '',
        lastEvent: '',
      };
      
      expect(maskTracking(tracking)).toBe('Tracking information available');
    });
  });

  describe('redactCustomerInfo', () => {
    const fullCustomerInfo: CustomerInfo = {
      orderId: '#1234567890',
      orderStatus: 'fulfilled',
      fulfillmentStatus: 'shipped',
      email: 'justin@hotrodan.com',
      phone: '555-123-4567',
      shippingAddress: {
        name: 'Justin Case',
        address1: '123 Main St',
        address2: 'Apt 4B',
        city: 'Los Angeles',
        province: 'CA',
        country: 'USA',
        zip: '90210',
      },
      tracking: {
        carrier: 'UPS',
        number: '1Z999AA10123456784',
        url: 'https://www.ups.com/track?number=1Z999AA10123456784',
        lastEvent: 'Delivered',
        lastEventDate: '2025-10-20T14:30:00Z',
      },
      lineItems: [
        {
          title: 'Powder Board',
          sku: 'PB-001',
          quantity: 1,
          price: '$299.99',
        },
      ],
    };

    it('redacts all PII from customer info', () => {
      const redacted = redactCustomerInfo(fullCustomerInfo);
      
      expect(redacted.orderId).toBe('#***7890');
      expect(redacted.email).toBe('j***@h***.com');
      expect(redacted.phone).toBe('***-***-4567');
      expect(redacted.shippingCity).toBe('Los Angeles');
      expect(redacted.shippingRegion).toBe('CA');
      expect(redacted.shippingCountry).toBe('USA');
      expect(redacted.shippingZipPrefix).toBe('902**');
      expect(redacted.trackingCarrier).toBe('UPS');
      expect(redacted.trackingLastEvent).toBe('Delivered');
    });

    it('does not include full PII in redacted data', () => {
      const redacted = redactCustomerInfo(fullCustomerInfo);
      
      expect(JSON.stringify(redacted)).not.toContain('123 Main St');
      expect(JSON.stringify(redacted)).not.toContain('justin@hotrodan.com');
      expect(JSON.stringify(redacted)).not.toContain('555-123-4567');
    });
  });
});

