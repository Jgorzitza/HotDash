/**
 * Action Queue Card Component
 *
 * Displays action recommendations with GA4 attribution tracking.
 * Part of Growth Engine - Action ROI measurement and queue re-ranking.
 *
 * ENG-032: Action Link Click Handler with hd_action_key attribution
 */
import { useState } from "react";
import { setActionKey } from "../utils/analytics";
export function ActionQueueCard({ action, onApprove, onReject, onViewDetails, }) {
    const [isTracking, setIsTracking] = useState(false);
    /**
     * ENG-032: Handle action link click with attribution tracking
     *
     * When user clicks the action link:
     * 1. Add hd_action URL parameter
     * 2. Store action_key in sessionStorage
     * 3. Navigate to target URL
     *
     * GA4 will then track all subsequent events (page_view, add_to_cart, purchase)
     * with the hd_action_key custom dimension for ROI attribution.
     */
    const handleActionLinkClick = (e) => {
        e.preventDefault();
        // Build target URL with hd_action parameter
        const actionUrl = new URL(action.targetUrl, window.location.origin);
        actionUrl.searchParams.set("hd_action", action.actionKey);
        // Store action_key in sessionStorage (24h TTL)
        setActionKey(action.actionKey);
        // Visual feedback
        setIsTracking(true);
        // Navigate to target URL (with hd_action param in URL)
        // The analytics.ts initActionKeyFromUrl() will pick it up and store in sessionStorage
        window.location.href = actionUrl.toString();
        // Note: Navigation happens, so state reset doesn't matter
    };
    const getActionTypeColor = (type) => {
        const colors = {
            seo: "var(--occ-color-bg-info, #e3f2fd)",
            inventory: "var(--occ-color-bg-warning, #fff3cd)",
            content: "var(--occ-color-bg-success, #d4edda)",
            pricing: "var(--occ-color-bg-critical, #f8d7da)",
            ads: "var(--occ-color-bg-neutral, #f6f6f7)",
        };
        return colors[type];
    };
    const getPriorityBadge = (priority) => {
        const badges = {
            high: {
                label: "High Priority",
                color: "var(--occ-color-text-critical, #d32f2f)",
            },
            medium: {
                label: "Medium",
                color: "var(--occ-color-text-warning, #f57c00)",
            },
            low: { label: "Low", color: "var(--occ-color-text-subdued, #6d7175)" },
        };
        return badges[priority];
    };
    const hasAttribution = Boolean(action.realizedRevenue7d ||
        action.realizedRevenue14d ||
        action.realizedRevenue28d);
    const priorityBadge = getPriorityBadge(action.priority);
    return (<div className="action-queue-card" style={{ background: getActionTypeColor(action.actionType) }}>
      {/* Header */}
      <div className="action-queue-card__header">
        <div className="action-queue-card__title-row">
          <h3 className="action-queue-card__title">{action.title}</h3>
          <div className="action-queue-card__badges">
            {/* ENG-032: Tracked badge for actions with attribution enabled */}
            <span className="action-queue-card__badge action-queue-card__badge--tracked" title="ROI tracked via GA4 for 28 days" aria-label="This action is tracked for ROI measurement">
              📊 Tracked
            </span>
            <span className="action-queue-card__badge action-queue-card__badge--priority" style={{ color: priorityBadge.color }}>
              {priorityBadge.label}
            </span>
          </div>
        </div>
        <span className="action-queue-card__type">
          {action.actionType.toUpperCase()}
        </span>
      </div>

      {/* Description */}
      <p className="action-queue-card__description">{action.description}</p>

      {/* Expected Revenue */}
      <div className="action-queue-card__metrics">
        <div className="action-queue-card__metric">
          <span className="action-queue-card__metric-label">
            Expected Revenue
          </span>
          <span className="action-queue-card__metric-value">
            $
            {action.expectedRevenue.toLocaleString("en-US", {
            minimumFractionDigits: 2,
        })}
          </span>
        </div>

        {/* Attribution Results (if available) */}
        {hasAttribution && (<div className="action-queue-card__attribution">
            <span className="action-queue-card__metric-label">
              Realized Revenue
            </span>
            <div className="action-queue-card__attribution-windows">
              {action.realizedRevenue7d !== undefined && (<span className="action-queue-card__metric-value action-queue-card__metric-value--small">
                  7d: ${action.realizedRevenue7d.toFixed(2)}
                </span>)}
              {action.realizedRevenue14d !== undefined && (<span className="action-queue-card__metric-value action-queue-card__metric-value--small">
                  14d: ${action.realizedRevenue14d.toFixed(2)}
                </span>)}
              {action.realizedRevenue28d !== undefined && (<span className="action-queue-card__metric-value action-queue-card__metric-value--small">
                  28d: ${action.realizedRevenue28d.toFixed(2)}
                </span>)}
            </div>
          </div>)}
      </div>

      {/* ENG-032: Action link with attribution tracking */}
      <div className="action-queue-card__actions">
        <a href={action.targetUrl} onClick={handleActionLinkClick} className="action-queue-card__link" aria-label={`View ${action.title} (tracked for attribution)`}>
          View Action Target →
        </a>

        {onViewDetails && (<button type="button" onClick={() => onViewDetails(action.id)} className="action-queue-card__button action-queue-card__button--secondary">
            View Details →
          </button>)}

        {action.status === "pending" && (<div className="action-queue-card__approval-actions">
            {onApprove && (<button type="button" onClick={() => onApprove(action.id)} className="action-queue-card__button action-queue-card__button--primary">
                Approve
              </button>)}
            {onReject && (<button type="button" onClick={() => onReject(action.id)} className="action-queue-card__button action-queue-card__button--critical">
                Reject
              </button>)}
          </div>)}
      </div>

      {/* Conversion Rate (if available) */}
      {action.conversionRate !== undefined && (<div className="action-queue-card__footer">
          <span className="action-queue-card__conversion">
            Conversion Rate: {(action.conversionRate * 100).toFixed(2)}%
          </span>
        </div>)}

      <style>{`
        .action-queue-card {
          border: 1px solid var(--occ-color-border-base, #e3e3e3);
          border-radius: var(--occ-border-radius-base, 8px);
          padding: var(--occ-space-base, 16px);
          font-family: var(--occ-font-family, system-ui, -apple-system, sans-serif);
          font-size: var(--occ-font-size-base, 14px);
          color: var(--occ-color-text-base, #202223);
          transition: box-shadow 0.2s;
        }

        .action-queue-card:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .action-queue-card__header {
          margin-bottom: var(--occ-space-small, 12px);
        }

        .action-queue-card__title-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: var(--occ-space-small, 12px);
          margin-bottom: var(--occ-space-small-100, 8px);
        }

        .action-queue-card__title {
          margin: 0;
          font-size: var(--occ-font-size-large-100, 16px);
          font-weight: var(--occ-font-weight-semibold, 600);
          color: var(--occ-color-text-base, #202223);
        }

        .action-queue-card__badges {
          display: flex;
          gap: var(--occ-space-small-100, 8px);
          flex-shrink: 0;
        }

        .action-queue-card__badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: var(--occ-border-radius-small, 4px);
          font-size: var(--occ-font-size-small, 12px);
          font-weight: var(--occ-font-weight-medium, 500);
          white-space: nowrap;
        }

        .action-queue-card__badge--tracked {
          background: var(--occ-color-bg-info, #e3f2fd);
          color: var(--occ-color-text-info, #1976d2);
          border: 1px solid var(--occ-color-border-info, #90caf9);
        }

        .action-queue-card__badge--priority {
          background: var(--occ-color-bg-surface, #ffffff);
          border: 1px solid var(--occ-color-border-base, #e3e3e3);
        }

        .action-queue-card__type {
          display: inline-block;
          padding: 2px 8px;
          background: var(--occ-color-bg-surface, #ffffff);
          border: 1px solid var(--occ-color-border-base, #e3e3e3);
          border-radius: var(--occ-border-radius-small, 4px);
          font-size: var(--occ-font-size-small, 12px);
          font-weight: var(--occ-font-weight-semibold, 600);
          color: var(--occ-color-text-subdued, #6d7175);
        }

        .action-queue-card__description {
          margin: 0 0 var(--occ-space-base, 16px) 0;
          line-height: 1.5;
          color: var(--occ-color-text-base, #202223);
        }

        .action-queue-card__metrics {
          display: flex;
          flex-direction: column;
          gap: var(--occ-space-small, 12px);
          margin-bottom: var(--occ-space-base, 16px);
          padding: var(--occ-space-small, 12px);
          background: var(--occ-color-bg-surface, #ffffff);
          border: 1px solid var(--occ-color-border-subdued, #e3e3e3);
          border-radius: var(--occ-border-radius-small, 4px);
        }

        .action-queue-card__metric {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .action-queue-card__metric-label {
          font-size: var(--occ-font-size-small, 12px);
          color: var(--occ-color-text-subdued, #6d7175);
          font-weight: var(--occ-font-weight-medium, 500);
        }

        .action-queue-card__metric-value {
          font-size: var(--occ-font-size-base, 14px);
          font-weight: var(--occ-font-weight-semibold, 600);
          color: var(--occ-color-text-success, #2e7d32);
        }

        .action-queue-card__metric-value--small {
          font-size: var(--occ-font-size-small, 12px);
        }

        .action-queue-card__attribution {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .action-queue-card__attribution-windows {
          display: flex;
          gap: var(--occ-space-small-100, 8px);
          flex-wrap: wrap;
        }

        .action-queue-card__actions {
          display: flex;
          flex-wrap: wrap;
          gap: var(--occ-space-small-100, 8px);
          margin-bottom: var(--occ-space-small, 12px);
        }

        .action-queue-card__link {
          display: inline-flex;
          align-items: center;
          padding: 8px 16px;
          background: var(--occ-color-bg-interactive, #0066cc);
          color: var(--occ-color-text-on-interactive, #ffffff);
          text-decoration: none;
          border-radius: var(--occ-border-radius-small, 4px);
          font-weight: var(--occ-font-weight-medium, 500);
          transition: background 0.2s;
        }

        .action-queue-card__link:hover {
          background: var(--occ-color-bg-interactive-hover, #0052a3);
        }

        .action-queue-card__button {
          padding: 8px 16px;
          border: 1px solid var(--occ-color-border-base, #e3e3e3);
          border-radius: var(--occ-border-radius-small, 4px);
          font-size: var(--occ-font-size-base, 14px);
          font-weight: var(--occ-font-weight-medium, 500);
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-queue-card__button--primary {
          background: var(--occ-color-bg-success, #2e7d32);
          color: var(--occ-color-text-on-success, #ffffff);
          border-color: var(--occ-color-bg-success, #2e7d32);
        }

        .action-queue-card__button--primary:hover {
          background: var(--occ-color-bg-success-hover, #1b5e20);
        }

        .action-queue-card__button--secondary {
          background: var(--occ-color-bg-surface, #ffffff);
          color: var(--occ-color-text-base, #202223);
        }

        .action-queue-card__button--secondary:hover {
          background: var(--occ-color-bg-surface-hover, #f6f6f7);
        }

        .action-queue-card__button--critical {
          background: var(--occ-color-bg-surface, #ffffff);
          color: var(--occ-color-text-critical, #d32f2f);
          border-color: var(--occ-color-border-critical, #f44336);
        }

        .action-queue-card__button--critical:hover {
          background: var(--occ-color-bg-critical, #f8d7da);
        }

        .action-queue-card__approval-actions {
          display: flex;
          gap: var(--occ-space-small-100, 8px);
        }

        .action-queue-card__footer {
          padding-top: var(--occ-space-small, 12px);
          border-top: 1px solid var(--occ-color-border-subdued, #e3e3e3);
          font-size: var(--occ-font-size-small, 12px);
          color: var(--occ-color-text-subdued, #6d7175);
        }

        .action-queue-card__conversion {
          font-weight: var(--occ-font-weight-medium, 500);
        }
      `}</style>
    </div>);
}
//# sourceMappingURL=ActionQueueCard.js.map