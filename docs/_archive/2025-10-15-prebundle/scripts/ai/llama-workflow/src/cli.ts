#!/usr/bin/env node

import { Command } from 'commander';
import { buildAll, type BuildOptions } from './pipeline/buildIndex.js';
import { answerQuery, insightReport } from './pipeline/query.js';
import { getConfig } from './config.js';

const program = new Command();

program
  .name('llamaindex-workflow')
  .description('HotDash AI workflow CLI for LlamaIndex operations')
  .version('1.0.0');

program
  .command('refresh')
  .description('Rebuild or update the LlamaIndex over approved sources')
  .option('--sources <list>', 'Sources to include: all|web|supabase|curated', 'all')
  .option('--full', 'Full rebuild from scratch', false)
  .action(async (options) => {
    try {
      console.log('🔄 Starting index refresh...');
      
      const buildOptions: BuildOptions = {
        sources: options.sources as 'all' | 'web' | 'supabase' | 'curated',
        full: options.full,
      };
      
      const config = getConfig();
      const result = await buildAll(config.LOG_DIR, buildOptions);
      
      const output = {
        ok: true,
        runDir: result.runDir,
        count: result.count,
        sources: result.sources,
        duration: result.duration,
        timestamp: new Date().toISOString(),
      };
      
      console.log('✅ Index refresh completed successfully');
      console.log(JSON.stringify(output, null, 2));
      
    } catch (error) {
      const output = {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      };
      
      console.error('❌ Index refresh failed');
      console.error(JSON.stringify(output, null, 2));
      process.exit(1);
    }
  });

program
  .command('query')
  .description('Query the support knowledge index and return answer with citations')
  .requiredOption('-q, --query <text>', 'Query text to search for')
  .option('--topK <n>', 'Number of top results to return', '5')
  .action(async (options) => {
    try {
      console.log(`🔍 Processing query: "${options.query}"`);
      
      const topK = parseInt(options.topK);
      if (isNaN(topK) || topK < 1 || topK > 20) {
        throw new Error('topK must be a number between 1 and 20');
      }
      
      const result = await answerQuery(options.query, topK);
      
      const output = {
        ok: true,
        query: result.query,
        response: result.response,
        sources: result.sources.map(source => ({
          id: source.id,
          score: source.score,
          preview: source.text.slice(0, 200) + '...',
          metadata: {
            source: source.metadata.source,
            table: source.metadata.table,
            url: source.metadata.url,
          },
        })),
        metadata: result.metadata,
      };
      
      console.log('✅ Query completed successfully');
      console.log(JSON.stringify(output, null, 2));
      
    } catch (error) {
      const output = {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      };
      
      console.error('❌ Query failed');
      console.error(JSON.stringify(output, null, 2));
      process.exit(1);
    }
  });

program
  .command('insight')
  .description('Generate insights report from telemetry and curated replies')
  .option('--window <w>', 'Time window for analysis (e.g., 1d, 7d, 24h)', '1d')
  .option('--format <fmt>', 'Output format: md|txt|json', 'md')
  .action(async (options) => {
    try {
      console.log(`📊 Generating insights report: window=${options.window}, format=${options.format}`);
      
      const validFormats = ['md', 'txt', 'json'];
      if (!validFormats.includes(options.format)) {
        throw new Error(`Format must be one of: ${validFormats.join(', ')}`);
      }
      
      // Validate window format
      if (!/^\\d+[dh]$/.test(options.window)) {
        throw new Error('Window must be in format like "1d", "7d", or "24h"');
      }
      
      const report = await insightReport(options.window, options.format);
      
      if (options.format === 'json') {
        const parsed = JSON.parse(report);
        console.log('✅ Insights report generated');
        console.log(JSON.stringify({
          ok: true,
          ...parsed,
        }, null, 2));
      } else {
        console.log('✅ Insights report generated');
        console.log('\\n' + report);
      }
      
    } catch (error) {
      const output = {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      };
      
      console.error('❌ Insights generation failed');
      console.error(JSON.stringify(output, null, 2));
      process.exit(1);
    }
  });

program
  .command('validate-config')
  .description('Validate the configuration and environment setup')
  .action(async () => {
    try {
      const { validateConfig } = await import('./config.js');
      validateConfig();
      console.log('✅ Configuration is valid');
    } catch (error) {
      console.error('❌ Configuration validation failed:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled rejection:', reason);
  process.exit(1);
});

// Parse command line arguments
program.parseAsync(process.argv).catch((error) => {
  console.error('❌ CLI error:', error);
  process.exit(1);
});