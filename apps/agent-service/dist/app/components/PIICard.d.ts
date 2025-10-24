/**
 * PII Card Component
 *
 * Displays full customer PII for operator-only viewing.
 * NOT sent to customer - for internal reference only.
 *
 * Part of Growth Engine architecture - Customer-Front Agent pattern
 */
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
export declare function PIICard(props: PIICardProps): React.JSX.Element;
//# sourceMappingURL=PIICard.d.ts.map