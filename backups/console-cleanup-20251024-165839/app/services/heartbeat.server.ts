/**
 * Heartbeat Service
 * 
 * Manages agent heartbeat tracking for Growth Engine compliance.
 * Required for tasks >2 hours to ensure agents are actively working.
 */

import { promises as fs } from 'fs';
import path from 'path';

export interface HeartbeatEntry {
  timestamp: string;
  task: string;
  status: 'doing' | 'completed' | 'blocked';
  progress?: string;
  file?: string;
}

export class HeartbeatService {
  private basePath: string;

  constructor(basePath: string = 'artifacts') {
    this.basePath = basePath;
  }

  /**
   * Initialize heartbeat file for an agent and date
   */
  async initializeHeartbeatFile(agent: string, date: string): Promise<string> {
    const heartbeatPath = path.join(this.basePath, agent, date, 'heartbeat.ndjson');
    const dirPath = path.dirname(heartbeatPath);
    
    // Ensure directory exists
    await fs.mkdir(dirPath, { recursive: true });
    
    // Create empty file if it doesn't exist
    try {
      await fs.access(heartbeatPath);
    } catch {
      await fs.writeFile(heartbeatPath, '', 'utf8');
    }
    
    return heartbeatPath;
  }

  /**
   * Append heartbeat entry to NDJSON file
   */
  async appendHeartbeat(
    agent: string, 
    date: string, 
    entry: HeartbeatEntry
  ): Promise<void> {
    const heartbeatPath = await this.initializeHeartbeatFile(agent, date);
    
    // Validate entry
    this.validateHeartbeatEntry(entry);
    
    // Append to NDJSON file
    const jsonLine = JSON.stringify(entry) + '\n';
    await fs.appendFile(heartbeatPath, jsonLine, 'utf8');
  }

  /**
   * Get all heartbeat entries for an agent and date
   */
  async getHeartbeatEntries(agent: string, date: string): Promise<HeartbeatEntry[]> {
    const heartbeatPath = path.join(this.basePath, agent, date, 'heartbeat.ndjson');
    
    try {
      const content = await fs.readFile(heartbeatPath, 'utf8');
      const lines = content.trim().split('\n').filter(line => line.trim());
      
      return lines.map(line => {
        try {
          return JSON.parse(line) as HeartbeatEntry;
        } catch (error) {
          console.error(`Invalid JSON in heartbeat file: ${line}`);
          throw new Error(`Invalid JSON in heartbeat file: ${line}`);
        }
      });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  /**
   * Get the last heartbeat entry for a task
   */
  async getLastHeartbeat(agent: string, date: string, task: string): Promise<HeartbeatEntry | null> {
    const entries = await this.getHeartbeatEntries(agent, date);
    const taskEntries = entries.filter(entry => entry.task === task);
    
    if (taskEntries.length === 0) {
      return null;
    }
    
    // Sort by timestamp and return the latest
    return taskEntries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
  }

  /**
   * Check if heartbeat is stale (>15 minutes old)
   */
  async isHeartbeatStale(agent: string, date: string, task: string): Promise<boolean> {
    const lastHeartbeat = await this.getLastHeartbeat(agent, date, task);
    
    if (!lastHeartbeat) {
      return true; // No heartbeat = stale
    }
    
    const lastHeartbeatTime = new Date(lastHeartbeat.timestamp).getTime();
    const now = Date.now();
    const fifteenMinutes = 15 * 60 * 1000; // 15 minutes in milliseconds
    
    return (now - lastHeartbeatTime) > fifteenMinutes;
  }

  /**
   * Check if heartbeat file exists
   */
  async hasHeartbeatFile(agent: string, date: string): Promise<boolean> {
    const heartbeatPath = path.join(this.basePath, agent, date, 'heartbeat.ndjson');
    
    try {
      await fs.access(heartbeatPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate heartbeat entry format
   */
  private validateHeartbeatEntry(entry: HeartbeatEntry): void {
    const validStatuses = ['doing', 'completed', 'blocked'];
    
    if (!validStatuses.includes(entry.status)) {
      throw new Error(`Invalid status: ${entry.status}. Must be one of: ${validStatuses.join(', ')}`);
    }
    
    if (!entry.task || typeof entry.task !== 'string') {
      throw new Error('task is required and must be a string');
    }
    
    if (!entry.timestamp || typeof entry.timestamp !== 'string') {
      throw new Error('timestamp is required and must be a string');
    }
    
    // Validate timestamp format (ISO 8601)
    const timestampRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
    if (!timestampRegex.test(entry.timestamp)) {
      throw new Error('timestamp must be in ISO 8601 format');
    }
  }

  /**
   * Generate Heartbeat section for PR template
   */
  async generatePRTemplateSection(agent: string, date: string, task: string): Promise<string> {
    const hasFile = await this.hasHeartbeatFile(agent, date);
    const isStale = await this.isHeartbeatStale(agent, date, task);
    
    if (!hasFile) {
      return '## Heartbeat (if task >2 hours)\n- [ ] Task completed in single session (<2 hours, no heartbeat required)';
    }
    
    if (isStale) {
      return '## Heartbeat (if task >2 hours)\n- [ ] ⚠️ Heartbeat is stale (>15 minutes old)';
    }
    
    const heartbeatPath = path.join(this.basePath, agent, date, 'heartbeat.ndjson');
    const relativePath = path.relative(process.cwd(), heartbeatPath);
    
    return `## Heartbeat (if task >2 hours)\n- [ ] Heartbeat files present: ${relativePath}`;
  }

  /**
   * Start heartbeat monitoring for a task
   */
  async startHeartbeatMonitoring(
    agent: string, 
    date: string, 
    task: string, 
    intervalMinutes: number = 15
  ): Promise<NodeJS.Timeout> {
    const heartbeat = async () => {
      await this.appendHeartbeat(agent, date, {
        timestamp: new Date().toISOString(),
        task,
        status: 'doing',
        progress: 'Active monitoring'
      });
    };
    
    // Send initial heartbeat
    await heartbeat();
    
    // Set up interval
    return setInterval(heartbeat, intervalMinutes * 60 * 1000);
  }

  /**
   * Stop heartbeat monitoring
   */
  stopHeartbeatMonitoring(interval: NodeJS.Timeout): void {
    clearInterval(interval);
  }
}

// Export singleton instance
export const heartbeatService = new HeartbeatService();
