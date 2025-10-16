import React from 'react';

interface ApprovalsDrawerProps {
  open: boolean;
  approval: any;
  onClose: () => void;
  onApprove: () => void;
  onReject: (reason: string) => void;
}

// Minimal placeholder to satisfy SSR build. Replace with full implementation when ready.
export function ApprovalsDrawer({ open, approval, onClose, onApprove, onReject }: ApprovalsDrawerProps) {
  if (!open) return null;
  return (
    <div style={{ padding: 16, border: '1px solid #ddd', background: '#fff' }}>
      <h3>Approval</h3>
      <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(approval, null, 2)}</pre>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onApprove}>Approve</button>
        <button onClick={() => onReject('Rejected by operator')}>Reject</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

