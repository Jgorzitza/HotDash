# HotDash Technical Glossary

**Version:** 1.0.0  
**Owner:** Localization  
**Last Updated:** 2025-10-12  
**Purpose:** Define technical terms used throughout HotDash documentation

---

## How to Use This Glossary

- **For Operators**: Reference when you see unfamiliar terms in the dashboard or documentation
- **For Developers**: Use these definitions when writing docs or UI copy
- **For New Team Members**: Read through during onboarding

---

## A

### Agent
An AI-powered assistant that helps automate customer support tasks. HotDash uses three specialized agents: Triage Agent, Order Support Agent, and Product Q&A Agent.

### Agent SDK
OpenAI's Agent Software Development Kit - the framework we use to build and run our AI agents. Handles conversations, tool calls, and approvals.

### AN Fitting
A type of threaded fitting used in automotive fuel and oil systems. "-6AN" refers to the size (9/16"-18 thread). Hot Rod AN specializes in these products.

### API (Application Programming Interface)
A way for different software systems to communicate with each other. For example, we use Shopify's API to access order data.

---

## C

### CRO (Conversion Rate Optimization)
The process of improving the percentage of website visitors who complete a desired action (like making a purchase).

###  CSAT (Customer Satisfaction Score)
A metric measuring customer happiness, typically on a scale of 1-5. Our target is >4.5/5.

### CX (Customer Experience)
The overall impression and feelings customers have when interacting with Hot Rod AN, including support interactions.

---

## E

### Edge Function
Code that runs at the "edge" (close to users) rather than on a central server. Provides faster response times.

---

## F

### First Contact Resolution (FCR)
When a customer's issue is completely solved in the first interaction, without needing follow-up.

---

## G

### GraphQL
A query language for APIs. More flexible than traditional REST APIs. Shopify uses GraphQL for their Admin API.

### GID (Global ID)
Shopify's unique identifier format. Example: `gid://shopify/Order/1234567890`

---

## L

### LlamaIndex
An AI framework for building search and retrieval systems. We use it for our product knowledge base (RAG).

---

## M

### MCP (Model Context Protocol)
A standardized way for AI tools to communicate with external services. We use MCP servers for Shopify, Supabase, GitHub, etc.

### Migration
A database script that changes the database structure (adds tables, columns, etc.). Tracked with version numbers like `20251012_enable_rls.sql`.

---

## N

### NPT (National Pipe Thread)
A U.S. standard for threaded pipe fittings. Common in automotive applications. Example: "3/8\" NPT"

---

## O

### Ops (Operations)
Day-to-day business activities. "Ops Pulse" tile shows key operational metrics.

---

## P

### P90 (90th Percentile)
A performance metric meaning "90% of requests are faster than this". Used for response time targets.

---

## R

### RAG (Retrieval-Augmented Generation)
An AI technique that looks up relevant information before generating responses. Helps agents give accurate answers based on our documentation.

### React Router
The routing library we use for navigation in the dashboard. Version 7 (RR7) is the current version.

### RLS (Row-Level Security)
Database security that controls which rows of data a user can see or modify. Prevents unauthorized data access.

### Runbook
Step-by-step instructions for handling specific situations (like incidents, deployments, or routine tasks).

---

## S

### SDK (Software Development Kit)
A collection of tools and code that helps developers build applications. Example: Shopify App SDK.

### SEO (Search Engine Optimization)
Techniques to improve visibility in search engines like Google. Higher SEO = more organic traffic.

### SLA (Service Level Agreement)
A commitment to respond or resolve within a specific timeframe. Example: "Respond to priority tickets within 2 hours"

### SKU (Stock Keeping Unit)
A unique product identifier. Example: "AN816-06-06BK" for a specific AN fitting.

### Supabase
Our database platform (PostgreSQL with added features). Stores orders, sessions, metrics, and more.

---

## T

### Tile
A dashboard card showing specific data or metrics. Example: "Sales Pulse" tile shows revenue data.

### Triage
The process of categorizing and prioritizing customer requests. Our Triage Agent classifies intent and routes to specialists.

---

## W

### Webhook
An automated message sent from one system to another when an event happens. Example: Chatwoot sends us a webhook when a customer sends a message.

### WoW (Week-over-Week)
Comparing this week's metric to last week's. Shows short-term trends. Example: "Sales up 15% WoW"

---

## Technical Term Quick Reference

### Acronyms by Category

**Performance Metrics:**
- P90 = 90th percentile response time
- WoW = Week-over-Week comparison
- CSAT = Customer Satisfaction Score
- FCR = First Contact Resolution

**Business Operations:**
- CX = Customer Experience
- CRO = Conversion Rate Optimization
- SKU = Stock Keeping Unit
- SLA = Service Level Agreement
- SEO = Search Engine Optimization
- Ops = Operations

**Technical Infrastructure:**
- API = Application Programming Interface
- SDK = Software Development Kit
- MCP = Model Context Protocol
- RLS = Row-Level Security
- RAG = Retrieval-Augmented Generation
- GID = Global ID (Shopify format)

**Automotive Specific:**
- AN = Army-Navy (fitting standard)
- NPT = National Pipe Thread

---

## Common Phrases Explained

### "All systems ready"
Status message meaning everything is working normally. Equivalent to "All clear" or "OK".

### "Engine trouble"
Our user-friendly way of saying "error" or "something went wrong". Fits the automotive theme.

### "Full speed ahead"
Confirmation message meaning the action was successful and things are proceeding normally.

### "Tune-up required"
Means the system needs configuration or setup before it can be used.

---

## Documentation Style Guide

### Writing About Technical Terms

**DO:**
- ✅ Define terms the first time they appear in a document
- ✅ Use the glossary link: "See [Glossary](../GLOSSARY.md#term-name)"
- ✅ Write out acronyms on first use: "Customer Satisfaction Score (CSAT)"
- ✅ Use plain language when possible

**DON'T:**
- ❌ Assume everyone knows technical jargon
- ❌ Use acronyms without defining them
- ❌ Mix multiple technical terms in one sentence without explanation
- ❌ Use industry jargon that customers wouldn't understand

### Examples

**❌ Bad (Too much jargon):**
```
The RAG-powered Agent SDK leverages MCP to query RLS-secured Supabase tables via GraphQL, 
ensuring P90 latency stays under SLA thresholds for optimal CX.
```

**✅ Good (Clear and explained):**
```
Our AI agents use a knowledge base (RAG) to look up information and answer customer 
questions accurately. The system connects to our secure database (Supabase) to fetch 
order details, ensuring fast response times (under 200ms for 90% of requests).
```

---

## Adding New Terms

**Process:**
1. Identify unfamiliar term in documentation
2. Add definition to appropriate alphabetical section
3. Include example if applicable
4. Add to Quick Reference if it's an acronym
5. Update "Last Updated" date at top of file

**Template:**
```markdown
### Term Name
Definition in plain English. [Include example if helpful]
```

---

## Feedback

**Found a term that needs clarification?**  
**Have a better definition?**

Create an issue or update this file directly:
- File: `docs/GLOSSARY.md`
- Owner: Localization team
- Review frequency: Monthly

---

**Last Updated:** 2025-10-12  
**Next Review:** 2025-11-12  
**Maintained by:** Localization

