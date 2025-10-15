# White-Label Strategy: Agency Partner Program

**Version**: 1.0
**Date**: October 11, 2025
**Owner**: Product Agent
**Status**: Future Strategy - Planned for Year 2 (2027)
**Timeline**: Launch Q1 2027

---

## Executive Summary

White-label HotDash for agencies who serve multiple e-commerce clients, enabling partners to rebrand Agent SDK as their own offering while we power the backend.

**Vision**: "Powered by HotDash" becomes the "Intel Inside" of AI support automation

**Revenue Model**: Partner revenue share (20% to HotDash, 80% to partner)

---

## Agency Partner Use Case

### Scenario: Digital Agency Serves 50 E-commerce Clients

**Agency Problem**:
- 50 clients all need customer support solutions
- Building custom AI support for each = expensive
- Selling competitors' tools = low margin
- Want to offer premium support automation

**White-Label Solution**:
- Agency rebrands HotDash as "AgencyName AI Support"
- Sells to clients at $1,499/month (vs our $999 direct)
- We power backend, agency handles customer relationships
- **Agency margin**: $500/month per client × 50 = $25,000/month
- **HotDash revenue**: $999/month × 50 = $49,950/month

**Win-Win**: Agency grows recurring revenue, we scale without direct sales

---

## White-Label Features

### What Partners Can Customize

**Branding**:
- Company name and logo
- Color scheme and design
- Domain (support.agencyname.com)
- Email templates (from their domain)
- Help documentation (co-branded)

**Features** (Same as HotDash):
- Agent SDK approval queue
- LlamaIndex knowledge base
- Multi-agent support
- Success metrics dashboards
- All core features

**What Partners CANNOT Customize**:
- Core AI (OpenAI/LlamaIndex)
- Security and compliance
- Infrastructure
- Source code (black box to end clients)

---

## Partner Program Tiers

### Tier 1: Certified Reseller

**Requirements**: 
- Sell HotDash as-is (HotDash branding)
- Minimum 5 customers
- Provide first-line support

**Benefits**:
- 20% commission on recurring revenue
- Partner portal access
- Co-marketing support
- Sales training

**Revenue Split**:
- Customer pays partner: $1,199/month
- Partner keeps: $240 (20%)
- Partner pays HotDash: $959 (80%)

---

### Tier 2: White-Label Partner

**Requirements**:
- Minimum 20 customers or $20K/month commitment
- Provide customer support
- Maintain brand standards

**Benefits**:
- Full white-label branding
- Custom domain
- Partner portal with analytics
- Priority support
- Quarterly business reviews

**Revenue Split**:
- Customer pays partner: $1,499/month
- Partner keeps: $500 (33%)
- Partner pays HotDash: $999 (67%)

---

### Tier 3: Strategic Partner

**Requirements**:
- Minimum 50 customers or $50K/month
- Co-development agreement
- Joint marketing campaigns

**Benefits**:
- White-label + custom features
- Dedicated account manager
- Early access to new features
- Co-branded case studies
- Conference sponsorship support

**Revenue Split**:
- Custom pricing per deal
- Typically 30-40% margin for partner

---

## Technical Implementation

### White-Label Architecture

```
┌─────────────────────────────────────────────────┐
│ Agency Partner Dashboard                        │
│ (partner.agencyname.com)                        │
├─────────────────────────────────────────────────┤
│ • Manage multiple client accounts               │
│ • View aggregate metrics across clients         │
│ • Billing and usage reports                     │
│ • Knowledge base templates (share across clients)│
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ Client 1: Acme Corp                             │
│ (support.acmecorp.com)                          │
│ - Branded with Acme's logo/colors               │
│ - Operators see "Acme Support Powered by        │
│   AgencyName"                                   │
│ - Knowledge base: Acme's policies               │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Client 2: Beta Shop                             │
│ (support.betashop.com)                          │
│ - Branded with Beta's logo/colors               │
│ - Separate tenant_id, complete data isolation   │
└─────────────────────────────────────────────────┘

                All powered by
         ┌─────────────────────────┐
         │ HotDash Backend (hidden)│
         │ • LlamaIndex            │
         │ • OpenAI GPT-4          │
         │ • Approval Queue        │
         │ • Multi-tenant DB       │
         └─────────────────────────┘
```

---

## Partner Revenue Model

### Example: Agency with 50 Clients

**Pricing to Clients**: $1,499/month per client
**Cost from HotDash**: $999/month per client
**Partner Margin**: $500/month per client

**Agency Monthly Revenue**:
- Gross: $1,499 × 50 = $74,950/month
- Cost: $999 × 50 = $49,950/month
- **Net margin**: $25,000/month ($300K/year)

**HotDash Monthly Revenue**:
- From this partner: $49,950/month
- **Annual**: $599,400

**Mutual Growth**: Agency builds recurring revenue, HotDash scales without direct sales team

---

## Partner Support Model

### Who Supports What?

**Partner Responsibilities**:
- First-line support for clients
- Knowledge base curation for each client
- Operator training and onboarding
- Customer success and retention
- Billing and invoicing

**HotDash Responsibilities**:
- Platform uptime and performance
- Backend infrastructure
- AI model updates and improvements
- Security and compliance
- Partner support portal

**Escalation Path**:
```
Client → Agency Support → Partner Portal → HotDash Engineering
```

**SLA**:
- Partner support to clients: Defined by partner
- HotDash support to partners: 4-hour response for Tier 2/3

---

## Go-to-Market Strategy

### Target Partners

**Ideal Partner Profile**:
- Digital agency or consultancy serving e-commerce brands
- 20-100+ clients (mostly mid-market e-commerce)
- Existing customer support services
- Technical capability (can train clients, provide support)

**Partner Verticals**:
1. **E-commerce Agencies** (Shopify Partners, WooCommerce developers)
2. **BPO/Outsourcing** (Customer support outsourcers)
3. **Consultancies** (CX consulting firms)
4. **Technology Integrators** (System integrators for retail)

---

## Partner Program Launch Plan

### Phase 1: Pilot Partners (Q1 2027)

**Goal**: Sign 3-5 pilot partners

**Offer**: 6 months free for first 20 clients each
**Support**: White-glove onboarding, dedicated account manager
**Deliverable**: Partner playbook, case studies

### Phase 2: Program Launch (Q2 2027)

**Goal**: Sign 20-30 partners

**Marketing**:
- Partner program website
- Agency pitch deck
- Co-marketing materials
- Conference presence

### Phase 3: Scale (Q3-Q4 2027)

**Goal**: 50+ active partners, 1,000+ indirect customers

**Enablement**:
- Partner certification program
- Self-service onboarding
- Partner community (Slack/forum)
- Annual partner summit

---

## Partner Enablement

### Partner Onboarding (Week 1)

**Day 1-2: Training**
- Product overview and demo (2 hours)
- Technical architecture (1 hour)
- Sales training (2 hours)
- Support procedures (1 hour)

**Day 3-4: Setup**
- Partner portal access
- White-label configuration
- First test client setup
- Knowledge base templates

**Day 5: Launch Prep**
- Sales materials review
- Pricing strategy alignment
- Go-to-market planning

### Ongoing Partner Support

**Resources**:
- Partner Slack channel
- Monthly partner webinars
- Quarterly business reviews
- Annual partner summit

**Success Metrics**:
- Partner NPS >50
- Partner churn <10%/year
- Avg clients per partner >15

---

**Document Owner**: Product Agent  
**Last Updated**: October 11, 2025  
**Status**: Future Strategy (Launch 2027)

