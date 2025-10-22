import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActionQueueCard, type ActionQueueItem } from '../../app/components/ActionQueueCard';

describe('ActionQueueCard Component - ENG-032', () => {
  const mockAction: ActionQueueItem = {
    id: 'action-123',
    actionKey: 'seo-fix-powder-board-2025-10-21',
    actionType: 'seo',
    title: 'Fix Powder Board SEO Meta Tags',
    description: 'Update meta description and title tags for improved ranking',
    targetUrl: '/products/powder-board',
    expectedRevenue: 1250.00,
    priority: 'high',
    status: 'pending',
    createdAt: '2025-10-21T10:00:00Z',
  };

  const mockActionWithAttribution: ActionQueueItem = {
    ...mockAction,
    realizedRevenue7d: 450.00,
    realizedRevenue14d: 890.50,
    realizedRevenue28d: 1100.75,
    conversionRate: 0.032,
  };

  beforeEach(() => {
    sessionStorage.clear();
  });

  describe('Basic Rendering', () => {
    it('renders action title', () => {
      render(<ActionQueueCard action={mockAction} />);
      expect(screen.getByText('Fix Powder Board SEO Meta Tags')).toBeInTheDocument();
    });

    it('renders action description', () => {
      render(<ActionQueueCard action={mockAction} />);
      expect(screen.getByText(/Update meta description and title tags/)).toBeInTheDocument();
    });

    it('displays action type', () => {
      render(<ActionQueueCard action={mockAction} />);
      expect(screen.getByText('SEO')).toBeInTheDocument();
    });

    it('displays priority level', () => {
      render(<ActionQueueCard action={mockAction} />);
      expect(screen.getByText('High Priority')).toBeInTheDocument();
    });

    it('displays expected revenue', () => {
      render(<ActionQueueCard action={mockAction} />);
      expect(screen.getByText('$1,250.00')).toBeInTheDocument();
    });
  });

  describe('ENG-032: Tracked Badge', () => {
    it('displays tracked badge with tooltip', () => {
      render(<ActionQueueCard action={mockAction} />);
      
      const badge = screen.getByText('📊 Tracked');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveAttribute('title', 'ROI tracked via GA4 for 28 days');
    });

    it('has accessibility label for ROI tracking', () => {
      render(<ActionQueueCard action={mockAction} />);
      
      const badge = screen.getByLabelText('This action is tracked for ROI measurement');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('ENG-032: Session Storage Integration', () => {
    it('stores action_key in sessionStorage when link clicked', () => {
      render(<ActionQueueCard action={mockAction} />);
      
      const link = screen.getByText('View Action Target →');
      fireEvent.click(link);
      
      expect(sessionStorage.getItem('hd_current_action')).toBe('seo-fix-powder-board-2025-10-21');
    });

    it('stores timestamp when action link clicked', () => {
      render(<ActionQueueCard action={mockAction} />);
      
      const link = screen.getByText('View Action Target →');
      fireEvent.click(link);
      
      const timestamp = sessionStorage.getItem('hd_action_timestamp');
      expect(timestamp).toBeTruthy();
      expect(parseInt(timestamp!, 10)).toBeGreaterThan(0);
    });
  });

  describe('Attribution Results Display', () => {
    it('displays realized revenue for all windows', () => {
      render(<ActionQueueCard action={mockActionWithAttribution} />);
      
      // Check that revenue values are displayed (format may vary)
      const text = screen.getByText(/Realized Revenue/i).closest('div')?.textContent || '';
      expect(text).toContain('450');
      expect(text).toContain('890');
      expect(text).toContain('1100');
    });

    it('displays conversion rate', () => {
      render(<ActionQueueCard action={mockActionWithAttribution} />);
      
      expect(screen.getByText(/Conversion Rate: 3\.20%/)).toBeInTheDocument();
    });

    it('does not show attribution when no data available', () => {
      render(<ActionQueueCard action={mockAction} />);
      
      expect(screen.queryByText(/Realized Revenue/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Conversion Rate/)).not.toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('calls onApprove with action ID', () => {
      const onApprove = vi.fn();
      render(<ActionQueueCard action={mockAction} onApprove={onApprove} />);
      
      fireEvent.click(screen.getByText('Approve'));
      expect(onApprove).toHaveBeenCalledWith('action-123');
    });

    it('calls onReject with action ID', () => {
      const onReject = vi.fn();
      render(<ActionQueueCard action={mockAction} onReject={onReject} />);
      
      fireEvent.click(screen.getByText('Reject'));
      expect(onReject).toHaveBeenCalledWith('action-123');
    });

    it('hides approval buttons for approved actions', () => {
      const approvedAction = { ...mockAction, status: 'approved' as const };
      render(<ActionQueueCard action={approvedAction} />);
      
      expect(screen.queryByText('Approve')).not.toBeInTheDocument();
      expect(screen.queryByText('Reject')).not.toBeInTheDocument();
    });

    it('shows view details button when callback provided', () => {
      const onViewDetails = vi.fn();
      render(<ActionQueueCard action={mockAction} onViewDetails={onViewDetails} />);
      
      fireEvent.click(screen.getByText('View Details'));
      expect(onViewDetails).toHaveBeenCalledWith('action-123');
    });
  });
});
