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
export function maskEmail(email) {
    if (!email || !email.includes("@")) {
        return "***";
    }
    const [localPart, domain] = email.split("@");
    if (localPart.length === 0 || domain.length === 0) {
        return "***";
    }
    const maskedLocal = localPart[0] + "***";
    const maskedDomain = domain[0] +
        "***" +
        (domain.includes(".") ? domain.substring(domain.lastIndexOf(".")) : ".com");
    return `${maskedLocal}@${maskedDomain}`;
}
/**
 * Masks phone number: 555-123-4567 → ***-***-4567
 * Shows only last 4 digits
 */
export function maskPhone(phone) {
    if (!phone) {
        return "***";
    }
    // Remove all non-digit characters to get clean number
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 4) {
        return "***";
    }
    // Keep last 4 digits, mask the rest
    const lastFour = digits.slice(-4);
    return `***-***-${lastFour}`;
}
/**
 * Masks address: Keeps city, region, country + postal code prefix (first 3-4 chars)
 * Full: "123 Main St, Los Angeles, CA 90210, USA"
 * Masked: "Los Angeles, CA 902**, USA"
 */
export function maskAddress(address) {
    const { city, province, zip, country } = address;
    // Keep first 3 characters of postal code, mask the rest
    const maskedZip = zip && zip.length >= 3 ? zip.substring(0, 3) + "**" : "***";
    return `${city}, ${province} ${maskedZip}, ${country}`;
}
/**
 * Masks order ID: Shows last 4 only
 * "#1234567890" → "#***7890"
 */
export function maskOrderId(orderId) {
    if (!orderId) {
        return "#***";
    }
    // Remove # prefix if present for processing
    const cleanId = orderId.startsWith("#") ? orderId.substring(1) : orderId;
    if (cleanId.length < 4) {
        return "#***";
    }
    const lastFour = cleanId.slice(-4);
    return `#***${lastFour}`;
}
/**
 * Masks tracking URL: Keep carrier + last event only
 * Full: {carrier: "UPS", lastEvent: "Delivered", url: "https://..."}
 * Masked: "UPS: Delivered Oct 20"
 */
export function maskTracking(tracking) {
    const { carrier, lastEvent, lastEventDate } = tracking;
    if (!carrier || !lastEvent) {
        return "Tracking information available";
    }
    // Format date if provided (just the date part, not time)
    const dateStr = lastEventDate
        ? new Date(lastEventDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        })
        : "";
    return `${carrier}: ${lastEvent}${dateStr ? ` ${dateStr}` : ""}`;
}
/**
 * Full PII redaction for public reply
 * Masks all sensitive information while preserving enough context
 * for customer to recognize their order
 */
export function redactCustomerInfo(fullInfo) {
    return {
        orderId: maskOrderId(fullInfo.orderId),
        email: maskEmail(fullInfo.email),
        phone: fullInfo.phone ? maskPhone(fullInfo.phone) : undefined,
        shippingCity: fullInfo.shippingAddress.city,
        shippingRegion: fullInfo.shippingAddress.province,
        shippingCountry: fullInfo.shippingAddress.country,
        shippingZipPrefix: fullInfo.shippingAddress.zip.substring(0, 3) + "**",
        trackingCarrier: fullInfo.tracking?.carrier,
        trackingLastEvent: fullInfo.tracking?.lastEvent,
    };
}
//# sourceMappingURL=pii-redaction.js.map