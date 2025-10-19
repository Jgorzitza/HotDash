#!/usr/bin/env node
/**
 * Contract Test Generator
 * 
 * Generates contract tests from API route files
 * Usage: node scripts/test/generate-contracts.mjs
 */

import fs from 'fs';
import path from 'path';

const ROUTES_DIR = 'app/routes';
const CONTRACT_DIR = 'tests/contract';

console.log('🔍 Scanning API routes...');

// Find all API route files
const apiRoutes = [];

function scanRoutes(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      scanRoutes(fullPath);
    } else if (entry.isFile() && entry.name.startsWith('api.') && entry.name.endsWith('.ts')) {
      apiRoutes.push(fullPath);
    }
  }
}

scanRoutes(ROUTES_DIR);

console.log(`Found ${apiRoutes.length} API routes`);

// Generate contract test template
function generateContractTest(routePath) {
  const routeName = path.basename(routePath, '.ts').replace('api.', '');
  const testName = routeName.replace(/\./g, '-');
  
  return `/**
 * Contract Test: ${routeName}
 * Generated: ${new Date().toISOString().split('T')[0]}
 */

import { describe, it, expect } from 'vitest';

const BASE_URL = process.env.API_URL || 'http://localhost:3000';

describe('${routeName} Contract', () => {
  it('should respond with expected structure', async () => {
    const response = await fetch(\`\${BASE_URL}/api/${routeName.replace(/\./g, '/')}\`);
    
    expect(response.status).toBe(200);
    
    const data = await response.json();
    
    // TODO: Add specific contract assertions
    expect(data).toBeDefined();
  });

  it('should validate input parameters', async () => {
    // TODO: Test with invalid inputs
    // Should return 400 for invalid data
  });

  it('should handle errors gracefully', async () => {
    // TODO: Test error scenarios
    // Should return appropriate error codes
  });
});
`;
}

// Generate tests
fs.mkdirSync(CONTRACT_DIR, { recursive: true });

for (const route of apiRoutes) {
  const routeName = path.basename(route, '.ts').replace('api.', '');
  const testFile = path.join(CONTRACT_DIR, `${routeName}.contract.spec.ts`);
  
  if (!fs.existsSync(testFile)) {
    const testContent = generateContractTest(route);
    fs.writeFileSync(testFile, testContent);
    console.log(`✅ Generated: ${testFile}`);
  } else {
    console.log(`⏭️  Skipped (exists): ${testFile}`);
  }
}

console.log(`\n✅ Contract test generation complete`);
console.log(`Generated/verified ${apiRoutes.length} contract tests`);

