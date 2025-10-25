# SEO Production Verification — 2025-10-25

## Scope
- Task: `SEO-PROD-VERIFY`
- Environment: https://hotdash.fly.dev (production)
- Evidence directory: `artifacts/seo/2025-10-25/`

## Checklist
- [x] Robots.txt inspected (`app/routes/robots.txt.ts`) — confirms sitemap reference and disallows `/api/`, `/admin/`, `/_internal/`, `/.well-known/`, `/health`.
- [x] Sitemap generator reviewed (`app/routes/sitemap.xml.ts`) — verifies XML generation and caching headers. DNS lookup for `hotdash.fly.dev` currently fails from CI shell (`curl: (6) Could not resolve host`), so network reachability needs follow-up.
- [x] Canonical + OpenGraph
  - Landing page (`app/routes/_index/route.tsx`) sets canonical `https://hotdash.fly.dev/` and OG/Twitter metadata h/t latest SEO refresh.
  - Authenticated dashboard (`app/routes/app._index.tsx`) explicitly sets `noindex, nofollow` and no canonical.
  - SEO monitoring surface (`app/routes/seo.monitoring.tsx`) adds `noindex, nofollow` to protect internal analytics.
- [x] Structured data present (`app/root.tsx` WebApplication schema, landing page JSON-LD injection).

## Issues Logged
| Area | Finding | Owner | Status |
| --- | --- | --- | --- |
| Sitemap | Static map references `/content-calendar`; actual route file `app/routes/content.calendar.tsx` resolves to `/content/calendar` → mismatch will 404 for crawlers. | Engineer | Open |
| Production reachability | `curl https://hotdash.fly.dev/sitemap.xml` fails with DNS resolution error from execution environment; need ops confirmation that domain resolves externally. | DevOps | Open |
| Robots coverage | `/app/` (authenticated dashboard) is crawlable except for `noindex`; consider adding `/app/` to disallow list to reduce crawl budget. | SEO | Backlog |

## Recommended Next Actions
1. Engineer: update `getPublicPages` entries in `app/routes/sitemap.xml.ts` to use actual React Router paths (`/content/calendar`, `/ideas`, etc.) and consider including `/help` once live.
2. DevOps: confirm `hotdash.fly.dev` DNS A records in production; attach traceroute evidence once available.
3. SEO: evaluate disallowing `/app/` tree in robots.txt after confirming effect on embedded app access.

## Evidence
- `artifacts/seo/2025-10-25/landing-page-audit.json`
- `artifacts/seo/2025-10-25/mcp/SEO-PROD-VERIFY.jsonl`
