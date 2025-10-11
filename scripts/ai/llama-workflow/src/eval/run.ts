#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { answerQuery } from '../pipeline/query.js';
import { loadConfig } from '../config.js';
import { bleuScore, rougeL, checkCitations } from './metrics.js';

interface TestCase {
  q: string;
  ref: string;
  must_cite: string[];
}

interface EvalResult {
  question: string;
  answer: string;
  reference: string;
  bleu: number;
  rouge_l: number;
  citation_check: {
    found: string[];
    missing: string[];
    score: number;
  };
  response_time_ms: number;
}

interface EvalReport {
  timestamp: string;
  total_cases: number;
  avg_bleu: number;
  avg_rouge_l: number;
  avg_citation_score: number;
  avg_response_time_ms: number;
  results: EvalResult[];
  summary: {
    bleu_distribution: { min: number; max: number; median: number };
    rouge_distribution: { min: number; max: number; median: number };
    citation_pass_count: number;
    total_missing_citations: number;
  };
}

async function loadTestCases(dataPath: string): Promise<TestCase[]> {
  const content = await fs.readFile(dataPath, 'utf-8');
  return content
    .trim()
    .split('\n')
    .filter(line => line.trim())
    .map(line => JSON.parse(line));
}

async function runEvaluation(): Promise<void> {
  console.log('🧪 Starting LlamaIndex evaluation harness...');
  
  const config = loadConfig();
  const timestamp = new Date().toISOString().replace(/[:]/g, '').slice(0, 15);
  const evalDir = path.join(config.LOG_DIR, 'eval', timestamp);
  
  await fs.mkdir(evalDir, { recursive: true });
  
  // Load test cases
  const dataPath = path.join(process.cwd(), 'eval', 'data.jsonl');
  console.log(`📚 Loading test cases from: ${dataPath}`);
  
  let testCases: TestCase[];
  try {
    testCases = await loadTestCases(dataPath);
    console.log(`✅ Loaded ${testCases.length} test cases`);
  } catch (error) {
    console.error(`❌ Failed to load test cases: ${error}`);
    process.exit(1);
  }
  
  const results: EvalResult[] = [];
  
  // Run evaluation on each test case
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\\n🔍 [${i + 1}/${testCases.length}] Evaluating: "${testCase.q.slice(0, 60)}..."`);
    
    const startTime = Date.now();
    
    try {
      // Query the index
      const response = await answerQuery(testCase.q, 5);
      const responseTime = Date.now() - startTime;
      
      // Calculate metrics
      const bleu = bleuScore(response.answer, testCase.ref);
      const rouge = rougeL(response.answer, testCase.ref);
      const citationCheck = checkCitations(response, testCase.must_cite);
      
      const result: EvalResult = {
        question: testCase.q,
        answer: response.answer,
        reference: testCase.ref,
        bleu: Math.round(bleu * 1000) / 1000,
        rouge_l: Math.round(rouge * 1000) / 1000,
        citation_check: citationCheck,
        response_time_ms: responseTime
      };
      
      results.push(result);
      
      console.log(`   📊 BLEU: ${result.bleu.toFixed(3)} | ROUGE-L: ${result.rouge_l.toFixed(3)} | Citations: ${citationCheck.score.toFixed(3)} (${citationCheck.found.length}/${testCase.must_cite.length})`);
      
      if (citationCheck.missing.length > 0) {
        console.log(`   ⚠️  Missing citations: ${citationCheck.missing.join(', ')}`);
      }
      
    } catch (error) {
      console.error(`   ❌ Query failed: ${error}`);
      
      // Add failed result
      results.push({
        question: testCase.q,
        answer: '',
        reference: testCase.ref,
        bleu: 0,
        rouge_l: 0,
        citation_check: { found: [], missing: testCase.must_cite, score: 0 },
        response_time_ms: Date.now() - startTime
      });
    }
  }
  
  // Calculate summary statistics
  const bleuScores = results.map(r => r.bleu);
  const rougeScores = results.map(r => r.rouge_l);
  const citationScores = results.map(r => r.citation_check.score);
  
  const avgBleu = bleuScores.reduce((a, b) => a + b, 0) / bleuScores.length;
  const avgRouge = rougeScores.reduce((a, b) => a + b, 0) / rougeScores.length;
  const avgCitation = citationScores.reduce((a, b) => a + b, 0) / citationScores.length;
  const avgResponseTime = results.reduce((sum, r) => sum + r.response_time_ms, 0) / results.length;
  
  const sortedBleu = [...bleuScores].sort((a, b) => a - b);
  const sortedRouge = [...rougeScores].sort((a, b) => a - b);
  
  const report: EvalReport = {
    timestamp: new Date().toISOString(),
    total_cases: testCases.length,
    avg_bleu: Math.round(avgBleu * 1000) / 1000,
    avg_rouge_l: Math.round(avgRouge * 1000) / 1000,
    avg_citation_score: Math.round(avgCitation * 1000) / 1000,
    avg_response_time_ms: Math.round(avgResponseTime),
    results,
    summary: {
      bleu_distribution: {
        min: sortedBleu[0] || 0,
        max: sortedBleu[sortedBleu.length - 1] || 0,
        median: sortedBleu[Math.floor(sortedBleu.length / 2)] || 0
      },
      rouge_distribution: {
        min: sortedRouge[0] || 0,
        max: sortedRouge[sortedRouge.length - 1] || 0,
        median: sortedRouge[Math.floor(sortedRouge.length / 2)] || 0
      },
      citation_pass_count: results.filter(r => r.citation_check.score === 1).length,
      total_missing_citations: results.reduce((sum, r) => sum + r.citation_check.missing.length, 0)
    }
  };
  
  // Write detailed JSON report
  const reportPath = path.join(evalDir, 'report.json');
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  
  // Write markdown summary
  const summaryContent = `# Evaluation Report
  
**Generated**: ${report.timestamp}  
**Test Cases**: ${report.total_cases}  

## 📊 Overall Metrics

- **Average BLEU Score**: ${report.avg_bleu.toFixed(3)}
- **Average ROUGE-L Score**: ${report.avg_rouge_l.toFixed(3)}  
- **Average Citation Score**: ${report.avg_citation_score.toFixed(3)}
- **Average Response Time**: ${report.avg_response_time_ms}ms

## 🎯 Distribution

### BLEU Scores
- Min: ${report.summary.bleu_distribution.min.toFixed(3)}
- Median: ${report.summary.bleu_distribution.median.toFixed(3)}  
- Max: ${report.summary.bleu_distribution.max.toFixed(3)}

### ROUGE-L Scores  
- Min: ${report.summary.rouge_distribution.min.toFixed(3)}
- Median: ${report.summary.rouge_distribution.median.toFixed(3)}
- Max: ${report.summary.rouge_distribution.max.toFixed(3)}

## 📝 Citation Analysis

- **Perfect Citation Score**: ${report.summary.citation_pass_count}/${report.total_cases} cases (${((report.summary.citation_pass_count / report.total_cases) * 100).toFixed(1)}%)
- **Total Missing Citations**: ${report.summary.total_missing_citations}

## 🔍 Individual Results

${results.map((r, i) => `
### Case ${i + 1}
**Q**: ${r.question}
**BLEU**: ${r.bleu.toFixed(3)} | **ROUGE-L**: ${r.rouge_l.toFixed(3)} | **Citation**: ${r.citation_check.score.toFixed(3)}  
${r.citation_check.missing.length > 0 ? `**Missing**: ${r.citation_check.missing.join(', ')}` : '✅ All citations found'}
`).join('')}

---
*Generated by LlamaIndex evaluation harness*
`;
  
  const summaryPath = path.join(evalDir, 'summary.md');
  await fs.writeFile(summaryPath, summaryContent);
  
  // Output final results
  console.log('\\n🎉 Evaluation Complete!');
  console.log('=====================================');
  console.log(`📁 Results saved to: ${evalDir}`);
  console.log(`📊 Average BLEU: ${report.avg_bleu.toFixed(3)}`);
  console.log(`📊 Average ROUGE-L: ${report.avg_rouge_l.toFixed(3)}`);
  console.log(`📊 Average Citation Score: ${report.avg_citation_score.toFixed(3)}`);
  console.log(`⏱️  Average Response Time: ${report.avg_response_time_ms}ms`);
  console.log(`✅ Perfect Citations: ${report.summary.citation_pass_count}/${report.total_cases}`);
  
  // Output JSON for potential consumption by other scripts
  console.log('\\n📋 JSON Output:');
  console.log(JSON.stringify({
    success: true,
    reportPath,
    summaryPath,
    metrics: {
      avg_bleu: report.avg_bleu,
      avg_rouge_l: report.avg_rouge_l,
      avg_citation_score: report.avg_citation_score,
      citation_pass_rate: report.summary.citation_pass_count / report.total_cases
    }
  }));
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runEvaluation().catch(error => {
    console.error('💥 Evaluation failed:', error);
    process.exit(1);
  });
}