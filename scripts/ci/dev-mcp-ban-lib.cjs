/**
 * Dev MCP Ban Library (CommonJS)
 *
 * Enforces production safety by preventing Dev MCP imports in runtime bundles.
 * This library is intended for CI/scripts usage only. Do not import in app/ runtime code.
 */

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class DevMCPBanService {
  constructor(appDirectory = 'app') {
    this.appDirectory = appDirectory;
    this.bannedPatterns = [
      { label: '@shopify/mcp-server-dev', regex: /@shopify\/mcp-server-dev/i },
      { label: 'context7-mcp', regex: /context7-mcp/i },
      { label: 'chrome-devtools-mcp', regex: /chrome-devtools-mcp/i },
      { label: 'mcp.*dev', regex: /mcp.*dev/i },
      { label: 'dev.*mcp', regex: /dev.*mcp/i },
    ];
    this.allowedDirectories = ['scripts', 'tests', '.cursor', 'docs'];
  }

  /**
   * Scan for Dev MCP violations in the app directory
   * @returns {Promise<Array<{file:string,line:number,content:string,violation:string}>>}
   */
  async scanForViolations() {
    const violations = [];
    try {
      const grepCommand = `grep -r "mcp.*dev\\|dev.*mcp" ${this.appDirectory} --include="*.ts" --include="*.tsx" -i -n`;
      const { stdout } = await execAsync(grepCommand);
      if (stdout.trim()) {
        const lines = stdout.trim().split('\n');
        for (const line of lines) {
          const match = line.match(/^([^:]+):(\d+):(.*)$/);
          if (!match) continue;
          const [, file, lineNum, content] = match;
          const violation = this.identifyViolation(content);
          if (violation) {
            violations.push({
              file,
              line: parseInt(lineNum, 10),
              content: content.trim(),
              violation,
            });
          }
        }
      }
    } catch (error) {
      // grep returns exit code 1 when no matches found; ignore
      if (error && error.code !== 1) throw error;
    }
    return violations;
  }

  isAllowedDirectory(filePath) {
    return this.allowedDirectories.some((dir) => filePath.includes(`/${dir}/`));
  }

  identifyViolation(content) {
    for (const { label, regex } of this.bannedPatterns) {
      if (regex.test(content)) {
        return `Banned import: ${label}`;
      }
    }
    return null;
  }

  async validateProductionSafety() {
    const violations = await this.scanForViolations();
    const productionViolations = violations.filter((v) => !this.isAllowedDirectory(v.file));
    return { valid: productionViolations.length === 0, violations: productionViolations };
  }

  async generatePRTemplateSection() {
    const validation = await this.validateProductionSafety();
    if (validation.valid) {
      return '## Dev MCP Check (CRITICAL - Production Safety)\n- [ ] No Dev MCP imports in runtime bundles (prod code only)\n- [ ] Verified: No `mcp.*dev` or `dev.*mcp` imports in app/ (searched with grep)';
    }
    const violationList = validation.violations
      .map((v) => `  - ${v.file}:${v.line} - ${v.violation}`)
      .join('\n');
    return `## Dev MCP Check (CRITICAL - Production Safety)\n- [ ] ❌ Dev MCP violations found:\n${violationList}`;
  }

  async hasDevMCPImports() {
    const validation = await this.validateProductionSafety();
    return !validation.valid;
  }

  async getViolationReport() {
    const validation = await this.validateProductionSafety();
    if (validation.valid) return '✅ No Dev MCP imports found in production code';
    const report = [
      '❌ Dev MCP imports detected in production code',
      'Dev MCP is for development/staging ONLY',
      '',
      'Violations found:',
      ...validation.violations.map((v) => `  ${v.file}:${v.line} - ${v.violation}\n    ${v.content}`),
    ];
    return report.join('\n');
  }

  async createPreCommitHook() {
    const hookContent = `#!/bin/sh
# Dev MCP Ban Pre-commit Hook
echo "Checking for Dev MCP imports..."
if grep -r "mcp.*dev\\|dev.*mcp" app/ --include="*.ts" --include="*.tsx" -i; then
  echo "❌ Dev MCP imports detected in production code"; exit 1; fi
echo "✅ No Dev MCP imports found"; exit 0
`;
    const hookPath = '.git/hooks/pre-commit';
    await fsp.writeFile(hookPath, hookContent, { mode: 0o755 });
  }

  async createCICheckScript() {
    const scriptContent = `#!/bin/bash
echo "🔍 Checking for Dev MCP imports in production code..."
if grep -r "mcp.*dev\\|dev.*mcp" app/ --include="*.ts" --include="*.tsx" -i; then
  echo "❌ Dev MCP imports detected in production code"; exit 1; fi
echo "✅ No Dev MCP imports found in production code"; exit 0
`;
    const scriptPath = 'scripts/ci/dev-mcp-ban.sh';
    await fsp.mkdir(path.dirname(scriptPath), { recursive: true });
    await fsp.writeFile(scriptPath, scriptContent, { mode: 0o755 });
  }
}

module.exports = { DevMCPBanService, devMCPBanService: new DevMCPBanService() };
