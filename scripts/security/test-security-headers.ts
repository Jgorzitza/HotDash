/**
 * Test Security Headers Script
 * 
 * Tests that all required security headers are present and properly configured
 * 
 * Usage:
 *   npx tsx scripts/security/test-security-headers.ts [url]
 * 
 * Examples:
 *   npx tsx scripts/security/test-security-headers.ts
 *   npx tsx scripts/security/test-security-headers.ts https://hot-dash.fly.dev
 * 
 * Task: SECURITY-AUDIT-004
 */

const DEFAULT_URL = process.env.APP_URL || 'http://localhost:3000';

interface SecurityHeaderTest {
  name: string;
  header: string;
  required: boolean;
  productionOnly?: boolean;
  validate?: (value: string) => { valid: boolean; message?: string };
}

const SECURITY_HEADER_TESTS: SecurityHeaderTest[] = [
  {
    name: 'Content Security Policy',
    header: 'Content-Security-Policy',
    required: true,
    validate: (value) => {
      const requiredDirectives = ['default-src', 'script-src', 'style-src', 'frame-ancestors'];
      const missing = requiredDirectives.filter(dir => !value.includes(dir));
      
      if (missing.length > 0) {
        return {
          valid: false,
          message: `Missing directives: ${missing.join(', ')}`,
        };
      }
      
      return { valid: true };
    },
  },
  {
    name: 'HTTP Strict Transport Security',
    header: 'Strict-Transport-Security',
    required: true,
    productionOnly: true,
    validate: (value) => {
      if (!value.includes('max-age=')) {
        return { valid: false, message: 'Missing max-age directive' };
      }
      
      const maxAge = parseInt(value.match(/max-age=(\d+)/)?.[1] || '0');
      if (maxAge < 31536000) {
        return {
          valid: false,
          message: `max-age too short: ${maxAge} (should be >= 31536000)`,
        };
      }
      
      return { valid: true };
    },
  },
  {
    name: 'X-Frame-Options',
    header: 'X-Frame-Options',
    required: true,
    validate: (value) => {
      if (!value.includes('ALLOW-FROM') && value !== 'DENY' && value !== 'SAMEORIGIN') {
        return { valid: false, message: 'Invalid X-Frame-Options value' };
      }
      return { valid: true };
    },
  },
  {
    name: 'X-Content-Type-Options',
    header: 'X-Content-Type-Options',
    required: true,
    validate: (value) => {
      if (value !== 'nosniff') {
        return { valid: false, message: 'Should be "nosniff"' };
      }
      return { valid: true };
    },
  },
  {
    name: 'X-XSS-Protection',
    header: 'X-XSS-Protection',
    required: true,
    validate: (value) => {
      if (!value.includes('1') || !value.includes('mode=block')) {
        return { valid: false, message: 'Should be "1; mode=block"' };
      }
      return { valid: true };
    },
  },
  {
    name: 'Referrer-Policy',
    header: 'Referrer-Policy',
    required: true,
  },
  {
    name: 'Permissions-Policy',
    header: 'Permissions-Policy',
    required: true,
  },
  {
    name: 'Cross-Origin-Embedder-Policy',
    header: 'Cross-Origin-Embedder-Policy',
    required: false,
  },
  {
    name: 'Cross-Origin-Opener-Policy',
    header: 'Cross-Origin-Opener-Policy',
    required: false,
  },
  {
    name: 'Cross-Origin-Resource-Policy',
    header: 'Cross-Origin-Resource-Policy',
    required: false,
  },
];

async function testSecurityHeaders(url: string) {
  console.log('🔒 Testing Security Headers\n');
  console.log(`URL: ${url}\n`);
  console.log('='.repeat(80));
  console.log('');
  
  let response: Response;
  
  try {
    response = await fetch(url, { method: 'HEAD' });
  } catch (error: any) {
    console.error('❌ Failed to fetch URL:', error.message);
    process.exit(1);
  }
  
  const isProduction = url.includes('https://') && !url.includes('localhost');
  let passed = 0;
  let failed = 0;
  let warnings = 0;
  
  console.log('Security Headers:\n');
  
  for (const test of SECURITY_HEADER_TESTS) {
    const value = response.headers.get(test.header);
    
    // Skip production-only headers in development
    if (test.productionOnly && !isProduction) {
      console.log(`⏭️  ${test.name}`);
      console.log(`   Header: ${test.header}`);
      console.log(`   Status: Skipped (production only)`);
      console.log('');
      continue;
    }
    
    if (!value) {
      if (test.required) {
        console.log(`❌ ${test.name}`);
        console.log(`   Header: ${test.header}`);
        console.log(`   Status: Missing (required)`);
        console.log('');
        failed++;
      } else {
        console.log(`⚠️  ${test.name}`);
        console.log(`   Header: ${test.header}`);
        console.log(`   Status: Missing (optional)`);
        console.log('');
        warnings++;
      }
      continue;
    }
    
    // Validate header value if validator provided
    if (test.validate) {
      const validation = test.validate(value);
      
      if (!validation.valid) {
        console.log(`❌ ${test.name}`);
        console.log(`   Header: ${test.header}`);
        console.log(`   Value: ${value.substring(0, 100)}${value.length > 100 ? '...' : ''}`);
        console.log(`   Status: Invalid - ${validation.message}`);
        console.log('');
        failed++;
        continue;
      }
    }
    
    console.log(`✅ ${test.name}`);
    console.log(`   Header: ${test.header}`);
    console.log(`   Value: ${value.substring(0, 100)}${value.length > 100 ? '...' : ''}`);
    console.log('');
    passed++;
  }
  
  // Summary
  console.log('='.repeat(80));
  console.log('\n📊 Summary:\n');
  console.log(`   Passed: ${passed}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Warnings: ${warnings}`);
  console.log('');
  
  if (failed > 0) {
    console.log('❌ Security headers test failed');
    console.log('   See docs/security/security-headers.md for configuration details');
    process.exit(1);
  } else if (warnings > 0) {
    console.log('⚠️  Security headers test passed with warnings');
    console.log('   Consider implementing optional security headers');
    process.exit(0);
  } else {
    console.log('✅ All security headers tests passed!');
    process.exit(0);
  }
}

// Main
const url = process.argv[2] || DEFAULT_URL;
testSecurityHeaders(url);

