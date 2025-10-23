# HotDash Production Launch Guide

**Version**: 1.0  
**Date**: 2025-10-23  
**Owner**: Designer  
**Status**: Production Ready

---

## Overview

HotDash is your **Operator Control Center** - a centralized dashboard for managing metrics, inventory, customer experience, and growth operations for your Shopify store.

### Key Features

- 🎯 **Real-time Dashboard**: Live metrics across sales, inventory, CX, and growth
- 🤖 **AI-Powered CX**: Automated customer support with human-in-the-loop approval
- 📊 **Growth Analytics**: Social, SEO, and ads performance tracking
- 📦 **Inventory Management**: Smart reorder points and purchase order automation
- ✅ **Approval Queue**: Review and approve AI-generated actions before execution

---

## Quick Start

### 1. Access HotDash

Navigate to your HotDash dashboard:
```
https://hotdash.fly.dev
```

**Screenshot**: `docs/assets/tutorials/01-dashboard-overview.png`
- Shows main dashboard with all tiles
- Highlights navigation and key features

### 2. Dashboard Overview

The dashboard displays 8+ tiles organized by function:

**Operations Tiles**:
- Sales Pulse
- Fulfillment Health
- Inventory Heatmap
- CX Escalations

**Growth Tiles**:
- Social Performance
- SEO Impact
- Ads ROAS
- Growth Metrics

**Screenshot**: `docs/assets/tutorials/02-tile-layout.png`
- Annotated tile layout
- Status indicators explained

### 3. Tile Interactions

Each tile shows:
- **Status Icon**: Healthy (green), Attention (red), Unconfigured (gray)
- **Key Metrics**: Primary KPIs at a glance
- **Quick Facts**: 2-3 actionable insights
- **View Details**: Click to open modal with full data

**Screenshot**: `docs/assets/tutorials/03-tile-interaction.png`
- Hover states
- Click-to-modal flow

---

## Core Workflows

### Workflow 1: Reviewing Customer Escalations

**Purpose**: Review and approve AI-generated customer support replies

**Steps**:
1. Click **CX Escalations** tile
2. Review conversation history
3. Edit AI-suggested reply if needed
4. Grade response (tone, accuracy, policy)
5. Click **Approve & Send** or **Escalate**

**Screenshot**: `docs/assets/tutorials/04-cx-escalation-modal.png`
- Modal layout
- Grading sliders
- Action buttons

**Best Practices**:
- ✅ Always review PII (personally identifiable information) before sending
- ✅ Grade responses to improve AI accuracy
- ✅ Add internal notes for audit trail

### Workflow 2: Monitoring Inventory

**Purpose**: Track inventory levels and manage reorder points

**Steps**:
1. Click **Inventory Heatmap** tile
2. Review color-coded stock levels
3. Identify low-stock items (red/orange)
4. Click **Generate PO** for suggested reorders
5. Review and approve purchase order

**Screenshot**: `docs/assets/tutorials/05-inventory-heatmap.png`
- Heatmap visualization
- Low-stock alerts
- PO generation flow

**Best Practices**:
- ✅ Set reorder points based on lead time
- ✅ Review sales velocity before approving POs
- ✅ Monitor stockout risk daily

### Workflow 3: Tracking Growth Metrics

**Purpose**: Monitor social, SEO, and ads performance

**Steps**:
1. Click **Social Performance**, **SEO Impact**, or **Ads ROAS** tile
2. Review charts and trends
3. Analyze top performers
4. Export data if needed
5. Adjust campaigns based on insights

**Screenshot**: `docs/assets/tutorials/06-growth-analytics.png`
- Chart.js visualizations
- Data tables
- Export options

**Best Practices**:
- ✅ Check metrics daily for trends
- ✅ Compare week-over-week performance
- ✅ Act on underperforming campaigns quickly

---

## Approval Queue

### What is the Approval Queue?

The Approval Queue is your **command center** for reviewing AI-generated actions before they execute.

**Screenshot**: `docs/assets/tutorials/07-approval-queue.png`
- Queue layout
- Pending approvals
- Action types

### Approval Types

1. **Customer Replies**: AI-drafted responses to customer inquiries
2. **Inventory Actions**: Suggested purchase orders or stock adjustments
3. **Growth Actions**: Recommended social posts, SEO updates, or ad changes

### Approval Process

**For each pending action**:
1. Review evidence and rationale
2. Check projected impact
3. Verify rollback plan
4. Grade quality (if applicable)
5. Approve, Edit, or Reject

**Screenshot**: `docs/assets/tutorials/08-approval-detail.png`
- Evidence display
- Impact projection
- Rollback documentation

---

## Settings & Personalization

### Dashboard Customization

**Tile Visibility**:
- Show/hide tiles based on your role
- Reorder tiles via drag-and-drop
- Save custom layouts

**Screenshot**: `docs/assets/tutorials/09-settings-page.png`
- Settings tabs
- Tile visibility toggles
- Layout customization

### Notification Preferences

Configure alerts for:
- Critical inventory levels
- Urgent customer escalations
- Budget thresholds exceeded
- System health issues

**Screenshot**: `docs/assets/tutorials/10-notifications.png`
- Notification types
- Delivery channels
- Frequency settings

---

## Accessibility Features

HotDash is built to **WCAG 2.2 AA** standards:

- ✅ Keyboard navigation (Tab, Enter, Escape)
- ✅ Screen reader support (ARIA labels)
- ✅ High contrast mode
- ✅ Focus indicators
- ✅ Accessible color palettes

**Screenshot**: `docs/assets/tutorials/11-accessibility.png`
- Keyboard shortcuts
- Screen reader demo
- High contrast mode

---

## Troubleshooting

### Common Issues

**Issue**: Tiles not loading
- **Solution**: Check internet connection, refresh page
- **Evidence**: Network tab in DevTools

**Issue**: Approval button disabled
- **Solution**: Complete all required fields (evidence, rollback)
- **Evidence**: Validation errors shown in modal

**Issue**: Data not updating
- **Solution**: Verify SSE connection, check server status
- **Evidence**: Connection indicator in header

**Screenshot**: `docs/assets/tutorials/12-troubleshooting.png`
- Error states
- Connection status
- Debug tools

---

## Support & Resources

### Documentation
- **User Guide**: `docs/support/user-guide.md`
- **API Reference**: `docs/api/README.md`
- **Troubleshooting**: `docs/support/troubleshooting.md`

### Contact
- **Email**: support@hotrodan.com
- **Slack**: #hotdash-support
- **Status Page**: status.hotdash.fly.dev

### Training
- **Video Tutorials**: Available in dashboard help menu
- **Operator Training**: `docs/training/operator-checklist.md`
- **Admin Training**: `docs/training/admin-guide.md`

---

## Launch Checklist

### Pre-Launch (Complete)
- [x] All tiles implemented and tested
- [x] Approval queue functional
- [x] HITL workflow enforced
- [x] Accessibility verified (WCAG 2.2 AA)
- [x] Performance benchmarks met (P95 < 3s)
- [x] Security hardening complete

### Launch Day
- [ ] Announce to team
- [ ] Monitor error rates
- [ ] Track user adoption
- [ ] Collect feedback
- [ ] Address critical issues within 4 hours

### Post-Launch (Week 1)
- [ ] Daily metrics review
- [ ] User feedback analysis
- [ ] Performance optimization
- [ ] Documentation updates
- [ ] Training sessions

---

## Visual Assets

All production launch assets are located in:
- **Logos**: `public/assets/launch/hotdash-logo.svg`
- **Banners**: `public/assets/launch/announcement-banner.svg`
- **Screenshots**: `docs/assets/tutorials/*.png`
- **Help Visuals**: `docs/assets/help/*.svg`

---

**End of Production Launch Guide**

