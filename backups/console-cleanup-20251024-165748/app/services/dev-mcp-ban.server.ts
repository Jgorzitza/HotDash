/**
 * Dev MCP Ban Service
 * 
 * Enforces production safety by preventing Dev MCP imports in runtime bundles.
 * Required for Growth Engine compliance to ensure production safety.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface DevMCPViolation {
  file: string;
  line: number;
  content: string;
  violation: string;
}

export class DevMCPBanService {
  private appDirectory: string;
  private bannedImports: string[];
  private allowedDirectories: string[];

  constructor(appDirectory: string = 'app') {
    this.appDirectory = appDirectory;
    this.bannedImports = [
      '@shopify/mcp-server-dev',
      'context7-mcp',
      'chrome-devtools-mcp',
      'mcp.*dev',
      'dev.*mcp'
    ];
    this.allowedDirectories = [
      'scripts',
      'tests',
      '.cursor',
      'docs'
    ];
  }

  /**
   * Scan for Dev MCP violations in the app directory
   */
  async scanForViolations(): Promise<DevMCPViolation[]> {
    const violations: DevMCPViolation[] = [];
    
    try {
      // Use grep to find Dev MCP imports in app directory
      const grepCommand = `grep -r "mcp.*dev\\|dev.*mcp" ${this.appDirectory} --include="*.ts" --include="*.tsx" -i -n`;
      const { stdout } = await execAsync(grepCommand);
      
      if (stdout.trim()) {
        const lines = stdout.trim().split('\n');
        
        for (const line of lines) {
          const match = line.match(/^([^:]+):(\d+):(.*)$/);
          if (match) {
            const [, file, lineNum, content] = match;
            const lineNumber = parseInt(lineNum, 10);
            
            // Check if this is a banned import
            const violation = this.identifyViolation(content);
            if (violation) {
              violations.push({
                file,
                line: lineNumber,
                content: content.trim(),
                violation
              });
            }
          }
        }
      }
    } catch (error) {
      // grep returns exit code 1 when no matches found, which is expected
      if ((error as any).code !== 1) {
        throw error;
      }
    }
    
    return violations;
  }

  /**
   * Check if a file is in an allowed directory
   */
  private isAllowedDirectory(filePath: string): boolean {
    return this.allowedDirectories.some(dir => filePath.includes(`/${dir}/`));
  }

  /**
   * Identify the specific violation in a line of code
   */
  private identifyViolation(content: string): string | null {
    const lowerContent = content.toLowerCase();
    
    for (const bannedImport of this.bannedImports) {
      if (lowerContent.includes(bannedImport.toLowerCase())) {
        return `Banned import: ${bannedImport}`;
      }
    }
    
    return null;
  }

  /**
   * Validate that no Dev MCP imports exist in production code
   */
  async validateProductionSafety(): Promise<{ valid: boolean; violations: DevMCPViolation[] }> {
    const violations = await this.scanForViolations();
    
    // Filter out violations in allowed directories
    const productionViolations = violations.filter(violation => 
      !this.isAllowedDirectory(violation.file)
    );
    
    return {
      valid: productionViolations.length === 0,
      violations: productionViolations
    };
  }

  /**
   * Generate Dev MCP Check section for PR template
   */
  async generatePRTemplateSection(): Promise<string> {
    const validation = await this.validateProductionSafety();
    
    if (validation.valid) {
      return '## Dev MCP Check (CRITICAL - Production Safety)\n- [ ] No Dev MCP imports in runtime bundles (prod code only)\n- [ ] Verified: No `mcp.*dev` or `dev.*mcp` imports in app/ (searched with grep)';
    } else {
      const violationList = validation.violations
        .map(v => `  - ${v.file}:${v.line} - ${v.violation}`)
        .join('\n');
      
      return `## Dev MCP Check (CRITICAL - Production Safety)\n- [ ] ❌ Dev MCP violations found:\n${violationList}`;
    }
  }

  /**
   * Check if Dev MCP imports are present in app directory
   */
  async hasDevMCPImports(): Promise<boolean> {
    const validation = await this.validateProductionSafety();
    return !validation.valid;
  }

  /**
   * Get detailed violation report
   */
  async getViolationReport(): Promise<string> {
    const validation = await this.validateProductionSafety();
    
    if (validation.valid) {
      return '✅ No Dev MCP imports found in production code';
    }
    
    const report = [
      '❌ Dev MCP imports detected in production code',
      'Dev MCP is for development/staging ONLY',
      '',
      'Violations found:',
      ...validation.violations.map(v => 
        `  ${v.file}:${v.line} - ${v.violation}\n    ${v.content}`
      )
    ];
    
    return report.join('\n');
  }

  /**
   * Create a pre-commit hook to prevent Dev MCP imports
   */
  async createPreCommitHook(): Promise<void> {
    const hookContent = `#!/bin/sh
# Dev MCP Ban Pre-commit Hook
# Prevents Dev MCP imports from being committed to production code

echo "Checking for Dev MCP imports..."

# Check for Dev MCP imports in app directory
if grep -r "mcp.*dev\\|dev.*mcp" app/ --include="*.ts" --include="*.tsx" -i; then
  echo "❌ Dev MCP imports detected in production code"
  echo "Dev MCP is for development/staging ONLY"
  echo "Please remove Dev MCP imports from app/ directory"
  exit 1
fi

echo "✅ No Dev MCP imports found"
exit 0
`;

    const hookPath = '.git/hooks/pre-commit';
    await fs.writeFile(hookPath, hookContent, { mode: 0o755 });
  }

  /**
   * Create CI check script
   */
  async createCICheckScript(): Promise<void> {
    const scriptContent = `#!/bin/bash
# CI Check: Dev MCP Ban
# Fails build if Dev MCP imports found in production code

echo "🔍 Checking for Dev MCP imports in production code..."

# Check for Dev MCP imports in app directory
if grep -r "mcp.*dev\\|dev.*mcp" app/ --include="*.ts" --include="*.tsx" -i; then
  echo "❌ Dev MCP imports detected in production code"
  echo "Dev MCP is for development/staging ONLY"
  echo "Production builds MUST FAIL if Dev MCP detected"
  exit 1
fi

echo "✅ No Dev MCP imports found in production code"
exit 0
`;

    const scriptPath = 'scripts/ci/dev-mcp-ban.sh';
    await fs.mkdir(path.dirname(scriptPath), { recursive: true });
    await fs.writeFile(scriptPath, scriptContent, { mode: 0o755 });
  }
}

// Export singleton instance
export const devMCPBanService = new DevMCPBanService();
