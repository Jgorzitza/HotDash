/**
 * Test fixtures for Picker Payment system
 * 
 * Provides mock data for testing picker payment functionality
 * without requiring database access.
 */

export interface PickerBalanceFixture {
  id: string;
  name: string;
  email: string;
  active: boolean;
  total_earnings_cents: number;
  total_paid_cents: number;
  balance_cents: number;
  orders_fulfilled: number;
  last_earning_date: string | null;
  last_payment_date: string | null;
}

export interface UnassignedOrderFixture {
  id: string;
  shopify_order_id: string;
  fulfilled_at: string;
  total_price: string;
  line_item_count: number;
  total_items: number;
}

export interface PickerEarningFixture {
  id: string;
  order_id: string;
  picker_email: string;
  total_pieces: number;
  payout_cents: number;
  bracket: string;
  created_at: string;
}

export interface PickerPaymentFixture {
  id: string;
  picker_email: string;
  amount_cents: number;
  paid_at: string;
  notes: string | null;
  created_at: string;
}

/**
 * Mock picker balances
 */
export const mockPickerBalances: PickerBalanceFixture[] = [
  {
    id: "picker-1",
    name: "Sumesh",
    email: "hotrodanllc@gmail.com",
    active: true,
    total_earnings_cents: 14200, // $142.00
    total_paid_cents: 10000, // $100.00
    balance_cents: 4200, // $42.00
    orders_fulfilled: 35,
    last_earning_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    last_payment_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "picker-2",
    name: "Test Picker",
    email: "test.picker@example.com",
    active: false,
    total_earnings_cents: 5600, // $56.00
    total_paid_cents: 5600, // $56.00
    balance_cents: 0, // $0.00
    orders_fulfilled: 14,
    last_earning_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    last_payment_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

/**
 * Mock unassigned fulfilled orders
 */
export const mockUnassignedOrders: UnassignedOrderFixture[] = [
  {
    id: "order-1",
    shopify_order_id: "#1001",
    fulfilled_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    total_price: "$245.50",
    line_item_count: 3,
    total_items: 8,
  },
  {
    id: "order-2",
    shopify_order_id: "#1002",
    fulfilled_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    total_price: "$189.99",
    line_item_count: 2,
    total_items: 5,
  },
  {
    id: "order-3",
    shopify_order_id: "#1003",
    fulfilled_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    total_price: "$567.25",
    line_item_count: 5,
    total_items: 12,
  },
];

/**
 * Mock picker earnings
 */
export const mockPickerEarnings: PickerEarningFixture[] = [
  {
    id: "earning-1",
    order_id: "#1000",
    picker_email: "hotrodanllc@gmail.com",
    total_pieces: 3,
    payout_cents: 200,
    bracket: "1-4",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "earning-2",
    order_id: "#999",
    picker_email: "hotrodanllc@gmail.com",
    total_pieces: 7,
    payout_cents: 400,
    bracket: "5-10",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "earning-3",
    order_id: "#998",
    picker_email: "hotrodanllc@gmail.com",
    total_pieces: 15,
    payout_cents: 700,
    bracket: "11+",
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

/**
 * Mock picker payments
 */
export const mockPickerPayments: PickerPaymentFixture[] = [
  {
    id: "payment-1",
    picker_email: "hotrodanllc@gmail.com",
    amount_cents: 10000,
    paid_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Check #1234 - Weekly payment",
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "payment-2",
    picker_email: "test.picker@example.com",
    amount_cents: 5600,
    paid_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Final payment before deactivation",
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

/**
 * Helper to calculate payout for a given piece count
 */
export function calculatePayout(pieces: number): { payoutCents: number; bracket: string } {
  if (pieces >= 1 && pieces <= 4) {
    return { payoutCents: 200, bracket: "1-4" };
  } else if (pieces >= 5 && pieces <= 10) {
    return { payoutCents: 400, bracket: "5-10" };
  } else {
    return { payoutCents: 700, bracket: "11+" };
  }
}

