#!/usr/bin/env node

/**
 * CI Guard: Dev MCP Ban Verification
 *
 * Verifies that no Dev MCP imports are present in production runtime code.
 * This is a CI merge blocker - production builds MUST FAIL if Dev MCP detected.
 *
 * Requirements:
 * - Scan app/ directory for Dev MCP imports
 * - Check for banned import patterns
 * - Fail build if any Dev MCP imports found
 *
 * Banned Imports:
 * - @shopify/mcp-server-dev
 * - context7-mcp
 * - chrome-devtools-mcp
 * - Any mcp.*dev or dev.*mcp patterns
 *
 * Allowed Locations:
 * - scripts/ (non-runtime dev scripts)
 * - tests/ (test utilities)
 * - .cursor/ (Cursor IDE config)
 * - docs/ (documentation)
 */

const fs = require("fs");
const path = require("path");

/**
 * Banned import patterns that must not appear in production code
 */
const BANNED_PATTERNS = [
  /@shopify\/mcp-server-dev/,
  /context7-mcp/,
  /chrome-devtools-mcp/,
  /mcp.*dev/,
  /dev.*mcp/,
];

/**
 * Allowed directories where Dev MCP is permitted
 */
const ALLOWED_DIRECTORIES = [
  "scripts/",
  "tests/",
  ".cursor/",
  "docs/",
  "node_modules/",
];

/**
 * Check if a file path is in an allowed directory
 * @param {string} filePath - Path to check
 * @returns {boolean} - True if in allowed directory
 */
function isAllowedDirectory(filePath) {
  return ALLOWED_DIRECTORIES.some((dir) => filePath.startsWith(dir));
}

/**
 * Scan a single file for banned imports
 * @param {string} filePath - Path to file to scan
 * @returns {string[]} - Array of violations found
 */
function scanFile(filePath) {
  const violations = [];
  
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n");
    
    lines.forEach((line, lineNumber) => {
      // Check for import statements
      if (line.includes("import") || line.includes("require")) {
        BANNED_PATTERNS.forEach((pattern) => {
          if (pattern.test(line)) {
            violations.push({
              file: filePath,
              line: lineNumber + 1,
              content: line.trim(),
              pattern: pattern.toString(),
            });
          }
        });
      }
    });
  } catch (error) {
    console.warn(`Warning: Could not read file ${filePath}: ${error.message}`);
  }
  
  return violations;
}

/**
 * Recursively scan directory for TypeScript/JavaScript files
 * @param {string} dirPath - Directory to scan
 * @returns {string[]} - Array of file paths
 */
function findSourceFiles(dirPath) {
  const files = [];
  
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    entries.forEach((entry) => {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        // Skip allowed directories
        if (isAllowedDirectory(fullPath)) {
          return;
        }
        
        // Recursively scan subdirectories
        files.push(...findSourceFiles(fullPath));
      } else if (entry.isFile()) {
        // Check for TypeScript/JavaScript files
        if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
          files.push(fullPath);
        }
      }
    });
  } catch (error) {
    console.warn(`Warning: Could not read directory ${dirPath}: ${error.message}`);
  }
  
  return files;
}

/**
 * Main execution
 */
async function main() {
  console.log("🔍 Scanning for Dev MCP imports in production code...\n");
  
  const appDir = "app/";
  
  if (!fs.existsSync(appDir)) {
    console.log("✅ No app/ directory found - skipping Dev MCP ban check");
    process.exit(0);
  }
  
  console.log(`Scanning ${appDir} directory...`);
  
  const sourceFiles = findSourceFiles(appDir);
  console.log(`Found ${sourceFiles.length} source files to scan\n`);
  
  const allViolations = [];
  
  sourceFiles.forEach((filePath) => {
    const violations = scanFile(filePath);
    allViolations.push(...violations);
  });
  
  if (allViolations.length === 0) {
    console.log("✅ Dev MCP Ban Check PASSED: No Dev MCP imports found in production code");
    process.exit(0);
  }
  
  console.error("❌ Dev MCP Ban Check FAILED: Dev MCP imports detected in production code\n");
  
  allViolations.forEach((violation) => {
    console.error(`File: ${violation.file}:${violation.line}`);
    console.error(`Content: ${violation.content}`);
    console.error(`Pattern: ${violation.pattern}`);
    console.error("");
  });
  
  console.error("💡 To fix this:");
  console.error("1. Remove Dev MCP imports from app/ directory");
  console.error("2. Move Dev MCP usage to scripts/, tests/, or .cursor/ directories");
  console.error("3. Dev MCP is for development/staging ONLY");
  console.error("4. Production code must use production MCP servers only");
  console.error("\nSee: docs/RULES.md (Dev MCP Ban section)\n");
  
  process.exit(1);
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error(`\n❌ Unexpected error: ${error.message}\n`);
    process.exit(1);
  });
}

module.exports = { scanFile, findSourceFiles, BANNED_PATTERNS };
