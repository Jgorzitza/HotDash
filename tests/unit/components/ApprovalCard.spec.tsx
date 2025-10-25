import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ApprovalCard } from '~/components/ApprovalCard';
import type { Approval } from '~/components/approvals/ApprovalsDrawer';

function buildApproval(overrides: Partial<Approval> = {}): Approval {
  const base: Approval = {
    id: 'APP-001',
    kind: 'misc',
    state: 'pending_review',
    summary: 'Test Approval Summary',
    created_by: 'manager',
    evidence: { what_changes: 'Change X', why_now: 'Now', impact_forecast: 'Low' },
    impact: { expected_outcome: 'Outcome' },
    risk: { what_could_go_wrong: 'Nothing', recovery_time: '1h' },
    rollback: { steps: ['Revert commit'], artifact_location: 'repo' },
    actions: [{ endpoint: '/api/approvals/APP-001/approve', payload: { id: 'APP-001' } }],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  return { ...base, ...overrides };
}

describe('ApprovalCard', () => {
  it('renders summary, kind and state badge', () => {
    render(<ApprovalCard approval={buildApproval()} onDetails={() => {}} />);

    expect(screen.getByRole('heading', { name: /test approval summary/i })).toBeInTheDocument();
    expect(screen.getByText('MISC')).toBeInTheDocument();
    expect(screen.getByText(/Pending Review/i)).toBeInTheDocument();
  });

  it('shows action endpoint snippet', () => {
    render(<ApprovalCard approval={buildApproval()} onDetails={() => {}} />);
    expect(screen.getByText(/Action:/i)).toBeInTheDocument();
    expect(screen.getByText(/\/api\/approvals\/APP-001\/approve/)).toBeInTheDocument();
  });

  it('invokes onDetails when View Details clicked', async () => {
    const onDetails = vi.fn();
    render(<ApprovalCard approval={buildApproval()} onDetails={onDetails} />);

    const btn = screen.getByRole('button', { name: /view details/i });
    fireEvent.click(btn);
    expect(onDetails).toHaveBeenCalledTimes(1);
  });
});

