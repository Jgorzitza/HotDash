import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getGaConfig } from '../../app/config/ga.server';

describe('GA Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getGaConfig', () => {
    it('should default to mock mode when no config is set', () => {
      delete process.env.GA_MODE;
      delete process.env.GA_USE_MOCK;
      delete process.env.GOOGLE_APPLICATION_CREDENTIALS;

      const config = getGaConfig();

      expect(config.mode).toBe('mock');
      expect(config.propertyId).toBe('mock-property');
    });

    it('should use mock mode when GA_USE_MOCK=1 (legacy)', () => {
      process.env.GA_USE_MOCK = '1';
      delete process.env.GA_MODE;

      const config = getGaConfig();

      expect(config.mode).toBe('mock');
    });

    it('should use direct mode when GA_MODE=direct', () => {
      process.env.GA_MODE = 'direct';
      process.env.GA_PROPERTY_ID = '123456789';

      const config = getGaConfig();

      expect(config.mode).toBe('direct');
      expect(config.propertyId).toBe('123456789');
    });

    it('should use mcp mode when GA_MODE=mcp', () => {
      process.env.GA_MODE = 'mcp';
      process.env.GA_MCP_HOST = 'https://mcp.example.com';

      const config = getGaConfig();

      expect(config.mode).toBe('mcp');
      expect(config.mcpHost).toBe('https://mcp.example.com');
    });

    it('should prioritize GA_MODE over GA_USE_MOCK', () => {
      process.env.GA_MODE = 'direct';
      process.env.GA_USE_MOCK = '1';

      const config = getGaConfig();

      expect(config.mode).toBe('direct');
    });

    it('should be case-insensitive for GA_MODE', () => {
      process.env.GA_MODE = 'DIRECT';

      const config = getGaConfig();

      expect(config.mode).toBe('direct');
    });

    it('should default to mock even when credentials are available but GA_USE_MOCK defaults to 1', () => {
      delete process.env.GA_MODE;
      delete process.env.GA_USE_MOCK; // This defaults to "1" in the code
      process.env.GOOGLE_APPLICATION_CREDENTIALS = '/path/to/creds.json';

      const config = getGaConfig();

      expect(config.mode).toBe('mock'); // Because GA_USE_MOCK defaults to "1"
    });

    it('should use custom property ID when provided', () => {
      process.env.GA_PROPERTY_ID = 'custom-prop-123';

      const config = getGaConfig();

      expect(config.propertyId).toBe('custom-prop-123');
    });

    it('should include mcpHost when provided', () => {
      process.env.GA_MCP_HOST = 'https://analytics-mcp.fly.dev';

      const config = getGaConfig();

      expect(config.mcpHost).toBe('https://analytics-mcp.fly.dev');
    });

    it('should handle empty GA_MODE string', () => {
      process.env.GA_MODE = '';
      delete process.env.GA_USE_MOCK;

      const config = getGaConfig();

      expect(config.mode).toBe('mock');
    });

    it('should handle whitespace in GA_MODE', () => {
      process.env.GA_MODE = '  mock  ';

      const config = getGaConfig();

      expect(config.mode).toBe('mock');
    });
  });
});

