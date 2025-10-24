/**
 * PII Redaction Utility
 *
 * Provides functions to mask personally identifiable information (PII)
 * for public-facing replies while preserving full details for operators.
 *
 * Part of Growth Engine architecture - PII Broker pattern
 */
/**
 * Masks email address: justin@hotrodan.com → j***@h***.com
 * Shows first character of local part and domain, masks the rest
 */
export declare function maskEmail(email: string): string;
/**
 * Masks phone number: 555-123-4567 → ***-***-4567
 * Shows only last 4 digits
 */
export declare function maskPhone(phone: string): string;
/**
 * Masks address: Keeps city, region, country + postal code prefix (first 3-4 chars)
 * Full: "123 Main St, Los Angeles, CA 90210, USA"
 * Masked: "Los Angeles, CA 902**, USA"
 */
export declare function maskAddress(address: {
    address1?: string;
    city: string;
    province: string;
    country: string;
    zip: string;
}): string;
/**
 * Masks order ID: Shows last 4 only
 * "#1234567890" → "#***7890"
 */
export declare function maskOrderId(orderId: string): string;
/**
 * Masks tracking URL: Keep carrier + last event only
 * Full: {carrier: "UPS", lastEvent: "Delivered", url: "https://..."}
 * Masked: "UPS: Delivered Oct 20"
 */
export declare function maskTracking(tracking: {
    carrier: string;
    lastEvent: string;
    lastEventDate?: string;
    url: string;
}): string;
/**
 * Full customer information (operator-only)
 */
export interface CustomerInfo {
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
/**
 * Redacted customer information (public-facing)
 */
export interface RedactedCustomerInfo {
    orderId: string;
    email: string;
    phone?: string;
    shippingCity: string;
    shippingRegion: string;
    shippingCountry: string;
    shippingZipPrefix: string;
    trackingCarrier?: string;
    trackingLastEvent?: string;
}
/**
 * Full PII redaction for public reply
 * Masks all sensitive information while preserving enough context
 * for customer to recognize their order
 */
export declare function redactCustomerInfo(fullInfo: CustomerInfo): RedactedCustomerInfo;
//# sourceMappingURL=pii-redaction.d.ts.map