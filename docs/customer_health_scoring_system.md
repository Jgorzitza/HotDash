# Customer Health Scoring System

**Version**: 1.0
**Date**: October 11, 2025  
**Owner**: Product Agent  
**Status**: Planned for Month 6 (Apr 2026)

---

## Overview

Automated system to score customer health based on usage, satisfaction, and engagement metrics. Enables proactive interventions to prevent churn and identify expansion opportunities.

**Health Score Range**: 0-100 (100 = perfect health, 0 = churning)

---

## Health Score Components

### 1. Usage Score (40% weight)

**Metrics**:
- Login frequency (daily = 10 pts, weekly = 7 pts, monthly = 3 pts)
- Tickets handled per month (vs baseline)
- Approval queue utilization (% of tickets using Agent SDK)
- Dashboard views (are they engaged with metrics?)

**Calculation Example**:
- Logins: 20 days/month → 10 pts
- Tickets: 5,500/month (vs 5,000 baseline) → 8 pts  
- Approval queue: 75% utilization → 9 pts
- Dashboard: 15 views/month → 8 pts
- **Total**: 35/40 pts (88%)

---

### 2. Satisfaction Score (30% weight)

**Metrics**:
- Operator satisfaction surveys (monthly NPS)
- Customer CSAT trend (improving or declining?)
- Support ticket sentiment (happy or frustrated?)
- Feature request volume (engaged = healthy)

**Calculation Example**:
- Operator NPS: +40 → 8 pts
- CSAT trend: +0.3 in 3 months → 9 pts
- Support sentiment: 90% positive → 9 pts
- Feature requests: 3 this month → 7 pts
- **Total**: 33/30 pts = 30 (capped)

---

### 3. Engagement Score (20% weight)

**Metrics**:
- Training completion rate
- Knowledge base updates (are they maintaining KB?)
- Community participation (Slack, forums)
- Response to outreach (emails, surveys)

**Calculation Example**:
- Training: 100% complete → 6 pts
- KB updates: 12 this month → 6 pts
- Community: Active in Slack → 5 pts
- Email response rate: 80% → 5 pts
- **Total**: 22/20 pts = 20 (capped)

---

### 4. Risk Indicators (10% weight, negative)

**Red Flags**:
- Late payments (-5 pts each)
- Support ticket volume spike (+50% = -3 pts)
- Angry support tickets (-2 pts each)
- Operator churn (lost 2+ operators = -5 pts)
- Usage decline (-20% in 30 days = -5 pts)

---

## Health Score Bands

**90-100: Thriving** (Green) 🟢
- Highly engaged, expanding usage
- **Action**: Upsell opportunities, case study candidates, referrals

**70-89: Healthy** (Green) 🟢
- Solid usage, satisfied
- **Action**: Nurture, check in quarterly, share tips

**50-69: At Risk** (Yellow) ⚠️
- Declining engagement or satisfaction
- **Action**: Proactive outreach, identify issues, offer training

**30-49: Churning** (Orange) 🟠
- Low usage, negative sentiment
- **Action**: Urgent intervention, executive escalation, win-back offer

**0-29: Critical** (Red) 🔴
- Imminent churn risk
- **Action**: Save deal (discount, custom plan) or prepare offboarding

---

## Automated Interventions

### Thriving Customers (90-100)

**Automated Actions**:
- Email: "You're a power user! Want to share your success story?"
- Offer: Early access to beta features
- Request: Referral to similar brands
- Upsell: Enterprise plan or add-on agents

---

### At-Risk Customers (50-69)

**Automated Actions**:
- Email: "We noticed usage dropped 20%. Need help?"
- Offer: Free training session
- Survey: "What can we improve?"
- Check-in: CSM schedules call

---

### Churning Customers (30-49)

**Urgent Actions**:
- Alert CSM immediately
- Executive outreach (CEO/VP email)
- Offer: 3 months free or custom discount
- Identify: Root cause (price, features, support?)

---

**Document Owner**: Product Agent  
**Status**: System Design Complete - Implementation Month 6

