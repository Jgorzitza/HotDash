/**
 * Security Headers Middleware
 * 
 * Implements comprehensive security headers for all HTTP responses
 * Follows OWASP security best practices and React Router 7 patterns
 * 
 * Task: SECURITY-AUDIT-004
 */

export interface SecurityHeadersConfig {
  enableHSTS: boolean;
  enableCSP: boolean;
  enableFrameProtection: boolean;
  environment: 'development' | 'production';
}

/**
 * Get security headers for HTTP responses
 * 
 * @param config - Security headers configuration
 * @returns Headers object with security headers
 */
export function getSecurityHeaders(config: Partial<SecurityHeadersConfig> = {}): Headers {
  const {
    enableHSTS = true,
    enableCSP = true,
    enableFrameProtection = true,
    environment = process.env.NODE_ENV === 'production' ? 'production' : 'development',
  } = config;
  
  const headers = new Headers();
  
  // ============================================================================
  // Content Security Policy (CSP)
  // ============================================================================
  
  if (enableCSP) {
    const cspDirectives = [
      // Default: only allow resources from same origin
      "default-src 'self'",
      
      // Scripts: allow self, Shopify CDN, and inline scripts (required for Shopify App Bridge)
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.shopify.com https://*.shopifycdn.com",
      
      // Styles: allow self, Shopify CDN, and inline styles (required for Polaris)
      "style-src 'self' 'unsafe-inline' https://cdn.shopify.com https://*.shopifycdn.com",
      
      // Images: allow self, data URIs, and HTTPS
      "img-src 'self' data: https:",
      
      // Fonts: allow self, data URIs, and Shopify CDN
      "font-src 'self' data: https://cdn.shopify.com",
      
      // Connect: allow self, Supabase, Shopify Admin API, Chatwoot
      "connect-src 'self' https://*.supabase.co https://admin.shopify.com https://*.fly.dev wss://*.fly.dev",
      
      // Frame ancestors: only allow Shopify Admin (for embedded app)
      "frame-ancestors https://admin.shopify.com https://*.myshopify.com",
      
      // Base URI: restrict to self
      "base-uri 'self'",
      
      // Form action: restrict to self and Shopify
      "form-action 'self' https://admin.shopify.com",
      
      // Object/embed: disallow
      "object-src 'none'",
      
      // Upgrade insecure requests in production
      ...(environment === 'production' ? ["upgrade-insecure-requests"] : []),
    ];
    
    headers.set('Content-Security-Policy', cspDirectives.join('; '));
  }
  
  // ============================================================================
  // HTTP Strict Transport Security (HSTS)
  // ============================================================================
  
  if (enableHSTS && environment === 'production') {
    // Force HTTPS for 1 year, include subdomains, allow preloading
    headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  // ============================================================================
  // X-Frame-Options
  // ============================================================================
  
  if (enableFrameProtection) {
    // Allow framing only from Shopify Admin (for embedded app)
    // Note: CSP frame-ancestors is preferred, but X-Frame-Options provides fallback
    headers.set('X-Frame-Options', 'ALLOW-FROM https://admin.shopify.com');
  }
  
  // ============================================================================
  // X-Content-Type-Options
  // ============================================================================
  
  // Prevent MIME type sniffing
  headers.set('X-Content-Type-Options', 'nosniff');
  
  // ============================================================================
  // X-XSS-Protection
  // ============================================================================
  
  // Enable XSS filter (legacy browsers)
  headers.set('X-XSS-Protection', '1; mode=block');
  
  // ============================================================================
  // Referrer-Policy
  // ============================================================================
  
  // Send full URL for same-origin, only origin for cross-origin
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // ============================================================================
  // Permissions-Policy
  // ============================================================================
  
  // Disable unnecessary browser features
  const permissionsPolicies = [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()',
  ];
  
  headers.set('Permissions-Policy', permissionsPolicies.join(', '));
  
  // ============================================================================
  // Cross-Origin Policies
  // ============================================================================
  
  // Cross-Origin-Embedder-Policy: require CORP for cross-origin resources
  headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
  
  // Cross-Origin-Opener-Policy: isolate browsing context
  headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  
  // Cross-Origin-Resource-Policy: same-origin by default
  headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  
  return headers;
}

/**
 * Apply security headers to a Response
 * 
 * @param response - Response object to add headers to
 * @param config - Security headers configuration
 * @returns Response with security headers applied
 */
export function applySecurityHeaders(
  response: Response,
  config: Partial<SecurityHeadersConfig> = {}
): Response {
  const securityHeaders = getSecurityHeaders(config);
  
  // Clone response to avoid modifying original
  const newHeaders = new Headers(response.headers);
  
  // Apply security headers
  securityHeaders.forEach((value, key) => {
    newHeaders.set(key, value);
  });
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}

/**
 * Merge security headers with existing headers
 * 
 * @param existingHeaders - Existing headers object
 * @param config - Security headers configuration
 * @returns Merged headers
 */
export function mergeSecurityHeaders(
  existingHeaders: Headers,
  config: Partial<SecurityHeadersConfig> = {}
): Headers {
  const securityHeaders = getSecurityHeaders(config);
  const merged = new Headers(existingHeaders);
  
  securityHeaders.forEach((value, key) => {
    // Only set if not already present (allow route-specific overrides)
    if (!merged.has(key)) {
      merged.set(key, value);
    }
  });
  
  return merged;
}

/**
 * Get secure cookie options
 * 
 * @param environment - Current environment
 * @returns Cookie options object
 */
export function getSecureCookieOptions(environment: 'development' | 'production' = 'production') {
  return {
    httpOnly: true,
    secure: environment === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  };
}

/**
 * Validate HTTPS connection
 * 
 * @param request - Request object
 * @returns True if HTTPS or localhost
 */
export function isSecureConnection(request: Request): boolean {
  const url = new URL(request.url);
  
  // Allow localhost for development
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    return true;
  }
  
  // Require HTTPS for all other hosts
  return url.protocol === 'https:';
}

/**
 * Enforce HTTPS redirect
 * 
 * @param request - Request object
 * @returns Redirect response if HTTP, null if HTTPS
 */
export function enforceHTTPS(request: Request): Response | null {
  if (process.env.NODE_ENV !== 'production') {
    return null; // Skip in development
  }
  
  if (isSecureConnection(request)) {
    return null; // Already secure
  }
  
  const url = new URL(request.url);
  url.protocol = 'https:';
  
  return Response.redirect(url.toString(), 301);
}

