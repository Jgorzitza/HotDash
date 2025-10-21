/**
 * PII Card Component
 * 
 * Displays full customer PII for operator-only viewing.
 * NOT sent to customer - for internal reference only.
 * 
 * Part of Growth Engine architecture - Customer-Front Agent pattern
 */

import { useState } from 'react';
import type { CustomerInfo } from '../utils/pii-redaction';

export interface PIICardProps {
  orderId: string;
  orderStatus: string;
  fulfillmentStatus: string;
  email: string;
  phone?: string;
  shippingAddress: {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    country: string;
    zip: string;
  };
  tracking?: {
    carrier: string;
    number: string;
    url: string;
    lastEvent: string;
    lastEventDate: string;
  };
  lineItems: Array<{
    title: string;
    sku: string;
    quantity: number;
    price: string;
  }>;
}

export function PIICard(props: PIICardProps) {
  const {
    orderId,
    orderStatus,
    fulfillmentStatus,
    email,
    phone,
    shippingAddress,
    tracking,
    lineItems,
  } = props;

  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatAddress = (addr: typeof shippingAddress) => {
    const parts = [
      addr.address1,
      addr.address2,
      `${addr.city}, ${addr.province} ${addr.zip}`,
      addr.country,
    ].filter(Boolean);
    return parts.join('\n');
  };

  return (
    <div
      className="pii-card"
      aria-label="Customer PII - Operator Only"
      role="region"
    >
      {/* Warning Banner */}
      <div className="pii-card__warning" role="alert">
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </svg>
        <span>
          <strong>OPERATOR ONLY</strong> — NOT SENT TO CUSTOMER
        </span>
      </div>

      {/* Order Details Section */}
      <div className="pii-card__section">
        <h3 className="pii-card__section-title">Order Details</h3>
        <dl className="pii-card__details">
          <div className="pii-card__detail-row">
            <dt>Order ID</dt>
            <dd>{orderId}</dd>
          </div>
          <div className="pii-card__detail-row">
            <dt>Status</dt>
            <dd>
              <span className={`pii-card__status pii-card__status--${orderStatus}`}>
                {orderStatus}
              </span>
            </dd>
          </div>
          <div className="pii-card__detail-row">
            <dt>Fulfillment</dt>
            <dd>
              <span className={`pii-card__status pii-card__status--${fulfillmentStatus}`}>
                {fulfillmentStatus}
              </span>
            </dd>
          </div>
        </dl>
      </div>

      {/* Customer Contact Section */}
      <div className="pii-card__section">
        <h3 className="pii-card__section-title">Customer Contact</h3>
        <dl className="pii-card__details">
          <div className="pii-card__detail-row">
            <dt>Email</dt>
            <dd className="pii-card__copyable">
              <span>{email}</span>
              <button
                type="button"
                onClick={() => copyToClipboard(email, 'email')}
                className="pii-card__copy-button"
                aria-label="Copy email"
              >
                {copiedField === 'email' ? '✓ Copied' : 'Copy'}
              </button>
            </dd>
          </div>
          {phone && (
            <div className="pii-card__detail-row">
              <dt>Phone</dt>
              <dd className="pii-card__copyable">
                <span>{phone}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(phone, 'phone')}
                  className="pii-card__copy-button"
                  aria-label="Copy phone"
                >
                  {copiedField === 'phone' ? '✓ Copied' : 'Copy'}
                </button>
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Shipping Address Section */}
      <div className="pii-card__section">
        <h3 className="pii-card__section-title">Shipping Address</h3>
        <div className="pii-card__address">
          <p>
            <strong>{shippingAddress.name}</strong>
            <br />
            {shippingAddress.address1}
            <br />
            {shippingAddress.address2 && (
              <>
                {shippingAddress.address2}
                <br />
              </>
            )}
            {shippingAddress.city}, {shippingAddress.province} {shippingAddress.zip}
            <br />
            {shippingAddress.country}
          </p>
          <button
            type="button"
            onClick={() => copyToClipboard(formatAddress(shippingAddress), 'address')}
            className="pii-card__copy-button"
            aria-label="Copy address"
          >
            {copiedField === 'address' ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Tracking Section */}
      {tracking && (
        <div className="pii-card__section">
          <h3 className="pii-card__section-title">Tracking</h3>
          <dl className="pii-card__details">
            <div className="pii-card__detail-row">
              <dt>Carrier</dt>
              <dd>{tracking.carrier}</dd>
            </div>
            <div className="pii-card__detail-row">
              <dt>Number</dt>
              <dd className="pii-card__copyable">
                <span>{tracking.number}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(tracking.number, 'tracking')}
                  className="pii-card__copy-button"
                  aria-label="Copy tracking number"
                >
                  {copiedField === 'tracking' ? '✓ Copied' : 'Copy'}
                </button>
              </dd>
            </div>
            <div className="pii-card__detail-row">
              <dt>Status</dt>
              <dd>
                {tracking.lastEvent} •{' '}
                {new Date(tracking.lastEventDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </dd>
            </div>
            <div className="pii-card__detail-row">
              <dt>Link</dt>
              <dd>
                <a
                  href={tracking.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pii-card__link"
                >
                  Track Package ↗
                </a>
              </dd>
            </div>
          </dl>
        </div>
      )}

      {/* Line Items Section */}
      <div className="pii-card__section">
        <h3 className="pii-card__section-title">Line Items</h3>
        <table className="pii-card__table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Qty</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, index) => (
              <tr key={index}>
                <td>{item.title}</td>
                <td>{item.sku}</td>
                <td>{item.quantity}</td>
                <td>{item.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .pii-card {
          background: var(--occ-color-bg-surface, #ffffff);
          border: 1px solid var(--occ-color-border-base, #e3e3e3);
          border-radius: var(--occ-border-radius-base, 8px);
          padding: var(--occ-space-base, 16px);
          font-family: var(--occ-font-family, system-ui, -apple-system, sans-serif);
          font-size: var(--occ-font-size-base, 14px);
          color: var(--occ-color-text-base, #202223);
        }

        .pii-card__warning {
          background: var(--occ-color-bg-warning, #fff4e5);
          border: 1px solid var(--occ-color-border-warning, #f1c40f);
          border-radius: var(--occ-border-radius-small, 4px);
          padding: var(--occ-space-small, 12px);
          margin-bottom: var(--occ-space-base, 16px);
          display: flex;
          align-items: center;
          gap: var(--occ-space-small-100, 8px);
          color: var(--occ-color-text-warning, #856404);
        }

        .pii-card__warning svg {
          flex-shrink: 0;
          color: var(--occ-color-icon-warning, #f1c40f);
        }

        .pii-card__section {
          margin-bottom: var(--occ-space-base, 16px);
        }

        .pii-card__section:last-child {
          margin-bottom: 0;
        }

        .pii-card__section-title {
          font-size: var(--occ-font-size-large-100, 16px);
          font-weight: var(--occ-font-weight-semibold, 600);
          margin: 0 0 var(--occ-space-small-100, 8px) 0;
          color: var(--occ-color-text-base, #202223);
        }

        .pii-card__details {
          margin: 0;
        }

        .pii-card__detail-row {
          display: flex;
          padding: var(--occ-space-small-100, 8px) 0;
          border-bottom: 1px solid var(--occ-color-border-subdued, #e3e3e3);
        }

        .pii-card__detail-row:last-child {
          border-bottom: none;
        }

        .pii-card__detail-row dt {
          flex: 0 0 120px;
          font-weight: var(--occ-font-weight-medium, 500);
          color: var(--occ-color-text-subdued, #6d7175);
        }

        .pii-card__detail-row dd {
          flex: 1;
          margin: 0;
        }

        .pii-card__copyable {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--occ-space-small-100, 8px);
        }

        .pii-card__copy-button {
          background: var(--occ-color-bg-surface-hover, #f6f6f7);
          border: 1px solid var(--occ-color-border-base, #e3e3e3);
          border-radius: var(--occ-border-radius-small, 4px);
          padding: 4px 8px;
          font-size: var(--occ-font-size-small, 12px);
          color: var(--occ-color-text-base, #202223);
          cursor: pointer;
          transition: background 0.2s;
        }

        .pii-card__copy-button:hover {
          background: var(--occ-color-bg-surface-active, #e3e3e3);
        }

        .pii-card__address {
          background: var(--occ-color-bg-surface-subdued, #f6f6f7);
          border: 1px solid var(--occ-color-border-subdued, #e3e3e3);
          border-radius: var(--occ-border-radius-small, 4px);
          padding: var(--occ-space-small, 12px);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: var(--occ-space-small, 12px);
        }

        .pii-card__address p {
          margin: 0;
          line-height: 1.5;
        }

        .pii-card__link {
          color: var(--occ-color-text-interactive, #0066cc);
          text-decoration: none;
        }

        .pii-card__link:hover {
          text-decoration: underline;
        }

        .pii-card__status {
          display: inline-block;
          padding: 2px 8px;
          border-radius: var(--occ-border-radius-small, 4px);
          font-size: var(--occ-font-size-small, 12px);
          font-weight: var(--occ-font-weight-medium, 500);
        }

        .pii-card__status--fulfilled,
        .pii-card__status--shipped {
          background: var(--occ-color-bg-success, #d4edda);
          color: var(--occ-color-text-success, #155724);
        }

        .pii-card__status--pending {
          background: var(--occ-color-bg-warning, #fff3cd);
          color: var(--occ-color-text-warning, #856404);
        }

        .pii-card__status--unfulfilled {
          background: var(--occ-color-bg-subdued, #f6f6f7);
          color: var(--occ-color-text-subdued, #6d7175);
        }

        .pii-card__table {
          width: 100%;
          border-collapse: collapse;
        }

        .pii-card__table thead {
          background: var(--occ-color-bg-surface-subdued, #f6f6f7);
        }

        .pii-card__table th {
          padding: var(--occ-space-small-100, 8px);
          text-align: left;
          font-weight: var(--occ-font-weight-semibold, 600);
          font-size: var(--occ-font-size-small, 12px);
          color: var(--occ-color-text-subdued, #6d7175);
          border-bottom: 1px solid var(--occ-color-border-base, #e3e3e3);
        }

        .pii-card__table td {
          padding: var(--occ-space-small, 12px) var(--occ-space-small-100, 8px);
          border-bottom: 1px solid var(--occ-color-border-subdued, #e3e3e3);
        }

        .pii-card__table tbody tr:last-child td {
          border-bottom: none;
        }

        .pii-card__table tbody tr:hover {
          background: var(--occ-color-bg-surface-hover, #f6f6f7);
        }
      `}</style>
    </div>
  );
}

