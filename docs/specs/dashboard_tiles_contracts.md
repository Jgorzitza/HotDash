# Dashboard Tiles API Contracts

## Revenue Tile
- Endpoint: GET /api/metrics/revenue
- Response: { value: string, orderCount: number, trend: "up" | "down" | "neutral" }
- Refresh: Every 30 seconds

## AOV Tile
- Endpoint: GET /api/metrics/aov
- Response: { value: string, percentChange: string, trend: "up" | "down" | "neutral" }
- Refresh: Every 30 seconds

## Returns Tile
- Endpoint: GET /api/metrics/returns
- Response: { count: number, pendingReview: number, trend: "up" | "down" | "neutral" }
- Refresh: Every 60 seconds

## Stock Risk Tile
- Endpoint: GET /api/metrics/stock-risk
- Response: { skuCount: number, subtitle: string, trend: "up" | "down" | "neutral" }
- Refresh: Every 60 seconds

## SEO Tile
- Endpoint: GET /api/metrics/seo
- Response: { alertCount: number, topAlert: string, trend: "up" | "down" | "neutral" }
- Refresh: Every 300 seconds

## CX Tile
- Endpoint: GET /api/metrics/cx
- Response: { escalationCount: number, slaStatus: string, trend: "up" | "down" | "neutral" }
- Refresh: Every 30 seconds

## Approvals Tile
- Endpoint: GET /api/approvals/count
- Response: { pendingCount: number, filters: string[] }
- Refresh: Every 5 seconds
