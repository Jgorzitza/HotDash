# Security Headers and HTTPS Configuration

**Task:** SECURITY-AUDIT-004  
**Status:** Implemented  
**Last Updated:** 2025-01-24

## Overview

HotDash implements comprehensive security headers and HTTPS enforcement to protect against common web vulnerabilities and ensure secure communication.

## Implemented Security Headers

### Content Security Policy (CSP)

**Purpose:** Prevent XSS attacks by controlling which resources can be loaded

**Configuration:**
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.shopify.com https://*.shopifycdn.com;
  style-src 'self' 'unsafe-inline' https://cdn.shopify.com https://*.shopifycdn.com;
  img-src 'self' data: https:;
  font-src 'self' data: https://cdn.shopify.com;
  connect-src 'self' https://*.supabase.co https://admin.shopify.com https://*.fly.dev wss://*.fly.dev;
  frame-ancestors https://admin.shopify.com https://*.myshopify.com;
  base-uri 'self';
  form-action 'self' https://admin.shopify.com;
  object-src 'none';
  upgrade-insecure-requests (production only)
```

**Why these directives:**
- `unsafe-inline` and `unsafe-eval` required for Shopify App Bridge
- `frame-ancestors` allows embedding in Shopify Admin
- `connect-src` includes Supabase, Shopify API, and Fly.io services
- `upgrade-insecure-requests` forces HTTPS in production

### HTTP Strict Transport Security (HSTS)

**Purpose:** Force HTTPS connections for all future requests

**Configuration:**
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

**Details:**
- `max-age=31536000`: 1 year (365 days)
- `includeSubDomains`: Apply to all subdomains
- `preload`: Eligible for browser preload lists
- **Production only** (not applied in development)

### X-Frame-Options

**Purpose:** Control whether the site can be embedded in frames

**Configuration:**
```
X-Frame-Options: ALLOW-FROM https://admin.shopify.com
```

**Why:** Allows embedding in Shopify Admin while preventing clickjacking

**Note:** CSP `frame-ancestors` is preferred, but X-Frame-Options provides fallback for older browsers

### X-Content-Type-Options

**Purpose:** Prevent MIME type sniffing

**Configuration:**
```
X-Content-Type-Options: nosniff
```

**Why:** Forces browsers to respect declared Content-Type, preventing MIME confusion attacks

### X-XSS-Protection

**Purpose:** Enable browser XSS filter (legacy browsers)

**Configuration:**
```
X-XSS-Protection: 1; mode=block
```

**Why:** Provides XSS protection for older browsers that don't support CSP

### Referrer-Policy

**Purpose:** Control referrer information sent with requests

**Configuration:**
```
Referrer-Policy: strict-origin-when-cross-origin
```

**Why:** Sends full URL for same-origin requests, only origin for cross-origin

### Permissions-Policy

**Purpose:** Disable unnecessary browser features

**Configuration:**
```
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()
```

**Why:** Reduces attack surface by disabling features not needed by the app

### Cross-Origin Policies

**Cross-Origin-Embedder-Policy:**
```
Cross-Origin-Embedder-Policy: require-corp
```

**Cross-Origin-Opener-Policy:**
```
Cross-Origin-Opener-Policy: same-origin
```

**Cross-Origin-Resource-Policy:**
```
Cross-Origin-Resource-Policy: same-origin
```

**Why:** Isolate browsing context and prevent cross-origin attacks

## HTTPS Configuration

### Production Requirements

- ✅ All traffic must use HTTPS
- ✅ HTTP requests redirected to HTTPS (301 permanent redirect)
- ✅ HSTS header enforces HTTPS for 1 year
- ✅ Cookies set with `Secure` flag
- ✅ Cookies set with `HttpOnly` flag
- ✅ Cookies set with `SameSite=Lax`

### Development Exceptions

- ✅ Localhost allowed over HTTP
- ✅ 127.0.0.1 allowed over HTTP
- ✅ HSTS not applied in development
- ✅ Secure cookie flag not required in development

### Fly.io Configuration

Fly.io automatically handles HTTPS:
- ✅ Free TLS certificates via Let's Encrypt
- ✅ Automatic certificate renewal
- ✅ HTTP to HTTPS redirect at edge
- ✅ TLS 1.2+ only

## Usage

### Apply Security Headers Globally

Security headers are automatically applied to all responses via `app/root.tsx`:

```typescript
import { type HeadersFunction } from "react-router";
import { getSecurityHeaders } from "./middleware/security-headers";

export const headers: HeadersFunction = () => {
  return getSecurityHeaders();
};
```

### Apply Security Headers to Specific Routes

```typescript
import { type HeadersFunction } from "react-router";
import { getSecurityHeaders } from "~/middleware/security-headers";

export const headers: HeadersFunction = () => {
  return getSecurityHeaders({
    enableCSP: true,
    enableHSTS: true,
    environment: 'production',
  });
};
```

### Merge with Existing Headers

```typescript
import { type HeadersFunction } from "react-router";
import { mergeSecurityHeaders } from "~/middleware/security-headers";

export const headers: HeadersFunction = ({ loaderHeaders }) => {
  return mergeSecurityHeaders(loaderHeaders);
};
```

### Secure Cookie Configuration

```typescript
import { getSecureCookieOptions } from "~/middleware/security-headers";

const cookieOptions = getSecureCookieOptions('production');

// Set cookie with secure options
response.headers.set(
  'Set-Cookie',
  `session=${sessionId}; ${Object.entries(cookieOptions)
    .map(([key, value]) => `${key}=${value}`)
    .join('; ')}`
);
```

### Enforce HTTPS

```typescript
import { enforceHTTPS } from "~/middleware/security-headers";

export async function loader({ request }: LoaderFunctionArgs) {
  // Redirect to HTTPS if needed
  const httpsRedirect = enforceHTTPS(request);
  if (httpsRedirect) {
    return httpsRedirect;
  }
  
  // Continue with loader logic
  return { data: 'secure data' };
}
```

## Testing

### Test Security Headers

```bash
# Test production headers
curl -I https://hot-dash.fly.dev

# Expected headers:
# Content-Security-Policy: ...
# Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
# X-Frame-Options: ALLOW-FROM https://admin.shopify.com
# X-Content-Type-Options: nosniff
# X-XSS-Protection: 1; mode=block
# Referrer-Policy: strict-origin-when-cross-origin
# Permissions-Policy: camera=(), microphone=(), ...
```

### Test HTTPS Redirect

```bash
# Test HTTP redirect (should return 301)
curl -I http://hot-dash.fly.dev

# Expected:
# HTTP/1.1 301 Moved Permanently
# Location: https://hot-dash.fly.dev/
```

### Test CSP Compliance

Use browser developer tools:
1. Open DevTools → Console
2. Look for CSP violations
3. Fix any violations by updating CSP directives

### Security Headers Checker

Use online tools:
- [Security Headers](https://securityheaders.com/)
- [Mozilla Observatory](https://observatory.mozilla.org/)
- [SSL Labs](https://www.ssllabs.com/ssltest/)

## Security Monitoring

### Daily Checks

- [ ] HTTPS certificate valid and not expiring soon
- [ ] Security headers present on all routes
- [ ] No CSP violations in browser console
- [ ] HSTS header present in production
- [ ] Cookies set with Secure flag in production

### Weekly Checks

- [ ] Run security headers checker
- [ ] Review CSP violation reports
- [ ] Check for new security best practices
- [ ] Update headers if needed

### Monthly Checks

- [ ] Full security audit
- [ ] Review and update CSP directives
- [ ] Test HTTPS configuration
- [ ] Review cookie security settings

## Common Issues

### CSP Violations

**Problem:** Browser console shows CSP violations

**Solution:**
1. Identify the blocked resource
2. Determine if it's necessary
3. If necessary, add to appropriate CSP directive
4. If not necessary, remove the resource

### HSTS Not Working

**Problem:** HSTS header not present

**Solution:**
1. Verify `NODE_ENV=production`
2. Check `enableHSTS` config is true
3. Ensure headers are applied in `root.tsx`

### Cookies Not Secure

**Problem:** Cookies not set with Secure flag

**Solution:**
1. Use `getSecureCookieOptions('production')`
2. Verify `NODE_ENV=production`
3. Ensure HTTPS is enabled

## Best Practices

### ✅ DO

- Apply security headers globally via `root.tsx`
- Use HTTPS in production
- Set secure cookie options
- Test security headers regularly
- Monitor CSP violations
- Keep headers up to date with best practices

### ❌ DON'T

- Disable security headers in production
- Use HTTP in production
- Set cookies without Secure flag
- Ignore CSP violations
- Use `unsafe-inline` or `unsafe-eval` unless required
- Disable HSTS once enabled

## References

- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [MDN Security Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers#security)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [HTTP Strict Transport Security](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security)
- [Fly.io HTTPS Configuration](https://fly.io/docs/reference/services/#https)
- Task: SECURITY-AUDIT-004 in TaskAssignment table

