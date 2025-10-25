/**
 * Vitest Setup File
 *
 * Runs before all tests to configure mocks and test environment.
 */

// Load environment variables FIRST, before any imports
import { config } from 'dotenv';
import path from 'path';
config({ path: path.resolve(__dirname, '../../../.env') });

import { vi } from 'vitest';

// Mock the AccountsSubAgent to prevent Supabase initialization in unit tests
vi.mock('../../../../app/services/ai-customer/accounts-sub-agent.service.js', () => {
  return {
    AccountsSubAgent: vi.fn().mockImplementation(() => {
      return {
        getCustomerOrders: vi.fn().mockResolvedValue([]),
        getOrderDetails: vi.fn().mockResolvedValue(null),
        requestRefund: vi.fn().mockResolvedValue({ success: true }),
        cancelOrder: vi.fn().mockResolvedValue({ success: true }),
      };
    }),
  };
});

// Mock the StorefrontSubAgent similarly if needed
vi.mock('../../../../app/services/ai-customer/storefront-sub-agent.service.js', () => {
  return {
    StorefrontSubAgent: vi.fn().mockImplementation(() => {
      return {
        getProduct: vi.fn().mockResolvedValue(null),
        searchProducts: vi.fn().mockResolvedValue([]),
        getInventoryStatus: vi.fn().mockResolvedValue({ available: 0 }),
      };
    }),
  };
});
