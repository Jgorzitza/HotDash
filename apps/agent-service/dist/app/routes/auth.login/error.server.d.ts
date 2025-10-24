import type { LoginError } from "@shopify/shopify-app-react-router/server";
interface LoginErrorMessage {
    shop?: string;
}
export declare function loginErrorMessage(loginErrors: LoginError): LoginErrorMessage;
export {};
//# sourceMappingURL=error.server.d.ts.map