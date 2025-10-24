import { useEffect } from "react";
import type { LoaderFunctionArgs } from "react-router";
import { useSearchParams } from "react-router";
import { AppProvider } from "@shopify/shopify-app-react-router/react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { Redirect } from "@shopify/app-bridge/actions";

import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export default function SessionToken() {
  const [searchParams] = useSearchParams();
  const appBridge = useAppBridge();

  useEffect(() => {
    const reloadUrl = searchParams.get("shopify-reload");
    
    if (reloadUrl && appBridge) {
      // Use App Bridge to redirect within the embedded app
      const redirect = Redirect.create(appBridge);
      redirect.dispatch(Redirect.Action.APP, reloadUrl);
    } else if (reloadUrl) {
      // Fallback to window redirect if App Bridge isn't available
      window.location.href = reloadUrl;
    }
  }, [searchParams, appBridge]);

  return (
    <AppProvider embedded={true}>
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>Authenticating...</p>
      </div>
    </AppProvider>
  );
}

