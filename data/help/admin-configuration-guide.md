# HotDash Admin Configuration Guide

**For System Administrators and Power Users**

This guide covers advanced configuration, user management, integrations, and system administration for HotDash.

---

## 🔧 Initial Setup

### Prerequisites
- Shopify store with Admin API access
- Supabase project (provided)
- Chatwoot account (optional but recommended)
- Google Analytics 4 property (optional)

### Environment Variables
Required environment variables (set in `.env` or hosting platform):

```bash
# Shopify
SHOPIFY_SHOP_DOMAIN=your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_xxxxx
SHOPIFY_API_KEY=xxxxx
SHOPIFY_API_SECRET=xxxxx

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx

# Chatwoot (optional)
CHATWOOT_API_URL=https://app.chatwoot.com
CHATWOOT_API_KEY=xxxxx
CHATWOOT_ACCOUNT_ID=xxxxx

# OpenAI (for AI agents)
OPENAI_API_KEY=sk-xxxxx

# Google Analytics (optional)
GA_MEASUREMENT_ID=G-XXXXXXXXXX
GA_SERVICE_ACCOUNT_JSON=path/to/service-account.json

# Application
APP_URL=https://your-hotdash-domain.com
SESSION_SECRET=xxxxx (generate with: openssl rand -base64 32)
```

### First-Time Setup Script
```bash
# Install dependencies
npm install

# Set up database
npx prisma migrate deploy
npx prisma generate

# Seed initial data (optional)
npx tsx scripts/setup/seed-initial-data.ts

# Build application
npm run build

# Start application
npm start
```

---

## 👥 User Management

### User Roles

**Admin**
- Full system access
- Can manage users
- Can configure integrations
- Can approve all AI actions
- Can access all data

**Manager**
- Can approve AI actions
- Can view all data
- Can manage inventory
- Can respond to customers
- Cannot manage users or integrations

**Support**
- Can respond to customers
- Can view customer data
- Can approve customer support AI suggestions
- Cannot access inventory or analytics

**Read-Only**
- Can view dashboards
- Cannot approve actions
- Cannot respond to customers
- Cannot modify data

### Adding Users
1. Navigate to **Settings → Users**
2. Click **Add User**
3. Enter:
   - Email address
   - Full name
   - Role (Admin/Manager/Support/Read-Only)
   - Notification preferences
4. Click **Send Invitation**
5. User receives email with setup link

### Managing Permissions
Fine-grained permissions per role:
- **View Dashboard** - See metrics and reports
- **Approve AI Actions** - Execute AI suggestions
- **Manage Inventory** - Update stock, approve POs
- **Respond to Customers** - Send messages
- **View Analytics** - Access reports
- **Manage Users** - Add/remove users
- **Configure System** - Change settings

### Deactivating Users
1. Navigate to **Settings → Users**
2. Find user in list
3. Click **⋮** menu → **Deactivate**
4. Confirm deactivation
5. User loses access immediately

---

## 🔌 Integration Configuration

### Shopify Integration

**Setup:**
1. Navigate to **Settings → Integrations → Shopify**
2. Click **Connect Shopify**
3. Enter your store domain
4. Authorize HotDash app
5. Configure sync settings:
   - **Sync Frequency:** Every 15 minutes (default)
   - **Sync Products:** Yes
   - **Sync Orders:** Yes
   - **Sync Customers:** Yes
   - **Sync Inventory:** Yes

**Webhooks:**
HotDash automatically registers these webhooks:
- `orders/create` - New order notifications
- `orders/updated` - Order status changes
- `products/create` - New product added
- `products/update` - Product changes
- `inventory_levels/update` - Stock changes

**Testing:**
1. Click **Test Connection**
2. Verify all green checkmarks
3. Click **Trigger Test Sync**
4. Check sync logs for errors

### Chatwoot Integration

**Setup:**
1. Create Chatwoot account at app.chatwoot.com
2. Get API key from Chatwoot Settings → Integrations
3. In HotDash: **Settings → Integrations → Chatwoot**
4. Enter:
   - API URL (usually https://app.chatwoot.com)
   - API Key
   - Account ID
5. Click **Connect**
6. Select inbox to sync
7. Configure AI settings:
   - **Auto-draft replies:** Yes/No
   - **Confidence threshold:** 0.8 (default)
   - **Review required:** Yes (recommended)

**Channels:**
Configure in Chatwoot:
- **Email:** Forward support@hotrodan.com to Chatwoot
- **Live Chat:** Install widget on website
- **SMS:** Connect Twilio account

### Google Analytics Integration

**Setup:**
1. Create GA4 property
2. Create service account in Google Cloud Console
3. Download service account JSON key
4. In HotDash: **Settings → Integrations → Google Analytics**
5. Upload service account JSON
6. Enter GA4 Measurement ID
7. Click **Connect**
8. Test connection

**What Gets Tracked:**
- Page views
- User sessions
- E-commerce events (purchases, add to cart)
- Custom events (AI suggestions, approvals)
- Custom dimensions (ab_variant, user_role)

---

## 🤖 AI Agent Configuration

### Global AI Settings

**Navigate to:** Settings → AI Agents → Global Settings

**Options:**
- **Enable AI Agents:** Master on/off switch
- **Confidence Threshold:** Minimum confidence (0-1) before suggesting
  - 0.9 = Very conservative (high confidence only)
  - 0.7 = Balanced (default)
  - 0.5 = Aggressive (more suggestions, lower confidence)
- **Auto-approve Threshold:** Confidence level for auto-execution
  - 0.95 = Only extremely confident suggestions
  - Never set below 0.9 for production
- **Learning Mode:** Enable/disable AI learning from feedback
- **Evidence Required:** Always show evidence with suggestions

### Per-Agent Configuration

#### Customer Support Agent
- **Enable:** Yes/No
- **Auto-draft:** Generate draft replies automatically
- **Tone:** Professional / Friendly / Casual
- **Max response length:** 500 words (default)
- **Include:** Product links, order details, tracking info
- **Exclude:** Pricing negotiations, refunds (require human)

#### Inventory Agent
- **Enable:** Yes/No
- **ROP Calculation:** Conservative / Balanced / Aggressive
- **Safety Stock:** 1-4 weeks (default: 2 weeks)
- **Lead Time:** Days to receive inventory (default: 14 days)
- **Auto-approve POs:** Never / Under $500 / Under $1000
- **Supplier:** Default supplier for auto-POs

#### Analytics Agent
- **Enable:** Yes/No
- **Report Frequency:** Daily / Weekly / Monthly
- **Metrics to Track:** Select from list
- **Alert Thresholds:** Set min/max for each metric
- **Recipients:** Email addresses for reports

#### SEO Agent
- **Enable:** Yes/No
- **Auto-optimize:** Meta titles, descriptions, alt text
- **Keyword Research:** Enable/disable
- **Internal Linking:** Auto-suggest links
- **Schema Markup:** Auto-generate JSON-LD

---

## 📊 Dashboard Customization

### Creating Custom Dashboards
1. Navigate to **Dashboards → Create New**
2. Name your dashboard
3. Add widgets:
   - **Metrics Card:** Single number (orders, revenue, etc.)
   - **Chart:** Line, bar, pie charts
   - **Table:** Data grid
   - **Alert List:** Pending actions
   - **Activity Feed:** Recent events
4. Configure each widget:
   - Data source
   - Filters
   - Date range
   - Refresh interval
5. Arrange widgets (drag and drop)
6. Save dashboard

### Widget Types

**Metrics Card**
- Single KPI with trend indicator
- Comparison to previous period
- Color-coded (green/yellow/red)

**Line Chart**
- Time-series data
- Multiple series
- Zoom and pan

**Bar Chart**
- Categorical comparisons
- Horizontal or vertical
- Stacked or grouped

**Pie/Donut Chart**
- Proportions
- Top N categories
- Interactive legend

**Table**
- Sortable columns
- Filterable rows
- Export to CSV
- Pagination

**Alert List**
- Pending approvals
- Low stock items
- Unread messages
- Custom alerts

### Sharing Dashboards
1. Open dashboard
2. Click **Share** button
3. Options:
   - **Share with users:** Select users/roles
   - **Public link:** Generate read-only link
   - **Embed:** Get iframe code
   - **Schedule email:** Send daily/weekly
4. Set permissions (view/edit)
5. Click **Share**

---

## 🔔 Notification Configuration

### Notification Channels
- **Email:** Sent to user's email address
- **In-app:** Browser notifications
- **SMS:** Twilio integration (optional)
- **Slack:** Webhook integration (optional)

### Notification Types

**Critical Alerts** (always sent)
- System errors
- Security issues
- Payment failures
- Data sync failures

**Important Alerts** (configurable)
- Low stock warnings
- High-value orders
- Customer complaints
- AI confidence drops

**Informational** (opt-in)
- Daily summaries
- Weekly reports
- AI suggestions
- System updates

### Configuring Notifications
1. Navigate to **Settings → Notifications**
2. For each notification type:
   - Enable/disable
   - Select channels (email, in-app, SMS)
   - Set frequency (real-time, digest)
   - Set quiet hours (optional)
3. Save settings

### Email Templates
Customize email templates:
1. Navigate to **Settings → Email Templates**
2. Select template to edit
3. Available templates:
   - Daily digest
   - Low stock alert
   - AI suggestion
   - System error
4. Edit using template variables:
   - `{{user.name}}` - User's name
   - `{{metric.value}}` - Metric value
   - `{{alert.message}}` - Alert message
5. Preview and save

---

## 🔒 Security Configuration

### Two-Factor Authentication (2FA)

**Enable for all users:**
1. Navigate to **Settings → Security**
2. Toggle **Require 2FA for all users**
3. Set grace period (7 days default)
4. Users prompted to set up 2FA on next login

**Per-user 2FA:**
1. Navigate to **Settings → Users**
2. Click user → **Security**
3. Toggle **Require 2FA**
4. User receives setup email

### Session Management
- **Session timeout:** 30 minutes (default)
- **Remember me:** 30 days (optional)
- **Concurrent sessions:** 3 maximum
- **Force logout:** Revoke all sessions

### API Keys
Generate API keys for integrations:
1. Navigate to **Settings → API Keys**
2. Click **Generate New Key**
3. Enter:
   - Key name
   - Permissions (read/write)
   - Expiration (optional)
4. Copy key (shown once only)
5. Store securely

### Audit Logs
View all system actions:
1. Navigate to **Settings → Audit Logs**
2. Filter by:
   - User
   - Action type
   - Date range
   - Resource
3. Export logs (CSV, JSON)
4. Retention: 90 days (configurable)

---

## 🚀 Performance Optimization

### Caching
Configure caching for better performance:
- **Dashboard cache:** 5 minutes (default)
- **API cache:** 1 minute (default)
- **Static assets:** 1 year
- **Clear cache:** Settings → Performance → Clear Cache

### Database Optimization
- **Auto-vacuum:** Enabled (nightly)
- **Index optimization:** Weekly
- **Query monitoring:** Track slow queries
- **Connection pooling:** 20 connections (default)

### CDN Configuration
Serve static assets via CDN:
1. Configure CDN (Cloudflare, AWS CloudFront)
2. Update `CDN_URL` environment variable
3. Assets automatically served from CDN

---

## 🔄 Backup & Recovery

### Automated Backups
- **Frequency:** Daily at 2:00 AM UTC
- **Retention:** 30 days
- **Storage:** Supabase automated backups
- **Includes:** Database, uploaded files

### Manual Backup
1. Navigate to **Settings → Backup**
2. Click **Create Backup Now**
3. Wait for completion
4. Download backup file (optional)

### Restore from Backup
1. Navigate to **Settings → Backup**
2. Select backup to restore
3. Click **Restore**
4. Confirm (this will overwrite current data)
5. Wait for completion
6. Verify data

---

## 📈 Monitoring & Maintenance

### System Health Dashboard
Monitor system health:
- **Uptime:** Current uptime percentage
- **Response Time:** Average API response time
- **Error Rate:** Errors per minute
- **Database:** Connection pool usage
- **Queue:** Pending jobs

### Scheduled Maintenance
- **Database optimization:** Weekly (Sunday 2:00 AM)
- **Log rotation:** Daily
- **Cache clearing:** As needed
- **Dependency updates:** Monthly

### Troubleshooting Tools
- **System logs:** Real-time log viewer
- **Database queries:** Slow query log
- **API inspector:** Request/response viewer
- **Error tracking:** Sentry integration

---

## 📞 Support & Resources

### Admin Support
- **Email:** admin-support@hotdash.com
- **Priority:** 4-hour response time
- **Phone:** Available 24/7 for critical issues

### Resources
- **Admin Documentation:** docs.hotdash.com/admin
- **API Reference:** docs.hotdash.com/api
- **Video Tutorials:** youtube.com/hotdash/admin
- **Community:** community.hotdash.com

---

**You're all set!** Your HotDash instance is configured and ready for your team. 🎉

