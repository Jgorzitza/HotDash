---
epoch: 2025.10.E1
doc: docs/chatwoot/email_templates_and_signatures.md
owner: chatwoot
created: 2025-10-13
purpose: Email signatures and canned responses for Hot Rod AN customer support
category: configuration
---

# Email Signatures & Canned Responses for Hot Rod AN

**Purpose**: Professional email signature and quick-response templates  
**For**: customer.support@hotrodan.com Chatwoot inbox  
**Created**: 2025-10-13T14:15:00Z

---

## 📧 Email Signature

### Standard Signature

```
Best regards,
Hot Rod AN Customer Support

──────────────────────────
Hot Rod AN LLC
Premium AN Fittings & Fuel System Components
www.hotrodan.com
Email: customer.support@hotrodan.com

🏎️ Trusted by hot rod builders since [YEAR]
──────────────────────────
```

### HTML Signature (if supported)

```html
<div style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
  <p style="margin: 0 0 12px 0;">Best regards,<br/>
  <strong>Hot Rod AN Customer Support</strong></p>
  
  <div style="border-top: 2px solid #D32F2F; padding-top: 12px; margin-top: 12px;">
    <p style="margin: 0; font-size: 13px;">
      <strong style="color: #D32F2F;">Hot Rod AN LLC</strong><br/>
      Premium AN Fittings & Fuel System Components<br/>
      <a href="https://www.hotrodan.com" style="color: #1976D2;">www.hotrodan.com</a><br/>
      Email: customer.support@hotrodan.com
    </p>
    <p style="margin: 8px 0 0 0; font-size: 12px; color: #666;">
      🏎️ Trusted by hot rod builders
    </p>
  </div>
</div>
```

---

## 📝 Canned Responses (Chatwoot Templates)

### 1. Shipping Timeframe

**Short Code**: `/shipping`

**Template**:
```
Thanks for your order! Most orders ship within 1-2 business days. Once shipped, you'll receive a tracking number via email.

Standard shipping typically takes 3-5 business days. Expedited shipping options are available at checkout if you need your parts sooner.

Need it for a deadline? Let us know and we'll do our best to prioritize your order!
```

---

### 2. AN Sizing Help

**Short Code**: `/sizing`

**Template**:
```
Happy to help with AN fitting sizing!

AN fittings use a dash size system - here's the quick conversion:
• AN-4 = 1/4 inch
• AN-6 = 3/8 inch (most common for street hot rods)
• AN-8 = 1/2 inch
• AN-10 = 5/8 inch
• AN-12 = 3/4 inch

Formula: Divide the AN dash number by 16 to get inches.

For your application, can you tell me:
1. What engine/horsepower?
2. Carburetor or fuel injection?
3. Mechanical or electric fuel pump?

This will help me recommend the perfect sizing!
```

---

### 3. Return Policy

**Short Code**: `/returns`

**Template**:
```
We accept returns within 30 days of purchase for unused items in original packaging.

Return Process:
1. Email us with your order number
2. We'll provide a return authorization and shipping label
3. Ship the items back (we cover return shipping for defects)
4. Refund processed within 3-5 business days of receipt

Items must be unused and in resalable condition. AN fittings that have been installed cannot be returned for health and safety reasons.

Need to exchange for a different size? We're happy to help with that!
```

---

### 4. Technical Support Escalation

**Short Code**: `/technical`

**Template**:
```
For technical fitment questions, we recommend consulting with our technical specialist who can provide personalized guidance for your specific application.

Our tech specialist can help with:
• Complex fuel system design
• High-horsepower applications (500+ HP)
• Racing applications (drag, road race, off-road)
• Specialized fuels (E85, methanol, etc.)
• Custom fabrication projects

Would you like me to have our technical specialist reach out to you? If so, please provide:
1. Phone number (best way to reach you)
2. Brief description of your project
3. Any specific technical questions

We'll have them contact you within 24 hours!
```

---

### 5. Order Status Inquiry

**Short Code**: `/orderstatus`

**Template**:
```
I'd be happy to check your order status! 

Can you provide your:
• Order number (starts with #), OR
• Email address used for the order

Once I have that, I'll pull up your order details and let you know exactly where it is in the fulfillment process.
```

---

### 6. Installation Help

**Short Code**: `/installation`

**Template**:
```
We're here to help with your AN fitting installation!

For step-by-step guidance, check out our installation guide: [LINK TO GUIDE]

Quick tips:
• No thread sealant needed - AN fittings use 37° flare seal
• Hand-tight plus 1/4 to 1/2 turn with wrench
• Use two wrenches to prevent twisting hose
• Pressure test before final installation

Having a specific installation issue? Let me know what's happening and I'll walk you through it!
```

---

### 7. Warranty Information

**Short Code**: `/warranty`

**Template**:
```
All Hot Rod AN products are covered by our quality guarantee:

• Lifetime warranty against manufacturing defects
• 30-day satisfaction guarantee (unused items)
• Free replacement for defective fittings
• No-hassle warranty claims

If you believe you have a defective product:
1. Send photos of the issue
2. Include your order number
3. Describe what happened

We'll process a replacement immediately if it's a manufacturing defect.

Note: Warranty doesn't cover damage from improper installation, over-tightening, or incompatible applications.
```

---

### 8. Compatibility Question

**Short Code**: `/compat`

**Template**:
```
Great question about compatibility! AN fittings are standardized, but there are some important considerations:

For your specific application, can you provide:
• What are you connecting? (carburetor, fuel pump, filter, etc.)
• Thread type on the component? (NPT, ORB, or already AN?)
• Hose type you're using? (braided stainless, push-lock, PTFE)

This will help me confirm compatibility and recommend any adapters you might need!

General rule: AN-to-AN connections are universal. Connecting to NPT or ORB threads requires an adapter.
```

---

### 9. After Hours Message

**Short Code**: `/afterhours`

**Template**:
```
Thanks for reaching out to Hot Rod AN!

Our support team is currently offline but we'll respond to your message within 24 hours during business hours.

Business Hours: Monday-Friday, 8:00 AM - 6:00 PM EST

In the meantime, you might find these resources helpful:
• AN Fittings Sizing Guide: [LINK]
• Installation Instructions: [LINK]
• FAQ: [LINK]

For urgent technical support, please call: [PHONE if available]

We appreciate your patience and look forward to helping you with your build!
```

---

### 10. First Contact Welcome

**Short Code**: `/welcome`

**Template**:
```
Welcome to Hot Rod AN! 🏎️

Thanks for reaching out - we're here to help with all your AN fitting and fuel system questions!

Whether you're:
• Sizing fittings for a new build
• Troubleshooting an installation
• Looking for technical guidance
• Checking on an order

...we've got you covered!

What can I help you with today?
```

---

## 🔧 Configuration in Chatwoot

### How to Add Canned Responses

**Steps**:
1. Log into Chatwoot dashboard
2. Navigate to: Settings → Canned Responses
3. Click: "Add Canned Response"
4. Enter:
   - Short Code: `/shipping`
   - Content: [paste template above]
5. Save
6. Repeat for all 10 templates

**Usage by Operators**:
- Type `/` in message box
- List of canned responses appears
- Select template
- Customize as needed
- Send

---

### How to Configure Email Signature

**Steps**:
1. Navigate to: Settings → Inboxes
2. Select: "Hot Rod AN Customer Support" inbox
3. Click: "Settings" tab
4. Find: "Email Signature" field
5. Paste: Signature template (HTML or plain text)
6. Save changes

**Test**:
- Send test email from Chatwoot
- Verify signature appears at bottom
- Check formatting is correct

---

## ✅ Configuration Checklist

**Canned Responses** (10 templates):
- [ ] Shipping timeframe (`/shipping`)
- [ ] AN sizing help (`/sizing`)
- [ ] Return policy (`/returns`)
- [ ] Technical support (`/technical`)
- [ ] Order status (`/orderstatus`)
- [ ] Installation help (`/installation`)
- [ ] Warranty info (`/warranty`)
- [ ] Compatibility (`/compat`)
- [ ] After hours (`/afterhours`)
- [ ] Welcome message (`/welcome`)

**Email Signature**:
- [ ] Plain text version configured
- [ ] HTML version configured (if supported)
- [ ] Signature appears in test email
- [ ] Formatting correct
- [ ] Links work (if HTML)

---

**Created**: 2025-10-13T14:15:00Z  
**Ready For**: Chatwoot dashboard configuration  
**Next**: Execute in web UI

