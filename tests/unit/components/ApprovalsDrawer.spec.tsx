import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ApprovalsDrawer } from '~/components/approvals/ApprovalsDrawer';
import type { Approval } from '~/components/approvals/ApprovalsDrawer';

function buildApproval(overrides: Partial<Approval> = {}): Approval {
  const base: Approval = {
    id: 'APP-DR-001',
    kind: 'growth',
    state: 'pending_review',
    summary: 'Growth approval - Add ROAS tile',
    created_by: 'manager',
    evidence: { what_changes: 'Add tile', why_now: 'Improve visibility' },
    impact: { expected_outcome: 'Higher awareness' },
    risk: { what_could_go_wrong: 'Low risk', recovery_time: '30m' },
    rollback: { steps: ['Hide tile'], artifact_location: 'docs' },
    actions: [{ endpoint: '/api/approvals/APP-DR-001/approve', payload: {} }],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  return { ...base, ...overrides };
}

describe('ApprovalsDrawer', () => {
  it('renders approval summary and enables Approve when evidence+rollback present', () => {
    const approval = buildApproval();
    render(
      <ApprovalsDrawer
        open
        approval={approval}
        onClose={() => {}}
        onApprove={vi.fn()}
        onReject={vi.fn()}
        onRequestChanges={vi.fn()}
      />,
    );

    // Summary visible
    expect(
      screen.getByRole('heading', { name: /growth approval - add roas tile/i }),
    ).toBeInTheDocument();

    // Approve button enabled (pending_review + evidence + rollback present)
    const approveBtn = screen.getByRole('button', { name: /approve/i });
    expect(approveBtn).toBeEnabled();
  });
});

