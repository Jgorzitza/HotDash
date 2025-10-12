/**
 * Agent Response Template Library
 *
 * Reusable, brand-voice-compliant templates for Agent SDK customer support
 * Created: 2025-10-11
 */
export const templates = [
    // ========================================
    // ORDER STATUS TEMPLATES (4)
    // ========================================
    {
        id: 'order_status_shipping',
        name: 'Order Status - In Transit',
        category: 'order_status',
        description: 'Use when customer asks about order currently shipping',
        variables: ['customer_name', 'order_number', 'tracking_number', 'estimated_delivery', 'carrier'],
        template: `Hi {{customer_name}},

Thank you for reaching out about order {{order_number}}!

Good news - your order is currently on its way! Here are the tracking details:

**Tracking Number:** {{tracking_number}}  
**Carrier:** {{carrier}}  
**Estimated Delivery:** {{estimated_delivery}}

You can track your package in real-time using the tracking number above. If you have any questions about your delivery, feel free to ask!

Best regards,  
HotDash Support Team`,
        tone: 'professional',
        needsApproval: false,
        tags: ['order_status', 'shipping', 'tracking'],
    },
    {
        id: 'order_status_processing',
        name: 'Order Status - Processing',
        category: 'order_status',
        description: 'Use when order is being prepared for shipment',
        variables: ['customer_name', 'order_number', 'estimated_ship_date'],
        template: `Hi {{customer_name}},

Thanks for checking on order {{order_number}}!

Your order is currently being prepared for shipment. Our team is working to get it out the door as quickly as possible.

**Expected Ship Date:** {{estimated_ship_date}}

Once your order ships, you'll receive an email with tracking information. We appreciate your patience!

Best regards,  
HotDash Support Team`,
        tone: 'professional',
        needsApproval: false,
        tags: ['order_status', 'processing'],
    },
    {
        id: 'order_status_delivered',
        name: 'Order Status - Delivered',
        category: 'order_status',
        description: 'Use when tracking shows delivered but customer hasn\'t received',
        variables: ['customer_name', 'order_number', 'delivery_date', 'delivery_location'],
        template: `Hi {{customer_name}},

I understand your concern about order {{order_number}}.

Our tracking shows the package was delivered on {{delivery_date}} to {{delivery_location}}. Here are some steps to help locate it:

1. **Check all entrances** - Sometimes carriers leave packages in unexpected spots
2. **Ask household members** - Someone may have brought it inside
3. **Check with neighbors** - Occasionally delivered to adjacent address
4. **Review package photo** - Carrier may have left photo of delivery location

If you still can't locate the package after checking these spots, please reply and we'll initiate a carrier investigation immediately.

Best regards,  
HotDash Support Team`,
        tone: 'empathetic',
        needsApproval: false,
        tags: ['order_status', 'delivered', 'missing_package'],
    },
    {
        id: 'order_status_delayed',
        name: 'Order Status - Shipping Delay',
        category: 'order_status',
        description: 'Use when order is delayed beyond original estimate',
        variables: ['customer_name', 'order_number', 'original_date', 'new_date', 'delay_reason'],
        template: `Hi {{customer_name}},

I sincerely apologize for the delay with order {{order_number}}.

**Original Estimated Delivery:** {{original_date}}  
**Revised Estimate:** {{new_date}}  
**Reason:** {{delay_reason}}

We understand this is frustrating, and we're working to get your order to you as quickly as possible. As a gesture of goodwill, we'd like to offer you [10% off your next order / free expedited shipping on your next purchase].

Is there anything else I can help you with regarding this order?

Best regards,  
HotDash Support Team`,
        tone: 'apologetic',
        needsApproval: true, // Offers require approval
        tags: ['order_status', 'delayed', 'apology', 'compensation'],
    },
    // ========================================
    // SHIPPING & DELIVERY TEMPLATES (3)
    // ========================================
    {
        id: 'shipping_timeline_standard',
        name: 'Shipping Timeline - Standard',
        category: 'shipping',
        description: 'Use for general shipping timeline questions',
        variables: ['customer_name'],
        template: `Hi {{customer_name}},

Great question about our shipping timelines!

**Standard Shipping:**
- Processing: 1-2 business days
- Transit: 5-7 business days
- Total: 6-9 business days from order placement

**Expedited Shipping:**
- Processing: 1 business day
- Transit: 2-3 business days
- Total: 3-4 business days from order placement

Orders placed before 2 PM EST ship the same business day. Weekend orders ship on Monday.

Would you like to know about a specific order, or do you have other questions?

Best regards,  
HotDash Support Team`,
        tone: 'informative',
        needsApproval: false,
        tags: ['shipping', 'timeline', 'faq'],
    },
    {
        id: 'shipping_international',
        name: 'Shipping - International',
        category: 'shipping',
        description: 'Use for international shipping inquiries',
        variables: ['customer_name', 'country'],
        template: `Hi {{customer_name}},

Thanks for your interest in international shipping to {{country}}!

**International Shipping Details:**
- Processing: 1-2 business days
- Transit: 10-21 business days (varies by destination)
- Tracking: Full tracking provided
- Customs: Customer responsible for duties/taxes

**Important:** Delivery timelines can vary due to customs clearance. We recommend allowing 3-4 weeks for delivery to ensure you receive your order in time.

Would you like to proceed with an international order, or do you have other questions?

Best regards,  
HotDash Support Team`,
        tone: 'informative',
        needsApproval: false,
        tags: ['shipping', 'international', 'customs'],
    },
    {
        id: 'shipping_address_change',
        name: 'Shipping - Address Change Request',
        category: 'shipping',
        description: 'Use when customer wants to change shipping address',
        variables: ['customer_name', 'order_number', 'order_status'],
        template: `Hi {{customer_name}},

I'd be happy to help with updating the shipping address for order {{order_number}}.

**Current Status:** {{order_status}}

{{if order_status === 'processing'}}
Good news! Since your order hasn't shipped yet, I can update the address. Please provide the new shipping address and I'll make the change immediately.
{{/if}}

{{if order_status === 'shipped'}}
Unfortunately, once an order has shipped, we cannot redirect it. However, here are your options:

1. **Contact the carrier** directly with tracking number to request delivery reroute
2. **Refuse delivery** and we'll send replacement to new address  
3. **Have someone at current address** forward the package

Which option works best for you?
{{/if}}

Best regards,  
HotDash Support Team`,
        tone: 'professional',
        needsApproval: true, // Address changes need verification
        tags: ['shipping', 'address_change', 'modification'],
    },
    // ========================================
    // RETURNS & REFUNDS TEMPLATES (3)
    // ========================================
    {
        id: 'return_policy',
        name: 'Return Policy - General Info',
        category: 'returns',
        description: 'Use for general return policy questions',
        variables: ['customer_name'],
        template: `Hi {{customer_name}},

I'm happy to explain our return policy!

**Return Window:** 30 days from delivery date  
**Condition:** Items must be unworn, unwashed, with original tags  
**Process:**
1. Initiate return through your account dashboard
2. Print prepaid return label
3. Ship within 7 days of label creation
4. Refund processed within 5-7 business days of receipt

**Note:** Original shipping costs are non-refundable. Return shipping is free with our prepaid label.

Would you like to start a return for a specific order?

Best regards,  
HotDash Support Team`,
        tone: 'informative',
        needsApproval: false,
        tags: ['returns', 'policy', 'faq'],
    },
    {
        id: 'refund_initiate',
        name: 'Refund - Initiate Process',
        category: 'returns',
        description: 'Use to initiate refund for eligible return',
        variables: ['customer_name', 'order_number', 'refund_amount', 'refund_method', 'processing_days'],
        template: `Hi {{customer_name}},

I've initiated a refund for order {{order_number}}.

**Refund Details:**
- Amount: {{refund_amount}}
- Method: {{refund_method}}
- Processing Time: {{processing_days}} business days

You'll receive a confirmation email shortly. The refund will appear on your statement as "HOTDASH REFUND - {{order_number}}".

Is there anything else I can help you with?

Best regards,  
HotDash Support Team`,
        tone: 'professional',
        needsApproval: true, // Refunds require approval
        tags: ['refund', 'initiated', 'confirmation'],
    },
    {
        id: 'exchange_process',
        name: 'Exchange - Start Process',
        category: 'returns',
        description: 'Use for product exchange requests',
        variables: ['customer_name', 'order_number', 'original_item', 'exchange_item'],
        template: `Hi {{customer_name}},

I'd be happy to help you exchange {{original_item}} for {{exchange_item}}!

**Exchange Process:**
1. I'll create a return label for {{original_item}}
2. Once we receive the return (typically 5-7 days), we'll process your exchange
3. {{exchange_item}} will ship immediately upon receipt
4. You'll receive tracking for the new item

**Timeline:** Expect your exchange to arrive approximately 10-14 days from today.

Would you like me to proceed with this exchange?

Best regards,  
HotDash Support Team`,
        tone: 'professional',
        needsApproval: true, // Exchanges require approval
        tags: ['exchange', 'size_swap', 'product_swap'],
    },
    // ========================================
    // ACCOUNT MANAGEMENT TEMPLATES (2)
    // ========================================
    {
        id: 'password_reset',
        name: 'Account - Password Reset Help',
        category: 'account',
        description: 'Use when customer needs password reset help',
        variables: ['customer_name', 'email'],
        template: `Hi {{customer_name}},

I can help you reset your password right away!

**Steps:**
1. Go to our login page
2. Click "Forgot Password?"
3. Enter your email: {{email}}
4. Check your inbox for reset link (arrives within 5 minutes)
5. Click the link and create new password

**Didn't receive the email?**
- Check your spam/junk folder
- Verify email address is correct
- If still not received after 10 minutes, reply here and I'll resend

Let me know if you need any other assistance!

Best regards,  
HotDash Support Team`,
        tone: 'professional',
        needsApproval: false,
        tags: ['account', 'password_reset', 'login'],
    },
    {
        id: 'account_deletion',
        name: 'Account - Deletion Request',
        category: 'account',
        description: 'Use for GDPR account deletion requests',
        variables: ['customer_name', 'email'],
        template: `Hi {{customer_name}},

I understand you'd like to delete your account.

**Before we proceed, please know:**
- This action is permanent and cannot be undone
- All order history will be deleted
- You'll lose any saved payment methods and addresses
- Active orders will still be fulfilled but history won't be accessible

**To proceed:**
I've escalated your request to our data team. They'll process your deletion within 7 business days per GDPR requirements and send confirmation to {{email}}.

**Changed your mind?** Just reply within 24 hours and we'll cancel this request.

Is there anything else I can help you with?

Best regards,  
HotDash Support Team`,
        tone: 'professional',
        needsApproval: true, // GDPR requests need proper handling
        tags: ['account', 'deletion', 'gdpr', 'privacy'],
    },
    // ========================================
    // PRODUCT QUESTIONS TEMPLATES (2)
    // ========================================
    {
        id: 'product_availability',
        name: 'Product - Stock Availability',
        category: 'product',
        description: 'Use when customer asks if product is in stock',
        variables: ['customer_name', 'product_name', 'availability_status', 'restock_date'],
        template: `Hi {{customer_name}},

Thanks for your interest in {{product_name}}!

**Availability:** {{availability_status}}

{{if availability_status === 'In Stock'}}
Great news - this item is currently available! You can order now and it will ship within 1-2 business days.
{{/if}}

{{if availability_status === 'Out of Stock'}}
This item is currently out of stock but will be restocked on {{restock_date}}. Would you like me to:

1. **Notify you** when it's back in stock (via email)
2. **Suggest similar items** currently available
3. **Pre-order** for {{restock_date}} delivery

Let me know how I can help!
{{/if}}

Best regards,  
HotDash Support Team`,
        tone: 'informative',
        needsApproval: false,
        tags: ['product', 'availability', 'stock', 'restock'],
    },
    {
        id: 'product_specifications',
        name: 'Product - Specifications Request',
        category: 'product',
        description: 'Use when customer asks for product details/specs',
        variables: ['customer_name', 'product_name', 'key_specs'],
        template: `Hi {{customer_name}},

I'd be happy to provide details about {{product_name}}!

**Key Specifications:**
{{key_specs}}

**Additional Information:**
- Full product description available on the product page
- Customer reviews can provide real-world insights
- Comparison guides available in our blog

Is there a specific aspect of {{product_name}} you'd like to know more about?

Best regards,  
HotDash Support Team`,
        tone: 'informative',
        needsApproval: false,
        tags: ['product', 'specifications', 'details'],
    },
    // ========================================
    // ESCALATION TEMPLATES (2)
    // ========================================
    {
        id: 'escalate_supervisor',
        name: 'Escalation - To Supervisor',
        category: 'escalation',
        description: 'Use when escalating to L2 supervisor',
        variables: ['customer_name', 'escalation_reason', 'ticket_number'],
        template: `Hi {{customer_name}},

I understand this situation requires additional attention. I'm escalating your case to our supervisor team for immediate review.

**Escalation Reason:** {{escalation_reason}}  
**Reference Number:** {{ticket_number}}

A supervisor will review your case and respond within 2 hours during business hours (9 AM - 6 PM EST, Monday-Friday).

Thank you for your patience as we work to resolve this properly.

Best regards,  
HotDash Support Team`,
        tone: 'professional',
        needsApproval: true, // Escalations should be verified
        tags: ['escalation', 'supervisor', 'l2'],
    },
    {
        id: 'escalate_technical',
        name: 'Escalation - To Technical Support',
        category: 'escalation',
        description: 'Use for technical issues beyond operator scope',
        variables: ['customer_name', 'issue_description', 'ticket_number'],
        template: `Hi {{customer_name}},

Thank you for providing those details about {{issue_description}}.

This appears to be a technical issue that requires our engineering team's expertise. I've escalated your case to our technical support specialists.

**Reference Number:** {{ticket_number}}

Our technical team will investigate and respond within 4 business hours with either:
- A solution you can implement immediately
- Scheduled fix with timeline
- Alternative workaround while we resolve

Thank you for your patience!

Best regards,  
HotDash Support Team`,
        tone: 'professional',
        needsApproval: true,
        tags: ['escalation', 'technical', 'engineering'],
    },
    // ========================================
    // TECHNICAL SUPPORT TEMPLATES (2)
    // ========================================
    {
        id: 'tech_browser_compatibility',
        name: 'Technical - Browser Compatibility',
        category: 'technical',
        description: 'Use for browser-related issues',
        variables: ['customer_name'],
        template: `Hi {{customer_name}},

I can help troubleshoot this technical issue!

**Recommended Browsers:**
- Chrome/Edge (version 90+)
- Firefox (version 88+)
- Safari (version 14+)

**Quick Fixes:**
1. **Clear cache and cookies** - Often resolves display issues
2. **Try incognito/private mode** - Tests if extension is interfering
3. **Update browser** - Ensure you're on latest version
4. **Disable ad blockers** - Sometimes blocks required scripts

Please try these steps and let me know if the issue persists. If problems continue, I'll escalate to our technical team.

Best regards,  
HotDash Support Team`,
        tone: 'informative',
        needsApproval: false,
        tags: ['technical', 'browser', 'troubleshooting'],
    },
    {
        id: 'tech_payment_declined',
        name: 'Technical - Payment Declined',
        category: 'technical',
        description: 'Use when customer reports payment failure',
        variables: ['customer_name', 'payment_method_type'],
        template: `Hi {{customer_name}},

I'm sorry you're experiencing issues with payment processing.

**Common Causes for {{payment_method_type}} Declines:**
1. **Insufficient funds** - Check account balance
2. **Incorrect billing address** - Must match card on file
3. **Card expired** - Verify expiration date
4. **Bank security hold** - Contact your bank to authorize
5. **Daily limit reached** - Try again in 24 hours

**To Resolve:**
- Verify all payment details are correct
- Try a different payment method
- Contact your bank to ensure transaction isn't blocked
- Clear browser cache and try again

If you've verified all details and still can't complete payment, please reply and I'll investigate further on our end.

Best regards,  
HotDash Support Team`,
        tone: 'empathetic',
        needsApproval: false,
        tags: ['technical', 'payment', 'declined', 'troubleshooting'],
    },
    // ========================================
    // ACKNOWLEDGMENT TEMPLATES (2)
    // ========================================
    {
        id: 'ack_delay',
        name: 'Acknowledgment - Need Time to Research',
        category: 'acknowledgment',
        description: 'Use when you need time to investigate before full response',
        variables: ['customer_name', 'estimated_response_time'],
        template: `Hi {{customer_name}},

Thank you for reaching out! I've received your message and I'm looking into this for you.

I want to make sure I provide you with complete and accurate information, so I need about {{estimated_response_time}} to research your question thoroughly.

I'll follow up with you by then with a detailed response.

Thank you for your patience!

Best regards,  
HotDash Support Team`,
        tone: 'professional',
        needsApproval: false,
        tags: ['acknowledgment', 'delay', 'research'],
    },
    {
        id: 'follow_up',
        name: 'Follow-up - After Initial Response',
        category: 'acknowledgment',
        description: 'Use for follow-up messages after initial inquiry',
        variables: ['customer_name', 'previous_topic'],
        template: `Hi {{customer_name}},

I'm following up on your question about {{previous_topic}}.

{{follow_up_content}}

Has this resolved your question, or is there anything else I can help clarify?

Best regards,  
HotDash Support Team`,
        tone: 'professional',
        needsApproval: false,
        tags: ['follow_up', 'continuation'],
    },
    // ========================================
    // APOLOGY TEMPLATES (2)
    // ========================================
    {
        id: 'apology_error',
        name: 'Apology - Our Mistake',
        category: 'apology',
        description: 'Use when HotDash made an error',
        variables: ['customer_name', 'error_description', 'resolution'],
        template: `Hi {{customer_name}},

I sincerely apologize for {{error_description}}. This is not the experience we want you to have with HotDash.

**What we're doing to fix it:**
{{resolution}}

**To make this right:**
We'd like to offer you [specific compensation based on severity]. This will be automatically applied to your account.

Thank you for bringing this to our attention and for your patience as we resolve this.

Best regards,  
HotDash Support Team`,
        tone: 'apologetic',
        needsApproval: true, // Apologies with compensation need approval
        tags: ['apology', 'error', 'compensation'],
    },
    {
        id: 'apology_delay',
        name: 'Apology - Delayed Response',
        category: 'apology',
        description: 'Use when our response time exceeded SLA',
        variables: ['customer_name'],
        template: `Hi {{customer_name}},

I apologize for the delay in getting back to you. Your time is valuable, and you deserve a prompt response.

I'm here now and ready to help resolve your question. Let me catch up on your issue and provide a thorough response.

{{main_response_content}}

Thank you for your patience, and please don't hesitate to reach out if you have any other questions.

Best regards,  
HotDash Support Team`,
        tone: 'apologetic',
        needsApproval: false,
        tags: ['apology', 'delay', 'sla_breach'],
    },
    // ========================================
    // CLOSURE TEMPLATES (2)
    // ========================================
    {
        id: 'resolution_confirm',
        name: 'Closure - Confirm Resolution',
        category: 'closure',
        description: 'Use to confirm issue is resolved before closing',
        variables: ['customer_name'],
        template: `Hi {{customer_name}},

I'm glad I could help resolve your question!

Before I close this conversation, I just want to confirm:
- Is everything working as expected now?
- Do you have any other questions?
- Is there anything else I can help with?

If I don't hear back within 24 hours, I'll assume everything is resolved and close this ticket. You can always reach out again if you need anything!

Best regards,  
HotDash Support Team`,
        tone: 'professional',
        needsApproval: false,
        tags: ['closure', 'resolution', 'confirmation'],
    },
    {
        id: 'no_response_close',
        name: 'Closure - No Customer Response',
        category: 'closure',
        description: 'Use when closing due to customer inactivity',
        variables: ['customer_name', 'days_inactive'],
        template: `Hi {{customer_name}},

I'm closing this conversation as I haven't heard back from you in {{days_inactive}} days.

If you still need assistance, feel free to reply to this message or start a new conversation anytime. We're always here to help!

Thank you for choosing HotDash!

Best regards,  
HotDash Support Team`,
        tone: 'professional',
        needsApproval: false,
        tags: ['closure', 'inactive', 'auto_close'],
    },
    // ========================================
    // EDGE CASE TEMPLATES (2)
    // ========================================
    {
        id: 'fraud_suspected',
        name: 'Security - Suspected Fraud (Internal Use)',
        category: 'security',
        description: 'Internal note template for suspected fraud cases',
        variables: ['order_number', 'fraud_indicators', 'action_taken'],
        template: `**INTERNAL NOTE - DO NOT SEND TO CUSTOMER**

**Suspected Fraud Alert**

Order: {{order_number}}  
Indicators: {{fraud_indicators}}  
Action Taken: {{action_taken}}

Escalated to L2 security team for review. Continue professional interaction with customer while investigation pending.

DO NOT mention fraud suspicion to customer.`,
        tone: 'professional',
        needsApproval: true, // Security issues need supervisor review
        tags: ['fraud', 'security', 'internal'],
    },
    {
        id: 'vip_customer',
        name: 'VIP - Priority Handling',
        category: 'vip',
        description: 'Use for VIP customer interactions',
        variables: ['customer_name', 'vip_tier'],
        template: `Hi {{customer_name}},

Thank you for reaching out - we appreciate your continued loyalty as a {{vip_tier}} customer!

{{main_response_content}}

As a valued customer, please know that:
- Your request is being prioritized
- A supervisor is monitoring this conversation
- We're committed to resolving this to your complete satisfaction

Is there anything else we can do for you today?

Best regards,  
HotDash VIP Support Team`,
        tone: 'professional',
        needsApproval: false,
        tags: ['vip', 'priority', 'loyalty'],
    },
];
/**
 * Utility: Render template with variables
 */
export function renderTemplate(template, variables) {
    let rendered = template;
    // Replace {{variable}} placeholders
    for (const [key, value] of Object.entries(variables)) {
        const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        rendered = rendered.replace(placeholder, value);
    }
    // Handle conditional blocks (simple if/endif)
    // Note: This is basic - consider using a proper template engine for production
    rendered = rendered.replace(/\{\{if [^}]+\}\}[\s\S]*?\{\{\/if\}\}/g, '');
    return rendered.trim();
}
/**
 * Utility: Find templates by category
 */
export function getTemplatesByCategory(category) {
    return templates.filter(t => t.category === category);
}
/**
 * Utility: Find templates by tag
 */
export function getTemplatesByTag(tag) {
    return templates.filter(t => t.tags.includes(tag));
}
/**
 * Utility: Get template by ID
 */
export function getTemplateById(id) {
    return templates.find(t => t.id === id);
}
/**
 * Export counts for monitoring
 */
export const templateStats = {
    total: templates.length,
    by_category: {
        order_status: templates.filter(t => t.category === 'order_status').length,
        shipping: templates.filter(t => t.category === 'shipping').length,
        returns: templates.filter(t => t.category === 'returns').length,
        account: templates.filter(t => t.category === 'account').length,
        product: templates.filter(t => t.category === 'product').length,
        escalation: templates.filter(t => t.category === 'escalation').length,
        technical: templates.filter(t => t.category === 'technical').length,
        acknowledgment: templates.filter(t => t.category === 'acknowledgment').length,
        apology: templates.filter(t => t.category === 'apology').length,
        closure: templates.filter(t => t.category === 'closure').length,
        security: templates.filter(t => t.category === 'security').length,
        vip: templates.filter(t => t.category === 'vip').length,
    },
    requires_approval: templates.filter(t => t.needsApproval).length,
};
//# sourceMappingURL=index.js.map