import { useState } from 'react';

interface ApprovalCardProps {
  approval: {
    id: string;
    conversationId: number;
    createdAt: string;
    pending: {
      agent: string;
      tool: string;
      args: Record<string, any>;
    }[];
  };
}

export function ApprovalCard({ approval }: ApprovalCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const action = approval.pending[0]; // First pending action
  const riskLevel = getRiskLevel(action.tool);
  
  const handleApprove = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/approvals/${approval.id}/0/approve`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to approve');
      // Trigger revalidation
      window.location.reload();
    } catch (err) {
      setError('Failed to approve. Please try again.');
      setLoading(false);
    }
  };
  
  const handleReject = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/approvals/${approval.id}/0/reject`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to reject');
      // Trigger revalidation
      window.location.reload();
    } catch (err) {
      setError('Failed to reject. Please try again.');
      setLoading(false);
    }
  };
  
  const riskColor = riskLevel === 'high' ? '#dc2626' : riskLevel === 'medium' ? '#d97706' : '#059669';
  const riskBg = riskLevel === 'high' ? '#fee2e2' : riskLevel === 'medium' ? '#fef3c7' : '#d1fae5';
  
  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600' }}>
          Conversation #{approval.conversationId}
        </h2>
        <span style={{
          padding: '4px 12px',
          borderRadius: '16px',
          fontSize: '12px',
          fontWeight: '600',
          color: riskColor,
          backgroundColor: riskBg,
        }}>
          {riskLevel.toUpperCase()} RISK
        </span>
      </div>
      
      {/* Agent & Tool Info */}
      <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div>
          <strong>Agent:</strong> {action.agent}
        </div>
        <div>
          <strong>Tool:</strong> {action.tool}
        </div>
        <div style={{ color: '#6b7280' }}>
          <strong>Arguments:</strong>
        </div>
        <pre style={{ 
          background: '#f3f4f6', 
          padding: '12px', 
          borderRadius: '4px',
          fontSize: '12px',
          overflow: 'auto',
          fontFamily: 'monospace',
        }}>
          {JSON.stringify(action.args, null, 2)}
        </pre>
        <div style={{ fontSize: '14px', color: '#6b7280' }}>
          Requested {new Date(approval.createdAt).toLocaleString()}
        </div>
      </div>
      
      {/* Error Message */}
      {error && (
        <div style={{
          padding: '12px',
          marginBottom: '16px',
          backgroundColor: '#fee2e2',
          border: '1px solid #ef4444',
          borderRadius: '4px',
          color: '#991b1b',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px',
              color: '#991b1b',
            }}
          >
            ×
          </button>
        </div>
      )}
      
      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={handleApprove}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#9ca3af' : '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Processing...' : 'Approve'}
        </button>
        <button
          onClick={handleReject}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#9ca3af' : '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Processing...' : 'Reject'}
        </button>
      </div>
    </div>
  );
}

// Helper: Determine risk level based on tool
function getRiskLevel(tool: string): 'low' | 'medium' | 'high' {
  const highRisk = ['send_email', 'create_refund', 'cancel_order'];
  const mediumRisk = ['create_private_note', 'update_conversation'];
  
  if (highRisk.includes(tool)) return 'high';
  if (mediumRisk.includes(tool)) return 'medium';
  return 'low';
}
