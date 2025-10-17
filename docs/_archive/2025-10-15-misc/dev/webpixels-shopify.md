# Shopify Web Pixels Notes

Source: https://shopify.dev/docs/api/web-pixels

## Key points

- Web Pixels allow injecting scripts to track customer behaviour on storefront pages.
- Pixels run in a sandboxed environment with limited API surface; must respect Shopify privacy & consent settings.
- Register pixels via Admin GraphQL (`webPixelCreate`) or REST. Scripts must be hosted securely (HTTPS).
- Events include `page_view`, `cart_update`, `checkout_started`, etc. Subscribe using `subscribe` API within the pixel script.
- Follow performance guidelines (do not block rendering) and handle consent (`window.Shopify.customerPrivacy` APIs).

## HotDash usage

- If we add analytics/behavior tracking for the customer-facing agent, coordinate with compliance before deploying pixels.
- Track event schemas alongside AI prompts so we avoid conflicting instrumentation.
- Deployment to Fly should include pixel script hosting if required.
