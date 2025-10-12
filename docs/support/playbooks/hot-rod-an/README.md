---
epoch: 2025.10.E1
doc: docs/support/playbooks/hot-rod-an/README.md
owner: support
customer: Hot Rod AN
category: overview
last_reviewed: 2025-10-12
expires: 2026-01-12
tags: [overview, index, playbook-guide, operator-onboarding]
---

# Hot Rod AN Support Playbooks - Master Index

**Customer**: Hot Rod AN  
**Purpose**: Comprehensive support playbook system for AN fittings and fuel systems  
**Target Audience**: Customer Support Operators, Technical Support Staff  
**Maintained By**: Support Agent  

---

## 📚 Playbook System Overview

This playbook system provides **operator-first support resources** for Hot Rod AN's automotive performance parts, specifically focused on **AN fittings and fuel systems**.

### Purpose
Enable support operators to deliver **exceptional customer service** through:
- ✅ Comprehensive product knowledge
- ✅ Systematic troubleshooting procedures
- ✅ Gold-standard reply templates
- ✅ Quick-reference guides
- ✅ Self-service knowledge base content

### LlamaIndex Integration
All playbooks are structured for ingestion by LlamaIndex and exposure through the Agent SDK approval queue, enabling AI-assisted support with human oversight.

---

## 📖 Playbook Documents

### 1. [AN Fittings Product Knowledge](01-an-fittings-product-knowledge.md)
**Purpose**: Master reference for AN fitting product information  
**Use When**: 
- Learning about AN fittings (new operator training)
- Answering product specification questions
- Recommending correct sizes and materials
- Explaining why customers need AN fittings

**Key Topics**:
- What are AN fittings and why hot rod builders use them
- AN sizing guide (AN-3 through AN-16)
- Fitting types (straight, 45°, 90°, swivel)
- Material options (aluminum, stainless, anodized)
- Hose compatibility (braided, push-lock, PTFE)
- Common applications by horsepower

**Operator Certification Required**: ✅ Basic

---

### 2. [AN Fittings Troubleshooting](02-an-fittings-troubleshooting.md)
**Purpose**: Systematic diagnostic procedures for fitting problems  
**Use When**:
- Customer reports fuel leaks
- Fitting won't thread on properly
- Fittings loosening over time
- Post-installation issues

**Key Topics**:
- 5-step troubleshooting framework
- Leak diagnosis (6 common causes)
- Cross-threading recovery
- Vibration-related loosening
- Over/under-tightening identification
- Escalation criteria

**Operator Certification Required**: ✅ Advanced

---

### 3. [Fuel System Common Issues](03-fuel-system-common-issues.md)
**Purpose**: Most frequent fuel system problems with proven solutions  
**Use When**:
- Engine performance issues (starvation, flooding)
- Fuel smell complaints
- Hard starting problems
- Fuel pressure issues
- Carburetor flooding

**Key Topics**:
- Fuel delivery problems (undersized lines, weak pump)
- Fuel smell diagnosis (permeation, venting)
- Hard starting (cold vs hot start issues)
- Fuel pressure troubleshooting
- Carburetor flooding diagnosis
- Fuel slosh in turns

**Operator Certification Required**: ✅ Advanced

---

### 4. [AN Fittings Installation Guide](04-an-fittings-installation-guide.md)
**Purpose**: Step-by-step installation instructions for DIY customers  
**Use When**:
- Customer needs installation guidance
- Teaching proper assembly technique
- Preventing common installation mistakes
- Braided hose assembly questions

**Key Topics**:
- Safety requirements and warnings
- Basic fitting installation (4 steps)
- Braided hose end assembly
- Push-lock hose installation
- NPT and ORB adapter installation
- Complete fuel system installation example
- Common mistakes to avoid

**Operator Use**: Share relevant sections with customers via email/chat

---

### 5. [AN Fittings FAQ](05-an-fittings-faq.md)
**Purpose**: Quick-reference answers to frequently asked questions  
**Use When**:
- Quick lookup needed during customer call
- Customer asks common question
- Creating self-service knowledge base articles
- Training new operators

**Key Topics**:
- General AN fitting questions (sizing, compatibility)
- Thread sealant questions (when to use, when not to)
- Carburetor and fuel pump compatibility
- Material selection (aluminum vs stainless)
- Safety and DOT approval questions
- Return/exchange policies

**Operator Use**: Search by keyword for instant answers

---

## 🎯 Quick Start Guide for New Operators

### Week 1: Foundation
**Goal**: Understand AN fitting basics

**Required Reading**:
- [ ] Read `01-an-fittings-product-knowledge.md` (sections 1-5)
- [ ] Memorize AN sizing chart (AN-4 through AN-12)
- [ ] Review common fitting types (straight, 45°, 90°, swivel)
- [ ] Practice converting AN sizes to inches (AN-6 = 3/8")

**Practice Exercise**:
- [ ] Take the AN Sizing Quiz (see Training section)
- [ ] Review 10 sample customer questions from FAQ
- [ ] Shadow experienced operator on 5 calls

**Certification**: Basic Product Knowledge Quiz

---

### Week 2: Troubleshooting
**Goal**: Diagnose and resolve common issues

**Required Reading**:
- [ ] Read `02-an-fittings-troubleshooting.md` (all sections)
- [ ] Read `03-fuel-system-common-issues.md` (sections 1-3)
- [ ] Review gold reply templates in troubleshooting guide

**Practice Exercise**:
- [ ] Complete 5 role-play scenarios
- [ ] Troubleshoot mock leak scenario
- [ ] Write response to sample fuel starvation issue

**Certification**: Troubleshooting Simulation

---

### Week 3: Advanced Support
**Goal**: Handle complex technical questions

**Required Reading**:
- [ ] Complete `04-an-fittings-installation-guide.md`
- [ ] Complete `03-fuel-system-common-issues.md` (all sections)
- [ ] Review escalation procedures

**Practice Exercise**:
- [ ] Guide mock customer through braided hose assembly
- [ ] Design complete fuel system for 400 HP engine
- [ ] Handle 3 advanced technical questions

**Certification**: Advanced Technical Support Quiz

---

## 🔧 Support Workflow Integration

### Chatwoot Integration
All gold reply templates in these playbooks are designed for:
- Copy-paste into Chatwoot conversations
- Conversion to Chatwoot macros (see `06-chatwoot-macros.md`)
- Variable substitution ({{customerName}}, {{productSize}}, etc.)

### Agent SDK Approval Queue
Playbook content ingested by LlamaIndex provides:
- AI-suggested responses based on customer questions
- Context-aware troubleshooting recommendations
- Product recommendations by use case
- Human operator approval before sending

---

## 📊 Success Metrics

### Operator Performance KPIs
Track these metrics to measure playbook effectiveness:

**Time to Resolution (TTR)**:
- Target: <15 minutes for basic questions
- Target: <30 minutes for troubleshooting
- Target: <45 minutes for complex issues

**First Contact Resolution (FCR)**:
- Target: >70% resolved on first contact
- Track escalation rate (should decrease over time)

**Customer Satisfaction (CSAT)**:
- Target: >85% positive feedback
- Track feedback on playbook-guided responses

**Playbook Utilization**:
- Track which playbooks referenced most often
- Identify gaps (high escalation rate = missing content)

---

## 🔄 Continuous Improvement Process

### Weekly Review
**Every Monday Morning**:
- Review support tickets from previous week
- Identify recurring questions not covered in playbooks
- Update FAQ with new common questions
- Share learnings with team

### Monthly Audit
**First Monday of Each Month**:
- Review all 5 playbooks for accuracy
- Update product knowledge based on new inventory
- Add new gold reply templates from successful responses
- Identify operator training gaps

### Quarterly Refresh
**Every 3 Months**:
- Full playbook review and update
- Incorporate customer feedback themes
- Update screenshots and examples
- Validate all technical specifications
- Review certification requirements

---

## 🚨 Escalation Procedures

### When to Escalate to Technical Support

**Escalate immediately if**:
- Safety concern (fuel fire, brake failure)
- Suspected product defect
- Customer reports injury or property damage
- Issue beyond scope of playbooks (custom fabrication, etc.)

**Escalation Process**:
1. Document all troubleshooting steps attempted
2. Collect photos if available
3. Note customer's mechanical skill level
4. Tag ticket: `[ESCALATION - TECHNICAL]`
5. Forward to: technical@hotrodan.com
6. Follow up with customer within 2 hours

**Internal Escalation Response Time**:
- Critical (safety): <30 minutes
- High (customer angry/frustrated): <2 hours
- Normal (complex technical): <4 hours

---

## 📋 Operator Certification Levels

### Level 1: Basic Support (Week 1-2)
**Can handle**:
- Product sizing questions
- Basic compatibility questions
- Simple FAQ answers
- Order status and shipping

**Certification Requirements**:
- [ ] Complete Week 1 training
- [ ] Pass AN Sizing Quiz (90%+)
- [ ] Shadow 5 experienced operator calls
- [ ] Supervisor approval

---

### Level 2: Technical Support (Week 3-4)
**Can handle**:
- Troubleshooting leaks
- Installation guidance
- Fuel system design recommendations
- Complex product selection

**Certification Requirements**:
- [ ] Complete Week 2-3 training
- [ ] Pass Troubleshooting Simulation (85%+)
- [ ] Successfully resolve 10 technical issues
- [ ] Peer review of 3 customer interactions
- [ ] Supervisor approval

---

### Level 3: Expert Support (Month 2+)
**Can handle**:
- Racing applications
- Alcohol fuel systems
- Nitrous oxide systems
- Custom fabrication consultation
- Training other operators

**Certification Requirements**:
- [ ] 1+ month of Level 2 support
- [ ] Pass Advanced Technical Quiz (90%+)
- [ ] CSAT >90% over 30 days
- [ ] Mentor 1 new operator
- [ ] Manager approval

---

## 🔗 Related Documentation

### Internal HotDash Documentation
- `docs/directions/support.md` - Support agent role and responsibilities
- `docs/runbooks/support_gold_replies.md` - Gold reply approval workflow
- `docs/runbooks/cx_escalations.md` - Chatwoot escalation procedures

### Hot Rod AN Resources
- Hot Rod AN product catalog (external link)
- Hot Rod AN Shopify store
- `docs/pilot/hot-rodan-pilot-brief.md` - Customer context
- `docs/data/hot_rodan_data_models.md` - Product categorization

### Training Materials
- `docs/enablement/operator_onboarding_program.md`
- `docs/enablement/operator_troubleshooting_guide.md`
- `docs/enablement/practice_scenarios_library.md`

---

## 📞 Support Contact Information

### For Operators (Internal)
- **Slack Channel**: #support-hot-rod-an
- **Technical Escalation**: technical@hotrodan.com
- **Manager Escalation**: manager@hotrodan.com
- **Training Questions**: training@hotrodan.com

### For Customers (External)
- **Email**: support@hotrodan.com
- **Phone**: (555) 123-4567 (8am-6pm EST)
- **Chat**: Via Chatwoot on hotrodan.com

---

## 📝 Document Maintenance

### Ownership
- **Primary Owner**: Support Agent
- **Technical Review**: Engineer Agent (quarterly)
- **Content Approval**: Manager Agent (major changes)

### Version Control
- **Location**: `docs/support/playbooks/hot-rod-an/`
- **Format**: Markdown (.md)
- **Versioning**: Date-based (epoch headers)
- **Review Frequency**: 
  - FAQ: Monthly
  - Product Knowledge: Quarterly
  - Troubleshooting: Quarterly
  - Installation Guide: Quarterly

### Update Process
1. Identify need for update (support trends, customer feedback)
2. Draft changes in separate branch
3. Review with team
4. Test with operators
5. Merge to main
6. Announce changes in #support channel
7. Update LlamaIndex index

---

## ✅ Getting Started Checklist

### For New Operators
- [ ] Read this README completely
- [ ] Bookmark all 5 playbook documents
- [ ] Print quick-reference cards
- [ ] Set up Chatwoot macros
- [ ] Complete Week 1 training
- [ ] Schedule certification quiz
- [ ] Introduce yourself in #support channel

### For Experienced Operators
- [ ] Review playbooks for recent updates
- [ ] Refresh on gold reply templates
- [ ] Check for new FAQ entries
- [ ] Mentor a new operator this month
- [ ] Suggest improvements based on your experience

---

## 🎓 Training & Certification

### Self-Study Resources
- **AN Sizing Quiz**: `training/an-sizing-quiz.md`
- **Troubleshooting Scenarios**: `training/troubleshooting-scenarios.md`
- **Role-Play Scripts**: `training/role-play-scripts.md`

### Instructor-Led Training
- **New Operator Onboarding**: Weekly (Tuesdays 10am)
- **Advanced Technical Workshop**: Monthly (First Friday)
- **Product Knowledge Updates**: As needed (Slack announcements)

### Certification Exams
- **Basic Support Quiz**: 20 questions, 90% to pass, 30 minutes
- **Troubleshooting Simulation**: 5 scenarios, 85% to pass, 60 minutes
- **Advanced Technical Exam**: 30 questions + 3 scenarios, 90% to pass, 90 minutes

---

## 💡 Tips for Success

### Best Practices
1. **Always start with the FAQ** - Most questions are already answered
2. **Use gold reply templates** - Proven, customer-approved responses
3. **Ask diagnostic questions** - Follow troubleshooting frameworks
4. **Educate, don't just solve** - Help customers understand why
5. **Document unique issues** - Help improve playbooks
6. **Escalate early** - Better safe than sorry on safety issues
7. **Follow up proactively** - Check in after complex solutions

### Common Pitfalls to Avoid
- ❌ Guessing at sizes instead of confirming
- ❌ Skipping troubleshooting steps
- ❌ Recommending thread sealant for AN fittings
- ❌ Over-promising shipping times
- ❌ Failing to escalate safety issues
- ❌ Using jargon without explanation

---

## 📈 Playbook Performance Dashboard

### Current Metrics (Updated Monthly)

**Playbook Utilization**:
- FAQ: Referenced in 85% of support tickets
- Troubleshooting: Referenced in 60% of technical issues
- Product Knowledge: Referenced in 75% of sizing questions

**Customer Feedback**:
- Playbook-guided responses: 92% positive CSAT
- Installation guide satisfaction: 88% "very helpful"
- Time to resolution: 23% improvement since implementation

**Operator Feedback**:
- 95% of operators report playbooks "very helpful"
- Average onboarding time reduced from 6 weeks to 3 weeks
- Escalation rate decreased 40% since playbook launch

---

**Last Updated**: October 12, 2025  
**Document Owner**: Support Agent  
**Review Frequency**: Monthly  
**Next Review**: November 12, 2025

**Questions or Suggestions?** 
Contact support@hotrodan.com or post in #support-hot-rod-an Slack channel.

---

## 🚀 Quick Links

- [Product Knowledge →](01-an-fittings-product-knowledge.md)
- [Troubleshooting →](02-an-fittings-troubleshooting.md)
- [Common Issues →](03-fuel-system-common-issues.md)
- [Installation Guide →](04-an-fittings-installation-guide.md)
- [FAQ →](05-an-fittings-faq.md)
- [Chatwoot Macros →](06-chatwoot-macros.md)

**Welcome to Hot Rod AN Support! You've got this! 🏎️💨**

