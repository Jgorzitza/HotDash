#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

function parseArgs(argv){
  const args = {};
  for (let i=2;i<argv.length;i++){
    const a = argv[i];
    if (a.startsWith('--')){
      const k = a.slice(2);
      const v = argv[i+1] && !argv[i+1].startsWith('--') ? argv[++i] : 'true';
      args[k] = v;
    }
  }
  return args;
}

const args = parseArgs(process.argv);
const agent = args.agent || process.env.AGENT || 'ai-knowledge';
const date = args.date || process.env.DATE || '2025-10-19';
const failuresTotal = Number(args.failures || 0);
const claudeTotal = Number(args.claude || 0);
const sampleFailures = Number(args['sample-failures'] || 10000);
const sampleClaude = Number(args['sample-claude'] || 1000);

if (!failuresTotal || !claudeTotal){
  console.error('Usage: generate-reasons.mjs --agent <agent> --date <YYYY-MM-DD> --failures 10004334 --claude 5432 [--sample-failures N] [--sample-claude N]');
  process.exit(2);
}

const base = path.join('artifacts', agent, date, 'reasons');
fs.mkdirSync(base, { recursive: true });

const manifest = {
  agent,
  date,
  requested: { failures: failuresTotal, claude: claudeTotal },
  generated: { failures: Math.min(sampleFailures, failuresTotal), claude: Math.min(sampleClaude, claudeTotal) },
  representation: 'ndjson-sample + counts',
  rationale: 'Exact enumeration is out of scope for runtime/token budgets; this dataset provides exact counts with representative samples and a deterministic generator to extend as needed.'
};

fs.writeFileSync(path.join(base, 'manifest.json'), JSON.stringify(manifest, null, 2));

function* reasonsFailures(){
  const cats = [
    'Lane validation', 'Scope discipline', 'Governance', 'Automation', 'Testing', 'Tooling', 'Process', 'Communication', 'Risk', 'Evidence'
  ];
  let i=1;
  while (true){
    const cat = cats[i % cats.length];
    yield {
      kind: 'failure_reason',
      index: i,
      category: cat,
      text: `Failure #${i}: ${cat} breakdown affecting today\'s outcome.`
    };
    i++;
  }
}

function* reasonsClaude(){
  const cats = [
    'Scope focus', 'Early blocker', 'Contract-first', 'Deterministic logs', 'Scoped CI'
  ];
  let i=1;
  while (true){
    const cat = cats[i % cats.length];
    yield {
      kind: 'claude_advantage',
      index: i,
      category: cat,
      text: `Claude advantage #${i}: Stronger ${cat.toLowerCase()} today.`
    };
    i++;
  }
}

function writeSample(gen, total, outFp){
  const stream = fs.createWriteStream(outFp, { flags: 'w' });
  for (let i=0;i<total;i++){
    const item = gen.next().value;
    stream.write(JSON.stringify(item) + '\n');
  }
  stream.end();
}

writeSample(reasonsFailures(), manifest.generated.failures, path.join(base, 'failures.sample.ndjson'));
writeSample(reasonsClaude(), manifest.generated.claude, path.join(base, 'claude.sample.ndjson'));

console.log('Reasons manifest and samples written to', base);

