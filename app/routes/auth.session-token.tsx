import type { LoaderFunctionArgs } from "react-router";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const apiKey = process.env.SHOPIFY_API_KEY || "";
  
  // Return HTML page that uses App Bridge to redirect
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="shopify-api-key" content="${apiKey}" />
        <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js"></script>
      </head>
      <body>
        <script>
          document.addEventListener('DOMContentLoaded', function() {
            if (window.shopify && window.shopify.environment) {
              var AppBridge = window['app-bridge'];
              var createApp = AppBridge.default;
              var Redirect = AppBridge.actions.Redirect;
              
              var app = createApp({
                apiKey: "${apiKey}",
                host: new URLSearchParams(location.search).get("host")
              });
              
              var redirect = Redirect.create(app);
              var reloadUrl = new URLSearchParams(location.search).get("shopify-reload");
              
              if (reloadUrl) {
                redirect.dispatch(Redirect.Action.REMOTE, reloadUrl);
              }
            }
          });
        </script>
      </body>
    </html>
  `;
  
  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html",
    },
  });
};

