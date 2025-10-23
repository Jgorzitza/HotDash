import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import { seoOptimizer } from "./lib/seo/seo-optimization";

export default function App() {
  // Default SEO data for the app
  const defaultSEOData = {
    title: "Hot Dash - Hot Rod AN Control Center",
    description: "Centralized metrics, inventory control, CX, and growth levers for Shopify stores. Real-time analytics, automated inventory management, and AI-powered customer support.",
    keywords: ["shopify", "analytics", "inventory", "ecommerce", "dashboard", "control center"],
    canonicalUrl: process.env.SITE_URL || "https://hotdash.fly.dev",
    type: "website" as const,
    noindex: false,
    nofollow: false
  };

  const metaTags = seoOptimizer.generateMetaTags(defaultSEOData);
  const structuredData = seoOptimizer.generateStructuredData(defaultSEOData);
  const jsonLD = seoOptimizer.generateJSONLD(structuredData);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://cdn.shopify.com/" />
        <link
          rel="stylesheet"
          href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
        />
        <div dangerouslySetInnerHTML={{ __html: metaTags }} />
        <div dangerouslySetInnerHTML={{ __html: jsonLD }} />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        {/* Chatwoot Live Chat Widget */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(d,t) {
                var BASE_URL="https://hotdash-chatwoot.fly.dev";
                var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
                g.src=BASE_URL+"/packs/js/sdk.js";
                g.async = true;
                s.parentNode.insertBefore(g,s);
                g.onload=function(){
                  window.chatwootSDK.run({
                    websiteToken: 'ieNpPnBaZXd9joxoeMts7qTA',
                    baseUrl: BASE_URL
                  })
                }
              })(document,"script");
            `,
          }}
        />
      </body>
    </html>
  );
}
