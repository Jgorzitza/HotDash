import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PIICard, type PIICardProps } from '../../app/components/PIICard';

describe('PIICard Component', () => {
  const mockProps: PIICardProps = {
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
      {
        title: 'Wax Kit',
        sku: 'WK-100',
        quantity: 2,
        price: '$19.99',
      },
    ],
  };

  beforeEach(() => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(() => Promise.resolve()),
      },
    });
  });

  it('renders warning banner', () => {
    render(<PIICard {...mockProps} />);
    
    const banner = screen.getByRole('alert');
    expect(banner).toBeInTheDocument();
    expect(banner).toHaveTextContent('OPERATOR ONLY');
    expect(banner).toHaveTextContent('NOT SENT TO CUSTOMER');
  });

  it('has correct accessibility attributes', () => {
    render(<PIICard {...mockProps} />);
    
    const card = screen.getByRole('region');
    expect(card).toHaveAttribute('aria-label', 'Customer PII - Operator Only');
  });

  describe('Order Details Section', () => {
    it('displays order ID', () => {
      render(<PIICard {...mockProps} />);
      
      expect(screen.getByText('#1234567890')).toBeInTheDocument();
    });

    it('displays order status', () => {
      render(<PIICard {...mockProps} />);
      
      expect(screen.getByText('fulfilled')).toBeInTheDocument();
    });

    it('displays fulfillment status', () => {
      render(<PIICard {...mockProps} />);
      
      expect(screen.getByText('shipped')).toBeInTheDocument();
    });
  });

  describe('Customer Contact Section', () => {
    it('displays email', () => {
      render(<PIICard {...mockProps} />);
      
      expect(screen.getByText('justin@hotrodan.com')).toBeInTheDocument();
    });

    it('displays phone when provided', () => {
      render(<PIICard {...mockProps} />);
      
      expect(screen.getByText('555-123-4567')).toBeInTheDocument();
    });

    it('does not display phone when not provided', () => {
      const propsWithoutPhone = { ...mockProps, phone: undefined };
      render(<PIICard {...propsWithoutPhone} />);
      
      expect(screen.queryByText('555-123-4567')).not.toBeInTheDocument();
    });

    it('has copy button for email', async () => {
      render(<PIICard {...mockProps} />);
      
      const copyButtons = screen.getAllByLabelText('Copy email');
      expect(copyButtons.length).toBeGreaterThan(0);
      
      fireEvent.click(copyButtons[0]);
      
      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('justin@hotrodan.com');
      });
    });

    it('shows copied confirmation after copying', async () => {
      render(<PIICard {...mockProps} />);
      
      const copyButton = screen.getAllByLabelText('Copy email')[0];
      fireEvent.click(copyButton);
      
      await waitFor(() => {
        expect(screen.getByText('✓ Copied')).toBeInTheDocument();
      });
    });
  });

  describe('Shipping Address Section', () => {
    it('displays full shipping address', () => {
      render(<PIICard {...mockProps} />);
      
      expect(screen.getByText('Justin Case')).toBeInTheDocument();
      expect(screen.getByText(/123 Main St/)).toBeInTheDocument();
      expect(screen.getByText(/Apt 4B/)).toBeInTheDocument();
      expect(screen.getByText(/Los Angeles, CA 90210/)).toBeInTheDocument();
      expect(screen.getByText(/USA/)).toBeInTheDocument();
    });

    it('has copy button for address', () => {
      render(<PIICard {...mockProps} />);
      
      const copyButton = screen.getByLabelText('Copy address');
      expect(copyButton).toBeInTheDocument();
    });

    it('formats address correctly when copying', async () => {
      render(<PIICard {...mockProps} />);
      
      const copyButton = screen.getByLabelText('Copy address');
      fireEvent.click(copyButton);
      
      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
          '123 Main St\nApt 4B\nLos Angeles, CA 90210\nUSA'
        );
      });
    });
  });

  describe('Tracking Section', () => {
    it('displays tracking information when provided', () => {
      render(<PIICard {...mockProps} />);
      
      expect(screen.getByText('UPS')).toBeInTheDocument();
      expect(screen.getByText('1Z999AA10123456784')).toBeInTheDocument();
      expect(screen.getByText(/Delivered/)).toBeInTheDocument();
    });

    it('does not display tracking section when not provided', () => {
      const propsWithoutTracking = { ...mockProps, tracking: undefined };
      render(<PIICard {...propsWithoutTracking} />);
      
      expect(screen.queryByText('UPS')).not.toBeInTheDocument();
      expect(screen.queryByText('1Z999AA10123456784')).not.toBeInTheDocument();
    });

    it('formats tracking date correctly', () => {
      render(<PIICard {...mockProps} />);
      
      // Date should be formatted as "Oct 20, 2025" or similar
      expect(screen.getByText(/Oct 20, 2025/i)).toBeInTheDocument();
    });

    it('has link to tracking URL', () => {
      render(<PIICard {...mockProps} />);
      
      const trackingLink = screen.getByText('Track Package ↗');
      expect(trackingLink).toHaveAttribute('href', 'https://www.ups.com/track?number=1Z999AA10123456784');
      expect(trackingLink).toHaveAttribute('target', '_blank');
      expect(trackingLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Line Items Section', () => {
    it('displays all line items in table', () => {
      render(<PIICard {...mockProps} />);
      
      expect(screen.getByText('Powder Board')).toBeInTheDocument();
      expect(screen.getByText('PB-001')).toBeInTheDocument();
      expect(screen.getByText('$299.99')).toBeInTheDocument();
      
      expect(screen.getByText('Wax Kit')).toBeInTheDocument();
      expect(screen.getByText('WK-100')).toBeInTheDocument();
      expect(screen.getByText('$19.99')).toBeInTheDocument();
    });

    it('displays quantities correctly', () => {
      render(<PIICard {...mockProps} />);
      
      const quantities = screen.getAllByRole('cell').filter(cell => 
        cell.textContent === '1' || cell.textContent === '2'
      );
      expect(quantities.length).toBeGreaterThan(0);
    });

    it('has proper table structure', () => {
      render(<PIICard {...mockProps} />);
      
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
      
      const headers = screen.getAllByRole('columnheader');
      expect(headers).toHaveLength(4);
      expect(headers[0]).toHaveTextContent('Product');
      expect(headers[1]).toHaveTextContent('SKU');
      expect(headers[2]).toHaveTextContent('Qty');
      expect(headers[3]).toHaveTextContent('Price');
    });
  });

  describe('Copy Functionality', () => {
    it('has copy buttons for all copyable fields', () => {
      render(<PIICard {...mockProps} />);
      
      expect(screen.getByLabelText('Copy email')).toBeInTheDocument();
      expect(screen.getByLabelText('Copy phone')).toBeInTheDocument();
      expect(screen.getByLabelText('Copy address')).toBeInTheDocument();
      expect(screen.getByLabelText('Copy tracking number')).toBeInTheDocument();
    });

    it('copies correct values for each field', async () => {
      render(<PIICard {...mockProps} />);
      
      // Test email copy
      const emailButton = screen.getByLabelText('Copy email');
      fireEvent.click(emailButton);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('justin@hotrodan.com');
      
      // Test phone copy
      const phoneButton = screen.getByLabelText('Copy phone');
      fireEvent.click(phoneButton);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('555-123-4567');
      
      // Test tracking copy
      const trackingButton = screen.getByLabelText('Copy tracking number');
      fireEvent.click(trackingButton);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('1Z999AA10123456784');
    });
  });
});

