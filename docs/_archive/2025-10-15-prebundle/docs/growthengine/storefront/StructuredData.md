# Structured Data (JSON-LD)

Emit **Product** with **Offer** for each product block on programmatic pages.

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "LS Swap Filter/Regulator Kit — 58 PSI",
  "image": ["https://.../image.jpg"],
  "sku": "HRAN-REG58",
  "brand": { "@type": "Brand", "name": "Hot Rod AN" },
  "offers": {
    "@type": "Offer",
    "priceCurrency": "USD",
    "price": "149.99",
    "availability": "http://schema.org/InStock",
    "url": "https://hotrodan.com/products/...",
    "hasMerchantReturnPolicy": {
      "@type": "MerchantReturnPolicy",
      "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow"
    }
  }
}
```

Also include Organization/Website where appropriate. Ensure returns/shipping pages exist and are linked.
