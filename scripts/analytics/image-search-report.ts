/**
 * Image Search Analytics Report Generator
 * 
 * Task: ANALYTICS-IMAGE-SEARCH-001
 * 
 * Generates comprehensive reports for image search feature usage and costs.
 * 
 * Usage:
 *   npx tsx scripts/analytics/image-search-report.ts
 *   npx tsx scripts/analytics/image-search-report.ts --days 30
 *   npx tsx scripts/analytics/image-search-report.ts --format json
 */

import { PrismaClient } from '@prisma/client';
import { logDecision } from '../../app/services/decisions.server';

const prisma = new PrismaClient();

interface ImageSearchReport {
  period: {
    start: string;
    end: string;
    days: number;
  };
  uploads: {
    total: number;
    perDay: number;
    byProject: Record<string, number>;
  };
  embeddings: {
    total: number;
    successful: number;
    failed: number;
    successRate: number;
  };
  costs: {
    gpt4Vision: {
      calls: number;
      estimatedCost: number;
      costPerImage: number;
    };
    embeddings: {
      generated: number;
      estimatedCost: number;
      costPerEmbedding: number;
    };
    total: number;
    projectedMonthly: number;
  };
  performance: {
    avgImageSize: number;
    avgDescriptionLength: number;
  };
  recommendations: string[];
}

async function generateReport(days: number = 7): Promise<ImageSearchReport> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  // Check if feature is enabled
  let featureEnabled = false;
  try {
    await prisma.$queryRaw`SELECT 1 FROM customer_photos LIMIT 1`;
    featureEnabled = true;
  } catch (error) {
    console.log('Image search feature not yet enabled');
  }
  
  if (!featureEnabled) {
    return {
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        days,
      },
      uploads: { total: 0, perDay: 0, byProject: {} },
      embeddings: { total: 0, successful: 0, failed: 0, successRate: 0 },
      costs: {
        gpt4Vision: { calls: 0, estimatedCost: 0, costPerImage: 0 },
        embeddings: { generated: 0, estimatedCost: 0, costPerEmbedding: 0 },
        total: 0,
        projectedMonthly: 0,
      },
      performance: {
        avgImageSize: 0,
        avgDescriptionLength: 0,
      },
      recommendations: ['Feature not yet enabled - waiting on ENG-IMAGE-SEARCH-003'],
    };
  }
  
  // Get upload stats
  const uploads = await prisma.$queryRaw<Array<{ count: bigint; project: string }>>`
    SELECT project, COUNT(*) as count
    FROM customer_photos
    WHERE created_at >= ${startDate} AND created_at <= ${endDate}
    GROUP BY project
  `;
  
  const totalUploads = uploads.reduce((sum, u) => sum + Number(u.count), 0);
  const byProject: Record<string, number> = {};
  uploads.forEach(u => {
    byProject[u.project] = Number(u.count);
  });
  
  // Get embedding stats
  const embeddingStats = await prisma.$queryRaw<[{
    total: bigint;
    avg_desc_length: number;
  }]>`
    SELECT 
      COUNT(*) as total,
      AVG(LENGTH(description)) as avg_desc_length
    FROM image_embeddings
    WHERE created_at >= ${startDate} AND created_at <= ${endDate}
  `;
  
  const totalEmbeddings = Number(embeddingStats[0]?.total || 0);
  const avgDescLength = Math.round(embeddingStats[0]?.avg_desc_length || 0);
  
  // Get image size stats
  const imageSizeStats = await prisma.$queryRaw<[{ avg_size: number }]>`
    SELECT AVG(file_size_bytes) as avg_size
    FROM customer_photos
    WHERE created_at >= ${startDate} AND created_at <= ${endDate}
  `;
  
  const avgImageSize = Math.round(imageSizeStats[0]?.avg_size || 0);
  
  // Calculate costs
  // GPT-4o-mini Vision: ~$0.001 per image
  const gpt4VisionCost = totalEmbeddings * 0.001;
  const costPerImage = totalEmbeddings > 0 ? gpt4VisionCost / totalEmbeddings : 0;
  
  // Text embeddings: ~$0.0001 per 1K tokens (avg 200 tokens = $0.00002)
  const embeddingCost = totalEmbeddings * 0.00002;
  const costPerEmbedding = totalEmbeddings > 0 ? embeddingCost / totalEmbeddings : 0;
  
  const totalCost = gpt4VisionCost + embeddingCost;
  const projectedMonthly = (totalCost / days) * 30;
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  if (totalUploads === 0) {
    recommendations.push('No uploads in this period - feature may not be in use yet');
  }
  
  if (totalEmbeddings < totalUploads) {
    const missing = totalUploads - totalEmbeddings;
    recommendations.push(`${missing} uploads missing embeddings - check processing queue`);
  }
  
  if (projectedMonthly > 10) {
    recommendations.push(`Projected monthly cost ($${projectedMonthly.toFixed(2)}) exceeds $10 - monitor usage`);
  }
  
  if (avgImageSize > 5 * 1024 * 1024) {
    recommendations.push(`Average image size (${(avgImageSize / 1024 / 1024).toFixed(2)}MB) is large - consider compression`);
  }
  
  return {
    period: {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      days,
    },
    uploads: {
      total: totalUploads,
      perDay: Math.round(totalUploads / days * 10) / 10,
      byProject,
    },
    embeddings: {
      total: totalEmbeddings,
      successful: totalEmbeddings,
      failed: totalUploads - totalEmbeddings,
      successRate: totalUploads > 0 ? (totalEmbeddings / totalUploads) * 100 : 0,
    },
    costs: {
      gpt4Vision: {
        calls: totalEmbeddings,
        estimatedCost: gpt4VisionCost,
        costPerImage,
      },
      embeddings: {
        generated: totalEmbeddings,
        estimatedCost: embeddingCost,
        costPerEmbedding,
      },
      total: totalCost,
      projectedMonthly,
    },
    performance: {
      avgImageSize,
      avgDescriptionLength: avgDescLength,
    },
    recommendations,
  };
}

function formatReportText(report: ImageSearchReport): string {
  const lines: string[] = [];
  
  lines.push('═'.repeat(80));
  lines.push('Image Search Analytics Report');
  lines.push('═'.repeat(80));
  lines.push('');
  
  lines.push(`Period: ${new Date(report.period.start).toLocaleDateString()} - ${new Date(report.period.end).toLocaleDateString()} (${report.period.days} days)`);
  lines.push('');
  
  lines.push('UPLOADS');
  lines.push('─'.repeat(80));
  lines.push(`Total:        ${report.uploads.total}`);
  lines.push(`Per Day:      ${report.uploads.perDay}`);
  if (Object.keys(report.uploads.byProject).length > 0) {
    lines.push('By Project:');
    Object.entries(report.uploads.byProject).forEach(([project, count]) => {
      lines.push(`  ${project}: ${count}`);
    });
  }
  lines.push('');
  
  lines.push('EMBEDDINGS');
  lines.push('─'.repeat(80));
  lines.push(`Total:        ${report.embeddings.total}`);
  lines.push(`Successful:   ${report.embeddings.successful}`);
  lines.push(`Failed:       ${report.embeddings.failed}`);
  lines.push(`Success Rate: ${report.embeddings.successRate.toFixed(1)}%`);
  lines.push('');
  
  lines.push('COSTS');
  lines.push('─'.repeat(80));
  lines.push(`GPT-4 Vision:`);
  lines.push(`  Calls:      ${report.costs.gpt4Vision.calls}`);
  lines.push(`  Cost:       $${report.costs.gpt4Vision.estimatedCost.toFixed(4)}`);
  lines.push(`  Per Image:  $${report.costs.gpt4Vision.costPerImage.toFixed(6)}`);
  lines.push('');
  lines.push(`Embeddings:`);
  lines.push(`  Generated:  ${report.costs.embeddings.generated}`);
  lines.push(`  Cost:       $${report.costs.embeddings.estimatedCost.toFixed(4)}`);
  lines.push(`  Per Embed:  $${report.costs.embeddings.costPerEmbedding.toFixed(6)}`);
  lines.push('');
  lines.push(`Total Cost:           $${report.costs.total.toFixed(4)}`);
  lines.push(`Projected Monthly:    $${report.costs.projectedMonthly.toFixed(2)}`);
  lines.push('');
  
  lines.push('PERFORMANCE');
  lines.push('─'.repeat(80));
  lines.push(`Avg Image Size:       ${(report.performance.avgImageSize / 1024 / 1024).toFixed(2)} MB`);
  lines.push(`Avg Description Len:  ${report.performance.avgDescriptionLength} chars`);
  lines.push('');
  
  if (report.recommendations.length > 0) {
    lines.push('RECOMMENDATIONS');
    lines.push('─'.repeat(80));
    report.recommendations.forEach((rec, i) => lines.push(`${i + 1}. ${rec}`));
    lines.push('');
  }
  
  lines.push('═'.repeat(80));
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('═'.repeat(80));
  
  return lines.join('\n');
}

async function main() {
  const args = process.argv.slice(2);
  const daysArg = args.find(arg => arg.startsWith('--days='));
  const days = daysArg ? parseInt(daysArg.split('=')[1]) : 7;
  const format = args.includes('--format=json') ? 'json' : 'text';
  
  console.log(`Generating ${days}-day image search report...\n`);
  
  const report = await generateReport(days);
  
  if (format === 'json') {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(formatReportText(report));
  }
  
  // Log report generation
  await logDecision({
    scope: 'build',
    actor: 'analytics',
    action: 'image_search_report_generated',
    rationale: `Generated ${days}-day image search analytics report`,
    evidenceUrl: 'scripts/analytics/image-search-report.ts',
    payload: {
      period: report.period,
      totalUploads: report.uploads.total,
      totalCost: report.costs.total,
      projectedMonthly: report.costs.projectedMonthly,
      recommendationCount: report.recommendations.length,
    },
  });
  
  await prisma.$disconnect();
}

main().catch(console.error);

