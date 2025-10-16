# MCP Tools Usage Examples

Real-world examples of using MCP tools for common development tasks.

## GitHub MCP Examples

### Example 1: Create an Issue from Code Review
```
Prompt: "I found a bug in the authentication flow. Create a GitHub issue titled
'Fix authentication token refresh logic' with details about the race condition
in app/services/auth.server.ts"
```

### Example 2: List and Filter Pull Requests
```
Prompt: "Show me all open pull requests that have the label 'bug' and were
created in the last week"
```

### Example 3: Search for Deprecated Code
```
Prompt: "Search the entire repository for uses of the deprecated 'useOldAuth'
hook and list all files that need to be updated"
```

### Example 4: Check Workflow Status
```
Prompt: "What's the status of the latest CI/CD workflow run? Show me any
failed jobs and their error messages"
```

---

## Context7 Examples

### Example 1: Understand Component Dependencies
```
Prompt: "Use Context7 to show me all components that import or use the
UserContext provider, and explain how they're connected"
```

### Example 2: Find Related Code for Refactoring
```
Prompt: "I want to refactor the payment processing logic. Use Context7 to
find all files related to payment processing, including services, components,
and database queries"
```

### Example 3: Trace Data Flow
```
Prompt: "Trace how user data flows from the signup form through validation,
database storage, and email confirmation using Context7"
```

---

## Supabase MCP Examples

### Example 1: Query Recent Users
```
Prompt: "Query the Supabase users table to show all users who signed up in
the last 7 days, including their email and signup source"
```

### Example 2: Create a New Table
```
Prompt: "Create a new Supabase table called 'product_reviews' with columns:
id (uuid), product_id (uuid), user_id (uuid), rating (int), comment (text),
created_at (timestamp)"
```

### Example 3: Upload to Storage
```
Prompt: "Upload the file at ./public/assets/logo.png to the Supabase storage
bucket 'public-assets' under the path 'branding/logo.png'"
```

### Example 4: Deploy Edge Function
```
Prompt: "Deploy the edge function in supabase/functions/send-welcome-email
to production"
```

### Example 5: Run Migration
```
Prompt: "Run the pending Supabase migrations and show me the results"
```

---

## Fly.io MCP Examples

### Example 1: Deploy Application
```
Prompt: "Deploy the agent-service app to Fly.io production. Show me the
deployment progress and final status"
```

### Example 2: Check Application Health
```
Prompt: "Check the health status of all Fly.io apps in this project. Show
me which ones are running, their instance counts, and any errors"
```

### Example 3: View Recent Logs
```
Prompt: "Show me the last 100 log lines from the llamaindex-mcp-server app
on Fly.io, filtered for errors"
```

### Example 4: Scale Application
```
Prompt: "Scale the agent-service app to 3 instances in the primary region"
```

### Example 5: Check Resource Usage
```
Prompt: "Show me the CPU and memory usage for all Fly.io apps over the last hour"
```

---

## Shopify MCP Examples

### Example 1: Validate Liquid Template
```
Prompt: "Validate this Liquid template syntax:
{% if product.available %}
  <button>Add to Cart</button>
{% else %}
  <span>Out of Stock</span>
{% endif %}"
```

### Example 2: Create Product
```
Prompt: "Create a new Shopify product with title 'Premium Widget', price $29.99,
and add it to the 'Featured Products' collection"
```

### Example 3: Test Theme Component
```
Prompt: "Test the product card component in the Shopify theme to ensure it
properly displays product images, titles, and prices"
```

### Example 4: Query Products
```
Prompt: "Show me all Shopify products in the 'Summer Sale' collection that
are currently out of stock"
```

---

## Google Analytics MCP Examples

### Example 1: Get Page Views
```
Prompt: "Fetch Google Analytics data for page views over the last 30 days,
broken down by day"
```

### Example 2: Analyze Traffic Sources
```
Prompt: "Generate a report showing the top 10 traffic sources for the last
week, including sessions and conversion rates"
```

### Example 3: User Demographics
```
Prompt: "Show me the geographic distribution of users who visited the site
in the last month, grouped by country"
```

### Example 4: Conversion Funnel
```
Prompt: "Analyze the signup conversion funnel: landing page → signup form →
email verification → completed profile. Show drop-off rates at each step"
```

### Example 5: Campaign Performance
```
Prompt: "Compare the performance of all active marketing campaigns in Google
Analytics, showing clicks, conversions, and ROI"
```

---

---

## Chrome DevTools MCP Examples

### Example 1: Capture Console Errors
```
Prompt: "Use Chrome DevTools MCP to open the app, navigate to /app, and capture any console errors for 30 seconds. Return the error messages and stacks."
```

### Example 2: Record a Performance Trace
```
Prompt: "Record a 10-second performance trace while loading the dashboard route, then summarize long tasks (>50ms) and their sources."
```

### Example 3: Collect Network HAR
```
Prompt: "Capture a HAR of all network requests during a login flow (from /auth to /app). Highlight requests with status >= 400 and show timing breakdowns."
```

### Example 4: Inspect DOM State
```
Prompt: "Evaluate the DOM for the element #inventory-table, confirm it has at least 10 rows, and return any nodes with aria-invalid='true'."
```


## Combined Tool Examples

### Example 1: Bug Investigation Workflow
```
Prompt: "There's a bug with user authentication. Use Context7 to find all
auth-related code, check Supabase for recent failed login attempts, view
Fly.io logs for errors, and create a GitHub issue with all findings"
```

### Example 2: Feature Development Workflow
```
Prompt: "I want to add a product recommendation feature. Use Context7 to
understand the current product display code, query Supabase for user purchase
history, check Google Analytics for popular products, and create a GitHub
issue with the implementation plan"
```

### Example 3: Performance Optimization
```
Prompt: "Use Google Analytics to find the slowest pages, check Fly.io for
resource usage patterns, use Context7 to find the code responsible, and
create GitHub issues for optimization tasks"
```

### Example 4: E-commerce Sync
```
Prompt: "Fetch all products from Shopify, sync them to our Supabase database,
and create a Google Analytics event to track the sync operation"
```

### Example 5: Deployment Pipeline
```
Prompt: "Use GitHub to check if the latest PR has passed all tests, then
deploy to Fly.io staging, run smoke tests, and if successful, create a
production deployment issue"
```

---

## Advanced Patterns

### Pattern 1: Automated Code Review
```
Prompt: "For the latest PR on GitHub, use Context7 to analyze the changed
files, check if they follow our coding standards, verify database queries
are optimized in Supabase, and add review comments"
```

### Pattern 2: Data-Driven Decision Making
```
Prompt: "Use Google Analytics to identify our top 5 most visited pages,
query Supabase for user engagement metrics on those pages, and create a
GitHub issue with recommendations for improvements"
```

### Pattern 3: Incident Response
```
Prompt: "Check Fly.io for any apps with high error rates, view their logs,
use Context7 to find the relevant code, check Supabase for data integrity
issues, and create a GitHub incident report"
```

### Pattern 4: Theme Development
```
Prompt: "Validate all Liquid templates in the Shopify theme, use Context7
to find any hardcoded values that should be theme settings, and create
GitHub issues for each improvement"
```

### Pattern 5: Analytics-Driven Development
```
Prompt: "Use Google Analytics to find pages with high bounce rates, check
Supabase for user behavior data on those pages, use Context7 to review the
code, and create prioritized GitHub issues for UX improvements"
```

---

## Tips for Effective Prompts

### 1. Be Specific About the Tool
✅ "Use Supabase MCP to query..."
❌ "Check the database..."

### 2. Provide Context
✅ "In the agent-service app on Fly.io, check logs for errors in the last hour"
❌ "Check logs"

### 3. Specify Output Format
✅ "Show me a table of users with columns: email, signup_date, status"
❌ "Show me users"

### 4. Chain Operations Logically
✅ "First use Context7 to find the code, then create a GitHub issue with the findings"
❌ "Find code and make an issue"

### 5. Include Relevant Identifiers
✅ "Deploy the app with fly.toml in ./fly-apps/agent-service"
❌ "Deploy the app"

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Wrong Tool for the Job
Don't use GitHub code search when Context7 provides better semantic search

### ❌ Mistake 2: Missing Prerequisites
Don't try to deploy to Fly.io without checking if the app is configured

### ❌ Mistake 3: Vague Queries
"Get some data" → "Query the users table for accounts created today"

### ❌ Mistake 4: Ignoring Errors
Always check the response and handle errors appropriately

### ❌ Mistake 5: Not Verifying Results
After creating a GitHub issue, verify it was created successfully

---

## Next Steps

1. Try the basic examples above
2. Combine tools for more complex workflows
3. Create your own patterns for common tasks
4. Document successful workflows for your team
5. Share feedback on what works well

For more information, see:
- [SETUP.md](./SETUP.md) - Setup instructions
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Quick reference guide
- [mcp-config.json](./mcp-config.json) - Full configuration

