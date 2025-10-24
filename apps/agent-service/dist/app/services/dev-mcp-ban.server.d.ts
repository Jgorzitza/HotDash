/**
 * Dev MCP Ban Service
 *
 * Enforces production safety by preventing Dev MCP imports in runtime bundles.
 * Required for Growth Engine compliance to ensure production safety.
 */
export interface DevMCPViolation {
    file: string;
    line: number;
    content: string;
    violation: string;
}
export declare class DevMCPBanService {
    private appDirectory;
    private bannedImports;
    private allowedDirectories;
    constructor(appDirectory?: string);
    /**
     * Scan for Dev MCP violations in the app directory
     */
    scanForViolations(): Promise<DevMCPViolation[]>;
    /**
     * Check if a file is in an allowed directory
     */
    private isAllowedDirectory;
    /**
     * Identify the specific violation in a line of code
     */
    private identifyViolation;
    /**
     * Validate that no Dev MCP imports exist in production code
     */
    validateProductionSafety(): Promise<{
        valid: boolean;
        violations: DevMCPViolation[];
    }>;
    /**
     * Generate Dev MCP Check section for PR template
     */
    generatePRTemplateSection(): Promise<string>;
    /**
     * Check if Dev MCP imports are present in app directory
     */
    hasDevMCPImports(): Promise<boolean>;
    /**
     * Get detailed violation report
     */
    getViolationReport(): Promise<string>;
    /**
     * Create a pre-commit hook to prevent Dev MCP imports
     */
    createPreCommitHook(): Promise<void>;
    /**
     * Create CI check script
     */
    createCICheckScript(): Promise<void>;
}
export declare const devMCPBanService: DevMCPBanService;
//# sourceMappingURL=dev-mcp-ban.server.d.ts.map