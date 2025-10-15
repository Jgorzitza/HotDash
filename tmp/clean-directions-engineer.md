# Engineer Direction - CLEAN

## Today's Work (2025-10-15)

**Build:** Dashboard with 7 live tiles + Approvals Drawer (NORTH_STAR Scope #1)
**Branch:** `agent/engineer/dashboard-live-tiles`

### What You're Building:
From NORTH_STAR: "Dashboard — Live tiles: revenue, AOV, returns, stock risk (WOS), SEO anomalies, CX queue, approvals queue."

### Steps:

**1. Create Feedback File**
```bash
mkdir -p feedback/engineer
echo "# Engineer 2025-10-15" > feedback/engineer/2025-10-15.md
```

**2. Use Shopify MCP**
```bash
shopify component Card
shopify component Layout  
shopify component Drawer
```
Document output in feedback file.

**3. Build Dashboard Route (app/routes/dashboard.tsx)**
- 7 Polaris Cards in responsive grid
- Tiles: Revenue, AOV, Returns, Stock Risk, SEO Anomalies, CX Queue, Approvals Queue
- Each shows: title, value, trend, "View" button
- Click tile → opens Approvals Drawer
- Use fixture data (no API calls)

**4. Build Approvals Drawer (app/components/approvals/ApprovalsDrawer.tsx)**
- Polaris Drawer component
- Sections: Evidence, Projected Impact, Risk & Rollback, Grading (3 sliders 1-5), Actions
- Approve button disabled in dev mode
- Opens when tile clicked

**5. Create Fixtures (app/fixtures/dashboard.ts)**
- Data for all 7 tiles
- Approval data (evidence, impact, rollback)

**6. Write Tests & Create PR**
- tests/routes/dashboard.test.tsx
- Screenshots: mobile, tablet, desktop, drawer open
- Create PR

**Allowed paths:** `app/routes/dashboard.*, app/components/*, app/fixtures/*, tests/**`

**Rules:**
- Use Shopify MCP for ALL Polaris components
- Document MCP commands in feedback
- Fixtures only (no API calls)
- NO new .md files except feedback

