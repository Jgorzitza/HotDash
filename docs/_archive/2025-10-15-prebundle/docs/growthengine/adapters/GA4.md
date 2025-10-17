# GA4 Adapter

## Pulls (daily)

- Organic-only sessions and item revenue per landing page.
- Add-to-cart, product views (ecommerce events).
- Custom dimension `ab_variant` for experiments (if present).

## API

- Use batch reports for the top landing pages and PDPs.
- Persist raw pulls and write aggregates to Postgres for quick scoring.

## Notes

- GA4 often lags slightly; label incomplete days in the UI.
